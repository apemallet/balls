const names: string[] = ["Zipo  Ballagaugh", "Simon Walker", "Mason Bott"];

const short= names.map(name =>
  name.split(" ")
    .map(word => word.substring(0, 2))
    .join(""));

const shuffleIdx = names.map((_, i) => i).sort(() => Math.random());

export function shortOf(i: number) {
  return short[shuffleIdx[i % short.length]];
}

export function nameOf(i: number) {
  return names[shuffleIdx[i % names.length]];
}