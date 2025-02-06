import Matter from "$lib/svelteMatter.svelte";
import {MatterSim} from "$lib/sim.svelte";
import {type Body} from "matter-js";
import type {CrankSim} from "$lib/crankSim.svelte";
import {Event} from "$lib/utils";
import {popSound, revealSound, wheelSound} from "$lib/sound";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);


const lerp = (a, b, dt) => a + (b - a) * dt;

export class BallsSim extends MatterSim {
  public carryingCapacity = 8;
  public onReveal: Event<number> = Event();

  private readonly wheelRadius: number;
  private readonly wheel: Body;
  private readonly crankSim: CrankSim;
  private balls: Body[] = [];
  private spin: number = 0;

  public get ballsPos() {
    return this.balls.map(ticket => ticket.position);
  }

  private readonly ballCollisionFilter = {
    category: 0b0001,
    mask: 0b0011,
    group: 0
  }

  private readonly wallCollisionFilter = {
    category: 0b0010,
    mask: 0b0011,
    group: 0
  }

  private readonly ghostBallCollisionFilter = {
    category: 0b0100,
    mask: 0b1100,
    group: 0
  }

  private readonly ghostWallCollisionFilter = {
    category: 0b01000,
    mask: 0b1100,
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

    this.balls = Array(this.carryingCapacity)
      .fill(0)
      .map(() => this.buildBall());

    this.wheelRadius = wheelRadius;
    const physicalWheelRadius = wheelRadius * this.planck;

    this.wheel = this.buildWheel(
      this.center[0],
      this.center[1],
      physicalWheelRadius);

    const tray = this.buildTray();

    Composite.add(this.engine.world, [tray, this.wheel, ...this.balls]);
    this.reTheme();

    // try to add new balls & garbage collect
    setInterval(() => {
      this.balls = this.balls.filter(ticket => {
        const keep = ticket.position.y < this.height + 100;
        if (!keep) Composite.remove(this.engine.world, ticket);
        return keep;
      });

      this.tryAddBall();
    }, 5000);
  }

  private colorBallOf(i: number) {
    const idx = i % this.theme.palette.length;
    return this.theme.palette[idx];
  }

  public reTheme(): void {
    // 1. Wheel color

    const wheelColor = this.theme.mainForeground;

    for (const part of this.wheel.parts) {
      part.render.fillStyle = wheelColor;
    }

    // 2. Ticket colors

    for (const i: number in this.balls) {
      // TODO: change based on ticket data
      const ticket = this.balls[i];
      const color = this.colorBallOf(i);
      ticket.render.fillStyle = color;
    }
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

  private buildBall() {
    const size = Common.random(40, 80) * this.planck;
    return Bodies.circle(...this.center, size, {
      restitution: 0.9,
      frictionAir: 0,
      friction: 0,
      frictionStatic: 0,
      collisionFilter: this.ballCollisionFilter,
      render: {
        fillStyle: this.colorBallOf(this.balls.length)
      }
    });
  }

  private buildTray() {
    const thick = 20;
    const halfWidth = this.center[0];
    const halfHeight= this.center[1];

    const bottom = Bodies.rectangle(halfWidth, this.height, this.width, thick);
    const left = Bodies.rectangle(-thick/2, halfHeight, thick, this.height);
    const right = Bodies.rectangle(this.width + thick/2, halfHeight, thick, this.height);
    const top = Bodies.rectangle(halfWidth, -30 * this.planck, this.width, thick);

    return Body.create({
      parts: [ bottom, left, right, top ],
      isStatic: true,
      render: {
        visible: false
      },
      collisionFilter: this.ghostWallCollisionFilter
    })
  }

  private isBallActive(ball): boolean {
    if (ball.position.y > this.center[1] + this.wheelRadius * this.planck * 1.1) return false;
    if (ball.collisionFilter.category !== this.ballCollisionFilter.category) return false;
    return true;
  }

  private currentCapacity() {
    return this.balls.filter(ticket => this.isBallActive(ticket)).length;
  }

  public tryAddBall() {
    if (this.carryingCapacity <= this.currentCapacity()) return;

    const ball = this.buildBall();
    ball.collisionFilter = this.ghostBallCollisionFilter;
    ball.frictionAir = 0.03;

    Body.setPosition(ball, {
      x: this.center[0],
      y: 0
    });

    this.balls.push(ball);
    Composite.add(this.engine.world, [ball]);

    // try to catch the ball

    const radius = this.wheelRadius * this.planck;

    const poll = setInterval(() => {
      if (ball.position.y > this.center[1] - radius * 0.8) {
        ball.collisionFilter = this.ballCollisionFilter;
        ball.frictionAir = 0;
        clearInterval(poll);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(poll);
    }, 5000);
  }

  public revealBall() {
    setTimeout(() => {
      revealSound();
    }, 5000);

    setTimeout(() => {
      let targetIdx = -1;
      let targetBall = null;

      for (let i = 0; i < this.balls.length; i++) {
        const ticket = this.balls[i];
        if (!this.isBallActive(ticket)) continue;
        if (targetBall == null || (ticket.position.y > targetBall!.position.y)) {
          targetIdx = i;
          targetBall = ticket;
        }
      }

      if (!targetBall) return;
      targetBall.collisionFilter = this.ghostBallCollisionFilter;
      targetBall.frictionAir = 0.03;

      setTimeout(() => {
        this.onReveal.fire(targetIdx);
        popSound();
      }, 1000);
    }, 6000);
  }

  protected fixedUpdate(deltaTime: number) {
    const restSpin = 0.3 + 2 * Math.min(5, this.anger);
    this.spin = lerp(this.spin, restSpin, deltaTime);
    Body.rotate(this.wheel, this.spin * deltaTime);
    Body.setAngularVelocity(this.wheel, this.spin/60);

    const soundFreq = this.spin > .35 ? this.spin + 1 : 0;
    wheelSound(soundFreq);
  }
}

