import {useVideoConfig} from 'remotion';

/**
 * A rectangle on screen that a scene is drawn into (the whole frame, or one panel of a split).
 * `ground` is the floor line in px, `u` converts scene units to px (a person is 400 units tall).
 */
export type Box = {x: number; y: number; w: number; h: number; ground: number; u: number};

export const makeBox = (x: number, y: number, w: number, h: number, groundFrac: number): Box => ({
	x,
	y,
	w,
	h,
	ground: y + h * groundFrac,
	u: Math.min(w / (h > w ? 600 : 770), h / 800),
});

/** Full-frame stage. In 9:16 the floor sits at 68% height so captions fit underneath, above the Shorts UI. */
export const useFullBox = (): Box => {
	const {width, height} = useVideoConfig();
	return height > width ? makeBox(0, 0, width, height, 0.67) : makeBox(0, 0, width, height, 0.86);
};

/** Where captions go: just under the floor line in 9:16, near the bottom in 16:9. */
export const captionTop = (width: number, height: number) => (height > width ? height * 0.705 : height * 0.865);

export const useStage = () => {
	const {width, height} = useVideoConfig();
	return {width, height, vertical: height > width};
};
