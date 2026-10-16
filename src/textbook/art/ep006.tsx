import React from 'react';
import {FELL, HAND} from '../../fonts';
import {blinking, prog, shown, since, track, useArt} from '../context';
import {Head} from '../figures';
import {Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Brain, ClockFace, Door, Phone, Rock, RoomBG, Snake, Sofa, Table, Zap} from '../props';
import {Figure, MAIN} from '../rig';
import {Pt, roughEllipse, roughRect, smooth} from '../rough';
import {ChatBubble, Hand2} from './shared';

/** fig. 1 — the message was read, no reply. Events: read, dots, endings. */
export const ReadNoReply: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const read = prog(a, 'read', 12);
	const sd = since(a, 'dots');
	const dots = sd > 0 && sd < 50 ? 1 : 0;
	const sr = Math.max(0, since(a, 'read'));
	// checks the phone, puts it down, picks it up again
	const down = Math.sin(sr / 22) > 0.4 ? 1 : 0;
	const legBounce = Math.abs(Math.sin(t * 9)) * 5 * read;
	const phoneHand: Pt = down ? [70, -20] : [50, -92];
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={420} wall="#CDBE9E" />
			<circle cx={130} cy={210} r={150} fill="url(#tb-glow)" opacity={0.55} />
			<g transform="translate(130 320)">
				<Shape d={roughEllipse(0, 0, 24, 7, 1401, 0.4)} color={BOOK.woodDark} w={1.6} />
				<Ink d="M0 0 L0 -90" w={3} second={false} />
				<Shape d={smooth([[-34, -90], [34, -90], [22, -140], [-22, -140]], true, 0.3)} color={BOOK.glow} w={2} />
			</g>
			<ClockFace x={560} y={110} r={26} minutes={t * 40} />
			<Sofa x={330} y={410} w={260} />
			<Figure x={330} y={352} pose="sit" seat={58} turn={0.35} lean={down ? -8 : 10} look={MAIN} near={{hand: phoneHand, grip: 'hold'}} far={{hand: [34, -34]}} feet={{near: [58, 58 - legBounce], far: [44, 56]}} face={{look: down ? [0.8, 0.4] : [0.5, 0.8], worry: 0.4 + 0.6 * read, blink: blinking(a, 2.4)}} breath={Math.sin(t * 2.2) * 0.5 + 0.5} />
			{/* the screen, enlarged */}
			<g transform="translate(810 230)">
				<Phone x={0} y={0} s={4.6} glow={1} />
				<ChatBubble x={64} y={-90} w={110} text={['Can we talk', 'tomorrow?']} mine size={17} />
				<text x={60} y={-14} fontFamily={HAND} fontSize={14} fill={BOOK.brown} textAnchor="end" opacity={read}>
					Read 9:41 PM
				</text>
				{dots > 0 && (
					<g transform="translate(-50 30)">
						<rect x={-10} y={-14} width={60} height={28} rx={14} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1} />
						{[0, 1, 2].map((i) => (
							<circle key={i} cx={4 + i * 15} cy={0} r={4} fill={BOOK.ink} opacity={0.3 + 0.7 * Math.max(0, Math.sin(t * 8 - i))} />
						))}
					</g>
				)}
			</g>
		</Reveal>
	);
};

const ENDINGS: {label: string; at: Pt}[] = [
	{label: "they're mad", at: [120, 70]},
	{label: 'just busy', at: [300, 60]},
	{label: 'phone died', at: [400, 160]},
	{label: 'bad news?', at: [250, 170]},
	{label: "it's nothing", at: [90, 190]},
];

