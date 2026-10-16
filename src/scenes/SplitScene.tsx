import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {cueFrame, useScene} from '../context';
import {Draw, P} from '../components/ink';
import {Sfx} from '../components/Sfx';
import {MARKER} from '../fonts';
import {INK, LINE, RED} from '../theme';
import type {Visual} from '../types';
import {Cue, SituationArt, SituationSpec} from './Situation';
import {makeBox} from './stage';

type Panel = SituationSpec & {label?: string; at?: Cue};

/**
 * Two panels for comparisons: "Expectation / Reality", "Old room / New room", "You / Your brain".
 * Stacked in 9:16, side by side in 16:9. The second panel draws itself in at its `at` cue.
 * visual: { type: "split", panels: [ {label, ...situation}, {label, at, ...situation} ] }
 */
export const SplitScene: React.FC<{visual: Visual; drawOn: boolean}> = ({visual, drawOn}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {voice, lead} = useScene();
	const vertical = height > width;
	const panels: Panel[] = visual.panels ?? [];
	const gap = 30;
	const boxes = panels.map((_, i) => {
		if (vertical) {
			const top = height * 0.06;
			const h = (height * 0.63 - gap) / 2;
			return {x: width * 0.05, y: top + i * (h + gap), w: width * 0.9, h};
		}
		const w = (width * 0.92 - gap) / 2;
		return {x: width * 0.04 + i * (w + gap), y: height * 0.06, w, h: height * 0.74};
	});
	return (
		<AbsoluteFill>
			{panels.map((panel, i) => {
				const b = boxes[i];
				const at = i === 0 ? 0 : cueFrame(voice, lead, fps, panel.at, lead + 20);
				if (frame < at) return null;
				const frameP = drawOn || i > 0 ? interpolate(frame, [at, at + 12], [0, 1], {extrapolateRight: 'clamp'}) : 1;
				const inner = makeBox(b.x, b.y, b.w, b.h, 0.9);
				return (
					<React.Fragment key={i}>
						<svg width={width} height={height} style={{position: 'absolute'}}>
							<Draw p={frameP}>
								<P d={`M${b.x} ${b.y + 4} L${b.x + b.w - 3} ${b.y} L${b.x + b.w} ${b.y + b.h - 2} L${b.x + 2} ${b.y + b.h} Z`} strokeWidth={LINE * 1.3} />
							</Draw>
						</svg>
						<div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, overflow: 'hidden'}}>
							<div style={{position: 'absolute', left: -b.x, top: -b.y, width, height}}>
								<SituationArt spec={panel} box={inner} drawOn={drawOn || i > 0} startAt={at} />
							</div>
						</div>
						{panel.label && (
							<div style={{position: 'absolute', left: b.x + 24, top: b.y + 14, fontFamily: MARKER, fontSize: vertical ? 54 : 48, color: i === 0 ? INK : RED, transform: 'rotate(-2deg)'}}>
								{panel.label}
							</div>
						)}
						{i > 0 && <Sfx name="page" at={at} volume={0.35} />}
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
