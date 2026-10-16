import React from 'react';
import {FELL, HAND} from '../../fonts';
import {blinking, prog, shown, since, track, useArt} from '../context';
import {Head} from '../figures';
import {Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Brain, Bubble, Chair, Coin, Cup, Glass, Jar, RoomBG, Sofa, Table} from '../props';
import {Figure, Look, MAIN, STRANGER} from '../rig';
import {Pt, roughEllipse, roughLine, roughRect, smooth} from '../rough';
import {Hand2, toLocal} from './shared';

/** The same person, one day later: same clothes, messier hair (a mug in hand in the morning). */
const LATER: Look = {...MAIN, top: '#8E8C74'};
const OLDER: Look = {...MAIN, hairColor: '#B9B2A6', hair: 'side'};

const TaskBox: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
	<g transform={`translate(${x} ${y}) rotate(${rot})`}>
		<Shape d={roughRect(-46, -58, 92, 58, 1301, 0.5)} color="#C9A877" hatch="light" w={2} />
		<Ink d="M-46 -40 L46 -40" w={1.2} opacity={0.6} second={false} />
		<text x={0} y={-14} fontFamily={HAND} fontWeight={700} fontSize={20} fill={BOOK.ink} textAnchor="middle">
			TASKS
		</text>
	</g>
);

/** fig. 1 — today hands the work to tomorrow. Events: push, shock. */
export const Handoff: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const sp = since(a, 'push');
	const boxX = track(sp, [[0, 330], [40, 640]]);
	const shock = prog(a, 'shock', 10);
	const mid = a.w / 2;
	const floor = 420;
	const pushing = sp > 0 && sp < 40;
	const presentHand = toLocal(230, 358, 1, 1, [Math.min(boxX - 40, 300), 340]);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={floor} wall="#D9C49A" />
			<rect x={mid} y={-10} width={a.w / 2 + 10} height={floor + 10} fill="#C9D2CC" opacity={0.8} />
			<circle cx={120} cy={120} r={120} fill="url(#tb-glow)" opacity={0.6} />
			<line x1={mid} x2={mid} y1={0} y2={a.h} stroke={BOOK.ink} strokeWidth={2} strokeDasharray="10 8" />
			<T x={mid / 2} y={46} size={26} anchor="middle" italic>
				today
			</T>
			<T x={mid * 1.5} y={46} size={26} anchor="middle" italic>
				tomorrow
			</T>
			<Sofa x={200} y={410} w={240} />
			<Figure x={230} y={358} pose="sit" seat={50} turn={0.4} lean={pushing ? 24 : 2} look={MAIN} near={pushing ? {hand: presentHand, grip: 'open', rot: -70} : {hand: [50, -76], grip: 'hold'}} far={{hand: [30, -40]}} face={{look: [1, 0.2], smile: 0.8, lid: 0.3, blink: blinking(a, 3)}} breath={Math.sin(t * 1.4) * 0.5 + 0.5} />
			{!pushing && <Cup x={268} y={292} s={0.9} t={t} />}
			<TaskBox x={boxX} y={floor} rot={pushing ? Math.sin(sp) * 2 : 0} />
			<Figure
				x={760}
				y={floor - 117}
				turn={0.5}
				facing={-1}
				lean={-shock * 12}
				look={LATER}
				near={sp > 30 ? {hand: [70, -60], grip: 'open'} : {hand: [30, -60], grip: 'hold'}}
				far={sp > 30 ? {hand: [56, -50], grip: 'open'} : undefined}
				face={{look: [1, 0.5], lid: 0.45 * (1 - shock), raise: shock, mouth: shock > 0.3 ? 'o' : 'flat', blink: shock < 0.1 && blinking(a, 2.5)}}
			/>
			<Bubble x={840} y={110} w={210} h={80} kind="speech" scale={shock} tail={[-60, 70]}>
				<Hand2 x={0} y={-4} lines={['Who agreed', 'to this?!']} size={20} />
			</Bubble>
		</Reveal>
	);
};

