import { browser } from "$app/environment";
import chroma from "chroma-js";

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
				const storedDominant = localStorage.getItem("dominantColor");
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
	const color1 = chroma(hexVal1).rgb();
	const color2 = chroma(hexVal2).rgb();
  const l1 = 0.2126 * color1.r + 0.7152 * color1.g + 0.0722 * color1.b;
  const l2 = 0.2126 * color2.r + 0.7152 * color2.g + 0.0722 * color2.b;
  return Math.abs(l1 - l2) / 255;
}


// Color harmony functions
function computeAnalogous(dominantHex: string) {
	const dHSL = chroma(dominantHex).hsl();

	const steps = [-30, -15, 0, 15, 30]
  return steps.map(step => {
    const hue = (dHSL[0] + step + 360) % 360;
		return chroma(hue, 1, 0.5, 'hsl').hex(); // S=100%, L=50%
  });
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
