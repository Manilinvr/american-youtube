import React from 'react';
import {FELL, HAND} from '../../fonts';
import {blinking, prog, shown, since, track, useArt} from '../context';
import {Head} from '../figures';
import {Ink, Reveal, Shape, T, Write} from '../ink';
import {BOOK} from '../palette';
import {Balance, HoneyBarrel, Pebble, Phone, RoomBG, SkyWindow, Snake} from '../props';
import {Figure, MAIN} from '../rig';
import {Pt, roughEllipse, roughRect, smooth} from '../rough';
import {toLocal} from './shared';

const GOOD = ['Love this! ♥', 'So good', 'Made my day', 'Amazing work!', 'Saved it ♥', 'Wow'];

/** A bed seen from the side, with the character sitting up against the headboard. */
const BedSitting: React.FC<{x: number; y: number; phoneLocal: Pt; face: object; t: number; lean?: number}> = ({x, y, phoneLocal, face, t, lean = -6}) => (
	<g>
		<Shape d={smooth([[x - 70, y + 70], [x - 70, y - 120], [x - 52, y - 140], [x - 34, y - 120], [x - 34, y + 70]], true)} color={BOOK.wood} hatch="light" />
		<Shape d={roughRect(x - 40, y + 6, 330, 40, 1201, 0.5)} color={BOOK.parchment} hatch="light" hatchOpacity={0.4} />
		<Shape d={roughRect(x - 46, y + 44, 346, 16, 1202, 0.4)} color={BOOK.woodDark} />
		<Shape d={smooth([[x - 36, y - 60], [x - 6, y - 74], [x + 10, y - 30], [x - 30, y - 6]], true)} color={BOOK.parchment} hatch="light" hatchOpacity={0.35} />
		<Figure x={x} y={y} pose="sit" seat={10} feet={{near: [110, 10], far: [100, 8]}} turn={0.25} lean={lean} look={MAIN} near={{hand: phoneLocal, grip: 'hold'}} far={{hand: [30, -30]}} face={face} breath={Math.sin(t * 1.3) * 0.5 + 0.5} />
		<Shape d={smooth([[x - 24, y - 2], [x + 60, y - 22], [x + 140, y - 18], [x + 290, y - 6], [x + 290, y + 30], [x - 30, y + 30]], true)} color={BOOK.blue} hatch="mid" hatchOpacity={0.5} />
	</g>
);

/** fig. 1 — the comments at midnight. Events: good, bad, midnight. */
export const Comments: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const good = since(a, 'good');
	const bad = prog(a, 'bad', 14);
	const mid = prog(a, 'midnight', 30);
	const bx = 270;
	const by = 360;
	const phoneLocal: Pt = [58, -92];
	const phoneAt: Pt = [bx + phoneLocal[0] * 1 + 4, by + phoneLocal[1] - 8];
	const fix = bad > 0.5 ? 1 : 0;
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={430} wall={BOOK.night} floor={BOOK.nightFloor} />
			<SkyWindow x={60} y={60} w={150} h={180} t={t} id="tb-cmt-win" />
			<Shape d={roughRect(560, 300, 90, 130, 1203, 0.5)} color={BOOK.wood} hatch="light" />
			<g transform="translate(605 290)">
				<Shape d={roughRect(-26, -20, 52, 30, 1204, 0.4)} color={BOOK.black} w={1.6} wear={false} />
				<text x={0} y={2} fontFamily={FELL} fontSize={18} fill={BOOK.glow} textAnchor="middle">
					{mid > 0.5 ? '12:00' : '11:41'}
				</text>
			</g>
			<circle cx={phoneAt[0]} cy={phoneAt[1]} r={90} fill="url(#tb-glow)" opacity={0.45} />
			<Phone x={phoneAt[0]} y={phoneAt[1]} s={0.5} rot={-20} glow={1} />
			<BedSitting x={bx} y={by} phoneLocal={phoneLocal} t={t} face={{look: [0.6, 0.3], worry: 0.3 + 0.7 * bad, lid: 0.15, blink: !fix && blinking(a, 3), smile: 0.4 * (1 - bad)}} />
			{/* the feed, enlarged beside the bed */}
			<g transform="translate(820 230)">
				<Shape d={roughRect(-118, -200, 236, 400, 1205, 0.5)} color={BOOK.black} w={2} wear={false} />
				<rect x={-106} y={-186} width={212} height={372} rx={4} fill="#EFE3C4" />
				{GOOD.map((txt, i) => {
					const p = good > 0 ? Math.max(0, Math.min(1, (good - i * 4) / 10)) : 0;
					const y = -160 + i * 46;
					return (
						<g key={i} opacity={p * (1 - mid * 0.75)}>
							<rect x={-96} y={y - 16} width={192} height={36} rx={6} fill={BOOK.parchment} stroke={BOOK.ink} strokeWidth={1} />
							<text x={-84} y={y + 6} fontFamily={HAND} fontWeight={700} fontSize={16} fill={BOOK.ink}>
								{txt}
							</text>
							<path d="M78 2 c-4 -7 -14 -3 -10 4 l10 8 l10 -8 c4 -7 -6 -11 -10 -4 z" transform={`translate(0 ${y - 4})`} fill={BOOK.terracotta} />
						</g>
					);
				})}
				{bad > 0 && (
					<g transform={`translate(0 ${126}) scale(${1 + mid * 0.25})`} opacity={bad}>
						<rect x={-100} y={-20} width={200} height={42} rx={6} fill="#E8D6C8" stroke={BOOK.terracotta} strokeWidth={2.4} />
						<text x={-88} y={6} fontFamily={HAND} fontWeight={700} fontSize={17} fill={BOOK.ink}>
							meh. kinda boring.
						</text>
					</g>
				)}
			</g>
		</Reveal>
	);
};

