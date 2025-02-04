<script>
	import Modal from "./Modal.svelte";
	let { winner, showModal = $bindable(false) } = $props();
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">{winner}</svelte:fragment>

	<svelte:fragment slot="content">
		{" "}
	</svelte:fragment>
</Modal>