/** fig. 2 — every possible ending, branching from one worried head. Event: branch. */
export const Branches: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const head: Pt = [90, 330];
	return (
		<Reveal p={shown(a)}>
			<Head x={head[0]} y={head[1]} r={44} look={[0.6, -0.8]} worry={1} blink={blinking(a, 2.2)} seed={91} />
			{ENDINGS.map((e, i) => {
				const p = prog(a, 'branch', 20, i * 8);
				const mid: Pt = [(head[0] + e.at[0]) / 2 + Math.sin(i * 2) * 30, (head[1] - 40 + e.at[1]) / 2];
				return (
					<g key={i}>
						<Ink d={smooth([[head[0] + 10, head[1] - 46], mid, [e.at[0], e.at[1] + 18]])} w={2} color={BOOK.brown} p={p} second={false} />
						{p > 0.8 && (
							<g transform={`translate(${e.at[0]} ${e.at[1] + Math.sin(t * 2 + i) * 3})`}>
								<Shape d={roughEllipse(0, 0, 62, 20, 1410 + i, 0.6)} color={i % 2 ? BOOK.parchment : '#EAD9B8'} w={1.6} wear={false} />
								<text x={0} y={6} fontFamily={HAND} fontWeight={700} fontSize={15} fill={BOOK.ink} textAnchor="middle">
									{e.label}
								</text>
							</g>
						)}
					</g>
				);
			})}
		</Reveal>
	);
};

/** fig. 4 — the rock game on a screen; the player seen from behind. Events: flip, zap. */
export const RockGame: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const sf = Math.max(0, since(a, 'flip'));
	const round = Math.floor(sf / 26);
	const k = (sf % 26) / 26;
	const which = round % 3;
	const snakeHere = round % 2 === 1;
	const zap = prog(a, 'zap', 6) * (1 - prog(a, 'zap', 20, 14));
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={290} wall="#C9CFC6" stripes={false} />
			<Shape d={roughRect(40, 30, 230, 150, 1421, 0.5)} color={BOOK.black} w={2} wear={false} />
			<rect x={50} y={40} width={210} height={130} fill="#A69A6A" />
			{[0, 1, 2].map((i) => {
				const lift = which === i ? Math.sin(k * Math.PI) * 30 : 0;
				return (
					<g key={i}>
						{which === i && snakeHere && lift > 6 && <Snake x={90 + i * 66} y={140} s={0.4} t={t} />}
						<Rock x={90 + i * 66} y={150} w={50} lift={lift} tilt={which === i ? -lift * 0.6 : 0} />
					</g>
				);
			})}
			<Shape d={roughRect(140, 180, 30, 30, 1422, 0.3)} color={BOOK.woodDark} />
			<Table x={155} y={226} w={240} legs={64} />
			<Figure x={155} y={254} s={0.75} pose="sit" seat={50} turn={-1} look={MAIN} near={{hand: [44, -56], grip: 'hold'}} far={{hand: [-44, -56], grip: 'relaxed'}} face={{}} breath={Math.sin(t * 2) * 0.5 + 0.5} />
			<Zap x={118} y={214} on={zap} />
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				a mild shock to the hand
			</text>
		</Reveal>
	);
};

/** fig. 5 — stress vs. chance of a shock (schematic): highest at 50/50. Events: curve, peak. */
export const StressCurve: React.FC = () => {
	const a = useArt();
	const c = prog(a, 'curve', 40, 0, false);
	const peak = prog(a, 'peak', 20);
	const x0 = 50;
	const x1 = 300;
	const yb = 250;
	const f = (u: number) => yb - 30 - Math.sin(u * Math.PI) * 150;
	const pts: Pt[] = Array.from({length: 41}, (_, i) => [x0 + (i / 40) * (x1 - x0), f(i / 40)]);
	const u = Math.min(c, 0.5); // the dot climbs to the peak and stays there
	const dot: Pt = [x0 + u * (x1 - x0), f(u)];
	return (
		<Reveal p={shown(a)}>
			<Ink d={`M${x0} 40 L${x0} ${yb} L${x1 + 10} ${yb}`} w={2} second={false} />
			<text x={x0 - 8} y={50} fontFamily={FELL} fontStyle="italic" fontSize={15} fill={BOOK.ink} textAnchor="end" transform={`rotate(-90 ${x0 - 18} 120)`}>
				stress
			</text>
			{['0%', '50/50', '100%'].map((l, i) => (
				<text key={l} x={x0 + i * ((x1 - x0) / 2)} y={yb + 20} fontFamily={FELL} fontSize={15} fill={BOOK.ink} textAnchor="middle">
					{l}
				</text>
			))}
			<text x={(x0 + x1) / 2} y={yb + 40} fontFamily={FELL} fontStyle="italic" fontSize={14} fill={BOOK.brown} textAnchor="middle">
				chance of a shock
			</text>
			<Ink d={smooth(pts)} w={3} color={BOOK.terracotta} p={c} second={false} />
			{c > 0 && <circle cx={dot[0]} cy={dot[1]} r={6} fill={BOOK.terracotta} stroke={BOOK.ink} strokeWidth={1.4} />}
			{peak > 0 && (
				<g opacity={peak}>
					<Ink d={`M${(x0 + x1) / 2} ${f(0.5) - 8} L${(x0 + x1) / 2} ${f(0.5) - 34}`} w={1.4} second={false} />
					<Write text="most stress" p={peak} x={(x0 + x1) / 2} y={f(0.5) - 40} size={17} italic color={BOOK.terracotta} anchor="middle" />
					<Write text="least: certain" p={peak} x={x1 - 4} y={yb - 40} size={13} italic anchor="end" />
				</g>
			)}
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				schematic, after de Berker et al., 2016
			</text>
		</Reveal>
	);
};

