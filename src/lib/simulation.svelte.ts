import type Render from "matter-js";
import Matter from "$lib/svelteMatter.svelte";
import {createThemer} from "$lib/theme.svelte";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);


export class Simulation {
  private readonly theme = createThemer();
  private readonly render: Render;
  private readonly canvas: HTMLCanvasElement;

  private get width(): number {
    return this.canvas.clientWidth;
  }

  private get height(): number {
    return this.canvas.clientHeight;
  }

  private get center(): [number, number] {
    return [ this.width / 2, this.height / 2 ];
  };

  public constructor(canvas: HTMLCanvasElement) {
    console.log('Initializing sim.')
    if (!Matter()) throw new Error("Matter.js not loaded.");

    this.canvas = canvas;
    const tickets = Array(30)
      .fill(0)
      .map(() => this.createTicket());

    const wheel = this.buildWheel(this.center[0], this.center[1], {
      isStatic: true
    });

    const engine = Engine.create();
    Composite.add(engine.world, [wheel, ...tickets]);

    const render = Render.create({
      engine: engine,
      canvas: canvas,
      options: {
        width: this.width,
        height: this.height,
        devicePixelRatio: window.devicePixelRatio,
        wireframes: false,
        background: "transparent",
      },
    });
    this.render = render;

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    let tLast = Common.now();
    Events.on(engine, 'beforeUpdate', function (event) {
      const deltaTime = (Common.now() - tLast) / 1000;
      tLast = Common.now();

      Body.rotate(wheel, 0.5 * deltaTime);
    });
  }

  private createTicket() {
    const size = Common.random(10, 50);
    const body = Bodies.circle(this.center[0], this.center[1], size, {
      render: {
        fillStyle: this.theme.color,
      },
    });

    Body.setMass(body, 10 * size ** 2);
    return body;
  }

  private buildWheel(xOrigin: number, yOrigin: number, options: any = null) {
    const radius = 300;
    const degree = .3 * radius;
    const thickness = 30;
    const tickLength = .25 * radius;
    const tickSpacing = 9;
    const tickRadiusFactor = 1 - 0.03;
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

      if (i % tickSpacing === 0) {
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

  public reLayout(width, height) {
    const oldWidth = this.width;
    const oldHeight = this.height;

    const render = this.render;
    render.bounds.max.x = width;
    render.bounds.max.y = height;
    render.options.width = width;
    render.options.height = height;
    render.canvas.width = width;
    render.canvas.height = height;
    Render.setPixelRatio(render, window.devicePixelRatio); // added this

    for (const body of Composite.allBodies(render.engine.world)) {
      const pos = body.position;
      const x = pos.x + (width - oldWidth) / 2;
      const y = pos.y + (height - oldHeight) / 2;
      Body.setPosition(body, {x, y});
    }
  }
}