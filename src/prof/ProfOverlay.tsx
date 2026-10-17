import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {rnd} from './anim';
import {PROF} from './theme';

/** Film grain, soft vignette and a thin progress bar on top (a retention cue). */
export const ProfOverlay: React.FC<{total: number}> = ({total}) => {
	const frame = useCurrentFrame();
	const {width} = useVideoConfig();
	const k = Math.floor(frame / 3);
	return (
		<>
			<AbsoluteFill style={{backgroundImage: `url(${staticFile('prof/grain.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${Math.floor(rnd(k) * 512)}px ${Math.floor(rnd(k + 9) * 512)}px`, mixBlendMode: 'multiply', opacity: 0.045, pointerEvents: 'none'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.30) 100%)', pointerEvents: 'none'}} />
			<div style={{position: 'absolute', left: 0, top: 0, height: 10, width: (frame / total) * width, background: PROF.accent, borderBottom: `3px solid ${PROF.ink}`}} />
		</>
	);
};
