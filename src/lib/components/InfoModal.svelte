<script>
	import Modal from "./Modal.svelte";
	export let showModal = false;
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">General information</svelte:fragment>

	<svelte:fragment slot="content">
		<a href="https://github.com/apemallet/balls">
			https://github.com/apemallet/balls
		</a>
	</svelte:fragment>
</Modal>
