import React from 'react';
import {FELL, FELL_SC} from '../../fonts';
import {blinking, prog, shown, since, useArt, wave} from '../context';
import {Hand, Head, Sleeve, Torso} from '../figures';
import {Callout, Ink, Reveal, Shape, Spark, T, Write} from '../ink';
import {BOOK} from '../palette';
import {along, Pt, rng, roughEllipse, roughLine, roughRect, smooth} from '../rough';

/** Phase of an impulse that speeds up smoothly after event `name` (period `slow` -> `fast` seconds). */
const racingPhase = (f: number, fps: number, evAt: number, slow: number, fast: number) => {
	const t = f / fps;
	if (!Number.isFinite(evAt) || f < evAt) return t / slow;
	const t0 = evAt / fps;
	const s = t - t0;
	const ramp = s < 1 ? (s * s) / 2 : s - 0.5; // speed ramps up over one second
	return t / slow + (1 / fast - 1 / slow) * ramp;
};

const DENDRITES: Pt[][] = [
	[[150, 284], [115, 250], [70, 215]],
	[[115, 250], [100, 196], [88, 170]],
	[[100, 196], [124, 172]],
	[[88, 170], [66, 158]],
	[[142, 300], [100, 305], [48, 290]],
	[[100, 305], [70, 330], [40, 338]],
	[[152, 318], [120, 360], [98, 398]],
	[[120, 360], [80, 372]],
	[[172, 274], [182, 230], [170, 182]],
	[[182, 230], [212, 198]],
	[[186, 322], [202, 366], [226, 396]],
	[[202, 366], [184, 402]],
];

const axonY = (x: number) => 306 + 6 * Math.sin(((x - 200) / 220) * Math.PI);

/**
 * fig. 3: a neuron in the style of an old anatomy plate, under a dark title band.
 * Events: rnt (title writes on), alert (impulses speed up and multiply).
 * Labelled as simplified; the speeding impulses are flagged as a metaphor.
 */
