import {MatterSim} from "$lib/sim.svelte";
import Matter from "$lib/svelteMatter.svelte";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);

export class CrankSim extends MatterSim {
  private readonly handle: Body;
  private readonly shaft: Body;
  private readonly base: Body;
  private readonly socket: Body;

  // xCenter in planck units
  constructor(canvas: HTMLCanvasElement, rightShift: number) {
    console.log("Initializing Crank sim.");
    super(canvas);

    const scale = 0.12 * rightShift * this.planck;
    const crankLength = 4 * scale;
    const o = [];

    this.shaft = Bodies.fromVertices(0, crankLength/2, [[
      { x: -scale, y: 0 },
      { x: scale, y: 0 },
      { x: -.6 * scale, y: crankLength },
      { x: .6 * scale, y: crankLength },
    ]]);

    this.base = Bodies.circle(0, 0, scale);

    this.handle = Bodies.circle(0, crankLength, .7 * scale, {
      render: {
        fillStyle: this.theme.dominant
      }
    });

    this.socket = Bodies.rectangle(0, 0, .6 * scale, .6 * scale);
    Body.rotate(this.socket, Math.PI / 4);

    o.push(this.shaft);
    o.push(this.base);
    o.push(this.socket);
    o.push(this.handle);

    const crankCenter: [number, number] = [
      this.planck * rightShift + this.center[0],
      this.center[1]
    ]

    for (const body of o) {
      Body.setStatic(body, true);
      Body.setPosition(body, {
        x: body.position.x + crankCenter[0],
        y: body.position.y + crankCenter[1],
      });
    }

    Composite.add(this.engine.world, o);
  }

  protected fixedUpdate(deltaTime: number): void {
  }

  reTheme(): void {
  }
}