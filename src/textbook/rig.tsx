import React from 'react';
import {FaceProps, HairStyle} from './figures';
import {Ink, Shape} from './ink';
import {BOOK} from './palette';
import {Pt, roughEllipse, smooth} from './rough';

/**
 * The drawn character for the textbook style.
 *
 * Built like a hand-drawn figure, not a cut-out: the body is one soft tube that follows a bendable spine
 * (it leans, slouches and straightens), the arms grow from the shoulder at the top of that tube and the legs
 * from the hip, all solved with two-bone IK so hands and feet can be sent anywhere while elbows and knees
 * bend the natural way. In action the figure is seen in profile: the face, the chest and the feet all point
 * where the person is going; `turn` < 0 shows them from behind.
 *
 * Coordinates are local: origin at the pelvis, facing right. A standing figure is ~280 units tall
 * (feet at y = +112, top of the head at y = -168).
 */
export type Grip = 'relaxed' | 'open' | 'fist' | 'point' | 'hold';
export type Arm = {hand: Pt; grip?: Grip; rot?: number; hold?: React.ReactNode; elbow?: 'down' | 'up' | 'out'};
export type Look = {top?: string; bottom?: string; shoes?: string; collar?: string; hair?: HairStyle; hairColor?: string; skin?: string};

export const MAIN: Look = {top: BOOK.olive, bottom: '#5E4A3A', shoes: '#3A322B', collar: BOOK.ochre, hair: 'side', hairColor: BOOK.hair, skin: BOOK.skin};
export const FRIEND: Look = {top: BOOK.terracotta, bottom: '#4C4A44', shoes: '#3A322B', collar: BOOK.parchment, hair: 'long', hairColor: '#3E3029', skin: '#C9A27A'};
export const STRANGER: Look = {top: BOOK.blue, bottom: '#4A4036', shoes: '#2F2A25', collar: BOOK.parchment, hair: 'short', hairColor: '#2E2722', skin: '#A27C5A'};
export const ELDER: Look = {top: BOOK.brown, bottom: '#4C4A44', shoes: '#3A322B', collar: BOOK.ochre, hair: 'curly', hairColor: '#B9B2A6', skin: BOOK.skin};

const R = 33; // head radius
const SPINE = 98;
const UPPER = 47;
const FORE = 45;
const THIGH = 58;
const SHIN = 57;

/** Two-bone IK: returns the middle joint; `prefer` picks between the two possible bends. */
export const solve = (a: Pt, target: Pt, l1: number, l2: number, prefer: (p: Pt) => number): {mid: Pt; end: Pt} => {
	const dx = target[0] - a[0];
	const dy = target[1] - a[1];
	const d = Math.max(Math.abs(l1 - l2) + 1, Math.min(l1 + l2 - 0.8, Math.hypot(dx, dy)));
	const base = Math.atan2(dy, dx);
	const A = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
	const c1: Pt = [a[0] + Math.cos(base + A) * l1, a[1] + Math.sin(base + A) * l1];
	const c2: Pt = [a[0] + Math.cos(base - A) * l1, a[1] + Math.sin(base - A) * l1];
	const end: Pt = [a[0] + Math.cos(base) * d, a[1] + Math.sin(base) * d];
	return {mid: prefer(c1) >= prefer(c2) ? c1 : c2, end};
};

