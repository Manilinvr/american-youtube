/**
 * Art direction tokens for the illustrated-textbook style ("vintage psychology atlas").
 * The nine base colours are the locked palette; the rest are mixes of them for depth and night scenes.
 * Rule: nothing saturated, no gradients except soft light and age, no pure black or white.
 */
export const BOOK = {
	paper: '#E9DFC9', // aged ivory: the page
	parchment: '#F3EBDD', // light panels, highlights
	ink: '#292722', // outlines, text
	brown: '#806348',
	ochre: '#C49A59',
	terracotta: '#B96F50',
	blue: '#849BA2', // desaturated blue-grey
	olive: '#929078',
	black: '#242321', // soft black: dark panels, the desk under the page

	// mixes of the above
	paperShade: '#DCCFB4', // shadowed paper, page edges
	skin: '#E0C6A0', // muted warm skin (ochre + parchment)
	hair: '#5C4636', // brown + ink
	wood: '#7A5D44',
	woodDark: '#5E4735',
	night: '#6B7C81', // blue-grey wall at night
	nightDeep: '#4A575C', // night sky, deep shadow
	nightFloor: '#54453A',
	glow: '#E6C98C', // lamp light / impulses (ochre lifted toward parchment)
	moon: '#EADBB4',
} as const;

/** Panel tones: background + text colour that reads on it. */
export const TONES = {
	cream: {bg: BOOK.parchment, text: BOOK.ink, line: BOOK.ink},
	paper: {bg: '#EDE3CE', text: BOOK.ink, line: BOOK.ink},
	parchment: {bg: '#F0E6D2', text: BOOK.ink, line: BOOK.ink},
	ochre: {bg: '#E7D3AE', text: BOOK.ink, line: BOOK.ink},
	night: {bg: BOOK.night, text: BOOK.parchment, line: BOOK.ink},
	dark: {bg: BOOK.ink, text: BOOK.parchment, line: BOOK.black},
} as const;
export type Tone = keyof typeof TONES;

/** Ink line widths in page units (the page is 1080 units wide). */
export const W = {hair: 1, fine: 1.5, line: 2.2, bold: 3.2, border: 2.6};
