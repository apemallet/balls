<script>
	import Modal from "./Modal.svelte";
	let { showModal = $bindable(false) } = $props();
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Winner history</svelte:fragment>

	<svelte:fragment slot="content">
		{" "}
	</svelte:fragment>
</Modal>
