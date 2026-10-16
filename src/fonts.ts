import {continueRender, delayRender, staticFile} from 'remotion';

/** Fonts are bundled in public/fonts (SIL OFL) so renders work offline and look identical everywhere. */
export const DISPLAY = 'Luckiest Guy';
export const BODY = 'Fredoka';

const load = (family: string, file: string, weight: string) => {
	const handle = delayRender(`Loading font ${family}`);
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
	load(DISPLAY, 'fonts/LuckiestGuy.woff2', '400');
	load(BODY, 'fonts/Fredoka.woff2', '300 700');
}
