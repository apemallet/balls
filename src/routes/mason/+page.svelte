<script>
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import { getThemer } from "$lib/theme.svelte";

	let theme = getThemer();
</script>

<ThemePicker />
<div class="m-4">
	<h1 style="color: {theme.dominant}">hi i am the dominant color!</h1>
	<h1 style="color: {theme.alt1}">hi i am the alt1 color!</h1>
	<h1 style="color: {theme.alt2}">hi i am the alt2 color!</h1>
	<h1 style="color: {theme.alt3}">hi i am the alt3 color!</h1>
	<h1 style="color: {theme.alt4}">hi i am the alt4 color!</h1>
	<h1 style="color: {theme.alt5}">hi i am the alt5 color!</h1>

	<h1 class="bg-dominantbg fg-dominantfg">hi i am the dominant color!</h1>
	<h1 class="bg-alt1bg text-alt1fg">hi i am the alt1 color!</h1>
	<h1 class="bg-alt2bg text-alt2fg">hi i am the alt2 color!</h1>
	<h1 class="bg-alt3bg text-alt3fg">hi i am the alt3 color!</h1>
	<h1 class="bg-alt4bg text-alt4fg">hi i am the alt4 color!</h1>
	<h1 class="bg-alt5bg text-alt5fg">hi i am the alt5 color!</h1>
</div>
