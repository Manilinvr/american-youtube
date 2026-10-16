import React from 'react';
import {FELL, FELL_SC, HAND} from '../../fonts';
import {blinking, parallax, prog, shown, since, stages, track, useArt, wave} from '../context';
import {Hand, Head, lookAt, Sleeper, Sleeve, Torso} from '../figures';
import {Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Pt, roughEllipse, roughLine, roughPoly, roughRect, smooth} from '../rough';
import {loopPt, Tag, ThoughtLoop, writheAt} from './motifs';

/** Loop phase so that the impulse sits at `t0` exactly when event `name` fires (laps every `lap` seconds). */
const phaseAt = (f: number, fps: number, evAt: number, t0: number, lap: number) => {
	const ref = Number.isFinite(evAt) ? evAt : 0;
	return t0 + (f - ref) / (lap * fps);
};

/** Damped wobble after something lands or pops in (degrees). */
const settle = (s: number, amount = 8) => (s > 0 && s < 90 ? amount * Math.exp(-s / 10) * Math.sin(s / 2.4) : 0);

const cloudPath = (cx: number, cy: number, w: number) =>
	smooth(
		[
			[cx - w * 0.5, cy + w * 0.08],
			[cx - w * 0.35, cy - w * 0.1],
			[cx - w * 0.1, cy - w * 0.18],
			[cx + w * 0.15, cy - w * 0.12],
			[cx + w * 0.38, cy - w * 0.08],
			[cx + w * 0.5, cy + w * 0.08],
		],
		true,
	);

const Window: React.FC<{x: number; y: number; w: number; h: number; moonX: number; t: number}> = ({x, y, w, h, moonX, t}) => {
	const frame = '#B9AE96';
	// clouds drift slowly across the moon
	const clouds = [0, 1].map((i) => ({cx: x - 60 + ((t * (9 + i * 4) + i * 170) % (w + 140)), cy: y + h * (0.2 + i * 0.22), w: 90 - i * 20}));
	return (
		<g>
			<clipPath id="tb-window">
				<rect x={x} y={y} width={w} height={h} />
			</clipPath>
			<Shape d={roughRect(x, y, w, h, 31, 0.8)} color={BOOK.nightDeep} hatch="light" hatchOpacity={0.5} />
			<g clipPath="url(#tb-window)">
				<circle cx={moonX} cy={y + h * 0.25} r={w * 0.28} fill="url(#tb-glow)" opacity={0.35} />
				<Shape d={roughEllipse(moonX, y + h * 0.25, w * 0.12, w * 0.12, 4, 0.5)} color={BOOK.moon} w={1.6} />
				<circle cx={moonX - w * 0.03} cy={y + h * 0.23} r={w * 0.025} fill={BOOK.ochre} opacity={0.35} />
				<circle cx={moonX + w * 0.04} cy={y + h * 0.28} r={w * 0.016} fill={BOOK.ochre} opacity={0.3} />
				{[
					[0.18, 0.15],
					[0.3, 0.42],
					[0.82, 0.12],
					[0.7, 0.55],
					[0.15, 0.7],
				].map(([sx, sy], i) => (
					<path key={i} d={`M${x + w * sx - 4} ${y + h * sy} h8 M${x + w * sx} ${y + h * sy - 4} v8`} stroke={BOOK.moon} strokeWidth={1.2} opacity={0.45 + 0.4 * Math.sin(t * (1.3 + i * 0.4) + i)} />
				))}
				{clouds.map((c, i) => (
					<g key={i} opacity={0.75}>
						<path d={cloudPath(c.cx, c.cy, c.w)} fill="#7D8B8F" />
						<path d={cloudPath(c.cx, c.cy, c.w)} fill="url(#tb-light)" opacity={0.5} />
					</g>
				))}
			</g>
			<Ink d={roughRect(x, y, w, h, 32, 0.8)} w={5} color={frame} second={false} />
			<Ink d={roughRect(x, y, w, h, 33, 0.8)} w={1.8} />
			<Ink d={roughLine(x + w / 2, y, x + w / 2, y + h, 34, 0.6)} w={4} color={frame} second={false} />
			<Ink d={roughLine(x, y + h * 0.48, x + w, y + h * 0.48, 35, 0.6)} w={4} color={frame} second={false} />
			<Shape d={roughRect(x - 14, y + h, w + 28, 14, 36, 0.6)} color={'#A89D86'} w={1.8} />
		</g>
	);
};