/** fig. 3 — the disgusting drink, for science. Event: gross. */
export const Drink: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const gross = prog(a, 'gross', 14);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={330} wall="#C9CFC6" stripes={false} />
			<Table x={250} y={230} w={200} legs={100} />
			<Glass x={250} y={230} level={0.75} color="#6B6233" h={70} t={t} />
			{[0, 1, 2].map((i) => {
				const k = (t * 0.7 + i / 3) % 1;
				return <Ink key={i} d={smooth([[236 + i * 14, 150 - k * 30], [230 + i * 14 + Math.sin(k * 7) * 6, 130 - k * 40], [238 + i * 14, 110 - k * 50]])} w={1.6} color={BOOK.olive} opacity={Math.sin(k * Math.PI)} second={false} />;
			})}
			<Chair x={120} y={268} s={0.9} />
			<Figure x={130} y={265} s={0.9} pose="sit" seat={60} turn={0.5} lean={-gross * 16} look={MAIN} near={{hand: gross > 0.3 ? [100, -90] : [70, -50], grip: 'open', rot: -60}} face={{look: [1, 0.4], worry: gross, lid: gross * 0.7, mouth: gross > 0.3 ? 'worry' : 'flat', tilt: -gross * 6, blink: blinking(a, 3)}} />
			<Figure x={390} y={330 - 117 * 0.9} s={0.9} facing={-1} turn={0.4} look={STRANGER} near={{hand: [40, -70], grip: 'hold'}} far={{hand: [30, -60]}} face={{look: [1, 0.2], smile: 0.5, tilt: Math.sin(t * 3) * 3}} />
			<g transform="translate(352 196) rotate(-8)">
				<Shape d={roughRect(-20, -26, 40, 52, 1311, 0.4)} color="#E9E1CF" w={1.4} />
				{[-14, -6, 2, 10].map((y, i) => (
					<line key={i} x1={-14} x2={14} y1={y} y2={y} stroke={BOOK.ink} strokeWidth={1} opacity={0.5} />
				))}
			</g>
			<Write text="for science" p={prog(a, 'gross', 24, 10, false)} x={250} y={40} size={20} italic anchor="middle" color={BOOK.terracotta} />
		</Reveal>
	);
};

/** fig. 4 — how much each would drink (schematic). Events: now, future, other. */
export const Glasses: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const g = [
		{lv: 0.2 * prog(a, 'now', 24), label: 'me, now'},
		{lv: 0.72 * prog(a, 'future', 30), label: 'future me'},
		{lv: 0.76 * prog(a, 'other', 30), label: 'a stranger'},
	];
	return (
		<Reveal p={shown(a)}>
			{g.map((x, i) => (
				<Glass key={i} x={60 + i * 95} y={250} level={x.lv} color="#6B6233" h={150} label={x.label} t={t + i} />
			))}
			{prog(a, 'other', 20) > 0 && <Ink d={roughLine(110, 120, 290, 120, 1321, 0.4)} w={1.4} dash="5 5" color={BOOK.terracotta} p={prog(a, 'other', 20)} second={false} />}
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				schematic, after Pronin et al., 2008
			</text>
		</Reveal>
	);
};

/** fig. 5 — a scanner and a simplified brain: "me" lights up more than "future me". Event: scan. */
export const Scanner: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const scan = prog(a, 'scan', 20);
	const cycle = Math.floor(Math.max(0, since(a, 'scan')) / 30) % 3;
	const glow = cycle === 0 ? 1 : cycle === 1 ? 0.35 : 0.25;
	const icons: {label: string; look: Look}[] = [
		{label: 'me', look: MAIN},
		{label: 'future me', look: OLDER},
		{label: 'someone else', look: STRANGER},
	];
	return (
		<Reveal p={shown(a)}>
			{/* scanner */}
			<Shape d={roughEllipse(90, 250, 66, 66, 1331, 0.6)} color="#D9DCD6" w={2.4} />
			<Shape d={roughEllipse(90, 250, 34, 34, 1332, 0.4)} color={BOOK.ink} w={1.6} wear={false} />
			<Shape d={roughRect(90, 236, 210, 26, 1333, 0.4)} color="#B9B2A6" w={1.8} />
			<Shape d={roughEllipse(250, 230, 12, 10, 1334, 0.4)} color={BOOK.skin} w={1.4} />
			<Brain x={200} y={110} s={0.7} spot={[-60, -20]} spotR={16} glow={scan * glow * (0.6 + 0.4 * Math.sin(t * 6))} />
			{icons.map((ic, i) => (
				<g key={i} opacity={0.35 + 0.65 * (cycle === i ? scan : 0.2)}>
					<g transform={`translate(${40} ${36 + i * 46})`}>
						<Head x={0} y={0} r={15} hair={ic.look.hair} hairColor={ic.look.hairColor} skin={ic.look.skin} seed={70 + i} />
						<text x={22} y={5} fontFamily={HAND} fontWeight={700} fontSize={13} fill={BOOK.ink}>
							{ic.label}
						</text>
					</g>
				</g>
			))}
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				simplified · 18 people · Ersner-Hershfield et al., 2009
			</text>
		</Reveal>
	);
};

