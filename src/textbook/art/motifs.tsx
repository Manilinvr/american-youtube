import React from 'react';
import {Ink, Spark} from '../ink';
import {BOOK} from '../palette';
import {Pt, sample, smooth} from '../rough';

/**
 * The thought loop: one tangled, closed line that keeps crossing itself.
 * It is the episode's recurring motif (above the sleeper, in the close-up, unravelling into the to-do list),
 * always the same shape so the viewer recognises it.
 */
export const loopPt = (t: number, cx: number, cy: number, sx: number, sy: number, writhe = 0): Pt => {
	const a = t * Math.PI * 2;
	return [
		cx + sx * (Math.cos(a) * 0.62 + Math.cos(3 * a + 0.6 + writhe) * 0.3 + Math.sin(2 * a - writhe * 0.5) * 0.08),
		cy + sy * (Math.sin(a) * 0.55 + Math.sin(3 * a + 0.2 + writhe * 0.8) * 0.32 + Math.cos(2 * a + writhe * 0.4) * 0.1),
	];
};

export const loopPoints = (cx: number, cy: number, sx: number, sy: number, n = 120, writhe = 0): Pt[] => sample((t) => loopPt(t, cx, cy, sx, sy, writhe), n, true);

/** Slow writhing of the loop over time (radians), so the tangle is never still. */
export const writheAt = (f: number, fps: number, amount = 1) => amount * (0.32 * Math.sin((f / fps) * 0.9) + 0.12 * Math.sin((f / fps) * 2.3 + 1));

/** The loop drawn on (p), with a glowing impulse running laps at `phase` (0..1 per lap). */
export const ThoughtLoop: React.FC<{cx: number; cy: number; sx: number; sy: number; p: number; phase?: number; color?: string; width?: number; spark?: number; opacity?: number; writhe?: number}> = ({
	cx,
	cy,
	sx,
	sy,
	p,
	phase,
	color = BOOK.ink,
	width = 2.6,
	spark = 6,
	opacity = 1,
	writhe = 0,
}) => {
	const d = smooth(loopPoints(cx, cy, sx, sy, 120, writhe), true);
	const pt = (t: number) => loopPt(t, cx, cy, sx, sy, writhe);
	return (
		<g opacity={opacity}>
			<Ink d={d} w={width} color={color} p={p} />
			{phase !== undefined && p > 0.98 && (
				<g>
					{[0.045, 0.03, 0.015].map((back, i) => {
						const [x, y] = pt(phase - back);
						return <circle key={i} cx={x} cy={y} r={spark * (0.3 + i * 0.12)} fill={BOOK.glow} opacity={0.25 + i * 0.15} />;
					})}
					<Spark x={pt(phase)[0]} y={pt(phase)[1]} r={spark} />
				</g>
			)}
		</g>
	);
};

/** Small paper tag with a word on it, pinned to a point by a short leader line. */
export const Tag: React.FC<{x: number; y: number; at: Pt; text: string; p: number; size?: number; ring?: number; swing?: number}> = ({x, y, at, text, p, size = 17, ring = 0, swing = 0}) => {
	if (p <= 0) return null;
	const w = text.length * size * 0.47 + 16;
	const h = size * 1.45;
	const pop = 0.85 + 0.15 * p;
	return (
		<g opacity={Math.min(1, p * 1.5)}>
			<path d={`M${at[0]} ${at[1]} L${x} ${y}`} stroke={BOOK.ink} strokeWidth={1} opacity={0.8} />
			<circle cx={at[0]} cy={at[1]} r={2.2} fill={BOOK.ink} />
			<g transform={`translate(${x} ${y}) scale(${pop}) rotate(${-2 + swing})`}>
				<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1.3} />
				<text x={0} y={size * 0.33} fontFamily="IM Fell English" fontStyle="italic" fontSize={size} fill={BOOK.ink} textAnchor="middle">
					{text}
				</text>
				{ring > 0 && (
					<Ink
						d={smooth(
							[
								[-w * 0.62, -h * 0.1],
								[-w * 0.3, -h * 1.05],
								[w * 0.35, -h * 0.98],
								[w * 0.66, 0],
								[w * 0.3, h * 1.0],
								[-w * 0.4, h * 0.95],
								[-w * 0.66, h * 0.05],
								[-w * 0.5, -h * 0.6],
							],
							false,
						)}
						w={2.6}
						color={BOOK.terracotta}
						p={ring}
					/>
				)}
			</g>
		</g>
	);
};
