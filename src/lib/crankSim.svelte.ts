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
    const o = [];

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
    ]]);

    this.base = Bodies.circle(0, 0, scale);

    this.handle = Bodies.circle(0, crankLength, .5 * scale, {
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

    o.push(this.shaft);
    o.push(this.base);
    o.push(this.handle);

    for (const body of o) {
      Body.setStatic(body, true);
    }

    this.crank = Body.create({
      parts: o
    });

    Body.setPosition(this.crank, {
      x: crankCenter[0],
      y: crankCenter[1]
    });

    ///// Constraints

    const constraint = Constraint.create({
      bodyA: this.crank,
      pointA: {x: 0, y: -crankLength / 2},
      bodyB: this.socket,
      stiffness: 1,
      length: 0
    });
    Composite.add(this.engine.world, [this.crank, this.socket, constraint]);
    this.reTheme();
  }

  protected fixedUpdate(deltaTime: number): void {
    Body.rotate(this.crank, 3 * deltaTime)
  }

  reTheme(): void {
    this.socket.render.fillStyle = this.theme.mainBackground;
    this.base.render.fillStyle = this.theme.mainForeground;
    this.shaft.render.fillStyle = this.theme.mainForeground;

    this.handle.render.fillStyle = this.theme.mainBackground;
    this.handle.render.strokeStyle = this.theme.alt3;
  }
}