/** A limb as a soft tube that narrows toward the wrist/ankle, with an ink outline. */
const Limb: React.FC<{a: Pt; b: Pt; c: Pt; w0: number; w1: number; color: string}> = ({a, b, c, w0, w1, color}) => {
	const unit = (p: Pt, q: Pt): Pt => {
		const dx = q[0] - p[0];
		const dy = q[1] - p[1];
		const l = Math.hypot(dx, dy) || 1;
		return [dx / l, dy / l];
	};
	const u1 = unit(a, b);
	const u2 = unit(b, c);
	const n1: Pt = [-u1[1], u1[0]];
	const n2: Pt = [-u2[1], u2[0]];
	const nl = Math.hypot(n1[0] + n2[0], n1[1] + n2[1]) || 1;
	const nj: Pt = [(n1[0] + n2[0]) / nl, (n1[1] + n2[1]) / nl];
	const wj = (w0 + w1) / 2;
	const off = (p: Pt, n: Pt, w: number): Pt => [p[0] + n[0] * w, p[1] + n[1] * w];
	const pts: Pt[] = [
		off(a, n1, w0 / 2),
		off(b, nj, wj / 2),
		off(c, n2, w1 / 2),
		[c[0] + u2[0] * w1 * 0.45, c[1] + u2[1] * w1 * 0.45],
		off(c, n2, -w1 / 2),
		off(b, nj, -wj / 2),
		off(a, n1, -w0 / 2),
		[a[0] - u1[0] * w0 * 0.4, a[1] - u1[1] * w0 * 0.4],
	];
	return <Shape d={smooth(pts, true, 0.8)} color={color} hatch="light" hatchOpacity={0.55} w={2.1} />;
};

/** Mitten hand at the wrist, pointing along `angle` (degrees). Always attached to the cuff. */
export const HandShape: React.FC<{at: Pt; angle: number; grip?: Grip; skin: string; s?: number}> = ({at, angle, grip = 'relaxed', skin, s = 1}) => {
	const body =
		grip === 'open'
			? smooth([[-3, -6], [8, -8], [17, -7], [19, -1], [17, 5], [8, 7], [-2, 6]], true)
			: grip === 'fist' || grip === 'hold' || grip === 'point'
				? smooth([[-3, -6], [8, -7], [12, -3], [12, 4], [8, 7], [-2, 6]], true)
				: smooth([[-3, -6], [8, -7], [14, -3], [14, 3], [9, 7], [-2, 6]], true);
	return (
		<g transform={`translate(${at[0]} ${at[1]}) rotate(${angle}) scale(${s})`}>
			<Shape d={body} color={skin} w={1.9} wear={false} />
			{grip === 'point' && <Shape d={smooth([[10, -3], [22, -2.5], [23, 0], [22, 2], [10, 2]], true)} color={skin} w={1.6} wear={false} />}
			{grip === 'open' && <Ink d="M9 -3 L16 -3 M9 1 L17 1 M9 4 L15 4" w={0.9} opacity={0.55} second={false} />}
			<Shape d={smooth([[2, -5], [6, -10], [11, -9], [8, -4]], true)} color={skin} w={1.5} wear={false} />
		</g>
	);
};

