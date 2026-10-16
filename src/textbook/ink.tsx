import React, {createContext, useContext} from 'react';
import {interpolate} from 'remotion';
import {FELL} from '../fonts';
import {BOOK, W} from './palette';
import {rng} from './rough';

/**
 * Ink primitives for the textbook style.
 *  - <Ink>: an outline that can draw itself on (p 0..1), with a faint second pass so the line
 *    thickness is slightly uneven, like a dip pen.
 *  - <Fill>: flat colour printed slightly off-register from the outline, with optional engraving-style
 *    hatching and "ink wear" specks (all vector patterns, so they stay crisp when the camera pushes in).
 *  - <Reveal p>: everything inside draws on as p goes 0 -> 1.
 */
const RevealCtx = createContext(1);
export const Reveal: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
	<RevealCtx.Provider value={Math.max(0, Math.min(1, p))}>{children}</RevealCtx.Provider>
);
export const useReveal = () => useContext(RevealCtx);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

type InkProps = {d: string; w?: number; color?: string; opacity?: number; p?: number; dash?: string; second?: boolean};

export const Ink: React.FC<InkProps> = ({d, w = W.line, color = BOOK.ink, opacity = 1, p, dash, second = true}) => {
	const ctx = useReveal();
	const prog = clamp01(p ?? ctx);
	if (prog <= 0) return null;
	const reveal = prog >= 0.999 ? {} : dash ? {} : {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - prog};
	const op = dash && prog < 0.999 ? opacity * prog : opacity;
	const common = {d, fill: 'none', stroke: color, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...(dash ? {strokeDasharray: dash} : {}), ...reveal};
	return (
		<>
			<path {...common} strokeWidth={w} opacity={op} />
			{second && w >= 1.4 && <path {...common} strokeWidth={w * 0.45} opacity={op * 0.3} transform="translate(0.7 -0.5)" />}
		</>
	);
};

export type HatchKind = 'light' | 'mid' | 'dense' | 'cross' | 'stipple';

type FillProps = {d: string; color: string; opacity?: number; hatch?: HatchKind; hatchOpacity?: number; wear?: boolean; p?: number; offset?: boolean};

