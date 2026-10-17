import {Easing, interpolate, spring} from 'remotion';

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const easeOut = Easing.out(Easing.cubic);
export const easeInOut = Easing.inOut(Easing.cubic);
export const easeOutBack = Easing.out(Easing.back(1.6));

/** Progress 0..1 of `t` between 0 and `dur` frames. */
export const prog = (t: number, dur: number, ease: (n: number) => number = easeOut) => ease(clamp(t / Math.max(1, dur)));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Deterministic pseudo random in [0, 1). */
export const rnd = (n: number) => {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
};

/** Smooth deterministic noise in about [-1, 1]. */
export const noise = (u: number, seed = 0) =>
	(Math.sin(u * 0.047 + seed) * 0.5 + Math.sin(u * 0.113 + seed * 2.1 + 1.3) * 0.32 + Math.sin(u * 0.231 + seed * 3.7 + 2.9) * 0.22 + Math.sin(u * 0.517 + seed * 1.3) * 0.12) / 1.06;

export type EnterName = 'pop' | 'slam' | 'up' | 'down' | 'left' | 'right' | 'fade' | 'wipe' | 'drop' | 'spin' | 'none';

/** Entrance animation: style for a layer `t` frames after it appears. */
export const enterStyle = (name: EnterName | undefined, t: number, fps: number, W: number, H: number): React.CSSProperties => {
	const sp = (damping: number, stiffness: number, mass = 0.7) => spring({frame: t, fps, config: {damping, stiffness, mass}});
	switch (name ?? 'pop') {
		case 'none':
			return {};
		case 'pop': {
			const s = sp(11, 230);
			return {opacity: clamp(t / 3), transform: `scale(${0.25 + 0.75 * s}) rotate(${(1 - s) * -9}deg)`};
		}
		case 'slam': {
			const p = prog(t, 6);
			return {opacity: clamp(t / 2), transform: `scale(${1 + (1 - p) * 1.1})`};
		}
		case 'up':
			return {opacity: clamp(t / 5), transform: `translateY(${(1 - sp(15, 150)) * 150}px)`};
		case 'down':
			return {opacity: clamp(t / 5), transform: `translateY(${-(1 - sp(15, 150)) * 150}px)`};
		case 'left':
			return {opacity: clamp(t / 4), transform: `translateX(${-(1 - sp(16, 130)) * W * 0.7}px)`};
		case 'right':
			return {opacity: clamp(t / 4), transform: `translateX(${(1 - sp(16, 130)) * W * 0.7}px)`};
		case 'drop':
			return {opacity: clamp(t / 3), transform: `translateY(${-(1 - sp(8, 110, 0.9)) * H * 0.55}px)`};
		case 'spin': {
			const s = sp(14, 120);
			return {opacity: clamp(t / 3), transform: `rotate(${(1 - s) * -200}deg) scale(${0.2 + 0.8 * s})`};
		}
		case 'wipe':
			return {clipPath: `inset(-20% ${(1 - prog(t, 11)) * 100}% -20% -20%)`};
		case 'fade':
			return {opacity: prog(t, 9, (n) => n)};
	}
};

export const spr = (frame: number, fps: number, damping = 14, stiffness = 160, mass = 0.8) => spring({frame, fps, config: {damping, stiffness, mass}});
export {interpolate};
