import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {HAND, MARKER, TYPE} from '../fonts';
import data from './lf001.json';

/** Long-form slideshow: illustrated frames timed to the voiceover, with camera moves, motion text and captions. */

const C = {paper: '#F4EEE3', ink: '#2E2E2E', ochre: '#C9963B', red: '#B4382F', teal: '#5F8F8B'};
const FADE = 10; // frames of cross-fade at the start of each script block
const ease = Easing.bezier(0.42, 0, 0.58, 1);

type Cam = {s0: number; s1: number; x0: number; x1: number; y0: number; y1: number; ox: number; oy: number};
type Scene = {id: string; from: number; to: number; fade: boolean; cam: Cam; type: string};
type Overlay = {
	kind: string;
	text: string;
	f: number;
	t: number;
	scene: string;
	pos?: string;
	x?: number;
	y?: number;
	value?: number;
	prefix?: string;
	label?: string;
	sub?: string;
	small?: boolean;
	red?: string;
};
type Caption = {s: number; e: number; w: [string, number][]};

const scenes = data.scenes as Scene[];
const overlays = data.overlays as Overlay[];
const captions = data.captions as Caption[];

const panel: React.CSSProperties = {
	background: 'rgba(244,238,227,0.95)',
	border: `3px solid ${C.ink}`,
	borderRadius: 14,
	boxShadow: '6px 6px 0 rgba(46,46,46,0.18)',
};

