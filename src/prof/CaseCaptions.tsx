import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {CaptionWord} from '../components/Captions';
import {clamp} from './anim';
import {FONT, PROF} from './theme';

type Chunk = {words: CaptionWord[]; start: number; end: number};
const chunk = (words: CaptionWord[]): Chunk[] => {
	const out: Chunk[] = [];
	let cur: CaptionWord[] = [];
	words.forEach((w, i) => {
		cur.push(w);
		const next = words[i + 1];
		const punct = /[.!?,:;…—]$/.test(w.text);
		const gap = next ? next.start - w.end > 8 : true;
		if (cur.length >= 5 || punct || gap || !next) {
			out.push({words: cur, start: cur[0].start, end: w.end});
			cur = [];
		}
	});
	return out;
};

/** Typewriter captions: a cream paper strip with taped corners; words are typed in as spoken, emphasised words in red. */
export const CaseCaptions: React.FC<{words: CaptionWord[]}> = ({words}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const chunks = React.useMemo(() => chunk(words), [words]);
	const idx = chunks.findIndex((c, i) => frame >= c.start && frame < (chunks[i + 1]?.start ?? c.end + fps * 0.5));
	if (idx < 0) return null;
	const c = chunks[idx];
	if (frame > c.end + fps * 0.5) return null;
	const size = 74;
	const k = clamp((frame - c.start) / 4);
	return (
		<div style={{position: 'absolute', left: width * 0.05, right: width * 0.05, top: height * 0.69, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 14}px) rotate(-0.6deg)`}}>
			<div style={{position: 'relative', background: PROF.white, padding: `${size * 0.22}px ${size * 0.5}px`, boxShadow: '8px 10px 18px rgba(0,0,0,0.5)', fontFamily: FONT.type, fontSize: size, lineHeight: 1.18, color: PROF.ink, textAlign: 'center', maxWidth: '100%'}}>
				<div style={{position: 'absolute', left: -size * 0.45, top: -size * 0.15, width: size * 1.1, height: size * 0.42, background: 'rgba(232,215,127,0.8)', transform: 'rotate(-35deg)'}} />
				<div style={{position: 'absolute', right: -size * 0.45, bottom: -size * 0.15, width: size * 1.1, height: size * 0.42, background: 'rgba(232,215,127,0.8)', transform: 'rotate(-35deg)'}} />
				{c.words.map((w, i) => {
					const t = frame - w.start;
					if (t < 0) return <span key={i} style={{visibility: 'hidden'}}>{w.text} </span>;
					const typed = Math.min(w.text.length, Math.ceil(t * 1.1));
					return (
						<span key={i} style={{color: w.emph ? PROF.accent : PROF.ink, fontWeight: w.emph ? 700 : 400}}>
							{w.text.slice(0, typed)}
							<span style={{visibility: 'hidden'}}>{w.text.slice(typed)}</span>{' '}
						</span>
					);
				})}
			</div>
		</div>
	);
};
