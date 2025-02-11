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
	import {sleep} from "$lib/utils";

	let canvasBot: HTMLCanvasElement | undefined;
	let canvasTop: HTMLCanvasElement | undefined;
	let balls: BallsSim;
	let crank: CrankSim;
	let canCrank = $state(true); // prevents rapid cranking

	let lastWinner: Winner | undefined = $state(); // initial value should be unreachable
	const wheelRadius = 300; // in planck units

	const isMobile = $derived(navigator.userAgentData?.mobile);

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
		balls = new BallsSim(canvasBot, crank, wheelRadius, !isMobile);
	});

	// maintain labels
	type Label = { x: number; y: number; text: string; color: string };
	let labels: Label[] = $state([]);
	onMount(() => {
		setInterval(() => {
			const pos = balls.ballsPos;
			const color = balls.ballsTextColor;
			const text = balls.ballIds.map((id: number) => importModal.shortOf(id));

			// zip
			labels = text.map((_, i: number) => ({
				x: pos[i].x,
				y: pos[i].y,
				text: text[i],
				color: color[i]
			}));
		}, 10);
	});

	async function hitCrank() {
		if (!canCrank) return;
		canCrank = false;

		crank?.smackHandle(0.5);
		await balls?.flush();

		await crank?.smackHandle(-0.4);
		const roll = balls?.roll(); // start roll in parallel
		await sleep(1000);
		await crank?.smackHandle(1);
		const winnerId = await roll;

		canCrank = true;

		// if there's a name on the winner ball: announce it
		const winnerName = importModal.nameOf(winnerId);
		if (!winnerName) return;
		lastWinner = winHistModal.addWinner(winnerName);
		winModalOpen = true;
	}

	function togglePresent() {
		if (!lastWinner) return;
		winHistModal.togglePresent(lastWinner!.id);
		lastWinner!.markedPresent = !lastWinner!.markedPresent;
	}

	function countWins(): [number, number, number] | undefined {
		if (!lastWinner) return;
		return winHistModal.countWins(lastWinner!.name);
	}

	function countWinsToday(): number | undefined {
		if (!lastWinner) return;
		return winHistModal.countWinsToday();
	}
</script>

<svelte:window on:resize={onResize} />

<div class="fixed z-20 w-screen p-4">
	<ThemePicker bind:menuOpen={palleteMenuOpen} />
</div>

<div class="fixed z-30 top-0">
	<WinModal
		winner={lastWinner}
		{togglePresent}
		{countWins}
		{countWinsToday}
		bind:showModal={winModalOpen}
	/>
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

{#each labels as { x, y, text, color }}
	<div
		class="
			absolute
			-translate-x-1/2
			-translate-y-1/2
			font-bold
			text-xs
			sm:text-sm
			md:text-xl
			lg:text-2xl
			xl:text-4xl"
		style="left: {x}px; top: {y}px; color: {color}"
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
	class={`absolute w-screen h-dvh cursor-pointer transition-filter
		${canCrank ? "active:invert-15" : "invert-35"}`}
	bind:this={canvasTop}
	onclick={hitCrank}
></canvas>
<canvas class="absolute w-screen h-dvh -z-10" bind:this={canvasBot}></canvas>
