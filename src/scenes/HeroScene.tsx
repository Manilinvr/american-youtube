import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useCueFrame, usePop, useScene} from '../context';
import {Backdrop, Setting} from '../components/Backdrop';
import {Character, Expression, Pose} from '../components/Character';
import {Icon} from '../components/Icons';
import {Sfx, SfxName} from '../components/Sfx';
import {Title} from '../components/Title';
import type {Visual} from '../types';
import {useStage} from './stage';

/**
 * The main character in a setting, optional headline and prop.
 * visual: { type: "hero", pose, expression, setting, title, titleCue, titleSfx, prop, propCue }
 * prop: any icon name (floats next to the character) or "flame-out" (a flame that fizzles at propCue).
 */
export const HeroScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {lead} = useScene();
	const {width, height, vertical, ground, charHeight, charX} = useStage();
	const enter = usePop(-5, 200); // already half-way in on frame 0: the first frame is what viewers see while swiping
	const titleAt = useCueFrame(visual.titleCue, lead + Math.round(fps * 0.6));
	const propCue = useCueFrame(visual.propCue ?? 'never', lead + Math.round(fps * 0.8));

	const propX = vertical ? width * 0.8 : width * 0.62;
	const propY = ground - charHeight * 0.35;
	let prop: React.ReactNode = null;
	if (visual.prop === 'flame-out') {
		const out = interpolate(frame, [propCue, propCue + 8], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const puff = interpolate(frame, [propCue, propCue + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const flicker = 1 + Math.sin(frame * 1.3) * 0.06;
		prop = (
			<>
				<div style={{position: 'absolute', left: propX - 110, top: propY - 220, transform: `scale(${out * flicker})`, transformOrigin: '50% 100%'}}>
					<Icon name="fire" size={220} />
				</div>
				{puff > 0 && puff < 1 &&
					[0, 1, 2].map((i) => (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: propX - 60 + (i - 1) * 50,
								top: propY - 120 - puff * (160 + i * 40),
								width: 120,
								height: 120,
								borderRadius: '50%',
								background: '#D9D9D9',
								opacity: 0.8 * (1 - puff),
								transform: `scale(${0.4 + puff})`,
							}}
						/>
					))}
				<Sfx name="boing" at={propCue} volume={0.3} />
			</>
		);
	} else if (visual.prop) {
		prop = (
			<div style={{position: 'absolute', left: propX - 100, top: propY - 200 + Math.sin(frame / 8) * 12, transform: `scale(${enter})`}}>
				<Icon name={visual.prop} size={200} />
			</div>
		);
	}

	const punch = interpolate(frame, [0, 10], [1.15, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{transform: `scale(${punch})`}}>
			<Backdrop setting={(visual.setting as Setting) ?? 'burst'} />
			<div
				style={{
					position: 'absolute',
					left: charX - (charHeight * 600) / 780 / 2,
					top: ground - charHeight,
					transform: `translateY(${(1 - enter) * height * 0.4}px) scale(${interpolate(enter, [0, 1], [0.7, 1])})`,
					transformOrigin: '50% 100%',
				}}
			>
				<Character height={charHeight} pose={(visual.pose as Pose) ?? 'idle'} expression={(visual.expression as Expression) ?? 'happy'} />
			</div>
			{prop}
			{visual.title && (
				<>
					<Title text={visual.title} delay={titleAt} />
					<Sfx name={(visual.titleSfx as SfxName) ?? 'scratch'} at={titleAt} volume={0.3} />
				</>
			)}
		</AbsoluteFill>
	);
};