/** fig. 2 — a spoonful of tar in a barrel of honey. Events: tar, spoil. */
export const Barrel: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const dip = since(a, 'tar');
	const spoonY = track(dip, [[-30, -80], [0, 40], [20, 100], [40, 100], [60, 30]]);
	const tilt = track(dip, [[0, 0], [24, 50], [44, 50], [60, 0]]);
	const drop = dip > 18 && dip < 50 ? (dip - 18) / 32 : 0;
	const spread = prog(a, 'spoil', 60);
	const tar = Math.max(drop > 0.95 ? 0.15 : 0, spread);
	// a bee enjoys the honey, then leaves when the tar spreads
	const bee: Pt = [240 + Math.cos(t * 2.3) * 90 + spread * 200, 120 + Math.sin(t * 3.1) * 30 - spread * 80];
	return (
		<Reveal p={shown(a)}>
			<rect x={-10} y={300} width={a.w + 20} height={120} fill={BOOK.wood} opacity={0.5} />
			<HoneyBarrel x={240} y={220} tar={tar} t={t} />
			<g transform={`translate(${250} ${spoonY}) rotate(${tilt})`}>
				<Shape d={roughEllipse(0, 70, 18, 10, 1211, 0.4)} color="#B9B2A6" w={1.8} wear={false} />
				<ellipse cx={0} cy={70} rx={13} ry={6} fill={BOOK.black} opacity={dip > 30 ? 0.3 : 0.95} />
				<Shape d={roughRect(-4, -60, 8, 124, 1212, 0.3)} color="#B9B2A6" w={1.6} wear={false} />
			</g>
			{drop > 0 && <ellipse cx={258 + drop * 4} cy={180 + drop * 30} rx={5} ry={7 + drop * 4} fill={BOOK.black} />}
			<g transform={`translate(${bee[0]} ${bee[1]})`}>
				<ellipse cx={0} cy={0} rx={9} ry={6} fill={BOOK.ochre} stroke={BOOK.ink} strokeWidth={1.2} />
				<line x1={-2} x2={-2} y1={-6} y2={6} stroke={BOOK.ink} strokeWidth={1.6} />
				<line x1={3} x2={3} y1={-6} y2={6} stroke={BOOK.ink} strokeWidth={1.6} />
				<ellipse cx={-2} cy={-9} rx={6} ry={4 + Math.sin(t * 40) * 2} fill="#EFF3F1" stroke={BOOK.ink} strokeWidth={0.8} opacity={0.8} />
			</g>
			<Write text="a spoonful of tar..." p={prog(a, 'tar', 24, 0, false)} x={30} y={36} size={19} italic />
			<Write text="...spoils a barrel of honey" p={spread} x={a.w - 24} y={386} size={19} italic color={BOOK.terracotta} anchor="end" />
		</Reveal>
	);
};

