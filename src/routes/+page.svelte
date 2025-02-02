<script lang="ts">
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import { createThemer } from "$lib/theme.svelte";
	import Matter from "$lib/svelteMatter.svelte";
	import {onMount} from "svelte";

	let canvas: HTMLCanvasElement | undefined;
	let width = $derived(canvas?.getBoundingClientRect().width);
	let height = $derived(canvas?.getBoundingClientRect().height);

	let theme = createThemer();
	let primaryColorEntities: any[] = [];

	let initSimOnce = false;
	function initSim() {
		if (!Matter()) return;
		if (!width || !height) return;
		if (initSimOnce) return;

		console.log('Initializing sim.')

		initSimOnce = true;
		const {Engine, Render, Runner, Bodies, Composite} = Matter();

		// create two boxes and a ground
		const boxA = Bodies.rectangle(400, 300, 80, 80, {
			render: {
				fillStyle: theme.color,
			},
		});

		const boxB = Bodies.rectangle(450, 50, 80, 80);

		const ground = Bodies.rectangle(0.5 * width, 610, width / 4, 60, {
			isStatic: true,
		});

		primaryColorEntities.push(boxA);

		const engine = Engine.create();
		Composite.add(engine.world, [boxA, boxB, ground]);

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

	$effect(() => {
		// TODO: this doesn't work without the condition; report to svelte
		if (theme.color) {
			for (let entity of primaryColorEntities) {
				entity.render.fillStyle = theme.color;
			}
		}
	});

	$effect(() => {
		if (Matter()) initSim();
	});
</script>

<div class="fixed">
	<ThemePicker />
</div>
<canvas class="w-screen h-screen" bind:this={canvas}></canvas>
