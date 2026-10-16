import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useEpisode, useLoudness} from '../context';
import {INK, LIMB, LINE, PAPER_LIGHT} from '../theme';
import {Circ, P, Rect, Tube} from './ink';

/**
 * The channel's everyman, pencil-sketch style: a round head with a simple face on a stick body.
 * `look: "hoodie"` dresses the figure in a dark hatched hoodie and trousers (for a second character).
 *
 * Local coordinates: feet at (0, 0), head top at y = -400 (a person is 400 units tall).
 * Limb angles are absolute degrees: 0 = straight down, 90 = right, -90 = left, 180 = up.
 */
export type PoseName =
	| 'stand'
	| 'hips'
	| 'point'
	| 'pointSide'
	| 'think'
	| 'shrug'
	| 'facepalm'
	| 'scratch'
	| 'wave'
	| 'sad'
	| 'cross'
	| 'phone'
	| 'cheer'
	| 'sit'
	| 'hug-knees'
	| 'type'
	| 'walk';

export type Face = 'neutral' | 'smile' | 'grin' | 'meh' | 'sad' | 'surprised' | 'worried' | 'smug' | 'annoyed' | 'confused' | 'peaceful' | 'sleepy';
export type Look = 'stick' | 'hoodie';

type Limb = [number, number];
type Pose = {armL: Limb; armR: Limb; legL: Limb; legR: Limb; headDx?: number; headDy?: number; lean?: number};

const POSES: Record<Exclude<PoseName, 'walk' | 'wave' | 'type'>, Pose> = {
	stand: {armL: [-14, -6], armR: [14, 6], legL: [-10, -6], legR: [10, 6]},
	hips: {armL: [-48, 48], armR: [48, -48], legL: [-12, -8], legR: [12, 8]},
	point: {armL: [-14, -2], armR: [122, 122], legL: [-10, -6], legR: [10, 6]},
	pointSide: {armL: [-14, -6], armR: [94, 94], legL: [-10, -6], legR: [12, 8]},
	think: {armL: [-22, 70], armR: [14, 172], legL: [-10, -6], legR: [10, 6], headDx: -4, headDy: 4},
	shrug: {armL: [-62, -125], armR: [62, 125], legL: [-10, -6], legR: [10, 6], headDy: 6},
	facepalm: {armL: [-14, -6], armR: [150, -100], legL: [-10, -6], legR: [10, 6], headDy: 10, lean: 3},
	scratch: {armL: [-14, -6], armR: [150, -150], legL: [-10, -6], legR: [10, 6], headDx: -6},
	sad: {armL: [-6, -2], armR: [6, 2], legL: [-6, -3], legR: [6, 3], headDy: 18},
	cross: {armL: [-30, 80], armR: [30, -80], legL: [-12, -8], legR: [12, 8]},
	phone: {armL: [-24, 122], armR: [24, -122], legL: [-10, -6], legR: [10, 6], headDy: 14},
	cheer: {armL: [-125, -150], armR: [125, 150], legL: [-14, -8], legR: [14, 8]},
	sit: {armL: [10, 50], armR: [18, 60], legL: [86, 4], legR: [80, -2]},
	'hug-knees': {armL: [30, 95], armR: [40, 100], legL: [130, 10], legR: [124, 4], headDy: 8},
};

const H = 400;
const R = 72; // head radius
const HEAD_Y = -H + R;
const NECK_Y = HEAD_Y + R - 4;
const SHOULDER_Y = -228;
const HIP_Y = -150;
const UPPER_ARM = 64;
const FOREARM = 60;
const THIGH = 76;
const SHIN = 74;

const dir = (deg: number, len: number): [number, number] => {
	const a = (deg * Math.PI) / 180;
	return [Math.sin(a) * len, Math.cos(a) * len];
};

