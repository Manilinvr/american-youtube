import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useEpisode, useMouth} from '../context';
import {getOutfit, Hat, OUTFITS} from './outfits';

export type Pose = 'idle' | 'shrug' | 'point' | 'cheer' | 'wave' | 'hold';
export type Expression = 'happy' | 'smirk' | 'surprised' | 'sleepy' | 'serious' | 'worried';

type Props = {
	/** Rendered height in px (feet to top of head). */
	height: number;
	pose?: Pose;
	expression?: Expression;
	/** Profession outfit; defaults to the episode's character. */
	outfit?: string;
	/** Which outfit parts are on; missing parts fall back to casual clothes (used for "gearing up"). */
	wear?: {hat?: boolean; coat?: boolean; legs?: boolean};
	/** Mouth follows the voice line of the current scene. */
	talking?: boolean;
	/** Pupils offset, -1..1 on each axis. */
	look?: {x: number; y: number};
	style?: React.CSSProperties;
};

const ARM = {len: 165, width: 42};

const poseAngles = (pose: Pose, t: number, energy: number): [number, number] => {
	const sway = Math.sin(t * 2.2) * 3 * energy;
	switch (pose) {
		case 'shrug':
			return [64 + sway, 64 - sway];
		case 'cheer':
			return [150 + Math.sin(t * 9) * 8 * energy, 150 + Math.sin(t * 9 + 1) * 8 * energy];
		case 'point':
			return [10 + sway, 96];
		case 'wave':
			return [10 + sway, 145 + Math.sin(t * 10) * 18];
		case 'hold':
			return [38, 38];
		default:
			return [9 + sway, 9 - sway];
	}
};

const Brows: React.FC<{expression: Expression}> = ({expression}) => {
	const shapes: Record<Expression, [number, number, number, number]> = {
		// [leftY, leftAngle, rightY, rightAngle]
		happy: [200, -6, 200, 6],
		smirk: [188, -10, 204, 4],
		surprised: [178, -4, 178, 4],
		sleepy: [214, 0, 214, 0],
		serious: [206, 14, 206, -14],
		worried: [200, -16, 200, 16],
	};
	const [ly, la, ry, ra] = shapes[expression];
	return (
		<g fill="#2A1B12">
			<rect x="128" y={ly} width="54" height="12" rx="6" transform={`rotate(${la} 155 ${ly + 6})`} />
			<rect x="218" y={ry} width="54" height="12" rx="6" transform={`rotate(${ra} 245 ${ry + 6})`} />
		</g>
	);
};

const Eyes: React.FC<{expression: Expression; frame: number; fps: number; look: {x: number; y: number}}> = ({expression, frame, fps, look}) => {
	if (expression === 'sleepy') {
		return (
			<g stroke="#1D1A1F" strokeWidth="8" strokeLinecap="round" fill="none">
				<path d="M132 258 Q155 272 178 258" />
				<path d="M222 258 Q245 272 268 258" />
			</g>
		);
	}
	const period = Math.round(fps * 3.1);
	const k = frame % period;
	const blink = k < 5 ? [1, 0.45, 0.08, 0.45, 1][k] : 1;
	const big = expression === 'surprised';
	const rx = big ? 30 : 26;
	const ry = (big ? 36 : 30) * blink;
	const pr = big ? 11 : 14;
	const px = look.x * 8;
	const py = look.y * 8;
	return (
		<g>
			{[155, 245].map((cx) => (
				<g key={cx}>
					<ellipse cx={cx} cy={258} rx={rx} ry={ry} fill="#FFFFFF" stroke="#1D1A1F" strokeWidth="5" />
					{blink > 0.3 && (
						<>
							<circle cx={cx + px} cy={262 + py} r={pr} fill="#1D1A1F" />
							<circle cx={cx + px + 5} cy={256 + py} r={4.5} fill="#FFFFFF" />
						</>
					)}
				</g>
			))}
		</g>
	);
};

