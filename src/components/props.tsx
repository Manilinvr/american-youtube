import React from 'react';
import {HAND} from '../fonts';
import {HIGHLIGHT, INK, LINE, PAPER_LIGHT as PAPER, PENCIL} from '../theme';
import {Circ, Ell, P, Rect} from './ink';

/**
 * Line-art furniture and objects. Coordinates: bottom-centre of the object at (0, 0), y grows
 * downward, a person is 400 units tall. `elevation` lifts wall-mounted things off the floor.
 * Add an object by adding an entry to PROPS; scripts reference it by name.
 */
export type PropOpts = {open?: number; text?: string; frame: number};
type PropDef = {w: number; h: number; elevation?: number; draw: (o: PropOpts) => React.ReactNode};

const shelfLines = (x: number, y: number, w: number, n: number, gap: number) =>
	Array.from({length: n}, (_, i) => <P key={i} d={`M${x} ${y + i * gap} L${x + w} ${y + i * gap}`} strokeWidth={LINE * 0.7} />);

export const PROPS: Record<string, PropDef> = {
	door: {
		w: 190,
		h: 460,
		draw: ({open = 0}) => {
			const panelW = 170 * (1 - open * 0.8);
			return (
				<g>
					<Rect x={-95} y={-460} width={190} height={460} fill={PAPER} />
					{open > 0 && <rect x={-85} y={-450} width={170} height={450} fill="#2A2A2A" opacity={0.85} />}
					<g>
						<P d={`M-85 -450 L${-85 + panelW} ${-450 + open * 30} L${-85 + panelW} ${-open * 30} L-85 0Z`} fill={PAPER} />
						<Rect x={-85 + panelW * 0.14} y={-415} width={panelW * 0.72} height={160} rx={6} strokeWidth={LINE * 0.7} />
						<Rect x={-85 + panelW * 0.14} y={-225} width={panelW * 0.72} height={180} rx={6} strokeWidth={LINE * 0.7} />
						<Circ cx={-85 + panelW * 0.86} cy={-225} r={10} fill={PAPER} />
					</g>
				</g>
			);
		},
	},
	fridge: {
		w: 180,
		h: 410,
		draw: ({open = 0, frame}) => (
			<g>
				<Rect x={-90} y={-410} width={180} height={410} rx={16} fill={PAPER} />
				{open > 0 && (
					<g>
						<rect x={-82} y={-402} width={164} height={394} rx={10} fill={HIGHLIGHT} opacity={0.35 + 0.05 * Math.sin(frame / 3)} />
						{shelfLines(-82, -330, 164, 4, 80)}
						<Circ cx={-40} cy={-350} r={16} />
						<Rect x={10} y={-280} width={40} height={56} rx={6} />
					</g>
				)}
				<P d={`M-90 -290 L90 -290`} />
				{open < 1 && (
					<g>
						<P d={`M90 -410 L${90 - 180 * (1 - open)} ${-410 - open * 20} L${90 - 180 * (1 - open)} ${open * 20} L90 0`} fill={open > 0 ? PAPER : 'none'} />
						<P d={`M${90 - 180 * (1 - open) + 22 * (1 - open)} -330 L${90 - 180 * (1 - open) + 22 * (1 - open)} -300`} strokeWidth={LINE * 1.6} />
						<P d={`M${90 - 180 * (1 - open) + 22 * (1 - open)} -250 L${90 - 180 * (1 - open) + 22 * (1 - open)} -190`} strokeWidth={LINE * 1.6} />
					</g>
				)}
				{open === 0 && (
					<g>
						<Circ cx={30} cy={-360} r={10} />
						<Rect x={-50} y={-220} width={40} height={30} rx={3} strokeWidth={LINE * 0.6} />
					</g>
				)}
			</g>
		),
	},
	window: {
		w: 210,
		h: 230,
		elevation: 210,
		draw: () => (
			<g>
				<Rect x={-105} y={-230} width={210} height={230} rx={4} fill={PAPER} />
				<P d="M0 -230 L0 0 M-105 -115 L105 -115" />
				<P d="M-80 -165 Q-70 -185 -50 -178 Q-40 -195 -22 -180 Q-10 -178 -14 -164Z" stroke={PENCIL} strokeWidth={LINE * 0.6} />
				<P d="M-115 0 L115 0" strokeWidth={LINE * 1.4} />
			</g>
		),
	},
	couch: {
		w: 400,
		h: 180,
		draw: () => (
			<g>
				<P d="M-170 -60 L-170 -170 Q-170 -180 -160 -180 L160 -180 Q170 -180 170 -170 L170 -60" fill={PAPER} />
				<P d="M-200 -10 L-200 -110 Q-200 -125 -185 -125 Q-165 -125 -165 -105 L-165 -70 L165 -70 L165 -105 Q165 -125 185 -125 Q200 -125 200 -110 L200 -10Z" fill={PAPER} />
				<P d="M0 -70 L0 -175 M-165 -40 L165 -40" strokeWidth={LINE * 0.7} />
				<P d="M-185 -10 L-185 0 M185 -10 L185 0" strokeWidth={LINE * 1.4} />
			</g>
		),
	},
	bed: {
		w: 440,
		h: 200,
		draw: () => (
			<g>
				<P d="M-220 0 L-220 -200 M-220 -110 L220 -110 L220 0" fill="none" />
				<Rect x={-220} y={-110} width={440} height={60} rx={8} fill={PAPER} />
				<Ell cx={-160} cy={-128} rx={52} ry={22} fill={PAPER} />
				<P d="M-110 -112 Q20 -150 215 -115 L215 -50 L-110 -50Z" fill={PAPER} />
			</g>
		),
	},
	desk: {
		w: 320,
		h: 270,
		draw: () => (
			<g>
				<P d="M-160 -190 L160 -190 M-145 -190 L-145 0 M145 -190 L145 0" />
				<P d="M-60 -196 L60 -196 L72 -205 L-48 -205Z" fill={PAPER} />
				<P d="M-44 -205 L-58 -280 L52 -280 L66 -205" fill={PAPER} />
				<Circ cx={4} cy={-245} r={8} strokeWidth={LINE * 0.6} />
			</g>
		),
	},
	plant: {
		w: 100,
		h: 210,
		draw: () => (
			<g>
				<P d="M-40 -80 L40 -80 L30 0 L-30 0Z" fill={PAPER} />
				<P d="M0 -80 Q-10 -150 -50 -190 M0 -80 Q8 -160 30 -205 M0 -80 Q20 -120 55 -140" />
				<P d="M-50 -190 Q-30 -170 -20 -140 M30 -205 Q45 -180 25 -160 M55 -140 Q40 -125 22 -118" strokeWidth={LINE * 0.7} />
			</g>
		),
	},
	lamp: {
		w: 110,
		h: 390,
		draw: () => (
			<g>
				<P d="M0 0 L0 -310 M-40 0 L40 0" />
				<P d="M-50 -300 L50 -300 L32 -390 L-32 -390Z" fill={PAPER} />
			</g>
		),
	},
	picture: {
		w: 150,
		h: 110,
		elevation: 260,
		draw: () => (
			<g>
				<Rect x={-75} y={-110} width={150} height={110} fill={PAPER} />
				<P d="M-60 -15 L-25 -65 L5 -30 L25 -50 L60 -15" strokeWidth={LINE * 0.7} />
				<Circ cx={35} cy={-80} r={10} strokeWidth={LINE * 0.7} />
			</g>
		),
	},
	clock: {
		w: 100,
		h: 100,
		elevation: 330,
		draw: ({frame}) => (
			<g>
				<Circ cx={0} cy={-50} r={48} fill={PAPER} />
				<P d={`M0 -50 L${Math.sin(frame / 20) * 32} ${-50 - Math.cos(frame / 20) * 32}`} />
				<P d="M0 -50 L18 -40" />
			</g>
		),
	},
	tv: {
		w: 270,
		h: 250,
		draw: () => (
			<g>
				<P d="M-110 0 L110 0 L110 -60 L-110 -60Z" fill={PAPER} />
				<Rect x={-135} y={-250} width={270} height={170} rx={10} fill={PAPER} />
				<P d="M-20 -80 L-30 -60 M20 -80 L30 -60" />
			</g>
		),
	},
	tree: {
		w: 280,
		h: 540,
		draw: () => (
			<g>
				<P d="M-22 0 Q-14 -120 -18 -230 L18 -230 Q14 -120 22 0" fill={PAPER} />
				<P d="M-90 -260 Q-150 -300 -110 -360 Q-140 -440 -60 -460 Q-30 -540 40 -500 Q120 -520 120 -440 Q170 -380 120 -320 Q140 -250 60 -240 Q0 -200 -40 -240 Q-80 -220 -90 -260Z" fill={PAPER} />
			</g>
		),
	},
	bench: {
		w: 340,
		h: 150,
		draw: () => (
			<g>
				<P d="M-170 -70 L170 -70 M-160 -100 L160 -100 M-160 -150 L160 -150" />
				<P d="M-140 -70 L-140 0 M140 -70 L140 0 M-140 -150 L-140 -70 M140 -150 L140 -70" />
			</g>
		),
	},
	car: {
		w: 520,
		h: 200,
		draw: ({frame}) => (
			<g>
				<P d="M-250 -40 L-250 -100 Q-245 -120 -200 -125 L-130 -130 L-70 -195 L110 -195 L180 -130 L235 -120 Q255 -110 255 -80 L255 -40Z" fill={PAPER} />
				<P d="M-110 -130 L-62 -180 L10 -180 L10 -130Z M30 -130 L30 -180 L100 -180 L150 -130Z" strokeWidth={LINE * 0.7} />
				{[-150, 160].map((x) => (
					<g key={x} transform={`translate(${x} -40) rotate(${frame * 12})`}>
						<Circ cx={0} cy={0} r={40} fill={PAPER} />
						<Circ cx={0} cy={0} r={14} />
						<P d="M0 -14 L0 -36" strokeWidth={LINE * 0.6} />
					</g>
				))}
			</g>
		),
	},
	'phone-big': {
		w: 280,
		h: 500,
		draw: ({text}) => (
			<g>
				<Rect x={-140} y={-500} width={280} height={500} rx={36} fill={PAPER} />
				<Rect x={-120} y={-470} width={240} height={430} rx={14} strokeWidth={LINE * 0.7} />
				<P d="M-30 -484 L30 -484" />
				{text && (
					<foreignObject x={-110} y={-440} width={220} height={150}>
						<div style={{fontFamily: HAND, fontWeight: 700, fontSize: 30, lineHeight: 1.1, color: INK, border: `3px solid ${INK}`, borderRadius: 14, padding: '8px 10px', background: PAPER}}>{text}</div>
					</foreignObject>
				)}
			</g>
		),
	},
};

export const PropArt: React.FC<{name: string} & PropOpts> = ({name, ...opts}) => {
	const def = PROPS[name];
	if (!def) {
		return (
			<text x={0} y={-20} textAnchor="middle" fontSize={40} fill="red">
				? {name}
			</text>
		);
	}
	return <g transform={`translate(0 ${-(def.elevation ?? 0)})`}>{def.draw(opts)}</g>;
};
