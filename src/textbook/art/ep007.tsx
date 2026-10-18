import React from 'react';
import {FELL, FELL_SC, HAND} from '../../fonts';
import {ArtInfo, blinking, prog, shown, since, useArt} from '../context';
import {FaceProps} from '../figures';
import {Callout, Ink, Reveal, Shape, Spark, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Brain, Phone, RoomBG, SkyWindow} from '../props';
import {Figure, HandShape, Look, MAIN, STRANGER} from '../rig';
import {Pt, roughEllipse, roughLine, roughRect, smooth} from '../rough';
import {toLocal} from './shared';

/**
 * ep007 — why time goes slow motion when you're scared (Stetson, Fiesta & Eagleman, 2007).
 * Recurring motif: chronophotography. A frightening second is "recorded" as more frames, so it plays back longer.
 */

const clamp = (x: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t: number) => {
	const x = clamp(t);
	return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const rotPt = (p: Pt, deg: number): Pt => {
	const r = (deg * Math.PI) / 180;
	return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)];
};
/** Pseudo-random -1..1 from an integer (stable between frames). */
const hash = (i: number) => {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return (x - Math.floor(x)) * 2 - 1;
};
/** Damped bounce after an impact (units). */
const bounce = (s: number, amount: number, period = 3.2, decay = 9) => (s > 0 ? amount * Math.exp(-s / decay) * Math.sin(s / period) : 0);

// ---------------------------------------------------------------------------------------------
// small drawn objects

const GH = 46; // glass height
const GT = 15; // half width at the rim
const GB = 11; // half width at the base

/** A drinking glass, drawn from the centre of its base. `ghost` draws only a coloured outline (chronophotograph frames). */
const GlassCup: React.FC<{x: number; y: number; rot?: number; level?: number; s?: number; ghost?: string; opacity?: number; t?: number; w?: number}> = ({x, y, rot = 0, level = 0.6, s = 1, ghost, opacity = 1, t = 0, w = 1.6}) => {
	const body = `M${-GT} ${-GH} L${GT} ${-GH} L${GB} 0 L${-GB} 0 Z`;
	if (ghost) {
		return (
			<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
				<path d={body} fill="none" stroke={ghost} strokeWidth={w} strokeLinejoin="round" />
				<ellipse cx={0} cy={-GH} rx={GT} ry={3} fill="none" stroke={ghost} strokeWidth={w * 0.75} />
			</g>
		);
	}
	const lv = clamp(level);
	const yl = -GH * lv;
	const wl = GB + (GT - GB) * lv - 0.8;
	const wob = Math.sin(t * 5) * 1.5 * lv;
	const water = `M${-wl} ${yl + wob} Q0 ${yl - wob} ${wl} ${yl} L${GB - 0.8} -1.2 L${-GB + 0.8} -1.2 Z`;
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
			{lv > 0.02 && (
				<>
					<path d={water} fill={BOOK.blue} opacity={0.8} />
					<path d={water} fill="url(#tb-light)" opacity={0.6} />
				</>
			)}
			<path d={body} fill="#DCE3E2" opacity={0.35} />
			<Ink d={body} w={1.9} second={false} />
			<Ink d={roughEllipse(0, -GH, GT, 3, 1701, 0.15, 10)} w={1.3} second={false} />
			<Ink d={`M${-GT + 5} ${-GH + 7} L${-GB + 4} -6`} w={2.2} color={BOOK.parchment} opacity={0.9} second={false} />
			<Ink d={`M${-GB + 1} -5 L${GB - 1} -5`} w={1} opacity={0.5} second={false} />
		</g>
	);
};

/** 8x8 LED dot matrix like the "perceptual chronometer": a digit, its negative, a blur, or off. */
const SEVEN = ['........', '.######.', '......#.', '.....#..', '....#...', '...#....', '...#....', '........'];
const LedTile: React.FC<{x: number; y: number; size: number; mode: 'digit' | 'neg' | 'blur' | 'off'; glow?: number; frame?: boolean}> = ({x, y, size, mode, glow = 1, frame = true}) => {
	const cell = size / 8;
	return (
		<g transform={`translate(${x - size / 2} ${y - size / 2})`}>
			{frame && <rect x={-4} y={-4} width={size + 8} height={size + 8} rx={3} fill={BOOK.black} stroke={BOOK.ink} strokeWidth={1.4} />}
			{SEVEN.map((row, r) =>
				Array.from(row).map((c, k) => {
					const lit = mode === 'digit' ? c === '#' : mode === 'neg' ? c !== '#' : false;
					const o = mode === 'off' ? 0.08 : mode === 'blur' ? 0.5 * glow : lit ? glow : 0.1;
					return <circle key={`${r}-${k}`} cx={(k + 0.5) * cell} cy={(r + 0.5) * cell} r={cell * 0.36} fill={o > 0.2 ? BOOK.glow : '#5A544A'} opacity={Math.max(0.15, o)} />;
				}),
			)}
		</g>
	);
};

/** A strip of film with sprocket holes; frames are drawn by the caller. */
const Film: React.FC<{x: number; y: number; w: number; h?: number}> = ({x, y, w, h = 40}) => (
	<g>
		<rect x={x} y={y} width={Math.max(0, w)} height={h} fill={BOOK.black} />
		{Array.from({length: Math.max(0, Math.floor((w - 4) / 11))}, (_, k) => (
			<g key={k}>
				<rect x={x + 4 + k * 11} y={y + 2.5} width={5} height={3.5} rx={1} fill={BOOK.parchment} opacity={0.75} />
				<rect x={x + 4 + k * 11} y={y + h - 6} width={5} height={3.5} rx={1} fill={BOOK.parchment} opacity={0.75} />
			</g>
		))}
	</g>
);

/** A SCAD jumper: on their back (head to the left), knees up, arms crossed; (x, y) is the pelvis. */
const Jumper: React.FC<{x: number; y: number; s: number; face: FaceProps; rot?: number; look?: Look; near?: Pt; hold?: React.ReactNode}> = ({x, y, s, face, rot = 0, look = MAIN, near, hold}) => (
	<g transform={`translate(${x} ${y}) rotate(${-90 + rot})`}>
		<Figure x={0} y={0} s={s} pose="sit" seat={46} turn={0.8} look={look} near={{hand: near ?? [36, -64], grip: 'fist', hold}} far={{hand: [30, -70], grip: 'fist'}} face={face} />
	</g>
);

// ---------------------------------------------------------------------------------------------
// fig. 1 — the kitchen: a glass slips off the counter, the world goes slow motion; later it's caught.

const FLOOR = 440;
const TOP = 292; // counter top
const EDGE = 548; // right end of the counter
const PX = 650; // the person (pelvis), facing left toward the counter
const PS = 1.05;
const PY = FLOOR - 112 * PS;
const G = 2630; // "gravity" in panel units / s^2, tuned so the felt fall reads on screen
const TIP = 10; // frames for the glass to tip off the edge
const CATCH_T = 0.231; // seconds of fall when the hand meets it

/** Subjective seconds of fall: real speed for a moment, then almost frozen (the "slow motion"). */
const fallClock = (u: number) => (u <= 0 ? 0 : 0.165 * (1 - Math.exp(-u / 5)) + 0.03 * (1 - Math.exp(-u / 160)));
const glassAt = (ft: number): {x: number; y: number; rot: number} => ({x: EDGE + 4 + 60 * ft, y: TOP + (G / 2) * ft * ft, rot: 38 + 330 * ft});

/** Everything about the falling glass at frame a.f. */
const glassState = (a: ArtInfo) => {
	const s = since(a, 'slip');
	const sc = since(a, 'catch');
	if (!(s > 0)) return {x: 536, y: TOP, rot: 0, ft: 0, phase: 'rest' as const, sc};
	if (s < TIP) {
		const k = easeInOut(s / TIP);
		return {x: lerp(536, EDGE + 4, k), y: TOP, rot: 38 * k * k, ft: 0, phase: 'tip' as const, sc};
	}
	let ft = fallClock(s - TIP);
	if (sc > 0) {
		const before = fallClock(s - TIP - sc);
		ft = lerp(before, CATCH_T, clamp(sc / 4) ** 2);
	}
	const g = glassAt(ft);
	return {...g, ft, phase: sc >= 4 ? ('caught' as const) : ('fall' as const), sc};
};

