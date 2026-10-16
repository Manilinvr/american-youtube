import React from 'react';
import {FELL, HAND} from '../fonts';
import {Ink, Shape, Spark} from './ink';
import {BOOK} from './palette';
import {Pt, roughEllipse, roughLine, roughPoly, roughRect, smooth} from './rough';

/**
 * Objects and backgrounds for textbook panels, drawn in the same ink + offset-print style.
 * Positions are in panel units; most objects take an anchor point and a scale.
 */

/** A room: wall (optionally striped), skirting, floor. */
export const RoomBG: React.FC<{w: number; h: number; floorY: number; wall?: string; floor?: string; stripes?: boolean; seed?: number}> = ({w, h, floorY, wall = '#D9CBAE', floor = BOOK.wood, stripes = true, seed = 1}) => (
	<g>
		<rect x={-40} y={-40} width={w + 80} height={floorY + 40} fill={wall} />
		<rect x={-40} y={-40} width={w + 80} height={floorY + 40} fill="url(#tb-light)" opacity={0.25} />
		{stripes &&
			Array.from({length: Math.ceil((w + 80) / 34)}, (_, i) => <line key={i} x1={-40 + i * 34} y1={-40} x2={-40 + i * 34} y2={floorY} stroke={BOOK.ink} strokeWidth={1} opacity={0.07} />)}
		<rect x={-40} y={floorY} width={w + 80} height={h - floorY + 40} fill={floor} />
		<rect x={-40} y={floorY} width={w + 80} height={h - floorY + 40} fill="url(#tb-mid)" opacity={0.3} />
		<rect x={-40} y={floorY - 10} width={w + 80} height={10} fill={BOOK.woodDark} opacity={0.7} />
		<Ink d={roughLine(-20, floorY, w + 20, floorY, seed, 0.6)} w={2} />
		<Ink d={roughLine(-20, floorY - 10, w + 20, floorY - 10, seed + 1, 0.6)} w={1.2} />
	</g>
);

export const Chair: React.FC<{x: number; y: number; s?: number; facing?: 1 | -1; color?: string}> = ({x, y, s = 1, facing = 1, color = BOOK.wood}) => (
	<g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
		<Shape d={roughRect(-30, 0, 66, 10, 701, 0.4)} color={color} />
		<Shape d={roughRect(-32, -86, 9, 92, 702, 0.4)} color={color} />
		<Shape d={roughRect(-28, 10, 7, 54, 703, 0.3)} color={BOOK.woodDark} />
		<Shape d={roughRect(26, 10, 7, 54, 704, 0.3)} color={BOOK.woodDark} />
		<Ink d={roughLine(-30, -60, -24, -60, 705, 0.2)} w={1.2} />
	</g>
);

export const Table: React.FC<{x: number; y: number; w?: number; color?: string; legs?: number}> = ({x, y, w = 120, color = BOOK.wood, legs = 70}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughRect(-w / 2, 0, w, 10, 711, 0.4)} color={color} hatch="light" />
		<Shape d={roughRect(-5, 10, 10, legs - 10, 712, 0.3)} color={BOOK.woodDark} />
		<Shape d={roughEllipse(0, legs, 26, 6, 713, 0.4)} color={BOOK.woodDark} />
	</g>
);

/** Cup with optional steam (t = seconds). */
export const Cup: React.FC<{x: number; y: number; s?: number; t?: number; color?: string}> = ({x, y, s = 1, t, color = BOOK.parchment}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<Shape d={smooth([[-9, -18], [9, -18], [8, 0], [-8, 0]], true, 0.4)} color={color} w={1.6} wear={false} />
		<Ink d="M9 -14 Q16 -12 9 -5" w={1.6} second={false} />
		{t !== undefined &&
			[0, 1].map((i) => {
				const k = (t * 0.6 + i * 0.5) % 1;
				return <Ink key={i} d={smooth([[-3 + i * 6, -22 - k * 8], [-6 + i * 6 + Math.sin(k * 6) * 2, -30 - k * 10], [-2 + i * 6, -38 - k * 12]])} w={1.1} opacity={Math.sin(k * Math.PI) * 0.6} second={false} />;
			})}
	</g>
);

