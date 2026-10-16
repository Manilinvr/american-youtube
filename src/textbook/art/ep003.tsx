import React from 'react';
import {FELL, HAND} from '../../fonts';
import {blinking, prog, shown, since, useArt} from '../context';
import {Head} from '../figures';
import {Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Bench, Bubble, EyeIcon, RoomBG, TrainInterior} from '../props';
import {ELDER, Figure, FRIEND, MAIN, STRANGER} from '../rig';
import {Pt, roughLine, roughRect, smooth} from '../rough';
import {Hand2} from './shared';

/** Little "prickle" marks on the back of the neck. */
const Tingle: React.FC<{x: number; y: number; p: number; t: number}> = ({x, y, p, t}) =>
	p > 0 ? (
		<g opacity={p}>
			{[0, 1, 2].map((i) => {
				const k = (t * 2 + i / 3) % 1;
				return <Ink key={i} d={`M${x - 6 - k * 10} ${y - 8 + i * 9} l-5 -3 l-4 4 l-5 -3`} w={1.6} color={BOOK.terracotta} opacity={1 - k} second={false} />;
			})}
		</g>
	) : null;

/** A newspaper held open in front of someone. */
const Newspaper: React.FC<{x: number; y: number}> = ({x, y}) => (
	<g transform={`translate(${x} ${y})`}>
		<Shape d={roughRect(-36, -48, 72, 60, 1101, 0.4)} color="#E9E1CF" w={1.6} />
		{[-36, -26, -16, -6].map((yy, i) => (
			<line key={i} x1={-30} x2={i % 2 ? 0 : 28} y1={yy} y2={yy} stroke={BOOK.ink} strokeWidth={1.2} opacity={0.5} />
		))}
		<Ink d="M0 -48 L0 12" w={1} opacity={0.6} second={false} />
	</g>
);

/** fig. 1 — a train carriage. Event: tingle (the feeling of being watched). */
export const Train: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const tingle = prog(a, 'tingle', 12);
	const sway = Math.sin(t * 2.2) * 0.6;
	const py = 384;
	return (
		<Reveal p={shown(a)}>
			<g transform={`rotate(${sway * 0.4} ${a.w / 2} ${a.h})`}>
				<TrainInterior w={a.w} h={a.h} t={t} id="tb-train-1" />
				<Bench x={300} y={400} w={420} />
				<Bench x={790} y={400} w={300} />
				<Figure x={200} y={py} pose="sit" turn={0.4} look={ELDER} seat={70} near={{hand: [52, -66], grip: 'hold'}} far={{hand: [36, -64], grip: 'hold'}} face={{look: [0.6, 0.4], blink: blinking(a, 3.6)}} breath={Math.sin(t * 1.4) * 0.5 + 0.5} />
				<Newspaper x={250} y={318} />
				<Figure
					x={380}
					y={py}
					pose="sit"
					turn={0.3 - tingle * 0.15}
					lean={6 - tingle * 6}
					look={MAIN}
					seat={70}
					near={{hand: [40, -64], grip: 'hold'}}
					face={{look: tingle > 0.5 ? [-0.8, -0.2] : [0.5, 0.9], raise: tingle, lid: tingle > 0.5 ? 0 : 0.2, blink: tingle < 0.3 && blinking(a, 3.1, 0.3)}}
					breath={Math.sin(t * 1.6) * 0.5 + 0.5}
				/>
				<g transform="translate(410 330) rotate(-10)">
					<rect x={-9} y={-15} width={18} height={30} rx={2} fill={BOOK.black} />
					<rect x={-7} y={-12} width={14} height={24} fill="#3E4549" />
				</g>
				<Tingle x={372} y={246} p={tingle} t={t} />
				<Figure x={540} y={py} pose="sit" turn={0.5} look={FRIEND} seat={70} near={{hand: [46, -40]}} face={{lid: 0.85, smile: 0.3, tilt: Math.sin(t * 2) * 4}} />
				{/* headphones on the music listener */}
				<Ink d={smooth([[514, 225], [541, 190], [570, 225]])} w={4} color={BOOK.black} second={false} />
				<Figure x={790} y={a.h - 122} facing={-1} turn={0.6} look={STRANGER} near={{hand: [22, -210], grip: 'fist'}} face={{look: [1, 0.25], blink: blinking(a, 4, 1)}} breath={Math.sin(t * 1.3) * 0.5 + 0.5} />
			</g>
		</Reveal>
	);
};

