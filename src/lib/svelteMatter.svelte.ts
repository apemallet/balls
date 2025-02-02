import MatterType from "matter-js";
import {onMount} from "svelte";

let core: MatterType | null = $state(null);
let initialized = $derived(core !== null);

function tryInit() {
  if (!initialized) {
    onMount(async () => {
      // second check to help prevent race conditions
      if (!initialized) {
        core = await import("matter-js");
      }
    });
  }
}

// Caching the result from this function is not necessary
export default function Matter() {
  tryInit();
  return core;
}