/** A smartphone; `screen` is drawn inside (36x60 area centred). */
export const Phone: React.FC<{x: number; y: number; s?: number; rot?: number; glow?: number; screen?: React.ReactNode}> = ({x, y, s = 1, rot = 0, glow = 0, screen}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
		{glow > 0 && <circle cx={0} cy={0} r={60} fill="url(#tb-glow)" opacity={glow * 0.6} />}
		<Shape d={roughRect(-21, -36, 42, 72, 721, 0.4)} color={BOOK.black} w={1.8} wear={false} />
		<rect x={-17} y={-30} width={34} height={60} rx={2} fill={glow > 0 ? '#EFE3C4' : '#3E4549'} />
		{screen}
	</g>
);

/** Thought or speech bubble with a tail pointing at `tail` (relative to the bubble centre). */
export const Bubble: React.FC<{x: number; y: number; w: number; h: number; kind?: 'thought' | 'speech'; tail?: Pt; scale?: number; children?: React.ReactNode; seed?: number}> = ({
	x,
	y,
	w,
	h,
	kind = 'thought',
	tail = [-w * 0.4, h * 0.8],
	scale = 1,
	children,
	seed = 731,
}) => {
	if (scale <= 0.01) return null;
	const pts: Pt[] = [];
	const n = kind === 'thought' ? 14 : 10;
	for (let i = 0; i < n; i++) {
		const a = (i / n) * Math.PI * 2;
		const k = kind === 'thought' ? (i % 2 ? 1 : 0.9) : 1;
		pts.push([Math.cos(a) * (w / 2) * k, Math.sin(a) * (h / 2) * k]);
	}
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			{kind === 'thought' ? (
				<>
					<circle cx={tail[0] * 0.55} cy={tail[1] * 0.55 + h * 0.2} r={5} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1.5} />
					<circle cx={tail[0] * 0.85} cy={tail[1] * 0.85 + h * 0.15} r={3.5} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1.3} />
				</>
			) : (
				<Shape d={`M${-w * 0.12} ${h * 0.4} L${tail[0]} ${tail[1]} L${w * 0.08} ${h * 0.42} Z`} color={BOOK.parchment} w={1.8} wear={false} />
			)}
			<Shape d={smooth(pts, true, kind === 'thought' ? 1.4 : 1)} color={BOOK.parchment} w={1.8} wear={false} />
			{children}
		</g>
	);
};

/** Window with sky; night or dusk, with drifting clouds (t = seconds). */
export const SkyWindow: React.FC<{x: number; y: number; w: number; h: number; t: number; sky?: string; moon?: boolean; city?: boolean; id: string}> = ({x, y, w, h, t, sky = BOOK.nightDeep, moon = true, city, id}) => (
	<g>
		<clipPath id={id}>
			<rect x={x} y={y} width={w} height={h} />
		</clipPath>
		<rect x={x} y={y} width={w} height={h} fill={sky} />
		<g clipPath={`url(#${id})`}>
			{moon && <circle cx={x + w * 0.7} cy={y + h * 0.3} r={Math.min(w, h) * 0.1} fill={BOOK.moon} />}
			{[0, 1].map((i) => {
				const cx = x - 60 + ((t * (8 + i * 5) + i * 120) % (w + 120));
				return <ellipse key={i} cx={cx} cy={y + h * (0.3 + i * 0.3)} rx={40 - i * 8} ry={9} fill="#8E9A9C" opacity={0.6} />;
			})}
			{city &&
				Array.from({length: 7}, (_, i) => {
					const bh = h * (0.3 + ((i * 37) % 30) / 100);
					return (
						<g key={`b${i}`}>
							<rect x={x + i * (w / 6) - 8} y={y + h - bh} width={w / 6 - 6} height={bh} fill="#8F806A" />
							{[0, 1, 2].map((k) => (
								<rect key={k} x={x + i * (w / 6)} y={y + h - bh + 10 + k * 22} width={8} height={10} fill={(i + k) % 2 ? BOOK.glow : '#6E6252'} opacity={0.8} />
							))}
						</g>
					);
				})}
		</g>
		<Ink d={roughRect(x, y, w, h, 741, 0.6)} w={4} color="#B9AE96" second={false} />
		<Ink d={roughRect(x, y, w, h, 742, 0.6)} w={1.6} />
		<Ink d={roughLine(x + w / 2, y, x + w / 2, y + h, 743, 0.4)} w={3} color="#B9AE96" second={false} />
	</g>
);

