import Matter from "$lib/svelteMatter.svelte";
import {MatterSim} from "$lib/sim.svelte";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);


export class BallsSim extends MatterSim {
  private readonly wheel: Body;

  public constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    console.log('Initializing BALLS sim.')

    const tickets = Array(30)
      .fill(0)
      .map((_, i) => this.createTicket(i));

    const wheelColor = "white"; // TODO: recolor wheel
    this.wheel = this.buildWheel(this.center[0], this.center[1], {
      isStatic: true,
      render: {
        fillStyle: wheelColor
      },
    });

    Composite.add(this.engine.world, [this.wheel, ...tickets]);
  }

  protected fixedUpdate(deltaTime: number) {
    Body.rotate(this.wheel, 0.5 * deltaTime);
  }

  private createTicket(id: number) {
    const size = Common.random(10, 50) * this.planck;
    const colorId = id % this.theme.alts.length;
    const color = this.theme.alts[colorId];

    const body = Bodies.circle(...this.center, size, {
      render: {
        fillStyle: color,
      },
    });

    Body.setMass(body, 10 * size ** 2);
    return body;
  }

  private buildWheel(xOrigin: number, yOrigin: number, options: any = null) {
    const radius = 300 * this.planck;
    const degree = .3 * radius;
    const thickness = .1 * radius;
    const tickLength = .25 * radius;
    const tickAmnt= Math.round(0.4 * Math.sqrt(radius));
    const tickRadiusFactor = 1 - 0.02; // unit-less
    const color = options.render?.fillStyle;

    const segmentSize = (() => {
      const angle = 2 * Math.PI / degree;
      const pointX = Math.cos(angle);
      const pointY = Math.sin(angle);
      const midpointX = ((pointX - 1) / 2) + 1;
      const midpointY = pointY / 2;
      const effectiveRadius = 1 / Math.sqrt(midpointX ** 2 + midpointY ** 2);
      const len = Math.sqrt((pointX - 1) ** 2 + pointY ** 2);
      return (radius + thickness / 2) * effectiveRadius * len
    })();

    let parts = [];
    // TODO: might be viable to make each part static (wrt whole)

    const tickSpacing = Math.round(degree / tickAmnt);
    for (let i = 0; i < degree; i++) {
      const theta = (i / degree) * 2 * Math.PI;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);

      const ringPart = Bodies.rectangle(x, y, segmentSize, thickness, {
        render: {
          fillStyle: color,
        },
      });

      // apply rotation
      Body.rotate(ringPart, theta + Math.PI / 2);
      parts.push(ringPart);

      if (i % tickSpacing === 0 && degree - i > 0.5 * tickSpacing) {
        const tickX = x * tickRadiusFactor;
        const tickY = y * tickRadiusFactor;
        const tick = Bodies.rectangle(tickX, tickY, thickness, tickLength, {
          render: {
            fillStyle: color,
          },
        });

        Body.rotate(tick, theta + Math.PI / 2);
        parts.push(tick);
      }
    }

    const wheel = Body.create({
      parts: parts,
      ...options
    });

    Body.setPosition(wheel, {x: xOrigin, y: yOrigin});
    return wheel;
  }
}