/** Head for the drawn character: profile when turned, three-quarter otherwise, or seen from behind. */
export const FigHead: React.FC<{x: number; y: number; r: number; view: 'profile' | 'three' | 'back'; face: FaceProps; look: Look; seed: number}> = ({x, y, r, view, face, look, seed}) => {
	const hairColor = look.hairColor ?? BOOK.hair;
	const skin = look.skin ?? BOOK.skin;
	const style = look.hair ?? 'side';
	const w = 2.2;
	const lk = face.look ?? [0, 0];
	const lid = Math.max(face.blink ? 1 : 0, face.lid ?? 0);
	const worry = face.worry ?? 0;
	const raise = face.raise ?? 0;
	const smile = face.smile ?? (face.mouth === 'soft' ? 0.5 : 0);
	const talk = face.talk ?? 0;
	// hair sits on the back and the top of the head, so the direction of the face reads at a glance
	const P = (deg: number, k = 1): Pt => [Math.cos((deg * Math.PI) / 180) * r * k, Math.sin((deg * Math.PI) / 180) * r * k];
	const capFor = (from: number, to: number, depth: number) => {
		const outer: Pt[] = Array.from({length: 9}, (_, i) => P(from + ((to - from) * i) / 8, 1.06));
		const inner: Pt[] = Array.from({length: 7}, (_, i) => P(to - ((to - from) * i) / 6, depth)).map(([px, py], i) => [px, py + Math.sin((i / 6) * Math.PI) * r * 0.06] as Pt);
		return smooth([...outer, ...inner], true, 0.9);
	};
	const back = view === 'back';
	const hairBehind =
		style === 'long' ? (
			<Shape d={smooth(back ? [P(200, 1.05), P(270, 1.08), P(340, 1.05), [r * 1.05, r * 0.9], [r * 0.7, r * 1.55], [-r * 0.7, r * 1.55], [-r * 1.05, r * 0.9]] : [P(250, 1.06), P(200, 1.06), [-r * 1.12, r * 0.6], [-r * 0.9, r * 1.55], [-r * 0.2, r * 1.5], [-r * 0.1, r * 0.5]], true)} color={hairColor} hatch="light" hatchOpacity={0.5} w={w} />
		) : style === 'bun' ? (
			<Shape d={roughEllipse(back ? 0 : -r * 0.95, back ? -r * 0.95 : -r * 0.55, r * 0.34, r * 0.3, seed + 7, 0.5)} color={hairColor} hatch="light" hatchOpacity={0.5} w={w} />
		) : null;
	let hairFront: React.ReactNode;
	if (back) {
		hairFront = <Shape d={smooth([P(160, 1.05), P(205, 1.07), P(270, 1.08), P(335, 1.07), P(20, 1.05), [r * 0.6, r * 0.45], [-r * 0.6, r * 0.45]], true)} color={hairColor} hatch="light" hatchOpacity={0.55} w={w} />;
	} else if (style === 'curly') {
		hairFront = (
			<g>
				{Array.from({length: 8}, (_, i) => {
					const [cx, cy] = P(150 + i * 17, 0.92);
					return <Shape key={i} d={roughEllipse(cx, cy, r * 0.3, r * 0.28, seed + 20 + i, 0.4, 9)} color={hairColor} w={w * 0.85} wear={false} />;
				})}
			</g>
		);
	} else {
		// the cap: from just above the forehead, over the crown, down the back of the head
		const from = view === 'profile' ? 300 : 285;
		const to = style === 'short' ? 172 : 160;
		hairFront = <Shape d={capFor(to, from + 360 - 360, style === 'short' ? 0.72 : 0.6)} color={hairColor} hatch="light" hatchOpacity={0.55} w={w} />;
	}
	// face
	const eyes: number[] = view === 'profile' ? [0.42] : [0.06, 0.5];
	const ey = -r * 0.06;
	const eye = (ex: number, i: number) => {
		const cx = ex * r + lk[0] * r * 0.06;
		const cy = ey + lk[1] * r * 0.07;
		if (lid > 0.82) return <Ink key={i} d={`M${ex * r - r * 0.1} ${ey} Q${ex * r} ${ey + r * 0.08} ${ex * r + r * 0.1} ${ey}`} w={w * 0.85} second={false} />;
		const ry = r * 0.085 * (1 - lid * 0.9);
		return <ellipse key={i} cx={cx} cy={cy + (r * 0.085 - ry) * 0.5} rx={r * 0.07} ry={ry} fill={BOOK.ink} />;
	};
	const brow = (ex: number, i: number) => {
		const inner = -0.24 - 0.06 * worry - 0.1 * raise;
		const outer = -0.26 + 0.05 * worry - 0.08 * raise;
		return <Ink key={`b${i}`} d={`M${(ex - 0.12) * r} ${outer * r} L${(ex + 0.1) * r} ${inner * r}`} w={w * 0.8} second={false} />;
	};
	const mx = view === 'profile' ? r * 0.58 : r * 0.3;
	const my = r * 0.4;
	const mouth =
		talk > 0.15 || face.mouth === 'o' ? (
			<ellipse cx={mx} cy={my + r * 0.02} rx={r * 0.08} ry={r * (face.mouth === 'o' ? 0.09 : 0.02 + 0.07 * talk)} fill={BOOK.ink} />
		) : smile > 0.05 && face.mouth !== 'worry' ? (
			<Ink d={`M${mx - r * 0.16} ${my - smile * r * 0.04} Q${mx} ${my + r * 0.04 + smile * r * 0.12} ${mx + r * 0.14} ${my - smile * r * 0.06}`} w={w * 0.85} second={false} />
		) : face.mouth === 'worry' || worry > 0.6 ? (
			<Ink d={`M${mx - r * 0.13} ${my + r * 0.03} Q${mx} ${my - r * 0.05} ${mx + r * 0.12} ${my + r * 0.03}`} w={w * 0.85} second={false} />
		) : (
			<Ink d={`M${mx - r * 0.12} ${my} L${mx + r * 0.1} ${my}`} w={w * 0.85} second={false} />
		);
	return (
		<g transform={`translate(${x} ${y}) rotate(${face.tilt ?? 0})`}>
			{hairBehind}
			<Shape d={roughEllipse(0, 0, r, r * 1.02, seed, 0.6)} color={skin} w={w} />
			{!back && <circle cx={view === 'profile' ? r * 0.36 : r * 0.2} cy={r * 0.26} r={r * 0.13} fill={BOOK.terracotta} opacity={0.2} />}
			{hairFront}
			{!back && eyes.map(eye)}
			{!back && eyes.map(brow)}
			{!back && view === 'profile' && <Ink d={`M${r * 0.96} ${-r * 0.02} q${r * 0.14} ${r * 0.1} ${-r * 0.01} ${r * 0.2}`} w={w * 0.8} second={false} />}
			{!back && mouth}
		</g>
	);
};

