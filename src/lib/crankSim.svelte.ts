import {MatterSim} from "$lib/sim.svelte";

export class CrankSim extends MatterSim {
  // xCenter in planck units
  constructor(canvas: HTMLCanvasElement, xCenter: number) {
    super(canvas);
  }

  public reLayout(width, height) {
  }

  protected fixedUpdate(deltaTime: number): void {
  }

  reTheme(): void {
  }
}