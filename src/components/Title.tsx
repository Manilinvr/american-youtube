import React from 'react';
import {interpolate, useVideoConfig} from 'remotion';
import {usePop, useEpisode} from '../context';
import {DISPLAY} from '../fonts';

/** Big punchy cartoon headline that stamps in at `delay`. */
export const Title: React.FC<{text: string; delay?: number; y?: number; size?: number; color?: string; tilt?: number}> = ({
	text,
	delay = 0,
	y,
	size,
	color,
	tilt = -3,
}) => {
	const {width, height} = useVideoConfig();
	const {palette, vertical} = useEpisode();
	const p = usePop(delay, 220);
	const fontSize = size ?? (vertical ? 118 : 104);
	return (
		<div
			style={{
				position: 'absolute',
				left: width * 0.06,
				right: width * 0.06,
				top: y ?? (vertical ? height * 0.12 : height * 0.07),
				textAlign: 'center',
				fontFamily: DISPLAY,
				fontSize,
				lineHeight: 1.05,
				color: color ?? palette.text,
				WebkitTextStroke: `${fontSize * 0.1}px ${palette.ink}`,
				paintOrder: 'stroke fill',
				textShadow: `0 ${fontSize * 0.08}px 0 ${palette.ink}`,
				transform: `scale(${interpolate(p, [0, 1], [2.2, 1])}) rotate(${tilt * p}deg)`,
				opacity: Math.min(1, p * 3),
				letterSpacing: 2,
			}}
		>
			{text}
		</div>
	);
};
