<script>
	import Modal from "./Modal.svelte";
	export let showModal = false;
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Details and source</svelte:fragment>

	<svelte:fragment slot="content">
		Made by simon walker and mason bott
		<a
			href="https://github.com/apemallet/balls"
			class="text-dominantbg/60 hover:text-dominantbg/80"
		>
			https://github.com/apemallet/balls
		</a>
	</svelte:fragment>
</Modal>
