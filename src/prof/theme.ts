/** "Professor" style: graphite ink on warm paper, ONE accent (marker yellow). No other colours. */
export type Palette = {paper: string; paper2: string; white: string; ink: string; graphite: string; mid: string; soft: string; accent: string; accentDeep: string};

/** Episode themes (episode.theme): same brand structure, different accent + paper tint. One accent colour per video. */
export const THEMES: Record<string, Partial<Palette>> = {
	yellow: {},
	coral: {accent: '#FF5C4D', accentDeep: '#D93A2B', paper: '#F1E7E2', paper2: '#E6D7D0', soft: '#D8C7BF'},
	blue: {accent: '#4C8DFF', accentDeep: '#2C62D6', paper: '#E7ECF2', paper2: '#D9E0EA', soft: '#C3CCD8'},
	mint: {accent: '#2FE0A0', accentDeep: '#14B37A', paper: '#E6EEEA', paper2: '#D8E3DD', soft: '#C2D0C8'},
	case: {paper: '#D3BC95', paper2: '#BCA277', white: '#F3ECD9', ink: '#1C1712', graphite: '#3B3026', mid: '#7B6B58', soft: '#B7A27F', accent: '#C23B30', accentDeep: '#8C241C'},
	violet: {accent: '#A58BFF', accentDeep: '#7C5CE0', paper: '#ECE8F2', paper2: '#DFD9EA', soft: '#CBC3DA'},
};

const BASE: Palette = {paper: '#EEE9DE', paper2: '#E2DCCD', white: '#FBFAF6', ink: '#121212', graphite: '#2B2B2A', mid: '#8D8B85', soft: '#C9C4B8', accent: '#FFC51A', accentDeep: '#E8A800'};

/** Live palette (mutated by applyTheme at the start of each render). */
export const PROF: Palette = {...BASE};
export const applyTheme = (name?: string) => Object.assign(PROF, BASE, THEMES[name ?? 'yellow'] ?? {});

export const FONT = {
	display: "'Anton', 'Impact', sans-serif",
	sans: "'Space Grotesk', 'Helvetica Neue', sans-serif",
	hand: "'Caveat Brush', 'Kalam', cursive",
	type: "'Special Elite', 'Courier New', monospace",
} as const;

/** Colour names used in scripts -> hex. Unknown strings are passed through (e.g. "#fff"). */
export const col = (c?: string): string => {
	if (!c) return PROF.ink;
	return (PROF as Record<string, string>)[c] ?? c;
};
