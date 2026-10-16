import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrame, useScene} from '../context';
import {Draw} from '../components/ink';
import {Bubble, Emote, EmoteName, Note} from '../components/marks';
import {Face, HEAD, Look, Person, PoseName} from '../components/Person';
import {PropArt, PROPS} from '../components/props';
import {Setting, SettingName} from '../components/Setting';
import {Sfx} from '../components/Sfx';
import {CardSpec, SpecimenCard, useSlam} from '../components/specimen';
import type {Visual} from '../types';
import {Box, useFullBox} from './stage';

/** A moment in time (a "cue"): a word the narrator says ("fridge", "door#2") or seconds into the line. */
export type Cue = string | number;

export type PersonSpec = {
	/** Horizontal position, 0 = left edge .. 1 = right edge of the stage. */
	x: number;
	/** Height above the floor in scene units (e.g. 0 floor, 70 couch seat); a person is 400 tall. */
	y?: number;
	scale?: number;
	pose?: PoseName;
	face?: Face;
	look?: Look;
	gaze?: number;
	flip?: boolean;
	holding?: 'phone' | 'cup' | 'book';
	/** Mouth moves with the voice (this person is the one talking). */
	talking?: boolean;
	/** Changes during the line, e.g. [{"at": "fridge", "pose": "scratch", "face": "confused"}]. */
	then?: {at: Cue; pose?: PoseName; face?: Face; gaze?: number}[];
	/** Walk in from x = `from` to `x`, starting at `at` (default: scene start). */
	walk?: {from: number; at?: Cue; seconds?: number};
	emote?: EmoteName;
	emoteAt?: Cue;
	bubble?: {text: string; kind?: 'speech' | 'thought'; at?: Cue; side?: 'left' | 'right'};
};

/** `front: true` draws the prop in front of people (a desk someone stands behind). */
export type PropSpec = {type: string; x: number; scale?: number; flip?: boolean; open?: boolean | Cue; text?: string; front?: boolean};

/** target: "prop:0", "person:1", "head:0" or "all" (the whole stage). `label` = typewriter figure label ("fig. 1: the stare"). */
export type NoteSpec = {kind: 'circle' | 'arrow' | 'underline' | 'cross' | 'label'; target: string; at?: Cue; label?: string};

export type SituationSpec = {
	setting?: SettingName;
	props?: PropSpec[];
	people?: PersonSpec[];
	notes?: NoteSpec[];
	/** Slow push-in: zoom from..to over the scene, centred on `focus` ([x, y] as 0-1 fractions). */
	camera?: {zoom?: [number, number]; focus?: [number, number]};
	/** The episode's specimen card, taped at the top of the page; `at` slams it in on a cue. */
	card?: Omit<CardSpec, 'at'> & {at?: Cue};
	/** Rubber stamp on the card, e.g. {"at": "perfectly"} -> "PERFECTLY HUMAN". */
	stamp?: {at: Cue; text?: string};
};

const SEATED = new Set<PoseName>(['sit', 'hug-knees']);