const Mouth: React.FC<{expression: Expression; open: number}> = ({expression, open}) => {
	const clip = `mouth${React.useId().replace(/:/g, '')}`;
	if (open < 0.08) {
		const closed: Record<Expression, React.ReactNode> = {
			happy: <path d="M168 326 Q200 354 232 326" />,
			smirk: <path d="M172 334 Q208 346 234 322" />,
			surprised: <ellipse cx="200" cy="336" rx="14" ry="18" fill="#5A1A1A" stroke="none" />,
			sleepy: <path d="M184 334 Q200 340 216 334" />,
			serious: <path d="M176 334 L224 334" />,
			worried: <path d="M172 340 Q186 328 200 338 Q214 348 228 334" />,
		};
		return (
			<g stroke="#5A1A1A" strokeWidth="8" strokeLinecap="round" fill="none">
				{closed[expression]}
			</g>
		);
	}
	const w = 26 + open * 10 + (expression === 'surprised' ? -6 : 0);
	const depth = 10 + open * 34 + (expression === 'surprised' ? 10 : 0);
	const top = expression === 'happy' || expression === 'smirk' ? 324 : 330;
	const d = `M${200 - w} ${top} Q200 ${top - 6} ${200 + w} ${top} Q${200 + w * 0.9} ${top + depth} 200 ${top + depth} Q${200 - w * 0.9} ${top + depth} ${200 - w} ${top}Z`;
	return (
		<g>
			<clipPath id={clip}>
				<path d={d} />
			</clipPath>
			<path d={d} fill="#5A1A1A" stroke="#3E1010" strokeWidth="5" strokeLinejoin="round" />
			<g clipPath={`url(#${clip})`}>
				<rect x={200 - w} y={top - 4} width={w * 2} height="10" fill="#FFFFFF" />
				<ellipse cx="200" cy={top + depth} rx={w * 0.6} ry={depth * 0.45} fill="#E26D7A" />
			</g>
		</g>
	);
};

const Accessory: React.FC<{kind?: string; color?: string}> = ({kind, color = '#222'}) => {
	switch (kind) {
		case 'stethoscope':
			return (
				<g fill="none" stroke={color} strokeWidth="9" strokeLinecap="round">
					<path d="M160 385 Q150 460 200 470 Q250 460 240 385" />
					<path d="M235 465 Q250 510 230 530" />
					<circle cx="228" cy="540" r="14" fill="#B8C4D0" />
				</g>
			);
		case 'neckerchief':
			return <path d="M160 378 L240 378 L200 440Z" fill={color} />;
		case 'tie':
			return <path d="M192 384 L208 384 L214 400 L206 500 L200 512 L194 500 L186 400Z" fill={color} />;
		case 'badge':
			return <path d="M245 440 L262 446 L262 466 Q253 478 245 482 Q237 478 228 466 L228 446Z" fill={color} stroke="#1D1A1F" strokeWidth="3" />;
		case 'vest':
			return (
				<g>
					<path d="M122 395 L175 380 L170 600 L118 600Z" fill={color} />
					<path d="M278 395 L225 380 L230 600 L282 600Z" fill={color} />
					<rect x="118" y="520" width="56" height="16" fill="#E6FF3D" />
					<rect x="226" y="520" width="56" height="16" fill="#E6FF3D" />
				</g>
			);
		default:
			return null;
	}
};

