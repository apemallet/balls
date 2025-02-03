import { browser } from "$app/environment";

// Constants
const DEFAULT_DOMINANT = "#e7bad0";
const MAIN_DARK = "#18181b";
const MAIN_LIGHT = "#e7e7df";

// Global state
let themerInstance: ReturnType<typeof createThemer> | null = null;

enum ColorHarmony {
	Analogous,
	Monochromatic,
	Triad,
	Complimentary,
	SplitComplimentary,
	Square,
	Compound,
	Shades
}

interface Themer {
	get colorHarmony(): ColorHarmony;
	set colorHarmony(value: ColorHarmony);
	get dominant(): string;
	set dominant(value: string);
	get alt1(): string;
	get alt2(): string;
	get alt3(): string;
	get alt4(): string;
	get alt5(): string;
	reset(): void;
	isDefault(): boolean;
}

// Singleton obj setup
export function createThemer(): Themer {
    if (themerInstance) return themerInstance;

		// Color pallete
		let colorHarmony = $state(ColorHarmony.Analogous);
		let dominant = $state(DEFAULT_DOMINANT);
		let [alt1,alt2,alt3,alt4,alt5] = $derived(computeAnalogous(dominant));


		// Client-side initialization
		if (browser) {
				const storedDominant = localStorage.getItem("dominantHexColor");
				dominant = storedDominant ?? DEFAULT_DOMINANT;

				const storedColorHarmony = localStorage.getItem("colorHarmony");
				colorHarmony = ColorHarmony[storedColorHarmony as keyof typeof ColorHarmony] ?? ColorHarmony.Analogous;
		}

		$effect(() => {
				if (browser) {
						localStorage.setItem("dominantColor", dominant);
						localStorage.setItem("colorHarmony", ColorHarmony[colorHarmony]);
				}
				updateTheme(dominant);
		});

    themerInstance = {
				get colorHarmony(): ColorHarmony { return colorHarmony },
				set colorHarmony(value: ColorHarmony) { colorHarmony = value },
				get dominant() { return dominant; },
				set dominant(value: string) { dominant = value; },
				get alt1() { return alt1; },
				get alt2() { return alt2; },
				get alt3() { return alt3; },
				get alt4() { return alt4; },
				get alt5() { return alt5; },
        reset() {
            dominant = DEFAULT_DOMINANT;
        },
        isDefault() {
            return dominant == DEFAULT_DOMINANT;
        }
    };

    return themerInstance;
}

// Theme update functions and helpers
function updateTheme(value: string) {
  updateCSSVariable("--color-accentbg", value);
  const backgroundColor = getContrastingColor(value);
  updateCSSVariable("--color-primarybg", backgroundColor);
  updateCSSVariable("--color-accentfg", backgroundColor);
  const foregroundColor = getContrastingColor(backgroundColor);
  updateCSSVariable("--color-primaryfg", foregroundColor);
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
  return luminanceDark + 0.1 > luminanceLight
    ? MAIN_DARK
    : MAIN_LIGHT;
}

function calculateContrast(hexVal1: string, hexVal2: string): number {
	const color1 = hexToRgb(hexVal1)!;
	const color2 = hexToRgb(hexVal2)!;
  const l1 = 0.2126 * color1.r + 0.7152 * color1.g + 0.0722 * color1.b;
  const l2 = 0.2126 * color2.r + 0.7152 * color2.g + 0.0722 * color2.b;
  return Math.abs(l1 - l2) / 255;
}

function rgbToHex(r: number, g: number, b: number): string {
	function componentToHex(c: number) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = hex
    .replace("#", "")
    .match(/[0-9a-fA-F]{2}/g)!
    .map((x) => parseInt(x, 16));
  return {
    r: color[0],
    g: color[1],
    b: color[2]
  };
}

function hslToHex(hsl: { h: number; s: number; l: number }): string {
  const { h, s, l } = hsl;

  const hDecimal = l / 100;
  const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

    // Convert to Hex and prefix with "0" if required
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    throw new Error("Could not parse Hex Color");
  }

  const rHex = parseInt(result[1], 16);
  const gHex = parseInt(result[2], 16);
  const bHex = parseInt(result[3], 16);

  const r = rHex / 255;
  const g = gHex / 255;
  const b = bHex / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = (max + min) / 2;
  let s = h;
  let l = h;

  if (max === min) {
    // Achromatic
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  h /= 6;

  s = s * 100;
  s = Math.round(s);
  l = l * 100;
  l = Math.round(l);
  h = Math.round(360 * h);

  return { h, s, l };
}

// Color harmony functions
function computeAnalogous(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeMonochromatic(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeTriad(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeComplimentary(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeSplitComplimentary(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeSquare(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeCompound(dominantHex: string) {
	// TODO 
	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}

function computeShades(dominantHex: string) {
	const dominantHSL = hexToHsl(dominantHex);

	return [dominantHex, dominantHex, dominantHex, dominantHex, dominantHex];
}
