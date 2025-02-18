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
	import { browser } from "$app/environment";
	import { sleep } from "$lib/utils";
	import { onMount } from "svelte";
	import { popSound } from "$lib/sound";

	let canvasBot: HTMLCanvasElement | undefined;
	let canvasTop: HTMLCanvasElement | undefined;
	let balls: BallsSim;
	let crank: CrankSim;

	let canCrank = $state(true); // prevents rapid cranking
	let lastWinner: Winner | undefined = $state(); // initial value should be unreachable
	let onFirstRun = $state(true);

	const wheelRadius = 300; // in planck units

	// INFO: Super basic and non-exhaustive mobile detection. Probably good enough.
	let isMobile: boolean = $derived.by(() => {
		if (browser) return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		return false;
	});

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
	let importModal: ImportModal | undefined = $state();
	let winHistModal: WinHistModal | undefined = $state();

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
			const text = balls.ballIds.map((id: number) => importModal!.shortOf(id));

			// zip
			labels = text.map((_, i: number) => ({
				x: pos[i].x,
				y: pos[i].y,
				text: text[i],
				color: color[i],
			}));
		}, 10);
	});

	async function revealWinner(winner: string) {
		// 2. modal
		lastWinner = winHistModal!.addWinner(winner);
		winModalOpen = true;
		// 3. reset
		if (balls.enableSound) popSound();
		await sleep(100);
		balls.chill();
		await balls?.flush();
	}

	async function hitCrank() {
		if (!canCrank) return;
		canCrank = false;

		// 1. initial flush
		if (onFirstRun) {
			onFirstRun = false;
			// indicates click received
			await crank?.smackHandle(0.4);
			await balls?.flush();
		}

		await crank?.smackHandle(-0.4);
		const roll = balls?.roll(); // start roll in parallel
		await sleep(1000);
		await crank?.smackHandle(1);
		const winnerId = await roll;

		// if there's a name on the winner ball: announce it
		const winnerName = importModal!.nameOf(winnerId);
		if (!winnerName) return;
		await revealWinner(winnerName);
		canCrank = true;
	}

	function togglePresent() {
		if (!lastWinner) return;
		winHistModal!.togglePresent(lastWinner!.id);
		lastWinner!.markedPresent = !lastWinner!.markedPresent;
	}

	function countWins(): [number, number, number] | undefined {
		if (!lastWinner) return;
		return winHistModal!.countWins(lastWinner!.name);
	}

	function countWinsToday(): number | undefined {
		if (!lastWinner) return;
		return winHistModal!.countWinsToday();
	}
</script>

<svelte:window on:resize={onResize} />

<div class="fixed z-20 w-dvw p-4">
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
	class={`absolute w-dvw h-dvh cursor-pointer transition-filter
		${canCrank ? "active:invert-15" : "invert-35"}`}
	bind:this={canvasTop}
	onclick={hitCrank}
></canvas>
<canvas class="absolute w-dvw h-dvh -z-10" bind:this={canvasBot}></canvas>

<style>
	:global(body) {
		overflow: hidden;
	}
</style>
