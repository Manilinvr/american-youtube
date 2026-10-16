import type {Episode, Tone} from './types';
import tones from '../config/tones.json';
import s001 from '../episodes/s001-doorway-forgetter.json';
import s002 from '../episodes/s002-last-minute-genius.json';

/** Every episode in episodes/ must be listed here to show up in Remotion Studio. */
export const EPISODES: Episode[] = [s001 as Episode, s002 as Episode];

export const getEpisode = (id: string): Episode => {
	const ep = EPISODES.find((e) => e.id === id);
	if (!ep) throw new Error(`Episode "${id}" is not registered in src/episodes.ts`);
	return ep;
};

export const getTone = (name: string): Tone => {
	const tone = (tones as unknown as Record<string, Tone>)[name];
	if (!tone) throw new Error(`Unknown tone "${name}" (see config/tones.json)`);
	return tone;
};
