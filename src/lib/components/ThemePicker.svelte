<script lang="ts">
	import { createThemer } from "$lib/theme.svelte";
	import { fade } from "svelte/transition";

	let colorPickerElement: HTMLInputElement;
	const colorThemer = createThemer();
</script>

<div class="flex flex-row gap-2 items-center">
	{#if colorThemer.isDefault()}
		<button
			in:fade={{ duration: 200 }}
			class="text-primaryfg/50 text-dynamicp hover:text-primaryfg/80 transition-colors duration-300 ease-in-out opacity-70"
			on:click={() => colorPickerElement.click()}
		>
			Change theme ->
		</button>
	{:else}
		<button
			in:fade={{ duration: 200 }}
			class="text-primaryfg/50 text-dynamicp hover:text-primaryfg/80 transition-colors duration-300 ease-in-out opacity-70"
			on:click={() => colorThemer.reset()}
		>
			Reset
		</button>
	{/if}
	<input
		bind:this={colorPickerElement}
		class="bg-transparent cursor-pointer"
		type="color"
		bind:value={colorThemer.color}
	/>
</div>