const Curtain: React.FC<{x: number; top: number; bottom: number; w: number; side: 1 | -1; sway: number}> = ({x, top, bottom, w, side, sway}) => {
	const inner = x + side * w;
	const s = sway * 9 * side;
	const pts: Pt[] = [
		[x, top],
		[inner, top],
		[inner + s * 0.3, top + (bottom - top) * 0.35],
		[inner - side * 6 + s, top + (bottom - top) * 0.7],
		[inner + s * 1.3, bottom],
		[x + side * w * 0.5 + s * 0.7, bottom + 6],
		[x, bottom],
	];
	return (
		<g>
			<Shape d={smooth(pts, true)} color={'#8C5A45'} hatch="mid" hatchOpacity={0.5} />
			{[0.3, 0.6].map((k, i) => (
				<Ink key={i} d={smooth([[x + side * w * k, top + 4], [x + side * w * k + s * 0.4, (top + bottom) / 2], [x + side * w * k + s * 0.8, bottom - 4]])} w={1.2} opacity={0.6} second={false} />
			))}
		</g>
	);
};

const Lamp: React.FC<{x: number; y: number; on: number; s?: number}> = ({x, y, on, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		{on > 0 && <circle cx={0} cy={-52} r={150} fill="url(#tb-glow)" opacity={0.85 * on} />}
		<Shape d={roughEllipse(0, 0, 22, 6, 41, 0.5)} color={BOOK.woodDark} w={1.6} />
		<Ink d={roughLine(0, -2, 0, -40, 42, 0.4)} w={3} />
		<Shape d={roughPoly([[-30, -40], [30, -40], [19, -82], [-19, -82]], 43, 0.6)} color={on > 0.5 ? BOOK.glow : '#9C8457'} hatch={on > 0.5 ? undefined : 'light'} w={2} />
		<Ink d={roughLine(-28, -46, 28, -46, 44, 0.4)} w={1} opacity={0.6} second={false} />
		<rect x={16} y={-6} width={6} height={5} fill={BOOK.ink} />
	</g>
);

/** Bedside clock; the colon blinks every second. */
const Clock: React.FC<{x: number; y: number; time: string; f: number; fps: number; s?: number}> = ({x, y, time, f, fps, s = 1}) => {
	const [h, m] = time.split(':');
	const colon = Math.floor(f / (fps / 2)) % 2 === 0 ? 1 : 0.2;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<Shape d={roughRect(-24, -17, 48, 30, 51, 0.5)} color={BOOK.black} w={1.6} wear={false} />
			<circle cx={0} cy={-2} r={34} fill="url(#tb-glow)" opacity={0.25} />
			<text x={-5} y={5} fontFamily={FELL} fontSize={19} fill={BOOK.glow} textAnchor="end">
				{h}
			</text>
			<text x={0} y={4} fontFamily={FELL} fontSize={19} fill={BOOK.glow} textAnchor="middle" opacity={colon}>
				:
			</text>
			<text x={5} y={5} fontFamily={FELL} fontSize={19} fill={BOOK.glow} textAnchor="start">
				{m}
			</text>
		</g>
	);
};

/** A small notebook with a pencil on it (held in the hand or lying on the nightstand). */
const SmallNotebook: React.FC<{rot?: number}> = ({rot = 0}) => (
	<g transform={`rotate(${rot})`}>
		<Shape d={roughPoly([[-26, -6], [22, -10], [26, -4], [-22, 2]], 84, 0.4)} color={BOOK.parchment} w={1.2} />
		<Ink d={roughLine(-20, -10, 20, -16, 85, 0.3)} w={2.4} color={BOOK.ochre} />
	</g>
);

/**
 * fig. 1: the bedroom at night.
 * Hook events: sigh (eyes droop, a long breath), wake (eyes snap open), meeting (small loop above the head).
 * Ending events: asleep (later: 1:16, lamp on, notebook in hand), place (puts the notebook down),
 * lampoff (reaches over, light off), sleep (eyes close, a small smile, z's).
 */
