import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {HAND, MARKER, TYPE} from '../fonts';
import {INK, LINE, PAPER_LIGHT, RED} from '../theme';
import {P} from './ink';
import {Person} from './Person';

/**
 * Field-journal pieces that make the channel recognisable:
 *  - SpecimenCard: the taped index card naming the "species" of the episode
 *  - Stamp: the red "PERFECTLY HUMAN" rubber stamp that ends every episode
 *  - Jar: the specimen jar with a little human inside (the channel mascot)
 */
export type CardSpec = {no: string | number; common: string; latin: string; habitat?: string; at?: number};

const Tape: React.FC<{left: number; top: number; rot: number; w: number}> = ({left, top, rot, w}) => (
	<div style={{position: 'absolute', left, top, width: w, height: w * 0.32, background: 'rgba(222, 205, 160, 0.75)', transform: `rotate(${rot}deg)`, boxShadow: '0 1px 2px rgba(0,0,0,0.12)'}} />
);

/** Taped index card. `width` in px; it lays itself out from that. `slam` (0-1) drives the entrance. */
export const SpecimenCard: React.FC<{spec: CardSpec; x: number; y: number; width: number; slam?: number; stamp?: number; stampText?: string}> = ({
	spec,
	x,
	y,
	width,
	slam = 1,
	stamp = 0,
	stampText = 'PERFECTLY HUMAN',
}) => {
	const u = width / 900;
	const no = String(spec.no).padStart(3, '0');
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width,
				transform: `rotate(${-1.5 + (1 - slam) * 8}deg) scale(${1 + (1 - slam) * 0.4})`,
				opacity: Math.min(1, slam * 3),
				transformOrigin: '50% 0%',
			}}
		>
			<div
				style={{
					position: 'relative',
					background: '#FBF7EC',
					border: `${3 * u}px solid ${INK}`,
					borderRadius: 6 * u,
					boxShadow: `0 ${8 * u}px ${18 * u}px rgba(60,40,10,0.18)`,
					padding: `${26 * u}px ${40 * u}px ${30 * u}px`,
					backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent ${62 * u}px, rgba(90,140,200,0.25) ${62 * u}px, rgba(90,140,200,0.25) ${64 * u}px)`,
					backgroundPosition: `0 ${70 * u}px`,
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: TYPE, fontSize: 40 * u, color: INK, borderBottom: `${3 * u}px solid rgba(200,55,45,0.7)`, paddingBottom: 8 * u}}>
					<span>SPECIMEN No. {no}</span>
					<span style={{opacity: 0.6}}>field journal</span>
				</div>
				<div style={{fontFamily: MARKER, fontSize: 92 * u, lineHeight: 1.05, color: INK, marginTop: 14 * u}}>{spec.common}</div>
				<div style={{fontFamily: HAND, fontSize: 52 * u, fontStyle: 'italic', color: INK, marginTop: 4 * u}}>{spec.latin}</div>
				{spec.habitat && <div style={{fontFamily: TYPE, fontSize: 34 * u, color: INK, opacity: 0.75, marginTop: 6 * u}}>habitat: {spec.habitat}</div>}
				{stamp > 0 && <Stamp text={stampText} size={86 * u} p={stamp} style={{position: 'absolute', right: 30 * u, bottom: 24 * u}} />}
			</div>
			<Tape left={-20 * u} top={-18 * u} rot={-28} w={150 * u} />
			<Tape left={width - 130 * u} top={-18 * u} rot={24} w={150 * u} />
		</div>
	);
};

/** Red rubber stamp. `p` 0-1: slams down from above. */
export const Stamp: React.FC<{text: string; size: number; p: number; style?: React.CSSProperties}> = ({text, size, p, style}) => (
	<div
		style={{
			fontFamily: MARKER,
			fontSize: size,
			lineHeight: 1,
			color: RED,
			border: `${size * 0.09}px solid ${RED}`,
			borderRadius: size * 0.16,
			padding: `${size * 0.12}px ${size * 0.25}px`,
			transform: `rotate(-12deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`,
			opacity: interpolate(p, [0, 0.3, 1], [0, 0.9, 0.88]),
			mixBlendMode: 'multiply',
			whiteSpace: 'nowrap',
			// worn ink: speckle the stamp like real rubber on paper
			WebkitMaskImage: 'radial-gradient(circle at 30% 40%, black 60%, rgba(0,0,0,0.75) 100%)',
			...style,
		}}
	>
		{text}
	</div>
);

/** Spring helper for card slams and stamps that start at `at`. */
export const useSlam = (at: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return at <= 0 ? 1 : spring({frame: frame - at, fps, config: {damping: 13, stiffness: 240, mass: 0.7}});
};

/**
 * Specimen jar with a tiny human inside (the mascot). Bottom-centre at (0, 0), ~300 x 430 units.
 * `label` is written on the jar's paper tag.
 */
export const Jar: React.FC<{label?: string; face?: 'smile' | 'grin' | 'confused' | 'smug' | 'surprised'; pose?: 'wave' | 'stand' | 'shrug' | 'point'}> = ({label = 'YOU', face = 'smile', pose = 'wave'}) => {
	const clip = `jar${React.useId().replace(/:/g, '')}`;
	const body = 'M-130 -330 Q-150 -320 -150 -290 L-150 -30 Q-150 0 -120 0 L120 0 Q150 0 150 -30 L150 -290 Q150 -320 130 -330Z';
	return (
		<g>
			<clipPath id={clip}>
				<path d={body} />
			</clipPath>
			<path d={body} fill="#E9EEEC" opacity={0.55} />
			<g clipPath={`url(#${clip})`}>
				<g transform="translate(0 -6) scale(0.72)">
					<Person pose={pose} face={face} />
				</g>
			</g>
			<P d={body} strokeWidth={LINE * 1.2} />
			{/* glass highlights */}
			<P d="M-118 -280 L-118 -60" stroke="#FFFFFF" strokeWidth={LINE * 2} sketch={false} opacity={0.8} />
			<P d="M-100 -300 L-100 -250" stroke="#FFFFFF" strokeWidth={LINE * 1.4} sketch={false} opacity={0.8} />
			{/* neck + lid */}
			<P d="M-130 -330 L-130 -350 L130 -350 L130 -330" fill={PAPER_LIGHT} />
			<P d="M-148 -350 L148 -350 L148 -410 Q148 -420 138 -420 L-138 -420 Q-148 -420 -148 -410Z" fill="url(#hatch-dark)" />
			{Array.from({length: 7}, (_, i) => (
				<P key={i} d={`M${-110 + i * 37} -350 L${-110 + i * 37} -420`} stroke="#8A8174" strokeWidth={LINE * 0.6} sketch={false} />
			))}
			{/* paper tag */}
			<g transform="rotate(-6 0 -95)">
				<P d="M-95 -130 L95 -130 L95 -55 L-95 -55Z" fill="#FBF7EC" strokeWidth={LINE * 0.9} />
				<text x={0} y={-80} textAnchor="middle" fontFamily={MARKER} fontSize={label.length > 6 ? 30 : 46} fill={INK}>
					{label}
				</text>
			</g>
		</g>
	);
};
