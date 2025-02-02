<script lang="ts">
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import { createThemer } from "$lib/theme.svelte";
	import { onMount } from "svelte";

	let canvas: HTMLCanvasElement;
	// TODO: need a better way to update colors of matter objects so that it works with themePicker changes
	let colorThemer = createThemer();

	$effect(() => {
		console.log(colorThemer.color);
	});

	onMount(async () => {
		const Matter = await import("matter-js");
		const { Engine, Render, Runner, Bodies, Composite } = Matter;

		// create an engine
		const engine = Engine.create();

		const width = canvas.getBoundingClientRect().width;
		const height = canvas.getBoundingClientRect().height;

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

		// create two boxes and a ground
		const boxA = Bodies.rectangle(400, 300, 80, 80, {
			render: {
				fillStyle: colorThemer.color,
			},
		});
		const boxB = Bodies.rectangle(450, 50, 80, 80);
		const ground = Bodies.rectangle(0.5 * width, 610, width / 4, 60, {
			isStatic: true,
		});

		// add all the bodies to the world
		Composite.add(engine.world, [boxA, boxB, ground]);

		// run the renderer
		Render.run(render);

		// create runner
		const runner = Runner.create();
		Runner.run(runner, engine);
	});
</script>

<div class="fixed">
	<ThemePicker />
</div>
<canvas class="w-screen h-screen" bind:this={canvas}></canvas>