/** Flat print colour, nudged off-register from the outline like an old two-plate print. */
export const Fill: React.FC<FillProps> = ({d, color, opacity = 1, hatch, hatchOpacity = 1, wear = true, p, offset = true}) => {
	const ctx = useReveal();
	const prog = clamp01(p ?? ctx);
	const fade = interpolate(prog, [0.3, 0.85], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	if (fade <= 0) return null;
	const t = offset ? 'translate(1.4 1.1)' : undefined;
	return (
		<g transform={t} opacity={opacity * fade}>
			<path d={d} fill={color} />
			{hatch && <path d={d} fill={`url(#tb-${hatch})`} opacity={hatchOpacity} />}
			{wear && <path d={d} fill="url(#tb-wear)" />}
		</g>
	);
};

/** Filled shape with an ink outline. */
export const Shape: React.FC<FillProps & {w?: number; stroke?: string; noOutline?: boolean}> = ({w = W.line, stroke = BOOK.ink, noOutline, ...fill}) => (
	<>
		<Fill {...fill} />
		{!noOutline && <Ink d={fill.d} w={w} color={stroke} p={fill.p} />}
	</>
);

type TextProps = {
	x: number;
	y: number;
	size: number;
	children?: React.ReactNode;
	font?: string;
	color?: string;
	anchor?: 'start' | 'middle' | 'end';
	italic?: boolean;
	opacity?: number;
	weight?: number;
	spacing?: number;
	rotate?: number;
};

/** Printed text (fades in with the reveal). */
export const T: React.FC<TextProps> = ({x, y, size, children, font = FELL, color = BOOK.ink, anchor = 'start', italic, opacity = 1, weight = 400, spacing = 0, rotate = 0}) => {
	const p = useReveal();
	const fade = clamp01((p - 0.4) / 0.4);
	if (fade <= 0) return null;
	return (
		<text
			x={x}
			y={y}
			fontFamily={font}
			fontSize={size}
			fill={color}
			textAnchor={anchor}
			fontStyle={italic ? 'italic' : 'normal'}
			fontWeight={weight}
			letterSpacing={spacing}
			opacity={opacity * fade}
			transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
		>
			{children}
		</text>
	);
};

/** Text that appears letter by letter as p goes 0 -> 1 (handwriting, typesetting). */
export const Write: React.FC<Omit<TextProps, 'children'> & {text: string; p: number}> = ({text, p, x, y, size, font = FELL, color = BOOK.ink, anchor = 'start', italic, opacity = 1, weight = 400, spacing = 0, rotate = 0}) => {
	if (p <= 0) return null;
	const chars = Array.from(text);
	const n = chars.length;
	return (
		<text
			x={x}
			y={y}
			fontFamily={font}
			fontSize={size}
			fill={color}
			textAnchor={anchor}
			fontStyle={italic ? 'italic' : 'normal'}
			fontWeight={weight}
			letterSpacing={spacing}
			opacity={opacity}
			transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
		>
			{chars.map((c, i) => (
				<tspan key={i} opacity={clamp01(p * (n + 2) - i)}>
					{c}
				</tspan>
			))}
		</text>
	);
};

/** Leader line + label, the way a textbook points at a part of a diagram. */
export const Callout: React.FC<{from: [number, number]; to: [number, number]; text: string; size?: number; p: number; color?: string; anchor?: 'start' | 'middle' | 'end'; italic?: boolean; dy?: number}> = ({
	from,
	to,
	text,
	size = 15,
	p,
	color = BOOK.ink,
	anchor = 'start',
	italic = true,
	dy = 5,
}) => {
	const line = clamp01(p * 1.6);
	const label = clamp01(p * 1.6 - 0.6);
	return (
		<g>
			<Ink d={`M${from[0]} ${from[1]} L${to[0]} ${to[1]}`} w={W.hair} color={color} p={line} second={false} />
			{line > 0 && <circle cx={from[0]} cy={from[1]} r={1.8 * line} fill={color} />}
			<Write text={text} p={label} x={to[0] + (anchor === 'start' ? 4 : anchor === 'end' ? -4 : 0)} y={to[1] + dy} size={size} italic={italic} color={color} anchor={anchor} />
		</g>
	);
};

/** Vector patterns and gradients shared by every textbook illustration. Render once inside the page <svg>. */
export const BookDefs: React.FC = () => {
	const specks = React.useMemo(() => {
		const r = rng(42);
		return Array.from({length: 40}, () => ({x: r() * 90, y: r() * 90, rad: 0.3 + r() * 1.0, o: 0.3 + r() * 0.5}));
	}, []);
	const scratches = React.useMemo(() => {
		const r = rng(7);
		return Array.from({length: 5}, () => {
			const x = r() * 90;
			const y = r() * 90;
			const a = r() * Math.PI;
			const l = 3 + r() * 6;
			return {x1: x, y1: y, x2: x + Math.cos(a) * l, y2: y + Math.sin(a) * l};
		});
	}, []);
	const hatch = (id: string, gap: number, width: number, op: number, angle = -40) => (
		<pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
			<line x1={0} y1={0} x2={0} y2={gap} stroke={BOOK.ink} strokeWidth={width} opacity={op} />
		</pattern>
	);
	return (
		<defs>
			{hatch('tb-light', 7, 0.8, 0.3)}
			{hatch('tb-mid', 4.6, 0.9, 0.38)}
			{hatch('tb-dense', 3.2, 1, 0.5)}
			<pattern id="tb-cross" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
				<line x1={0} y1={0} x2={0} y2={5} stroke={BOOK.ink} strokeWidth={0.9} opacity={0.38} />
				<line x1={0} y1={0} x2={5} y2={0} stroke={BOOK.ink} strokeWidth={0.7} opacity={0.28} />
			</pattern>
			<pattern id="tb-stipple" width="11" height="11" patternUnits="userSpaceOnUse">
				{[
					[2, 3],
					[7, 1],
					[9, 7],
					[4, 8],
					[1, 10],
					[6, 5],
				].map(([x, y], i) => (
					<circle key={i} cx={x} cy={y} r={0.65} fill={BOOK.ink} opacity={0.45} />
				))}
			</pattern>
			{/* ink wear: paper showing through the print */}
			<pattern id="tb-wear" width="90" height="90" patternUnits="userSpaceOnUse">
				{specks.map((s, i) => (
					<circle key={i} cx={s.x} cy={s.y} r={s.rad} fill={BOOK.parchment} opacity={s.o * 0.34} />
				))}
				{scratches.map((s, i) => (
					<line key={`s${i}`} {...s} stroke={BOOK.parchment} strokeWidth={0.5} opacity={0.35} />
				))}
			</pattern>
			<radialGradient id="tb-glow">
				<stop offset="0" stopColor={BOOK.glow} stopOpacity={0.9} />
				<stop offset="0.35" stopColor={BOOK.ochre} stopOpacity={0.45} />
				<stop offset="1" stopColor={BOOK.ochre} stopOpacity={0} />
			</radialGradient>
			<radialGradient id="tb-spark">
				<stop offset="0" stopColor="#FFF4DA" stopOpacity={1} />
				<stop offset="0.4" stopColor={BOOK.glow} stopOpacity={0.85} />
				<stop offset="1" stopColor={BOOK.ochre} stopOpacity={0} />
			</radialGradient>
			<radialGradient id="tb-age">
				<stop offset="0" stopColor={BOOK.brown} stopOpacity={0.1} />
				<stop offset="1" stopColor={BOOK.brown} stopOpacity={0} />
			</radialGradient>
			<radialGradient id="tb-panel-light" cx="0.45" cy="0.4" r="0.75">
				<stop offset="0" stopColor="#FFFFFF" stopOpacity={0.12} />
				<stop offset="1" stopColor={BOOK.brown} stopOpacity={0.1} />
			</radialGradient>
		</defs>
	);
};

/** A glowing dot (nerve impulse, lamp spark). */
export const Spark: React.FC<{x: number; y: number; r?: number; opacity?: number}> = ({x, y, r = 6, opacity = 1}) => (
	<g opacity={opacity}>
		<circle cx={x} cy={y} r={r * 2.6} fill="url(#tb-spark)" opacity={0.55} />
		<circle cx={x} cy={y} r={r * 0.55} fill="#FFF4DA" />
	</g>
);
