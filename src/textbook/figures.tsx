import React from 'react';
import {Fill, Ink, Shape} from './ink';
import {BOOK} from './palette';
import {Pt, roughEllipse, smooth} from './rough';

/**
 * The recurring character: round head, small dot eyes, brown hair with a side part, olive sweater.
 * Same proportions in every panel (only the scale changes), so the viewer meets one person.
 *
 * Faces are driven by continuous values so they can be animated:
 *   look [x, y] -1..1 (where the eyes point), lid 0..1 (0 open, 1 closed), worry 0..1, raise 0..1 (brows up),
 *   tilt in degrees.
 */
export type Eyes = 'open' | 'up' | 'closed' | 'side';
export type Brows = 'calm' | 'worried' | 'raised';
export type Mouth = 'flat' | 'worry' | 'soft' | 'o';

export type FaceProps = {
	eyes?: Eyes;
	brows?: Brows;
	mouth?: Mouth;
	blink?: boolean;
	look?: Pt;
	lid?: number;
	worry?: number;
	raise?: number;
	tilt?: number;
};

const presetLook = (eyes: Eyes): Pt => (eyes === 'up' ? [0.2, -1] : eyes === 'side' ? [1, 0] : [0, 0]);

/** Direction from a point to a target, scaled to -1..1 (for eyes that follow something). */
export const lookAt = (from: Pt, to: Pt, reach = 140): Pt => {
	const dx = to[0] - from[0];
	const dy = to[1] - from[1];
	const d = Math.hypot(dx, dy) || 1;
	const k = Math.min(1, d / reach);
	return [(dx / d) * k, (dy / d) * k];
};

export const Head: React.FC<{x: number; y: number; r: number; seed?: number} & FaceProps> = ({
	x,
	y,
	r,
	eyes = 'open',
	brows = 'calm',
	mouth = 'flat',
	blink = false,
	look,
	lid,
	worry,
	raise,
	tilt = 0,
	seed = 1,
}) => {
	const w = Math.max(1.2, Math.min(3, r * 0.06));
	const lk = look ?? presetLook(eyes);
	const lidV = Math.max(blink ? 1 : 0, lid ?? (eyes === 'closed' ? 1 : 0));
	const wor = worry ?? (brows === 'worried' ? 1 : 0);
	const rai = raise ?? (brows === 'raised' ? 1 : 0);
	const ex = r * 0.34;
	const ey = r * 0.04;
	const eye = (sx: number) => {
		const cx = sx * ex + lk[0] * r * 0.07;
		const cy = ey + lk[1] * r * 0.07;
		if (lidV > 0.82) return <Ink key={sx} d={`M${sx * ex - r * 0.11} ${ey} Q${sx * ex} ${ey + r * 0.08} ${sx * ex + r * 0.11} ${ey}`} w={w * 0.9} second={false} />;
		const ry = r * 0.078 * (1 - lidV * 0.9);
		return (
			<g key={sx}>
				<ellipse cx={cx} cy={cy + (r * 0.078 - ry) * 0.6} rx={r * 0.075} ry={ry} fill={BOOK.ink} />
				{lidV > 0.25 && <Ink d={`M${sx * ex - r * 0.12} ${ey - r * 0.08 + lidV * r * 0.07} L${sx * ex + r * 0.12} ${ey - r * 0.08 + lidV * r * 0.07}`} w={w * 0.8} second={false} />}
			</g>
		);
	};
	const brow = (sx: number) => {
		const inner = -0.2 - 0.07 * wor - 0.12 * rai;
		const outer = -0.2 + 0.03 * wor - 0.09 * rai;
		return <Ink key={`b${sx}`} d={`M${sx * r * 0.5} ${r * outer} L${sx * r * 0.18} ${r * inner}`} w={w * 0.85} second={false} />;
	};
	const my = r * 0.5;
	const mouthD =
		mouth === 'worry'
			? `M${-r * 0.14} ${my + r * 0.03} Q0 ${my - r * 0.05} ${r * 0.14} ${my + r * 0.03}`
			: mouth === 'soft'
				? `M${-r * 0.13} ${my} Q0 ${my + r * 0.07} ${r * 0.13} ${my}`
				: `M${-r * 0.12} ${my} L${r * 0.12} ${my + r * 0.01}`;
	const hair = `M${-r * 1.02} ${r * 0.12} C${-r * 1.12} ${-r * 0.9} ${-r * 0.3} ${-r * 1.28} ${r * 0.35} ${-r * 1.1} C${r * 0.92} ${-r * 0.96} ${r * 1.1} ${-r * 0.4} ${r * 1.0} ${r * 0.02} C${r * 0.82} ${-r * 0.42} ${r * 0.42} ${-r * 0.56} ${r * 0.08} ${-r * 0.44} C${-r * 0.32} ${-r * 0.64} ${-r * 0.82} ${-r * 0.46} ${-r * 1.02} ${r * 0.12} Z`;
	return (
		<g transform={`translate(${x} ${y}) rotate(${tilt})`}>
			<Shape d={roughEllipse(-r * 0.97, r * 0.08, r * 0.15, r * 0.21, seed + 1, 0.6, 10)} color={BOOK.skin} w={w * 0.9} wear={false} />
			<Shape d={roughEllipse(r * 0.97, r * 0.08, r * 0.15, r * 0.21, seed + 2, 0.6, 10)} color={BOOK.skin} w={w * 0.9} wear={false} />
			<Shape d={roughEllipse(0, 0, r, r * 1.04, seed, 0.8)} color={BOOK.skin} w={w} />
			<circle cx={-r * 0.56} cy={r * 0.3} r={r * 0.14} fill={BOOK.terracotta} opacity={0.18} />
			<circle cx={r * 0.56} cy={r * 0.3} r={r * 0.14} fill={BOOK.terracotta} opacity={0.18} />
			<Shape d={hair} color={BOOK.hair} w={w} hatch="light" hatchOpacity={0.6} />
			<Ink d={smooth([[-r * 0.55, -r * 0.62], [-r * 0.2, -r * 0.86], [r * 0.25, -r * 0.92]])} w={w * 0.5} color={BOOK.parchment} opacity={0.35} second={false} />
			{brow(-1)}
			{brow(1)}
			{eye(-1)}
			{eye(1)}
			<Ink d={`M${r * 0.03} ${r * 0.14} q${r * 0.07} ${r * 0.1} ${-r * 0.03} ${r * 0.15}`} w={w * 0.7} second={false} />
			{mouth === 'o' ? <ellipse cx={0} cy={my} rx={r * 0.07} ry={r * 0.09} fill={BOOK.ink} /> : <Ink d={mouthD} w={w * 0.85} second={false} />}
		</g>
	);
};