export const Bedroom: React.FC<{time?: string; later?: string}> = ({time = '1:07', later = '1:16'}) => {
	const a = useArt();
	const t = a.f / a.fps;
	const sway = Math.sin(t * 0.85) * 0.8 + Math.sin(t * 2.1) * 0.2;
	const breath = wave(a, 4.2);
	const head: Pt = [535, 340];
	const ending = since(a, 'asleep') >= 0;
	const loopP = prog(a, 'meeting', 30) * (1 - prog(a, 'asleep', 20));
	const loopC: Pt = [head[0] + 40, head[1] - 150];
	const loopPhase = t / 2.6;
	const writhe = writheAt(a.f, a.fps);
	const spark = loopPt(loopPhase, loopC[0], loopC[1], 72, 44, writhe);

	// ---- the face and body, as a sequence of beats ----
	let look: Pt;
	let lid: number;
	let tilt: number;
	let worry: number;
	let raise = 0;
	let heave = 0;
	let mouth: 'flat' | 'soft' = 'flat';
	let arm: {hand: Pt; out: number; holding?: React.ReactNode} | undefined;
	let lampOn = 0;
	let notebookDown = false;
	if (!ending) {
		const [lx, ly, l, tl, wo] = stages(a, [-1, 0.15, 0.1, -6, 0.6], [
			{at: 'sigh', v: [0, 0.35, 0.62, 0, 0.3], dur: 18},
			{at: 'wake', v: [0.15, -1, 0, 3, 1], dur: 5},
		]);
		look = [lx, ly];
		const follow = prog(a, 'meeting', 12, 8);
		if (follow > 0) {
			const sl = lookAt([head[0], head[1]], spark, 120);
			look = [look[0] + (sl[0] - look[0]) * follow, look[1] + (sl[1] - look[1]) * follow];
		}
		lid = l;
		tilt = tl + Math.sin(t * 0.8) * 1.5 + look[0] * 3;
		worry = wo;
		raise = track(since(a, 'wake'), [[0, 0], [5, 1], [34, 0.35]]);
		heave = track(since(a, 'sigh'), [[0, 0], [16, 1], [46, 0]]);
	} else {
		const sp = since(a, 'place');
		const so = since(a, 'lampoff');
		const ss = since(a, 'sleep');
		lampOn = 1 - prog(a, 'lampoff', 6);
		const rest: Pt = [502, 376];
		if (so >= -28) {
			// reach over and switch the lamp off
			const hx = track(so, [[-28, rest[0]], [-6, 372], [6, 372], [26, rest[0]]]);
			const hy = track(so, [[-28, rest[1]], [-6, 350], [6, 350], [26, rest[1]]]);
			arm = {hand: [hx, hy], out: track(so, [[-28, 0.2], [-14, 1], [10, 1], [30, 0]])};
			notebookDown = true;
		} else {
			const hx = track(sp, [[0, rest[0]], [20, 410], [36, 410], [56, rest[0]]]);
			const hy = track(sp, [[0, rest[1]], [20, 330], [30, 350], [36, 350], [56, rest[1]]]);
			const out = track(sp, [[-40, 1], [0, 1], [44, 1], [62, 0]]);
			notebookDown = sp >= 32;
			arm = {hand: [hx, hy], out, holding: notebookDown ? undefined : <SmallNotebook rot={-8} />};
		}
		const [lx, ly, l, tl] = stages(a, [-1, 0.35, 0.3, -5], [
			{at: 'lampoff', v: [0, -0.5, 0.45, 0], dur: 16, delay: 8},
			{at: 'sleep', v: [0, 0.2, 1, 5], dur: 36},
		]);
		look = [lx, ly];
		lid = l;
		tilt = tl + Math.sin(t * 0.6) * 1;
		worry = 0;
		mouth = ss > 20 ? 'soft' : 'flat';
	}
	const blink = !ending && since(a, 'sigh') < 0 ? blinking(a, 3.6) : !ending && since(a, 'wake') > 8 ? blinking(a, 3.2, 1.3) : false;
	const zP = prog(a, 'sleep', 40, 26);
	return (
		<Reveal p={shown(a)}>
			{/* far layer: wall, window, picture */}
			<g transform={parallax(a, -0.05)}>
				<rect x={-60} y={-60} width={a.w + 120} height={530} fill={BOOK.night} />
				<rect x={-60} y={-60} width={a.w + 120} height={530} fill="url(#tb-light)" opacity={0.45} />
				{Array.from({length: 32}, (_, i) => (
					<line key={i} x1={-40 + i * 36} y1={-40} x2={-40 + i * 36} y2={470} stroke={BOOK.ink} strokeWidth={1} opacity={0.08} />
				))}
				<polygon points={`120,345 318,345 ${640 + sway * 8},620 ${300 + sway * 8},620`} fill={BOOK.moon} opacity={0.08 + 0.025 * (sway + 1) * (1 - lampOn)} />
				<Window x={110} y={70} w={210} h={262} moonX={252 + a.f * 0.03} t={t} />
				<Ink d={roughLine(48, 56, 384, 56, 37, 0.5)} w={4} color={BOOK.woodDark} />
				<circle cx={46} cy={56} r={6} fill={BOOK.woodDark} />
				<circle cx={386} cy={56} r={6} fill={BOOK.woodDark} />
				<Curtain x={62} top={58} bottom={410} w={62} side={1} sway={sway} />
				<Curtain x={370} top={58} bottom={410} w={62} side={-1} sway={-sway * 0.8} />
				{/* small framed picture over the bed */}
				<Shape d={roughRect(720, 100, 130, 96, 61, 0.6)} color={BOOK.woodDark} w={2} />
				<Shape d={roughRect(732, 112, 106, 72, 62, 0.6)} color={'#B8AD95'} w={1.4} />
				<Ink d={smooth([[736, 172], [762, 140], [784, 160], [806, 128], [834, 170]])} w={1.4} />
				<circle cx={812} cy={128} r={6} fill={BOOK.moon} opacity={0.7} />
			</g>
			{/* floor */}
			<g transform={parallax(a, -0.01)}>
				<rect x={-60} y={466} width={a.w + 120} height={200} fill={BOOK.nightFloor} />
				<rect x={-60} y={466} width={a.w + 120} height={200} fill="url(#tb-mid)" opacity={0.4} />
				{[500, 540, 584].map((y, i) => (
					<Ink key={i} d={roughLine(-20, y, a.w + 20, y + 2, 70 + i, 0.8)} w={1.2} opacity={0.5} second={false} />
				))}
				<Ink d={roughLine(-20, 466, a.w + 20, 466, 74, 0.6)} w={2.4} />
				<rect x={-60} y={452} width={a.w + 120} height={14} fill={'#5A4A3D'} />
				<Ink d={roughLine(-20, 452, a.w + 20, 452, 75, 0.6)} w={1.6} />
			</g>
			{/* warm lamp light over the room (the ending, before the light goes off) */}
			{lampOn > 0 && (
				<g opacity={lampOn}>
					<circle cx={350} cy={300} r={430} fill="url(#tb-glow)" opacity={0.55} />
					<rect x={-60} y={-60} width={a.w + 120} height={a.h + 120} fill={BOOK.ochre} opacity={0.08} />
				</g>
			)}
			{/* middle layer: nightstand, bed, sleeper */}
			<g transform={parallax(a, 0)}>
				<Shape d={roughRect(318, 372, 118, 96, 81, 0.7)} color={BOOK.wood} hatch="light" />
				<Shape d={roughRect(310, 362, 134, 14, 82, 0.6)} color={BOOK.woodDark} />
				<Ink d={roughLine(326, 410, 428, 410, 83, 0.5)} w={1.4} />
				<circle cx={377} cy={392} r={3.5} fill={BOOK.ink} />
				<Lamp x={350} y={360} on={lampOn} />
				<Clock x={404} y={346} time={ending ? later : time} f={a.f} fps={a.fps} />
				{notebookDown && (
					<g transform="translate(410 360)">
						<SmallNotebook rot={-4} />
					</g>
				)}
				{/* bed */}
				<Shape d={smooth([[446, 470], [446, 268], [462, 248], [480, 268], [480, 470]], true)} color={BOOK.wood} hatch="light" />
				<Shape d={roughRect(470, 404, 492, 46, 91, 0.7)} color={BOOK.parchment} hatch="light" hatchOpacity={0.4} />
				<Shape d={roughRect(462, 446, 512, 18, 92, 0.6)} color={BOOK.woodDark} />
				<Shape d={roughRect(470, 462, 16, 12, 93, 0.4)} color={BOOK.woodDark} />
				<Shape d={roughRect(946, 462, 16, 12, 94, 0.4)} color={BOOK.woodDark} />
				<Shape d={smooth([[948, 470], [948, 342], [962, 330], [978, 342], [978, 470]], true)} color={BOOK.wood} hatch="light" />
				<Sleeper x={head[0]} y={head[1]} r={38} len={395} drop={92} breath={breath} heave={heave} look={look} lid={lid} blink={blink} tilt={tilt} worry={worry} raise={raise} mouth={mouth} arm={arm} />
				{/* the first, small thought loop */}
				{loopP > 0 && (
					<g>
						<Ink d={smooth([[head[0] + 8, head[1] - 52], [head[0] + 22, head[1] - 72], [head[0] + 14, head[1] - 92]])} w={1.4} dash="3 6" p={loopP} second={false} />
						<ThoughtLoop cx={loopC[0]} cy={loopC[1]} sx={72} sy={44} p={loopP} phase={loopPhase} color={BOOK.parchment} width={2.4} spark={4} writhe={writhe} />
					</g>
				)}
				{zP > 0 &&
					[0, 1, 2].map((i) => {
						const k = (t * 0.35 + i / 3) % 1;
						return (
							<text key={i} x={head[0] + 46 + k * 40 + Math.sin(k * 9) * 5} y={head[1] - 40 - k * 90} fontFamily={FELL} fontStyle="italic" fontSize={22 + k * 14} fill={BOOK.parchment} opacity={zP * Math.sin(k * Math.PI) * 0.8}>
								z
							</text>
						);
					})}
			</g>
			{/* foreground: rug and slippers */}
			<g transform={parallax(a, 0.06)}>
				<Shape d={roughEllipse(660, 560, 230, 34, 101, 1)} color={'#8C5A45'} hatch="light" />
				<Ink d={roughEllipse(660, 560, 205, 24, 102, 1)} w={1.4} color={BOOK.ochre} opacity={0.8} second={false} />
				<Shape d={roughEllipse(396, 548, 26, 10, 103, 0.6)} color={BOOK.olive} />
				<Shape d={roughEllipse(436, 556, 26, 10, 104, 0.6)} color={BOOK.olive} />
			</g>
		</Reveal>
	);
};

