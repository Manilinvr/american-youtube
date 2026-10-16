import React from 'react';
import {FELL, FELL_SC, HAND} from '../../fonts';
import {blinking, parallax, prog, shown, since, useArt, wave} from '../context';
import {Hand, Head, Sleeper, Sleeve, Torso} from '../figures';
import {Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Pt, roughEllipse, roughLine, roughPoly, roughRect, smooth} from '../rough';
import {loopPt, Tag, ThoughtLoop} from './motifs';

/** Loop phase so that the impulse sits at `t0` exactly when event `name` fires (laps every `lap` seconds). */
const phaseAt = (f: number, fps: number, evAt: number, t0: number, lap: number) => {
	const ref = Number.isFinite(evAt) ? evAt : 0;
	return t0 + (f - ref) / (lap * fps);
};

const Window: React.FC<{x: number; y: number; w: number; h: number; moonX: number; sway: number}> = ({x, y, w, h, moonX, sway}) => {
	const frame = '#B9AE96';
	return (
		<g>
			<Shape d={roughRect(x, y, w, h, 31, 0.8)} color={BOOK.nightDeep} hatch="light" hatchOpacity={0.5} />
			{/* moon and a few stars */}
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
				<path key={i} d={`M${x + w * sx - 4} ${y + h * sy} h8 M${x + w * sx} ${y + h * sy - 4} v8`} stroke={BOOK.moon} strokeWidth={1.2} opacity={0.5 + 0.3 * Math.sin(sway * 6 + i)} />
			))}
			{/* frame and glazing bars */}
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
	const s = sway * 6 * side;
	const pts: Pt[] = [
		[x, top],
		[inner, top],
		[inner + s * 0.3, top + (bottom - top) * 0.35],
		[inner - side * 6 + s, top + (bottom - top) * 0.7],
		[inner + s * 1.2, bottom],
		[x + side * w * 0.5 + s * 0.6, bottom + 6],
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
	</g>
);

const Clock: React.FC<{x: number; y: number; time: string; s?: number}> = ({x, y, time, s = 1}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<Shape d={roughRect(-24, -17, 48, 30, 51, 0.5)} color={BOOK.black} w={1.6} wear={false} />
		<circle cx={0} cy={-2} r={34} fill="url(#tb-glow)" opacity={0.25} />
		<text x={0} y={5} fontFamily={FELL} fontSize={19} fill={BOOK.glow} textAnchor="middle" letterSpacing={1}>
			{time}
		</text>
	</g>
);

