import React from 'react';
import {useCurrentFrame} from 'remotion';
import type {Box} from '../scenes/stage';
import {LINE, PAPER_LIGHT as PAPER, PENCIL} from '../theme';
import {P} from './ink';

export type SettingName = 'room' | 'street' | 'rooftop' | 'park' | 'blank';

const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<P d="M-120 0 Q-130 -30 -95 -38 Q-90 -75 -45 -70 Q-25 -105 20 -85 Q60 -100 70 -60 Q110 -60 110 -25 Q130 -10 120 0Z" fill={PAPER} strokeWidth={LINE * 0.7} />
		<P d="M-160 0 L170 0" strokeWidth={LINE * 0.6} />
	</g>
);

/** Distant city in light pencil. Deterministic pseudo-random building heights. */
const Skyline: React.FC<{box: Box; base: number; scale?: number}> = ({box, base, scale = 1}) => {
	const out: React.ReactNode[] = [];
	let x = box.x + box.w * 0.02;
	let i = 0;
	while (x < box.x + box.w) {
		const w = (55 + ((i * 37) % 50)) * box.u * scale;
		const h = (120 + ((i * 89) % 260)) * box.u * scale;
		out.push(
			<g key={i}>
				<P d={`M${x} ${base} L${x} ${base - h} L${x + w} ${base - h} L${x + w} ${base}`} fill={PAPER} stroke={PENCIL} strokeWidth={LINE * 0.6} />
				{i % 3 === 0 && <P d={`M${x + w / 2} ${base - h} L${x + w / 2} ${base - h - 40 * box.u * scale}`} stroke={PENCIL} strokeWidth={LINE * 0.6} />}
				{Array.from({length: Math.floor(h / (34 * box.u * scale))}, (_, r) => (
					<P key={r} d={`M${x + w * 0.3} ${base - h + (18 + r * 34) * box.u * scale} L${x + w * 0.42} ${base - h + (18 + r * 34) * box.u * scale}`} stroke={PENCIL} strokeWidth={LINE * 0.5} />
				))}
			</g>,
		);
		x += w + ((i * 13) % 20) * box.u;
		i++;
	}
	return <g>{out}</g>;
};

/** The backdrop of a scene, drawn in screen pixels inside `box`. */
export const Setting: React.FC<{name: SettingName; box: Box}> = ({name, box}) => {
	const frame = useCurrentFrame();
	const {x, w, ground, u} = box;
	const drift = frame * 0.25;
	const clouds = (
		<>
			<Cloud x={x + w * 0.22 + drift} y={box.y + box.h * 0.16} s={u * 0.9} />
			<Cloud x={x + w * 0.8 - drift * 0.6} y={box.y + box.h * 0.27} s={u * 0.7} />
		</>
	);
	switch (name) {
		case 'room':
			return (
				<g>
					<P d={`M${x} ${ground} L${x + w} ${ground}`} />
					{Array.from({length: 6}, (_, i) => (
						<P key={i} d={`M${x + w * (0.08 + i * 0.17)} ${ground + 30 * u} L${x + w * (0.12 + i * 0.17)} ${ground + 30 * u}`} stroke={PENCIL} strokeWidth={LINE * 0.6} />
					))}
				</g>
			);
		case 'street':
			return (
				<g>
					{clouds}
					<Skyline box={box} base={ground} scale={1.1} />
					<P d={`M${x} ${ground} L${x + w} ${ground}`} />
					<P d={`M${x} ${ground + 50 * u} L${x + w} ${ground + 50 * u}`} stroke={PENCIL} strokeWidth={LINE * 0.6} />
				</g>
			);
		case 'park':
			return (
				<g>
					{clouds}
					<P d={`M${x} ${ground} L${x + w} ${ground}`} />
					{Array.from({length: 7}, (_, i) => {
						const gx = x + w * (0.06 + i * 0.15);
						return <P key={i} d={`M${gx} ${ground} l6 -18 l6 18 l6 -14 l5 14`} strokeWidth={LINE * 0.6} />;
					})}
				</g>
			);
		case 'rooftop': {
			// a brick ledge in the foreground (its top is the floor line); the city is far below, to the right
			const edge = x + w * 0.68;
			const face = Math.min(box.y + box.h, ground + 170 * u);
			const row = 34 * u;
			const brick = 78 * u;
			const bricks: React.ReactNode[] = [];
			for (let r = 0, yy = ground + 22 * u; yy < face - 4; r++, yy += row) {
				bricks.push(<P key={`r${r}`} d={`M${x} ${yy} L${edge} ${yy}`} strokeWidth={LINE * 0.55} />);
				for (let bx = x + (r % 2 ? brick / 2 : 0); bx < edge - 10; bx += brick) {
					bricks.push(<P key={`b${r}-${bx}`} d={`M${bx} ${yy} L${bx} ${Math.min(face, yy + row)}`} strokeWidth={LINE * 0.5} />);
				}
			}
			return (
				<g>
					{clouds}
					<Skyline box={{...box, x: x + w * 0.62, w: w * 0.4}} base={ground + 150 * u} scale={0.8} />
					<P d={`M${x} ${ground} L${edge + 14 * u} ${ground} L${edge + 14 * u} ${ground + 22 * u} L${x} ${ground + 22 * u}`} fill={PAPER} />
					<P d={`M${x} ${ground + 22 * u} L${edge} ${ground + 22 * u} L${edge} ${face} L${x} ${face}`} fill={PAPER} />
					<rect x={x} y={ground + 22 * u} width={edge - x} height={face - ground - 22 * u} fill="url(#hatch-light)" />
					{bricks}
				</g>
			);
		}
		default:
			return null;
	}
};