/**
 * fig. 2: close-up of the thought loop. Events: loop (draw), email / y2014 / tomorrow (tags), again (ring),
 * thread (the loop stops writhing so its end can run off into the next panel).
 * The sleeper's eyes follow the impulse round the loop; on "again" the blanket goes up over the mouth.
 */
export const LoopCloseup: React.FC<{labels?: string[]}> = ({labels = ['that email', '2014', 'tomorrow']}) => {
	const a = useArt();
	const breath = wave(a, 4.2);
	const loopP = prog(a, 'loop', 54);
	const cx = 250;
	const cy = 160;
	const sx = 190;
	const sy = 115;
	const writhe = writheAt(a.f, a.fps) * (1 - prog(a, 'thread', 22, -24));
	const spots = [0.875, 0.5, 0.05];
	const tagPos: Pt[] = [
		[328, 52],
		[58, 110],
		[372, 272],
	];
	const tagEvents = ['email', 'y2014', 'tomorrow'];
	const phase = phaseAt(a.f, a.fps, a.ev('again'), spots[0], 2.8);
	const ring = prog(a, 'again', 18, 4);
	const spark = loopPt(phase, cx, cy, sx, sy, writhe);
	const head: Pt = [130, 340];
	const watching = loopP > 0.6 ? 1 : 0.4;
	const sl = lookAt([head[0], head[1] - 10], spark, 170);
	const look: Pt = [sl[0] * watching, Math.min(0.2, sl[1]) * watching - (1 - watching) * 0.6];
	const sa = since(a, 'again');
	const cover = track(sa, [[0, 0], [10, 0.8], [70, 0.8], [96, 0.45]]);
	const squeeze = track(sa, [[0, 0], [5, 1], [26, 1], [32, 0]]);
	return (
		<Reveal p={shown(a)}>
			<rect x={0} y={0} width={a.w} height={a.h} fill="url(#tb-stipple)" opacity={0.25} />
			<g transform={parallax(a, 0.03)}>
				<Sleeper
					x={head[0]}
					y={head[1]}
					r={62}
					len={340}
					breath={breath}
					look={look}
					lid={squeeze}
					blink={squeeze < 0.1 && blinking(a, 3.1, 0.7)}
					worry={1}
					tilt={look[0] * 7 + Math.sin(a.f / 22) * 1.2}
					cover={cover}
				/>
				<Ink d={smooth([[150, 268], [162, 254], [168, 242]])} w={1.6} dash="3 7" p={loopP} second={false} />
			</g>
			<ThoughtLoop cx={cx} cy={cy} sx={sx} sy={sy} p={loopP} phase={phase} width={2.8} spark={7} writhe={writhe} />
			{labels.map((text, i) => {
				const p = prog(a, tagEvents[i], 14);
				return <Tag key={i} x={tagPos[i][0]} y={tagPos[i][1] + Math.sin(a.f / 20 + i * 2) * 2} at={loopPt(spots[i], cx, cy, sx, sy, writhe)} text={text} p={p} ring={i === 0 ? ring : 0} swing={settle(since(a, tagEvents[i]), 9)} />;
			})}
		</Reveal>
	);
};

