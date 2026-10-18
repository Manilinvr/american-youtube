import type {Episode, Tone} from './types';
import tones from '../config/tones.json';
import s001 from '../episodes/s001-doorway-forgetter.json';
import s002 from '../episodes/s002-last-minute-genius.json';
import s003 from '../episodes/s003-shower-philosopher.json';
import ep001 from '../episodes/ep001-night-thoughts.json';
import ep002 from '../episodes/ep002-liking-gap.json';
import ep003 from '../episodes/ep003-being-stared-at.json';
import ep004 from '../episodes/ep004-negativity-bias.json';
import ep005 from '../episodes/ep005-future-self.json';
import ep006 from '../episodes/ep006-uncertainty.json';
import ep007 from '../episodes/ep007-slow-motion.json';

/** Every episode in episodes/ must be listed here to show up in Remotion Studio. */
export const EPISODES: Episode[] = [s001 as Episode, s002 as Episode, s003 as Episode, ep001 as unknown as Episode, ep002 as unknown as Episode, ep003 as unknown as Episode, ep004 as unknown as Episode, ep005 as unknown as Episode, ep006 as unknown as Episode, ep007 as unknown as Episode];

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
