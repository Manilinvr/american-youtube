import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HAND, MARKER, TYPE} from '../fonts';
import {HIGHLIGHT, INK, LINE, PAPER_LIGHT as PAPER, RED} from '../theme';
import {Draw, P} from './ink';

/**
 * Comic marks: emotes over heads, speech/thought bubbles and red-pen annotations.
 * All positions are screen pixels.
 */
export type EmoteName = '?' | '!' | '!?' | '...' | 'sweat' | 'zzz' | 'heart' | 'idea' | 'anger' | 'music';

/** SVG emote above a head. `p` is the 0-1 pop-in spring; `size` ~ head radius in px. */
export const Emote: React.FC<{kind: EmoteName; x: number; y: number; p: number; size: number}> = ({kind, x, y, p, size}) => {
	const frame = useCurrentFrame();
	if (p <= 0.01) return null;
	const wobble = Math.sin(frame / 5) * 4;
	const s = size / 60;
	const text = (t: string, color = INK) => (
		<text x={0} y={0} textAnchor="middle" fontFamily={MARKER} fontSize={90} fill={color}>
			{t}
		</text>
	);
	let art: React.ReactNode;
	switch (kind) {
		case '...':
			art = (
				<g>
					{[0, 1, 2].map((i) => (
						<circle key={i} cx={-40 + i * 40} cy={-20} r={10} fill={INK} opacity={Math.floor(frame / 8) % 4 > i ? 1 : 0.15} />
					))}
				</g>
			);
			break;
		case 'sweat':
			art = <P d="M0 -70 Q30 -20 22 0 Q14 22 0 22 Q-14 22 -22 0 Q-30 -20 0 -70Z" fill="#CFE3F5" />;
			break;
		case 'zzz':
			art = (
				<g fontFamily={MARKER} fill={INK}>
					<text x={-20} y={0} fontSize={50}>z</text>
					<text x={10} y={-40} fontSize={70}>z</text>
					<text x={45} y={-95} fontSize={90}>Z</text>
				</g>
			);
			break;
		case 'heart':
			art = <P d="M0 20 C-50 -15 -45 -60 -15 -60 C-5 -60 0 -50 0 -42 C0 -50 5 -60 15 -60 C45 -60 50 -15 0 20Z" fill={RED} />;
			break;
		case 'idea':
			art = (
				<g>
					<P d="M-30 -40 Q-30 -95 0 -95 Q30 -95 30 -40 Q30 -25 15 -12 L15 5 L-15 5 L-15 -12 Q-30 -25 -30 -40Z" fill={HIGHLIGHT} />
					<P d="M-12 16 L12 16 M-8 26 L8 26" />
					<P d="M-60 -60 L-45 -55 M60 -60 L45 -55 M0 -125 L0 -110 M-45 -105 L-35 -93 M45 -105 L35 -93" strokeWidth={LINE * 0.8} />
				</g>
			);
			break;
		case 'anger':
			art = <P d="M-20 -60 L-5 -30 M20 -60 L5 -30 M-40 -20 L-10 -15 M40 -20 L10 -15" stroke={RED} strokeWidth={LINE * 1.6} />;
			break;
		case 'music':
			art = <g>{text('♪', INK)}</g>;
			break;
		case '!':
			art = text('!', RED);
			break;
		case '!?':
			art = text('!?', RED);
			break;
		default:
			art = text('?');
	}
	return (
		<g transform={`translate(${x} ${y}) scale(${s * p}) rotate(${wobble})`}>
			<Draw p={1}>{art}</Draw>
		</g>
	);
};