/** fig. 4a: daytime, attention pulled in many directions. Events: day (phone), world (someone talks), busy (clock). */
export const DayDesk: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const steam = t % 2;
	const sd = since(a, 'day');
	const buzz = sd > 0 && sd < 50 ? Math.sin(a.f * 2.2) * 2.4 : sd >= 50 ? Math.sin(a.f * 2.2) * (Math.floor(t * 1.5) % 3 === 0 ? 1.6 : 0) : 0;
	const [lx, ly, tl, rai, wor] = stages(a, [0.4, 0.8, 4, 0, 0], [
		{at: 'day', v: [1, 0.7, 8, 0.6, 0.2], dur: 8},
		{at: 'world', v: [0.7, -0.6, -5, 1, 0.3], dur: 8},
		{at: 'busy', v: [0.7, -1, -9, 0.5, 0.8], dur: 8},
	]);
	const bubble = track(since(a, 'world'), [[0, 0], [8, 1.12], [14, 1]]);
	const talk = (t * 2.2) % 1;
	const writing = sd < 0 ? 1 : 0;
	const hand: Pt = [136 + Math.sin(a.f * 0.9) * 3 * writing, 222 + Math.cos(a.f * 1.3) * 1.5 * writing];
	const spin = since(a, 'busy') > 0 ? since(a, 'busy') * 9 : a.f * 0.6;
	const drowned = prog(a, 'day', 16);
	return (
		<Reveal p={shown(a)}>
			<T x={14} y={30} size={20} font={FELL_SC} spacing={3} color={BOOK.brown}>
				Day
			</T>
			<circle cx={190} cy={40} r={90} fill="url(#tb-glow)" opacity={0.5} />
			{/* wall clock, hands racing once the day gets busy */}
			<Shape d={roughEllipse(170, 70, 18, 18, 201, 0.4)} color={BOOK.parchment} w={1.6} />
			<g transform={`rotate(${spin / 12} 170 70)`}>
				<Ink d="M170 70 L170 60" w={1.8} second={false} />
			</g>
			<g transform={`rotate(${spin} 170 70)`}>
				<Ink d="M170 70 L170 56" w={1.2} second={false} />
			</g>
			{/* someone talking from off-panel */}
			{bubble > 0 && (
				<g transform={`translate(160 124) scale(${bubble}) translate(-160 -124)`}>
					<Shape d={smooth([[118, 104], [196, 100], [206, 126], [150, 134], [136, 146], [134, 132], [114, 126]], true)} color={BOOK.parchment} w={1.4} />
					<Ink d={`M128 116 h${18 + 38 * talk}`} w={1.2} opacity={0.6} second={false} />
					<Ink d={`M128 124 h${10 + 28 * ((talk + 0.4) % 1)}`} w={1.2} opacity={0.6} second={false} />
				</g>
			)}
			{/* person at the desk */}
			<Sleeve pts={[[64, 196], [92, 222], hand]} width={13} />
			<Torso x={58} y={170} s={0.42} lean={tl * 0.3} />
			<Head x={62} y={136} r={25} look={[lx, ly]} tilt={tl} raise={rai} worry={wor} blink={blinking(a, 2.6, 0.3)} seed={5} />
			<Hand x={hand[0]} y={hand[1]} s={0.7} />
			{/* desk */}
			<Shape d={roughRect(-10, 232, 236, 16, 211, 0.5)} color={BOOK.wood} hatch="light" />
			<Shape d={roughRect(20, 246, 12, 42, 212, 0.4)} color={BOOK.woodDark} />
			<Shape d={roughRect(186, 246, 12, 42, 213, 0.4)} color={BOOK.woodDark} />
			{/* phone buzzing, cup steaming, papers */}
			<g transform={`translate(${buzz} 0)`}>
				<Shape d={roughRect(150, 220, 26, 12, 214, 0.3)} color={BOOK.ink} w={1.2} wear={false} />
				<rect x={153} y={222} width={20} height={6} fill={BOOK.glow} opacity={sd > 0 ? 0.7 : 0} />
			</g>
			{sd > 0 && (
				<g opacity={Math.abs(buzz) > 0.5 ? 1 : 0.3}>
					<Ink d="M146 214 q-4 -6 0 -12 M182 214 q4 -6 0 -12" w={1.2} color={BOOK.terracotta} second={false} />
					<text x={163} y={206 - track(sd, [[0, 0], [8, 6]])} fontFamily={FELL} fontSize={16} fill={BOOK.terracotta} textAnchor="middle">
						!
					</text>
				</g>
			)}
			<Shape d={roughRect(186, 206, 20, 26, 215, 0.4)} color={BOOK.terracotta} w={1.4} />
			{[0, 1].map((i) => {
				const k = (steam + i) % 2;
				return <Ink key={i} d={smooth([[192 + i * 7, 202 - k * 10], [188 + i * 7 + Math.sin(k * 4) * 3, 192 - k * 14], [194 + i * 7, 182 - k * 18]])} w={1.1} opacity={Math.sin((k / 2) * Math.PI) * 0.7} second={false} />;
			})}
			<Shape d={roughPoly([[96, 226], [134, 222], [136, 232], [98, 234]], 216, 0.3)} color={BOOK.parchment} w={1.1} />
			{/* tiny thought, drowned out as soon as the phone buzzes */}
			<g transform={`translate(36 86) scale(${1 - 0.45 * drowned}) translate(-36 -86)`}>
				<ThoughtLoop cx={36} cy={86} sx={22} sy={14} p={1} phase={t / 2.8} width={1.3} spark={2} opacity={0.6 - 0.4 * drowned} writhe={writheAt(a.f, a.fps)} />
			</g>
		</Reveal>
	);
};