/** Drops thrown from the rim while the glass tumbles (positions relative to the free-falling glass). */
const drops = (ft: number, sc: number) => {
	const out: {x: number; y: number; r: number; stretch: number; ang: number}[] = [];
	for (let i = 0; i < 12; i++) {
		const fe = 0.03 + i * 0.012;
		if (ft <= fe) continue;
		const g = glassAt(fe);
		const mouth = rotPt([hash(i) * 6, -GH], g.rot);
		const dir = rotPt([0, -1], g.rot);
		const v: Pt = [dir[0] * 120 + hash(i + 40) * 70, dir[1] * 120 + hash(i + 80) * 70];
		const dt = ft - fe;
		const fallen = glassAt(ft);
		// relative drift + the glass's own fall since the drop left it
		let x = g.x + mouth[0] + v[0] * dt + (fallen.x - g.x) * 0.9;
		let y = g.y + mouth[1] + v[1] * dt + (fallen.y - g.y);
		if (sc > 0) {
			// once the glass is caught, real time resumes and the drops keep falling to the floor
			const tr = sc / 30;
			x += v[0] * tr * 0.5;
			y += 120 * tr + (G / 2) * tr * tr;
		}
		out.push({x, y, r: 1.8 + ((i * 7) % 3) * 0.9, stretch: 1 + ((i * 5) % 3) * 0.5, ang: (Math.atan2(v[1], v[0]) * 180) / Math.PI});
	}
	return out;
};

const Cabinet: React.FC<{x: number; y: number; w: number; h: number; doors: number; seed: number; knobsLow?: boolean}> = ({x, y, w, h, doors, seed, knobsLow}) => (
	<g>
		<Shape d={roughRect(x, y, w, h, seed, 0.5)} color="#C9B48E" hatch="light" hatchOpacity={0.5} />
		{Array.from({length: doors}, (_, i) => {
			const dw = w / doors;
			return (
				<g key={i}>
					<Ink d={roughRect(x + i * dw + 8, y + 8, dw - 16, h - 16, seed + 1 + i, 0.4)} w={1.3} opacity={0.75} second={false} />
					<circle cx={x + i * dw + (i % 2 ? 18 : dw - 18)} cy={knobsLow ? y + 22 : y + h - 22} r={3.2} fill={BOOK.ochre} stroke={BOOK.ink} strokeWidth={1.2} />
				</g>
			);
		})}
	</g>
);

const Kettle: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={smooth([[-30, 0], [-34, -30], [-20, -50], [20, -50], [34, -30], [30, 0]], true, 0.6)} color="#A39C8C" hatch="light" w={2} />
		<Ink d="M-16 -50 Q0 -78 16 -50" w={3} second={false} />
		<Shape d={smooth([[30, -30], [52, -48], [56, -44], [34, -18]], true, 0.5)} color="#A39C8C" w={1.8} />
		<Shape d={roughEllipse(0, -52, 8, 3, 1711, 0.3)} color={BOOK.black} w={1.2} wear={false} />
	</g>
);

const FruitBowl: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughEllipse(-14, -22, 13, 12, 1712, 0.4)} color={BOOK.terracotta} w={1.6} />
		<Shape d={roughEllipse(12, -24, 12, 11, 1713, 0.4)} color={BOOK.ochre} w={1.6} />
		<Shape d={roughEllipse(0, -32, 11, 10, 1714, 0.4)} color={BOOK.olive} w={1.6} />
		<Shape d={smooth([[-34, -18], [34, -18], [22, 0], [-22, 0]], true, 0.5)} color={BOOK.parchment} w={2} />
	</g>
);

const WallClock: React.FC<{x: number; y: number; r: number; secs: number}> = ({x, y, r, secs}) => {
	// the second hand ticks; in slow motion it hangs, mid-tick
	const whole = Math.floor(secs);
	const tick = easeOut(clamp((secs - whole - 0.82) / 0.18));
	const ang = (whole + tick) * 6;
	return (
		<g transform={`translate(${x} ${y})`}>
			<Shape d={roughEllipse(0, 0, r, r, 1715, 0.4)} color={BOOK.parchment} w={2.4} />
			{Array.from({length: 12}, (_, i) => {
				const [cx, cy] = rotPt([0, -r * 0.82], i * 30);
				const [ex, ey] = rotPt([0, -r * 0.68], i * 30);
				return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke={BOOK.ink} strokeWidth={i % 3 ? 1 : 2} />;
			})}
			<g transform="rotate(-62)">
				<Ink d={`M0 0 L0 ${-r * 0.48}`} w={2.6} second={false} />
			</g>
			<g transform="rotate(95)">
				<Ink d={`M0 0 L0 ${-r * 0.7}`} w={1.8} second={false} />
			</g>
			<g transform={`rotate(${ang})`}>
				<line x1={0} y1={r * 0.15} x2={0} y2={-r * 0.8} stroke={BOOK.terracotta} strokeWidth={1.2} />
			</g>
			<circle r={2.4} fill={BOOK.ink} />
		</g>
	);
};

/**
 * fig. 1 — a kitchen. Hook: slip (the hand knocks the glass off the end of the counter), slow (the world slows:
 * the clock hangs mid-tick, drops hang in the air, chronophotograph "frames" trail the glass).
 * Close: catch (real time resumes, the hand closes on the glass), notes (the trail is numbered, like notes).
 */
