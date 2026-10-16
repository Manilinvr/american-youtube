import React from 'react';
import {FELL, HAND} from '../../fonts';
import {blinking, prog, shown, since, stages, track, useArt} from '../context';
import {Callout, Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Bubble, Chair, ClockFace, Cup, Calendar, Phone, RoomBG, SkyWindow, Sofa, Stars, StreetBG, Table} from '../props';
import {Figure, FRIEND, MAIN, motion, STRANGER} from '../rig';
import {Pt, roughLine, roughRect, smooth} from '../rough';
import {ChatBubble, Hand2, toLocal} from './shared';

/** fig. 1 — two people at a café table. Events: sip (main character drinks), bye (both wave). */
export const Cafe: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const floor = 410;
	const seatY = 346;
	const mx = 404;
	const fx = 590;
	const py = seatY - 4;
	const s = 1;
	const bye = prog(a, 'bye', 14);
	// the friend tells a story; the main character listens, laughs, sips
	const friendTalk = motion.talk(t, 1 - bye * 0.6);
	const g = motion.gesture(t, 1 - bye, 1);
	const laugh = track(since(a, 'line:hook', 30), [[0, 0], [10, 1], [40, 1], [55, 0]]);
	const sip = since(a, 'sip');
	const cupMain: Pt = [462, 292];
	const mouthMain: Pt = [mx + 30, py - 116];
	const cupAt: Pt =
		sip < 0 || sip > 70
			? cupMain
			: [track(sip, [[0, cupMain[0]], [16, mouthMain[0]], [44, mouthMain[0]], [60, cupMain[0]]]), track(sip, [[0, cupMain[1]], [16, mouthMain[1]], [44, mouthMain[1]], [60, cupMain[1]]])];
	const mainHand = toLocal(mx, py, s, 1, [cupAt[0] - 4, cupAt[1] - 8]);
	const waveM: Pt = [44 + Math.sin(t * 9) * 10, -150];
	const waveF: Pt = [40 + Math.sin(t * 9 + 1) * 10, -150];
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={floor} wall="#D8C7A6" />
			<SkyWindow x={60} y={50} w={300} h={230} t={t} sky="#C9A877" moon={false} city id="tb-cafe-win" />
			<text x={210} y={120} fontFamily={FELL} fontSize={34} fill={BOOK.terracotta} textAnchor="middle" opacity={0.75} letterSpacing={4}>
				CAFÉ
			</text>
			{/* hanging lamps sway a little */}
			{[500, 770].map((lx, i) => (
				<g key={i} transform={`rotate(${Math.sin(t * 1.3 + i) * 2.5} ${lx} 0)`}>
					<Ink d={`M${lx} 0 L${lx} 70`} w={1.6} second={false} />
					<Shape d={smooth([[lx - 26, 96], [lx - 16, 70], [lx + 16, 70], [lx + 26, 96]], true, 0.4)} color={BOOK.ochre} w={1.8} />
					<circle cx={lx} cy={104} r={44} fill="url(#tb-glow)" opacity={0.6} />
				</g>
			))}
			{/* shelf with cups */}
			<Shape d={roughRect(800, 170, 160, 10, 1001, 0.4)} color={BOOK.woodDark} />
			{[820, 850, 880, 920].map((cx, i) => (
				<Cup key={i} x={cx} y={170} s={0.9} color={i % 2 ? BOOK.parchment : BOOK.terracotta} />
			))}
			<Chair x={mx - 14} y={seatY} facing={1} />
			<Chair x={fx + 14} y={seatY} facing={-1} />
			<Table x={496} y={300} w={180} legs={110} />
			<Cup x={530} y={300} t={t} />
			<Cup x={cupAt[0]} y={cupAt[1] + 8} />
			<Figure
				x={mx}
				y={py}
				pose="sit"
				turn={0.55}
				lean={4 - laugh * 9}
				breath={Math.sin(t * 1.6) * 0.5 + 0.5}
				near={bye > 0.05 ? {hand: waveM, grip: 'open'} : {hand: mainHand, grip: 'hold'}}
				far={{hand: [46, -40]}}
				look={MAIN}
				face={{look: [1, -0.1], smile: 0.5 + laugh * 0.5, lid: laugh * 0.6, blink: blinking(a, 3.1), tilt: Math.sin(t * 2.2) * 3 * (1 - laugh), talk: laugh * motion.talk(t * 1.3, 0.5)}}
			/>
			<Figure
				x={fx}
				y={py}
				pose="sit"
				facing={-1}
				turn={0.55}
				lean={8 - bye * 6}
				breath={Math.sin(t * 1.5 + 1) * 0.5 + 0.5}
				near={bye > 0.05 ? {hand: waveF, grip: 'open'} : {hand: [58 + g[0], -70 + g[1]], grip: 'open', rot: -40}}
				far={{hand: [50 + g[1] * 0.5, -40]}}
				look={FRIEND}
				face={{look: [1, -0.1], smile: 0.7, talk: friendTalk, blink: blinking(a, 2.7, 0.5), raise: 0.4 + 0.3 * Math.sin(t * 1.7)}}
			/>
		</Reveal>
	);
};

