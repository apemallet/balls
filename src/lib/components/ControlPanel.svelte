<script lang="ts">
	export let palleteMenuOpen: boolean;
	export let infoModalOpen: boolean;
	export let settingsModalOpen: boolean;
</script>

<div class="flex gap-3 items-center">
	<!-- pallete menu button -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton
					 {palleteMenuOpen
			? 'bg-linear-45 from-dominantbg/50 via-alt1bg/50 to-alt5bg/50 hover:bg-linear-20 hover:from-dominantbg/70 hover:via-alt1bg/70 hover:to-alt5bg/70'
			: 'hover:bg-mainfg/10'}"
		on:click={() => (palleteMenuOpen = !palleteMenuOpen)}
	>
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
	<!-- settings modal button -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton"
		on:click={() => (settingsModalOpen = !settingsModalOpen)}
	>
		<svg
			class="w-6 h-6"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
			viewBox="0 0 512 512"
			><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
				d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
			/></svg
		>
	</button>
	<!-- info modal button -->
	<button
		class="group flex flex-row gap-2 justify-between crackedButton
			{infoModalOpen
			? 'bg-linear-45 from-alt1bg/50 via-alt3bg/50 to-alt5bg/50 hover:bg-linear-20 hover:from-alt1bg/70 hover:via-alt3bg/70 hover:to-alt5bg/70'
			: 'hover:bg-mainfg/10'}"
		on:click={() => (infoModalOpen = !infoModalOpen)}
	>
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
