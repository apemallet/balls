<script lang="ts">
	export let palleteMenuOpen: boolean;
	export let infoModalOpen: boolean;
	export let importModalOpen: boolean;
	export let winHistModalOpen: boolean;
</script>

<div class="flex gap-3 items-center gradient-border p-4 bg-mainbg/50">
	<!-- pallete menu button -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton
					 {palleteMenuOpen
			? 'bg-linear-45 from-dominantbg/50 via-alt1bg/50 to-alt5bg/50 hover:bg-linear-30 hover:from-dominantbg/70 hover:via-alt1bg/70 hover:to-alt5bg/70'
			: 'hover:bg-mainfg/10'}"
		onclick={() => (palleteMenuOpen = !palleteMenuOpen)}
	>
		<span class="tooltip">Toggle theme settings</span>
		<svg
			class="h-6 w-6"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
				fill="currentColor"
				d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3L344 320c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
			/></svg
		>
	</button>
	<!-- winner history -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton
		{winHistModalOpen
			? 'bg-linear-180 from-alt4/50 via-alt1bg/50 to-alt3bg/50 hover:from-alt4/70 hover:via-alt1bg/70 hover:to-alt3bg/70'
			: 'hover:bg-mainfg/10'}
		"
		onclick={() => (winHistModalOpen = !winHistModalOpen)}
	>
		<span class="tooltip">Winner history</span>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 576 512"
			class="h-6 w-6"
			fill="currentColor"
			><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
				d="M400 0L176 0c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8L24 64C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9L192 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-26.1 0C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24L446.4 64c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112l84.4 0c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6l84.4 0c-5.1 66.3-31.1 111.2-63 142.3z"
			/></svg
		>
	</button>

	<!-- import -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton
		{importModalOpen
			? 'bg-linear-120 from-alt3/50 via-alt5bg/50 to-alt1bg/50 hover:from-alt3/70 hover:via-alt5bg/70 hover:to-alt1bg/70'
			: 'hover:bg-mainfg/10'}
		"
		onclick={() => (importModalOpen = !importModalOpen)}
	>
		<span class="tooltip">Import names</span>
		<svg
			class="h-6 w-6"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 512 512"
			fill="currentColor"
			><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
				d="M288 109.3L288 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352l128 0c0 35.3 28.7 64 64 64s64-28.7 64-64l128 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64l0-32c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"
			/></svg
		>
	</button>
	<!-- info modal button -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton
			{infoModalOpen
			? 'bg-linear-120 from-alt1bg/50 via-alt3bg/50 to-alt5bg/50 hover:bg-linear-20 hover:from-alt1bg/70 hover:via-alt3bg/70 hover:to-alt5bg/70'
			: 'hover:bg-mainfg/10'}"
		onclick={() => (infoModalOpen = !infoModalOpen)}
	>
		<span class="tooltip">Info</span>
		<svg
			class="w-6 h-6"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 192 512"
			fill="currentColor"
			><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
				d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
			/></svg
		>
	</button>
</div>

<style>
	@reference "tailwindcss/theme";
	@reference "../../app.css";

	.tooltip {
		@apply absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 
            text-sm bg-mainbg/90 text-mainfg rounded-md opacity-0 
            transition-opacity duration-200 pointer-events-none
            group-hover:opacity-100;
		white-space: nowrap;
	}

	.gradient-border {
		border: 0.2rem solid transparent;
		border-image: linear-gradient(
			45deg,
			var(--color-dominantbg),
			var(--color-alt2bg),
			var(--color-alt4bg)
		);
		border-bottom: 0;
		border-right: 0;
		border-image-slice: 1;
	}
</style>