/** A hand: soft mitten shape with a thumb, in the character's skin tone. */
export const Hand: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
		<Shape d={smooth([[-8, -9], [6, -11], [13, -4], [12, 6], [2, 10], [-9, 8], [-12, 0]], true)} color={BOOK.skin} w={2.2 / s} wear={false} />
		<Ink d="M-2 -10 Q-6 -16 -1 -18" w={2 / s} second={false} />
	</g>
);

/** An arm: an outlined sleeve tube from shoulder to wrist. */
export const Sleeve: React.FC<{pts: Pt[]; width: number; color?: string}> = ({pts, width, color = BOOK.olive}) => {
	const d = smooth(pts);
	return (
		<g>
			<path d={d} fill="none" stroke={BOOK.ink} strokeWidth={width + 4.4} strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} fill="none" stroke="url(#tb-light)" strokeWidth={width * 0.5} strokeLinecap="round" opacity={0.5} transform={`translate(0 ${width * 0.2})`} />
		</g>
	);
};

/** Upper body in the olive sweater (torso only; arms are drawn by the caller so poses stay free). */
export const Torso: React.FC<{x: number; y: number; s: number; color?: string; lean?: number}> = ({x, y, s, color = BOOK.olive, lean = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${lean} 0 120) scale(${s})`}>
		<Shape d={smooth([[-44, 6], [-30, -6], [0, -10], [30, -6], [44, 6], [48, 70], [44, 120], [-44, 120], [-48, 70]], true)} color={color} hatch="light" w={2.2 / s} />
		<Shape d="M-14 -8 L0 12 L14 -8 Z" color={BOOK.ochre} w={1.8 / s} wear={false} />
		<Fill d={smooth([[22, 10], [38, 30], [40, 110], [26, 116]], true)} color={BOOK.ink} opacity={0.12} offset={false} wear={false} />
	</g>
);

/**
 * Someone lying in bed under a blanket, head propped on the pillow, facing us.
 * (x, y) = centre of the head; `len` = blanket length to the right; `breath` 0..1 lifts the chest.
 * `cover` 0..1 pulls the blanket up over the chin; `arm` brings a hand out from under the blanket.
 */
export const Sleeper: React.FC<
	{
		x: number;
		y: number;
		r: number;
		len: number;
		breath: number;
		blanket?: string;
		drop?: number;
		cover?: number;
		/** Extra lift of the whole blanket (a sigh, tossing). */
		heave?: number;
		/** Hand out of the blanket: where it is, and how far out (0..1). `holding` draws an object in it. */
		arm?: {hand: Pt; out: number; holding?: React.ReactNode};
	} & FaceProps
> = ({x, y, r, len, breath, blanket = BOOK.blue, drop, cover = 0, heave = 0, arm, ...face}) => {
	const lift = breath * r * 0.08 + heave * r * 0.18;
	const top = y + r * (0.72 - 0.42 * cover);
	const bottom = y + r * 0.72 + (drop ?? r * 1.6);
	const blanketD = smooth(
		[
			[x - r * 1.5, top + r * 0.35],
			[x - r * 0.4, top - lift * 0.4],
			[x + r * 1.2, top - r * 0.12 - lift],
			[x + r * 2.6, top - r * 0.05 - lift * 0.6],
			[x + len * 0.55, top + r * 0.25 - heave * r * 0.1],
			[x + len * 0.85, top + r * 0.1],
			[x + len, top + r * 0.55],
			[x + len, bottom],
			[x - r * 1.5, bottom],
		],
		true,
	);
	const shoulder: Pt = [x - r * 0.75, top + r * 0.45];
	return (
		<g>
			{/* pillow */}
			<Shape d={smooth([[x - r * 1.9, y + r * 0.9], [x - r * 1.7, y - r * 0.9], [x - r * 0.2, y - r * 1.25], [x + r * 1.5, y - r * 0.85], [x + r * 1.8, y + r * 0.8], [x, y + r * 1.15]], true)} color={BOOK.parchment} hatch="light" hatchOpacity={0.35} />
			<Ink d={smooth([[x - r * 1.3, y - r * 0.6], [x - r * 1.0, y - r * 0.2], [x - r * 1.25, y + r * 0.3]])} w={1.2} opacity={0.5} second={false} />
			<Head x={x} y={y + heave * r * 0.04} r={r} {...face} />
			{/* blanket, folded back at the top */}
			<Shape d={blanketD} color={blanket} hatch="mid" hatchOpacity={0.55} />
			<Shape
				d={smooth(
					[
						[x - r * 1.5, top + r * 0.35],
						[x - r * 0.4, top - lift * 0.4],
						[x + r * 1.2, top - r * 0.12 - lift],
						[x + r * 2.6, top - r * 0.05 - lift * 0.6],
						[x + r * 2.5, top + r * 0.4],
						[x + r * 1.2, top + r * 0.3 - lift],
						[x - r * 0.4, top + r * 0.42],
						[x - r * 1.45, top + r * 0.7],
					],
					true,
				)}
				color={BOOK.parchment}
				hatch="light"
				hatchOpacity={0.4}
			/>
			{/* folds */}
			<Ink d={smooth([[x + len * 0.35, top + r * 0.5], [x + len * 0.45, (top + bottom) / 2 + r * 0.2], [x + len * 0.42, bottom - r * 0.1]])} w={1.3} opacity={0.6} second={false} />
			<Ink d={smooth([[x + len * 0.7, top + r * 0.45], [x + len * 0.76, (top + bottom) / 2 + r * 0.1]])} w={1.3} opacity={0.6} second={false} />
			{arm && arm.out > 0.01 && (
				<g>
					{(() => {
						// the arm slides out from under the fold of the blanket toward the hand
						const hx = shoulder[0] + (arm.hand[0] - shoulder[0]) * arm.out;
						const hy = shoulder[1] + (arm.hand[1] - shoulder[1]) * arm.out;
						const elbow: Pt = [(shoulder[0] + hx) / 2 + r * 0.1, Math.max(shoulder[1], hy) + r * 0.25];
						return (
							<g>
								<Sleeve pts={[shoulder, elbow, [hx, hy]]} width={r * 0.42} color={BOOK.ochre} />
								{arm.holding && <g transform={`translate(${hx} ${hy})`}>{arm.holding}</g>}
								<Hand x={hx} y={hy} s={r / 34} rot={-30} />
							</g>
						);
					})()}
				</g>
			)}
		</g>
	);
};
