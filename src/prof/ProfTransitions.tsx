import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TimedScene} from '../types';
import {easeInOut} from './anim';
import {PROF} from './theme';

const ORDER = ['slab-r', 'flash', 'iris', 'slab-l', 'slab-u', 'iris'];
const CASE_ORDER = ['flash', 'iris', 'flash', 'iris'];
const clampE = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Slab = a yellow band with ink edges sweeping over the cut; iris = ink circle closing and opening; flash = white pop. */
export const ProfTransitions: React.FC<{timeline: TimedScene[]; theme?: string}> = ({timeline, theme}) => {
	const frame = useCurrentFrame();
	const {width: W, height: H} = useVideoConfig();
	const nodes: React.ReactNode[] = [];
	timeline.forEach((s, i) => {
		if (i === 0) return;
		const order = theme === 'case' ? CASE_ORDER : ORDER;
	const kind: string = s.def.visual.enter ?? order[(i - 1) % order.length];
		const b = s.from;
		const a = b - 6;
		const z = b + 8;
		if (frame < a || frame > z) return;
		if (kind.startsWith('slab')) {
			const p = interpolate(frame, [a, z], [0, 1], {...clampE, easing: easeInOut});
			const dir = kind.endsWith('l') ? -1 : 1;
			const vertical = kind.endsWith('u');
			const size = (vertical ? H : W) * 1.25;
			const pos = (p - 0.5) * 2 * ((vertical ? H : W) * 0.95);
			nodes.push(
				<AbsoluteFill key={i} style={{overflow: 'hidden', pointerEvents: 'none'}}>
					<div style={{position: 'absolute', left: vertical ? -W * 0.1 : '50%', top: vertical ? '50%' : -H * 0.1, width: vertical ? W * 1.2 : size, height: vertical ? size : H * 1.2, transform: vertical ? `translateY(${-50 - 0}%) translateY(${-dir * -pos}px) skewY(-8deg)` : `translateX(-50%) translateX(${dir * pos}px) skewX(-8deg)`, background: PROF.accent, borderLeft: vertical ? undefined : `18px solid ${PROF.ink}`, borderRight: vertical ? undefined : `18px solid ${PROF.ink}`, borderTop: vertical ? `18px solid ${PROF.ink}` : undefined, borderBottom: vertical ? `18px solid ${PROF.ink}` : undefined}} />
				</AbsoluteFill>,
			);
		} else if (kind === 'flash') {
			const o = interpolate(frame, [a + 2, b, z], [0, 1, 0], clampE);
			nodes.push(<AbsoluteFill key={i} style={{background: '#fff', opacity: o, pointerEvents: 'none'}} />);
		} else {
			// iris: ink disc shrinks to nothing over the old scene, then the new scene is revealed by an opening hole
			const r = interpolate(frame, [a, b, z], [1, 0, 1], {...clampE, easing: easeInOut}) * Math.hypot(W, H) * 0.62;
			const closing = frame < b;
			nodes.push(
				<AbsoluteFill key={i} style={{pointerEvents: 'none', background: PROF.ink, clipPath: undefined, WebkitMaskImage: `radial-gradient(circle at 50% 45%, transparent ${r}px, #000 ${r + 1}px)`, maskImage: `radial-gradient(circle at 50% 45%, transparent ${r}px, #000 ${r + 1}px)`, opacity: closing || true ? 1 : 1}} />,
			);
		}
	});
	return <>{nodes}</>;
};