const limb = (x: number, y: number, [a, b]: Limb, l1: number, l2: number) => {
	const [dx1, dy1] = dir(a, l1);
	const [dx2, dy2] = dir(b, l2);
	const end: [number, number] = [x + dx1 + dx2, y + dy1 + dy2];
	return {d: `M${x} ${y} L${x + dx1} ${y + dy1} L${end[0]} ${end[1]}`, end, angle: b};
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixLimb = (a: Limb, b: Limb, t: number): Limb => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

const resolvePose = (name: PoseName, t: number, energy: number): Pose => {
	if (name === 'walk') {
		const s = Math.sin(t * Math.PI * 2 * 1.6);
		return {
			armL: [-10 - 20 * s, -6 - 24 * s],
			armR: [10 + 20 * s, 6 + 24 * s],
			legL: [24 * s, 24 * s - 12 * Math.abs(s)],
			legR: [-24 * s, -24 * s - 12 * Math.abs(s)],
			headDy: -Math.abs(s) * 6,
		};
	}
	if (name === 'wave') return {...POSES.stand, armR: [140, 165 + Math.sin(t * 10) * 20 * energy]};
	if (name === 'type') {
		// hands hovering at desk height (~190 units), fingers going fast
		const k = Math.sin(t * 22 * energy) * 8;
		return {armL: [-38, 100 + k], armR: [38, -100 + k], legL: [-10, -6], legR: [10, 6], headDy: 10};
	}
	return POSES[name];
};

const blendPose = (a: Pose, b: Pose, t: number): Pose => ({
	armL: mixLimb(a.armL, b.armL, t),
	armR: mixLimb(a.armR, b.armR, t),
	legL: mixLimb(a.legL, b.legL, t),
	legR: mixLimb(a.legR, b.legR, t),
	headDx: mix(a.headDx ?? 0, b.headDx ?? 0, t),
	headDy: mix(a.headDy ?? 0, b.headDy ?? 0, t),
	lean: mix(a.lean ?? 0, b.lean ?? 0, t),
});

/** Simple pencil face. (cx, cy) = head centre; `gaze` shifts the whole face sideways (-1..1). */
const FaceArt: React.FC<{face: Face; cx: number; cy: number; gaze: number; blink: boolean; mouthOpen: number}> = ({face, cx, cy, gaze, blink, mouthOpen}) => {
	const fx = cx + gaze * R * 0.28;
	const ey = cy - R * 0.08;
	const ex = R * 0.3;
	const eye = (x: number) => {
		if (face === 'peaceful') return <P d={`M${x - 11} ${ey + 2} Q${x} ${ey - 10} ${x + 11} ${ey + 2}`} strokeWidth={LINE * 0.9} />;
		if (face === 'sleepy' || blink) return <P d={`M${x - 11} ${ey} L${x + 11} ${ey}`} strokeWidth={LINE * 0.9} />;
		if (face === 'meh' || face === 'annoyed')
			return (
				<g>
					<P d={`M${x - 13} ${ey - 4} L${x + 13} ${ey - 4}`} strokeWidth={LINE * 0.9} />
					<ellipse cx={x + gaze * 3} cy={ey + 3} rx={6} ry={5} fill={INK} />
				</g>
			);
		const big = face === 'surprised';
		return <ellipse cx={x + gaze * 3} cy={ey} rx={big ? 9 : 7} ry={big ? 13 : 10} fill={INK} />;
	};
	// brows: [leftY, leftTilt, rightY, rightTilt]; tilt > 0 raises the outer end
	const brows: Partial<Record<Face, [number, number, number, number]>> = {
		meh: [-26, 0, -26, 0],
		sad: [-30, -12, -30, -12],
		worried: [-32, -14, -32, -14],
		surprised: [-42, 4, -42, 4],
		smug: [-34, 8, -24, -2],
		annoyed: [-24, -10, -24, -10],
		confused: [-36, 10, -24, -6],
	};
	const b = brows[face];
	const browArt = b && (
		<g>
			<P d={`M${fx - ex - 14} ${ey + b[0] - b[1] * 0.6} L${fx - ex + 14} ${ey + b[0] + b[1] * 0.6}`} strokeWidth={LINE * 0.9} />
			<P d={`M${fx + ex - 14} ${ey + b[2] + b[3] * 0.6} L${fx + ex + 14} ${ey + b[2] - b[3] * 0.6}`} strokeWidth={LINE * 0.9} />
		</g>
	);
	const my = cy + R * 0.38;
	let mouth: React.ReactNode;
	if (mouthOpen > 0.12) {
		mouth = <ellipse cx={fx} cy={my} rx={10 + mouthOpen * 6} ry={4 + mouthOpen * 12} fill={INK} />;
	} else {
		switch (face) {
			case 'smile':
			case 'peaceful':
				mouth = <P d={`M${fx - 16} ${my - 4} Q${fx} ${my + 10} ${fx + 16} ${my - 4}`} strokeWidth={LINE * 0.9} />;
				break;
			case 'grin':
				mouth = <P d={`M${fx - 20} ${my - 6} L${fx + 20} ${my - 6} Q${fx + 16} ${my + 16} ${fx} ${my + 16} Q${fx - 16} ${my + 16} ${fx - 20} ${my - 6}Z`} fill={INK} strokeWidth={LINE * 0.8} />;
				break;
			case 'sad':
				mouth = <P d={`M${fx - 14} ${my + 6} Q${fx} ${my - 8} ${fx + 14} ${my + 6}`} strokeWidth={LINE * 0.9} />;
				break;
			case 'surprised':
				mouth = <ellipse cx={fx} cy={my + 2} rx={8} ry={11} fill={INK} />;
				break;
			case 'worried':
			case 'confused':
				mouth = <P d={`M${fx - 15} ${my + 2} Q${fx - 7} ${my - 6} ${fx} ${my + 2} Q${fx + 7} ${my + 8} ${fx + 15} ${my}`} strokeWidth={LINE * 0.9} />;
				break;
			case 'smug':
				mouth = <P d={`M${fx - 14} ${my + 2} Q${fx + 6} ${my + 8} ${fx + 16} ${my - 8}`} strokeWidth={LINE * 0.9} />;
				break;
			case 'meh':
			case 'annoyed':
				mouth = <P d={`M${fx - 12} ${my + 3} L${fx + 12} ${my + 1}`} strokeWidth={LINE * 0.9} />;
				break;
			case 'sleepy':
				mouth = <ellipse cx={fx} cy={my} rx={5} ry={6} fill="none" stroke={INK} strokeWidth={3} />;
				break;
			default:
				mouth = <P d={`M${fx - 10} ${my} L${fx + 10} ${my}`} strokeWidth={LINE * 0.9} />;
		}
	}
	return (
		<g>
			{eye(fx - ex)}
			{eye(fx + ex)}
			{browArt}
			{mouth}
		</g>
	);
};

type Props = {
	pose: PoseName;
	/** Animate from `prevPose` to `pose`; `blend` goes 0 -> 1. */
	prevPose?: PoseName;
	blend?: number;
	face?: Face;
	look?: Look;
	/** Which way the face looks (-1 left .. 1 right). */
	gaze?: number;
	/** Mirror the body (e.g. sitting facing left). */
	flip?: boolean;
	holding?: 'phone' | 'cup' | 'book';
	/** Mouth moves with the narrator's voice (use when this character is the one speaking). */
	talking?: boolean;
	/** Offset (seconds) for idle motion so two people don't move in sync. */
	phase?: number;
};

export const Person: React.FC<Props> = ({pose, prevPose, blend = 1, face = 'neutral', look = 'stick', gaze = 0, flip, holding, talking, phase = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {energy} = useEpisode();
	const loud = useLoudness();
	const t = frame / fps + phase;
	const target = resolvePose(pose, t, energy);
	const p = prevPose && blend < 1 ? blendPose(resolvePose(prevPose, t, energy), target, blend) : target;
	const seated = (pose === 'sit' || pose === 'hug-knees') && (blend > 0.5 || !prevPose);

	const breathe = Math.sin(t * Math.PI * 2 * 0.4) * 2.5 * energy;
	const sway = pose === 'walk' ? 0 : Math.sin(t * Math.PI * 2 * 0.23) * 1.6 * energy;
	const baseY = seated ? -HIP_Y : 0; // seated: the hips rest on the surface at y = 0
	const blinkPeriod = Math.round(fps * (3.3 + (phase % 1)));
	const blink = (frame + Math.round(phase * fps)) % blinkPeriod < 4;

	const clipId = `head${React.useId().replace(/:/g, '')}`;
	const hoodie = look === 'hoodie';
	const shoulderY = hoodie ? SHOULDER_Y - 12 : SHOULDER_Y;
	const sx = hoodie ? 24 : 0; // hoodie arms start at the shoulders, stick arms at the spine
	const legL = limb(hoodie ? -12 : -2, HIP_Y, p.legL, THIGH, SHIN);
	const legR = limb(hoodie ? 12 : 2, HIP_Y, p.legR, THIGH, SHIN);
	const armL = limb(-sx, shoulderY, p.armL, UPPER_ARM, FOREARM);
	const armR = limb(sx, shoulderY, p.armR, UPPER_ARM, FOREARM);
	const headX = (p.headDx ?? 0) + sway;
	const headY = HEAD_Y + (p.headDy ?? 0) + breathe * 0.6;

	const shoe = (end: [number, number], dirX: number) => (
		<P d={`M${end[0] - 6 * dirX} ${end[1] - 6} Q${end[0] + 22 * dirX} ${end[1] - 12} ${end[0] + 26 * dirX} ${end[1] + 2} L${end[0] - 8 * dirX} ${end[1] + 3}Z`} fill={INK} strokeWidth={LINE * 0.8} />
	);
	const fist = (end: [number, number]) => <Circ cx={end[0]} cy={end[1]} r={10} fill={INK} strokeWidth={LINE * 0.6} />;
	const pointer = (end: [number, number], angle: number) => {
		const [dx, dy] = dir(angle, 22);
		return (
			<g>
				<Circ cx={end[0]} cy={end[1]} r={11} fill={INK} strokeWidth={LINE * 0.6} />
				<P d={`M${end[0]} ${end[1]} L${end[0] + dx} ${end[1] + dy}`} strokeWidth={LINE * 1.1} />
			</g>
		);
	};
	const pointing = pose === 'point' || pose === 'pointSide';
	const legOut = (side: number) => (seated ? 1 : side);

	return (
		<g transform={`translate(0 ${baseY}) scale(${flip ? -1 : 1} 1) rotate(${p.lean ?? 0} 0 ${HIP_Y})`}>
			{/* legs */}
			{hoodie ? (
				<>
					<Tube d={legL.d} width={30} core="url(#hatch-dark)" />
					<Tube d={legR.d} width={30} core="url(#hatch-dark)" />
				</>
			) : (
				<>
					<P d={legL.d} strokeWidth={LIMB} />
					<P d={legR.d} strokeWidth={LIMB} />
				</>
			)}
			{shoe(legL.end, legOut(-1))}
			{shoe(legR.end, legOut(1))}
			{/* body */}
			<g transform={`translate(0 ${breathe * 0.3})`}>
				{hoodie ? (
					<P
						d={`M-34 ${shoulderY} Q-44 ${(shoulderY + HIP_Y) / 2} -30 ${HIP_Y + 8} L30 ${HIP_Y + 8} Q44 ${(shoulderY + HIP_Y) / 2} 34 ${shoulderY} Q0 ${shoulderY - 14} -34 ${shoulderY}Z`}
						fill="url(#hatch-dark)"
					/>
				) : (
					<P d={`M${headX * 0.4} ${NECK_Y} Q2 ${(NECK_Y + HIP_Y) / 2} 0 ${HIP_Y}`} strokeWidth={LIMB} />
				)}
			</g>
			{/* head with pencil shading on the lower-right */}
			<Circ cx={headX} cy={headY} r={R} fill={PAPER_LIGHT} strokeWidth={LINE * 1.1} />
			<mask id={clipId}>
				<circle cx={headX} cy={headY} r={R - 3} fill="white" />
				<circle cx={headX - R * 0.32} cy={headY - R * 0.3} r={R * 0.98} fill="black" />
			</mask>
			<rect x={headX - R} y={headY - R} width={R * 2} height={R * 2} fill="url(#hatch)" mask={`url(#${clipId})`} opacity={0.8} />
			<g transform={flip ? `translate(${2 * headX} 0) scale(-1 1)` : undefined}>
				<FaceArt face={face} cx={headX} cy={headY} gaze={flip ? -gaze : gaze} blink={blink} mouthOpen={talking ? loud : 0} />
			</g>
			{hoodie && <P d={`M-30 ${shoulderY - 2} Q0 ${shoulderY + 22} 30 ${shoulderY - 2}`} strokeWidth={LINE * 0.8} />}
			{/* arms */}
			{hoodie ? (
				<>
					<Tube d={armL.d} width={26} core="url(#hatch-dark)" />
					<Tube d={armR.d} width={26} core="url(#hatch-dark)" />
				</>
			) : (
				<>
					<P d={armL.d} strokeWidth={LIMB} />
					<P d={armR.d} strokeWidth={LIMB} />
				</>
			)}
			{fist(armL.end)}
			{pointing ? pointer(armR.end, armR.angle) : fist(armR.end)}
			{holding === 'phone' && (
				<g transform={`translate(${(armL.end[0] + armR.end[0]) / 2} ${(armL.end[1] + armR.end[1]) / 2 - 16})`}>
					<Rect x={-17} y={-28} width={34} height={56} rx={6} fill={INK} />
					<rect x={-12} y={-22} width={24} height={40} rx={3} fill="#CFD8DC" />
				</g>
			)}
			{holding === 'cup' && (
				<g transform={`translate(${armR.end[0]} ${armR.end[1] - 22})`}>
					<P d="M-16 -22 L16 -22 L12 22 L-12 22Z" fill={PAPER_LIGHT} />
					<P d="M-8 -34 Q-2 -42 -6 -50 M4 -34 Q10 -42 6 -50" strokeWidth={LINE * 0.6} />
				</g>
			)}
			{holding === 'book' && (
				<g transform={`translate(${(armL.end[0] + armR.end[0]) / 2} ${(armL.end[1] + armR.end[1]) / 2 - 10})`}>
					<P d="M-50 -30 Q-25 -40 0 -30 Q25 -40 50 -30 L50 20 Q25 10 0 20 Q-25 10 -50 20Z" fill={PAPER_LIGHT} />
					<P d="M0 -30 L0 20" />
				</g>
			)}
		</g>
	);
};

/** Head geometry in person-local units (for placing emotes and bubbles). */
export const HEAD = {top: -H, centerY: HEAD_Y, r: R};
export const PERSON_HEIGHT = H;
