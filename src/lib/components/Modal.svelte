<script lang="ts">
	import { fade, scale } from "svelte/transition";
	import { type Snippet } from "svelte";
	let {
		isOpen = $bindable(false),
		id = "modal",
		title,
		content,
	}: { isOpen: boolean; id?: string; title?: Snippet, content?: Snippet } = $props();

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
	<div
		{id}
		class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60"
	>
		<div
			class="relative bg-mainbg rounded-lg p-6 shadow-xl max-w-[95dvw] min-w-[90dvw] max-h-[90dvh] md:min-w-[70dvw] md:max-h-[70dvh] w-full gradient-border overflow-y-auto overflow-x-clip"
			transition:scale={{ duration: 150 }}
		>
			<!-- content slots -->
			<div class="space-y-4">
				<h2 class="text-xl md:text-2xl font-bold text-mainfg/80">
					{#if title}
						{@render title()}
					{:else}
						Default title
					{/if}
				</h2>

				<p class="text-mainfg/80">
					{#if content}
						{@render content()}
					{:else}
						This is a default modal content. Add your message here.
					{/if}
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