/** Pop-in / fade-out envelope shared by all overlays. */
const useEnvelope = (len: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 14, stiffness: 160}});
	const out = interpolate(frame, [len - 8, len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return {frame, pop, opacity: Math.min(1, pop * 1.4) * out};
};

const Shot: React.FC<{scene: Scene; len: number; pins: Overlay[]}> = ({scene, len, pins}) => {
	const frame = useCurrentFrame();
	const sceneLen = scene.to - scene.from;
	const p = ease(Math.min(1, Math.max(0, frame / sceneLen)));
	const c = scene.cam;
	const s = c.s0 + (c.s1 - c.s0) * p;
	const x = c.x0 + (c.x1 - c.x0) * p;
	const y = c.y0 + (c.y1 - c.y0) * p;
	const opacity = scene.fade ? interpolate(frame, [0, FADE], [0, 1], {extrapolateRight: 'clamp'}) : 1;
	return (
		<AbsoluteFill style={{opacity, backgroundColor: C.paper}}>
			<AbsoluteFill style={{transform: `translate(${x}%, ${y}%) scale(${s})`, transformOrigin: `${c.ox}% ${c.oy}%`}}>
				<Img src={staticFile(`longform/lf001/${scene.id}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				{pins.map((pin, i) => (
					<Sequence key={i} from={pin.f - scene.from} durationInFrames={Math.max(1, pin.t - pin.f)} layout="none">
						<Pin o={pin} />
					</Sequence>
				))}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Pin: React.FC<{o: Overlay}> = ({o}) => {
	const {pop, opacity} = useEnvelope(o.t - o.f);
	return (
		<div
			style={{
				position: 'absolute',
				left: `${o.x}%`,
				top: `${o.y}%`,
				transform: `translate(-50%, -100%) scale(${0.6 + 0.4 * pop})`,
				opacity,
				...panel,
				padding: '8px 20px',
				fontFamily: HAND,
				fontWeight: 700,
				fontSize: 34,
				lineHeight: 1.1,
				color: C.ink,
				textAlign: 'center',
				whiteSpace: 'pre',
			}}
		>
			{o.text}
		</div>
	);
};

const Card: React.FC<{o: Overlay}> = ({o}) => {
	const {frame, opacity} = useEnvelope(o.t - o.f);
	const reveal = interpolate(frame, [0, 20], [100, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const line = interpolate(frame, [14, 32], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const small = !!o.small;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-start', paddingTop: o.pos === 'bottom' ? 770 : small ? 70 : 150, opacity}}>
			<div style={{...(small ? panel : {}), padding: small ? '22px 44px 26px' : 0, maxWidth: 1500, textAlign: 'center'}}>
				<div
					style={{
						fontFamily: HAND,
						fontWeight: 700,
						fontSize: small ? 60 : 104,
						lineHeight: 1.12,
						color: o.red ? C.red : C.ink,
						clipPath: `inset(0 ${reveal}% 0 0)`,
					}}
				>
					{o.text}
				</div>
				<svg width={small ? 520 : 760} height={26} viewBox="0 0 760 26" style={{marginTop: 6}}>
					<path
						d="M8 16 C 120 4, 240 24, 380 12 S 640 6, 752 14"
						fill="none"
						stroke={C.ochre}
						strokeWidth={9}
						strokeLinecap="round"
						pathLength={1}
						strokeDasharray={1}
						strokeDashoffset={line}
					/>
				</svg>
				{o.sub ? (
					<div style={{fontFamily: TYPE, fontSize: 34, color: C.ink, marginTop: 8, opacity: interpolate(frame, [20, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
						{o.sub}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

const Cite: React.FC<{o: Overlay}> = ({o}) => {
	const {frame, opacity} = useEnvelope(o.t - o.f);
	const dx = interpolate(frame, [0, 14], [-40, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	return (
		<div
			style={{
				position: 'absolute',
				left: 56,
				top: 48,
				transform: `translateX(${dx}px)`,
				opacity,
				...panel,
				borderLeft: `12px solid ${C.red}`,
				padding: '12px 24px',
				fontFamily: TYPE,
				fontSize: 32,
				color: C.ink,
			}}
		>
			{o.text}
		</div>
	);
};

const Chip: React.FC<{o: Overlay}> = ({o}) => {
	const {pop, opacity} = useEnvelope(o.t - o.f);
	const right = (o.pos ?? 'tr') === 'tr';
	return (
		<div
			style={{
				position: 'absolute',
				top: right ? 48 : 120,
				...(right ? {right: 56} : {left: 56}),
				transform: `rotate(-1.5deg) scale(${0.7 + 0.3 * pop})`,
				transformOrigin: right ? 'top right' : 'top left',
				opacity,
				...panel,
				padding: '10px 26px',
				fontFamily: HAND,
				fontWeight: 700,
				fontSize: 44,
				color: C.ink,
				maxWidth: 900,
			}}
		>
			{o.text}
		</div>
	);
};

const Stamp: React.FC<{o: Overlay}> = ({o}) => {
	const {pop, opacity} = useEnvelope(o.t - o.f);
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					top: 60,
					...(o.pos === 'tl' ? {left: 70} : {right: 70}),
					transform: `rotate(-6deg) scale(${1.6 - 0.6 * pop})`,
					opacity: opacity * 0.92,
					border: `6px solid ${C.red}`,
					borderRadius: 10,
					padding: '6px 30px',
					fontFamily: MARKER,
					fontSize: 76,
					color: C.red,
					background: 'rgba(244,238,227,0.85)',
					letterSpacing: 2,
				}}
			>
				{o.text}
			</div>
		</AbsoluteFill>
	);
};

const Stat: React.FC<{o: Overlay}> = ({o}) => {
	const {frame, pop, opacity} = useEnvelope(o.t - o.f);
	const v = Math.round(interpolate(frame, [0, 26], [0, o.value ?? 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}));
	const num = (o.prefix ?? '') + v.toLocaleString('en-US');
	return (
		<div
			style={{
				position: 'absolute',
				...(o.pos === 'left' ? {left: 90} : {right: 90}),
				top: 300,
				transform: `scale(${0.7 + 0.3 * pop})`,
				transformOrigin: o.pos === 'left' ? 'center left' : 'center right',
				opacity,
				...panel,
				padding: '10px 40px 18px',
				textAlign: 'center',
			}}
		>
			<div style={{fontFamily: MARKER, fontSize: 150, lineHeight: 1, color: C.ochre, WebkitTextStroke: `3px ${C.ink}`}}>{num}</div>
			{o.label ? <div style={{fontFamily: HAND, fontWeight: 700, fontSize: 42, color: C.ink, maxWidth: 520}}>{o.label}</div> : null}
		</div>
	);
};

const OverlayView: React.FC<{o: Overlay}> = ({o}) => {
	switch (o.kind) {
		case 'card':
			return <Card o={o} />;
		case 'cite':
			return <Cite o={o} />;
		case 'chip':
			return <Chip o={o} />;
		case 'stamp':
			return <Stamp o={o} />;
		case 'stat':
			return <Stat o={o} />;
		default:
			return null;
	}
};

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const cap = captions.find((c) => t >= c.s && t < c.e);
	if (!cap) return null;
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 44}}>
			<div
				style={{
					background: 'rgba(46,46,46,0.78)',
					borderRadius: 16,
					padding: '8px 28px 12px',
					maxWidth: 1560,
					textAlign: 'center',
					fontFamily: HAND,
					fontWeight: 700,
					fontSize: 50,
					lineHeight: 1.2,
					color: C.paper,
				}}
			>
				{cap.w.map(([w, ws], i) => (
					<span key={i} style={{color: t >= ws ? C.paper : 'rgba(244,238,227,0.55)'}}>
						{w}
						{i < cap.w.length - 1 ? ' ' : ''}
					</span>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const Longform: React.FC = () => {
	const {durationInFrames} = useVideoConfig();
	const musicVolume = (f: number) =>
		0.07 * interpolate(f, [0, 60, durationInFrames - 90, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{backgroundColor: C.paper}}>
			{scenes.map((scene, i) => {
				const next = scenes[i + 1];
				const to = next ? next.from + (next.fade ? FADE : 0) : durationInFrames;
				const len = Math.max(1, to - scene.from);
				const pins = overlays.filter((o) => o.kind === 'pin' && o.scene === scene.id);
				return (
					<Sequence key={scene.id} from={scene.from} durationInFrames={len}>
						<Shot scene={scene} len={len} pins={pins} />
					</Sequence>
				);
			})}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 62%, rgba(46,46,46,0.16) 100%)'}} />
			{overlays
				.filter((o) => o.kind !== 'pin')
				.map((o, i) => (
					<Sequence key={i} from={o.f} durationInFrames={Math.max(1, o.t - o.f)}>
						<OverlayView o={o} />
					</Sequence>
				))}
			<Captions />
			<Audio src={staticFile('longform/lf001-audio/voice.mp3')} />
			<Audio src={staticFile('music/gymnopedie-no-1.mp3')} loop volume={musicVolume} />
		</AbsoluteFill>
	);
};

export const LONGFORM_DURATION = data.duration;
