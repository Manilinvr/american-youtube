import {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrame, useScene} from '../context';

export type Cam = {z: number; fx: number; fy: number; dx: number; dy: number};
export type ShotInfo = {from: number; cam: Cam; index: number};
export const ShotCtx = createContext<ShotInfo>({from: 0, cam: {z: 1, fx: 0, fy: 0, dx: 0, dy: 0}, index: 0});

/** Frame inside the scene (the shot's own frame counter + where the shot starts). */
export const useSceneFrame = () => useCurrentFrame() + useContext(ShotCtx).from;

/** Cue -> scene frame. Accepts a word ("buzzes"), "word#2", seconds (1.5), or an offset ("phone+0.3"). */
export const useResolve = () => {
	const {fps} = useVideoConfig();
	const {voice, lead} = useScene();
	const shot = useContext(ShotCtx);
	return (cue: string | number | undefined, fallback = shot.from): number => resolveCue(voice, lead, fps, cue, fallback);
};

export const resolveCue = (voice: Parameters<typeof cueFrame>[0], lead: number, fps: number, cue: string | number | undefined, fallback: number): number => {
	if (cue === undefined || cue === null || cue === '' || cue === 'shot') return fallback;
	if (cue === 'start') return 0;
	if (typeof cue === 'number') return cueFrame(voice, lead, fps, cue, fallback);
	const m = cue.match(/^(.+?)([+-]\d*\.?\d+)$/);
	const word = m ? m[1] : cue;
	const off = m ? Math.round(Number(m[2]) * fps) : 0;
	const f = cueFrame(voice, lead, fps, word, Infinity);
	return Number.isFinite(f) ? f + off : fallback;
};
