import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useCueFrame, useEpisode, useScene} from '../context';
import {Backdrop} from '../components/Backdrop';
import {Character} from '../components/Character';
import {Icon} from '../components/Icons';
import {Sfx} from '../components/Sfx';
import {DISPLAY} from '../fonts';
import type {Visual} from '../types';
import {useStage} from './stage';

/** Which outfit part each flying gear icon puts on. */
const GEAR_PART: Record<string, 'hat' | 'coat' | 'legs'> = {helmet: 'hat', hat: 'hat', coat: 'coat', boots: 'legs', pants: 'legs'};

/**
 * Race against the clock: a timer ring counts down while gear flies onto the character.
 * visual: { type: "countdown", seconds: 60, gear: ["boots", "coat", "helmet"], endCue: "out" }
 * The countdown hits zero when the narrator says `endCue` (default: about 55% into the line).
 */
export const CountdownScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {palette} = useEpisode();
	const {lead, voice} = useScene();
	const {width, height, vertical, ground, charHeight, charX} = useStage();
	const seconds: number = visual.seconds ?? 60;
	const gear: string[] = visual.gear ?? [];
	const end = useCueFrame(visual.endCue ?? 'out', lead + Math.round(voice.duration * fps * 0.55));
	const start = Math.max(4, lead);
	const progress = interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const remaining = Math.ceil(seconds * (1 - progress));
	const finished = frame >= end;

	const ringR = vertical ? 150 : 120;
	const ringX = vertical ? width / 2 : width * 0.72;
	const ringY = vertical ? height * 0.16 : height * 0.4;
	const circ = 2 * Math.PI * ringR;

	// each gear item launches, flies in an arc and lands on the character
	const wear: {hat: boolean; coat: boolean; legs: boolean} = {hat: false, coat: false, legs: false};
	const flights = gear.map((name, i) => {
		const land = start + ((i + 1) / (gear.length + 1)) * (end - start) * 1.1;
		const launch = land - 12;
		const t = interpolate(frame, [launch, land], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const part = GEAR_PART[name] ?? 'coat';
		if (frame >= land) wear[part] = true;
		const fromX = i % 2 === 0 ? -200 : width + 200;
		const targetY = part === 'hat' ? ground - charHeight * 0.95 : part === 'coat' ? ground - charHeight * 0.45 : ground - charHeight * 0.12;
		const x = interpolate(t, [0, 1], [fromX, charX]);
		const y = interpolate(t, [0, 1], [targetY - 200, targetY]) - Math.sin(t * Math.PI) * 300;
		return {name, x, y, t, land, launch, visible: frame >= launch && frame < land};
	});
	const cheer = spring({frame: frame - end, fps, config: {damping: 10, stiffness: 160}});
	const urgency = finished ? 0 : Math.sin(frame * 1.4) * 4 * progress;

	return (
		<AbsoluteFill>
			<Backdrop setting="burst" />
			{/* timer ring */}
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<circle cx={ringX} cy={ringY} r={ringR + 26} fill={palette.ink} />
				<circle cx={ringX} cy={ringY} r={ringR} fill="none" stroke={palette.soft} strokeWidth={30} opacity={0.35} />
				<circle
					cx={ringX}
					cy={ringY}
					r={ringR}
					fill="none"
					stroke={finished ? '#2DC653' : progress > 0.7 ? '#FF3B3B' : palette.accent}
					strokeWidth={30}
					strokeLinecap="round"
					strokeDasharray={circ}
					strokeDashoffset={circ * progress}
					transform={`rotate(-90 ${ringX} ${ringY})`}
				/>
			</svg>
			<div
				style={{
					position: 'absolute',
					left: ringX - 200,
					width: 400,
					top: ringY - (vertical ? 92 : 74),
					textAlign: 'center',
					fontFamily: DISPLAY,
					fontSize: vertical ? 160 : 128,
					color: '#FFFFFF',
					transform: `scale(${1 + Math.abs(urgency) * 0.02 + (finished ? 0.15 * cheer : 0)})`,
				}}
			>
				{remaining}
			</div>
			<div
				style={{
					position: 'absolute',
					left: charX - (charHeight * 600) / 780 / 2,
					top: ground - charHeight - cheer * 40,
					transform: `rotate(${urgency}deg)`,
					transformOrigin: '50% 100%',
				}}
			>
				<Character height={charHeight} wear={wear} pose={finished ? 'cheer' : 'hold'} expression={finished ? 'happy' : 'serious'} />
			</div>
			{flights.map(
				(f, i) =>
					f.visible && (
						<div key={i} style={{position: 'absolute', left: f.x - 110, top: f.y - 110, transform: `rotate(${f.t * 360}deg)`}}>
							<Icon name={f.name} size={220} />
						</div>
					),
			)}
			{flights.map((f, i) => (
				<React.Fragment key={`s${i}`}>
					<Sfx name="whoosh" at={f.launch} volume={0.35} />
					<Sfx name="pop" at={f.land} volume={0.4} />
				</React.Fragment>
			))}
			{Array.from({length: Math.max(0, Math.floor((end - start) / 8))}, (_, i) => (
				<Sfx key={`t${i}`} name="tick" at={start + i * 8} volume={0.15} />
			))}
			<Sfx name="ding" at={end} volume={0.35} />
		</AbsoluteFill>
	);
};
