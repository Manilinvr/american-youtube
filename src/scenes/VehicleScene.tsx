import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {useCueFrame, useScene} from '../context';
import {Backdrop, Setting} from '../components/Backdrop';
import {Character} from '../components/Character';
import {Sfx} from '../components/Sfx';
import {Title} from '../components/Title';
import type {Visual} from '../types';
import {useStage} from './stage';

type VehicleStyle = {body: string; stripe: string; lights: [string, string]; label?: string; ladder?: boolean};

const VEHICLES: Record<string, VehicleStyle> = {
	firetruck: {body: '#D62828', stripe: '#FFFFFF', lights: ['#FF2D2D', '#FFFFFF'], ladder: true},
	ambulance: {body: '#FFFFFF', stripe: '#E63946', lights: ['#FF2D2D', '#3A86FF'], label: 'AMBULANCE'},
	police: {body: '#1D1D1D', stripe: '#FFFFFF', lights: ['#FF2D2D', '#3A86FF'], label: 'POLICE'},
	bus: {body: '#FFC300', stripe: '#1D1D1D', lights: ['#FFC300', '#FFC300'], label: 'SCHOOL BUS'},
};

/** Side view of a big vehicle, drawn in a 1000x440 box. */
const Vehicle: React.FC<{kind: string; frame: number; width: number}> = ({kind, frame, width}) => {
	const v = VEHICLES[kind] ?? VEHICLES.firetruck;
	const flash = Math.floor(frame / 4) % 2 === 0;
	const spin = frame * 25;
	return (
		<svg viewBox="0 0 1000 440" width={width} height={(width * 440) / 1000} style={{overflow: 'visible'}}>
			<path d="M40 360 L40 210 Q40 120 120 110 L310 110 L310 360Z" fill={v.body} stroke="#1D1A1F" strokeWidth="8" />
			<path d="M70 210 Q72 145 125 140 L200 140 L200 220 L70 220Z" fill="#BDE0FE" stroke="#1D1A1F" strokeWidth="6" />
			<rect x="215" y="140" width="80" height="80" rx="10" fill="#BDE0FE" stroke="#1D1A1F" strokeWidth="6" />
			<rect x="300" y="130" width="680" height="230" rx="16" fill={v.body} stroke="#1D1A1F" strokeWidth="8" />
			<rect x="40" y="280" width="940" height="26" fill={v.stripe} />
			{[340, 500, 660, 820].map((x) => (
				<rect key={x} x={x} y="160" width="140" height="100" rx="10" fill="none" stroke="#1D1A1F" strokeOpacity="0.35" strokeWidth="6" />
			))}
			{v.label && (
				<text x="640" y="235" textAnchor="middle" fontSize="64" fontWeight="900" fill={v.stripe} fontFamily="Arial Black, Arial">
					{v.label}
				</text>
			)}
			{v.ladder && (
				<g stroke="#C9CED6" strokeWidth="10">
					<line x1="320" y1="96" x2="990" y2="96" />
					<line x1="320" y1="120" x2="990" y2="120" />
					{Array.from({length: 17}, (_, i) => (
						<line key={i} x1={330 + i * 40} y1="96" x2={330 + i * 40} y2="120" />
					))}
				</g>
			)}
			<rect x="120" y="84" width="60" height="28" rx="8" fill={flash ? v.lights[0] : v.lights[1]} stroke="#1D1A1F" strokeWidth="5" />
			<rect x="185" y="84" width="60" height="28" rx="8" fill={flash ? v.lights[1] : v.lights[0]} stroke="#1D1A1F" strokeWidth="5" />
			{flash && <circle cx="150" cy="98" r="70" fill={v.lights[0]} opacity="0.25" />}
			<rect x="20" y="330" width="60" height="30" rx="8" fill="#9AA5B1" stroke="#1D1A1F" strokeWidth="5" />
			{[160, 660, 860].map((x) => (
				<g key={x} transform={`translate(${x} 370) rotate(${spin})`}>
					<circle r="62" fill="#1D1A1F" />
					<circle r="30" fill="#C9CED6" />
					<rect x="-6" y="-30" width="12" height="60" fill="#8A8FA8" />
				</g>
			))}
		</svg>
	);
};

/**
 * A vehicle races past (siren, speed lines, camera shake), then the character pops up pointing.
 * visual: { type: "vehicle", vehicle: "firetruck" | "ambulance" | "police" | "bus", setting, title, charCue }
 */
export const VehicleScene: React.FC<{visual: Visual}> = ({visual}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {durationInFrames, lead} = useScene();
	const {width, height, vertical, ground, charHeight} = useStage();
	const passEnd = Math.round(durationInFrames * 0.62);
	const truckW = vertical ? width * 1.25 : width * 0.75;
	const x = interpolate(frame, [0, passEnd], [width + 60, -truckW - 60], {extrapolateRight: 'clamp'});
	const bounce = Math.abs(Math.sin(frame * 0.9)) * 8;
	const shake = frame < passEnd ? Math.sin(frame * 3.1) * 6 : 0;
	const charAt = useCueFrame(visual.charCue ?? 'remember', passEnd - 4);
	const pop = spring({frame: frame - charAt, fps, config: {damping: 11, stiffness: 170}});
	const truckTop = ground - (truckW * 440) / 1000 + truckW * 0.02;

	return (
		<AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.5}px)`}}>
			<Backdrop setting={(visual.setting as Setting) ?? 'city'} drift={2.5} />
			{frame < passEnd &&
				Array.from({length: 7}, (_, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x + truckW * (0.9 + ((frame * 0.07 + i * 0.13) % 0.4)),
							top: truckTop + 60 + i * ((truckW * 0.32) / 7),
							width: 160 + (i % 3) * 80,
							height: 12,
							borderRadius: 6,
							background: '#FFFFFF',
							opacity: 0.6,
						}}
					/>
				))}
			<div style={{position: 'absolute', left: x, top: truckTop - bounce}}>
				<Vehicle kind={visual.vehicle ?? 'firetruck'} frame={frame} width={truckW} />
			</div>
			{pop > 0.01 && (
				<div
					style={{
						position: 'absolute',
						left: width / 2 - (charHeight * 600) / 780 / 2,
						top: ground - charHeight,
						transform: `translateY(${(1 - pop) * height * 0.5}px)`,
					}}
				>
					<Character height={charHeight} pose="point" expression="smirk" look={{x: 0.4, y: 0.2}} />
				</div>
			)}
			{visual.title && <Title text={visual.title} delay={charAt} />}
			<Sfx name="siren" at={Math.max(0, lead - 4)} volume={0.22} />
			<Sfx name="whoosh" at={passEnd * 0.45} volume={0.4} />
		</AbsoluteFill>
	);
};