export const Neuron: React.FC<{title?: string; subtitle?: string}> = ({title = 'Repetitive Negative Thinking', subtitle = 'worry runs ahead to the future · rumination replays the past'}) => {
	const a = useArt();
	const p = shown(a, 6, 40);
	const alert = prog(a, 'alert', 30);
	const titleP = prog(a, 'rnt', 40, 0, false);
	const subP = prog(a, 'rnt', 50, 24, false);
	const phase = racingPhase(a.f, a.fps, a.ev('alert'), 1.9, 0.75);
	const path: Pt[] = [[70, 215], [115, 250], [150, 284], [170, 300], [198, 302], ...[230, 260, 300, 340, 380, 408].map((x): Pt => [x, axonY(x)]), [424, 312], [458, 314]];
	const side1: Pt[] = [[48, 290], [100, 305], [142, 300], [170, 300]];
	const side2: Pt[] = [[170, 182], [182, 230], [172, 274], [170, 300]];
	const myelin = [
		[236, 274],
		[282, 320],
		[328, 366],
		[374, 406],
	];
	const labelP = (d: number) => prog(a, 'rnt', 30, 30 + d);
	const vesicle = (a.f / a.fps) * (1 + alert * 1.4);
	return (
		<g>
			{/* dark title band */}
			<rect x={-4} y={-4} width={a.w + 8} height={122} fill={BOOK.ink} />
			<rect x={-4} y={-4} width={a.w + 8} height={122} fill="url(#tb-wear)" opacity={0.6} />
			<Write text={title} p={titleP} x={a.w / 2} y={56} size={30} font={FELL_SC} color={BOOK.parchment} anchor="middle" spacing={1} />
			<Write text={subtitle} p={subP} x={a.w / 2} y={88} size={16.5} italic color={BOOK.parchment} anchor="middle" opacity={0.85} />
			{titleP > 0 && <Ink d={roughLine(a.w / 2 - 120 * titleP, 102, a.w / 2 + 120 * titleP, 102, 401, 0.4)} w={1.2} color={BOOK.ochre} p={1} second={false} />}
			<Ink d={roughLine(0, 118, a.w, 118, 402, 0.6)} w={2.2} p={1} />
			<Reveal p={p}>
				<g transform="translate(0 -22)">
					{/* soft glow of activity around the cell body */}
					<circle cx={170} cy={300} r={60} fill="url(#tb-glow)" opacity={0.15 + 0.35 * alert * wave(a, 0.8)} />
					{DENDRITES.map((pts, i) => (
						<Ink key={i} d={smooth(pts)} w={i % 2 === 0 || i === 0 ? 3 : 1.7} />
					))}
					{/* receiving neuron, entering from the right edge */}
					{[
						[[540, 300], [500, 302], [466, 288]],
						[[500, 302], [470, 316]],
						[[530, 352], [496, 346], [464, 344]],
						[[540, 250], [508, 262], [486, 240]],
					].map((pts, i) => (
						<Ink key={`r${i}`} d={smooth(pts as Pt[])} w={i === 0 ? 3 : 1.8} opacity={0.85} />
					))}
					{/* axon with myelin sheath */}
					<Ink d={smooth([[196, 302], [214, 305], ...[230, 300, 380, 412].map((x): Pt => [x, axonY(x)]), [424, 312]])} w={2.4} />
					{myelin.map(([x0, x1], i) => (
						<Shape key={i} d={smooth([[x0, axonY(x0) - 7], [(x0 + x1) / 2, axonY((x0 + x1) / 2) - 8], [x1, axonY(x1) - 7], [x1 + 3, axonY(x1)], [x1, axonY(x1) + 7], [(x0 + x1) / 2, axonY((x0 + x1) / 2) + 8], [x0, axonY(x0) + 7], [x0 - 3, axonY(x0)]], true)} color={BOOK.parchment} hatch="light" w={1.7} />
					))}
					{/* terminals */}
					{[
						[452, 288],
						[458, 314],
						[450, 342],
					].map(([x, y], i) => (
						<g key={i}>
							<Ink d={smooth([[424, 312], [436, (312 + y) / 2], [x - 4, y]])} w={1.8} />
							<Shape d={roughEllipse(x, y, 6, 6, 410 + i, 0.4, 10)} color={BOOK.ochre} w={1.5} wear={false} />
						</g>
					))}
					{/* cell body with nucleus */}
					<Shape d={roughEllipse(170, 300, 31, 27, 420, 0.8)} color={'#D7B57C'} hatch="stipple" w={2.6} />
					<Shape d={roughEllipse(166, 298, 11, 10, 421, 0.5)} color={BOOK.brown} w={1.6} />
					<circle cx={168} cy={296} r={3} fill={BOOK.ink} />
					{/* impulses */}
					{p > 0.95 &&
						[0, 1, 2].map((i) => {
							const op = i === 0 ? 1 : alert;
							if (op <= 0) return null;
							const [x, y] = along(path, phase + i / 3);
							return <Spark key={i} x={x} y={y} r={6} opacity={op} />;
						})}
					{p > 0.95 &&
						alert > 0 &&
						[side1, side2].map((pts, i) => {
							const [x, y] = along(pts, phase * 1.3 + i * 0.5);
							return <Spark key={`s${i}`} x={x} y={y} r={4.5} opacity={alert * 0.9} />;
						})}
					{/* synapse inset */}
					<g>
						<clipPath id="tb-syn">
							<circle cx={392} cy={384} r={40} />
						</clipPath>
						<circle cx={392} cy={384} r={40} fill={BOOK.parchment} />
						<g clipPath="url(#tb-syn)">
							<Shape d={roughEllipse(392, 360, 34, 24, 430, 0.5)} color={BOOK.ochre} hatch="light" w={1.6} />
							{[
								[380, 356],
								[394, 352],
								[404, 362],
								[386, 368],
							].map(([x, y], i) => (
								<circle key={i} cx={x} cy={y} r={4} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1} />
							))}
							<Shape d={smooth([[346, 404], [370, 396], [392, 394], [414, 396], [440, 404], [440, 440], [346, 440]], true)} color={'#C9B497'} hatch="light" w={1.6} />
							{[372, 386, 400, 414].map((x, i) => (
								<rect key={i} x={x - 3} y={393} width={6} height={4} fill={BOOK.terracotta} />
							))}
							{Array.from({length: 6}, (_, i) => {
								const t = (vesicle * 0.9 + i / 6) % 1;
								return <circle key={i} cx={372 + ((i * 37) % 44)} cy={384 + t * 10} r={1.8} fill={BOOK.terracotta} opacity={Math.sin(t * Math.PI)} />;
							})}
						</g>
						<Ink d={roughEllipse(392, 384, 40, 40, 431, 0.4, 16)} w={2} />
						<Ink d="M420 356 L446 340" w={1} dash="3 4" second={false} />
					</g>
					<Callout from={[100, 196]} to={[24, 156]} text="dendrites" p={labelP(0)} />
					<Callout from={[188, 282]} to={[236, 236]} text="cell body" p={labelP(8)} />
					<Callout from={[300, 300]} to={[318, 262]} text="axon, with myelin sheath" p={labelP(16)} />
					<Callout from={[446, 340]} to={[442, 418]} text="synapse" p={labelP(24)} />
				</g>
				<T x={10} y={a.h - 30} size={14.5} italic color={BOOK.brown}>
					the racing sparks are a metaphor, not a measurement
				</T>
			</Reveal>
		</g>
	);
};

