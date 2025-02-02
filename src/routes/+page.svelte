<script lang="ts">
  import ThemePicker from "$lib/components/ThemePicker.svelte";
  import {createThemer} from "$lib/theme.svelte";
  import Matter from "$lib/svelteMatter.svelte";

  let canvas: HTMLCanvasElement | undefined;
  let width = $derived(canvas?.getBoundingClientRect().width);
  let height = $derived(canvas?.getBoundingClientRect().height);

  let theme = createThemer();
  let {Engine, Render, Runner, Bodies, Composite, Body} = $derived(Matter() || Object);
  let primaryColorEntities: any[] = [];

  function buildWheel(xOrigin: number, yOrigin: number, options: any = null) {
    const degree = 20;
    const radius = 30;
    const thickness = 20;
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

    for (let i = 0; i < degree; i++) {
      const theta = (i / degree) * 2 * Math.PI;
      const x = radius * Math.cos(theta);
      const y = radius * Math.sin(theta);

      const part = Bodies.rectangle(x, y, segmentSize, thickness, {
        // TODO: might be viable to make each part static (wrt whole)
        isStatic: false,
        render: {
          fillStyle: color,
        },
      });

      // apply rotation
      Body.rotate(part, theta + Math.PI / 2);
      parts.push(part);
    }

    const wheel = Body.create({
      parts: parts,
      ...options
    });

    Body.setPosition(wheel, {x: xOrigin, y: yOrigin});
    return wheel;
  }

  function initSim() {
    if (!Matter()) return;
    if (!width || !height) return;

    console.log('Initializing sim.')

    // create two boxes and a ground
    const boxA = Bodies.rectangle(400, 300, 80, 80, {
      render: {
        fillStyle: theme.color,
      },
    });
    primaryColorEntities.push(boxA);

    const boxB = Bodies.rectangle(450, 50, 80, 80);

    const ground = Bodies.rectangle(0.5 * width, 610, width / 4, 60, {
      isStatic: true,
    });

    const wheel = buildWheel(520, 320, {
      isStatic: false,
    });
    primaryColorEntities.push(wheel);

    const engine = Engine.create();
    Composite.add(engine.world, [boxA, boxB, ground, wheel]);

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
