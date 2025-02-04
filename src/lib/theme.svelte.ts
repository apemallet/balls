import { browser } from "$app/environment";
import * as chroma from "chroma.ts";

// Constants
const DEFAULT_DOMINANT = "#e7bad0";
const MAIN_DARK = "#18181b";
const MAIN_LIGHT = "#e7e7df";

export enum ColorHarmony {
  Analogous,
  Monochromatic,
  Triad,
  Complementary,
  SplitComplimentary,
  Square,
  Compound,
  Shades,
}

export interface Themer {
  get colorHarmony(): ColorHarmony;
  set colorHarmony(value: ColorHarmony);
  get dominant(): string;
  set dominant(value: string);
  get mainBackground(): string;
  get mainForeground(): string;
  get alt1(): string;
  get alt2(): string;
  get alt3(): string;
  get alt4(): string;
  get alt5(): string;
  get alts(): string[];
  get domAndAlts(): string[];
  reset(): void;
  isDefault(): boolean;
}

// Singleton obj setup
let themerInstance: Themer;
export function getThemer(): Themer {
  if (themerInstance) return themerInstance;

  // Color pallete
  let colorHarmony = $state(ColorHarmony.Analogous);
  let dominant = $state(DEFAULT_DOMINANT);
  let mainBG = $state(MAIN_DARK);
  let mainFG = $state(MAIN_LIGHT);

  let [alt1, alt2, alt3, alt4, alt5] = $derived.by(() => {
    switch (colorHarmony) {
      case ColorHarmony.Analogous:
        return computeAnalogous(dominant);
      case ColorHarmony.Monochromatic:
        return computeMonochromatic(dominant);
      case ColorHarmony.Triad:
        return computeTriad(dominant);
      case ColorHarmony.Complementary:
        return computeComplementary(dominant);
      case ColorHarmony.SplitComplimentary:
        return computeSplitComplimentary(dominant);
      case ColorHarmony.Square:
        return computeSquare(dominant);
      case ColorHarmony.Compound:
        return computeCompound(dominant);
      case ColorHarmony.Shades:
        return computeShades(dominant);
      default:
        return computeAnalogous(dominant);
    }
  });

  // Client-side initialization
  if (browser) {
    const storedDominant = localStorage.getItem("dominantColor");
    dominant = storedDominant ?? DEFAULT_DOMINANT;

    const storedColorHarmony = localStorage.getItem("colorHarmony");
    colorHarmony =
      ColorHarmony[storedColorHarmony as keyof typeof ColorHarmony] ??
      ColorHarmony.Analogous;
  }

  $effect(() => {
    if (browser) {
      localStorage.setItem("dominantColor", dominant);
      localStorage.setItem("colorHarmony", ColorHarmony[colorHarmony]);
    }
    mainBG = getContrastingColor(dominant);
    mainFG = getContrastingColor(mainBG);
  });

  $effect(() => {
    updateCSSVariable("--color-alt1bg", alt1);
    updateCSSVariable("--color-alt2bg", alt2);
    updateCSSVariable("--color-alt3bg", alt3);
    updateCSSVariable("--color-alt4bg", alt4);
    updateCSSVariable("--color-alt5bg", alt5);
    updateCSSVariable("--color-alt1fg", getContrastingColor(alt1));
    updateCSSVariable("--color-alt2fg", getContrastingColor(alt2));
    updateCSSVariable("--color-alt3fg", getContrastingColor(alt3));
    updateCSSVariable("--color-alt4fg", getContrastingColor(alt4));
    updateCSSVariable("--color-alt5fg", getContrastingColor(alt5));

    updateCSSVariable("--color-dominantbg", dominant);
    updateCSSVariable("--color-dominantfg", getContrastingColor(dominant));

    updateCSSVariable("--color-mainbg", mainBG);
    updateCSSVariable("--color-mainfg", mainFG);
  });

  themerInstance = {
    get colorHarmony(): ColorHarmony {
      return colorHarmony;
    },
    set colorHarmony(value: ColorHarmony) {
      colorHarmony = value;
    },
    get dominant() {
      return dominant;
    },
    set dominant(value: string) {
      dominant = value;
    },
    get mainBackground() {
      return mainBG;
    },
    get mainForeground() {
      return mainFG;
    },
    get alt1() {
      return alt1;
    },
    get alt2() {
      return alt2;
    },
    get alt3() {
      return alt3;
    },
    get alt4() {
      return alt4;
    },
    get alt5() {
      return alt5;
    },
    get alts() {
      return [alt1, alt2, alt3, alt4, alt5];
    },
    get domAndAlts() {
      return [dominant, alt1, alt2, alt3, alt4, alt5];
    },
    // TODO: Get alts variated. It returns a super long list
    // of at least 25 to account for all balls and slightly
    // variates the alt colors to add some depth
    reset() {
      dominant = DEFAULT_DOMINANT;
    },
    isDefault() {
      return dominant == DEFAULT_DOMINANT;
    },
  };

  return themerInstance;
}

