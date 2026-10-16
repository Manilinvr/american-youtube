import {createContext, useContext} from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CharacterSpec, Palette, VoiceScene} from './types';

export type EpisodeInfo = {palette: Palette; energy: number; character: CharacterSpec; vertical: boolean};
export const EpisodeCtx = createContext<EpisodeInfo | null>(null);

export type SceneInfo = {voice: VoiceScene; lead: number; durationInFrames: number};
export const SceneCtx = createContext<SceneInfo | null>(null);

export const useEpisode = (): EpisodeInfo => {
	const ctx = useContext(EpisodeCtx);
	if (!ctx) throw new Error('useEpisode outside an episode');
	return ctx;
};

export const useScene = (): SceneInfo => {
	const ctx = useContext(SceneCtx);
	if (!ctx) throw new Error('useScene outside a scene');
	return ctx;
};

/** How far the mouth is open right now (0-1), from the voice loudness envelope. */
export const useMouth = (): number => {
	const frame = useCurrentFrame();
	const ctx = useContext(SceneCtx);
	if (!ctx || !ctx.voice.env) return 0;
	const i = frame - ctx.lead;
	const now = Number(ctx.voice.env[i] ?? 0);
	const prev = Number(ctx.voice.env[i - 1] ?? 0);
	return (now * 0.7 + prev * 0.3) / 9;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9%]/g, '');

/** Scene-relative frame at which the narrator starts saying the word beginning with `cue`. */
export const useCueFrame = (cue: string | undefined, fallback: number): number => {
	const {fps} = useVideoConfig();
	const {voice, lead} = useScene();
	if (!cue) return fallback;
	const word = voice.words.find((w) => norm(w.t).startsWith(norm(cue)));
	return word ? lead + Math.round(word.s * fps) : fallback;
};

/** Springy 0 -> 1 entrance starting at `delay` frames; stronger overshoot for energetic moods. */
export const usePop = (delay = 0, stiffness = 180): number => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {energy} = useEpisode();
	return spring({frame: frame - delay, fps, config: {damping: 14 / Math.max(0.6, energy), stiffness, mass: 0.8}});
};
