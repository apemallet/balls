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

  wheelSounder.volume = Math.min(0.3, (speed - 1.3)/6);
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