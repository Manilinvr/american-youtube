import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEpisode} from '../context';
import {DISPLAY} from '../fonts';

/** A caption word placed on the episode timeline (frames). */
export type CaptionWord = {text: string; start: number; end: number; emph: boolean};

type Chunk = {words: CaptionWord[]; start: number; end: number};

const MAX_WORDS = 3;

/** Group words into short punchy chunks, breaking after punctuation or a pause. */
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

/** Big word-by-word captions in the classic US Shorts style: active word pops and turns yellow. */
export const Captions: React.FC<{words: CaptionWord[]}> = ({words}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {palette, vertical} = useEpisode();
	const chunks = React.useMemo(() => chunk(words), [words]);
	const idx = chunks.findIndex((c, i) => frame >= c.start && frame < (chunks[i + 1]?.start ?? c.end + fps * 0.5));
	if (idx < 0) return null;
	const c = chunks[idx];
	if (frame > c.end + fps * 0.6) return null;
	const pop = spring({frame: frame - c.start, fps, config: {damping: 12, stiffness: 260, mass: 0.6}});
	const fontSize = vertical ? 96 : 76;
	return (
		<div
			style={{
				position: 'absolute',
				left: width * 0.07,
				right: width * 0.07,
				top: vertical ? height * 0.66 : height * 0.8,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				gap: `0 ${fontSize * 0.28}px`,
				fontFamily: DISPLAY,
				fontSize,
				lineHeight: 1.1,
				textTransform: 'uppercase',
				transform: `scale(${0.75 + 0.25 * pop})`,
			}}
		>
			{c.words.map((w, i) => {
				const active = frame >= w.start && frame < (c.words[i + 1]?.start ?? c.end + fps);
				const color = active ? '#FFE135' : w.emph ? palette.accent === '#FFFFFF' ? '#FFE135' : palette.accent : '#FFFFFF';
				return (
					<span
						key={i}
						style={{
							color,
							WebkitTextStroke: `${fontSize * 0.13}px #111`,
							paintOrder: 'stroke fill',
							textShadow: `0 ${fontSize * 0.07}px 0 #111`,
							display: 'inline-block',
							transform: active ? 'scale(1.08) rotate(-2deg)' : 'none',
						}}
					>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};
