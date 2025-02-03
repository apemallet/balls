<script lang="ts">
	import { getThemer, ColorHarmony, type Themer } from "$lib/theme.svelte";
	import { fade } from "svelte/transition";

	// Theme stuff
	let colorPickerElement: HTMLInputElement;
	const colorThemer: Themer = getThemer();

	// Menu state
	let menuOpen = true;
</script>

<!-- TODO: at least on iphone safari, there is some weird color issues going on -->
<div class="flex flex-col sm:flex-row gap-4 sm:items-center w-full">
	<!-- collapse button -->
	<button
		class="group flex flex-row gap-2 p-2 rounded-lg backdrop-blur-sm border-2 border-mainfg/60
					 hover:border-mainfg/80 transition-all duration-300 hover:scale-105 justify-between
					 hover:bg-mainfg/10"
		aria-label="Toggle theme settings"
		on:click={() => (menuOpen = !menuOpen)}
	>
		<!-- TODO: Ensure button size remains the same even when text changes (hidden perhaps?) -->
		<div class="text-mainfg/60 group-hover:text-mainfg/80">
			{#if menuOpen}
				Collapse
			{:else}
				Expand
			{/if}
		</div>
		<svg
			class="w-6 h-6 text-mainfg/60 group-hover:text-mainfg/80 transition-transform rotate-45"
			class:rotate-45={menuOpen}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width={2}
				d="M12 6v6m0 0v6m0-6h6m-6 0H6"
			/>
		</svg>
	</button>

	{#if menuOpen}
		<!-- color harmony dropdown -->
		<div
			class="relative group min-w-fit hover:scale-105 transition-all duration-300"
		>
			<!-- TODO: maybe this can be made a button that clicks a hidden dropdown in order to get button-styling perfected -->
			<!-- or look into embedded icons in the select area, if possible without the absolute setup since  -->
			<!-- it causes weird issues (ie overlap) these can also be fixed via margin or padding on the text though. -->
			<select
				bind:value={colorThemer.colorHarmony}
				class="appearance-none backdrop-blur-sm p-2 rounded-lg
      border-2 border-mainfg/60 text-mainfg/60 group-hover:border-mainfg/80 group-hover:text-mainfg/80
      focus:outline-none focus:ring-1 focus:ring-mainfg/30 hover:bg-mainfg/10
      transform transition-all duration-300 ease-out cursor-pointer w-full"
			>
				<!-- TODO: Chevron and text can overlap and button won't expand. needs fixing, especially for long names like Split Complementary  -->
				{#each Object.entries(ColorHarmony).filter( ([key]) => isNaN(Number(key)), ) as [name, value]}
					<option {value}>{name.split(/(?=[A-Z])/).join(" ")}</option>
				{/each}
			</select>
			<!-- chevron svg -->
			<!-- TODO: Chevron SVG is sligtly off coompared to the + svg and needs to be fixed fundamentally -->
			<svg
				class="absolute right-2 top-1/2 -translate-y-1/2 mr-1 h-5 w-5 text-mainfg/60 group-hover:text-mainfg/80
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
					class="flex justify-between gap-2 p-2 rounded-lg
							border-2 border-primaryfg/60 hover:border-primaryfg/80
							text-mainfg/60 hover:text-mainfg/80
							transform hover:scale-105 transition-all duration-300 ease-out"
					on:click={() => colorPickerElement.click()}
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
                   text-red-500/80 hover:text-red-500/100
                   transform hover:scale-105 transition-all duration-300 ease-out"
					on:click={() => colorThemer.reset()}
				>
					Reset pallete
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
				class="h-8 min-w-8 bg-transparent cursor-pointer appearance-none self-center grow sm:shrink"
				type="color"
				bind:value={colorThemer.dominant}
			/>
		</div>

		<!-- pallete visualization -->
		<div class="flex flex-wrap gap-4 rounded-xl">
			{#each colorThemer.alts as altHex, index (index)}
				<div
					class="flex-1 w-24 truncate rounded-sm shadow-md transition-all hover:scale-105"
					style="background-color: {altHex}"
				>
					<div class="px-4 h-full flex items-center justify-center">
						<span
							class="font-bold text-sm truncate"
							style="color: var(--color-alt{index + 1}fg)">{altHex}</span
						>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
