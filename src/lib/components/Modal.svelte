<script lang="ts">
	import { fade, scale } from "svelte/transition";
	export let isOpen: boolean = false;

	function closeModal() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div
		role="dialog"
		class="fixed inset-0 z-50 bg-mainfg/20 backdrop-blur-sm transition-all duration-300"
		on:click={closeModal}
		transition:fade={{ duration: 200 }}
	>
		<div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60">
			<div
				class="relative bg-mainbg rounded-lg p-6 shadow-xl max-w-md w-full
               border border-gray-200"
				transition:scale={{ duration: 150 }}
			>
				<!-- Content Slot -->
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

				<!-- Close Button -->
				<div class="mt-6 flex justify-end">
					<button on:click={closeModal} class="px-4 py-2 crackedButton">
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
