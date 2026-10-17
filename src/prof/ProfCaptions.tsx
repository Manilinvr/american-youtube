import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {CaptionWord} from '../components/Captions';
import {clamp, spr} from './anim';
import {FONT, PROF} from './theme';

type Chunk = {words: CaptionWord[]; start: number; end: number};
const MAX_WORDS = 3;

const chunk = (words: CaptionWord[]): Chunk[] => {
	const out: Chunk[] = [];
	let cur: CaptionWord[] = [];
	words.forEach((w, i) => {
		cur.push(w);
		const next = words[i + 1];
		const punct = /[.!?,:;…—]$/.test(w.text);
		const gap = next ? next.start - w.end > 8 : true;
		if (cur.length >= MAX_WORDS || punct || gap || !next) {
			out.push({words: cur, start: cur[0].start, end: w.end});
			cur = [];
		}
	});
	return out;
};

/**
 * Kinetic captions: big condensed caps with a heavy outline. Each word pops in as it is spoken,
 * *emphasised* words are marker yellow.
 */
export const ProfCaptions: React.FC<{words: CaptionWord[]}> = ({words}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const chunks = React.useMemo(() => chunk(words), [words]);
	const idx = chunks.findIndex((c, i) => frame >= c.start && frame < (chunks[i + 1]?.start ?? c.end + fps * 0.45));
	if (idx < 0) return null;
	const c = chunks[idx];
	if (frame > c.end + fps * 0.5) return null;
	const size = 124;
	return (
		<div style={{position: 'absolute', left: width * 0.04, right: width * 0.04, top: height * 0.668, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: `0 ${size * 0.3}px`, fontFamily: FONT.display, fontSize: size, lineHeight: 1.08, textTransform: 'uppercase', letterSpacing: size * 0.01}}>
			{c.words.map((w, i) => {
				const t = frame - w.start;
				if (t < -1) return <span key={i} style={{visibility: 'hidden'}}>{w.text}</span>;
				const s = spr(t, fps, 17, 340, 0.6);
				const active = frame < (c.words[i + 1]?.start ?? c.end + 6);
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							color: w.emph ? PROF.accent : PROF.white,
							WebkitTextStroke: `${size * 0.11}px ${PROF.ink}`,
							paintOrder: 'stroke fill',
							textShadow: `0 ${size * 0.07}px 0 ${PROF.ink}`,
							transform: `translateY(${(1 - s) * 26}px) scale(${(0.72 + 0.28 * s) * (active ? 1.04 : 1)}) rotate(${w.emph ? -1.5 : 0}deg)`,
							opacity: clamp(t / 2 + 0.3),
						}}
					>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};