/** fig. 2 — walking home, replaying everything. Events: q1, q2, q3 (thought bubbles). */
export const WalkHome: React.FC<{thoughts?: string[][]}> = ({thoughts = [['Did I talk', 'too much?'], ['Was that joke', 'weird?'], ['They think', "I'm boring."]]}) => {
	const a = useArt();
	const t = a.f / a.fps;
	const ground = 330;
	const s = 0.8;
	const py = ground - 117 * s;
	const pos: [number, number, number, number][] = [
		[350, 70, 190, 78],
		[110, 64, 170, 78],
		[360, 172, 180, 74],
	];
	return (
		<Reveal p={shown(a)}>
			<StreetBG w={a.w} h={a.h} ground={ground} scroll={t * 70} />
			<Figure x={210} y={py} s={s} pose="walk" walk={t * 6.5} turn={0.7} look={MAIN} face={{look: [0.5, 0.9], worry: 1, blink: blinking(a, 3.3, 0.2), tilt: 6}} />
			{thoughts.map((lines, i) => {
				const p = prog(a, `q${i + 1}`, 12);
				const [bx, by, bw, bh] = pos[i];
				const bob = Math.sin(t * 2 + i) * 3;
				return (
					<Bubble key={i} x={bx} y={by + bob} w={bw} h={bh} scale={p} tail={[210 - bx, 120 - by]}>
						<Hand2 x={0} y={-4} lines={lines} size={17} />
					</Bubble>
				);
			})}
		</Reveal>
	);
};

/** fig. 4 — two strangers, five minutes of small talk, then ratings. Events: timer, rate. */
export const LabChat: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const floor = 270;
	const st = since(a, 'timer');
	const minutes = st > 0 ? Math.min(300, st * 4) : 0;
	const rate = prog(a, 'rate', 30);
	const talkL = motion.talk(t, Math.sin(t * 0.9) > 0 ? 1 : 0);
	const talkR = motion.talk(t + 0.3, Math.sin(t * 0.9) > 0 ? 0 : 1);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={floor} wall="#C9CFC6" stripes={false} />
			<ClockFace x={155} y={40} r={20} minutes={minutes} />
			<text x={155} y={78} fontFamily={FELL} fontStyle="italic" fontSize={14} fill={BOOK.ink} textAnchor="middle">
				{`${Math.max(0, 5 - Math.floor(minutes / 60))}:00 min`}
			</text>
			<Table x={155} y={200} w={90} legs={70} />
			<Chair x={76} y={214} s={0.75} />
			<Chair x={234} y={214} s={0.75} facing={-1} />
			<Figure x={86} y={211} s={0.72} pose="sit" turn={0.6} look={STRANGER} seat={60} face={{look: [1, 0], talk: talkL, smile: 0.4, blink: blinking(a, 2.9)}} near={{hand: [60 + Math.sin(t * 3) * 6 * (talkL > 0 ? 1 : 0), -60], grip: 'open'}} />
			<Figure x={224} y={211} s={0.72} pose="sit" facing={-1} turn={0.6} look={FRIEND} seat={60} face={{look: [1, 0], talk: talkR, smile: 0.5, blink: blinking(a, 3.4, 1)}} />
			{rate > 0 && (
				<g opacity={rate}>
					<Shape d={roughRect(10, 18, 104, 36, 1011, 0.4)} color={BOOK.parchment} w={1.2} />
					<Stars x={22} y={37} n={4} p={rate} s={0.78} />
					<Shape d={roughRect(196, 18, 104, 36, 1012, 0.4)} color={BOOK.parchment} w={1.2} />
					<Stars x={208} y={37} n={4} p={rate} s={0.78} />
				</g>
			)}
		</Reveal>
	);
};