/** fig. 7 — meeting an aged image of yourself, then saving. Events: aged, save. */
export const Mirror: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const aged = prog(a, 'aged', 20);
	const ss = since(a, 'save');
	const coins = ss > 0 ? Math.min(6, Math.floor(ss / 10)) : 0;
	const flying = ss > 0 && coins < 6 ? (ss % 10) / 10 : -1;
	const fx = 120;
	const fy = 330 - 117;
	const jar: Pt = [470, 330];
	const throwFrom: Pt = [fx + 50, fy - 70];
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={330} wall="#D3C6A8" />
			{/* screen showing the aged self */}
			<Shape d={roughRect(220, 60, 180, 150, 1341, 0.5)} color={BOOK.black} w={2} wear={false} />
			<rect x={232} y={72} width={156} height={126} fill="#E9E1CF" />
			<g opacity={aged}>
				<Head x={310} y={140} r={36} hair="side" hairColor="#B9B2A6" smile={0.7} look={[-0.6, 0]} seed={81} tilt={Math.sin(t * 2) * 4} />
				<Ink d="M284 128 q6 3 12 0 M324 128 q6 3 12 0 M296 168 q14 6 28 0" w={1} opacity={0.6} second={false} />
			</g>
			<Shape d={roughRect(296, 210, 28, 30, 1342, 0.3)} color={BOOK.woodDark} />
			<Jar x={jar[0]} y={jar[1]} fill={Math.min(1, coins / 6)} label="retirement" />
			<Figure x={fx} y={fy} turn={0.6} look={MAIN} near={ss > 0 ? {hand: [60 + Math.max(0, flying) * 10, -80], grip: 'open'} : {hand: [36, -10]}} face={{look: aged > 0.5 ? [1, -0.4] : [1, 0], raise: aged * 0.8, smile: aged * 0.5 + (coins > 0 ? 0.3 : 0), blink: blinking(a, 3.2)}} breath={Math.sin(t * 1.4) * 0.5 + 0.5} />
			{flying >= 0 && <Coin x={throwFrom[0] + (jar[0] - throwFrom[0]) * flying} y={throwFrom[1] + (jar[1] - 70 - throwFrom[1]) * flying - Math.sin(flying * Math.PI) * 60} />}
			<text x={a.w - 10} y={24} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				Hershfield et al., 2011
			</text>
		</Reveal>
	);
};

/** fig. 8 — tomorrow morning: a tired you opens the task and finds it done. Event: open. */
export const Morning: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const open = prog(a, 'open', 20);
	const note = prog(a, 'open', 24, 18);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={300} wall="#DCE0D6" />
			<circle cx={330} cy={60} r={70} fill="url(#tb-glow)" opacity={0.5} />
			<Table x={220} y={210} w={200} legs={90} />
			<Chair x={110} y={236} s={0.85} />
			<Figure x={116} y={233} s={0.85} pose="sit" seat={62} turn={0.5} look={LATER} near={{hand: [94, -50], grip: 'hold'}} far={{hand: [70, -46]}} face={{look: [1, 0.6], lid: 0.55 * (1 - note), smile: note, blink: blinking(a, 2.6)}} />
			<Cup x={150} y={210} t={t} />
			<g transform="translate(250 210)">
				<Shape d={roughRect(-50, -40, 100, 40, 1351, 0.4)} color="#C9A877" w={1.8} />
				<g transform={`translate(-50 -40) rotate(${-open * 110}) translate(50 40)`}>
					<Shape d={roughRect(-50, -46, 100, 8, 1352, 0.3)} color="#B79D6A" w={1.6} />
				</g>
				{note > 0 && (
					<g transform={`translate(0 ${-50 - note * 40}) rotate(-6) scale(${note})`}>
						<Shape d={roughRect(-50, -30, 100, 56, 1353, 0.4)} color="#EAD98E" w={1.4} />
						<Hand2 x={0} y={-8} lines={['Done!', '— last-night you']} size={13} />
					</g>
				)}
			</g>
		</Reveal>
	);
};

