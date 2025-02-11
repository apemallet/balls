import Matter from "$lib/svelteMatter.svelte";
import {MatterSim} from "$lib/sim.svelte";
import {type Body} from "matter-js";
import type {CrankSim} from "$lib/crankSim.svelte";
import {sleep} from "$lib/utils";
import {popSound, revealSound, wheelSound} from "$lib/sound";

let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);


const lerp = (a, b, dt) => a + (b - a) * dt;

export class BallsSim extends MatterSim {
  public carryingCapacity = 8;

  private readonly wheelRadius: number;
  private readonly wheel: Body;
  private readonly crankSim: CrankSim;

  private balls: { body: Body, id: number }[] = [];
  private nextBallId: number = 0;

  private spin: number = 0;
  private spinSpeed: number = 8.5;
  private restSpin: number = 0.03;
  private targetSpin: number = this.restSpin;

  private readonly bigBallSize = 70;
  private readonly enableSound: boolean;

  private ballTextColor(i: number) {
    const idx = i % this.theme.palletteFG.length;
    return this.theme.palletteFG[idx];
  }

  public get ballsTextColor() {
    return this.balls.map(ball => this.ballTextColor(ball.id));
  }

  public get ballIds() {
    return this.balls.map(ball => ball.id);
  }

  public get ballsPos() {
    return this.balls.map(ball => ball.body.position);
  }

  private readonly emptyCollisionFilter = {
    category: 0b1000,
    mask: 0b0000,
    group: 0
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

  // wheelRadius is in planck units
  public constructor(canvas: HTMLCanvasElement, crankSim: CrankSim, wheelRadius: number, enableSound = true) {
    console.log("Initializing BALLS sim.");
    super(canvas);
    this.crankSim = crankSim;
    this.enableSound = enableSound;

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

    const ballBodies = this.balls.map(ball => ball.body);
    Composite.add(this.engine.world, [tray, this.wheel, ...ballBodies]);
    this.reTheme();

    // try to add new balls & garbage collect
    setInterval(() => {
      this.balls = this.balls.filter(ticket => {
        const keep = ticket.body.position.y < this.height + 100;
        if (!keep) Composite.remove(this.engine.world, ticket);
        return keep;
      });
    }, 5000);
  }

  public ballColor(i: number) {
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

    for (const ball of this.balls) {
      // TODO: change based on ticket data
      const { body, id } = ball;
      body.render.fillStyle = this.ballColor(id);
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
    const id = this.nextBallId++;
    const size = Common.random(.67 * this.bigBallSize, this.bigBallSize) * this.planck;

    const body = Bodies.circle(...this.center, size, {
      restitution: 0.9,
      frictionAir: 0,
      friction: 0,
      frictionStatic: 0,
      collisionFilter: this.ballCollisionFilter,
      render: {
        fillStyle: this.ballColor(id)
      }
    });

    return {
      body,
      id
    }
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
    const body = ball.body;
    if (body.position.y > this.center[1] + this.wheelRadius * this.planck * 1.1) return false;
    if (body.collisionFilter.category !== this.ballCollisionFilter.category) return false;
    return true;
  }

  public currentCapacity() {
    return this.balls.filter(ball => this.isBallActive(ball)).length;
  }

  public async tryAddBall() {
    if (this.carryingCapacity <= this.currentCapacity()) return;

    const ball = this.buildBall();
    const body = ball.body;
    body.collisionFilter = this.emptyCollisionFilter;

    Body.setPosition(body, {
      x: this.center[0],
      y: -50
    });

    this.balls.push(ball);
    Composite.add(this.engine.world, [body]);

    // try to catch the ball

    const radius = this.wheelRadius * this.planck;

    while (body.position.y < this.center[1] - radius * 0.8) {
      await sleep(100);
    }

    body.collisionFilter = this.ballCollisionFilter;
  }

  public async flush() {
    for (const ball of this.balls) {
      if (!this.isBallActive(ball)) continue;
      ball.body.collisionFilter = this.emptyCollisionFilter;
    }

    await sleep(1000);

    for (let i = 0; i < this.carryingCapacity; i++) {
      this.tryAddBall();
      await sleep(200);
    }

    // ensure we did in fact meet capacity
    while (this.currentCapacity() < this.carryingCapacity) {
      await this.tryAddBall();
      await sleep(200);
    }

    await sleep(1000);
  }

  public async roll() {
    this.targetSpin = -0.5;
    await sleep(1000);
    this.targetSpin = 1;
    await sleep(4000);
    this.targetSpin = this.restSpin;
    await sleep(3000);
    if (this.enableSound) revealSound();
    await sleep(1000);

    // find the lowest ball

    let targetIdx = -1;
    let targetBody = null;

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      if (!this.isBallActive(ball)) continue;
      if (targetBody == null || (ball.body.position.y > targetBody!.position.y)) {
        targetIdx = i;
        targetBody = ball.body;
      }
    }

    // ghost it

    if (targetBody) {
      targetBody.collisionFilter = this.ghostBallCollisionFilter;
      targetBody.frictionAir = 0.03;
    }

    await sleep(1000);
    if (this.enableSound) popSound();
    return this.balls[targetIdx].id;
  }

  protected fixedUpdate(deltaTime: number) {
    this.spin = lerp(this.spin, this.targetSpin, deltaTime);
    const spin = this.spin * this.spinSpeed;
    Body.rotate(this.wheel, spin * deltaTime);
    Body.setAngularVelocity(this.wheel, spin/60);

    const soundFreq = spin > .35 ? spin + 1 : 0;
    if (this.enableSound) wheelSound(soundFreq);
  }
}

