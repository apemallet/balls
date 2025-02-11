<script lang="ts">
	import Modal from "./Modal.svelte";
	import { type Winner } from "$lib/winTypes";
	let {
		winner,
		togglePresent,
		countWins,
		countWinsToday,
		showModal = $bindable(false),
	}: {
		winner: Winner | undefined;
		togglePresent: () => void;
		countWins: () => [number, number, number] | undefined;
		countWinsToday: () => number | undefined;
		showModal: boolean;
	} = $props();

	function computeNumSuffix(num: number): string {
		if (num % 10 == 1 && num.toString().slice(-2) != "11")
			return "st";
		if (num % 10 == 2)
			return "nd"
		if (num % 10 == 3)
			return "rd"
		return "th"
	}

	function computeNameApostraphe(name: string): string {
		if (name[name.length - 1] == 's')
			return `${name}'`
		return `${name}'s`
	}
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">
		<div class="flex flex-row justify-between">
			<span>🏆 {winner ? winner.name : "error: undefined"} 🏆</span>
			<span class="text-mainfg/50">
				({countWinsToday() ? countWinsToday() + computeNumSuffix(countWinsToday()!) : "0th"} winner today)
			</span>
		</div>
	</svelte:fragment>

	<svelte:fragment slot="content">
		<div class="flex flex-row gap-4">
		<p class="self-center flex flex-row gap-1">Mark their status
			<svg xmlns="http://www.w3.org/2000/svg" 
				viewBox="0 0 448 512" 
				class="w-4 h-4 self-center" 
				fill="currentColor"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
				<path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/>
			</svg>
		</p>
		<button
			class="crackedButton text-mainfg/80
				{winner?.markedPresent
				? 'bg-green-500/10 hover:bg-green-500/20! border-green-500/20 hover:border-green-500/40!'
				: 'bg-red-500/20 hover:bg-red-500/20! border-red-500/20 hover:border-red-500/40!'}
			"
			onclick={() => togglePresent()}
		>
			<p class="px-4">
				{winner?.markedPresent ? "✅ Present" : "❌ Absent"}
			</p>
		</button>
		</div>
		{#if winner && countWins()}
			<div class="mt-4">
				This is {computeNameApostraphe(winner.name)} <span class="gradient-text font-bold">{countWins()![0] + computeNumSuffix(countWins()![0])} win</span>. Of their wins they were marked
				<li class="ml-4">
					Present {countWins()![2]} {countWins()![2] == 1 ? 'time' : 'times'} 🔥👌 
				</li>
				<li class="ml-4">
				 Absent {countWins()![1]} {countWins()![1] == 1 ? 'time' : 'times'} 😔👎 
				</li>
			</div>
		{:else}
			No win data found for this winner.
		{/if}
	</svelte:fragment>
</Modal>

<style>
	.gradient-text {
		background-image: linear-gradient(
			45deg,
			var(--color-dominantbg),
			var(--color-alt1bg),
			var(--color-alt2bg),
			var(--color-alt3bg),
			var(--color-alt4bg),
			var(--color-alt5bg)
		);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		display: inline-block;
	}
</style>
