<script lang="ts">
	import { colorStore, updateTheme } from "$lib/theme";
	import { fade } from "svelte/transition";
	import { afterUpdate } from "svelte";
	import { get } from "svelte/store";

	let color: string = get(colorStore) || "#22C55D";
	let colorPickerElement: HTMLInputElement;

	afterUpdate(() => {
		updateTheme(color);
		colorStore.set(color);
	});

	function reset() {
		color = "#22C55D";
		updateTheme(color);
		colorStore.set(color);
	}

	const openColorPicker = () => {
		colorPickerElement.click();
	};
</script>

<div class="flex flex-row gap-2 items-center">
	{#if color !== "#22C55D"}
		<button
			in:fade={{ duration: 200 }}
			class="text-primaryfg/50 text-dynamicp hover:text-primaryfg/80 transition-colors duration-300 ease-in-out opacity-70"
			on:click={() => reset()}
		>
			Reset
		</button>
	{:else}
		<button
			in:fade={{ duration: 200 }}
			class="text-primaryfg/50 text-dynamicp hover:text-primaryfg/80 transition-colors duration-300 ease-in-out opacity-70"
			on:click={() => openColorPicker()}
		>
			Change theme ->
		</button>
	{/if}
	<input
		bind:this={colorPickerElement}
		class="bg-transparent cursor-pointer"
		type="color"
		bind:value={color}
	/>
</div>