/** fig. 4b: the same person at night; nothing else competes, so the loop grows. Event: dark. */
export const NightBed: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const grow = 0.5 + 0.5 * prog(a, 'dark', 40);
	const writhe = writheAt(a.f, a.fps, 1.3);
	const phase = t / 2.2;
	const spark = loopPt(phase, 112, 150, 92 * grow, 60 * grow, writhe);
	const follow = prog(a, 'dark', 14);
	const sl = lookAt([58, 216], spark, 90);
	const look: Pt = [0.8 * (1 - follow) + sl[0] * follow, 0.2 * (1 - follow) + sl[1] * follow];
	// tossing: every few seconds the blanket heaves and the head rolls
	const toss = Math.pow(Math.max(0, Math.sin(t * 1.9)), 10) * follow;
	return (
		<Reveal p={shown(a)}>
			<T x={14} y={30} size={20} font={FELL_SC} spacing={3} color={BOOK.parchment}>
				Night
			</T>
			<Shape d={roughRect(140, 40, 56, 70, 221, 0.5)} color={BOOK.nightDeep} w={1.8} />
			<circle cx={162 + t * 1.2} cy={66 - t * 0.5} r={10} fill={BOOK.moon} />
			<rect x={-10} y={258} width={240} height={80} fill={BOOK.nightFloor} />
			<Shape d={roughRect(20, 250, 200, 18, 222, 0.5)} color={BOOK.woodDark} />
			<Sleeper x={58} y={226} r={22} len={170} drop={36} breath={wave(a, 4.2)} heave={toss} look={look} worry={1} tilt={look[0] * 8 + toss * 10} blink={blinking(a, 3.3, 1.1)} />
			<ThoughtLoop cx={112} cy={150} sx={92 * grow} sy={60 * grow} p={1} phase={phase} color={BOOK.parchment} width={2.2} spark={4.5} writhe={writhe} />
		</Reveal>
	);
};

