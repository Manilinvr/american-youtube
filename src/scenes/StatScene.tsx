import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {useEpisode, useScene} from '../context';
import {Backdrop} from '../components/Backdrop';
import {Icon} from '../components/Icons';
import {Sfx} from '../components/Sfx';
import {BODY, DISPLAY} from '../fonts';
import type {Visual} from '../types';
import {useStage} from './stage';

/** Which grid cells light up: start in the middle so small values read clearly, then fill outward. */
const litCells = (n: number): number[] => {
	const all = Array.from({length: 100}, (_, i) => i);
	const dist = (i: number) => Math.hypot((i % 10) - 4.5, Math.floor(i / 10) - 4.5);
	return all.sort((a, b) => dist(a) - dist(b) || a - b).slice(0, n);
};

/**
 * A big number that counts up, plus a 10x10 grid where `value` cells light up ("4 out of 100").
 * visual: { type: "stat", value, suffix, label, icon, grid (default true when suffix is "%") }
 * The count starts when the narrator says the first word containing a digit.
 */
export const StatScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {palette} = useEpisode();
	const {voice, lead} = useScene();
	const {width, height, vertical} = useStage();
	const value: number = visual.value ?? 0;
	const numWord = voice.words.find((w) => /\d/.test(w.t));
	const start = numWord ? lead + Math.round(numWord.s * fps) : lead;
	const countDur = Math.round(fps * 0.7);
	const shown = Math.round(
		interpolate(frame, [start, start + countDur], [0, value], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}),
	);
	const done = start + countDur;
	const litOrder = React.useMemo(() => litCells(Math.min(100, Math.round(value))), [value]);
	const showGrid = visual.grid ?? visual.suffix === '%';

	const cell = vertical ? 58 : 52;
	const gap = vertical ? 10 : 8;
	const gridSize = cell * 10 + gap * 9;
	const gridLeft = vertical ? (width - gridSize) / 2 : width * 0.55;
	const gridTop = vertical ? height * 0.29 : (height - gridSize) / 2 - 20;
	const numX = vertical ? width / 2 : width * 0.27;
	const numTop = vertical ? height * 0.08 : height * 0.22;

	return (
		<AbsoluteFill>
			<Backdrop setting="burst" />
			<div
				style={{
					position: 'absolute',
					left: numX - 500,
					width: 1000,
					top: numTop,
					textAlign: 'center',
					fontFamily: DISPLAY,
					fontSize: vertical ? 300 : 280,
					lineHeight: 1,
					color: palette.accent,
					WebkitTextStroke: `28px ${palette.ink}`,
					paintOrder: 'stroke fill',
					textShadow: `0 18px 0 ${palette.ink}`,
					transform: `scale(${interpolate(frame, [done, done + 4, done + 12], [1, 1.25, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
				}}
			>
				{shown}
				{visual.suffix ?? ''}
			</div>
			{visual.label && (
				<div
					style={{
						position: 'absolute',
						left: numX - 480,
						width: 960,
						top: numTop + (vertical ? 300 : 290),
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 20,
						fontFamily: BODY,
						fontWeight: 700,
						fontSize: vertical ? 64 : 56,
						color: palette.text,
						textShadow: `0 5px 0 ${palette.ink}`,
						opacity: interpolate(frame, [start, start + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					}}
				>
					{visual.icon && <Icon name={visual.icon} size={vertical ? 90 : 80} />}
					{visual.label}
				</div>
			)}
			{showGrid && (
				<svg style={{position: 'absolute', left: gridLeft, top: gridTop, overflow: 'visible'}} width={gridSize} height={gridSize}>
					{Array.from({length: 100}, (_, i) => {
						const row = Math.floor(i / 10);
						const col = i % 10;
						const appear = spring({frame: frame - (row + col) * 0.8, fps, config: {damping: 12, stiffness: 200}});
						const litIdx = litOrder.indexOf(i);
						const litAt = start + (litIdx / Math.max(1, litOrder.length)) * countDur;
						const lit = litIdx >= 0 ? spring({frame: frame - litAt, fps, config: {damping: 9, stiffness: 260}}) : 0;
						const x = col * (cell + gap);
						const y = row * (cell + gap);
						return (
							<g key={i} transform={`translate(${x + cell / 2} ${y + cell / 2}) scale(${appear * (1 + lit * 0.25)})`}>
								<rect x={-cell / 2} y={-cell / 2} width={cell} height={cell} rx={12} fill={lit > 0.5 ? '#FF4D1A' : palette.soft} stroke={palette.ink} strokeWidth={4} opacity={lit > 0.5 ? 1 : 0.85} />
								{lit > 0.5 && <g transform={`translate(${-cell * 0.38} ${-cell * 0.4}) scale(${cell / 130})`}>{<Icon name={visual.icon ?? 'star'} size={100} />}</g>}
							</g>
						);
					})}
				</svg>
			)}
			<Sfx name="ding" at={done} volume={0.3} />
		</AbsoluteFill>
	);
};
