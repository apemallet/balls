import {MatterSim} from "$lib/sim.svelte";
import Matter from "$lib/svelteMatter.svelte";
import {Event} from "$lib/utils.ts";

let {Constraint, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);

export class CrankSim extends MatterSim {
  public anger: number = 0; // affects crank angular velocity
  public readonly onBust: Event<void> = Event();

  private readonly handle: Body;
  private readonly shaft: Body;
  private readonly base: Body;
  private readonly socket: Body;
  private readonly crank: Body;

  // xCenter in planck units
  constructor(canvas: HTMLCanvasElement, rightShift: number) {
    console.log("Initializing Crank sim.");
    super(canvas);

    const scale = 0.12 * rightShift * this.planck;
    const crankLength = 4 * scale;
    const baseMass = 0.5 * this.planck;

    const crankParts = [];

    const crankCenter: [number, number] = [
      this.planck * rightShift + this.center[0],
      this.center[1]
    ]

    ///// Assembly

    this.shaft = Bodies.fromVertices(0, crankLength / 2, [[
      {x: -scale, y: 0},
      {x: scale, y: 0},
      {x: -.6 * scale, y: crankLength},
      {x: .6 * scale, y: crankLength},
    ]], {
      mass: baseMass
    });

    this.base = Bodies.circle(0, 0, scale, {
      mass: baseMass * 3
    });

    this.handle = Bodies.circle(0, crankLength, .5 * scale, {
      mass: baseMass * 3,
      render: {
        lineWidth: .5 * scale,
      }
    });

    // the socket is the point where the crank is attached.
    // it has no colliders.
    this.socket = Bodies.rectangle(
      crankCenter[0],
      crankCenter[1],
      .6 * scale,
      .6 * scale,
      {
        isStatic: true,
        isSensor: true
      });
    Body.rotate(this.socket, Math.PI / 4);

    crankParts.push(this.shaft);
    crankParts.push(this.base);
    crankParts.push(this.handle);

    this.crank = Body.create({
      parts: crankParts,
    });

    Body.setPosition(this.crank, {
      x: crankCenter[0],
      y: crankCenter[1]
    });

    ///// Constraints

    const jointConstraint = Constraint.create({
      bodyA: this.crank,
      pointA: {x: 0, y: -crankLength / 2},
      bodyB: this.socket,
      stiffness: 1,
      length: 0,
      render: {
        visible: false
      }
    });

    ///// Ignition

    Composite.add(this.engine.world, [this.crank, this.socket, jointConstraint]);
    Body.rotate(this.crank, Math.PI / 5);
    this.reTheme();
  }

  public smackHandle() {
    this.handleForce(0.02 * this.planck);
    if (this.anger > 1) return;
    this.anger = Math.min(1, this.anger + .6);
    if (this.anger > .9) this.bust();
  }

  public bust() {
    // turns very quickly then stops suddenly; zeroes anger
    this.anger = 10;
    this.onBust.fire();

    setTimeout(() => {
      this.anger = 0;
    }, 4000);
  }

  private handleForce(force: number): void {
    const angle = this.crank.angle;
    Body.applyForce(this.crank, this.handle.position, {
      x: -force * Math.cos(angle),
      y: -force * Math.sin(angle)
    });
  }

  protected fixedUpdate(deltaTime: number): void {
    this.anger = Math.max(0, this.anger * (1 - 0.3 * deltaTime) - 0.1 * deltaTime);

    const force = 0.15 * this.planck * deltaTime * this.anger;
    this.handleForce(force);

    // discrete, points of slow down
    /*
    const degree = 5;
    const angle = this.crank.angle;
    const err = Math.abs((angle + Math.PI) % (2 * Math.PI / degree));

    if (err < .08) {
      const vel = this.crank.angularVelocity * .2;
      Body.setAngularVelocity(this.crank, vel);
    }*/
  }

  reTheme(): void {
    this.socket.render.fillStyle = this.theme.mainBackground;
    this.base.render.fillStyle = this.theme.mainForeground;
    this.shaft.render.fillStyle = this.theme.mainForeground;

    this.handle.render.fillStyle = this.theme.mainBackground;
    this.handle.render.strokeStyle = this.theme.alt1;
  }
}