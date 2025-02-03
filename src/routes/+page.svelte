<script lang="ts">
  import ThemePicker from "$lib/components/ThemePicker.svelte";
  import Matter from "$lib/svelteMatter.svelte";
  import {Simulation} from "$lib/simulation.svelte";

  let canvas: HTMLCanvasElement | undefined;
  let sim: Simulation;

  $effect(() => {
    if (!Matter()) return;
    if (sim) return;
    if (!canvas) return;
    console.log(canvas)
    sim = new Simulation(canvas);
  });
</script>

<div class="fixed">
  <ThemePicker/>
</div>
<canvas class="w-screen h-screen" bind:this={canvas}></canvas>
