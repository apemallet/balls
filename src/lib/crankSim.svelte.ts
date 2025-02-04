import {MatterSim} from "$lib/sim.svelte";
import Matter from "$lib/svelteMatter.svelte";

let {Constraint, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);

export class CrankSim extends MatterSim {
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
    const baseMass = 0.5;

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
      parts: crankParts
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
      length: 0
    });

    Body.rotate(this.crank, Math.PI / 2);

    Composite.add(this.engine.world, [this.crank, this.socket, jointConstraint]);
    this.reTheme();
  }

  reTheme(): void {
    this.socket.render.fillStyle = this.theme.mainBackground;
    this.base.render.fillStyle = this.theme.mainForeground;
    this.shaft.render.fillStyle = this.theme.mainForeground;

    this.handle.render.fillStyle = this.theme.mainBackground;
    this.handle.render.strokeStyle = this.theme.alt3;
  }
}