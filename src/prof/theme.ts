/** "Professor" style: graphite ink on warm paper, ONE accent (marker yellow). No other colours. */
export const PROF = {
	paper: '#EEE9DE',
	paper2: '#E2DCCD',
	white: '#FBFAF6',
	ink: '#121212',
	graphite: '#2B2B2A',
	mid: '#8D8B85',
	soft: '#C9C4B8',
	accent: '#FFC51A',
	accentDeep: '#E8A800',
} as const;

export const FONT = {
	display: "'Anton', 'Impact', sans-serif",
	sans: "'Space Grotesk', 'Helvetica Neue', sans-serif",
	hand: "'Caveat Brush', 'Kalam', cursive",
} as const;

/** Colour names used in scripts -> hex. Unknown strings are passed through (e.g. "#fff"). */
export const col = (c?: string): string => {
	if (!c) return PROF.ink;
	return (PROF as Record<string, string>)[c] ?? c;
};