/** fig. 2 — turning around... and someone is looking. Events: turn, caught. */
export const TurnAround: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const turn = prog(a, 'turn', 18);
	const caught = prog(a, 'caught', 8);
	const py = 300;
	return (
		<Reveal p={shown(a)}>
			<TrainInterior w={a.w} h={a.h} t={t} id="tb-train-2" />
			<Bench x={300} y={316} w={300} />
			<Figure x={110} y={a.h - 122 + 30} s={1} turn={0.5} look={STRANGER} near={{hand: [24, -206], grip: 'fist'}} face={{look: [1, 0.1], blink: false}} />
			<Figure
				x={320}
				y={py}
				pose="sit"
				turn={0.3 - turn * 0.9}
				lean={4 - turn * 8}
				look={MAIN}
				seat={70}
				near={{hand: [40 - turn * 20, -64 + turn * 20], grip: 'hold'}}
				face={{turn: 0.3 - turn * 1.2, look: turn > 0.5 ? [-1, -0.1] : [0.5, 0.8], raise: caught, talk: caught * 0.5, blink: blinking(a, 3.3)}}
			/>
			{caught > 0 && (
				<g transform={`translate(318 ${116 - caught * 10}) scale(${caught})`}>
					<text x={0} y={0} fontFamily={FELL} fontSize={44} fill={BOOK.terracotta} textAnchor="middle">
						!
					</text>
				</g>
			)}
			{caught > 0 && <Ink d={roughLine(150, 128, 290, 160, 1111, 0.4)} w={1.2} dash="5 6" color={BOOK.terracotta} p={caught} second={false} />}
		</Reveal>
	);
};

/** fig. 4 — the lab test: a starer behind glass, the subject guessing. Events: stare, score. */
export const LabStare: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const ss = since(a, 'stare');
	const staring = ss > 0 ? Math.floor(ss / 20) % 2 === 0 : true;
	const score = prog(a, 'score', 30);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={270} wall="#C9CFC6" stripes={false} />
			{/* one-way window */}
			<Shape d={roughRect(14, 60, 100, 150, 1121, 0.4)} color="#8FA2A6" opacity={0.6} w={2.2} />
			<Figure x={66} y={160} s={0.62} turn={0.7} look={STRANGER} face={{look: staring ? [1, 0] : [0, 1], lid: staring ? 0 : 0.6}} near={{hand: [20, -10]}} />
			<Ink d={roughRect(14, 60, 100, 150, 1122, 0.4)} w={3} color={BOOK.woodDark} second={false} />
			<text x={64} y={50} fontFamily={HAND} fontWeight={700} fontSize={13} fill={staring ? BOOK.terracotta : BOOK.brown} textAnchor="middle">
				{staring ? 'STARE' : 'LOOK AWAY'}
			</text>
			<Figure x={216} y={234} s={0.62} pose="sit" turn={0.8} look={MAIN} seat={60} face={{look: [1, 0], lid: 0.3, worry: 0.6, tilt: Math.sin(t * 1.6) * 4}} />
			<Shape d={roughRect(192, 236, 60, 8, 1123, 0.3)} color={BOOK.woodDark} />
			<Bubble x={262} y={74} w={70} h={50} scale={1} tail={[-30, 56]}>
				<text x={0} y={8} fontFamily={FELL} fontSize={26} fill={BOOK.ink} textAnchor="middle">
					?
				</text>
			</Bubble>
			{/* scoreboard: right about half the time */}
			{score > 0 && (
				<g opacity={score}>
					<Shape d={roughRect(150, 284, 150, 34, 1124, 0.4)} color={BOOK.parchment} w={1.4} />
					<rect x={160} y={296} width={130 * 0.5 * score} height={10} fill={BOOK.olive} />
					<line x1={225} x2={225} y1={290} y2={312} stroke={BOOK.terracotta} strokeWidth={2} />
					<text x={226} y={330} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.ink} textAnchor="middle">
						right ≈ 50/50 = guessing
					</text>
				</g>
			)}
		</Reveal>
	);
};

