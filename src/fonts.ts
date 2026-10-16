import {continueRender, delayRender, staticFile} from 'remotion';

/** Handwritten fonts bundled in public/fonts (free for commercial use, see LICENSE.md there). */
export const HAND = 'Kalam';
export const MARKER = 'Permanent Marker';
export const TYPE = 'Special Elite'; // typewriter: specimen cards, figure labels

const load = (family: string, file: string, weight: string) => {
	const handle = delayRender(`Loading font ${family} ${weight}`);
	const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight});
	face
		.load()
		.then(() => {
			document.fonts.add(face);
			continueRender(handle);
		})
		.catch((err) => {
			console.error(`Font ${family} failed to load`, err);
			continueRender(handle);
		});
};

if (typeof document !== 'undefined') {
	load(HAND, 'fonts/Kalam-Regular.woff2', '400');
	load(HAND, 'fonts/Kalam-Bold.woff2', '700');
	load(MARKER, 'fonts/PermanentMarker.woff2', '400');
	load(TYPE, 'fonts/SpecialElite.woff2', '400');
}