export const KitchenGlass: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const gs = glassState(a);
	const s = since(a, 'slip');
	const slow = prog(a, 'slow', 24) * (1 - prog(a, 'catch', 6));
	const caught = gs.phase === 'caught';
	const notes = prog(a, 'notes', 40);
	// a clock that slows with the felt time: one real second per second, then almost nothing
	const slipAt = a.ev('slip');
	const baseF = Number.isFinite(slipAt) ? slipAt : 0;
	const r = a.f - baseF;
	let felt = r < TIP ? r : TIP + 30 * fallClock(r - TIP);
	if (gs.sc > 0) felt += gs.sc;
	const clockSecs = 37.86 - TIP / 30 + felt / 30;
	const skyT = Number.isFinite(slipAt) ? (baseF + felt) / a.fps : t;

	// the person: sets the glass down too close to the edge, lets go, looks at the phone... then reaches
	const react = gs.phase === 'rest' ? 0 : clamp(gs.ft / 0.12);
	const holding: Pt = [554, TOP - 24];
	const away: Pt = [598, TOP - 34];
	let hand: Pt = holding;
	let grip: 'relaxed' | 'hold' | 'open' = 'hold';
	let lean = 6;
	if (s > 0) {
		hand = lerpPt(holding, away, easeInOut(s / 8));
		grip = 'relaxed';
	}
	if (gs.phase === 'fall' || gs.phase === 'caught') {
		const reachTo: Pt = [gs.x + 12, gs.y - 30];
		hand = lerpPt(away, reachTo, clamp(gs.ft / 0.2) * 0.72);
		lean = 6 + 16 * clamp(gs.ft / 0.2);
		grip = 'open';
	}
	let glassX = gs.x;
	let glassY = gs.y;
	let glassRot = gs.rot;
	if (gs.sc > 0) {
		const c = glassAt(CATCH_T);
		const catchHand: Pt = [c.x + 4, c.y - 26];
		const k = clamp(gs.sc / 4);
		hand = lerpPt(hand, catchHand, k);
		lean = lerp(lean, 32, k);
		grip = 'hold';
		if (caught) {
			// lift it back up and set it straight
			const up = easeInOut((gs.sc - 6) / 22);
			hand = lerpPt(catchHand, [592, TOP - 24], up);
			lean = lerp(32, 8, up);
			glassRot = lerp(c.rot, 4, easeInOut((gs.sc - 4) / 16));
			const [ox, oy] = rotPt([0, 24], glassRot);
			glassX = hand[0] + ox - 4;
			glassY = hand[1] + oy;
		}
	}
	const level = gs.phase === 'rest' || gs.phase === 'tip' ? 0.62 : 0.62 - 0.42 * clamp((glassAt(gs.ft).rot - 50) / 60);
	const phoneHand: Pt = react > 0 ? [lerp(56, 40, react), lerp(-78, -62, react)] : [56, -78];
	const relief = prog(a, 'catch', 16, 8);
	const face: FaceProps =
		relief > 0
			? {look: [0.3, 0.9], smile: 0.6 * relief, lid: 0.35 * relief, raise: (1 - relief) * 0.8, mouth: relief > 0.5 ? 'soft' : 'o', blink: relief > 0.9 && blinking(a, 3.4)}
			: react > 0
				? {look: [0.15, 1], raise: react, lid: 0, mouth: react > 0.4 ? 'o' : 'flat', blink: false}
				: {look: [0.55, 0.7], blink: blinking(a, 3.2, 0.4)};

	// chronophotograph trail: the "frames" the brain is keeping
	const trailFts = [0, 0.03, 0.06, 0.09, 0.12, 0.15, 0.18, 0.21, 0.24];
	const slowSince = since(a, 'slow');
	const ghosts = trailFts.filter((f, i) => f < gs.ft - 0.012 && (caught || slowSince > 6 + i * 6));
	const ghostOp = 0.22 * slow + notes * 0.5;
	const dropList = gs.phase === 'fall' || gs.phase === 'caught' ? drops(gs.ft, gs.sc) : [];
	const puddle = clamp((gs.sc - 10) / 20);

	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={FLOOR} wall="#DCCDB0" floor="#9C8A70" stripes={false} />
			{/* floor tiles */}
			{Array.from({length: 14}, (_, i) => (
				<line key={i} x1={-40 + i * 80} y1={FLOOR} x2={-120 + i * 80} y2={a.h} stroke={BOOK.ink} strokeWidth={1} opacity={0.25} />
			))}
			<line x1={-40} y1={FLOOR + 22} x2={a.w + 40} y2={FLOOR + 22} stroke={BOOK.ink} strokeWidth={1} opacity={0.25} />
			<SkyWindow x={668} y={46} w={240} h={176} t={skyT} sky="#BFC9C3" moon={false} id="tb-ep7-win" />
			<Shape d={roughRect(654, 222, 268, 12, 1720, 0.4)} color="#B9AE96" w={1.6} />
			{/* a small plant on the sill */}
			<Shape d={smooth([[860, 222], [856, 200], [880, 200], [876, 222]], true, 0.4)} color={BOOK.terracotta} w={1.6} />
			{[[-14, -26], [0, -34], [14, -24]].map(([dx, dy], i) => (
				<Shape key={i} d={roughEllipse(868 + dx, 196 + dy, 7, 14, 1721 + i, 0.4)} color={BOOK.olive} w={1.4} />
			))}
			<WallClock x={572} y={82} r={30} secs={clockSecs} />
			{/* backsplash tiles, upper cabinets, counter */}
			<rect x={40} y={170} width={EDGE - 40} height={TOP - 170} fill="#E6DCC6" />
			{Array.from({length: 22}, (_, i) => (
				<line key={`v${i}`} x1={40 + i * 24} y1={170} x2={40 + i * 24} y2={TOP} stroke={BOOK.ink} strokeWidth={0.8} opacity={0.18} />
			))}
			{Array.from({length: 5}, (_, i) => (
				<line key={`h${i}`} x1={40} y1={170 + i * 24} x2={EDGE} y2={170 + i * 24} stroke={BOOK.ink} strokeWidth={0.8} opacity={0.18} />
			))}
			<Cabinet x={40} y={30} w={440} h={124} doors={3} seed={1730} />
			<Kettle x={120} y={TOP} />
			<FruitBowl x={300} y={TOP} />
			<Shape d={roughRect(30, TOP, EDGE - 22, 14, 1740, 0.4)} color="#8E8677" hatch="light" w={2.2} />
			<Cabinet x={44} y={TOP + 14} w={EDGE - 44} h={FLOOR - TOP - 22} doors={4} seed={1741} knobsLow />
			<rect x={44} y={FLOOR - 8} width={EDGE - 44} height={8} fill={BOOK.black} opacity={0.5} />
			{/* puddle after the catch */}
			{puddle > 0 && <ellipse cx={575} cy={FLOOR + 6} rx={26 * puddle} ry={4 * puddle} fill={BOOK.blue} opacity={0.6} />}
			<Figure
				x={PX}
				y={PY}
				s={PS}
				facing={-1}
				turn={0.6}
				lean={lean}
				breath={Math.sin(t * 1.5) * 0.5 + 0.5}
				near={{hand: toLocal(PX, PY, PS, -1, hand), grip}}
				far={{hand: phoneHand, grip: 'hold', hold: <Phone x={8} y={-4} s={0.42} rot={80} glow={1} />}}
				look={MAIN}
				face={face}
			/>
			{/* the trail of frames, then the glass and its drops */}
			{ghostOp > 0.01 &&
				ghosts.map((f, i) => {
					const g = glassAt(f);
					return (
						<g key={i}>
							<GlassCup x={g.x} y={g.y} rot={g.rot} ghost={BOOK.terracotta} opacity={ghostOp * (0.5 + (0.5 * (i + 1)) / ghosts.length)} />
							{notes > 0 && (
								<text x={g.x + 26} y={g.y - 30} fontFamily={HAND} fontWeight={700} fontSize={13} fill={BOOK.terracotta} opacity={clamp(notes * 3 - i * 0.25)}>
									{i + 1}
								</text>
							)}
						</g>
					);
				})}
			<GlassCup x={glassX} y={glassY} rot={glassRot} level={level} t={t} />
			{dropList.map((d, i) =>
				d.y < FLOOR - 2 ? (
					<ellipse key={i} cx={d.x} cy={d.y} rx={d.r * d.stretch} ry={d.r} transform={`rotate(${d.ang} ${d.x} ${d.y})`} fill={BOOK.blue} stroke={BOOK.ink} strokeWidth={0.8} opacity={0.9} />
				) : null,
			)}
			{/* slow motion: the room goes quiet and dim at the edges */}
			{slow > 0 && (
				<g opacity={slow}>
					<defs>
						<radialGradient id="tb-ep7-slow" cx="0.56" cy="0.6" r="0.7">
							<stop offset="0.45" stopColor={BOOK.black} stopOpacity={0} />
							<stop offset="1" stopColor={BOOK.black} stopOpacity={0.4} />
						</radialGradient>
					</defs>
					<rect x={0} y={0} width={a.w} height={a.h} fill={BOOK.blue} opacity={0.08} />
					<rect x={0} y={0} width={a.w} height={a.h} fill="url(#tb-ep7-slow)" />
				</g>
			)}
			{notes > 0 && <Callout from={[EDGE - 2, TOP + 40]} to={[470, TOP + 100]} text="the brain, taking notes" p={notes} size={19} anchor="end" color={BOOK.terracotta} />}
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 2 — how it feels: a chronophotograph of the fall, every drop. Events: frames, q.

