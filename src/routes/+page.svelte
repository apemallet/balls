<script lang="ts">
  import ThemePicker from "$lib/components/ThemePicker.svelte";
  import Matter from "$lib/svelteMatter.svelte";
  import {BallsSim} from "$lib/ballsSim.svelte";
  import {CrankSim} from "$lib/crankSim.svelte";
  import {getThemer} from "$lib/theme.svelte";

  let canvasBot: HTMLCanvasElement | undefined;
  let canvasTop: HTMLCanvasElement | undefined;
  let balls: BallsSim;
  let crank: CrankSim;

  const wheelRadius = 300; // in planck units

  $effect(() => {
    if (!Matter()) return;
    if (!canvasBot) return;
    if (!canvasTop) return;
    if (!balls) balls = new BallsSim(canvasBot, wheelRadius);
    if (!crank) crank = new CrankSim(canvasTop, wheelRadius);
  });

  $effect(() => {
    if (getThemer().dominant) {
      if (!balls) return;
      if (!crank) return;
      balls!.reTheme();
      crank!.reTheme();
    }
  });

  function onResize() {
    const {innerWidth, innerHeight} = window;
    balls?.reLayout(innerWidth, innerHeight);
    crank?.reLayout(innerWidth, innerHeight);
  }
</script>

<svelte:window on:resize={onResize}/>

<div class="fixed z-20">
  <ThemePicker/>
</div>

<canvas class="absolute w-screen h-screen z-10" bind:this={canvasTop}></canvas>
<canvas class="absolute w-screen h-screen" bind:this={canvasBot}></canvas>
