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
import p001 from '../episodes/p001-phantom-vibration.json';
import p002 from '../episodes/p002-liking-gap.json';
import p003 from '../episodes/p003-being-stared-at.json';
import p004 from '../episodes/p004-negativity-bias.json';
import p005 from '../episodes/p005-future-self.json';
import p006 from '../episodes/p006-uncertainty.json';
import p007 from '../episodes/p007-brain-rot.json';
import p008 from '../episodes/p008-doomscrolling.json';
import p009 from '../episodes/p009-ai-loneliness.json';
import p010 from '../episodes/p010-bedtime-procrastination.json';
import p011 from '../episodes/p011-open-tabs.json';
import p012 from '../episodes/p012-willpower-battery.json';
import p013 from '../episodes/p013-venting-anger.json';
import p014 from '../episodes/p014-dunning-kruger.json';
import p015 from '../episodes/p015-money-happiness.json';
import p016 from '../episodes/p016-positive-thinking.json';
import p017 from '../episodes/p017-tickle-showcase.json';

/** Every episode in episodes/ must be listed here to show up in Remotion Studio. */
export const EPISODES: Episode[] = [s001 as Episode, s002 as Episode, s003 as Episode, ep001 as unknown as Episode, ep002 as unknown as Episode, ep003 as unknown as Episode, ep004 as unknown as Episode, ep005 as unknown as Episode, ep006 as unknown as Episode, p001 as unknown as Episode, p002 as unknown as Episode, p003 as unknown as Episode, p004 as unknown as Episode, p005 as unknown as Episode, p006 as unknown as Episode, p007 as unknown as Episode, p008 as unknown as Episode, p009 as unknown as Episode, p010 as unknown as Episode, p011 as unknown as Episode, p012 as unknown as Episode, p013 as unknown as Episode, p014 as unknown as Episode, p015 as unknown as Episode, p016 as unknown as Episode, p017 as unknown as Episode];

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
