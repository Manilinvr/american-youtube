import {useVideoConfig} from 'remotion';

/** Shared layout numbers so every scene works in both 9:16 (Shorts) and 16:9 (long videos). */
export const useStage = () => {
	const {width, height} = useVideoConfig();
	const vertical = height > width;
	return {
		width,
		height,
		vertical,
		/** y of the floor line characters stand on. */
		ground: vertical ? height * 0.8 : height * 0.9,
		/** Default character height. */
		charHeight: vertical ? height * 0.46 : height * 0.72,
		/** Horizontal centre of the main character. */
		charX: vertical ? width / 2 : width * 0.3,
	};
};
