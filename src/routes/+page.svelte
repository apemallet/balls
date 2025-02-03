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
    sim = new Simulation(canvas);
  });

  function onResize() {
    if (!sim) return;
    console.log('res')
    sim.reLayout();
  }
</script>

<svelte:window on:resize={onResize}/>

<div class="fixed">
  <ThemePicker/>
</div>

<canvas
    class="w-screen h-screen" bind:this={canvas}>
</canvas>