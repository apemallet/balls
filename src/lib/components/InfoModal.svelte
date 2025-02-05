<script>
	import Modal from "./Modal.svelte";
	let { showModal = $bindable(false) } = $props();
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Details, shmetails, code</svelte:fragment>

	<svelte:fragment slot="content">
		Made in full by <b>simon walker</b> and <b>mason bott</b>.
		<li>Open to any criticisms (no promises on acting on them though 😔)</li>
		<li>Made with SvelteKit, TailwindCSS, and TypeScript. 🚀</li>
		<li>
			<a
				href="https://github.com/apemallet/balls"
				class="text-dominantbg/60 hover:text-dominantbg/80"
			>
				Click here to see the code! 🔥🔥🔥
			</a>
		</li>
	</svelte:fragment>
</Modal>
