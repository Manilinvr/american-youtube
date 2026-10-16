import type {Episode, Mood} from './types';
import moods from '../config/moods.json';
import firefighterShort from '../episodes/firefighter-short.json';

/** Every episode in episodes/ must be listed here to show up in Remotion Studio. */
export const EPISODES: Episode[] = [firefighterShort as Episode];

export const getEpisode = (id: string): Episode => {
	const ep = EPISODES.find((e) => e.id === id);
	if (!ep) throw new Error(`Episode "${id}" is not registered in src/episodes.ts`);
	return ep;
};

export const getMood = (name: string): Mood => {
	const mood = (moods as unknown as Record<string, Mood>)[name];
	if (!mood) throw new Error(`Unknown mood "${name}" (see config/moods.json)`);
	return mood;
};