const Pencil: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		<path d="M0 0 L10 -5 L10 5 Z" fill={BOOK.skin} stroke={BOOK.ink} strokeWidth={1} />
		<path d="M0 0 L3.6 -1.8 L3.6 1.8 Z" fill={BOOK.ink} />
		<Shape d="M10 -5 L92 -5 L92 5 L10 5 Z" color={BOOK.ochre} w={1.4} wear={false} />
		<Ink d="M12 0 L90 0" w={0.8} opacity={0.5} second={false} />
		<Shape d="M92 -5 L104 -5 L104 5 L92 5 Z" color={BOOK.terracotta} w={1.4} wear={false} />
	</g>
);

/** A hand gripping a pencil (pencil tip at 0,0), with the forearm running off to the lower right. */
const WritingHand: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => {
	const r = (rot * Math.PI) / 180;
	const ax: Pt = [Math.cos(r), Math.sin(r)];
	const grip: Pt = [x + ax[0] * 36, y + ax[1] * 36];
	return (
		<g>
			<Sleeve pts={[[grip[0] + 18, grip[1] + 12], [grip[0] + 90, grip[1] + 80], [grip[0] + 190, grip[1] + 150]]} width={26} color={BOOK.ochre} />
			<Pencil x={x} y={y} rot={rot} />
			<g transform={`translate(${grip[0]} ${grip[1]}) rotate(${rot + 58})`}>
				<Shape d={smooth([[-14, -4], [-4, -14], [12, -12], [20, 2], [12, 14], [-4, 14], [-14, 6]], true)} color={BOOK.skin} w={2} wear={false} />
				<Ink d="M-10 -2 Q-2 -8 6 -6" w={1.6} second={false} />
				<Ink d="M-6 8 Q2 4 10 8" w={1.3} opacity={0.7} second={false} />
			</g>
		</g>
	);
};

/**
 * fig. 7: the to-do list. Events: lamp (a hand switches the light on), write (the loop unravels into the
 * ruled lines and a hand writes the list on them), nine (result note).
 */
