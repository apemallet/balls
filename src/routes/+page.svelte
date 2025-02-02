<script lang="ts">
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import { createThemer } from "$lib/theme.svelte";
	import Matter from "$lib/svelteMatter.svelte";
	import {onMount} from "svelte";

	let canvas: HTMLCanvasElement | undefined;
	let width = $derived(canvas?.getBoundingClientRect().width);
	let height = $derived(canvas?.getBoundingClientRect().height);

	let colorThemer = createThemer();
	let entities: Body[] = [];

	function initializeSim() {
		if (!Matter()) return;
		if (!width || !height) return;

		const {Engine, Render, Runner, Bodies, Composite} = Matter();

		// create two boxes and a ground
		const boxA = Bodies.rectangle(400, 300, 80, 80, {
			render: {
				fillStyle: colorThemer.color,
			},
		});
		entities.push(boxA);

		const boxB = Bodies.rectangle(450, 50, 80, 80);
		entities.push(boxB);

		const ground = Bodies.rectangle(0.5 * width, 610, width / 4, 60, {
			isStatic: true,
		});
		entities.push(ground);

		const engine = Engine.create();
		Composite.add(engine.world, entities);

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

	onMount(initializeSim);
</script>

<div class="fixed">
	<ThemePicker />
</div>
<canvas class="w-screen h-screen" bind:this={canvas}></canvas>