/** fig. 4 — one dark pebble outweighs five golden ones (a metaphor). Event: weigh. */
export const Scale: React.FC = () => {
	const a = useArt();
	const s = since(a, 'weigh');
	const tilt = s > 0 ? -16 * (1 - Math.exp(-s / 8) * Math.cos(s / 4)) : 0;
	return (
		<Reveal p={shown(a)}>
			<Balance
				x={a.w / 2}
				y={80}
				tilt={tilt}
				left={<Pebble x={0} y={-10} r={13} bad />}
				right={
					<g>
						{[-24, -8, 8, 24, 0].map((px, i) => (
							<Pebble key={i} x={px} y={i === 4 ? -24 : -10} r={8} seed={840 + i} />
						))}
					</g>
				}
			/>
			<T x={a.w / 2} y={a.h - 22} size={13} italic anchor="middle" color={BOOK.brown}>
				a metaphor, not a measurement
			</T>
		</Reveal>
	);
};

/** fig. 5 — brain waves (schematic): unpleasant pictures, bigger response. Events: wave, bigger. */
export const EEG: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const w = prog(a, 'wave', 50, 0, false);
	const big = prog(a, 'bigger', 20);
	const trace = (amp: number, phase: number): string => {
		const pts: Pt[] = Array.from({length: 61}, (_, i) => {
			const x = i / 60;
			const bump = Math.exp(-Math.pow((x - 0.55) / 0.12, 2)) * amp;
			return [40 + x * 250 * w, 270 - bump * 70 - Math.sin(i * 1.7 + phase) * 2];
		});
		return smooth(pts);
	};
	const showDog = Math.floor(t / 1.2) % 2 === 0;
	return (
		<Reveal p={shown(a)}>
			<Head x={90} y={96} r={46} look={[1, 0]} hair="side" seed={61} />
			{/* electrode cap */}
			{[
				[-30, -30],
				[0, -44],
				[30, -30],
				[-40, -4],
				[40, -4],
			].map(([dx, dy], i) => (
				<g key={i}>
					<circle cx={90 + dx} cy={96 + dy} r={5} fill={BOOK.ochre} stroke={BOOK.ink} strokeWidth={1.2} />
					<Ink d={smooth([[90 + dx, 96 + dy], [150 + i * 8, 60 + i * 6], [200, 110 + i * 4]])} w={1} opacity={0.6} second={false} />
				</g>
			))}
			{/* the picture being shown */}
			<g transform="translate(250 90)">
				<Shape d={roughRect(-46, -40, 92, 80, 1221, 0.4)} color={BOOK.parchment} w={1.6} />
				{showDog ? (
					<g>
						<Shape d={roughEllipse(0, 6, 24, 18, 1222, 0.4)} color={BOOK.brown} w={1.4} />
						<path d="M-14 12 l6 -6 l6 6 l6 -6 l6 6" fill="none" stroke={BOOK.parchment} strokeWidth={2} />
						<text x={0} y={-22} fontFamily={HAND} fontSize={11} fill={BOOK.terracotta} textAnchor="middle">
							unpleasant
						</text>
					</g>
				) : (
					<g>
						{[0, 72, 144, 216, 288].map((r) => (
							<ellipse key={r} cx={0} cy={0} rx={6} ry={13} transform={`rotate(${r}) translate(0 -12)`} fill={BOOK.ochre} stroke={BOOK.ink} strokeWidth={1} />
						))}
						<circle cx={0} cy={0} r={6} fill={BOOK.terracotta} />
						<text x={0} y={-24} fontFamily={HAND} fontSize={11} fill={BOOK.olive} textAnchor="middle">
							pleasant
						</text>
					</g>
				)}
			</g>
			<Shape d={roughRect(30, 170, 270, 130, 1223, 0.4)} color="#EFE6D2" w={1.6} />
			<Ink d={trace(0.45, 0)} w={2.2} color={BOOK.olive} p={1} second={false} />
			<Ink d={trace(1, 2)} w={2.6} color={BOOK.terracotta} p={1} second={false} />
			{big > 0 && <Write text="unpleasant: bigger" p={big} x={170} y={190} size={14} italic color={BOOK.terracotta} anchor="middle" />}
			<text x={a.w - 10} y={a.h - 30} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.brown} textAnchor="end">
				schematic, after Ito et al., 1998
			</text>
		</Reveal>
	);
};