export const Notebook: React.FC<{items?: string[]; title?: string}> = ({items = ['reply to Sam’s email', 'call the dentist', 'buy coffee filters'], title = 'Tomorrow:'}) => {
	const a = useArt();
	const on = prog(a, 'lamp', 10);
	const unravel = prog(a, 'write', 36);
	const lines: string[] = [title, ...items];
	const total = lines.reduce((s, l) => s + l.length, 0);
	// the loop straightens into the ruled lines first, then the list is written on them
	const writeP = Math.max(0, Math.min(1, since(a, 'write', 38) / (total * 2.1)));
	let used = 0;
	const lineP = lines.map((l) => {
		const start = used / total;
		used += l.length;
		const end = used / total;
		return Math.max(0, Math.min(1, (writeP - start) / (end - start)));
	});
	const baseX = 160;
	const rows = [126, 160, 192, 224];
	const cur = lineP.findIndex((p) => p < 1);
	const li = cur < 0 ? lines.length - 1 : cur;
	const writing = writeP > 0 && writeP < 1;
	// the pencil follows the line being written, with the small up-and-down of handwriting
	const tipX = (li === 0 ? baseX : baseX + 26) + lines[li].length * 8.6 * (cur < 0 ? 1 : lineP[li]) + (writing ? Math.sin(a.f * 1.7) * 1.6 : 0);
	const tipY = rows[li] - 4 + (writing ? Math.sin(a.f * 2.9) * 2.4 : 0);
	const away = track(since(a, 'write', 38 + total * 2.1), [[0, 0], [24, 1]]);
	const approach = track(since(a, 'write', 18), [[0, 1], [20, 0]]);
	const handShift = Math.max(away, approach);
	const nine = prog(a, 'nine', 22);
	const writhe = writheAt(a.f, a.fps) * (1 - unravel);
	const strands: Pt[][] = [0, 1, 2].map((row) =>
		Array.from({length: 31}, (_, i) => {
			const u = i / 30;
			const [lx, ly] = loopPt((row + u) / 3, 268, 64, 110, 38, writhe);
			const tx = baseX + 26 + u * 170;
			const ty = rows[row + 1] + 6;
			return [lx + (tx - lx) * unravel, ly + (ty - ly) * unravel] as Pt;
		}),
	);
	// a hand comes in from the left and clicks the lamp on
	const sl = since(a, 'lamp');
	const lampHand: Pt = [track(sl, [[-18, -60], [-3, 84], [6, 84], [26, -60]]), track(sl, [[-18, 300], [-3, 196], [6, 196], [26, 300]])];
	return (
		<Reveal p={shown(a)}>
			<rect x={0} y={0} width={a.w} height={a.h} fill={BOOK.nightDeep} opacity={0.55 * (1 - on) + 0.08} />
			<g transform={parallax(a, -0.03)}>
				<Lamp x={62} y={190} on={on} s={1.15} />
			</g>
			<Shape d={roughRect(-10, 196, a.w + 20, 120, 301, 0.6)} color={BOOK.wood} hatch="light" />
			{sl > -18 && sl < 26 && (
				<g>
					<Sleeve pts={[[-80, 330], [lampHand[0] - 50, lampHand[1] + 50], [lampHand[0] - 8, lampHand[1] + 6]]} width={24} color={BOOK.ochre} />
					<Hand x={lampHand[0]} y={lampHand[1]} s={1.1} rot={-40} />
				</g>
			)}
			<g transform="rotate(-3 260 180)">
				<Shape d={roughRect(140, 92, 236, 172, 302, 0.6)} color={BOOK.parchment} hatch="light" hatchOpacity={0.15} />
				{rows.map((y, i) => (
					<line key={i} x1={146} x2={370} y1={y + 6} y2={y + 6} stroke={BOOK.blue} strokeWidth={1} opacity={0.6} />
				))}
				{Array.from({length: 11}, (_, i) => (
					<circle key={i} cx={156 + i * 21} cy={92} r={4} fill="none" stroke={BOOK.ink} strokeWidth={1.4} />
				))}
				{lines.map((l, i) =>
					i === 0 ? (
						<Write key={i} text={l} p={lineP[i]} x={baseX} y={rows[i]} size={21} font={HAND} weight={700} />
					) : (
						<g key={i}>
							{lineP[i] > 0 && <path d={roughRect(baseX, rows[i] - 13, 13, 13, 310 + i, 0.6)} fill="none" stroke={BOOK.ink} strokeWidth={1.4} />}
							<Write text={l} p={lineP[i]} x={baseX + 22} y={rows[i]} size={18} font={HAND} />
						</g>
					),
				)}
				{writeP < 1 && strands.map((pts, i) => <Ink key={i} d={smooth(pts)} w={2.2} color={BOOK.terracotta} opacity={1 - lineP[i + 1]} p={1} />)}
				{since(a, 'write', 18) > 0 && away < 1 && (
					<g transform={`translate(${handShift * 140} ${handShift * 120})`}>
						<WritingHand x={tipX} y={tipY} rot={-58} />
					</g>
				)}
			</g>
			{nine > 0 && (
				<g opacity={nine}>
					<Write text="≈ 9 minutes faster to fall asleep" p={nine} x={a.w - 12} y={66} size={21} italic color={BOOK.terracotta} anchor="end" />
					<Ink d={roughLine(150, 76, a.w - 14, 76, 330, 0.6)} w={2} color={BOOK.terracotta} p={nine} />
				</g>
			)}
			<g opacity={prog(a, 'nine', 20, 16)}>
				<rect x={0} y={258} width={a.w} height={42} fill={BOOK.parchment} opacity={0.85} />
				<text x={a.w / 2} y={275} fontFamily={FELL} fontStyle="italic" fontSize={13.5} fill={BOOK.ink} textAnchor="middle">
					vs. writing about completed tasks · 57 healthy adults, 18–30
				</text>
				<text x={a.w / 2} y={293} fontFamily={FELL} fontStyle="italic" fontSize={13.5} fill={BOOK.ink} textAnchor="middle">
					one small sleep-lab study · Scullin et al., 2018
				</text>
			</g>
		</Reveal>
	);
};
