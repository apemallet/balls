// TODO: Attempt fix for sound playing on tab out indefinitely
let revalSounder;
export function revealSound() {
  if (!revalSounder) {
    revalSounder = new Audio("/ear/eat.mp3");
    revalSounder.volume = 0.4;
  }

  revalSounder.play();
}

let wheelSounder;
export function wheelSound(speed) {
  if (!wheelSounder) {
    wheelSounder = new Audio("/ear/place.mp3");
    wheelSounder.loop = true;
  }

  if (speed === 0) {
    wheelSounder.pause();
    return;
  }

  // TODO: Uncaught errors on playback rate being too high. Not sure what constriants
  // are but a simple check with constraints will do the trick
  wheelSounder.volume = Math.min(0.3, (speed - 1.3) / 6);
  wheelSounder.playbackRate = speed;
  wheelSounder.play();
}

let popSounder;
export function popSound() {
  if (!popSounder) {
    popSounder = new Audio("/ear/pop.mp3");
    popSounder.volume = 0.5;
  }

  popSounder.play();
}