/** fig. 7 — an ancestor, berries, and a snake in the grass. Events: threat, snack. */
export const Ancestor: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const threat = prog(a, 'threat', 8);
	// walks toward the berries until the snake appears
	const sw = Math.max(0, since(a, 'line:why'));
	const stopAt = Number.isFinite(a.ev('threat')) ? a.ev('threat') - a.ev('line:why') : Infinity;
	const walkX = 90 + 1.1 * Math.min(sw, stopAt);
	const jump = threat > 0 ? Math.sin(Math.min(1, threat) * Math.PI) * 26 : 0;
	return (
		<Reveal p={shown(a)}>
			<rect x={-10} y={-10} width={a.w + 20} height={240} fill="#D9C08C" />
			<circle cx={480} cy={70} r={34} fill={BOOK.glow} opacity={0.8} />
			<rect x={-10} y={230} width={a.w + 20} height={170} fill="#A69A6A" />
			{Array.from({length: 40}, (_, i) => (
				<Ink key={i} d={`M${(i * 37) % a.w} ${236 + ((i * 13) % 120)} l-4 -14 M${(i * 37) % a.w} ${236 + ((i * 13) % 120)} l4 -12`} w={1.3} color={BOOK.olive} second={false} />
			))}
			{/* berry bush */}
			<Shape d={roughEllipse(470, 220, 70, 46, 1231, 1)} color={BOOK.olive} hatch="mid" />
			{[[440, 200], [470, 216], [500, 196], [486, 236], [452, 232]].map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={6} fill={BOOK.terracotta} stroke={BOOK.ink} strokeWidth={1} />
			))}
			<Snake x={320} y={300} s={0.9} t={t} />
			<Figure
				x={walkX}
				y={300 - 117 * 0.82 - jump}
				s={0.82}
				pose={threat > 0 ? 'stand' : 'walk'}
				walk={t * 6}
				turn={0.6}
				lean={-threat * 14}
				look={{top: '#A9774E', bottom: '#7A5D44', shoes: '#5E4735', collar: '#A9774E', hair: 'curly', hairColor: '#3A2E26', skin: '#B88E68'}}
				near={threat > 0.2 ? {hand: [40, -170], grip: 'open'} : undefined}
				far={threat > 0.2 ? {hand: [-10, -176], grip: 'open'} : undefined}
				face={{look: threat > 0.2 ? [1, 0.8] : [1, -0.2], raise: threat, talk: threat * 0.8, smile: 0.4 * (1 - threat)}}
			/>
			<Write text="miss a snack: hungry tonight" p={prog(a, 'snack', 26, 0, false)} x={a.w - 20} y={40} size={17} italic anchor="end" />
			<Write text="miss a snake: no tomorrow" p={prog(a, 'threat', 26, 10, false)} x={a.w - 20} y={66} size={17} italic color={BOOK.terracotta} anchor="end" />
			<text x={a.w - 10} y={a.h - 12} fontFamily={FELL} fontStyle="italic" fontSize={12} fill={BOOK.ink} textAnchor="end">
				one explanation
			</text>
		</Reveal>
	);
};

const DOMAINS = ['relationships', 'feedback', 'first impressions', 'memory'];

/** fig. 8 — a review of the research, domain by domain. Events: d1..d4. */
export const Review: React.FC = () => {
	const a = useArt();
	return (
		<Reveal p={shown(a)}>
			<g transform={`translate(${a.w / 2} ${a.h / 2}) rotate(1.2) translate(-150 -150)`}>
				<rect x={6} y={8} width={300} height={290} fill={BOOK.black} opacity={0.18} />
				<Shape d={roughRect(0, 0, 300, 290, 1241, 0.5)} color="#F6EEDC" w={1.6} />
				<text x={150} y={36} fontFamily={FELL} fontStyle="italic" fontSize={19} fill={BOOK.ink} textAnchor="middle">
					Bad is stronger than good
				</text>
				<text x={150} y={58} fontFamily={FELL} fontSize={13} fill={BOOK.brown} textAnchor="middle">
					Baumeister et al., 2001 · a review
				</text>
				<line x1={20} x2={280} y1={70} y2={70} stroke={BOOK.ink} strokeWidth={1} />
				{DOMAINS.map((d, i) => {
					const p = prog(a, `d${i + 1}`, 14);
					const y = 108 + i * 46;
					return (
						<g key={d}>
							<Shape d={roughRect(24, y - 16, 22, 22, 1242 + i, 0.4)} color={BOOK.parchment} w={1.4} wear={false} />
							{p > 0 && <Ink d={`M28 ${y - 5} L34 ${y + 2} L50 ${y - 18}`} w={3} color={BOOK.terracotta} p={p} second={false} />}
							<text x={62} y={y} fontFamily={HAND} fontWeight={700} fontSize={19} fill={BOOK.ink} opacity={0.4 + 0.6 * p}>
								{d}
							</text>
						</g>
					);
				})}
			</g>
		</Reveal>
	);
};