function updateCSSVariable(name: string, value: string) {
  if (!browser) return;
  const root = document.documentElement;
  root.style.setProperty(name, value);
}

// Gets the dedicated light or dark background color based on an input accent color
function getContrastingColor(accentColor: string): string {
  const luminanceDark = calculateContrast(accentColor, MAIN_DARK);
  const luminanceLight = calculateContrast(accentColor, MAIN_LIGHT);
  return luminanceDark + 0.1 > luminanceLight ? MAIN_DARK : MAIN_LIGHT;
}

function calculateContrast(hexVal1: string, hexVal2: string): number {
  const color1 = chroma.color(hexVal1).rgb();
  const color2 = chroma.color(hexVal2).rgb();
  const l1 = 0.2126 * color1[0] + 0.7152 * color1[1] + 0.0722 * color1[2];
  const l2 = 0.2126 * color2[0] + 0.7152 * color2[1] + 0.0722 * color2[2];
  return Math.abs(l1 - l2) / 255;
}

// Color harmony functions
function computeAnalogous(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) == MAIN_DARK;

  const steps = [-30, -15, 0, 15, 30];
  return steps.map((step) => {
    const hue = (dHSL[0] + step + 360) % 360;
    if (isDark) {
      return chroma.color(hue, 1, 0.5, "hsl").hex();
    } else {
      return chroma.color(hue, 1, 0.3, "hsl").hex();
    }
  });
}

// Returns a pallete that forms by varying hue and lightness of dominant
function computeMonochromatic(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) === MAIN_DARK;

  const baseLightness = isDark ? 0.5 : 0.3;

  // Lightness steps around the base lightness
  const lightnessSteps = [-0.2, -0.1, 0, 0.1, 0.2].map((step) => {
    const lightness = baseLightness + step;
    return Math.max(0, Math.min(1, lightness));
  });

  // Generate colors with the dominant hue, full saturation, and varying lightness
  return lightnessSteps.map((lightness) =>
    chroma.hsl(dHSL[0], 1, lightness).hex(),
  );
}

// Varies the hue from dominant by 120 degrees to form a triad. Each triad
// point has a a pair of colors with different lightness value
function computeTriad(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) === MAIN_DARK;
  const baseLightness = isDark ? 0.5 : 0.3;

  // Triad hue setup
  const hues = [dHSL[0], (dHSL[0] + 120) % 360, (dHSL[0] + 240) % 360];

  // Return the 1 variaiton of dominant, and 2 variations of the triad hues
  return hues.flatMap((hue, idx) =>
    idx === 0
      ? [chroma.hsl(hue, 1, baseLightness * 0.8).hex()]
      : [1, 0.6].map((multiplier) =>
          chroma.hsl(hue, 1, baseLightness * multiplier).hex(),
        ),
  );
}

