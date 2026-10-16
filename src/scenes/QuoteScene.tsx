import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrame, useScene} from '../context';
import {Draw, P} from '../components/ink';
import {Face, Person, PoseName} from '../components/Person';
import {HAND, MARKER} from '../fonts';
import {INK, LINE, RED} from '../theme';
import type {Visual} from '../types';
import {useStage} from './stage';
import {CameraSpec, useCamera} from './camera';

/**
 * Big handwritten words for the key idea or the closing life lesson.
 *  - no `text`: the narration itself is written word by word as it is spoken (captions are hidden)
 *  - with `text`: that title is written on at `at` (e.g. "THE DOORWAY EFFECT"), captions stay
 * visual: { type: "quote", text?, at?, sub?, person?: { pose, face } }
 */
export const QuoteScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {voice, lead} = useScene();
	const {width, height, vertical} = useStage();
	const person = visual.person as {pose?: PoseName; face?: Face} | undefined;
	const camera = useCamera(visual.camera as CameraSpec | undefined, [0.5, 0.4], [1.0, 1.06]);
	const top = vertical ? height * 0.14 : height * 0.12;
	const areaH = vertical ? height * (person ? 0.36 : 0.5) : height * (person ? 0.5 : 0.62);

	let body: React.ReactNode;
	if (visual.text) {
		const at = cueFrame(voice, lead, fps, visual.at, lead);
		const reveal = interpolate(frame, [at, at + 18], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const under = interpolate(frame, [at + 16, at + 28], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const size = vertical ? 120 : 110;
		body = (
			<div style={{textAlign: 'center'}}>
				<div style={{fontFamily: MARKER, fontSize: size, lineHeight: 1.1, color: INK, clipPath: `inset(0 ${100 - reveal}% 0 0)`}}>{visual.text}</div>
				<svg width={width * 0.7} height={40} style={{overflow: 'visible'}}>
					<Draw p={under}>
						<P d={`M10 20 Q${width * 0.35} 4 ${width * 0.7 - 10} 24`} stroke={RED} strokeWidth={LINE * 2} />
					</Draw>
				</svg>
			</div>
		);
	} else {
		const size = vertical ? 96 : 84;
		body = (
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.28}px`, fontFamily: HAND, fontWeight: 700, fontSize: size, lineHeight: 1.25}}>
				{voice.words.map((w, i) => {
					const at = lead + Math.round(w.s * fps);
					const p = interpolate(frame, [at - 2, at + 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					const under = interpolate(frame, [at + 3, at + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return (
						<span key={i} style={{position: 'relative', color: w.em ? RED : INK, opacity: p, transform: `translateY(${(1 - p) * 16}px)`, display: 'inline-block'}}>
							{w.t}
							{w.em && (
								<span
									style={{position: 'absolute', left: 0, right: 0, bottom: size * 0.08, height: size * 0.07, background: RED, borderRadius: size, transform: `scaleX(${under}) rotate(-1deg)`, transformOrigin: 'left'}}
								/>
							)}
						</span>
					);
				})}
			</div>
		);
	}

	return (
		<AbsoluteFill style={camera}>
			<div style={{position: 'absolute', left: width * 0.08, right: width * 0.08, top, height: areaH, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
				{body}
				{visual.sub && (
					<div style={{fontFamily: HAND, fontSize: vertical ? 44 : 38, color: INK, opacity: interpolate(frame, [lead + 20, lead + 32], [0, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), marginTop: 30}}>
						{visual.sub}
					</div>
				)}
			</div>
			{person && (
				<svg width={width} height={height} style={{position: 'absolute'}}>
					<g transform={`translate(${width / 2} ${vertical ? height * 0.68 : height * 0.92}) scale(${vertical ? 1.05 : 0.9})`}>
						<Person pose={person.pose ?? 'think'} face={person.face ?? 'neutral'} />
					</g>
				</svg>
			)}
		</AbsoluteFill>
	);
};