/** fig. 6 — the body keeps score: pupils widen, palms sweat. Events: body, sweat. */
export const BodySignals: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const body = prog(a, 'body', 20);
	const sweat = prog(a, 'sweat', 20);
	const pupil = 0.35 + 0.5 * body * (0.6 + 0.4 * Math.sin(t * 2));
	return (
		<Reveal p={shown(a)}>
			<g transform="translate(90 110) scale(2.4)">
				<Shape d="M-22 0 Q0 -16 22 0 Q0 16 -22 0 Z" color={BOOK.parchment} w={0.8} wear={false} />
				<circle cx={0} cy={0} r={8} fill={BOOK.brown} stroke={BOOK.ink} strokeWidth={0.6} />
				<circle cx={0} cy={0} r={8 * pupil} fill={BOOK.ink} />
			</g>
			<text x={90} y={170} fontFamily={FELL} fontStyle="italic" fontSize={15} fill={BOOK.ink} textAnchor="middle">
				pupils widen
			</text>
			{/* palm */}
			<g transform="translate(220 230)">
				<Shape d={smooth([[-34, 40], [-38, -10], [-30, -40], [-18, -60], [-6, -64], [6, -62], [18, -56], [30, -40], [36, -6], [32, 40]], true)} color={BOOK.skin} w={2} />
				{[[-14, -20], [8, -30], [20, 4], [-6, 14], [10, 28]].map(([x, y], i) => {
					const k = (t * 0.8 + i * 0.2) % 1;
					return <ellipse key={i} cx={x} cy={y + k * 8} rx={3} ry={4.5} fill="#B9D3D6" stroke={BOOK.ink} strokeWidth={0.8} opacity={sweat * (1 - k * 0.6)} />;
				})}
			</g>
			<text x={220} y={300} fontFamily={FELL} fontStyle="italic" fontSize={15} fill={BOOK.ink} textAnchor="middle">
				palms sweat
			</text>
		</Reveal>
	);
};

/** fig. 8 — an alert brain at a fork in the road, ready for either way (a metaphor). Event: alert. */
export const AlertFork: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const alert = prog(a, 'alert', 20);
	return (
		<Reveal p={shown(a)}>
			<rect x={-10} y={200} width={a.w + 20} height={200} fill="#B7A68A" />
			<Shape d={smooth([[170, 380], [200, 300], [190, 250], [80, 210], [30, 200], [60, 196], [200, 230], [320, 196], [350, 200], [300, 214], [220, 250], [220, 300], [230, 380]], true)} color="#D9CBAE" w={1.6} />
			{[[56, 190], [330, 186]].map(([x, y], i) => (
				<g key={i}>
					<Ink d={`M${x} ${y} L${x} ${y - 60}`} w={3} second={false} />
					<circle cx={x} cy={y - 66} r={26} fill="url(#tb-glow)" opacity={0.4 + 0.5 * alert * (0.6 + 0.4 * Math.sin(t * 4 + i))} />
					<Shape d={roughEllipse(x, y - 66, 8, 8, 1431 + i, 0.3, 8)} color={BOOK.glow} w={1.4} wear={false} />
				</g>
			))}
			<Brain x={190} y={110} s={0.6} spot={[0, -10]} spotR={40} glow={alert * (0.5 + 0.5 * Math.sin(t * 5))} />
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.ink} textAnchor="end">
				one idea · a metaphor
			</text>
		</Reveal>
	);
};