/** fig. 5 — gaze judgments: clear vs unclear eyes. Events: test, unsure. */
export const GazeTest: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const test = prog(a, 'test', 20);
	const unsure = prog(a, 'unsure', 20);
	const rows: {dir: Pt; label: string}[] = [
		{dir: [-1, 0], label: 'to the side'},
		{dir: [0, 0], label: 'at me'},
		{dir: [1, 0], label: 'to the side'},
	];
	return (
		<Reveal p={shown(a)}>
			<T x={a.w / 2} y={30} size={17} anchor="middle" italic>
				where is this face looking?
			</T>
			{rows.map((r, i) => {
				const x = 60 + i * 105;
				const p = Math.max(0, Math.min(1, test * 3 - i));
				return (
					<g key={i} opacity={p}>
						<Head x={x} y={92} r={30} look={[r.dir[0] * (0.7 + 0.3 * Math.sin(t * 2 + i)), 0]} hair="short" hairColor="#2E2722" skin="#C9A27A" seed={40 + i} />
						<text x={x} y={146} fontFamily={FELL} fontStyle="italic" fontSize={13} fill={BOOK.ink} textAnchor="middle">
							{r.label}
						</text>
					</g>
				);
			})}
			{/* the ambiguous one */}
			<g opacity={unsure}>
				<line x1={20} x2={a.w - 20} y1={168} y2={168} stroke={BOOK.ink} strokeWidth={0.8} opacity={0.4} />
				<g opacity={0.85}>
					<Head x={92} y={240} r={34} turn={0.35 * Math.sin(t * 1.3)} look={[0.25 * Math.sin(t * 2.1), 0]} lid={0.35} hair="short" hairColor="#2E2722" skin="#C9A27A" seed={50} />
				</g>
				<circle cx={92} cy={240} r={48} fill={BOOK.paper} opacity={0.35} />
				<Write text="unclear..." p={unsure} x={160} y={222} size={17} italic />
				<Write text="→ judged 'at me'" p={prog(a, 'unsure', 24, 18, false)} x={160} y={252} size={19} italic color={BOOK.terracotta} />
				<EyeIcon x={250} y={290} s={0.9} dir={[0, 0]} />
			</g>
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				after Mareschal, Calder & Clifford, 2013
			</text>
		</Reveal>
	);
};

/** fig. 7 — the two mistakes: missing a real stare vs imagining one. Events: left, right. */
export const SaferMistake: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const left = prog(a, 'left', 16);
	const right = prog(a, 'right', 16);
	const half = a.w / 2;
	return (
		<Reveal p={shown(a)}>
			<line x1={half} x2={half} y1={20} y2={a.h - 40} stroke={BOOK.ink} strokeWidth={1.4} strokeDasharray="6 6" />
			{/* left: walking on, unaware, while someone looms */}
			<g opacity={0.35 + 0.65 * left}>
				<T x={half / 2} y={36} size={19} anchor="middle">
					miss a real stare
				</T>
				<rect x={20} y={60} width={half - 40} height={250} fill={BOOK.nightDeep} opacity={0.25} />
				<g opacity={0.8}>
					<Figure x={80} y={250} s={0.55} turn={0.5} look={{top: BOOK.black, bottom: BOOK.black, shoes: BOOK.black, hair: 'short', hairColor: BOOK.black, skin: '#5A5149', collar: BOOK.black}} face={{look: [1, 0], worry: 0, raise: 0}} near={{hand: [40, -60]}} />
				</g>
				<Figure x={200} y={250} s={0.55} pose="walk" walk={t * 6} turn={0.7} look={MAIN} face={{look: [1, 0], smile: 0.3}} />
				<Write text="costly" p={left} x={half / 2} y={340} size={22} italic color={BOOK.terracotta} anchor="middle" />
			</g>
			{/* right: a glance around, nobody there */}
			<g opacity={0.35 + 0.65 * right}>
				<T x={half * 1.5} y={36} size={19} anchor="middle">
					imagine one
				</T>
				<Figure x={half + 150} y={250} s={0.55} turn={-0.4 + Math.sin(t * 2) * 0.3} look={MAIN} face={{turn: Math.sin(t * 2) * 0.9, look: [Math.sin(t * 2), 0], raise: 0.6}} near={{hand: [34, -40], grip: 'open'}} far={{hand: [-34, -40], grip: 'open'}} />
				<Write text="harmless" p={right} x={half * 1.5} y={340} size={22} italic color={BOOK.olive} anchor="middle" />
			</g>
			<text x={a.w - 10} y={a.h - 10} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				one proposed reason
			</text>
		</Reveal>
	);
};

