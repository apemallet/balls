<script lang="ts">
  import ThemePicker from "$lib/components/ThemePicker.svelte";
  import {createThemer} from "$lib/theme.svelte";
  import Matter from "$lib/svelteMatter.svelte";

  let canvas: HTMLCanvasElement | undefined;
  let width = $derived(canvas?.getBoundingClientRect().width);
  let height = $derived(canvas?.getBoundingClientRect().height);

  let theme = createThemer();
  let {Engine, Render, Runner, Bodies, Composite, Body, Common, Events} = $derived(Matter() || Object);
  let primaryColorEntities: any[] = [];

  function buildWheel(xOrigin: number, yOrigin: number, options: any = null) {
    const radius = 300;
    const degree = .3 * radius;
    const thickness = 30;
    const tickLength = .3 * radius;
    const tickSpacing = 9;
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
        const tick = Bodies.rectangle(x, y, thickness, tickLength, {
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

  function createTicket() {
    const variance = 0.2;
    const size = Common.random(10, 50);
    const body = Bodies.circle(width/2, height/2, size, {
      render: {
        fillStyle: theme.color,
      },
    });

    Body.setMass(body, 10 * size**2);
    return body;
  }

  function initSim() {
    if (!Matter()) return;
    if (!width || !height) return;

    console.log('Initializing sim.')

    const tickets = Array(30).fill(0).map(createTicket);
    primaryColorEntities.push(...tickets);

    const wheel = buildWheel(width / 2, height / 2, {
      isStatic: true,
    });
    primaryColorEntities.push(wheel);

    const engine = Engine.create();
    Composite.add(engine.world, [wheel, ...tickets]);

    const render = Render.create({
      engine: engine,
      canvas: canvas,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: "transparent",
      },
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    Events.on(engine, 'beforeUpdate', function(event) {
      const deltaTime = ( Common.now() - event.source.timing.timestamp ) / 1000;
      Body.rotate(wheel, 0.02 * deltaTime);
    });
  }

  let initSimOnce = false;

  $effect(() => {
    if (!initSimOnce) {
      if (Matter()) {
        initSim();
        initSimOnce = true;
      }
    }
  });

  $effect(() => {
    // TODO: this doesn't work without the condition; raise issue
    if (theme.color) {
      for (let entity of primaryColorEntities) {
        entity.render.fillStyle = theme.color;
      }
    }
  });
</script>

<div class="fixed">
  <ThemePicker/>
</div>
<canvas class="w-screen h-screen" bind:this={canvas}></canvas>