/** fig. 9 — shrinking the maybe: ask, pick a time, plan. Events: ask, time, plan. */
export const ShrinkMaybe: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const ask = prog(a, 'ask', 16);
	const time = prog(a, 'time', 16);
	const plan = prog(a, 'plan', 16);
	const shrink = 1 - 0.25 * (ask + time + plan);
	const typing = ask > 0 && ask < 1 ? Math.sin(t * 20) * 2 : 0;
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={290} wall="#CDBE9E" />
			<text x={340} y={110} fontFamily={FELL} fontSize={64 * shrink} fill={BOOK.terracotta} textAnchor="middle" opacity={0.25 + 0.6 * shrink}>
				MAYBE
			</text>
			<Table x={120} y={210} w={160} legs={80} />
			<Figure x={120} y={290 - 117 * 0.82} s={0.82} turn={0.4} look={MAIN} near={{hand: [36 + typing, -88], grip: 'hold'}} far={{hand: [20, -84], grip: 'hold'}} face={{look: [0.4, 0.8], worry: 0.5 - 0.5 * plan, smile: plan * 0.6, blink: blinking(a, 3)}} />
			<g transform="translate(160 125)">
				<Phone x={0} y={0} s={0.5} glow={1} />
			</g>
			<ChatBubble x={380} y={180} w={120} text={['all good? talk', 'at 7?']} mine size={14} p={ask} />
			{time > 0 && (
				<g opacity={time}>
					<ClockFace x={400} y={240} r={20} minutes={7 * 60 * time} />
					<text x={430} y={246} fontFamily={HAND} fontWeight={700} fontSize={14} fill={BOOK.ink}>
						7:00
					</text>
				</g>
			)}
			{plan > 0 && (
				<g opacity={plan} transform="translate(240 230) rotate(-4)">
					<Shape d={roughRect(-40, -26, 90, 52, 1441, 0.4)} color="#EAD98E" w={1.4} />
					<Hand2 x={5} y={-6} lines={['yes: coffee', 'no: a walk']} size={12} />
				</g>
			)}
		</Reveal>
	);
};

/** fig. 10 — the door marked "maybe", finally closed. Event: shut. */
export const MaybeDoor: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const ss = since(a, 'shut');
	const open = ss > 0 ? Math.max(0, 0.55 - ss / 14) : 0.4 + Math.sin(t * 1.2) * 0.15;
	const reach = track(ss, [[-30, 0], [-6, 1], [6, 1], [26, 0]]);
	const fx = 200;
	const fy = 290 - 117 * 0.85;
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={290} wall="#D3C4A6" />
			{open > 0.05 && <polygon points={`290,290 ${290 + 70 * open},110 ${360},110 360,290`} fill={BOOK.glow} opacity={0.35} />}
			<Door x={325} y={290} w={70} h={180} open={open} />
			<g transform="translate(325 96)">
				<Shape d={roughRect(-34, -14, 68, 24, 1451, 0.3)} color={BOOK.parchment} w={1.2} />
				<text x={0} y={4} fontFamily={HAND} fontWeight={700} fontSize={14} fill={BOOK.ink} textAnchor="middle">
					maybe
				</text>
			</g>
			<Figure x={fx + reach * 30} y={fy} s={0.85} turn={0.7} look={MAIN} near={{hand: [60 + reach * 60, -80], grip: 'open'}} face={{look: [1, 0], smile: ss > 10 ? 0.8 : 0.2, blink: blinking(a, 3)}} breath={Math.sin(t * 1.4) * 0.5 + 0.5} />
			{ss > 0 && ss < 20 && <Write text="click." p={1} x={400} y={210} size={20} italic color={BOOK.terracotta} />}
		</Reveal>
	);
};

