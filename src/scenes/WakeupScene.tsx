import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useCueFrame, useEpisode, useScene} from '../context';
import {Backdrop} from '../components/Backdrop';
import {Character} from '../components/Character';
import {Icon} from '../components/Icons';
import {Sfx} from '../components/Sfx';
import {Title} from '../components/Title';
import {DISPLAY} from '../fonts';
import type {Visual} from '../types';
import {useStage} from './stage';

/**
 * Night shift: the character sleeps in a bunk; in phase "alarm" the alarm goes off on `cue`
 * and they jump out of bed. Works for any job with night calls (nurse, doctor, pilot, plumber...).
 * visual: { type: "wakeup", phase: "sleep" | "alarm", clock: "3:00", cue, title }
 */
export const WakeupScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {palette} = useEpisode();
	const {lead} = useScene();
	const {width, height, vertical, charHeight} = useStage();
	const alarmMode = visual.phase === 'alarm';
	const cue = useCueFrame(visual.cue, lead + 10);
	const ring = alarmMode ? interpolate(frame, [cue, cue + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
	const jump = alarmMode ? spring({frame: frame - cue - 3, fps, config: {damping: 10, stiffness: 140}}) : 0;
	const shake = ring > 0 ? Math.sin(frame * 2.1) * 10 * ring : 0;

	const bedW = vertical ? width * 0.9 : width * 0.55;
	const bedX = (width - bedW) / 2;
	const bedY = vertical ? height * 0.5 : height * 0.62;
	const lyingH = vertical ? charHeight * 0.85 : charHeight * 0.75;
	const standH = charHeight * 0.95;

	// lying → standing: rotate from -90° to 0°, rise out of bed
	const rot = interpolate(jump, [0, 1], [-90, 0]);
	const lift = interpolate(jump, [0, 0.5, 1], [0, -height * 0.12, 0]);
	const h = interpolate(jump, [0, 1], [lyingH, standH]);
	const charW = (h * 600) / 780;
	// lying: the pivot is at the feet, so put the feet where the head lands on the pillow
	const pillowX = bedX + 40 + bedW * 0.14;
	const cx = interpolate(jump, [0, 1], [pillowX + lyingH * 0.62, vertical ? width / 2 : width * 0.5]);
	const cy = interpolate(jump, [0, 1], [bedY + lyingH * 0.12, bedY + height * 0.17]);

	const clockX = vertical ? width * 0.55 : width * 0.62;
	const clockY = vertical ? height * 0.13 : height * 0.12;
	const blink = ring > 0 && Math.floor(frame / 6) % 2 === 0;

	return (
		<AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
			<Backdrop setting="night-room" alarm={ring} />
			{/* digital alarm clock on the wall */}
			<div
				style={{
					position: 'absolute',
					left: clockX,
					top: clockY,
					padding: '14px 34px',
					borderRadius: 28,
					background: '#0B0B12',
					border: '8px solid #3A4A7A',
					fontFamily: DISPLAY,
					fontSize: vertical ? 120 : 96,
					color: blink ? '#FFFFFF' : '#FF3B3B',
					textShadow: '0 0 24px #FF3B3B',
					transform: `rotate(${ring > 0 ? Math.sin(frame * 1.7) * 6 : 0}deg)`,
				}}
			>
				{visual.clock ?? '3:00'}
				<span style={{fontSize: '0.4em', marginLeft: 12}}>AM</span>
			</div>
			{ring > 0 && (
				<div style={{position: 'absolute', left: clockX - 170, top: clockY + 10, transform: `rotate(${Math.sin(frame * 2.5) * 22}deg)`}}>
					<Icon name="bell" size={140} />
				</div>
			)}
			{/* bed frame + mattress (drawn behind the character) */}
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<rect x={bedX - 20} y={bedY - 160} width={30} height={420} rx={12} fill="#8A8FA8" />
				<rect x={bedX + bedW - 10} y={bedY - 60} width={30} height={320} rx={12} fill="#8A8FA8" />
				<rect x={bedX} y={bedY + 60} width={bedW} height={70} rx={20} fill="#E8ECF5" stroke="#1D1A1F" strokeWidth={6} />
				<rect x={bedX + 20} y={bedY - 20} width={bedW * 0.28} height={90} rx={40} fill="#FFFFFF" stroke="#1D1A1F" strokeWidth={6} />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: cx - charW / 2,
					top: cy - h + lift,
					transform: `rotate(${rot}deg)`,
					transformOrigin: '50% 100%',
				}}
			>
				<Character height={h} pose={jump > 0.5 ? 'cheer' : 'idle'} expression={jump > 0.2 ? 'surprised' : 'sleepy'} talking={false} wear={{hat: false, coat: false, legs: false}} />
			</div>
			{/* blanket over the sleeper */}
			{jump < 0.35 && (
				<svg width={width} height={height} style={{position: 'absolute', opacity: interpolate(jump, [0, 0.35], [1, 0])}}>
					<path
						d={`M${bedX + bedW * 0.33} ${bedY - 10} Q${bedX + bedW * 0.6} ${bedY - 60 + Math.sin(frame / 12) * 6} ${bedX + bedW + 10} ${bedY - 10} L${bedX + bedW + 10} ${bedY + 80} L${bedX + bedW * 0.33} ${bedY + 80}Z`}
						fill="#E76F51"
						stroke="#1D1A1F"
						strokeWidth={6}
					/>
					<path d={`M${bedX + bedW * 0.33} ${bedY + 10} L${bedX + bedW + 10} ${bedY + 10}`} stroke="#F4A261" strokeWidth={18} />
				</svg>
			)}
			{/* floating Z's while asleep */}
			{ring === 0 &&
				[0, 1, 2].map((i) => {
					const t = ((frame + i * 20) % 60) / 60;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: bedX + bedW * 0.2 + t * 120 + i * 30,
								top: bedY - 220 - t * 260,
								fontFamily: DISPLAY,
								fontSize: 70 + i * 24,
								color: '#FFFFFF',
								opacity: Math.sin(t * Math.PI),
							}}
						>
							Z
						</div>
					);
				})}
			{jump > 0.4 && (
				<div style={{position: 'absolute', left: width / 2 + charW * 0.2, top: cy - h - 40 + lift, fontFamily: DISPLAY, fontSize: 150, color: '#FFE135', WebkitTextStroke: '16px #111', paintOrder: 'stroke fill', transform: `scale(${jump}) rotate(12deg)`}}>
					!!
				</div>
			)}
			{visual.title && <Title text={visual.title} delay={lead + 6} y={vertical ? height * 0.27 : height * 0.3} color={palette.accent} />}
			{alarmMode && <Sfx name="alarm" at={cue} volume={0.3} />}
		</AbsoluteFill>
	);
};
