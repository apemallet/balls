import Matter from "$lib/svelteMatter.svelte";
import {MatterSim} from "$lib/sim.svelte";
import {type Body} from "matter-js";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);

export class BallsSim extends MatterSim {
  private readonly wheel: Body;
  private readonly tickets: Body[] = [];

  // wheelRadius is in planck units
  public constructor(canvas: HTMLCanvasElement, wheelRadius: number) {
    console.log("Initializing BALLS sim.");
    super(canvas);

    this.tickets = Array(12)
      .fill(0)
      .map(() => this.createTicket());

    const physicalWheelRadius = wheelRadius * this.planck;
    this.wheel = this.buildWheel(
      this.center[0],
      this.center[1],
      physicalWheelRadius,
      {
        isStatic: true,
      },
    );

    Composite.add(this.engine.world, [this.wheel, ...this.tickets]);
    this.reTheme();
  }

  public reTheme(): void {
    // 1. Wheel color

    const wheelColor = this.theme.mainForeground;

    for (const part of this.wheel.parts) {
      part.render.fillStyle = wheelColor;
    }

    // 2. Ticket colors

    for (const i in this.tickets) {
      const ticket = this.tickets[i];
      const colorId = i % this.theme.palette.length;
      ticket.render.fillStyle = this.theme.palette[colorId];
    }
  }

  protected fixedUpdate(deltaTime: number) {
    Body.rotate(this.wheel, 0.5 * deltaTime);
  }

  private createTicket() {
    const size = Common.random(30, 70) * this.planck;
    return Bodies.circle(...this.center, size, {
      restitution: 1,
      frictionAir: 0,
      friction: 0,
      frictionStatic: 0
    });
  }

  private buildWheel(
    xOrigin: number,
    yOrigin: number,
    radius: number,
    options: any = null,
  ) {
    const degree = 0.3 * radius;
    const thickness = 0.1 * radius;
    const tickLength = 0.3 * radius;
    const tickAmnt = Math.round(0.4 * Math.sqrt(radius));
    const tickRadiusFactor = 1 - 0.01; // unit-less
    const color = options.render?.fillStyle;

    const segmentSize = (() => {
      const angle = (2 * Math.PI) / degree;
      const pointX = Math.cos(angle);
      const pointY = Math.sin(angle);
      const midpointX = (pointX - 1) / 2 + 1;
      const midpointY = pointY / 2;
      const effectiveRadius = 1 / Math.sqrt(midpointX ** 2 + midpointY ** 2);
      const len = Math.sqrt((pointX - 1) ** 2 + pointY ** 2);
      return (radius + thickness / 2) * effectiveRadius * len;
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
        const tick = Bodies.fromVertices(0, 0, [[
          {x: -1.4 * thickness, y: 0},
          {x: 1.4 * thickness, y: 0},
          {x: -.4 * thickness, y: tickLength},
          {x: .4 * thickness, y: tickLength},
        ]]);

        // const tick = Bodies.polygon(0, 0, 3, thickness, {
        //   render: {
        //     fillStyle: color,
        //   },
        // });

        const tickX = x * tickRadiusFactor;
        const tickY = y * tickRadiusFactor;

        Body.rotate(tick, -Math.PI / 2);
        Body.setPosition(tick, {x: tickX, y: tickY});
        Body.rotate(tick, theta + Math.PI);
        parts.push(tick);
      }
    }

    const wheel = Body.create({
      parts: parts,
      ...options,
    });

    Body.setPosition(wheel, {x: xOrigin, y: yOrigin});
    return wheel;
  }
}