/** fig. 1: the bedroom at night. Events: meeting (small loop above the head), asleep (eyes closed, 1:16). */
export const Bedroom: React.FC<{time?: string; later?: string}> = ({time = '1:07', later = '1:16'}) => {
	const a = useArt();
	const sway = wave(a, 7.5);
	const breath = wave(a, 4.2);
	const asleep = since(a, 'asleep') >= 0;
	const loopP = prog(a, 'meeting', 30) * (1 - prog(a, 'asleep', 20));
	const head: Pt = [535, 340];
	const zP = prog(a, 'asleep', 40, 20);
	return (
		<Reveal p={shown(a)}>
			{/* far layer: wall, window, picture */}
			<g transform={parallax(a, -0.05)}>
				<rect x={-60} y={-60} width={a.w + 120} height={530} fill={BOOK.night} />
				<rect x={-60} y={-60} width={a.w + 120} height={530} fill="url(#tb-light)" opacity={0.45} />
				{Array.from({length: 32}, (_, i) => (
					<line key={i} x1={-40 + i * 36} y1={-40} x2={-40 + i * 36} y2={470} stroke={BOOK.ink} strokeWidth={1} opacity={0.08} />
				))}
				<polygon points="120,345 318,345 640,620 300,620" fill={BOOK.moon} opacity={0.08 + 0.02 * sway} />
				<Window x={110} y={70} w={210} h={262} moonX={252 + a.f * 0.02} sway={sway} />
				<Ink d={roughLine(48, 56, 384, 56, 37, 0.5)} w={4} color={BOOK.woodDark} />
				<circle cx={46} cy={56} r={6} fill={BOOK.woodDark} />
				<circle cx={386} cy={56} r={6} fill={BOOK.woodDark} />
				<Curtain x={62} top={58} bottom={410} w={62} side={1} sway={sway} />
				<Curtain x={370} top={58} bottom={410} w={62} side={-1} sway={-sway} />
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
			{/* middle layer: nightstand, bed, sleeper */}
			<g transform={parallax(a, 0)}>
				{/* nightstand */}
				<Shape d={roughRect(318, 372, 118, 96, 81, 0.7)} color={BOOK.wood} hatch="light" />
				<Shape d={roughRect(310, 362, 134, 14, 82, 0.6)} color={BOOK.woodDark} />
				<Ink d={roughLine(326, 410, 428, 410, 83, 0.5)} w={1.4} />
				<circle cx={377} cy={392} r={3.5} fill={BOOK.ink} />
				<Lamp x={350} y={360} on={0} />
				<Clock x={404} y={346} time={asleep ? later : time} />
				{asleep && (
					<g opacity={prog(a, 'asleep', 20)}>
						<Shape d={roughPoly([[384, 362], [432, 358], [436, 364], [386, 368]], 84, 0.4)} color={BOOK.parchment} w={1.2} />
						<Ink d={roughLine(388, 356, 428, 350, 85, 0.3)} w={2.4} color={BOOK.ochre} />
					</g>
				)}
				{/* bed */}
				<Shape d={smooth([[446, 470], [446, 268], [462, 248], [480, 268], [480, 470]], true)} color={BOOK.wood} hatch="light" />
				<Shape d={roughRect(470, 404, 492, 46, 91, 0.7)} color={BOOK.parchment} hatch="light" hatchOpacity={0.4} />
				<Shape d={roughRect(462, 446, 512, 18, 92, 0.6)} color={BOOK.woodDark} />
				<Shape d={roughRect(470, 462, 16, 12, 93, 0.4)} color={BOOK.woodDark} />
				<Shape d={roughRect(946, 462, 16, 12, 94, 0.4)} color={BOOK.woodDark} />
				<Shape d={smooth([[948, 470], [948, 342], [962, 330], [978, 342], [978, 470]], true)} color={BOOK.wood} hatch="light" />
				<Sleeper
					x={head[0]}
					y={head[1]}
					r={38}
					len={395}
					drop={92}
					breath={breath}
					eyes={asleep ? 'closed' : 'up'}
					blink={!asleep && blinking(a, 3.6)}
					brows={asleep ? 'calm' : 'worried'}
					mouth={asleep ? 'soft' : 'flat'}
				/>
				{/* the first, small thought loop */}
				{loopP > 0 && (
					<g>
						<Ink d={smooth([[head[0] + 8, head[1] - 52], [head[0] + 22, head[1] - 72], [head[0] + 14, head[1] - 92]])} w={1.4} dash="3 6" p={loopP} second={false} />
						<ThoughtLoop cx={head[0] + 40} cy={head[1] - 150} sx={72} sy={44} p={loopP} phase={(a.f / a.fps) / 2.6} color={BOOK.parchment} width={2.4} spark={4} />
					</g>
				)}
				{zP > 0 &&
					[0, 1, 2].map((i) => {
						const t = ((a.f / a.fps) * 0.35 + i / 3) % 1;
						return (
							<text key={i} x={head[0] + 46 + t * 40} y={head[1] - 40 - t * 90} fontFamily={FELL} fontStyle="italic" fontSize={22 + t * 14} fill={BOOK.parchment} opacity={zP * Math.sin(t * Math.PI) * 0.8}>
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

/** fig. 2: close-up of the thought loop. Events: loop (draw), email / y2014 / tomorrow (tags), again (ring). */
export const LoopCloseup: React.FC<{labels?: string[]}> = ({labels = ['that email', '2014', 'tomorrow']}) => {
	const a = useArt();
	const breath = wave(a, 4.2);
	const loopP = prog(a, 'loop', 54);
	const cx = 250;
	const cy = 160;
	const sx = 190;
	const sy = 115;
	const spots = [0.875, 0.5, 0.05];
	const tagPos: Pt[] = [
		[328, 52],
		[58, 110],
		[372, 272],
	];
	const tagEvents = ['email', 'y2014', 'tomorrow'];
	const phase = phaseAt(a.f, a.fps, a.ev('again'), spots[0], 2.8);
	const ring = prog(a, 'again', 18, 4);
	return (
		<Reveal p={shown(a)}>
			<rect x={0} y={0} width={a.w} height={a.h} fill="url(#tb-stipple)" opacity={0.25} />
			<g transform={parallax(a, 0.03)}>
				<Sleeper x={130} y={340} r={62} len={340} breath={breath} eyes="up" blink={blinking(a, 3.1, 0.7)} brows="worried" />
				<Ink d={smooth([[150, 268], [162, 254], [168, 242]])} w={1.6} dash="3 7" p={loopP} second={false} />
			</g>
			<ThoughtLoop cx={cx} cy={cy} sx={sx} sy={sy} p={loopP} phase={phase} width={2.8} spark={7} />
			{labels.map((text, i) => {
				const p = prog(a, tagEvents[i], 14);
				return <Tag key={i} x={tagPos[i][0]} y={tagPos[i][1]} at={loopPt(spots[i], cx, cy, sx, sy)} text={text} p={p} ring={i === 0 ? ring : 0} />;
			})}
		</Reveal>
	);
};

/** fig. 4a: daytime, attention pulled in many directions. */
export const DayDesk: React.FC = () => {
	const a = useArt();
	const steam = (a.f / a.fps) % 2;
	const buzz = Math.sin(a.f * 1.7) * (since(a, 'day') > 0 && since(a, 'day') < 60 ? 2 : 0.6);
	return (
		<Reveal p={shown(a)}>
			<T x={14} y={30} size={20} font={FELL_SC} spacing={3} color={BOOK.brown}>
				Day
			</T>
			{/* window light */}
			<circle cx={190} cy={40} r={90} fill="url(#tb-glow)" opacity={0.5} />
			{/* wall clock */}
			<Shape d={roughEllipse(170, 70, 18, 18, 201, 0.4)} color={BOOK.parchment} w={1.6} />
			<Ink d="M170 70 L170 58 M170 70 L179 74" w={1.4} second={false} />
			{/* speech from someone off-panel */}
			<Shape d={smooth([[118, 104], [196, 100], [206, 126], [150, 134], [136, 146], [134, 132], [114, 126]], true)} color={BOOK.parchment} w={1.4} />
			<Ink d="M128 116 h56 M128 124 h38" w={1.2} opacity={0.6} second={false} />
			{/* person at the desk */}
			<Sleeve pts={[[64, 196], [92, 222], [130, 224]]} width={13} />
			<Torso x={58} y={170} s={0.42} />
			<Head x={62} y={136} r={25} eyes="side" brows="raised" mouth="flat" blink={blinking(a, 2.6, 0.3)} seed={5} />
			<Hand x={136} y={222} s={0.7} />
			{/* desk */}
			<Shape d={roughRect(-10, 232, 236, 16, 211, 0.5)} color={BOOK.wood} hatch="light" />
			<Shape d={roughRect(20, 246, 12, 42, 212, 0.4)} color={BOOK.woodDark} />
			<Shape d={roughRect(186, 246, 12, 42, 213, 0.4)} color={BOOK.woodDark} />
			{/* phone buzzing, cup steaming, papers */}
			<g transform={`translate(${buzz} 0)`}>
				<Shape d={roughRect(150, 220, 26, 12, 214, 0.3)} color={BOOK.ink} w={1.2} wear={false} />
			</g>
			<Ink d="M146 214 q-4 -6 0 -12 M182 214 q4 -6 0 -12" w={1.2} color={BOOK.terracotta} second={false} />
			<Shape d={roughRect(186, 206, 20, 26, 215, 0.4)} color={BOOK.terracotta} w={1.4} />
			{[0, 1].map((i) => {
				const t = (steam + i) % 2;
				return <Ink key={i} d={smooth([[192 + i * 7, 202 - t * 10], [188 + i * 7, 192 - t * 14], [194 + i * 7, 182 - t * 18]])} w={1.1} opacity={Math.sin((t / 2) * Math.PI) * 0.7} second={false} />;
			})}
			<Shape d={roughPoly([[96, 226], [134, 222], [136, 232], [98, 234]], 216, 0.3)} color={BOOK.parchment} w={1.1} />
			{/* tiny thought, easily drowned out */}
			<ThoughtLoop cx={36} cy={86} sx={22} sy={14} p={1} phase={(a.f / a.fps) / 2.8} width={1.3} spark={2} opacity={0.55} />
		</Reveal>
	);
};

/** fig. 4b: the same person at night; nothing else competes, so the loop grows. Event: dark. */
export const NightBed: React.FC = () => {
	const a = useArt();
	const grow = 0.55 + 0.45 * prog(a, 'dark', 40);
	return (
		<Reveal p={shown(a)}>
			<T x={14} y={30} size={20} font={FELL_SC} spacing={3} color={BOOK.parchment}>
				Night
			</T>
			<Shape d={roughRect(140, 40, 56, 70, 221, 0.5)} color={BOOK.nightDeep} w={1.8} />
			<circle cx={172} cy={62} r={10} fill={BOOK.moon} />
			<rect x={-10} y={258} width={240} height={80} fill={BOOK.nightFloor} />
			<Shape d={roughRect(20, 250, 200, 18, 222, 0.5)} color={BOOK.woodDark} />
			<Sleeper x={58} y={226} r={22} len={170} drop={36} breath={wave(a, 4.2)} eyes="up" blink={blinking(a, 3.3, 1.1)} />
			<ThoughtLoop cx={112} cy={150} sx={92 * grow} sy={60 * grow} p={1} phase={(a.f / a.fps) / 2.4} color={BOOK.parchment} width={2.2} spark={4.5} />
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

/**
 * fig. 7: the to-do list. Events: lamp (light on), write (loop unravels into handwriting), nine (result note).
 */
export const Notebook: React.FC<{items?: string[]; title?: string}> = ({items = ['reply to Sam’s email', 'call the dentist', 'buy coffee filters'], title = 'Tomorrow:'}) => {
	const a = useArt();
	const on = prog(a, 'lamp', 16);
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
	// pencil follows the line being written
	const cur = lineP.findIndex((p) => p < 1);
	const li = cur < 0 ? lines.length - 1 : cur;
	const tipX = (li === 0 ? baseX : baseX + 26) + lines[li].length * 8.6 * (cur < 0 ? 1 : lineP[li]);
	const tipY = rows[li] - 2;
	const nine = prog(a, 'nine', 22);
	// the loop above the page comes apart into three strands that straighten onto the ruled lines
	const strands: Pt[][] = [0, 1, 2].map((row) =>
		Array.from({length: 31}, (_, i) => {
			const u = i / 30;
			const [lx, ly] = loopPt((row + u) / 3, 268, 64, 110, 38);
			const tx = baseX + 26 + u * 170;
			const ty = rows[row + 1] + 6;
			return [lx + (tx - lx) * unravel, ly + (ty - ly) * unravel] as Pt;
		}),
	);
	return (
		<Reveal p={shown(a)}>
			{/* lamp light fills the scene */}
			<rect x={0} y={0} width={a.w} height={a.h} fill={BOOK.nightDeep} opacity={0.55 * (1 - on) + 0.08} />
			<g transform={parallax(a, -0.03)}>
				<Lamp x={62} y={190} on={on} s={1.15} />
			</g>
			{/* tabletop */}
			<Shape d={roughRect(-10, 196, a.w + 20, 120, 301, 0.6)} color={BOOK.wood} hatch="light" />
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
				{since(a, 'write', 30) > 0 && writeP < 1 && <Pencil x={tipX} y={tipY} rot={-58} />}
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