export const SlowmoGlass: React.FC = () => {
	const a = useArt();
	const sf = since(a, 'frames');
	const q = prog(a, 'q', 18);
	const n = 8;
	const plate = {x: 18, y: 18, w: 564, h: 214};
	const pos = (i: number): {x: number; y: number; rot: number} => {
		const k = i / (n - 1);
		return {x: 74 + k * 400, y: 92 + k * k * 96, rot: 12 + k * 150};
	};
	return (
		<Reveal p={shown(a)}>
			<Shape d={roughRect(plate.x, plate.y, plate.w, plate.h, 1750, 0.4)} color={BOOK.black} w={2} wear={false} />
			<rect x={plate.x + 4} y={plate.y + 4} width={plate.w - 8} height={plate.h - 8} fill="url(#tb-stipple)" opacity={0.25} />
			<Write text="every drop" p={clamp((sf - 6) / 30)} x={plate.x + 20} y={plate.y + plate.h - 18} size={22} font={HAND} weight={700} color={BOOK.glow} />
			{Array.from({length: n}, (_, i) => {
				const appear = sf - (4 + i * 5);
				if (!(appear > 0)) return null;
				const p = pos(i);
				const flash = clamp(1 - appear / 8);
				const k = i / (n - 1);
				return (
					<g key={i}>
						{flash > 0 && <circle cx={p.x} cy={p.y - 20} r={40} fill="url(#tb-glow)" opacity={flash * 0.6} />}
						<GlassCup x={p.x} y={p.y} rot={p.rot} ghost={BOOK.parchment} opacity={0.35 + 0.65 * (i === n - 1 ? 1 : 0.55 + 0.45 * k)} w={1.8} />
						{/* drops leaving the rim, more with every frame */}
						{Array.from({length: Math.round(k * 9)}, (_, j) => {
							const dir = rotPt([0, -1], p.rot);
							const mouth = rotPt([hash(j + i * 13) * 8, -GH], p.rot);
							const dist = 6 + j * 4 + k * 14;
							const dx = p.x + mouth[0] + dir[0] * dist + hash(j * 3 + i) * 10;
							const dy = p.y + mouth[1] + dir[1] * dist + hash(j * 5 + i) * 10;
							return <circle key={j} cx={dx} cy={dy} r={1.4 + ((j * 3) % 3) * 0.8} fill={BOOK.glow} opacity={0.85} />;
						})}
					</g>
				);
			})}
			{/* the timeline under the plate: frame by frame */}
			<Ink d={roughLine(40, 258, 560, 258, 1751, 0.3)} w={1.4} p={clamp(sf / 30)} second={false} />
			{Array.from({length: n}, (_, i) => {
				const appear = sf - (4 + i * 5);
				if (!(appear > 0)) return null;
				const x = pos(i).x;
				return (
					<g key={i}>
						<line x1={x} x2={x} y1={250} y2={266} stroke={BOOK.ink} strokeWidth={1.4} />
						<text x={x} y={280} fontFamily={FELL} fontStyle="italic" fontSize={13} fill={BOOK.ink} textAnchor="middle">
							{i + 1}
						</text>
					</g>
				);
			})}
			<T x={40} y={248} size={13} italic color={BOOK.brown}>
				counter to floor, in real life: about 0.4 s
			</T>
			{q > 0 && (
				<g opacity={q} transform={`translate(520 ${150 - 8 * q})`}>
					<text x={0} y={0} fontFamily={FELL} fontSize={130} fill={BOOK.terracotta} textAnchor="middle">
						?
					</text>
				</g>
			)}
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 3 — the SCAD tower in Dallas. Events: hoist (winched up), drop (released, falls backward), net (lands).

const GROUND = 600;
const NET_Y = 432;
const HANG_Y = 104;

export const ScadTower: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const sh = since(a, 'hoist');
	const sd = since(a, 'drop');
	const dropAt = a.ev('drop');
	const netAt = a.ev('net');
	const fallFrames = Number.isFinite(dropAt) && Number.isFinite(netAt) ? Math.max(20, netAt - dropAt) : 70;
	const jx = 286;
	const js = 0.42;
	const restY = NET_Y - 14;
	let jy = restY;
	let phase: 'rest' | 'hoist' | 'hang' | 'fall' | 'landed' = 'rest';
	if (sh > 0) {
		const k = easeInOut(sh / 70);
		jy = lerp(restY, HANG_Y, k);
		phase = k < 1 ? 'hoist' : 'hang';
	}
	if (sd > 0) {
		const k = clamp(sd / fallFrames);
		jy = lerp(HANG_Y, NET_Y - 14, k * k);
		phase = k < 1 ? 'fall' : 'landed';
	}
	const sl = sd - fallFrames;
	const landed = phase === 'landed';
	const sag = landed ? 16 + bounce(sl, 14) : 0;
	if (landed) jy = NET_Y - 14 + sag;
	const swing = phase === 'hang' ? Math.sin(t * 2.2) * 2 : 0;
	const cableTop: Pt = [jx - 28 * 0 - 30, 62];
	const chest: Pt = [jx - 68 * js + swing, jy];
	const scared = phase === 'fall' ? 1 : phase === 'landed' ? clamp(1 - sl / 40) : phase === 'hang' ? 0.5 : 0;
	const relief = landed ? clamp((sl - 10) / 20) : 0;
	const labelH = prog(a, 'hoist', 30, 20);
	const labelF = prog(a, 'drop', 30, 10);
	// earlier positions of the fall (chronophotograph frames)
	const trail = phase === 'fall' ? [0.82, 0.64, 0.46].map((back) => lerp(HANG_Y, NET_Y - 14, (clamp(sd / fallFrames) * back) ** 2)) : [];
	return (
		<Reveal p={shown(a)}>
			{/* sky, clouds, a far-off skyline */}
			{[0, 1, 2].map((i) => {
				const cx = ((t * (6 + i * 3) + i * 150) % 520) - 80;
				return <ellipse key={i} cx={cx} cy={120 + i * 90} rx={46 - i * 6} ry={10} fill={BOOK.parchment} opacity={0.6} />;
			})}
			{Array.from({length: 9}, (_, i) => {
				const bh = 18 + ((i * 41) % 46);
				return <rect key={i} x={i * 44 - 10} y={GROUND - bh} width={36} height={bh} fill="#C7B28C" opacity={0.75} />;
			})}
			{/* Reunion Tower, small on the skyline */}
			<g opacity={0.8}>
				<rect x={196} y={GROUND - 84} width={6} height={84} fill="#B49C74" />
				<circle cx={199} cy={GROUND - 92} r={12} fill="#C7B28C" stroke="#9C8460" strokeWidth={1.2} />
				<path d={`M187 ${GROUND - 92} L211 ${GROUND - 92} M199 ${GROUND - 104} L199 ${GROUND - 80}`} stroke="#9C8460" strokeWidth={0.8} />
			</g>
			<rect x={-10} y={GROUND} width={a.w + 20} height={60} fill="#A89574" />
			<rect x={-10} y={GROUND} width={a.w + 20} height={60} fill="url(#tb-mid)" opacity={0.3} />
			<Ink d={roughLine(-10, GROUND, a.w + 10, GROUND, 1760, 0.5)} w={2} />
			{/* the tower: a lattice mast with a boom on top */}
			{[72, 108].map((x, i) => (
				<Ink key={i} d={roughLine(x, GROUND, x, 52, 1761 + i, 0.4)} w={3} />
			))}
			{Array.from({length: 13}, (_, i) => {
				const y0 = GROUND - i * 42;
				const y1 = y0 - 42;
				return y1 > 50 ? <Ink key={i} d={`M72 ${y0} L108 ${y1} M108 ${y0} L72 ${y1} M72 ${y1} L108 ${y1}`} w={1.2} opacity={0.8} second={false} /> : null;
			})}
			<Shape d={roughRect(60, 44, 60, 10, 1765, 0.3)} color={BOOK.woodDark} w={1.8} />
			<Ink d={roughLine(100, 56, 268, 56, 1766, 0.3)} w={3.2} />
			<Ink d={roughLine(100, 70, 250, 58, 1767, 0.3)} w={1.6} />
			{Array.from({length: 7}, (_, i) => (
				<Ink key={i} d={`M${110 + i * 22} 56 L${120 + i * 22} ${69 - i * 1.6}`} w={1} opacity={0.8} second={false} />
			))}
			<circle cx={cableTop[0]} cy={62} r={6} fill={BOOK.ochre} stroke={BOOK.ink} strokeWidth={1.6} />
			{/* winch cable down the mast */}
			<Ink d={`M${cableTop[0] - 4} 62 L112 64 L112 ${GROUND - 14}`} w={1} opacity={0.6} second={false} />
			<Shape d={roughRect(100, GROUND - 22, 30, 18, 1768, 0.3)} color={BOOK.black} w={1.4} wear={false} />
			{/* the net on its raised frame */}
			{[176, 336].map((x, i) => (
				<Ink key={i} d={roughLine(x, GROUND, x, NET_Y - 6, 1770 + i, 0.3)} w={3} />
			))}
			<Shape d={smooth([[176, NET_Y], [256, NET_Y + 22 + sag], [336, NET_Y], [336, NET_Y + 4], [256, NET_Y + 30 + sag], [176, NET_Y + 4]], true, 0.7)} color={BOOK.parchment} hatch="cross" hatchOpacity={0.9} w={1.8} wear={false} />
			<Ink d={smooth([[176, NET_Y], [256, NET_Y + 22 + sag], [336, NET_Y]])} w={2} />
			{/* cable to the jumper (until released) */}
			{phase !== 'fall' && phase !== 'landed' ? (
				<Ink d={`M${cableTop[0]} 66 L${chest[0]} ${chest[1] - 6}`} w={1.4} second={false} />
			) : (
				<Ink d={`M${cableTop[0]} 66 L${cableTop[0] + Math.sin(t * 6) * 2} ${92 - clamp(sd / 10) * 12}`} w={1.4} second={false} />
			)}
			{sd > 0 && sd < 10 && <Spark x={cableTop[0]} y={HANG_Y - 10} r={6} opacity={1 - sd / 10} />}
			{/* fall trail + speed lines */}
			{trail.map((ty, i) => (
				<g key={i} opacity={0.18 + i * 0.06}>
					<Jumper x={jx} y={ty} s={js} face={{raise: 1, mouth: 'o'}} />
				</g>
			))}
			{phase === 'fall' &&
				[0, 1, 2, 3].map((i) => (
					<Ink key={i} d={`M${jx - 50 + i * 26} ${jy - 46 - (i % 2) * 10} l0 -${30 + (i % 2) * 14}`} w={1.4} color={BOOK.ink} opacity={0.5} second={false} />
				))}
			<Jumper
				x={jx + swing}
				y={jy}
				s={js}
				rot={phase === 'fall' ? Math.sin(sd / 5) * 4 : 0}
				face={{raise: Math.max(scared, relief * 0.4), mouth: scared > 0.5 ? 'o' : relief > 0.5 ? 'soft' : 'flat', smile: relief * 0.8, look: [0.2, -0.6], blink: phase === 'rest' && blinking(a, 3)}}
			/>
			{/* a researcher on the ground, looking up */}
			<Figure x={136} y={GROUND - 112 * 0.27} s={0.27} turn={0.6} look={STRANGER} near={{hand: [34, -62], grip: 'hold', hold: <rect x={-4} y={-22} width={18} height={24} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={2} />}} face={{look: [0.6, -1], blink: blinking(a, 3.7, 0.6)}} />
			{/* dimensions */}
			{labelH > 0 && (
				<g>
					<Ink d={`M34 ${GROUND} L34 ${GROUND - (GROUND - 56) * labelH} M28 ${GROUND} L40 ${GROUND} M28 56 L40 56`} w={1.2} p={labelH} second={false} />
					<g transform={`translate(26 ${(GROUND + 56) / 2}) rotate(-90)`}>
						<Write text="150 ft (46 m)" p={labelH} x={0} y={0} size={17} italic anchor="middle" />
					</g>
				</g>
			)}
			{labelF > 0 && (
				<g>
					<Ink d={`M352 ${HANG_Y} L352 ${HANG_Y + (NET_Y - HANG_Y) * labelF} M346 ${HANG_Y} L358 ${HANG_Y} M346 ${NET_Y} L358 ${NET_Y}`} w={1.2} color={BOOK.terracotta} p={labelF} second={false} />
					<g transform={`translate(346 ${(HANG_Y + NET_Y) / 2}) rotate(-90)`}>
						<Write text="free fall: 100 ft · 2.5 s" p={labelF} x={0} y={0} size={16} italic anchor="middle" color={BOOK.terracotta} />
					</g>
				</g>
			)}
			<T x={12} y={630} size={14} italic color={BOOK.brown}>
				Dallas, Texas
			</T>
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 4 — how long the fall felt: a stopwatch and two bars. Events: click, own, pct.

export const FallEstimate: React.FC = () => {
	const a = useArt();
	const sc = since(a, 'click');
	const run = Number.isFinite(sc) && sc > 0 ? Math.min(2.96, sc / a.fps) : 0;
	const done = run >= 2.96;
	const b1 = prog(a, 'click', 34, 6);
	const b2 = prog(a, 'own', 36);
	const pct = prog(a, 'pct', 22);
	const x0 = 268;
	const px = 100; // per second
	const cx = 128;
	const cy = 170;
	const r = 78;
	return (
		<Reveal p={shown(a)}>
			{/* stopwatch (one turn = 5 s) */}
			<Shape d={roughRect(cx - 12, cy - r - 26, 24, 16, 1780, 0.3)} color="#A39C8C" w={1.8} />
			<Shape d={roughEllipse(cx, cy - r - 30, 16, 6, 1781, 0.3)} color="#A39C8C" w={1.8} />
			<Shape d={roughEllipse(cx, cy, r, r, 1782, 0.4)} color="#A39C8C" hatch="light" w={2.6} />
			<Shape d={roughEllipse(cx, cy, r - 10, r - 10, 1783, 0.4)} color={BOOK.parchment} w={1.6} />
			{Array.from({length: 25}, (_, i) => {
				const [x1, y1] = rotPt([0, -(r - 14)], i * 14.4);
				const [x2, y2] = rotPt([0, -(r - (i % 5 ? 20 : 26))], i * 14.4);
				return <line key={i} x1={cx + x1} y1={cy + y1} x2={cx + x2} y2={cy + y2} stroke={BOOK.ink} strokeWidth={i % 5 ? 0.9 : 1.8} />;
			})}
			{[0, 1, 2, 3, 4].map((k) => {
				const [x, y] = rotPt([0, -(r - 40)], k * 72);
				return (
					<text key={k} x={cx + x} y={cy + y + 5} fontFamily={FELL} fontSize={15} fill={BOOK.ink} textAnchor="middle">
						{k}
					</text>
				);
			})}
			<g transform={`translate(${cx} ${cy}) rotate(${(run / 5) * 360})`}>
				<Ink d={`M0 10 L0 ${-(r - 18)}`} w={2.2} color={BOOK.terracotta} second={false} />
			</g>
			<circle cx={cx} cy={cy} r={4} fill={BOOK.ink} />
			<text x={cx} y={cy + r + 28} fontFamily={HAND} fontWeight={700} fontSize={20} fill={done ? BOOK.terracotta : BOOK.ink} textAnchor="middle" opacity={run > 0 ? 1 : 0}>
				{`${run.toFixed(2)} s`}
			</text>
			{/* bars on a seconds axis */}
			<T x={x0} y={74} size={17} italic>
				a fall they only watched
			</T>
			<rect x={x0} y={84} width={2.17 * px * b1} height={28} fill={BOOK.blue} opacity={0.9} />
			<rect x={x0} y={84} width={2.17 * px * b1} height={28} fill="url(#tb-light)" />
			{b1 > 0.9 && (
				<text x={x0 + 2.17 * px - 8} y={104} fontFamily={FELL} fontSize={16} fill={BOOK.parchment} textAnchor="end">
					2.2 s
				</text>
			)}
			<T x={x0} y={148} size={17} italic>
				their own fall, remembered
			</T>
			<rect x={x0} y={158} width={2.96 * px * b2} height={28} fill={BOOK.terracotta} opacity={0.9} />
			<rect x={x0} y={158} width={2.96 * px * b2} height={28} fill="url(#tb-light)" />
			{b2 > 0.9 && (
				<text x={x0 + 2.96 * px - 8} y={178} fontFamily={FELL} fontSize={16} fill={BOOK.parchment} textAnchor="end">
					3.0 s
				</text>
			)}
			<Ink d={roughLine(x0, 214, x0 + 3 * px + 8, 214, 1785, 0.3)} w={1.4} />
			{[0, 1, 2, 3].map((k) => (
				<g key={k}>
					<line x1={x0 + k * px} x2={x0 + k * px} y1={208} y2={220} stroke={BOOK.ink} strokeWidth={1.2} />
					<T x={x0 + k * px} y={238} size={14} italic anchor="middle">
						{`${k} s`}
					</T>
				</g>
			))}
			{pct > 0 && (
				<g>
					<Ink d={`M${x0 + 2.17 * px} 80 L${x0 + 2.17 * px} 196`} w={1.4} color={BOOK.terracotta} dash="4 4" p={pct} second={false} />
					<Ink d={`M${x0 + 2.17 * px + 2} 198 L${x0 + 2.96 * px - 2} 198 M${x0 + 2.96 * px - 8} 193 L${x0 + 2.96 * px - 2} 198 L${x0 + 2.96 * px - 8} 203`} w={1.8} color={BOOK.terracotta} p={pct} second={false} />
					<g transform={`translate(${x0 + 2.56 * px} 274) scale(${0.8 + 0.2 * pct})`}>
						<Write text="+36%" p={pct} x={0} y={0} size={40} color={BOOK.terracotta} anchor="middle" />
					</g>
				</g>
			)}
			<T x={a.w - 12} y={26} size={14} italic anchor="end" color={BOOK.brown}>
				average of 7 volunteers
			</T>
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 5 — the wrist test. Events: wrist, flash, blur, pop; didnt (the prediction is crossed out).

export const Chronometer: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const wrist = prog(a, 'wrist', 20);
	const flash = prog(a, 'flash', 16);
	const blur = prog(a, 'blur', 16);
	const pop = prog(a, 'pop', 10);
	const sp = since(a, 'pop');
	const no = prog(a, 'didnt', 14);
	const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.2);
	const dev = {x: 168, y: 150};
	return (
		<Reveal p={shown(a)}>
			{/* the forearm with the device strapped on like a watch */}
			<Shape d={smooth([[-20, 168], [96, 172], [104, 236], [-20, 240]], true, 0.4)} color={BOOK.olive} hatch="light" w={2.2} />
			<Shape d={smooth([[96, 178], [236, 186], [244, 226], [100, 232]], true, 0.6)} color={BOOK.skin} w={2.2} />
			<HandShape at={[240, 206]} angle={4} grip="relaxed" skin={BOOK.skin} s={2.4} />
			<Shape d={roughRect(dev.x - 16, 172, 32, 64, 1790, 0.3)} color="#5E4A3A" w={1.6} />
			<Shape d={roughRect(dev.x - 46, dev.y - 40, 92, 72, 1791, 0.4)} color={BOOK.black} w={2.2} wear={false} />
			<LedTile x={dev.x} y={dev.y - 4} size={52} mode={flash > 0.5 ? 'blur' : 'off'} glow={0.9 + 0.1 * pulse} frame={false} />
			{flash > 0 &&
				[-50, -20, 20, 50].map((ang, i) => {
					const [x1, y1] = rotPt([0, -50], ang);
					const [x2, y2] = rotPt([0, -62], ang);
					return <line key={i} x1={dev.x + x1} y1={dev.y - 4 + y1} x2={dev.x + x2} y2={dev.y - 4 + y2} stroke={BOOK.terracotta} strokeWidth={2} opacity={flash * (0.4 + 0.6 * pulse)} />;
				})}
			<Callout from={[dev.x - 30, dev.y + 30]} to={[24, 286]} text="a tiny LED screen" p={wrist} size={16} />
			{/* how it works: a number, its negative, alternating too fast = a blur */}
			<g opacity={flash}>
				<LedTile x={300} y={82} size={46} mode="digit" glow={0.6 + 0.4 * pulse} />
				<LedTile x={392} y={82} size={46} mode="neg" glow={1 - 0.4 * pulse} />
				<text x={346} y={90} fontFamily={FELL} fontSize={26} fill={BOOK.ink} textAnchor="middle">
					⇄
				</text>
				<text x={300} y={134} fontFamily={FELL} fontStyle="italic" fontSize={14} fill={BOOK.ink} textAnchor="middle">
					a number
				</text>
				<text x={392} y={134} fontFamily={FELL} fontStyle="italic" fontSize={14} fill={BOOK.ink} textAnchor="middle">
					its negative
				</text>
			</g>
			{blur > 0 && (
				<g opacity={blur}>
					<text x={438} y={90} fontFamily={FELL} fontSize={26} fill={BOOK.ink} textAnchor="middle">
						=
					</text>
					<LedTile x={480} y={82} size={46} mode="blur" glow={0.9} />
					<Write text="too fast:" p={blur} x={480} y={134} size={14} italic anchor="middle" />
					<Write text="a blur" p={blur} x={480} y={151} size={14} italic anchor="middle" />
				</g>
			)}
			{/* the prediction */}
			{pop > 0 && (
				<g opacity={clamp(pop * 2)}>
					<Ink d={roughRect(282, 182, 222, 112, 1795, 0.5)} w={1.6} dash="6 5" color={BOOK.ink} p={1} second={false} />
					<text x={296} y={206} fontFamily={FELL_SC} fontSize={15} letterSpacing={2} fill={BOOK.brown}>
						the prediction
					</text>
					<T x={296} y={236} size={17} italic>
						if time slowed,
					</T>
					<T x={296} y={258} size={17} italic>
						you could read it:
					</T>
					<g transform={`translate(458 244) scale(${0.6 + 0.4 * pop + (sp > 0 && sp < 14 ? Math.sin((sp / 14) * Math.PI) * 0.15 : 0)})`}>
						<LedTile x={0} y={0} size={50} mode="digit" glow={1} />
					</g>
				</g>
			)}
			{no > 0 && (
				<g>
					<Ink d={`M290 190 L496 286`} w={4} color={BOOK.terracotta} p={no} second={false} />
					<Ink d={`M496 190 L290 286`} w={4} color={BOOK.terracotta} p={clamp(no * 2 - 1)} second={false} />
				</g>
			)}
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 6 — mid-fall vs. on the ground. Events: air, ground.

const Device: React.FC = () => (
	<g transform="translate(-14 -2)">
		<rect x={-9} y={-8} width={18} height={14} rx={2} fill={BOOK.black} stroke={BOOK.ink} strokeWidth={1.2} />
		<rect x={-6} y={-5} width={12} height={8} fill={BOOK.glow} opacity={0.55} />
	</g>
);

export const FallResult: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const air = prog(a, 'air', 26);
	const ground = prog(a, 'ground', 26);
	const mid = a.w / 2;
	return (
		<Reveal p={shown(a)}>
			{/* left: falling, the sky rushing up */}
			<rect x={-4} y={-4} width={mid + 4} height={250} fill="#DCCBA6" />
			{Array.from({length: 8}, (_, i) => {
				const x = 18 + i * 27;
				const y = ((((i * 61 - t * 420) % 300) + 300) % 300) - 40;
				return <line key={i} x1={x} y1={y} x2={x} y2={y + 34} stroke={BOOK.ink} strokeWidth={1.2} opacity={0.3} />;
			})}
			<Jumper x={150} y={140} s={0.56} rot={Math.sin(t * 3) * 3} near={[44, -122]} hold={<Device />} face={{look: [1, -0.2], raise: 1, mouth: 'o', worry: 0.4}} />
			<text x={86} y={74} fontFamily={FELL} fontSize={34} fill={BOOK.terracotta} textAnchor="middle" opacity={air}>
				?
			</text>
			{/* right: standing on the ground */}
			<rect x={mid} y={210} width={mid + 4} height={40} fill="#A89574" />
			<Ink d={roughLine(mid, 210, a.w + 4, 210, 1800, 0.4)} w={1.8} />
			<Figure x={mid + 108} y={210 - 112 * 0.56} s={0.56} turn={0.6} look={STRANGER} near={{hand: [44, -110], grip: 'fist', hold: <Device />}} face={{look: [0.6, -0.2], worry: 0.6, blink: blinking(a, 3.1, 0.2)}} breath={Math.sin(t * 1.4) * 0.5 + 0.5} />
			<text x={mid + 170} y={60} fontFamily={FELL} fontSize={34} fill={BOOK.terracotta} textAnchor="middle" opacity={ground}>
				?
			</text>
			<Ink d={`M${mid} 0 L${mid} 250`} w={1.6} dash="7 6" p={1} second={false} />
			<text x={mid / 2} y={30} fontFamily={FELL_SC} fontSize={17} letterSpacing={2} fill={BOOK.ink} textAnchor="middle">
				in the air
			</text>
			<text x={mid * 1.5} y={30} fontFamily={FELL_SC} fontSize={17} letterSpacing={2} fill={BOOK.ink} textAnchor="middle">
				on the ground
			</text>
			<Ink d={roughLine(-4, 250, a.w + 4, 250, 1801, 0.3)} w={1.6} />
			{/* the score: digits read correctly */}
			<T x={mid} y={272} size={15} italic anchor="middle">
				digits read correctly
			</T>
			<rect x={40} y={282} width={130 * air} height={18} fill={BOOK.blue} />
			<rect x={mid + 50} y={282} width={130 * ground} height={18} fill={BOOK.blue} />
			<text x={mid} y={298} fontFamily={FELL} fontSize={26} fill={BOOK.terracotta} textAnchor="middle" opacity={ground}>
				=
			</text>
			<T x={12} y={328} size={13} italic color={BOOK.brown}>
				one small study · still debated
			</T>
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 8 — memory as footage (a metaphor). Events: alarm, store, more, time.

const FrameDoodle: React.FC<{x: number; y: number; w: number; h: number; rot: number}> = ({x, y, w, h, rot}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} fill={BOOK.parchment} />
		<GlassCup x={x + w / 2} y={y + h * 0.82} rot={rot} ghost={BOOK.ink} s={0.32} w={3.4} />
	</g>
);

export const MemoryReel: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const alarm = prog(a, 'alarm', 14);
	const ss = since(a, 'store');
	const more = prog(a, 'more', 40);
	const feel = prog(a, 'time', 24);
	const pulse = alarm * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.4));
	const bx = 150;
	const by = 158;
	const bs = 1.2;
	const amy: Pt = [bx - 22 * bs, by + 22 * bs];
	const x0 = 330;
	const W1 = 200;
	const nB = 9;
	const wB = lerp(W1, 290, more);
	return (
		<Reveal p={shown(a)}>
			<Brain x={bx} y={by} s={bs} spot={[-22, 22]} spotR={9} glow={pulse} />
			{alarm > 0 &&
				[-60, -20, 20, 60].map((ang, i) => {
					const [x1, y1] = rotPt([0, -22], ang + 180);
					const [x2, y2] = rotPt([0, -34], ang + 180);
					return <line key={i} x1={amy[0] + x1} y1={amy[1] + y1} x2={amy[0] + x2} y2={amy[1] + y2} stroke={BOOK.terracotta} strokeWidth={2.2} opacity={alarm * (0.4 + 0.6 * pulse)} />;
				})}
			<Callout from={amy} to={[30, 272]} text="amygdala (simplified)" p={alarm} size={16} />
			{/* the alarm pushes extra detail into memory */}
			{ss > 0 && (
				<g>
					<Ink d={smooth([[amy[0] + 14, amy[1] + 4], [230, 214], [290, 200], [322, 184]])} w={2} color={BOOK.terracotta} dash="6 5" p={clamp(ss / 16)} second={false} />
					<Ink d="M314 178 L324 184 L314 192" w={2} color={BOOK.terracotta} p={clamp((ss - 12) / 6)} second={false} />
					<Write text="extra detail" p={clamp((ss - 6) / 20)} x={236} y={246} size={15} italic color={BOOK.terracotta} />
				</g>
			)}
			{/* an ordinary second */}
			<T x={x0} y={62} size={17} italic>
				an ordinary second
			</T>
			<Film x={x0} y={72} w={W1} />
			{[0, 1, 2].map((i) => (
				<FrameDoodle key={i} x={x0 + 22 + i * 64} y={80} w={28} h={24} rot={0} />
			))}
			{/* a frightening second: the same second, many more frames */}
			<T x={x0} y={152} size={17} italic color={BOOK.terracotta}>
				a frightening second
			</T>
			<Film x={x0} y={162} w={wB} />
			{Array.from({length: nB}, (_, i) => {
				const appear = ss - i * 3;
				if (!(appear > 0)) return null;
				const step = (wB - 12) / nB;
				return <FrameDoodle key={i} x={x0 + 6 + i * step + (step - 18) / 2} y={170} w={18} h={24} rot={i * 14} />;
			})}
			{/* the recording time is the same; the playback isn't */}
			<Ink d={`M${x0} 220 L${x0 + W1} 220 M${x0} 214 L${x0} 226 M${x0 + W1} 214 L${x0 + W1} 226`} w={1.2} opacity={1 - more} second={false} />
			<T x={x0 + W1 / 2} y={240} size={14} italic anchor="middle" opacity={1 - more}>
				both: one real second
			</T>
			{feel > 0 && (
				<g>
					<Ink d={`M${x0} 222 L${x0 + wB} 222 M${x0 + wB - 6} 216 L${x0 + wB} 222 L${x0 + wB - 6} 228`} w={2} color={BOOK.terracotta} p={feel} second={false} />
					<Write text="played back: feels longer" p={feel} x={x0 + wB / 2} y={246} size={17} italic color={BOOK.terracotta} anchor="middle" />
				</g>
			)}
			<T x={a.w - 12} y={318} size={13} italic anchor="end" color={BOOK.brown}>
				a metaphor: memory is not a film
			</T>
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 9 — a short beach vacation, remembered. Events: first, routine, flew.

type Icon = 'suitcase' | 'palm' | 'shell' | 'fish' | 'sunset' | 'drink' | 'lounger' | 'plate';
const MiniIcon: React.FC<{kind: Icon; x: number; y: number}> = ({kind, x, y}) => {
	const c = BOOK.ink;
	const g = (d: string, fill?: string) => (fill ? <path d={d} fill={fill} stroke={c} strokeWidth={1.2} strokeLinejoin="round" /> : <path d={d} fill="none" stroke={c} strokeWidth={1.3} strokeLinecap="round" />);
	return (
		<g transform={`translate(${x} ${y})`}>
			{kind === 'suitcase' && (
				<>
					{g('M-9 -4 L9 -4 L9 9 L-9 9 Z', BOOK.terracotta)}
					{g('M-4 -4 L-4 -8 L4 -8 L4 -4')}
				</>
			)}
			{kind === 'palm' && (
				<>
					{g('M0 10 Q2 0 0 -6')}
					{g('M0 -6 Q-8 -10 -11 -4 M0 -6 Q8 -10 11 -4 M0 -6 Q-4 -12 -2 -14 M0 -6 Q5 -12 6 -12')}
				</>
			)}
			{kind === 'shell' && g('M-9 6 Q0 -14 9 6 Z M0 6 L-5 -4 M0 6 L0 -6 M0 6 L5 -4', BOOK.parchment)}
			{kind === 'fish' && (
				<>
					{g('M-8 0 Q0 -8 6 0 Q0 8 -8 0 Z', BOOK.blue)}
					{g('M6 0 L11 -5 L11 5 Z', BOOK.blue)}
				</>
			)}
			{kind === 'sunset' && (
				<>
					{g('M-9 4 A9 9 0 0 1 9 4 Z', BOOK.ochre)}
					{g('M-12 4 L12 4 M-8 8 L8 8')}
				</>
			)}
			{kind === 'drink' && (
				<>
					{g('M-7 -6 L7 -6 L0 3 Z', BOOK.terracotta)}
					{g('M0 3 L0 9 M-4 9 L4 9 M3 -6 L7 -12')}
				</>
			)}
			{kind === 'lounger' && g('M-10 6 L-4 0 L10 0 M-4 0 L-8 -8 M-6 0 L-6 6 M8 0 L8 6')}
			{kind === 'plate' && g('M-10 2 A10 4 0 0 0 10 2 A10 4 0 0 0 -10 2 Z M12 -6 L12 6', BOOK.parchment)}
		</g>
	);
};

export const VacationStrip: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const sf = since(a, 'first');
	const sr = since(a, 'routine');
	const flew = prog(a, 'flew', 20);
	const segs: {label: string; x: number; w: number; icons: Icon[]; when: number}[] = [
		{label: 'the start', x: 22, w: 220, icons: ['suitcase', 'palm', 'shell', 'fish', 'sunset', 'drink'], when: sf},
		{label: 'the middle', x: 254, w: 170, icons: ['lounger', 'plate', 'lounger', 'plate'], when: sr},
		{label: 'the end', x: 436, w: 146 - 26 * flew, icons: ['lounger', 'lounger', 'lounger'], when: sr - 12},
	];
	return (
		<Reveal p={shown(a)}>
			{/* the beach */}
			<circle cx={540} cy={46} r={50} fill="url(#tb-glow)" opacity={0.8} />
			<Shape d={roughEllipse(540, 46, 18, 18, 1810, 0.3)} color={BOOK.glow} w={1.6} />
			<rect x={-4} y={92} width={a.w + 8} height={34} fill={BOOK.blue} opacity={0.85} />
			{Array.from({length: 7}, (_, i) => {
				const x = ((i * 96 + t * 18) % (a.w + 80)) - 40;
				return <Ink key={i} d={`M${x} ${104 + (i % 2) * 10} q8 -5 16 0 q8 5 16 0`} w={1.2} color={BOOK.parchment} opacity={0.8} second={false} />;
			})}
			<rect x={-4} y={126} width={a.w + 8} height={44} fill="#E2CC9A" />
			<rect x={-4} y={126} width={a.w + 8} height={44} fill="url(#tb-stipple)" opacity={0.4} />
			<Ink d={roughLine(-4, 126, a.w + 4, 126, 1811, 0.3)} w={1.4} second={false} />
			{/* umbrella and a lounger with the traveller */}
			<Ink d={roughLine(330, 166, 318, 64, 1812, 0.3)} w={2.4} />
			<Shape d={smooth([[262, 82], [318, 50], [378, 78], [350, 74], [318, 70], [290, 76]], true, 0.6)} color={BOOK.terracotta} hatch="light" w={2} />
			<Ink d={`M300 154 L384 150 M300 154 L292 166 M378 150 L386 166 M300 154 L282 128`} w={2.4} color={BOOK.woodDark} second={false} />
			<g transform="translate(346 146) rotate(-58)">
				<Figure x={0} y={0} s={0.34} pose="sit" seat={40} turn={0.7} look={MAIN} near={{hand: [44, -60], grip: 'hold'}} face={{smile: 0.7, lid: 0.6, look: [0.5, -0.4]}} breath={Math.sin(t * 1.2) * 0.5 + 0.5} />
			</g>
			{/* palm on the left */}
			<Ink d={smooth([[60, 168], [70, 120], [66, 70]])} w={5} color={BOOK.woodDark} second={false} />
			{[-40, -10, 25, 60].map((ang, i) => {
				const [x, y] = rotPt([0, -46], ang - 90 + 90);
				return <Ink key={i} d={smooth([[66, 70], [66 + x * 0.5, 70 + y * 0.7 - 8], [66 + x, 70 + y * 0.4 + 14]])} w={4} color={BOOK.olive} second={false} />;
			})}
			{/* how long each part felt, looking back */}
			<T x={22} y={190} size={14} italic>
				how long each part felt, looking back (schematic)
			</T>
			{segs.map((sg, si) => {
				const fw = (sg.w - 8) / sg.icons.length;
				const shown_ = Number.isFinite(sg.when) && sg.when > 0;
				return (
					<g key={si}>
						<Film x={sg.x} y={200} w={sg.w} h={40} />
						{sg.icons.map((ic, i) => {
							const appear = sg.when - i * (si === 0 ? 6 : 3);
							if (!(appear > 0)) return null;
							return (
								<g key={i} opacity={clamp(appear / 6)}>
									<rect x={sg.x + 4 + i * fw + 2} y={207} width={fw - 4} height={26} fill={BOOK.parchment} />
									<MiniIcon kind={ic} x={sg.x + 4 + i * fw + fw / 2} y={221} />
								</g>
							);
						})}
						<T x={sg.x + sg.w / 2} y={258} size={14} italic anchor="middle" opacity={shown_ ? 1 : 0.5}>
							{sg.label}
						</T>
					</g>
				);
			})}
			{flew > 0 &&
				[0, 1, 2].map((i) => <Ink key={i} d={`M${590 - i * 4} ${208 + i * 12} l-${18 + i * 6} 0`} w={1.4} opacity={flew * 0.7} second={false} />)}
			<T x={a.w - 12} y={290} size={13} italic anchor="end" color={BOOK.brown}>
				Avni-Babad & Ritov, 2003
			</T>
		</Reveal>
	);
};

// ---------------------------------------------------------------------------------------------
// fig. 10 — the same walk, a new way (a map). Events: walk, new.

const along = (pts: Pt[], k: number): Pt => {
	const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
	const total = segs.reduce((x, y) => x + y, 0);
	let d = clamp(k) * total;
	for (let i = 0; i < segs.length; i++) {
		if (d <= segs[i]) return lerpPt(pts[i], pts[i + 1], segs[i] ? d / segs[i] : 0);
		d -= segs[i];
	}
	return pts[pts.length - 1];
};

export const NewRoute: React.FC = () => {
	const a = useArt();
	const sw = since(a, 'walk');
	const sn = since(a, 'new');
	const draw = prog(a, 'new', 30, 0, false);
	const usual: Pt[] = [
		[56, 236],
		[310, 236],
		[310, 84],
	];
	const fresh: Pt[] = [
		[56, 236],
		[56, 196],
		[142, 184],
		[170, 140],
		[236, 124],
		[270, 92],
		[310, 84],
	];
	const marks: {at: number; p: Pt; label: string}[] = [
		{at: 0.3, p: [142, 184], label: 'a park'},
		{at: 0.55, p: [184, 120], label: 'a bakery'},
		{at: 0.8, p: [252, 104], label: 'a mural'},
	];
	const dotUsual = sw > 0 && !(sn > 0) ? along(usual, (sw % 50) / 50) : null;
	const dotNew = sn > 0 ? along(fresh, clamp((sn - 4) / 44)) : null;
	return (
		<Reveal p={shown(a)}>
			{/* streets and blocks */}
			{Array.from({length: 4}, (_, i) =>
				Array.from({length: 3}, (_, j) => <rect key={`${i}-${j}`} x={20 + i * 86} y={60 + j * 70} width={70} height={54} fill={BOOK.olive} opacity={0.12} />),
			)}
			{/* park */}
			{[[110, 160], [132, 152], [118, 140]].map(([x, y], i) => (
				<Shape key={i} d={roughEllipse(x, y, 10, 10, 1820 + i, 0.4)} color={BOOK.olive} w={1.3} />
			))}
			{/* the worn usual way */}
			{[0, 1, 2, 3].map((i) => (
				<Ink key={i} d={smooth(usual.map(([x, y]) => [x + i * 1.2 - 2, y + i * 1.1 - 2] as Pt), false, 0.2)} w={1.6} color="#8E8677" opacity={0.6} second={false} />
			))}
			<T x={190} y={258} size={14} italic anchor="middle" color={BOOK.brown}>
				the usual way
			</T>
			{/* home and work */}
			<Shape d="M44 246 L44 226 L56 214 L68 226 L68 246 Z" color={BOOK.parchment} w={1.8} />
			<Shape d={roughRect(298, 52, 26, 34, 1825, 0.3)} color={BOOK.parchment} w={1.8} />
			<T x={56} y={268} size={14} italic anchor="middle">
				home
			</T>
			<T x={311} y={44} size={14} italic anchor="middle">
				work
			</T>
			{/* the new way */}
			{draw > 0 && <Ink d={smooth(fresh)} w={2.6} color={BOOK.terracotta} dash="7 6" p={draw} second={false} />}
			{marks.map((m, i) => {
				const pk = sn > 0 ? clamp((sn - 4 - m.at * 44) / 6) : 0;
				return pk > 0 ? (
					<g key={i} opacity={pk}>
						<circle cx={m.p[0]} cy={m.p[1]} r={4} fill={BOOK.terracotta} />
						<text x={m.p[0] + 8} y={m.p[1] - 6} fontFamily={HAND} fontWeight={700} fontSize={13} fill={BOOK.terracotta}>
							{m.label}
						</text>
					</g>
				) : null;
			})}
			{dotUsual && <circle cx={dotUsual[0]} cy={dotUsual[1]} r={6} fill="#8E8677" stroke={BOOK.ink} strokeWidth={1.2} />}
			{dotNew && <circle cx={dotNew[0]} cy={dotNew[1]} r={6.5} fill={BOOK.terracotta} stroke={BOOK.ink} strokeWidth={1.2} />}
			{/* new frames for the memory */}
			<Film x={18} y={10} w={180} h={34} />
			{marks.map((m, i) => {
				const pk = sn > 0 ? clamp((sn - 4 - m.at * 44) / 6) : 0;
				return pk > 0 ? (
					<g key={i} opacity={pk}>
						<rect x={28 + i * 56} y={16} width={44} height={22} fill={BOOK.parchment} />
						<text x={50 + i * 56} y={32} fontFamily={HAND} fontWeight={700} fontSize={12} fill={BOOK.terracotta} textAnchor="middle">
							new
						</text>
					</g>
				) : null;
			})}
		</Reveal>
	);
};
