<script>
	import Modal from "./Modal.svelte";
	let { showModal = $bindable(false) } = $props();
</script>

<Modal bind:isOpen={showModal}>
	<svelte:fragment slot="title">Details, shmetails, and code</svelte:fragment>

	<svelte:fragment slot="content">
		Made in full by <a href="https://masonbott.com" target="_blank"
			>Mason Bott</a
		>
		and
		<a href="https://simonwalker.tech" target="_blank">Simon Walker</a>
		<li>Open to any criticisms (no promises on acting on them though 😔)</li>
		<li>Made with SvelteKit, TailwindCSS, and TypeScript 🚀</li>
		<li>
			<a href="https://github.com/apemallet/balls" target=" _blank">
				Click here to see the code 🔥🔥🔥
			</a>
		</li>
	</svelte:fragment>
</Modal>

<style>
	@reference "tailwindcss/theme";
	@reference "../../app.css";
	a {
		@apply text-dominantbg/60 hover:text-dominantbg/80 underline underline-offset-2 hover:underline-offset-4 transition-all;
	}
</style>