export const Sofa: React.FC<{x: number; y: number; w?: number; color?: string}> = ({x, y, w = 220, color = '#8C5A45'}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughRect(-w / 2, -70, w, 50, 751, 0.6)} color={color} hatch="light" />
		<Shape d={roughRect(-w / 2 - 14, -40, 28, 52, 752, 0.5)} color={color} hatch="light" />
		<Shape d={roughRect(w / 2 - 14, -40, 28, 52, 753, 0.5)} color={color} hatch="light" />
		<Shape d={roughRect(-w / 2 + 10, -22, w - 20, 26, 754, 0.5)} color={color} />
		<Shape d={roughRect(-w / 2 - 6, 4, w + 12, 12, 755, 0.4)} color={BOOK.woodDark} />
	</g>
);

/** Wall calendar; `label` is the page shown, `flip` 0..1 animates a page turning over. */
export const Calendar: React.FC<{x: number; y: number; label: string; flip?: number; s?: number}> = ({x, y, label, flip = 0, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<Shape d={roughRect(-34, -40, 68, 80, 761, 0.4)} color={BOOK.parchment} w={1.6} />
		<rect x={-34} y={-40} width={68} height={18} fill={BOOK.terracotta} />
		<text x={0} y={-26} fontFamily={FELL} fontSize={13} fill={BOOK.parchment} textAnchor="middle">
			{label}
		</text>
		{Array.from({length: 12}, (_, i) => (
			<rect key={i} x={-26 + (i % 4) * 14} y={-14 + Math.floor(i / 4) * 14} width={9} height={9} fill="none" stroke={BOOK.ink} strokeWidth={0.8} opacity={0.6} />
		))}
		{flip > 0 && flip < 1 && <Shape d={roughRect(-34, -40, 68, 80 * (1 - flip), 762, 0.3)} color="#E7DCC4" w={1.4} wear={false} />}
		<circle cx={0} cy={-44} r={3} fill={BOOK.ink} />
	</g>
);

/** Clock face with hands (minute angle in degrees). */
export const ClockFace: React.FC<{x: number; y: number; r?: number; minutes: number}> = ({x, y, r = 18, minutes}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughEllipse(0, 0, r, r, 771, 0.4)} color={BOOK.parchment} w={1.6} />
		<g transform={`rotate(${minutes / 12})`}>
			<Ink d={`M0 0 L0 ${-r * 0.55}`} w={1.8} second={false} />
		</g>
		<g transform={`rotate(${minutes * 6})`}>
			<Ink d={`M0 0 L0 ${-r * 0.8}`} w={1.2} second={false} />
		</g>
	</g>
);

export const Door: React.FC<{x: number; y: number; w?: number; h?: number; open?: number}> = ({x, y, w = 70, h = 150, open = 0}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughRect(-w / 2 - 6, -h - 6, w + 12, h + 6, 781, 0.4)} color={BOOK.woodDark} />
		<rect x={-w / 2} y={-h} width={w} height={h} fill={BOOK.black} opacity={0.8} />
		<g transform={`translate(${-w / 2} 0) scale(${Math.cos(open * 1.2)} 1) translate(${w / 2} 0)`}>
			<Shape d={roughRect(-w / 2, -h, w, h, 782, 0.4)} color={BOOK.wood} hatch="light" />
			<circle cx={w / 2 - 10} cy={-h / 2} r={3.5} fill={BOOK.ochre} stroke={BOOK.ink} />
		</g>
	</g>
);

export const Jar: React.FC<{x: number; y: number; fill: number; label?: string}> = ({x, y, fill, label}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-26} y={-60 * fill} width={52} height={60 * fill} fill={BOOK.ochre} opacity={0.85} />
		{Array.from({length: Math.round(fill * 10)}, (_, i) => (
			<ellipse key={i} cx={-16 + (i % 4) * 11} cy={-6 - Math.floor(i / 4) * 12} rx={6} ry={3} fill={BOOK.glow} stroke={BOOK.ink} strokeWidth={0.8} />
		))}
		<Shape d={smooth([[-28, -70], [28, -70], [30, -4], [24, 0], [-24, 0], [-30, -4]], true, 0.5)} color="#DCE3E2" opacity={0.3} w={1.8} wear={false} />
		<Shape d={roughRect(-22, -80, 44, 10, 791, 0.3)} color={BOOK.brown} w={1.4} wear={false} />
		{label && (
			<text x={0} y={-30} fontFamily={HAND} fontSize={12} fill={BOOK.ink} textAnchor="middle">
				{label}
			</text>
		)}
	</g>
);

