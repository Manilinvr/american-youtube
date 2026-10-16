import {createContext, useContext} from 'react';
import {Easing} from 'remotion';
import type {Tone} from './palette';

/** One illustration panel on the page (page units; the page is 1080 wide). */
export type PanelDef = {
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	tone?: Tone;
	/** Illustration from src/textbook/art (bedroom, loop, neuron, ...). */
	art: string;
	/** Figure caption printed in the panel's corner, e.g. "fig. 1 — a sleeper, 1:07 a.m." */
	fig?: string;
	figPos?: 'bl' | 'br' | 'tl' | 'tr';
	/** Anything the illustration needs (labels, states...). */
	props?: Record<string, any>;
};

/** A line that runs across the gutters, over the panels (e.g. a thought thread becoming an axon). */
export type ThreadDef = {points: [number, number][]; at: string; secs?: number; color?: string; width?: number};

/** The whole illustrated spread a short or episode lives on; the camera travels across it. */
export type PageDef = {
	width: number;
	height: number;
	plate?: string;
	title?: string;
	subtitle?: string;
	/** Plate caption printed under the panels (one string per line). */
	caption?: string[];
	panels: PanelDef[];
	threads?: ThreadDef[];
};

/**
 * Camera key for a "page" scene. `at` is a cue (word / "word#2" / seconds, default: scene start).
 *  - panel: frame one panel (or several: their bounding box) so it fills the picture above the captions
 *  - zoom / focus: override the zoom, and the point to centre ([x, y] as fractions of the framed box)
 *  - page: true -> pull back to the whole page, sitting on the desk
 */
export type BookCamKey = {at?: string | number; panel?: string | string[]; zoom?: number; focus?: [number, number]; secs?: number; page?: boolean; max?: number};

/**
 * Camera state: world point (wx, wy) is drawn at screen point (sx, sy) with zoom z.
 * (bx, by, bw, bh) is the lit area: everything else on the page sits in shadow (dim 0..1), like a reading lamp over the plate.
 */
export type Cam = {wx: number; wy: number; z: number; sx: number; sy: number; bx: number; by: number; bw: number; bh: number; dim: number};

export type ArtInfo = {
	/** Absolute frame of the episode. */
	f: number;
	fps: number;
	/** Absolute frame of a named event (scene "events" or "start:<scene>"), Infinity if it never happens. */
	ev: (name: string) => number;
	w: number;
	h: number;
	panel: PanelDef;
	cam: Cam;
	/** Frame when the panel starts drawing itself on. */
	show: number;
};

export const ArtCtx = createContext<ArtInfo | null>(null);
export const useArt = (): ArtInfo => {
	const a = useContext(ArtCtx);
	if (!a) throw new Error('useArt outside a textbook panel');
	return a;
};

const smoothEase = Easing.inOut(Easing.cubic);

/** Frames since event `name` (+delay). Negative before it, -Infinity if it never happens. */
export const since = (a: ArtInfo, name: string, delay = 0) => a.f - a.ev(name) - delay;

/** 0 -> 1 over `dur` frames starting `delay` frames after event `name`. */
export const prog = (a: ArtInfo, name: string, dur = 20, delay = 0, ease = true) => {
	const s = since(a, name, delay);
	if (!Number.isFinite(s)) return s > 0 ? 1 : 0;
	const t = Math.max(0, Math.min(1, s / Math.max(1, dur)));
	return ease ? smoothEase(t) : t;
};

/** Reveal progress of the panel itself, delayed by `delay` frames (staggered drawing). */
export const shown = (a: ArtInfo, delay = 0, dur = 28) => {
	if (!Number.isFinite(a.show)) return 1;
	const t = Math.max(0, Math.min(1, (a.f - a.show - delay) / dur));
	return smoothEase(t);
};

/**
 * Parallax: shifts (and slightly scales) a layer by its depth as the camera moves across the panel.
 * depth < 0 = far away (moves less), > 0 = foreground (moves more).
 */
export const parallax = (a: ArtInfo, depth: number): string => {
	const cx = a.panel.x + a.w / 2;
	const cy = a.panel.y + a.h / 2;
	const dx = (a.cam.wx - cx) * depth;
	const dy = (a.cam.wy - cy) * depth * 0.6;
	const s = 1 + depth * (a.cam.z - 1.5) * 0.25;
	return `translate(${a.w / 2 - dx} ${a.h / 2 - dy}) scale(${s}) translate(${-a.w / 2} ${-a.h / 2})`;
};

/** Gentle loop 0..1..0 with period in seconds (breathing, swaying). */
export const wave = (a: ArtInfo, period: number, phase = 0) => 0.5 - 0.5 * Math.cos(((a.f / a.fps) / period + phase) * Math.PI * 2);

/** Blink: true for a few frames every few seconds (deterministic). */
export const blinking = (a: ArtInfo, every = 3.4, offset = 0) => {
	const cycle = Math.round(every * a.fps);
	const k = (a.f + Math.round(offset * a.fps)) % cycle;
	return k >= cycle - 4; // never on frame 0: the opening frame shows open eyes
};

/**
 * Keyframed value over the frames since an event: track(since(a, 'wake'), [[0, 0], [6, 1], [30, 0.4]]).
 * Before the first key it holds the first value, after the last it holds the last.
 */
export const track = (s: number, keys: [number, number][]): number => {
	if (!Number.isFinite(s)) return s > 0 ? keys[keys.length - 1][1] : keys[0][1];
	if (s <= keys[0][0]) return keys[0][1];
	for (let i = 1; i < keys.length; i++) {
		const [f0, v0] = keys[i - 1];
		const [f1, v1] = keys[i];
		if (s <= f1) return v0 + (v1 - v0) * smoothEase((s - f0) / Math.max(1e-6, f1 - f0));
	}
	return keys[keys.length - 1][1];
};

/**
 * A pose that changes on events: starts at `initial`, and each stage eases toward its value
 * when its event fires (stages in the order they happen). Values are number arrays (look, tilt, ...).
 */
export const stages = (a: ArtInfo, initial: number[], list: {at: string; v: number[]; dur?: number; delay?: number}[]): number[] => {
	let v = [...initial];
	for (const st of list) {
		const t = prog(a, st.at, st.dur ?? 12, st.delay ?? 0);
		if (t <= 0) continue;
		v = v.map((x, i) => x + ((st.v[i] ?? x) - x) * t);
	}
	return v;
};