function computeComplementary(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) === MAIN_DARK;
  const baseLightness = isDark ? 0.5 : 0.3;
  const compHue = (dHSL[0] + 180) % 360; // True complementary hue

  // Dominant variations (2 alternates, excluding base)
  const dominantColors = [-0.1, 0.1].map((step) => {
    const lightness = clamp(baseLightness + step);
    return chroma.hsl(dHSL[0], 1, lightness).hex();
  });

  // Complementary variations (3 steps: darker, base, lighter)
  const compColors = [-0.15, 0, 0.15].map((step) => {
    const lightness = clamp(baseLightness + step);
    return chroma.hsl(compHue, 1, lightness).hex();
  });

  return [...dominantColors, ...compColors];
}

// Clamp lightness between 0-1
function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function computeSplitComplimentary(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) === MAIN_DARK;
  const baseLightness = isDark ? 0.5 : 0.3;

  // Split complementary hues (±150° from complement)
  const hues = [dHSL[0], (dHSL[0] + 150) % 360, (dHSL[0] + 210) % 360];

  // Generate colors with balanced variations
  return [
    chroma.hsl(hues[0], 1, baseLightness).hex(),
    chroma.hsl(hues[0], 1, baseLightness + 0.15).hex(),
    chroma.hsl(hues[1], 1, baseLightness - 0.1).hex(),
    chroma.hsl(hues[1], 1, baseLightness + 0.1).hex(),
    chroma.hsl(hues[2], 1, baseLightness).hex(),
  ];
}

function computeSquare(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) === MAIN_DARK;
  const baseLightness = isDark ? 0.5 : 0.3;

  // Square scheme: 4 hues spaced 90° apart
  const squareHues = [0, 90, 180, 270].map(
    (offset) => (dHSL[0] + offset) % 360,
  );

  // Generate 5 colors with balanced distribution
  return [
    // Dominant variations
    chroma.hsl(squareHues[0], 1, baseLightness).hex(),
    chroma.hsl(squareHues[0], 1, baseLightness + 0.15).hex(),
    // Other square colors
    chroma.hsl(squareHues[1], 1, baseLightness - 0.1).hex(),
    chroma.hsl(squareHues[2], 1, baseLightness + 0.1).hex(),
    chroma.hsl(squareHues[3], 1, baseLightness).hex(),
  ];
}

function computeCompound(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const isDark = getContrastingColor(dominantHex) === MAIN_DARK;
  const baseLightness = isDark ? 0.5 : 0.3;

  // Compound scheme: Original + complement + adjacent analogs
  const compoundHues = [
    dHSL[0], // Dominant
    (dHSL[0] + 30) % 360, // Analog
    (dHSL[0] + 180) % 360, // Complement
    (dHSL[0] + 210) % 360, // Complement analog
  ];

  // Create balanced variations
  return [
    chroma.hsl(compoundHues[0], 1, baseLightness).hex(),
    chroma.hsl(compoundHues[0], 1, baseLightness + 0.1).hex(),
    chroma.hsl(compoundHues[1], 1, baseLightness - 0.05).hex(),
    chroma.hsl(compoundHues[2], 1, baseLightness + 0.15).hex(),
    chroma.hsl(compoundHues[3], 1, baseLightness).hex(),
  ];
}

// Returns a pallete that forms by varying the lightness of dominant
function computeShades(dominantHex: string) {
  const dHSL = chroma.color(dominantHex).hsl();
  const [hue, saturation, originalLightness] = dHSL;

  // Lightness steps relative to the original color's lightness
  const lightnessSteps = [-0.2, -0.1, 0, 0.1, 0.2].map((step) => {
    const lightness = originalLightness + step;
    return Math.max(0, Math.min(1, lightness));
  });

  // Maintain original hue & saturation, vary lightness
  return lightnessSteps.map((lightness) =>
    chroma.hsl(hue, saturation, lightness).hex(),
  );
}
