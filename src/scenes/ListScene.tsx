import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEpisode, useScene} from '../context';
import {Backdrop} from '../components/Backdrop';
import {Icon} from '../components/Icons';
import {Sfx} from '../components/Sfx';
import {Title} from '../components/Title';
import {BODY} from '../fonts';
import type {Visual} from '../types';
import {useStage} from './stage';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9%]/g, '');

/**
 * Cards that pop in one by one exactly when the narrator says each item's cue word.
 * visual: { type: "list", title, items: [{ icon, label, cue }] }
 */
export const ListScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {palette} = useEpisode();
	const {voice, lead, durationInFrames} = useScene();
	const {width, height, vertical} = useStage();
	const items: {icon: string; label: string; cue?: string}[] = visual.items ?? [];

	const cardW = vertical ? width * 0.84 : width * 0.5;
	const cardH = vertical ? 200 : 150;
	const gap = vertical ? 40 : 28;
	const top = vertical ? height * 0.27 : height * 0.26;
	const left = (width - cardW) / 2;

	return (
		<AbsoluteFill>
			<Backdrop setting="burst" />
			{visual.title && <Title text={visual.title} delay={2} size={vertical ? 96 : 84} />}
			{items.map((item, i) => {
				const word = item.cue ? voice.words.find((w) => norm(w.t).startsWith(norm(item.cue!))) : undefined;
				const fallback = lead + ((i + 1) / (items.length + 1)) * (durationInFrames - lead) * 0.8;
				const at = word ? lead + Math.round(word.s * fps) - 3 : fallback;
				const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 190}});
				const wobble = Math.sin((frame - at) / 6) * 1.5 * Math.min(1, Math.max(0, frame - at) / 10);
				return (
					<React.Fragment key={i}>
						<div
							style={{
								position: 'absolute',
								left,
								top: top + i * (cardH + gap),
								width: cardW,
								height: cardH,
								borderRadius: 36,
								background: '#FFFFFF',
								border: `7px solid ${palette.ink}`,
								boxShadow: `0 12px 0 ${palette.ink}`,
								display: 'flex',
								alignItems: 'center',
								gap: 34,
								padding: '0 36px',
								boxSizing: 'border-box',
								transform: `translateX(${interpolate(p, [0, 1], [width, 0])}px) rotate(${(i % 2 ? 1.5 : -1.5) + wobble}deg)`,
							}}
						>
							<div style={{width: cardH * 0.78, height: cardH * 0.78, borderRadius: '50%', background: palette.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
								<Icon name={item.icon} size={cardH * 0.6} />
							</div>
							<div style={{fontFamily: BODY, fontWeight: 700, fontSize: vertical ? 70 : 56, color: palette.ink}}>{item.label}</div>
						</div>
						<Sfx name="pop" at={at} volume={0.4} />
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