/** Speech or thought bubble (HTML, so text wraps). Anchored so its tail points at (x, y). */
export const Bubble: React.FC<{text: string; kind?: 'speech' | 'thought'; x: number; y: number; p: number; fontSize: number; maxWidth: number; side?: 'left' | 'right'}> = ({
	text,
	kind = 'speech',
	x,
	y,
	p,
	fontSize,
	maxWidth,
	side = 'right',
}) => {
	if (p <= 0.01) return null;
	const thought = kind === 'thought';
	return (
		<div
			style={{
				position: 'absolute',
				left: side === 'right' ? x - fontSize * 0.8 : undefined,
				right: side === 'left' ? undefined : undefined,
				top: y,
				transform: `translate(${side === 'left' ? '-100%' : '0'}, -100%) scale(${p})`,
				transformOrigin: side === 'left' ? '100% 100%' : '0% 100%',
				maxWidth,
				width: 'max-content',
				...(side === 'left' ? {left: x + fontSize * 0.8} : {}),
			}}
		>
			<div
				style={{
					fontFamily: HAND,
					fontWeight: 700,
					fontSize,
					lineHeight: 1.15,
					color: INK,
					background: PAPER,
					border: `${fontSize * 0.08}px solid ${INK}`,
					borderRadius: thought ? '50%' : fontSize * 0.7,
					padding: thought ? `${fontSize * 0.9}px ${fontSize * 1.1}px` : `${fontSize * 0.35}px ${fontSize * 0.6}px`,
					marginBottom: fontSize * 0.9,
					textAlign: 'center',
				}}
			>
				{text}
			</div>
			{thought ? (
				<>
					<div style={{position: 'absolute', bottom: fontSize * 0.35, [side === 'left' ? 'right' : 'left']: fontSize * 0.9, width: fontSize * 0.45, height: fontSize * 0.45, borderRadius: '50%', border: `${fontSize * 0.07}px solid ${INK}`, background: PAPER}} />
					<div style={{position: 'absolute', bottom: 0, [side === 'left' ? 'right' : 'left']: fontSize * 0.6, width: fontSize * 0.25, height: fontSize * 0.25, borderRadius: '50%', border: `${fontSize * 0.06}px solid ${INK}`, background: PAPER}} />
				</>
			) : (
				<svg style={{position: 'absolute', bottom: 0, [side === 'left' ? 'right' : 'left']: fontSize * 0.5, overflow: 'visible'}} width={fontSize} height={fontSize}>
					<path
						d={side === 'left' ? `M${fontSize * 0.2} ${fontSize * 0.02} L${fontSize * 0.9} ${fontSize} L${fontSize * 0.7} ${fontSize * 0.02}` : `M${fontSize * 0.2} ${fontSize * 0.02} L${fontSize * 0.1} ${fontSize} L${fontSize * 0.75} ${fontSize * 0.02}`}
						fill={PAPER}
						stroke={INK}
						strokeWidth={fontSize * 0.08}
						strokeLinejoin="round"
					/>
				</svg>
			)}
		</div>
	);
};