export type FigureProps = {
	x: number;
	y: number;
	s?: number;
	facing?: 1 | -1;
	pose?: 'stand' | 'sit' | 'walk';
	/** walk cycle phase in radians (advance it with time for walking) */
	walk?: number;
	/** upper-body lean in degrees (+ toward the facing direction) */
	lean?: number;
	/** 0..1 slouch: the upper back curls forward (tired, sad, reading) */
	slouch?: number;
	/** 0..1 breathing */
	breath?: number;
	/** 0 = profile with a three-quarter face, 1 = full profile, < -0.55 = seen from behind */
	turn?: number;
	near?: Arm;
	far?: Arm;
	look?: Look;
	face?: FaceProps;
	/** feet override (local coords) */
	feet?: {near?: Pt; far?: Pt};
	/** seat to floor distance for sitting */
	seat?: number;
	seed?: number;
};

/** Natural default arm positions for a pose (local coords). */
export const restArms = (pose: FigureProps['pose'], walk = 0): {near: Arm; far: Arm} => {
	if (pose === 'sit') return {near: {hand: [40, -12]}, far: {hand: [30, -10]}};
	if (pose === 'walk') {
		const sw = Math.sin(walk);
		return {near: {hand: [6 - 30 * sw, -10 + 4 * Math.abs(sw)]}, far: {hand: [2 + 30 * sw, -12 + 4 * Math.abs(sw)]}};
	}
	return {near: {hand: [8, -6]}, far: {hand: [-2, -8]}};
};

