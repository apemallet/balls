<script lang="ts">
	import Modal from "./Modal.svelte";
	import { type Winner } from "$lib/winTypes";
	let {
		winner,
		togglePresent,
		countWins,
		showModal = $bindable(false),
	}: {
		winner: Winner | undefined;
		togglePresent: () => void;
		countWins: () => [number, number, number] | undefined;
		showModal: boolean;
	} = $props();
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">
		🏆 {winner ? winner.name : "error: undefined"} 🏆
	</svelte:fragment>

	<svelte:fragment slot="content">
		{#if countWins()}
			<div class="flex flex-row justify-between pb-4">
				<p class="gradient-text font-bold">
					Total win count: {countWins()![0]}
				</p>
				<p class="font-semibold">
					{#if countWins()![1] === 1}
						{countWins()![1]} absent win 😔👎
					{:else}
						{countWins()![1]} absent wins 😔👎
					{/if}
				</p>
				<p class="font-semibold">
					{#if countWins()![2] == 1}
						{countWins()![2]} present win 🔥👌
					{:else}
						{countWins()![2]} present wins 🔥👌
					{/if}
				</p>
			</div>
		{:else}
			No win data found for this winner.
		{/if}
		<button
			class="crackedButton w-full
				{winner?.markedPresent
				? 'bg-green-500/10 hover:bg-green-500/20! border-green-500/20 hover:border-green-500/40!'
				: 'bg-red-500/20 hover:bg-red-500/20! border-red-500/20 hover:border-red-500/40!'}
			"
			onclick={() => togglePresent()}
		>
			<p>Are they here?</p>
			<p>
				{winner?.markedPresent ? "✅✅✅" : "❌❌❌"}
			</p>
		</button>
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
