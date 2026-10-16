import React from 'react';
import {HAND} from '../../fonts';
import {BOOK} from '../palette';
import {Pt} from '../rough';

/** Where a figure-local point (pelvis origin, facing right) lands in panel coordinates. */
export const toPanel = (fx: number, fy: number, s: number, facing: 1 | -1, p: Pt): Pt => [fx + p[0] * s * facing, fy + p[1] * s];

/** Inverse: a panel point expressed in the figure's local coordinates (to send a hand to an object). */
export const toLocal = (fx: number, fy: number, s: number, facing: 1 | -1, p: Pt): Pt => [((p[0] - fx) / s) * facing, (p[1] - fy) / s];

/** Handwritten lines inside a bubble or on a phone. */
export const Hand2: React.FC<{x: number; y: number; lines: string[]; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'; opacity?: number}> = ({x, y, lines, size = 17, color = BOOK.ink, anchor = 'middle', opacity = 1}) => (
	<g opacity={opacity}>
		{lines.map((l, i) => (
			<text key={i} x={x} y={y + i * size * 1.2} fontFamily={HAND} fontWeight={700} fontSize={size} fill={color} textAnchor={anchor}>
				{l}
			</text>
		))}
	</g>
);

/** Chat bubble on a phone screen. */
export const ChatBubble: React.FC<{x: number; y: number; w: number; text: string[]; mine?: boolean; size?: number; p?: number}> = ({x, y, w, text, mine, size = 9, p = 1}) =>
	p > 0 ? (
		<g opacity={Math.min(1, p * 2)} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * p})`}>
			<rect x={mine ? -w : 0} y={-size} width={w} height={text.length * size * 1.25 + size * 0.6} rx={5} fill={mine ? BOOK.ochre : BOOK.parchment} stroke={BOOK.ink} strokeWidth={0.8} />
			{text.map((l, i) => (
				<text key={i} x={mine ? -w + 5 : 5} y={i * size * 1.25 + size * 0.4} fontFamily={HAND} fontWeight={700} fontSize={size} fill={BOOK.ink}>
					{l}
				</text>
			))}
		</g>
	) : null;

/** Seconds since the start of the episode (for loops that don't depend on events). */
export const secs = (f: number, fps: number) => f / fps;
