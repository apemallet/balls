<script lang="ts">
	import { getThemer, ColorHarmony, type Themer } from "$lib/theme.svelte";
	import { fade, slide } from "svelte/transition";

	// Theme stuff
	let colorPickerElement: HTMLInputElement;
	const colorThemer: Themer = getThemer();

	// Menu state
	export let menuOpen = true;

	// Copy paste handler. Maybe add cracked animation later
	// TODO: Deprecated, need to add a "copied" message and stuff, not intuitive enough yet
	function handleCopy(altHex: string, _: MouseEvent) {
		navigator.clipboard.writeText(altHex);
	}
</script>

{#if menuOpen}
	<div
		class="flex flex-col md:flex-row gap-4 md:items-center w-full"
		transition:slide={{ duration: 750, axis: "x" }}
	>
		<!-- color harmony dropdown -->
		<div
			class="relative group min-w-fit hover:scale-105 transition-all duration-300"
		>
			<select
				bind:value={colorThemer.colorHarmony}
				class="appearance-none crackedButton pr-8 mr-6 group-hover:border-mainfg/80 group-hover:text-mainfg/80
      focus:outline-none focus:ring-1 focus:ring-mainfg/30 hover:bg-mainfg/10
      transform transition-all duration-300 ease-out cursor-pointer w-full"
			>
				{#each Object.entries(ColorHarmony).filter( ([key]) => isNaN(Number(key)), ) as [name, value]}
					<option {value}>{name.split(/(?=[A-Z])/).join(" ")}</option>
				{/each}
			</select>

			<!-- chevron svg -->
			<svg
				class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-mainfg/60 group-hover:text-mainfg/80
           pointer-events-none transition-transform duration-300"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width={2}
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</div>

		<!-- color picker -->
		<div class="flex flex-row gap-4">
			{#if colorThemer.isDefault()}
				<button
					in:fade={{ duration: 200 }}
					class="flex justify-between gap-2 crackedButton"
					onclick={() => colorPickerElement.click()}
				>
					<span class="truncate">Select dominant</span>
					<svg
						class="w-4 h-4 self-center"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width={2}
							d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5"
						/>
					</svg>
				</button>
			{:else}
				<button
					in:fade={{ duration: 200 }}
					class="flex justify-between gap-2 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20
                   border-2 border-red-500/20 hover:border-red-500/40
                   text-red-500/80 hover:text-red-500/100 whitespace-nowrap
                   transform hover:scale-105 transition-all duration-300 ease-out"
					onclick={() => colorThemer.reset()}
				>
					Reset dominant
					<svg
						viewBox="0 0 1024 1024"
						class="w-4 h-4 self-center"
						fill="currentColor"
						><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
							id="SVGRepo_tracerCarrier"
							stroke-linecap="round"
							stroke-linejoin="round"
						></g><g id="SVGRepo_iconCarrier"
							><path
								d="M704 288h-281.6l177.6-202.88a32 32 0 0 0-48.32-42.24l-224 256a30.08 30.08 0 0 0-2.24 3.84 32 32 0 0 0-2.88 4.16v1.92a32 32 0 0 0 0 5.12A32 32 0 0 0 320 320a32 32 0 0 0 0 4.8 32 32 0 0 0 0 5.12v1.92a32 32 0 0 0 2.88 4.16 30.08 30.08 0 0 0 2.24 3.84l224 256a32 32 0 1 0 48.32-42.24L422.4 352H704a224 224 0 0 1 224 224v128a224 224 0 0 1-224 224H320a232 232 0 0 1-28.16-1.6 32 32 0 0 0-35.84 27.84 32 32 0 0 0 27.84 35.52A295.04 295.04 0 0 0 320 992h384a288 288 0 0 0 288-288v-128a288 288 0 0 0-288-288zM103.04 760a32 32 0 0 0-62.08 16A289.92 289.92 0 0 0 140.16 928a32 32 0 0 0 40-49.92 225.6 225.6 0 0 1-77.12-118.08zM64 672a32 32 0 0 0 22.72-9.28 37.12 37.12 0 0 0 6.72-10.56A32 32 0 0 0 96 640a33.6 33.6 0 0 0-9.28-22.72 32 32 0 0 0-10.56-6.72 32 32 0 0 0-34.88 6.72A32 32 0 0 0 32 640a32 32 0 0 0 2.56 12.16 37.12 37.12 0 0 0 6.72 10.56A32 32 0 0 0 64 672z"
							></path></g
						></svg
					>
				</button>
			{/if}

			<input
				bind:this={colorPickerElement}
				class="h-8 min-w-8 bg-transparent backdrop-blur-sm border-transparent cursor-pointer appearance-none self-center grow md:shrink"
				type="color"
				bind:value={colorThemer.dominant}
			/>
		</div>

		<div class="flex flex-wrap gap-2 rounded-xl grow">
			{#each colorThemer.alts as altHex, index (index)}
				<div
					class="flex justify-around flex-1 w-24 overflow-hidden whitespace-nowrap rounded-sm shadow-md transition-all min-w-0"
					style="background-color: {altHex}; 
								 color: var(--color-alt{index + 1}fg)"
				>
					<span
						class="font-bold text-sm p-1"
						style="color: var(--color-alt{index + 1}fg)"
					>
						{altHex}
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