/** Draws a SituationSpec into a box. Shared by the full-frame scene and split-screen panels. */
export const SituationArt: React.FC<{spec: SituationSpec; box: Box; drawOn: boolean; startAt?: number}> = ({spec, box, drawOn, startAt = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {voice, lead} = useScene();
	const cue = (c: Cue | undefined, fallback: number) => cueFrame(voice, lead, fps, c, fallback);
	const drawP = (delay: number, dur = 12) => (drawOn ? interpolate(frame - startAt, [delay, delay + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : frame >= startAt ? 1 : 0);
	const {u, ground} = box;
	const X = (fx: number) => box.x + fx * box.w;

	const props = spec.props ?? [];
	const people = spec.people ?? [];
	const overlays: React.ReactNode[] = [];
	const sounds: React.ReactNode[] = [];

	const propRects = props.map((pr) => {
		const def = PROPS[pr.type] ?? {w: 100, h: 100};
		const s = u * (pr.scale ?? 1);
		const w = def.w * s;
		const h = def.h * s;
		return {x: X(pr.x) - w / 2, y: ground - ((def as {elevation?: number}).elevation ?? 0) * s - h, w, h};
	});

	const peopleState = people.map((ps, i) => {
		let pose = ps.pose ?? 'stand';
		let face = ps.face ?? 'neutral';
		let gaze = ps.gaze ?? 0;
		let prevPose: PoseName | undefined;
		let changedAt = -999;
		for (const step of ps.then ?? []) {
			const at = cue(step.at, Infinity);
			if (frame >= at) {
				if (step.pose && step.pose !== pose) {
					prevPose = pose;
					pose = step.pose;
					changedAt = at;
				}
				face = step.face ?? face;
				gaze = step.gaze ?? gaze;
			}
		}
		let fx = ps.x;
		if (ps.walk) {
			const start = cue(ps.walk.at, 0);
			const end = start + Math.round((ps.walk.seconds ?? 1.6) * fps);
			fx = interpolate(frame, [start, end], [ps.walk.from, ps.x], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			if (frame < end) {
				prevPose = undefined;
				pose = 'walk';
				gaze = ps.x > ps.walk.from ? 0.6 : -0.6;
			} else if (frame < end + 8) {
				prevPose = 'walk';
				changedAt = end;
			}
		}
		const blend = prevPose ? interpolate(frame, [changedAt, changedAt + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
		const s = u * (ps.scale ?? 1);
		const baseY = ground - (ps.y ?? 0) * s;
		const seated = SEATED.has(pose);
		const headTop = baseY + (HEAD.top + (seated ? 150 : 0)) * s;
		const headCx = X(fx);
		return {ps, i, pose, prevPose, blend, face, gaze, s, px: X(fx), baseY, headTop, headCx};
	});

	peopleState.forEach(({ps, i, headTop, headCx, s}) => {
		if (ps.emote) {
			const at = cue(ps.emoteAt, lead + 6);
			const p = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 220}});
			overlays.push(<Emote key={`e${i}`} kind={ps.emote} x={headCx + HEAD.r * 0.9 * s} y={headTop - 34 * s} p={p} size={HEAD.r * s} />);
			sounds.push(<Sfx key={`es${i}`} name="pop" at={at} volume={0.25} />);
		}
	});

	const notes = (spec.notes ?? []).map((n, i) => {
		const [kind, idx] = n.target.split(':');
		const k = Number(idx) || 0;
		let rect = {x: box.x + box.w * 0.4, y: box.y + box.h * 0.4, w: box.w * 0.2, h: box.h * 0.2};
		if (kind === 'all') rect = {x: box.x + box.w * 0.08, y: box.y + box.h * 0.12, w: box.w * 0.84, h: box.h * 0.76};
		if (kind === 'prop' && propRects[k]) rect = propRects[k];
		const person = peopleState[k];
		if (kind === 'head' && person) rect = {x: person.headCx - HEAD.r * person.s, y: person.headTop, w: HEAD.r * 2 * person.s, h: HEAD.r * 2 * person.s};
		if (kind === 'person' && person) rect = {x: person.px - 70 * person.s, y: person.headTop, w: 140 * person.s, h: person.baseY - person.headTop};
		const at = cue(n.at, lead + 10);
		sounds.push(<Sfx key={`ns${i}`} name={n.kind === 'label' ? 'tick' : 'scribble'} at={at} volume={0.3} />);
		return <Note key={`n${i}`} kind={n.kind} rect={rect} at={at} label={n.label} labelSize={70 * u} bounds={{x0: box.x + 20, x1: box.x + box.w - 20}} />;
	});

	const bubbles = peopleState.map(({ps, i, headTop, headCx, s}) => {
		if (!ps.bubble) return null;
		const at = cue(ps.bubble.at, lead + 4);
		const p = spring({frame: frame - at, fps, config: {damping: 12, stiffness: 200}});
		const side = ps.bubble.side ?? (ps.x > 0.6 ? 'left' : 'right');
		return (
			<Bubble
				key={`b${i}`}
				text={ps.bubble.text}
				kind={ps.bubble.kind}
				x={headCx + (side === 'right' ? 30 : -30) * s}
				y={headTop - 10 * s}
				p={p}
				fontSize={52 * u}
				maxWidth={box.w * 0.62}
				side={side}
			/>
		);
	});

	const renderProp = (pr: PropSpec, i: number) => {
		const s = u * (pr.scale ?? 1);
		const open = pr.open === true ? 1 : pr.open === undefined || pr.open === false ? 0 : spring({frame: frame - cue(pr.open, lead + 10), fps, config: {damping: 14, stiffness: 120}});
		return (
			<Draw key={`p${i}`} p={drawP(4 + i * 4)}>
				<g transform={`translate(${X(pr.x)} ${ground}) scale(${pr.flip ? -s : s} ${s})`}>
					<PropArt name={pr.type} open={open} text={pr.text} frame={frame} />
				</g>
			</Draw>
		);
	};

	return (
		<>
			<svg width="100%" height="100%" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<Draw p={drawP(0, 14)}>
					<Setting name={spec.setting ?? 'blank'} box={box} />
				</Draw>
				{props.map((pr, i) => (pr.front ? null : renderProp(pr, i)))}
				{peopleState.map(({ps, i, pose, prevPose, blend, face, gaze, s, px, baseY}) => (
					<Draw key={i} p={drawP(8 + i * 4, 14)}>
						<g transform={`translate(${px} ${baseY}) scale(${s})`}>
							<Person pose={pose} prevPose={prevPose} blend={blend} face={face} look={ps.look} gaze={gaze} flip={ps.flip} holding={ps.holding} talking={ps.talking} phase={i * 0.37} />
						</g>
					</Draw>
				))}
				{props.map((pr, i) => (pr.front ? renderProp(pr, i) : null))}
				{overlays}
				{notes}
			</svg>
			{bubbles}
			{sounds}
		</>
	);
};

/** Full-frame situation with a slow camera push-in. visual: { type: "situation", ...SituationSpec } */
export const SituationScene: React.FC<{visual: Visual; drawOn: boolean}> = ({visual, drawOn}) => {
	const frame = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {durationInFrames, voice, lead} = useScene();
	const box = useFullBox();
	const spec = visual as SituationSpec;
	const [z0, z1] = spec.camera?.zoom ?? [1, 1.05];
	const [fx, fy] = spec.camera?.focus ?? [0.5, (box.ground - box.h * 0.2) / box.h];
	const z = interpolate(frame, [0, durationInFrames], [z0, z1]);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}>
				<SituationArt spec={spec} box={box} drawOn={drawOn} />
			</AbsoluteFill>
			{spec.card && <CardOverlay card={spec.card} stamp={spec.stamp} voice={voice} lead={lead} fps={fps} width={width} height={height} />}
		</AbsoluteFill>
	);
};

const CardOverlay: React.FC<{
	card: NonNullable<SituationSpec['card']>;
	stamp?: SituationSpec['stamp'];
	voice: ReturnType<typeof useScene>['voice'];
	lead: number;
	fps: number;
	width: number;
	height: number;
}> = ({card, stamp, voice, lead, fps, width, height}) => {
	const vertical = height > width;
	const slamAt = card.at === undefined ? 0 : cueFrame(voice, lead, fps, card.at, 0);
	const stampAt = stamp ? cueFrame(voice, lead, fps, stamp.at, lead + 10) : Infinity;
	const slam = useSlam(slamAt);
	const stampP = useSlam(Number.isFinite(stampAt) ? stampAt : 1e6);
	const w = vertical ? width * 0.84 : width * 0.4;
	return (
		<>
			<SpecimenCard spec={{...card, at: undefined}} x={vertical ? (width - w) / 2 : width * 0.05} y={vertical ? height * 0.035 : height * 0.06} width={w} slam={slam} stamp={Number.isFinite(stampAt) ? stampP : 0} stampText={stamp?.text} />
			{slamAt > 0 && <Sfx name="page" at={slamAt} volume={0.35} />}
			{stamp && <Sfx name="stamp" at={stampAt} volume={0.6} />}
		</>
	);
};