/** fig. 5 — the gap (schematic): how much they liked you vs how much you thought. Events: fill, gap. */
export const Meters: React.FC<{labels?: [string[], string[]]; values?: [number, number]}> = ({labels = [['how much', 'they liked you'], ['how much you', 'thought they did']], values = [0.82, 0.56]}) => {
	const a = useArt();
	const fill = prog(a, 'fill', 40);
	const gap = prog(a, 'gap', 24);
	const H = 190;
	const base = 250;
	const cols = [92, 238];
	return (
		<Reveal p={shown(a)}>
			{cols.map((cx, i) => {
				const v = values[i] * fill;
				return (
					<g key={i}>
						<Shape d={roughRect(cx - 26, base - H, 52, H, 1020 + i, 0.5)} color={BOOK.parchment} w={2} />
						<rect x={cx - 22} y={base - H * v} width={44} height={H * v} fill={i === 0 ? BOOK.terracotta : BOOK.blue} opacity={0.85} />
						<rect x={cx - 22} y={base - H * v} width={44} height={H * v} fill="url(#tb-light)" />
						{[0.25, 0.5, 0.75].map((k) => (
							<line key={k} x1={cx - 26} x2={cx - 16} y1={base - H * k} y2={base - H * k} stroke={BOOK.ink} strokeWidth={1} />
						))}
						{labels[i].map((l, j) => (
							<text key={j} x={cx} y={base + 22 + j * 17} fontFamily={FELL} fontStyle="italic" fontSize={15} fill={BOOK.ink} textAnchor="middle">
								{l}
							</text>
						))}
					</g>
				);
			})}
			{gap > 0 && (
				<g>
					<Ink d={`M${cols[0] + 30} ${base - H * values[0]} L${cols[1] - 34} ${base - H * values[0]} M${cols[1] - 34} ${base - H * values[0]} L${cols[1] - 34} ${base - H * values[1]} M${cols[1] - 40} ${base - H * values[1]} L${cols[1] - 28} ${base - H * values[1]}`} w={2} color={BOOK.ink} p={gap} second={false} />
					<Write text="the liking gap" p={gap} x={a.w / 2 + 6} y={base - H * values[0] - 14} size={18} italic color={BOOK.terracotta} anchor="middle" />
				</g>
			)}
			<text x={a.w - 10} y={22} fontFamily={FELL} fontStyle="italic" fontSize={13} fill={BOOK.brown} textAnchor="end">
				schematic, not real data
			</text>
		</Reveal>
	);
};

/**
 * fig. 7 — the signals you miss: the friend smiles, leans in, nods; you look at your cup.
 * Events: miss, smile, lean.
 */
export const Signals: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const py = 300;
	const fx = 170;
	const mx = 420;
	const lean = prog(a, 'lean', 16);
	const miss = prog(a, 'miss', 12);
	const nod = Math.sin(t * 4.5) * 5;
	const fidget = Math.sin(t * 3) * 6;
	const smileP = prog(a, 'smile', 14);
	const leanP = prog(a, 'lean', 14);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={350} wall="#D8C7A6" />
			<Table x={295} y={250} w={190} legs={100} />
			<Cup x={348} y={250} s={1.1} />
			<Cup x={250} y={250} s={1.1} t={t} />
			<Figure
				x={fx}
				y={py}
				pose="sit"
				turn={0.5}
				lean={6 + lean * 10}
				breath={Math.sin(t * 1.5) * 0.5 + 0.5}
				near={{hand: [66 + lean * 10, -54], grip: 'relaxed'}}
				look={FRIEND}
				face={{look: [1, 0.15], smile: 0.6 + smileP * 0.4, tilt: nod, blink: blinking(a, 3), raise: 0.3}}
			/>
			<Figure
				x={mx}
				y={py}
				pose="sit"
				facing={-1}
				turn={0.35}
				lean={10}
				near={{hand: [72 + fidget * 0.3, -48 + fidget * 0.2], grip: 'hold'}}
				look={MAIN}
				face={{look: [0.3, 1], worry: 0.4 + miss * 0.6, lid: 0.25, blink: blinking(a, 2.6, 1)}}
			/>
			<Callout from={[208, 165]} to={[40, 70]} text="a real smile" p={smileP} size={17} anchor="start" />
			<Callout from={[176, 230]} to={[30, 140]} text="leaning in" p={leanP} size={17} anchor="start" />
			<Callout from={[196, 140]} to={[250, 52]} text="eye contact" p={prog(a, 'lean', 20, 12)} size={17} anchor="start" />
			{miss > 0 && (
				<Bubble x={470} y={86} w={170} h={70} scale={miss} tail={[-40, 60]}>
					<Hand2 x={0} y={2} lines={['was that weird?']} size={16} />
				</Bubble>
			)}
		</Reveal>
	);
};

const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