/** fig. 9 — doing tomorrow's self a favour tonight; a faint future self cheers. Event: favor. */
export const Favor: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const favor = prog(a, 'favor', 20);
	const write = Math.sin(t * 8) * 4;
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={290} wall="#CDBF9F" />
			<circle cx={90} cy={110} r={90} fill="url(#tb-glow)" opacity={0.6} />
			<Table x={250} y={200} w={220} legs={90} />
			<Chair x={160} y={226} s={0.85} />
			<Figure x={166} y={223} s={0.85} pose="sit" seat={62} turn={0.6} lean={14} look={MAIN} near={{hand: [104 + write, -36], grip: 'hold'}} far={{hand: [84, -30]}} face={{look: [1, 0.9], smile: 0.4, blink: blinking(a, 3)}} />
			<Shape d={roughRect(240, 190, 80, 10, 1361, 0.3)} color={BOOK.parchment} w={1.2} />
			<g opacity={0.45 * favor}>
				<Figure x={380} y={290 - 117 * 0.85} s={0.85} facing={-1} turn={0.4} look={LATER} near={{hand: [30, -170], grip: 'fist'}} face={{look: [1, 0.3], smile: 1}} />
			</g>
			<Write text="a favor for tomorrow" p={prog(a, 'favor', 26, 6, false)} x={a.w / 2} y={36} size={18} italic color={BOOK.terracotta} anchor="middle" />
		</Reveal>
	);
};

/** fig. 10 — today and tomorrow, high-five across the line. Event: five. */
export const HighFive: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const five = since(a, 'five');
	const meet = track(five, [[0, 0], [14, 1], [24, 1], [36, 0.8]]);
	const clap = five > 12 && five < 26 ? 1 - Math.abs(five - 16) / 10 : 0;
	const mid = a.w / 2;
	const y = 290 - 117 * 0.85;
	return (
		<Reveal p={shown(a)}>
			<rect x={-10} y={-10} width={mid + 10} height={a.h + 20} fill="#E3D1A8" />
			<rect x={mid} y={-10} width={mid + 10} height={a.h + 20} fill="#D6DDD6" />
			<line x1={mid} x2={mid} y1={0} y2={a.h} stroke={BOOK.ink} strokeWidth={1.6} strokeDasharray="8 7" />
			<T x={mid / 2} y={34} size={18} italic anchor="middle">
				today
			</T>
			<T x={mid * 1.5} y={34} size={18} italic anchor="middle">
				tomorrow
			</T>
			<Figure x={mid - 110 + meet * 20} y={y} s={0.85} turn={0.6} look={MAIN} near={{hand: [60 + meet * 30, -150 - meet * 30], grip: 'open'}} face={{look: [1, -0.3], smile: 1}} breath={Math.sin(t * 1.5) * 0.5 + 0.5} />
			<Figure x={mid + 110 - meet * 20} y={y} s={0.85} facing={-1} turn={0.6} look={LATER} near={{hand: [60 + meet * 30, -150 - meet * 30], grip: 'open'}} face={{look: [1, -0.3], smile: 1}} breath={Math.sin(t * 1.5 + 1) * 0.5 + 0.5} />
			{clap > 0 && (
				<g transform={`translate(${mid} 50)`} opacity={clap}>
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<Ink key={i} d={`M${Math.cos(i) * 14} ${Math.sin(i) * 14} L${Math.cos(i) * 28} ${Math.sin(i) * 28}`} w={2} color={BOOK.terracotta} second={false} />
					))}
				</g>
			)}
		</Reveal>
	);
};
