import { browser } from "$app/environment";
import * as chroma from 'chroma.ts'

// Constants
const DEFAULT_DOMINANT = "#e7bad0";
const MAIN_DARK = "#18181b";
const MAIN_LIGHT = "#e7e7df";

export enum ColorHarmony {
	Analogous,
	Monochromatic,
	Triad,
	Complimentary,
	SplitComplimentary,
	Square,
	Compound,
	Shades
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
		// TODO: Since alts are now derived by colorHarmony, simon needs to add logic
		// for colorHarmony changing to update ballsSim colors in his code
		let [alt1,alt2,alt3,alt4,alt5] = $derived.by(() => {
			switch (colorHarmony) {
				case ColorHarmony.Analogous: return computeAnalogous(dominant);
				case ColorHarmony.Monochromatic: return computeMonochromatic(dominant);
				case ColorHarmony.Triad: return computeTriad(dominant);
				case ColorHarmony.Complimentary: return computeComplimentary(dominant);
				case ColorHarmony.SplitComplimentary: return computeSplitComplimentary(dominant);
				case ColorHarmony.Square: return computeSquare(dominant);
				case ColorHarmony.Compound: return computeCompound(dominant);
				case ColorHarmony.Shades: return computeShades(dominant);
				default: return computeAnalogous(dominant);
			}
		});

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
				const mainColors = updateTheme(dominant);
			 	mainBG = mainColors.background;
				mainFG = mainColors.foreground;
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
				get colorHarmony(): ColorHarmony { return colorHarmony },
				set colorHarmony(value: ColorHarmony) { colorHarmony = value },
				get dominant() { return dominant; },
				set dominant(value: string) { dominant = value; },
				get mainBackground() { return mainBG; },
				get mainForeground() { return mainFG; },
				get alt1() { return alt1; },
				get alt2() { return alt2; },
				get alt3() { return alt3; },
				get alt4() { return alt4; },
				get alt5() { return alt5; },
				get alts() { return [alt1, alt2, alt3, alt4, alt5]; },
        reset() {
            dominant = DEFAULT_DOMINANT;
        },
        isDefault() {
            return dominant == DEFAULT_DOMINANT;
        }
    };

    return themerInstance;
}

// Update theme CSS and return background, foreground 
function updateTheme(value: string): { background: string, foreground: string } {
  updateCSSVariable("--color-accentbg", value);
  const backgroundColor = getContrastingColor(value);
  updateCSSVariable("--color-primarybg", backgroundColor);
  updateCSSVariable("--color-accentfg", backgroundColor);
  const foregroundColor = getContrastingColor(backgroundColor);
  updateCSSVariable("--color-primaryfg", foregroundColor);
	return { background: backgroundColor, foreground: foregroundColor };
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

	const steps = [-30, -15, 0, 15, 30]
  return steps.map(step => {
    const hue = (dHSL[0] + step + 360) % 360;
		if (isDark) {
			return chroma.color(hue, 1, 0.5, 'hsl').hex();
		} else {
			return chroma.color(hue, 1, 0.3, 'hsl').hex();
		}
  });
}

function computeMonochromatic(dominantHex: string) {
    const dHSL = chroma.color(dominantHex).hsl();
    const isDark = getContrastingColor(dominantHex) === MAIN_DARK;

    // Determine base lightness based on whether the dominant color is dark
    const baseLightness = isDark ? 0.5 : 0.3;
    // Lightness steps around the base lightness
    const lightnessSteps = [-0.2, -0.1, 0, 0.1, 0.2].map(step => {
        const lightness = baseLightness + step;
        return Math.max(0, Math.min(1, lightness)); // Clamp between 0 and 1
    });

    // Generate colors with the dominant hue, full saturation, and varying lightness
    return lightnessSteps.map(lightness => 
        chroma.hsl(dHSL[0], 1, lightness).hex()
    );
}
function computeTriad(dominantHex: string) {
	// TODO: Research needed
	return computeAnalogous(dominantHex);
}

function computeComplimentary(dominantHex: string) {
	// TODO: Research needed 
	return computeAnalogous(dominantHex);
}

function computeSplitComplimentary(dominantHex: string) {
	// TODO: Research needed
	return computeAnalogous(dominantHex);
}

function computeSquare(dominantHex: string) {
	// TODO: Research needed
	return computeAnalogous(dominantHex);
}

function computeCompound(dominantHex: string) {
	// TODO: Research needed
	return computeAnalogous(dominantHex);
}

function computeShades(dominantHex: string) {
	// TODO: Need to figure out the difference between shades and monochromatic
	return computeAnalogous(dominantHex);
}
