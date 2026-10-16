import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEpisode} from '../context';
import {HAND} from '../fonts';
import {captionTop} from '../scenes/stage';
import {HIGHLIGHT, INK, PAPER, RED} from '../theme';

/** A caption word placed on the episode timeline (frames). */
export type CaptionWord = {text: string; start: number; end: number; emph: boolean};

type Chunk = {words: CaptionWord[]; start: number; end: number};

const MAX_WORDS = 3;

/** Group words into short chunks, breaking after punctuation or a pause. */
const chunk = (words: CaptionWord[]): Chunk[] => {
	const chunks: Chunk[] = [];
	let cur: CaptionWord[] = [];
	words.forEach((w, i) => {
		cur.push(w);
		const next = words[i + 1];
		const punct = /[.!?,:;…—]$/.test(w.text);
		const gap = next ? next.start - w.end > 8 : true;
		if (cur.length >= MAX_WORDS || punct || gap || !next) {
			chunks.push({words: cur, start: cur[0].start, end: w.end});
			cur = [];
		}
	});
	return chunks;
};

/** Handwritten captions: the active word gets a highlighter stroke, *emphasised* words are red pen. */
export const Captions: React.FC<{words: CaptionWord[]}> = ({words}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {vertical} = useEpisode();
	const chunks = React.useMemo(() => chunk(words), [words]);
	const idx = chunks.findIndex((c, i) => frame >= c.start && frame < (chunks[i + 1]?.start ?? c.end + fps * 0.5));
	if (idx < 0) return null;
	const c = chunks[idx];
	if (frame > c.end + fps * 0.6) return null;
	const pop = spring({frame: frame - c.start, fps, config: {damping: 14, stiffness: 260, mass: 0.6}});
	const fontSize = vertical ? 92 : 70;
	return (
		<div
			style={{
				position: 'absolute',
				left: width * 0.06,
				right: width * 0.06,
				top: captionTop(width, height),
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				gap: `0 ${fontSize * 0.3}px`,
				fontFamily: HAND,
				fontWeight: 700,
				fontSize,
				lineHeight: 1.15,
				transform: `translateY(${(1 - pop) * 14}px)`,
				opacity: Math.min(1, pop * 2),
			}}
		>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${fontSize * 0.3}px`, background: `${PAPER}D9`, borderRadius: fontSize * 0.3, padding: `0 ${fontSize * 0.25}px`}}>
			{c.words.map((w, i) => {
				const active = frame >= w.start && frame < (c.words[i + 1]?.start ?? c.end + fps);
				return (
					<span key={i} style={{position: 'relative', display: 'inline-block', color: w.emph ? RED : INK}}>
						{active && (
							<span
								style={{
									position: 'absolute',
									left: -fontSize * 0.12,
									right: -fontSize * 0.12,
									top: '38%',
									height: '50%',
									background: HIGHLIGHT,
									opacity: 0.85,
									borderRadius: fontSize * 0.1,
									transform: 'rotate(-1.5deg)',
									zIndex: -1,
								}}
							/>
						)}
						<span style={{position: 'relative'}}>{w.text}</span>
					</span>
				);
			})}
			</div>
		</div>
	);
};
