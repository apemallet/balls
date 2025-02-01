<script>
  import { onMount } from "svelte";

  onMount(async () => {
    const Matter = await import("matter-js");
    const { Engine, Render, Runner, Bodies, Composite } = Matter;

    // create an engine
    const engine = Engine.create();

    // create a renderer
    const render = Render.create({
      element: document.body,
      engine: engine,
    });

    // create two boxes and a ground
    const boxA = Bodies.rectangle(400, 200, 80, 80);
    const boxB = Bodies.rectangle(450, 50, 80, 80);
    const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

    // add all the bodies to the world
    Composite.add(engine.world, [boxA, boxB, ground]);

    // run the renderer
    Render.run(render);

    // create runner
    const runner = Runner.create();
    Runner.run(runner, engine);
  });
</script>
