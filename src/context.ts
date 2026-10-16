import {createContext, useContext} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {VoiceScene} from './types';

export type EpisodeInfo = {energy: number; vertical: boolean};
export const EpisodeCtx = createContext<EpisodeInfo>({energy: 1, vertical: true});
export const useEpisode = (): EpisodeInfo => useContext(EpisodeCtx);

export type SceneInfo = {voice: VoiceScene; lead: number; durationInFrames: number};
export const SceneCtx = createContext<SceneInfo | null>(null);

export const useScene = (): SceneInfo => {
	const ctx = useContext(SceneCtx);
	if (!ctx) throw new Error('useScene outside a scene');
	return ctx;
};

/** Narrator loudness right now (0-1), from the voice envelope. Lets things pulse with the voice. */
export const useLoudness = (): number => {
	const frame = useCurrentFrame();
	const ctx = useContext(SceneCtx);
	if (!ctx || !ctx.voice.env) return 0;
	const i = frame - ctx.lead;
	return (Number(ctx.voice.env[i] ?? 0) * 0.7 + Number(ctx.voice.env[i - 1] ?? 0) * 0.3) / 9;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9%]/g, '');

/** Scene-relative frame at which the narrator starts saying the word beginning with `cue`. */
export const useCueFrame = (cue: string | number | undefined, fallback: number): number => {
	const {fps} = useVideoConfig();
	const {voice, lead} = useScene();
	return cueFrame(voice, lead, fps, cue, fallback);
};

/**
 * Same as useCueFrame but callable in loops. `cue` may be a word ("door"), a word with an
 * occurrence ("door#2"), or a number of seconds after the line starts (1.5).
 */
export const cueFrame = (voice: VoiceScene, lead: number, fps: number, cue: string | number | undefined, fallback: number): number => {
	if (cue === undefined || cue === null || cue === '') return fallback;
	if (typeof cue === 'number') return lead + Math.round(cue * fps);
	const [word, nth] = cue.split('#');
	const hits = voice.words.filter((w) => norm(w.t).startsWith(norm(word)));
	const hit = hits[(Number(nth) || 1) - 1];
	return hit ? lead + Math.round(hit.s * fps) : fallback;
};

/** Springy 0 -> 1 entrance starting at `delay` frames. */
export const usePop = (delay = 0, stiffness = 180): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {energy} = useEpisode();
	return spring({frame: frame - delay, fps, config: {damping: 14 / Math.max(0.6, energy), stiffness, mass: 0.8}});
};
