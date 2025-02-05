<script lang="ts">
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import ControlPanel from "$lib/components/ControlPanel.svelte";
	import InfoModal from "$lib/components/InfoModal.svelte";
	import ImportModal from "$lib/components/ImportModal.svelte";
	import WinModal from "$lib/components/WinModal.svelte";
	import WinHistModal from "$lib/components/WinHistModal.svelte";
	import Matter from "$lib/svelteMatter.svelte";
	import { type Winner } from "$lib/winTypes";
	import { BallsSim } from "$lib/ballsSim.svelte";
	import { CrankSim } from "$lib/crankSim.svelte";
	import { getThemer } from "$lib/theme.svelte";
	import { onMount } from "svelte";

	let canvasBot: HTMLCanvasElement | undefined;
	let canvasTop: HTMLCanvasElement | undefined;
	let balls: BallsSim;
	let crank: CrankSim;
	let canCrank = $state(true); // prevents rapid cranking

	let lastWinner: Winner | undefined = $state(); // initial value should be unreachable
	const wheelRadius = 300; // in planck units

	// maintain theme
	$effect(() => {
		if (typeof getThemer().colorHarmony == null) return;
		if (typeof getThemer().dominant == null) return;
		if (!balls) return;
		if (!crank) return;
		balls!.reTheme();
		crank!.reTheme();
	});

	function onResize() {
		const { innerWidth, innerHeight } = window;
		balls?.reLayout(innerWidth, innerHeight);
		crank?.reLayout(innerWidth, innerHeight);
	}

	// Menu state
	let palleteMenuOpen = $state(true);
	let infoModalOpen = $state(false);
	let winModalOpen = $state(false);
	let winHistModalOpen = $state(false);
	let importModalOpen = $state(false);
	let importModal: ImportModal = $state();
	let winHistModal: WinHistModal = $state();

	// initialize the simulation
	$effect(() => {
		if (!Matter()) return;
		if (!canvasBot) return;
		if (!canvasTop) return;
		if (crank || balls) return;

		crank = new CrankSim(canvasTop, wheelRadius + 5);
		balls = new BallsSim(canvasBot, crank, wheelRadius);

		crank.onBust.do(() => {
			balls!.revealBall();
			canCrank = false;
		});

		// react to winner
		$effect(() => {
			if (!balls) return;
			balls.onReveal.do((i: number) => {
				canCrank = true;
				const winnerName = importModal.nameOf(i);
				if (!winnerName) return;
				lastWinner = winHistModal.addWinner(winnerName);
				winModalOpen = true;
			});
		});
	});

	// maintain labels
	type Label = { x: number; y: number; text: string };
	let labels: Label[] = $state([]);
	onMount(() => {
		setInterval(() => {
			const pos = balls.ballsPos;
			const text = pos.map((_, i) => importModal.shortOf(i));
			labels = text.map((t, i) => ({ x: pos[i].x, y: pos[i].y, text: t }));
		}, 10);
	});

	function hitCrank() {
		if (!canCrank) return;
		crank?.smackHandle();
	}

	onMount(() => {
		window["kill"] = () => {
			crank?.destroy();
			balls?.destroy();
		};
	});

	function togglePresent() {
		if (!lastWinner) return;
		winHistModal.togglePresent(lastWinner!.id);
		lastWinner!.markedPresent = !lastWinner!.markedPresent;
	}
</script>

<svelte:window on:resize={onResize} />

<div class="fixed z-20 w-screen p-4">
	<ThemePicker bind:menuOpen={palleteMenuOpen} />
</div>

<div class="fixed z-30 top-0">
	<WinModal winner={lastWinner} {togglePresent} bind:showModal={winModalOpen} />
</div>

<div class="fixed z-30 top-0">
	<WinHistModal bind:this={winHistModal} bind:showModal={winHistModalOpen} />
</div>

<div class="fixed z-30 top-0">
	<InfoModal bind:showModal={infoModalOpen} />
</div>

<div class="fixed z-30 top-0">
	<ImportModal bind:this={importModal} bind:showModal={importModalOpen} />
</div>

{#each labels as { x, y, text }, i}
	<div
		class="
			absolute
			text-mainbg
			-translate-x-1/2
			-translate-y-1/2
			font-bold
			text-xs
			sm:text-sm
			md:text-xl
			lg:text-2xl
			xl:text-4xl"
		style="left: {x}px; top: {y}px;"
	>
		{text}
	</div>
{/each}

<div class="fixed z-20 bottom-0 right-0">
	<ControlPanel
		bind:palleteMenuOpen
		bind:infoModalOpen
		bind:importModalOpen
		bind:winHistModalOpen
	/>
</div>

<!-- TODO: raise issue: tailwind4 does not recognize svelte5 conditional classes -->

<canvas
	class={`absolute w-screen h-dvh cursor-grab transition-filter
		${canCrank ? "active:invert-15" : "invert-35"}`}
	bind:this={canvasTop}
	onclick={hitCrank}
></canvas>
<canvas class="absolute w-screen h-dvh -z-10" bind:this={canvasBot}></canvas>