const shade = (hex: string, k = 0.8) => {
	const n = parseInt(hex.slice(1), 16);
	const r = Math.round(((n >> 16) & 255) * k);
	const g = Math.round(((n >> 8) & 255) * k);
	const b = Math.round((n & 255) * k);
	return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

export const Figure: React.FC<FigureProps> = ({x, y, s = 1, facing = 1, pose = 'stand', walk = 0, lean = 0, slouch = 0, breath = 0, turn = 0.6, near, far, look = MAIN, face = {}, feet, seat = 62, seed = 3}) => {
	const L = {...MAIN, ...look};
	const back = turn < -0.55;
	const view: 'profile' | 'three' | 'back' = back ? 'back' : (face.turn ?? turn) > 0.45 ? 'profile' : 'three';
	const rest = restArms(pose, walk);
	const nArm = near ?? rest.near;
	const fArm = far ?? rest.far;
	const walking = pose === 'walk';
	const bob = walking ? -Math.abs(Math.cos(walk)) * 4 : 0;
	const leanAll = lean + (walking ? 4 : 0) + (pose === 'sit' ? 2 : 0);
	// the spine: a curve from the pelvis up, bent by lean and slouch
	const spine = (u: number): Pt => {
		let px = 0;
		let py = bob;
		const steps = 10;
		for (let i = 0; i < steps * u; i++) {
			const k = i / steps;
			const phi = ((leanAll + slouch * 40 * k * k) * Math.PI) / 180;
			px += Math.sin(phi) * (SPINE / steps);
			py -= Math.cos(phi) * (SPINE / steps) * (1 + breath * 0.01);
		}
		return [px, py];
	};
	const dirAt = (u: number) => ((leanAll + slouch * 40 * u * u) * Math.PI) / 180;
	const width = (u: number) => {
		// hips, waist, chest, shoulders, neck (a little wider when seen from behind)
		const pts = [
			[0, 46],
			[0.38, 36],
			[0.7, 42],
			[0.88, 38],
			[1, 22],
		];
		for (let i = 1; i < pts.length; i++) {
			if (u <= pts[i][0]) {
				const t = (u - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
				return (pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t) * (back ? 1.25 : 1);
			}
		}
		return 22;
	};
	const N = 9;
	const frontSide: Pt[] = [];
	const backSide: Pt[] = [];
	for (let i = 0; i <= N; i++) {
		const u = i / N;
		const [px, py] = spine(u);
		const phi = dirAt(u);
		const nx = Math.cos(phi);
		const ny = Math.sin(phi);
		const w = width(u);
		const chest = back ? 0 : Math.sin(Math.max(0, (u - 0.45) / 0.45) * Math.PI) * 4; // chest is a little fuller in front
		frontSide.push([px + nx * (w / 2 + chest), py + ny * (w / 2 + chest)]);
		backSide.push([px - nx * (w / 2), py - ny * (w / 2)]);
	}
	const top = spine(1);
	const phiTop = dirAt(1);
	const torsoD = smooth([[0, 10 + bob], ...frontSide, [top[0] + Math.sin(phiTop) * 6, top[1] - 6], ...backSide.reverse()], true, 0.85);
	// head sits on the neck, a little forward
	const headC: Pt = [top[0] + Math.sin(phiTop) * (R * 0.92) + 4, top[1] - Math.cos(phiTop) * (R * 0.92)];
	// joints
	const sh = spine(0.85);
	const shN: Pt = [sh[0] + Math.cos(dirAt(0.85)) * 3, sh[1]];
	const shF: Pt = [sh[0] - 3, sh[1] - 2];
	const hipN: Pt = [7, -4 + bob];
	const hipF: Pt = [-5, -7 + bob];
	let footN: Pt;
	let footF: Pt;
	if (pose === 'sit') {
		footN = feet?.near ?? [58, seat];
		footF = feet?.far ?? [48, seat - 2];
	} else if (walking) {
		const sw = Math.sin(walk);
		footN = [6 + 32 * sw, 112 - Math.max(0, Math.cos(walk)) * 12];
		footF = [2 - 32 * sw, 112 - Math.max(0, -Math.cos(walk)) * 12];
	} else {
		footN = feet?.near ?? [12, 112];
		footF = feet?.far ?? [-4, 112];
	}
	const legIK = (hip: Pt, foot: Pt) => (pose === 'sit' ? solve(hip, foot, THIGH, SHIN, (p) => -p[1] + p[0] * 0.3) : solve(hip, foot, THIGH, SHIN, (p) => p[0]));
	const legN = legIK(hipN, footN);
	const legF = legIK(hipF, footF);
	// elbows hang down under their own weight, and point backward rather than into the chest
	const armIK = (shp: Pt, a: Arm) => {
		const prefer = a.elbow === 'up' ? (p: Pt) => -p[1] : a.elbow === 'out' ? (p: Pt) => -p[0] : (p: Pt) => p[1] - p[0] * 0.35;
		const {mid, end} = solve(shp, a.hand, UPPER, FORE, prefer);
		const ang = (Math.atan2(end[1] - mid[1], end[0] - mid[0]) * 180) / Math.PI + (a.rot ?? 0);
		return {mid, end, ang};
	};
	const aN = armIK(shN, nArm);
	const aF = armIK(shF, fArm);
	const shoe = (leg: {mid: Pt; end: Pt}, color: string, k: number) => {
		const ang = Math.atan2(leg.end[1] - leg.mid[1], leg.end[0] - leg.mid[0]) - Math.PI / 2;
		return (
			<g transform={`translate(${leg.end[0]} ${leg.end[1]}) rotate(${(ang * 180) / Math.PI * 0.6})`}>
				<Shape d={smooth([[-9, -8], [8, -9], [22, -4], [25, 4], [-10, 5]], true, 0.6)} color={shade(color, k)} w={2} wear={false} />
			</g>
		);
	};
	const holdAt = (a: {end: Pt; ang: number}, obj?: React.ReactNode) => (obj ? <g transform={`translate(${a.end[0]} ${a.end[1]}) rotate(${a.ang})`}>{obj}</g> : null);
	const farFirst = (
		<g>
			<Limb a={shF} b={aF.mid} c={aF.end} w0={16} w1={12} color={shade(L.top!, 0.82)} />
			{holdAt(aF, fArm.hold)}
			<HandShape at={aF.end} angle={aF.ang} grip={fArm.grip} skin={shade(L.skin!, 0.92)} />
			<Limb a={hipF} b={legF.mid} c={legF.end} w0={23} w1={16} color={shade(L.bottom!, 0.82)} />
			{shoe(legF, L.shoes!, 0.85)}
		</g>
	);
	return (
		<g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
			{farFirst}
			<Limb a={hipN} b={legN.mid} c={legN.end} w0={24} w1={16} color={L.bottom!} />
			{shoe(legN, L.shoes!, 1)}
			<Shape d={torsoD} color={L.top!} hatch="light" hatchOpacity={0.55} w={2.3} />
			{!back && <Ink d={smooth([[top[0] + Math.cos(phiTop) * 4, top[1] - 2], [top[0] + Math.cos(phiTop) * 9 + 2, top[1] + 9], [top[0] + Math.cos(phiTop) * 12, top[1] - 1]])} w={2} color={L.collar} second={false} />}
			<FigHead x={headC[0]} y={headC[1]} r={R} view={view} face={{...face, tilt: (face.tilt ?? 0) + leanAll * 0.3 + slouch * 12}} look={L} seed={seed} />
			<Limb a={shN} b={aN.mid} c={aN.end} w0={17} w1={12} color={L.top!} />
			{holdAt(aN, nArm.hold)}
			<HandShape at={aN.end} angle={aN.ang} grip={nArm.grip} skin={L.skin!} />
		</g>
	);
};

/** Small helpers for lifelike motion. */
export const motion = {
	/** smooth pseudo-random drift (-1..1) */
	drift: (t: number, seed = 0) => 0.6 * Math.sin(t * 0.73 + seed) + 0.4 * Math.sin(t * 1.31 + seed * 2.1),
	/** mouth opening while someone talks (syllable-like) */
	talk: (t: number, on: number) => on * Math.max(0, Math.sin(t * 11) * 0.6 + Math.sin(t * 4.3) * 0.4),
	/** talking hands: offset to add to a hand position */
	gesture: (t: number, on: number, seed = 0): Pt => [on * 10 * Math.sin(t * 2.1 + seed), on * 8 * Math.sin(t * 2.9 + seed * 1.7)],
	/** smoothly mix two points */
	mix: (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
};