export const Coin: React.FC<{x: number; y: number; r?: number}> = ({x, y, r = 7}) => (
	<g>
		<ellipse cx={x} cy={y} rx={r} ry={r * 0.9} fill={BOOK.glow} stroke={BOOK.ink} strokeWidth={1.2} />
		<ellipse cx={x} cy={y} rx={r * 0.55} ry={r * 0.5} fill="none" stroke={BOOK.ochre} strokeWidth={1} />
	</g>
);

/** Drinking glass with a liquid level (0..1). */
export const Glass: React.FC<{x: number; y: number; level: number; color?: string; h?: number; label?: string; t?: number}> = ({x, y, level, color = '#7A6A3A', h = 80, label, t = 0}) => {
	const lv = Math.max(0, Math.min(1, level));
	const top = -h * lv;
	return (
		<g transform={`translate(${x} ${y})`}>
			{lv > 0 && <path d={`M${-22 + 4 * (1 - lv)} ${top} Q0 ${top + Math.sin(t * 3) * 2} ${22 - 4 * (1 - lv)} ${top} L18 0 L-18 0 Z`} fill={color} opacity={0.9} />}
			{lv > 0 && <path d={`M${-22 + 4 * (1 - lv)} ${top} Q0 ${top + Math.sin(t * 3) * 2} ${22 - 4 * (1 - lv)} ${top} L18 0 L-18 0 Z`} fill="url(#tb-stipple)" />}
			<Shape d={smooth([[-24, -h - 4], [24, -h - 4], [18, 0], [-18, 0]], true, 0.2)} color="#DCE3E2" opacity={0.25} w={1.8} wear={false} />
			{label && (
				<text x={0} y={22} fontFamily={FELL} fontStyle="italic" fontSize={15} fill={BOOK.ink} textAnchor="middle">
					{label}
				</text>
			)}
		</g>
	);
};

/** Side view of a brain in the style of an old anatomy plate. `spot` highlights a region (simplified). */
export const Brain: React.FC<{x: number; y: number; s?: number; spot?: Pt; spotR?: number; glow?: number}> = ({x, y, s = 1, spot, spotR = 18, glow = 0}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<Shape d={smooth([[-92, 6], [-96, -30], [-70, -66], [-24, -84], [30, -80], [74, -56], [96, -18], [92, 18], [64, 36], [20, 40], [-20, 44], [-60, 34]], true)} color="#E2C7B0" hatch="stipple" w={2.4} />
		{/* cerebellum and brainstem */}
		<Shape d={smooth([[34, 36], [70, 30], [86, 46], [70, 62], [40, 58]], true)} color="#D8BBA2" hatch="light" w={2} />
		<Shape d={smooth([[24, 40], [36, 42], [34, 84], [22, 84]], true, 0.4)} color="#D8BBA2" w={2} />
		{/* folds */}
		{[
			[[-80, -10], [-60, -30], [-66, -50], [-44, -60]],
			[[-40, -76], [-30, -50], [-48, -30], [-36, -6]],
			[[-6, -80], [4, -56], [-14, -34], [2, -12], [-6, 14]],
			[[34, -74], [26, -50], [44, -32], [30, -8]],
			[[66, -52], [52, -30], [70, -12], [60, 12]],
			[[-70, 20], [-40, 10], [-10, 26], [20, 18], [50, 24]],
		].map((pts, i) => (
			<Ink key={i} d={smooth(pts as Pt[])} w={1.4} opacity={0.75} second={false} />
		))}
		{spot && (
			<g>
				<circle cx={spot[0]} cy={spot[1]} r={spotR * 2} fill="url(#tb-glow)" opacity={0.5 + 0.5 * glow} />
				<ellipse cx={spot[0]} cy={spot[1]} rx={spotR} ry={spotR * 0.7} fill={BOOK.terracotta} opacity={0.55 + 0.3 * glow} />
			</g>
		)}
	</g>
);

