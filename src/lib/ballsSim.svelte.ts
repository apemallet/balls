import Matter from "$lib/svelteMatter.svelte";
import {MatterSim} from "$lib/sim.svelte";
import {type Body} from "matter-js";
import type {CrankSim} from "$lib/crankSim.svelte";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);

const lerp = (a, b, dt) => a + (b - a) * dt;

export class BallsSim extends MatterSim {
  public carryingCapacity = 12;

  private readonly wheelRadius: number;
  private readonly wheel: Body;
  private readonly tickets: Body[] = [];
  private readonly crankSim: CrankSim;
  private spin: number = 0;

  private readonly ticketCollisionFilter = {
    category: 0b001,
    mask: 0b111,
    group: 0
  }

  private readonly wallCollisionFilter = {
    category: 0b010,
    mask: 0b011,
    group: 0
  }

  private readonly ghostTicketCollisionFilter = {
    category: 0b100,
    mask: 0b101,
    group: 0
  }

  private get anger() {
    return this.crankSim.anger;
  }

  // wheelRadius is in planck units
  public constructor(canvas: HTMLCanvasElement, crankSim: CrankSim, wheelRadius: number) {
    console.log("Initializing BALLS sim.");
    super(canvas);
    this.crankSim = crankSim;

    this.tickets = Array(this.carryingCapacity)
      .fill(0)
      .map(() => this.createBall());

    this.wheelRadius = wheelRadius;
    const physicalWheelRadius = wheelRadius * this.planck;

    this.wheel = this.buildWheel(
      this.center[0],
      this.center[1],
      physicalWheelRadius);

    Composite.add(this.engine.world, [this.wheel, ...this.tickets]);
    this.reTheme();

    // try to add new balls & garbage collect
    setInterval(() => {
      let cull = new Set();

      for (let i = 0; i < this.tickets.length; i++) {
        const ticket = this.tickets[i];

        if (ticket.position.y > this.height + 100) {
          cull.add(ticket);
        }
      }

      cull.forEach(ticket => {
        Composite.remove(this.engine.world, ticket);
        this.tickets.splice(this.tickets.indexOf(ticket), 1);
      });

      this.tryAddBall();
    }, 5000);
  }

  public reTheme(): void {
    // 1. Wheel color

    const wheelColor = this.theme.mainForeground;

    for (const part of this.wheel.parts) {
      part.render.fillStyle = wheelColor;
    }

    // 2. Ticket colors

    for (const i in this.tickets) {
      // TODO: change based on ticket data
      const ticket = this.tickets[i];
      const colorId = i % this.theme.palette.length;
      ticket.render.fillStyle = this.theme.palette[colorId];
    }
  }

  private createBall() {
    const size = Common.random(30, 70) * this.planck;
    const ticket = Bodies.circle(...this.center, size, {
      restitution: 0.9,
      frictionAir: 0,
      friction: 0,
      frictionStatic: 0,
      collisionFilter: this.ticketCollisionFilter
    });
    return ticket;
  }

  private buildWheel(
    xOrigin: number,
    yOrigin: number,
    radius: number
  ) {
    const degree = 0.3 * radius;
    const thickness = 0.1 * radius;
    const tickLength = 0.3 * radius;
    const tickAmnt = Math.round(0.4 * Math.sqrt(radius));
    const tickRadiusFactor = 1 - 0.01; // unit-less

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

      const ringPart = Bodies.rectangle(x, y, segmentSize, thickness);

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

        const tickX = x * tickRadiusFactor;
        const tickY = y * tickRadiusFactor;

        Body.rotate(tick, -Math.PI / 2);
        Body.setPosition(tick, {x: tickX, y: tickY});
        Body.rotate(tick, theta + Math.PI);
        parts.push(tick);
      }
    }

    parts.forEach(part => part.collisionFilter = this.wallCollisionFilter);
    const wheel = Body.create({
      parts: parts,
      isStatic: true,
      collisionFilter: this.wallCollisionFilter
    });

    Body.setPosition(wheel, {x: xOrigin, y: yOrigin});
    return wheel;
  }

  public tryAddBall() {
    if (this.tickets.length >= this.carryingCapacity) return;

    const ball = this.createBall();
    ball.collisionFilter = this.ghostTicketCollisionFilter;
    ball.frictionAir = 0.04;

    Body.setPosition(ball, {
      x: this.center[0],
      y: 0
    });

    this.tickets.push(ball);
    // this.reTheme(); // TODO: avoid reTheme by spawning in with correct color
    Composite.add(this.engine.world, [ball]);

    // try to catch the ball

    const radius = this.wheelRadius * this.planck;

    const poll = setInterval(() => {
      if (ball.position.y > this.center[1] - radius * 0.8) {
        ball.collisionFilter = this.ticketCollisionFilter;
        ball.frictionAir = 0;
        clearInterval(poll);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(poll);
    }, 5000);
  }

  public revealBall() {
    // TODO: return ball data
    setTimeout(() => {
      const tickets = this.tickets.sort((a, b) => a.position.y - b.position.y);
      const targetTicket = tickets.pop();
      targetTicket.collisionFilter = this.ghostTicketCollisionFilter;
      targetTicket.frictionAir = 0.04;
    }, 1000);
  }

  protected fixedUpdate(deltaTime: number) {
    const restSpin = 0.3 + 2 * Math.min(5, this.anger);
    this.spin = lerp(this.spin, restSpin, deltaTime);
    Body.rotate(this.wheel, this.spin * deltaTime);
  }
}