/** fig. 8 — you turn, your movement catches their eye. Events: move, catch. */
export const CatchEye: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const move = prog(a, 'move', 16);
	const caught = prog(a, 'catch', 6);
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={300} wall="#C9C3B2" stripes={false} />
			<Figure x={110} y={236} s={0.8} pose="sit" seat={64} turn={0.4 - move * 1.2} look={MAIN} face={{turn: 0.4 - move * 1.3, look: move > 0.5 ? [-1, 0] : [1, 0.5]}} near={{hand: [40, -40]}} />
			{move > 0.1 && move < 1 && [0, 1, 2].map((i) => <Ink key={i} d={`M${150 + i * 8} ${110 + i * 12} q 14 10 0 24`} w={1.6} color={BOOK.terracotta} opacity={1 - move} second={false} />)}
			<Figure x={300} y={300 - 117 * 0.8} s={0.8} facing={-1} turn={0.5} look={STRANGER} near={{hand: [44, -60], grip: 'hold'}} face={{look: caught > 0.5 ? [1, -0.1] : [0.3, 1], raise: caught * 0.6}} />
			<g transform="translate(330 180) rotate(-14)">
				<Shape d={roughRect(-22, -14, 44, 28, 1131, 0.4)} color="#E9E1CF" w={1.4} />
			</g>
			{caught > 0 && <Ink d={roughLine(270, 128, 150, 120, 1132, 0.4)} w={1.4} dash="5 6" color={BOOK.terracotta} p={caught} second={false} />}
			<Write text="now they really are looking" p={prog(a, 'catch', 26, 6, false)} x={a.w / 2} y={36} size={18} italic color={BOOK.terracotta} anchor="middle" />
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				as Titchener suggested in 1898
			</text>
		</Reveal>
	);
};

/** fig. 9 — what memory keeps: one hit, a hundred forgotten misses. Events: hit, forget. */
export const Tally: React.FC = () => {
	const a = useArt();
	const hit = prog(a, 'hit', 16);
	const forget = prog(a, 'forget', 40);
	return (
		<Reveal p={shown(a)}>
			<g transform={`translate(${a.w / 2} ${a.h / 2 - 10}) rotate(-1.5) translate(${-a.w / 2 + 30} ${-a.h / 2 + 30})`}>
				<Shape d={roughRect(0, 0, a.w - 60, a.h - 80, 1141, 0.5)} color="#F6EEDC" w={1.6} />
				<text x={16} y={30} fontFamily={HAND} fontWeight={700} fontSize={18} fill={BOOK.ink}>
					times I felt watched:
				</text>
				<g opacity={0.3 + 0.7 * hit} transform={`translate(70 120) scale(${0.8 + 0.3 * hit})`}>
					<Ink d="M-30 0 L-8 22 L34 -30" w={7} color={BOOK.terracotta} second={false} />
					<text x={-10} y={56} fontFamily={HAND} fontWeight={700} fontSize={15} fill={BOOK.ink} textAnchor="middle">
						someone was looking!
					</text>
				</g>
				{Array.from({length: 24}, (_, i) => {
					const x = 170 + (i % 8) * 28;
					const y = 70 + Math.floor(i / 8) * 36;
					return (
						<g key={i} opacity={1 - forget * 0.85}>
							<Ink d={`M${x - 7} ${y - 7} L${x + 7} ${y + 7} M${x + 7} ${y - 7} L${x - 7} ${y + 7}`} w={2} color={BOOK.brown} second={false} />
						</g>
					);
				})}
				<text x={280} y={200} fontFamily={HAND} fontWeight={700} fontSize={14} fill={BOOK.brown} textAnchor="middle" opacity={1 - forget * 0.7}>
					nobody (forgotten)
				</text>
			</g>
		</Reveal>
	);
};

/** fig. 10 — back on the train, relaxed. */
export const Relax: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	return (
		<Reveal p={shown(a)}>
			<TrainInterior w={a.w} h={a.h} t={t} id="tb-train-3" />
			<Bench x={a.w / 2} y={300} w={360} />
			<Figure x={200} y={284} s={0.85} pose="sit" seat={70} turn={0.3} look={MAIN} near={{hand: [44, -70], grip: 'hold'}} far={{hand: [34, -66], grip: 'hold'}} face={{look: [0.5, 0.8], smile: 0.6, blink: blinking(a, 3.5)}} breath={Math.sin(t * 1.3) * 0.5 + 0.5} />
			<g transform="translate(236 222) rotate(-8)">
				<Shape d={roughRect(-24, -16, 48, 32, 1151, 0.4)} color={BOOK.terracotta} w={1.4} />
				<Ink d="M0 -16 L0 16" w={1} second={false} />
			</g>
			<Figure x={360} y={284} s={0.85} pose="sit" seat={70} turn={-0.6} look={FRIEND} face={{look: [-1, -0.3]}} near={{hand: [40, -40]}} />
			<Hand2 x={a.w / 2} y={36} lines={['just a careful brain']} size={18} color={BOOK.brown} />
		</Reveal>
	);
};