/** Snake under a rock (for the uncertainty game). */
export const Snake: React.FC<{x: number; y: number; s?: number; t?: number}> = ({x, y, s = 1, t = 0}) => {
	const pts: Pt[] = Array.from({length: 9}, (_, i) => [i * 9 - 36, Math.sin(i * 1.1 + t * 5) * 5]);
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d={smooth(pts)} fill="none" stroke={BOOK.ink} strokeWidth={10} strokeLinecap="round" />
			<path d={smooth(pts)} fill="none" stroke={BOOK.olive} strokeWidth={7} strokeLinecap="round" />
			<Shape d={roughEllipse(40, pts[8][1], 9, 6, 801, 0.3)} color={BOOK.olive} w={1.6} wear={false} />
			<circle cx={43} cy={pts[8][1] - 2} r={1.6} fill={BOOK.ink} />
			<Ink d={`M48 ${pts[8][1]} l8 ${Math.sin(t * 9) * 3} M56 ${pts[8][1] + Math.sin(t * 9) * 3} l3 -3 M56 ${pts[8][1] + Math.sin(t * 9) * 3} l3 3`} w={1.2} color={BOOK.terracotta} second={false} />
		</g>
	);
};

export const Rock: React.FC<{x: number; y: number; w?: number; lift?: number; tilt?: number}> = ({x, y, w = 60, lift = 0, tilt = 0}) => (
	<g transform={`translate(${x} ${y - lift}) rotate(${tilt})`}>
		<Shape d={smooth([[-w / 2, 0], [-w * 0.42, -w * 0.3], [-w * 0.1, -w * 0.44], [w * 0.3, -w * 0.38], [w / 2, -w * 0.08], [w * 0.4, 4], [-w * 0.4, 4]], true)} color="#A39C8C" hatch="mid" w={2} />
	</g>
);

/** Little lightning mark (a mild shock). */
export const Zap: React.FC<{x: number; y: number; s?: number; on: number}> = ({x, y, s = 1, on}) =>
	on > 0.01 ? (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={on}>
			<Spark x={0} y={0} r={8} />
			<Shape d="M-4 -18 L6 -4 L-1 -3 L5 14 L-8 -2 L-1 -3 Z" color={BOOK.glow} w={1.4} wear={false} />
		</g>
	) : null;

/** Barrel seen from above at an angle, full of honey; `tar` spreads a dark stain (0..1). */
export const HoneyBarrel: React.FC<{x: number; y: number; tar: number; t: number}> = ({x, y, tar, t}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={smooth([[-90, -40], [90, -40], [100, 40], [92, 120], [-92, 120], [-100, 40]], true, 0.6)} color={BOOK.wood} hatch="mid" />
		{[-60, -20, 20, 60].map((sx, i) => (
			<Ink key={i} d={smooth([[sx, -40], [sx * 1.08, 40], [sx * 1.0, 120]])} w={1.2} opacity={0.6} second={false} />
		))}
		<Shape d={roughRect(-100, 0, 200, 10, 811, 0.4)} color="#6E6A62" w={1.6} />
		<Shape d={roughRect(-96, 80, 192, 10, 812, 0.4)} color="#6E6A62" w={1.6} />
		<Shape d={roughEllipse(0, -40, 90, 26, 813, 0.6)} color={BOOK.ochre} w={2.2} />
		<ellipse cx={-20} cy={-46} rx={30} ry={6} fill={BOOK.glow} opacity={0.6} />
		{tar > 0 && (
			<g>
				<ellipse cx={8} cy={-38} rx={86 * tar} ry={24 * tar} fill={BOOK.black} opacity={0.75 * tar} />
				{[0.3, 0.6, 0.9].map((k, i) => {
					const r = ((t * 0.5 + k) % 1) * tar;
					return <ellipse key={i} cx={8} cy={-38} rx={86 * r} ry={24 * r} fill="none" stroke={BOOK.black} strokeWidth={1.2} opacity={(1 - r) * 0.8} />;
				})}
			</g>
		)}
	</g>
);