/** fig. 9 — rereading the kind comments; hearts float up. Event: read. */
export const Reread: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const read = prog(a, 'read', 30);
	const bx = 150;
	const by = 236;
	const phoneLocal: Pt = [58, -92];
	return (
		<Reveal p={shown(a)}>
			<RoomBG w={a.w} h={a.h} floorY={300} wall={BOOK.night} floor={BOOK.nightFloor} />
			<circle cx={bx + 62} cy={by - 100} r={80} fill="url(#tb-glow)" opacity={0.5} />
			<Phone x={bx + 62} y={by - 100} s={0.45} rot={-20} glow={1} />
			<g transform={`translate(0 0)`}>
				<BedSitting x={bx} y={by} phoneLocal={phoneLocal} t={t} lean={-4} face={{look: [0.6, 0.3], smile: 0.2 + 0.8 * read, lid: 0.2, blink: blinking(a, 3.2)}} />
			</g>
			{Array.from({length: 7}, (_, i) => {
				const k = (t * 0.45 + i / 7) % 1;
				const x = bx + 70 + Math.sin(k * 6 + i) * 24 + i * 14;
				const y = by - 120 - k * 150;
				return <path key={i} d="M0 0 c-6 -10 -20 -4 -14 6 l14 12 l14 -12 c6 -10 -8 -16 -14 -6 z" transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * read})`} fill={BOOK.terracotta} stroke={BOOK.ink} strokeWidth={1} opacity={read * Math.sin(k * Math.PI)} />;
			})}
		</Reveal>
	);
};

/** fig. 10 — choosing what to keep: adding golden pebbles until the scale levels. Event: keep. */
export const Keep: React.FC = () => {
	const a = useArt();
	const t = a.f / a.fps;
	const sk = since(a, 'keep');
	const added = sk > 0 ? Math.min(6, Math.floor(sk / 14)) : 0;
	const tilt = -16 + added * 2.7;
	const reach = sk > 0 && added < 6 ? (sk % 14) / 14 : 0;
	const fx = 120;
	const fy = 300 - 117 * 0.85;
	const panR: Pt = [a.w / 2 + 40 + 110, 60 + 110 * Math.sin((tilt * Math.PI) / 180) + 52];
	const hand = toLocal(fx, fy, 0.85, 1, [panR[0] - 30 - (1 - Math.sin(reach * Math.PI)) * 40, panR[1] - 10 + (1 - Math.sin(reach * Math.PI)) * 30]);
	return (
		<Reveal p={shown(a)}>
			<Balance
				x={a.w / 2 + 40}
				y={60}
				tilt={tilt}
				left={<Pebble x={0} y={-10} r={13} bad />}
				right={
					<g>
						{Array.from({length: 5 + added}, (_, i) => (
							<Pebble key={i} x={-26 + (i % 5) * 13} y={-10 - Math.floor(i / 5) * 12} r={7} seed={850 + i} />
						))}
					</g>
				}
			/>
			<Figure x={fx} y={fy} s={0.85} turn={0.7} look={MAIN} near={{hand, grip: 'hold'}} face={{look: [1, -0.2], smile: 0.4 + added * 0.08, blink: blinking(a, 3)}} breath={Math.sin(t * 1.5) * 0.5 + 0.5} />
			{reach > 0 && <Pebble x={toPanel(fx, fy, hand)[0] + 4} y={toPanel(fx, fy, hand)[1] - 4} r={7} seed={870} />}
			<line x1={-10} x2={a.w + 10} y1={300} y2={300} stroke={BOOK.ink} strokeWidth={1.6} />
		</Reveal>
	);
};

const toPanel = (fx: number, fy: number, p: Pt): Pt => [fx + p[0] * 0.85, fy + p[1] * 0.85];

