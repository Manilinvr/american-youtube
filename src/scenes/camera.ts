import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrame, useScene} from '../context';

/**
 * Camera for a scene: a slow drift between `zoom[0]` and `zoom[1]` over the scene, plus keyframed
 * moves on cue words, e.g. push in on a face at the punchline and pull back out:
 *   "camera": {"zoom": [1, 1.04], "keys": [{"at": "pen", "zoom": 1.6, "focus": [0.3, 0.35]},
 *                                          {"at": "perfectly", "zoom": 1}]}
 * `focus` = point to centre on, as [x, y] fractions of the frame. Moves ease in and out over `secs` (default 1.3).
 */
export type CameraKey = {at: string | number; zoom?: number; focus?: [number, number]; secs?: number};
export type CameraSpec = {zoom?: [number, number]; focus?: [number, number]; keys?: CameraKey[]};

const ease = Easing.inOut(Easing.cubic);

export const useCamera = (spec: CameraSpec | undefined, defaultFocus: [number, number], drift: [number, number] = [1, 1.05]): React.CSSProperties => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {voice, lead, durationInFrames} = useScene();
	const [z0, z1] = spec?.zoom ?? drift;
	let z = interpolate(frame, [0, durationInFrames], [z0, z1]);
	let [fx, fy] = spec?.focus ?? defaultFocus;
	for (const key of spec?.keys ?? []) {
		const at = cueFrame(voice, lead, fps, key.at, Infinity);
		if (!Number.isFinite(at)) continue;
		const t = interpolate(frame, [at, at + (key.secs ?? 1.3) * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
		if (key.zoom !== undefined) z += (key.zoom - z) * t;
		if (key.focus) {
			fx += (key.focus[0] - fx) * t;
			fy += (key.focus[1] - fy) * t;
		}
	}
	z = Math.max(1, z);
	// centre on the focus point, but never show past the edges of the drawing
	const halfW = width / (2 * z);
	const halfH = height / (2 * z);
	const cx = Math.min(width - halfW, Math.max(halfW, fx * width));
	const cy = Math.min(height - halfH, Math.max(halfH, fy * height));
	return {transformOrigin: '0 0', transform: `translate(${width / 2}px, ${height / 2}px) scale(${z}) translate(${-cx}px, ${-cy}px)`};
};