/** A balance scale; tilt in degrees (+ = right pan down). */
export const Balance: React.FC<{x: number; y: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode}> = ({x, y, tilt, left, right}) => {
	const a = (tilt * Math.PI) / 180;
	const lx = -110 * Math.cos(a);
	const ly = -110 * Math.sin(a);
	const rx = 110 * Math.cos(a);
	const ry = 110 * Math.sin(a);
	const pan = (px: number, py: number, content: React.ReactNode) => (
		<g>
			<Ink d={`M${px} ${py} L${px - 34} ${py + 60} M${px} ${py} L${px + 34} ${py + 60}`} w={1.2} second={false} />
			<Shape d={smooth([[px - 44, py + 60], [px + 44, py + 60], [px + 30, py + 76], [px - 30, py + 76]], true, 0.4)} color="#B79D6A" w={1.8} />
			<g transform={`translate(${px} ${py + 60})`}>{content}</g>
		</g>
	);
	return (
		<g transform={`translate(${x} ${y})`}>
			<Shape d={roughRect(-6, 0, 12, 150, 821, 0.3)} color={BOOK.woodDark} />
			<Shape d={roughRect(-50, 150, 100, 12, 822, 0.3)} color={BOOK.woodDark} />
			<Ink d={`M${lx} ${ly} L${rx} ${ry}`} w={5} color={BOOK.woodDark} second={false} />
			<Ink d={`M${lx} ${ly} L${rx} ${ry}`} w={2} />
			<circle cx={0} cy={0} r={7} fill={BOOK.ochre} stroke={BOOK.ink} strokeWidth={1.6} />
			{pan(lx, ly, left)}
			{pan(rx, ry, right)}
		</g>
	);
};

/** Pebble for the scale: dark ("bad") or golden ("good"). */
export const Pebble: React.FC<{x: number; y: number; r?: number; bad?: boolean; seed?: number}> = ({x, y, r = 12, bad, seed = 831}) => (
	<Shape d={roughEllipse(x, y, r, r * 0.8, seed, 0.6)} color={bad ? BOOK.black : BOOK.glow} w={1.6} wear={!bad} />
);

