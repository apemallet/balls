<script lang="ts">
	import { fade, scale } from "svelte/transition";
	let { isOpen = $bindable(false) } = $props();

	function closeModal() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		role="button"
		tabindex="0"
		class="fixed inset-0 z-50 bg-mainfg/10 backdrop-blur-sm transition-all duration-300"
		onclick={() => closeModal()}
		onkeydown={(e) => e.key === "Enter" && closeModal()}
		transition:fade={{ duration: 200 }}
	></div>
	<div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60">
		<div
			class="relative bg-mainbg rounded-lg p-6 shadow-xl min-w-[90dvw] md:min-w-[70dvw] md:max-w-[90dvw] max-h-[70dvh] w-full gradient-border"
			transition:scale={{ duration: 150 }}
		>
			<!-- content slots -->
			<div class="space-y-4">
				<h2 class="text-xl font-semibold text-mainfg/80">
					<slot name="title">Default title</slot>
				</h2>

				<p class="text-mainfg/80">
					<slot name="content">
						This is a default modal content. Add your message here.
					</slot>
				</p>
			</div>

			<!-- universal close button -->
			<div class="mt-6 flex justify-end">
				<button onclick={() => closeModal()} class="px-4 py-2 crackedButton">
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.gradient-border {
		border: 2px solid transparent;
		border-image: linear-gradient(
			45deg,
			var(--color-dominantbg),
			var(--color-alt1bg),
			var(--color-alt5bg)
		);
		border-image-slice: 1;
	}
</style>
