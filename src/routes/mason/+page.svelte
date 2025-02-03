<script>
	import ThemePicker from "$lib/components/ThemePicker.svelte";
	import { getThemer } from "$lib/theme.svelte";

	let theme = getThemer();
</script>

<ThemePicker />
<h1 class="bg-primarybg text-primaryfg">mason</h1>
<h1 class="bg-accentbg text-accentfg">mason</h1>
<h1 class="text-accentbg">mason</h1>
<h1 class="bg-primarybg text-primaryfg">mason</h1>

<h1 style="color: {theme.dominant}">Hi i am the dominant color!</h1>
<h1 style="color: {theme.alt1}">Hi i am the alt1 color!</h1>
<h1 style="color: {theme.alt2}">Hi i am the alt2 color!</h1>
<h1 style="color: {theme.alt3}">Hi i am the alt3 color!</h1>
<h1 style="color: {theme.alt4}">Hi i am the alt4 color!</h1>
<h1 style="color: {theme.alt5}">Hi i am the alt5 color!</h1>
