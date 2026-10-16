import {CalculateMetadataFunction, staticFile} from 'remotion';
import {getEpisode, getTone} from './episodes';
import type {EpisodeProps, Manifest, TimedScene, VoiceScene, Word} from './types';

export const FPS = 30;
const LEAD = 0.12; // seconds of picture before each line starts
const TAIL_LAST = 0.5; // hold after the final line

/** Rough timings so the Studio still works before the voice-over is generated. */
const placeholderVoice = (id: string, say: string): VoiceScene => {
	const words = say.replace(/\[([^|\]]+)\|[^\]]+\]/g, '$1').split(/\s+/).filter(Boolean);
	const words2: Word[] = words.map((w, i) => ({t: w.replace(/\*/g, ''), s: i * 0.36, e: (i + 1) * 0.36, em: w.includes('*')}));
	return {id, file: '', duration: words.length * 0.36, words: words2, env: ''};
};

export const buildTimeline = (episodeId: string, manifest: Manifest | null): TimedScene[] => {
	const episode = getEpisode(episodeId);
	let from = 0;
	return episode.scenes.map((def, i) => {
		const voice = manifest?.scenes.find((s) => s.id === def.id) ?? null;
		const v = voice ?? placeholderVoice(def.id, def.say);
		const isLast = i === episode.scenes.length - 1;
		const lead = i === 0 ? 0 : LEAD;
		const hold = def.hold ?? (isLast ? TAIL_LAST : getTone(def.tone ?? episode.tone).pause);
		const minSeconds = def.visual.minSeconds ?? 1.2;
		const durationInFrames = Math.ceil(Math.max(minSeconds, lead + v.duration + hold) * FPS);
		const scene: TimedScene = {def, voice: v, from, durationInFrames, lead: Math.round(lead * FPS)};
		from += durationInFrames;
		return scene;
	});
};

export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeProps> = async ({props}) => {
	const episode = getEpisode(props.episodeId);
	let manifest: Manifest | null = null;
	try {
		const res = await fetch(staticFile(`voice/${episode.id}/manifest.json`));
		if (res.ok) manifest = await res.json();
	} catch {
		manifest = null;
	}
	const timeline = buildTimeline(episode.id, manifest);
	const total = timeline.reduce((sum, s) => sum + s.durationInFrames, 0);
	const vertical = episode.format === 'short';
	return {
		durationInFrames: total,
		fps: FPS,
		width: vertical ? 1080 : 1920,
		height: vertical ? 1920 : 1080,
		props: {...props, timeline},
	};
};