/** fig. 5: dark evidence panel. Events: dozens (papers + counter), worse (the finding writes on). */
export const Evidence: React.FC<{k?: number; cite?: string}> = ({k = 55, cite = 'Clancy et al., 2020'}) => {
	const a = useArt();
	const count = Math.round(k * prog(a, 'dozens', 42, 6));
	const worse = prog(a, 'worse', 40, 0, false);
	const sheets = 7;
	return (
		<Reveal p={shown(a)}>
			<T x={22} y={42} size={22} font={FELL_SC} color={BOOK.ochre} spacing={2}>
				The evidence
			</T>
			{Array.from({length: sheets}, (_, i) => {
				const t = prog(a, 'dozens', 14, i * 4);
				if (t <= 0) return null;
				const r = rng(500 + i);
				const x = 44 + i * 3 + (1 - t) * 60;
				const y = 84 + i * 3 - (1 - t) * 40;
				const rot = -8 + i * 2.2 + (r() - 0.5) * 3;
				return (
					<g key={i} transform={`translate(${x} ${y}) rotate(${rot} 60 75)`} opacity={t}>
						<Shape d={roughRect(0, 0, 120, 150, 510 + i, 0.6)} color={i % 2 ? BOOK.parchment : '#E7DCC4'} w={1.4} />
						{i === sheets - 1 &&
							[24, 40, 56, 72, 88, 104, 120].map((yy, j) => <line key={j} x1={14} x2={j % 3 === 2 ? 70 : 104} y1={yy} y2={yy} stroke={BOOK.ink} strokeWidth={1.2} opacity={0.45} />)}
						{i === sheets - 1 && <path d="M18 132 L40 112 L58 122 L96 96" fill="none" stroke={BOOK.terracotta} strokeWidth={2} />}
					</g>
				);
			})}
			<text x={226} y={132} fontFamily={FELL} fontSize={56} fill={BOOK.parchment} opacity={count > 0 ? 1 : 0}>
				k = {count}
			</text>
			<T x={228} y={160} size={16} italic color={BOOK.parchment} opacity={0.8}>
				results pooled in a meta-analysis
			</T>
			<Write text="more repetitive thinking" p={worse} x={228} y={208} size={20} color={BOOK.parchment} />
			<Write text="goes with poorer sleep" p={prog(a, 'worse', 34, 16, false)} x={228} y={238} size={22} color={BOOK.ochre} />
			<Write text="incl. longer time to fall asleep" p={prog(a, 'worse', 34, 34, false)} x={228} y={264} size={15.5} italic color={BOOK.parchment} opacity={0.8} />
			<T x={22} y={302} size={14.5} italic color={BOOK.parchment} opacity={0.75}>
				{`an association, not proof of cause · ${cite}`}
			</T>
		</Reveal>
	);
};

const cloud = (cx: number, cy: number, r: number): string => {
	const pts: Pt[] = [];
	const n = 14;
	for (let i = 0; i < n; i++) {
		const ang = (i / n) * Math.PI * 2;
		const rr = r * (i % 2 ? 1.0 : 0.86);
		pts.push([cx + Math.cos(ang) * rr * 1.12, cy + Math.sin(ang) * rr * 0.9]);
	}
	return smooth(pts, true, 1.4);
};

const Bear: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{[
			[-8, 22],
			[2, 24],
			[20, 22],
			[30, 24],
		].map(([lx, ly], i) => (
			<Shape key={i} d={roughRect(lx - 4, ly - 8, 9, 14, 600 + i, 0.4)} color={BOOK.parchment} w={1.6 / s} wear={false} />
		))}
		<Shape d={roughEllipse(10, 12, 28, 17, 610, 0.5)} color={BOOK.parchment} w={2 / s} wear={false} />
		<Shape d={roughEllipse(-20, -6, 14, 13, 611, 0.5)} color={BOOK.parchment} w={2 / s} wear={false} />
		<Shape d={roughEllipse(-27, -17, 4.5, 4.5, 612, 0.3, 8)} color={BOOK.parchment} w={1.6 / s} wear={false} />
		<Shape d={roughEllipse(-13, -18, 4.5, 4.5, 613, 0.3, 8)} color={BOOK.parchment} w={1.6 / s} wear={false} />
		<Shape d={roughEllipse(-31, -2, 7, 5, 614, 0.3, 8)} color={BOOK.parchment} w={1.6 / s} wear={false} />
		<circle cx={-37} cy={-3} r={2.2} fill={BOOK.ink} />
		<circle cx={-22} cy={-9} r={1.8} fill={BOOK.ink} />
	</g>
);