/** fig. 8 — college roommates, months going by. Event: months. */
export const Roommates: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const sm = since(a, 'months');
	const idx = sm > 0 ? Math.min(MONTHS.length - 1, Math.floor(sm / 14)) : 0;
	const flip = sm > 0 && idx < MONTHS.length - 1 ? (sm % 14) / 14 : 0;
	// they glance at each other and look away
	const glanceL = Math.sin(t * 1.3) > 0.6;
	const glanceR = Math.sin(t * 1.1 + 2) > 0.6;
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={300} wall="#CFC4AB" />
			<Calendar x={a.w / 2} y={90} label={MONTHS[idx]} flip={flip} s={1} />
			<Table x={78} y={210} w={110} legs={90} />
			<Table x={302} y={210} w={110} legs={90} />
			<Chair x={118} y={240} s={0.8} facing={-1} />
			<Chair x={262} y={240} s={0.8} />
			<Figure x={110} y={237} s={0.75} pose="sit" facing={-1} turn={glanceL ? 0.2 : 0.8} look={MAIN} seat={62} near={{hand: [36, -40]}} face={{look: glanceL ? [-1, 0] : [1, 0.6], worry: 0.7, blink: blinking(a, 3)}} />
			<Figure x={270} y={237} s={0.75} pose="sit" turn={glanceR ? 0.2 : 0.8} look={STRANGER} seat={62} near={{hand: [36, -40]}} face={{look: glanceR ? [-1, 0] : [1, 0.6], worry: 0.7, blink: blinking(a, 3.4, 1)}} />
			<T x={a.w / 2} y={150} size={14} italic anchor="middle" color={BOOK.brown}>
				months go by
			</T>
		</Reveal>
	);
};

/** fig. 9 — the friend walking home the other way, smiling. Event: liked. */
export const OtherWalk: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const ground = 270;
	const s = 0.72;
	const py = ground - 117 * s;
	const liked = prog(a, 'liked', 14);
	return (
		<Reveal p={shown(a)}>
			<StreetBG w={a.w} h={a.h} ground={ground} scroll={-t * 70} />
			<Figure x={300} y={py} s={s} facing={-1} pose="walk" walk={t * 6.5} turn={0.6} look={FRIEND} face={{look: [0.6, -0.2], smile: 0.9, blink: blinking(a, 3), tilt: Math.sin(t * 3) * 3}} />
			<Bubble x={140} y={70} w={210} h={84} scale={liked} tail={[150, 50]}>
				<Hand2 x={0} y={-6} lines={['I really', 'liked them!']} size={18} />
				<path d="M62 -18 c-6 -10 -20 -4 -14 6 l14 12 l14 -12 c6 -10 -8 -16 -14 -6 z" fill={BOOK.terracotta} stroke={BOOK.ink} strokeWidth={1.2} transform="translate(-10 0) scale(0.8)" />
			</Bubble>
		</Reveal>
	);
};

/** fig. 10 — later, on the sofa: a message arrives. Event: buzz. */
export const Message: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const buzz = since(a, 'buzz');
	const shake = buzz > 0 && buzz < 24 ? Math.sin(a.f * 2.4) * 3 : 0;
	const read = prog(a, 'buzz', 20, 16);
	const relief = prog(a, 'buzz', 30, 40);
	const phoneLocal: Pt = [44, -96];
	const phoneAt: Pt = [150 + (phoneLocal[0] + shake) * 0.78, 198 + phoneLocal[1] * 0.78];
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={270} wall="#D3C4A6" />
			<Sofa x={150} y={260} w={230} />
			<Phone x={phoneAt[0] + 6} y={phoneAt[1] - 6} s={0.42} rot={-12} glow={read} />
			<Figure x={150} y={198} s={0.78} pose="sit" turn={0.3} lean={-relief * 8} look={MAIN} seat={62} near={{hand: [phoneLocal[0] + shake, phoneLocal[1]], grip: 'hold'}} face={{look: [1, 0.2], smile: relief, worry: 0.6 * (1 - relief), blink: blinking(a, 3.2)}} />
			{/* big inset of the screen */}
			<g transform={`translate(${370 + shake} 150)`}>
				<Phone x={0} y={0} s={2.4} glow={1} screen={<ChatBubble x={-15} y={-8} w={30} text={['That was fun!', 'Coffee again?']} size={4.6} p={read} />} />
			</g>
			<Ink d={roughLine(196, 120, 300, 120, 1031, 0.6)} w={1} dash="4 5" second={false} />
			{read > 0 && (
				<text x={370} y={300} fontFamily={HAND} fontWeight={700} fontSize={16} fill={BOOK.ink} textAnchor="middle" opacity={read}>
					1 new message
				</text>
			)}
		</Reveal>
	);
};