export const Character: React.FC<Props> = ({
	height,
	pose = 'idle',
	expression = 'happy',
	outfit,
	wear = {},
	talking = true,
	look = {x: 0, y: 0},
	style,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {character, energy} = useEpisode();
	const mouth = useMouth();
	const full = getOutfit(outfit ?? character.outfit);
	const casual = OUTFITS.civilian;
	const coatOn = wear.coat !== false;
	const legsOn = wear.legs !== false;
	const hatOn = wear.hat !== false && full.hat !== 'none';
	const coat = coatOn ? full : casual;
	const legs = legsOn ? full : casual;
	const skin = character.skin ?? '#E8B58A';
	const hair = character.hair ?? '#3B2A1A';
	const hands = coatOn ? full.hands ?? skin : skin;

	const t = frame / fps;
	const bob = Math.sin(t * Math.PI * 2 * 0.9 * energy) * 5 * energy;
	const breathe = 1 + Math.sin(t * Math.PI * 2 * 0.45) * 0.012;
	const [la, ra] = poseAngles(pose, t, energy);
	const width = (height * 600) / 780;

	const arm = (side: 'l' | 'r', angle: number) => {
		const x = side === 'l' ? 120 : 280;
		const rot = side === 'l' ? angle : -angle;
		return (
			<g transform={`translate(${x} 405) rotate(${rot})`}>
				<rect x={-ARM.width / 2} y={-10} width={ARM.width} height={ARM.len} rx={ARM.width / 2} fill={coat.coat} stroke={coat.coatShade} strokeWidth="5" />
				{coatOn && full.stripe && <rect x={-ARM.width / 2 + 2} y={ARM.len - 50} width={ARM.width - 4} height={13} fill={full.stripe} />}
				<circle cx={0} cy={ARM.len + 6} r={26} fill={hands} stroke="#1D1A1F" strokeWidth="4" />
			</g>
		);
	};

	return (
		<svg viewBox="-100 -40 600 780" width={width} height={height} style={{overflow: 'visible', ...style}}>
			<g transform={`translate(0 ${bob})`}>
				{/* legs */}
				<rect x="140" y="585" width="52" height="110" rx="18" fill={legs.pants} stroke="#1D1A1F" strokeOpacity="0.25" strokeWidth="4" />
				<rect x="208" y="585" width="52" height="110" rx="18" fill={legs.pants} stroke="#1D1A1F" strokeOpacity="0.25" strokeWidth="4" />
				{legsOn && full.stripe && (
					<>
						<rect x="142" y="640" width="48" height="12" fill={full.stripe} />
						<rect x="210" y="640" width="48" height="12" fill={full.stripe} />
					</>
				)}
				<rect x="122" y="680" width="78" height="40" rx="18" fill={legs.shoes} stroke="#1D1A1F" strokeWidth="4" />
				<rect x="200" y="680" width="78" height="40" rx="18" fill={legs.shoes} stroke="#1D1A1F" strokeWidth="4" />

				{/* torso */}
				<g transform={`translate(200 610) scale(1 ${breathe}) translate(-200 -610)`}>
					<rect x="178" y="350" width="44" height="40" fill={skin} />
					<path
						d="M122 404 Q122 376 160 372 L240 372 Q278 376 278 404 L292 588 Q292 612 268 612 L132 612 Q108 612 108 588Z"
						fill={coat.coat}
						stroke="#1D1A1F"
						strokeWidth="5"
					/>
					<path d="M240 372 Q278 376 278 404 L292 588 Q292 612 268 612 L246 612Z" fill={coat.coatShade} opacity="0.6" />
					{coatOn && full.stripe && (
						<>
							<rect x="112" y="548" width="176" height="20" fill={full.stripe} />
							<rect x="112" y="555" width="176" height="6" fill="#D9D9D9" />
							<rect x="118" y="452" width="164" height="18" fill={full.stripe} />
							<rect x="118" y="458" width="164" height="6" fill="#D9D9D9" />
						</>
					)}
					{coatOn && full.collar && <path d="M168 374 L200 420 L232 374Z" fill={full.collar} />}
					{coatOn && full.hat === 'firefighter' && <rect x="196" y="380" width="8" height="230" fill="#1D1A1F" opacity="0.35" />}
					{!coatOn && <path d="M172 374 Q200 400 228 374" stroke="#1D1A1F" strokeWidth="5" fill="none" />}
					{coatOn && <Accessory kind={full.accessory} color={full.accessoryColor} />}
				</g>

				{arm('l', la)}
				{arm('r', ra)}

				{/* head */}
				<circle cx="78" cy="266" r="26" fill={skin} stroke="#1D1A1F" strokeWidth="5" />
				<circle cx="322" cy="266" r="26" fill={skin} stroke="#1D1A1F" strokeWidth="5" />
				<ellipse cx="200" cy="255" rx="126" ry="122" fill={skin} stroke="#1D1A1F" strokeWidth="5" />
				{!hatOn && <path d="M76 250 Q66 120 200 116 Q334 120 324 250 Q312 182 262 168 Q230 196 170 176 Q108 186 76 250Z" fill={hair} />}
				{hatOn && (
					<>
						<path d="M80 226 Q80 205 95 200 L100 245 Q86 245 80 226Z" fill={hair} />
						<path d="M320 226 Q320 205 305 200 L300 245 Q314 245 320 226Z" fill={hair} />
					</>
				)}
				<circle cx="128" cy="310" r="20" fill="#FF7C7C" opacity="0.35" />
				<circle cx="272" cy="310" r="20" fill="#FF7C7C" opacity="0.35" />
				<Eyes expression={expression} frame={frame} fps={fps} look={look} />
				<Brows expression={expression} />
				<ellipse cx="200" cy="298" rx="15" ry="11" fill="#1D1A1F" opacity="0.15" />
				<Mouth expression={expression} open={talking ? mouth : 0} />
				{hatOn && <Hat hat={full.hat} />}
			</g>
		</svg>
	);
};