/** fig. 6: trying not to think of a white bear. Events: fighting (push away), afterward (rebound). */
export const WhiteBear: React.FC = () => {
	const a = useArt();
	const push = prog(a, 'fighting', 18);
	const s = since(a, 'afterward');
	const rb = s > 0 ? Math.min(1.08, 1 - Math.exp(-s / 7) * Math.cos(s / 4.5)) : 0;
	const bx = 222 + 40 * push * (1 - Math.min(1, rb)) - 6 * rb;
	const sc = (1 - 0.32 * push) * (1 - Math.min(1, rb)) + 1.18 * rb;
	const reach = push * (1 - 0.55 * Math.min(1, rb));
	const extra = [prog(a, 'afterward', 12, 8), prog(a, 'afterward', 12, 16)];
	const label = prog(a, 'afterward', 30, 10, false);
	const h1: Pt = [134 + 26 * reach, 150 - 8 * reach];
	const h2: Pt = [138 + 26 * reach, 186 - 4 * reach];
	return (
		<Reveal p={shown(a)}>
			<Sleeve pts={[[66, 178], [100, 174], h1]} width={12} />
			<Torso x={78} y={168} s={0.55} />
			<Sleeve pts={[[94, 182], [118, 192], h2]} width={13} />
			<Hand x={h1[0]} y={h1[1]} s={0.85} rot={-80} />
			<Hand x={h2[0]} y={h2[1]} s={0.85} rot={-80} />
			<Head x={76} y={128} r={30} eyes="side" brows="worried" mouth="worry" blink={blinking(a, 3, 0.4)} seed={9} />
			{/* thought bubble with the bear */}
			<g>
				<circle cx={128 + (bx - 222) * 0.3} cy={112} r={5} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1.5} />
				<circle cx={146 + (bx - 222) * 0.5} cy={104} r={8} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1.6} />
				<g transform={`translate(${bx} 128) scale(${sc})`}>
					<Shape d={cloud(0, 0, 58)} color={BOOK.parchment} w={2.2 / sc} />
					<Bear x={4} y={-4} s={0.95} />
				</g>
			</g>
			{[
				[286, 228, 24],
				[234, 250, 19],
			].map(([x, y, r], i) =>
				extra[i] > 0 ? (
					<g key={i} transform={`translate(${x} ${y}) scale(${extra[i]})`}>
						<Shape d={cloud(0, 0, r)} color={BOOK.parchment} w={1.8} />
						<Bear x={2} y={-2} s={r / 62} />
					</g>
				) : null,
			)}
			<Write text="the rebound effect" p={label} x={a.w - 12} y={30} size={19} italic color={BOOK.terracotta} anchor="end" />
			{label > 0 && <Ink d={roughLine(a.w - 160, 37, a.w - 14, 37, 620, 0.5)} w={1.6} color={BOOK.terracotta} p={label} second={false} />}
			<Write text="Wegner et al., 1987" p={prog(a, 'afterward', 26, 26, false)} x={a.w - 12} y={54} size={13.5} italic color={BOOK.brown} anchor="end" />
		</Reveal>
	);
};

/** A small dark note panel: where everyday worry ends and medical advice begins. */
export const Note: React.FC<{lines?: string[]; accent?: string}> = ({lines = ['Everyday worry', 'is not a disorder.', '', 'But most nights,', 'for weeks?'], accent = 'Talk to a doctor.'}) => {
	const a = useArt();
	const p = shown(a, 0, 30);
	const step = (i: number) => Math.max(0, Math.min(1, (a.f - a.show - 14 - i * 9) / 18));
	return (
		<Reveal p={p}>
			<circle cx={114} cy={50} r={18} fill={BOOK.ochre} />
			<circle cx={121} cy={45} r={16} fill={BOOK.ink} />
			<T x={114} y={98} size={21} font={FELL_SC} color={BOOK.ochre} anchor="middle" spacing={2}>
				A note
			</T>
			<Ink d={roughLine(62, 110, 166, 110, 700, 0.4)} w={1.2} color={BOOK.ochre} second={false} />
			{lines.map((l, i) => (
				<Write key={i} text={l} p={Number.isFinite(a.show) ? step(i) : 1} x={114} y={146 + i * 25} size={19} color={BOOK.parchment} anchor="middle" />
			))}
			<Write text={accent} p={Number.isFinite(a.show) ? step(lines.length) : 1} x={114} y={146 + lines.length * 25 + 8} size={21} color={BOOK.ochre} anchor="middle" italic />
		</Reveal>
	);
};