/** A star rating row (filled stars appear one by one with p 0..1). */
export const Stars: React.FC<{x: number; y: number; n: number; p: number; s?: number}> = ({x, y, n, p, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{Array.from({length: 5}, (_, i) => {
			const on = i < n && p * n > i;
			const pts: Pt[] = Array.from({length: 10}, (_, k) => {
				const a = -Math.PI / 2 + (k * Math.PI) / 5;
				const r = k % 2 ? 4 : 9;
				return [i * 22 + Math.cos(a) * r, Math.sin(a) * r];
			});
			return <path key={i} d={`M${pts.map((q) => q.join(' ')).join(' L')} Z`} fill={on ? BOOK.ochre : 'none'} stroke={BOOK.ink} strokeWidth={1.3} />;
		})}
	</g>
);

/** An eye seen from the front (for gaze diagrams); `dir` -1..1 where the iris points. */
export const EyeIcon: React.FC<{x: number; y: number; s?: number; dir?: Pt}> = ({x, y, s = 1, dir = [0, 0]}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<Shape d="M-22 0 Q0 -16 22 0 Q0 16 -22 0 Z" color={BOOK.parchment} w={1.8} wear={false} />
		<circle cx={dir[0] * 10} cy={dir[1] * 4} r={7} fill={BOOK.brown} stroke={BOOK.ink} strokeWidth={1.2} />
		<circle cx={dir[0] * 10} cy={dir[1] * 4} r={3} fill={BOOK.ink} />
	</g>
);

/** Rounded rectangle used as the train/bus window band and seats. */
export const TrainInterior: React.FC<{w: number; h: number; t: number; id: string}> = ({w, h, t, id}) => (
	<g>
		<rect x={-40} y={-40} width={w + 80} height={h + 80} fill="#C9C3B2" />
		<rect x={-40} y={-40} width={w + 80} height={h + 80} fill="url(#tb-light)" opacity={0.3} />
		{/* windows with the city sliding past */}
		<clipPath id={id}>
			<rect x={-20} y={40} width={w + 40} height={110} />
		</clipPath>
		<rect x={-20} y={40} width={w + 40} height={110} fill="#9FAFB3" />
		<g clipPath={`url(#${id})`}>
			{Array.from({length: 14}, (_, i) => {
				const bx = ((i * 97 - t * 140) % (w + 300)) + (w + 300) * (i * 97 - t * 140 < 0 ? 1 : 0) - 150;
				const bh = 40 + ((i * 37) % 60);
				return <rect key={i} x={bx} y={150 - bh} width={60} height={bh} fill="#6F8186" opacity={0.7} />;
			})}
		</g>
		{[0, 1, 2].map((i) => (
			<Ink key={i} d={roughRect(-10 + i * ((w + 20) / 3), 40, (w + 20) / 3 - 8, 110, 851 + i, 0.5)} w={3} color="#8E8677" second={false} />
		))}
		<Ink d={roughLine(-20, 22, w + 20, 22, 855, 0.4)} w={4} color="#8E8677" second={false} />
		{/* hanging straps swing a little */}
		{[0.15, 0.45, 0.75].map((k, i) => (
			<g key={i} transform={`rotate(${Math.sin(t * 2 + i) * 4} ${w * k} 22)`}>
				<Ink d={`M${w * k} 22 L${w * k} 46`} w={2} second={false} />
				<Ink d={roughEllipse(w * k, 54, 7, 8, 856 + i, 0.3, 10)} w={2} second={false} />
			</g>
		))}
		<rect x={-40} y={h - 60} width={w + 80} height={100} fill="#8A8170" />
		<Ink d={roughLine(-20, h - 60, w + 20, h - 60, 859, 0.4)} w={2} />
	</g>
);

/** Long bench seat (train, waiting room). */
export const Bench: React.FC<{x: number; y: number; w: number; color?: string}> = ({x, y, w, color = '#7C8A6E'}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughRect(-w / 2, -62, w, 54, 861, 0.5)} color={color} hatch="light" />
		<Shape d={roughRect(-w / 2, -10, w, 16, 862, 0.5)} color={color} />
		<Shape d={roughRect(-w / 2 + 6, 6, w - 12, 40, 863, 0.4)} color={BOOK.woodDark} />
	</g>
);

/** Street at dusk with lamp posts (for walking scenes); `scroll` moves the street to make walking read. */
export const StreetBG: React.FC<{w: number; h: number; ground: number; scroll: number}> = ({w, h, ground, scroll}) => (
	<g>
		<rect x={-40} y={-40} width={w + 80} height={ground + 40} fill="#B7A68A" />
		<rect x={-40} y={-40} width={w + 80} height={ground * 0.5} fill={BOOK.ochre} opacity={0.35} />
		{Array.from({length: 8}, (_, i) => {
			const bx = (((i * 130 - scroll * 0.4) % (w + 260)) + (w + 260)) % (w + 260) - 130;
			const bh = 120 + ((i * 53) % 90);
			return (
				<g key={i}>
					<rect x={bx} y={ground - bh} width={110} height={bh} fill="#8F806A" />
					{Array.from({length: 6}, (_, k) => (
						<rect key={k} x={bx + 14 + (k % 3) * 30} y={ground - bh + 16 + Math.floor(k / 3) * 34} width={14} height={18} fill={(i + k) % 3 ? '#6E6252' : BOOK.glow} opacity={0.85} />
					))}
				</g>
			);
		})}
		<rect x={-40} y={ground} width={w + 80} height={h - ground + 40} fill="#8C8273" />
		<Ink d={roughLine(-20, ground, w + 20, ground, 871, 0.5)} w={2} />
		{Array.from({length: 4}, (_, i) => {
			const lx = (((i * 200 - scroll) % (w + 200)) + (w + 200)) % (w + 200) - 60;
			return (
				<g key={`l${i}`}>
					<Ink d={`M${lx} ${ground} L${lx} ${ground - 170}`} w={4} color={BOOK.black} second={false} />
					<circle cx={lx} cy={ground - 176} r={30} fill="url(#tb-glow)" opacity={0.8} />
					<Shape d={roughEllipse(lx, ground - 176, 9, 9, 872 + i, 0.3, 8)} color={BOOK.glow} w={1.4} wear={false} />
				</g>
			);
		})}
	</g>
);