/** Red-pen annotation drawn on at frame `at`: a loose circle, an arrow, an underline or a big cross, with optional label. */
export const Note: React.FC<{
	kind: 'circle' | 'arrow' | 'underline' | 'cross' | 'label';
	rect: {x: number; y: number; w: number; h: number};
	at: number;
	label?: string;
	labelSize: number;
	/** Horizontal limits for the label so it never leaves the frame. */
	bounds: {x0: number; x1: number};
}> = ({kind, rect, at, label, labelSize, bounds}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [at, at + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (p <= 0) return null;
	const cx = rect.x + rect.w / 2;
	const cy = rect.y + rect.h / 2;
	const rx = rect.w / 2 + 30;
	const ry = rect.h / 2 + 30;
	let path = '';
	let labelPos = {x: cx, y: rect.y - 40};
	if (kind === 'circle') {
		// a hand-drawn loop that overshoots its start, like a real pen circle
		path = `M${cx - rx * 0.9} ${cy - ry * 0.35} C${cx - rx * 1.05} ${cy - ry * 1.15} ${cx + rx * 1.1} ${cy - ry * 1.1} ${cx + rx} ${cy + ry * 0.1} C${cx + rx * 0.95} ${cy + ry * 1.15} ${cx - rx * 1.1} ${cy + ry * 1.05} ${cx - rx * 0.98} ${cy - ry * 0.05} C${cx - rx * 0.95} ${cy - ry * 0.6} ${cx - rx * 0.5} ${cy - ry * 0.95} ${cx - rx * 0.1} ${cy - ry * 1.05}`;
		labelPos = {x: cx, y: cy - ry - labelSize * 0.4};
	} else if (kind === 'arrow') {
		// come in from whichever side has more room
		const fromLeft = cx > (bounds.x0 + bounds.x1) / 2;
		const sx = fromLeft ? rect.x - 70 : rect.x + rect.w + 70;
		const sy = rect.y - 70;
		const ex = fromLeft ? rect.x + rect.w * 0.2 : rect.x + rect.w * 0.8;
		const ey = rect.y + rect.h * 0.12;
		const back = fromLeft ? -1 : 1;
		path = `M${sx} ${sy} Q${(sx + ex) / 2} ${sy - 30} ${ex} ${ey} M${ex} ${ey} L${ex + back * 8} ${ey - 42} M${ex} ${ey} L${ex + back * 42} ${ey - 10}`;
		labelPos = {x: sx, y: sy - labelSize * 0.45};
	} else if (kind === 'label') {
		// field-guide figure label: dashed leader line from the target to typewriter text
		const toLeft = cx > (bounds.x0 + bounds.x1) / 2;
		const sx = toLeft ? rect.x : rect.x + rect.w;
		const sy = rect.y + rect.h * 0.3;
		const ex = toLeft ? sx - labelSize * 2.2 : sx + labelSize * 2.2;
		const ey = sy - labelSize * 1.6;
		const lp = interpolate(frame, [at, at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
		const half = ((label ?? '').length * labelSize * 0.62 * 0.56) / 2 + labelSize * 0.3; // typewriter glyphs ~0.56em wide
		const tx = Math.max(bounds.x0 + half, Math.min(bounds.x1 - half, ex));
		return (
			<g>
				<Draw p={lp}>
					<P d={`M${sx} ${sy} Q${(sx + ex) / 2} ${sy - labelSize * 0.2} ${ex} ${ey}`} strokeWidth={LINE * 0.7} strokeDasharray="10 9" sketch={false} />
				</Draw>
				<circle cx={sx} cy={sy} r={LINE * 1.3} fill={INK} opacity={lp} />
				<text x={tx} y={ey - labelSize * 0.35} textAnchor="middle" fontFamily={TYPE} fontSize={labelSize * 0.62} fill={INK} stroke={PAPER} strokeWidth={labelSize * 0.1} paintOrder="stroke" opacity={interpolate(lp, [0.5, 1], [0, 1], {extrapolateLeft: 'clamp'})}>
					{label}
				</text>
			</g>
		);
	} else if (kind === 'cross') {
		path = `M${rect.x + rect.w * 0.12} ${rect.y + rect.h * 0.15} Q${cx} ${cy - 10} ${rect.x + rect.w * 0.88} ${rect.y + rect.h * 0.85} M${rect.x + rect.w * 0.86} ${rect.y + rect.h * 0.12} Q${cx + 10} ${cy} ${rect.x + rect.w * 0.14} ${rect.y + rect.h * 0.88}`;
		labelPos = {x: cx, y: cy + labelSize * 0.35};
	} else {
		path = `M${rect.x - 10} ${rect.y + rect.h + 14} Q${cx} ${rect.y + rect.h + 4} ${rect.x + rect.w + 14} ${rect.y + rect.h + 18}`;
		labelPos = {x: cx, y: rect.y + rect.h + labelSize * 1.2};
	}
	const half = label ? Math.min((label.length * labelSize) / 3.4, (bounds.x1 - bounds.x0) / 2) : 0;
	labelPos.x = Math.max(bounds.x0 + half, Math.min(bounds.x1 - half, labelPos.x));
	return (
		<g>
			<Draw p={p}>
				<P d={path} stroke={RED} strokeWidth={LINE * 1.5} />
			</Draw>
			{label && (
				<text x={labelPos.x} y={labelPos.y} textAnchor="middle" fontFamily={MARKER} fontSize={labelSize} fill={RED} stroke={PAPER} strokeWidth={labelSize * 0.12} paintOrder="stroke" transform={kind === 'cross' ? `rotate(-8 ${labelPos.x} ${labelPos.y})` : undefined} opacity={interpolate(p, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'})}>
					{label}
				</text>
			)}
		</g>
	);
};
