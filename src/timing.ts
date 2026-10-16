import {CalculateMetadataFunction, staticFile} from 'remotion';
import {getEpisode, getTone} from './episodes';
import type {EpisodeProps, Manifest, TimedScene, Transition, VoiceScene, Word} from './types';

export const FPS = 30;
const LEAD = 0.12; // seconds of picture before each line starts
const TAIL_LAST = 0.5; // hold after the final line

/** Rough timings so the Studio still works before the voice-over is generated. */
const placeholderVoice = (id: string, say: string): VoiceScene => {
	const words = say.replace(/\[([^|\]]+)\|[^\]]+\]/g, '$1').split(/\s+/).filter(Boolean);
	const words2: Word[] = words.map((w, i) => ({t: w.replace(/\*/g, ''), s: i * 0.36, e: (i + 1) * 0.36, em: w.includes('*')}));
	return {id, file: '', duration: words.length * 0.36, words: words2, env: ''};
};

const TRANSITION_FRAMES: Record<Transition, number> = {fade: 14, zoom: 14, black: 24, cut: 0};

/**
 * Scene timing. Scenes overlap by their transition, so a scene's picture starts before the previous
 * line has fully ended; each line starts once the new picture has mostly faded in.
 */
export const buildTimeline = (episodeId: string, manifest: Manifest | null): TimedScene[] => {
	const episode = getEpisode(episodeId);
	const n = episode.scenes.length;
	const trans = episode.scenes.map((def, i): {type: Transition; frames: number} => {
		const type: Transition = i === 0 ? 'cut' : def.transition ?? 'fade';
		return {type, frames: TRANSITION_FRAMES[type]};
	});
	let from = 0;
	let prevEnd = 0;
	return episode.scenes.map((def, i) => {
		const voice = manifest?.scenes.find((s) => s.id === def.id) ?? null;
		const v = voice ?? placeholderVoice(def.id, def.say);
		const isLast = i === n - 1;
		const transIn = trans[i];
		const transOut = isLast ? {type: 'black' as Transition, frames: 18} : trans[i + 1];
		const lead = i === 0 ? 0 : Math.round(transIn.frames * 0.7) + Math.round(LEAD * FPS);
		const tone = getTone(def.tone ?? episode.tone);
		// leave room for the outgoing transition after the last word
		const hold = Math.max(def.hold ?? (isLast ? TAIL_LAST : tone.pause), (transOut.frames * 0.6) / FPS);
		const minSeconds = def.visual.minSeconds ?? 1.2;
		const durationInFrames = Math.ceil(Math.max(minSeconds, lead / FPS + v.duration + hold) * FPS);
		from = i === 0 ? 0 : prevEnd - transIn.frames;
		prevEnd = from + durationInFrames;
		return {def, voice: v, from, durationInFrames, lead, transIn, transOut};
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
	const last = timeline[timeline.length - 1];
	const total = last.from + last.durationInFrames;
	const vertical = episode.format === 'short';
	return {
		durationInFrames: total,
		fps: FPS,
		width: vertical ? 1080 : 1920,
		height: vertical ? 1920 : 1080,
		props: {...props, timeline},
	};
};
