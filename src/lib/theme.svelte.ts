import { browser } from "$app/environment";

// Constants
const DEFAULT_ACCENT = "#e7bad0";
const PRIMARY_BG_DARK = "#18181b";
const PRIMARY_BG_LIGHT = "#e7e7df";

// Global state
let color = $state(DEFAULT_ACCENT);
let themerInstance: ReturnType<typeof createThemer> | null = null;

// Client-side initialization
if (browser) {
    const stored = localStorage.getItem("colorStore");
    if (stored) color = stored;
		else color = DEFAULT_ACCENT;
}

interface Themer {
	get color(): string;
	set color(value: string);
	reset(): void;
	isDefault(): boolean;
}

// Singleton obj setup
export function createThemer(): Themer {
    if (themerInstance) return themerInstance;

		$effect(() => {
				if (browser) {
						localStorage.setItem("colorStore", color);
				}
				updateTheme(color);
		});

    themerInstance = {
        get color() { return color; },
        set color(value: string) {
            color = value;
        },
        reset() {
            color = DEFAULT_ACCENT;
        },
        isDefault() {
            return color == DEFAULT_ACCENT;
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

function getContrastingColor(accentColor: string): string {
  const luminanceDark = calculateContrast(accentColor, PRIMARY_BG_DARK);
  const luminanceLight = calculateContrast(accentColor, PRIMARY_BG_LIGHT);
  return luminanceDark + 0.1 > luminanceLight
    ? PRIMARY_BG_DARK
    : PRIMARY_BG_LIGHT;
}

function calculateContrast(value1: string, value2: string): number {
  const color1 = value1
    .replace("#", "")
    .match(/[0-9a-fA-F]{2}/g)!
    .map((x) => parseInt(x, 16));
  const color2 = value2
    .replace("#", "")
    .match(/[0-9a-fA-F]{2}/g)!
    .map((x) => parseInt(x, 16));
  const l1 = 0.2126 * color1[0] + 0.7152 * color1[1] + 0.0722 * color1[2];
  const l2 = 0.2126 * color2[0] + 0.7152 * color2[1] + 0.0722 * color2[2];
  return Math.abs(l1 - l2) / 255;
}

