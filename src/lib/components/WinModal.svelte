<script lang="ts">
	import Modal from "./Modal.svelte";
	import { type Winner } from "$lib/winTypes";
	let {
		winner,
		togglePresent,
		showModal = $bindable(false),
	}: {
		winner: Winner | undefined;
		togglePresent: () => void;
		showModal: boolean;
	} = $props();
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">
		{winner ? winner.name : "error: undefined"}
	</svelte:fragment>

	<svelte:fragment slot="content">
		<button
			class="crackedButton w-full
				{winner?.markedPresent
				? 'bg-green-500/10 hover:bg-green-500/20!'
				: 'bg-red-500/20 hover:bg-red-500/20!'}
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
