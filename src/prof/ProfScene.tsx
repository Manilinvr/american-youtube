import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useScene} from '../context';
import {Sfx} from '../components/Sfx';
import type {Visual} from '../types';
import {clamp, easeInOut, easeOut, enterStyle, lerp, prog, rnd, spr} from './anim';
import {LAYERS, LayerCtx} from './layers';
import {LAYERS2} from './layers2';

const ALL_LAYERS = {...LAYERS, ...LAYERS2};
import {Cam, resolveCue, ShotCtx, useResolve, useSceneFrame} from './ShotCtx';
import {PROF} from './theme';

/* ------------------------------------------------------------------ backgrounds */

const PATTERNS: Record<string, {base: string; image?: string; size?: number}> = {
	paper: {base: PROF.paper, image: 'radial-gradient(circle, rgba(18,18,18,0.13) 3px, transparent 3.5px)', size: 44},
	'paper-grid': {base: PROF.paper, image: 'linear-gradient(rgba(18,18,18,0.09) 3px, transparent 3px), linear-gradient(90deg, rgba(18,18,18,0.09) 3px, transparent 3px)', size: 90},
	white: {base: PROF.white},
	ink: {base: '#151514', image: 'radial-gradient(circle, rgba(255,255,255,0.10) 3px, transparent 3.5px)', size: 44},
	'ink-grid': {base: '#151514', image: 'linear-gradient(rgba(255,255,255,0.07) 3px, transparent 3px), linear-gradient(90deg, rgba(255,255,255,0.07) 3px, transparent 3px)', size: 90},
	accent: {base: PROF.accent, image: 'radial-gradient(circle, rgba(18,18,18,0.20) 4px, transparent 4.5px)', size: 40},
	soft: {base: PROF.paper2, image: 'radial-gradient(circle, rgba(18,18,18,0.10) 3px, transparent 3.5px)', size: 44},
};

const Bg: React.FC<{spec: any}> = ({spec}) => {
	const {width, height} = useVideoConfig();
	const frame = useCurrentFrame();
	if (spec && typeof spec === 'object' && spec.photo) {
		return (
			<AbsoluteFill style={{background: PROF.ink, overflow: 'hidden'}}>
				<Img src={staticFile(`prof/${spec.photo}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${spec.blur ?? 10}px) brightness(${spec.bright ?? 0.62}) grayscale(1)`, transform: `scale(${1.15 + frame * 0.0008})`}} />
				<AbsoluteFill style={{background: PROF[(spec.tint as keyof typeof PROF) ?? 'ink'], opacity: spec.dim ?? 0.25, mixBlendMode: 'multiply'}} />
			</AbsoluteFill>
		);
	}
	const p = PATTERNS[typeof spec === 'string' ? spec : 'paper'] ?? PATTERNS.paper;
	const drift = frame * 0.35;
	return (
		<AbsoluteFill style={{background: p.base, overflow: 'hidden'}}>
			{p.image && <div style={{position: 'absolute', inset: -200, backgroundImage: p.image, backgroundSize: `${p.size}px ${p.size}px`, transform: `translate(${drift % (p.size ?? 44)}px, ${drift % (p.size ?? 44)}px)`}} />}
			{/* soft light falloff so flat colours feel like lit paper */}
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.22), rgba(0,0,0,0) 62%)`, width, height}} />
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ one layer */

const LOOPS: Record<string, (t: number) => string> = {
	float: (t) => `translateY(${Math.sin(t * 0.09) * 14}px)`,
	bob: (t) => `translateY(${Math.sin(t * 0.14) * 8}px) rotate(${Math.sin(t * 0.07) * 1.6}deg)`,
	breathe: (t) => `scale(${1 + Math.sin(t * 0.1) * 0.022})`,
	wobble: (t) => `rotate(${Math.sin(t * 0.12) * 3}deg)`,
	buzz: (t) => `translate(${(rnd(t * 1.7) - 0.5) * 14}px, ${(rnd(t * 2.9 + 4) - 0.5) * 10}px) rotate(${(rnd(t * 4.1 + 2) - 0.5) * 3}deg)`,
};

const LayerBox: React.FC<{layer: any; from: number; index: number}> = ({layer, from, index}) => {
	const {width: W, height: H, fps} = useVideoConfig();
	const {cam} = React.useContext(ShotCtx);
	const f = useSceneFrame();
	const resolve = useResolve();
	const start = resolve(layer.at, from) + Math.round((layer.delay ?? 0) * fps);
	if (f < start) return null;
	const end = resolve(layer.out, Infinity);
	const outP = Number.isFinite(end) ? clamp((f - end) / 6) : 0;
	if (outP >= 1) return null;
	const t = f - start;
	const Comp = ALL_LAYERS[layer.type];
	if (!Comp) return null;

	const depth = layer.depth ?? 1;
	const s = 1 + (cam.z - 1) * depth;
	const camT = `translate(${cam.dx * depth}px, ${cam.dy * depth}px) translate(${cam.fx}px, ${cam.fy}px) scale(${s}) translate(${-cam.fx}px, ${-cam.fy}px)`;

	// jitter after "buzz" cues, bump after "pulse" cues
	let jit = '';
	for (const b of layer.buzz ?? []) {
		const dt = f - resolve(b);
		if (dt >= 0 && dt < 24) {
			const k = 1 - dt / 24;
			jit += ` translate(${(rnd(f * 1.3 + index) - 0.5) * 28 * k}px, ${(rnd(f * 2.3 + index) - 0.5) * 20 * k}px) rotate(${(rnd(f * 3.1) - 0.5) * 5 * k}deg)`;
		}
	}
	let bump = 1;
	for (const b of layer.pulse ?? []) {
		const dt = f - resolve(b);
		if (dt >= 0 && dt < 14) bump += Math.sin((dt / 14) * Math.PI) * 0.16;
	}

	const enter = enterStyle(layer.enter, t, fps, W, H);
	const loop = layer.loop ? LOOPS[layer.loop]?.(t) ?? '' : '';
	const x = (layer.x ?? 0.5) * W;
	const y = (layer.y ?? 0.5) * H;
	const align = layer.align ?? 'center';
	const tx = align === 'left' ? '0%' : align === 'right' ? '-100%' : '-50%';
	const ty = layer.valign === 'top' ? '0%' : layer.valign === 'bottom' ? '-100%' : '-50%';
	return (
		<div style={{position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camT, opacity: 1 - outP, pointerEvents: 'none'}}>
			<div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx}, ${ty}) rotate(${layer.rot ?? 0}deg) scale(${(layer.scale ?? 1) * (1 - outP * 0.2) * bump})`, transformOrigin: '50% 50%', zIndex: layer.z ?? index}}>
				<div style={{...enter, transform: `${enter.transform ?? ''} ${loop} ${jit}`.trim() || undefined}}>
					<LayerCtx.Provider value={{t, start}}>
						<Comp layer={layer} />
					</LayerCtx.Provider>
				</div>
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ one shot */

const ENTER_FRAMES: Record<string, number> = {cut: 0, 'slide-l': 9, 'slide-r': 9, 'slide-u': 9, 'wipe-l': 10, 'wipe-r': 10, 'wipe-u': 10, punch: 7, iris: 12, flash: 6, drop: 18};

const ShotView: React.FC<{shot: any; index: number; from: number; dur: number}> = ({shot, index, from, dur}) => {
	const {width: W, height: H} = useVideoConfig();
	const local = useCurrentFrame();
	const {voice, lead} = useScene();
	const {fps} = useVideoConfig();

	// ---- camera
	const c = shot.cam ?? {};
	const [z0, z1] = c.z ?? [1, 1.06];
	const [x0, x1] = c.x ?? [0.5, 0.5];
	const [y0, y1] = c.y ?? [0.5, 0.5];
	const pBase = clamp(local / Math.max(1, dur));
	let z = lerp(z0, z1, pBase);
	let fx = lerp(x0, x1, pBase);
	let fy = lerp(y0, y1, pBase);
	for (const k of c.keys ?? []) {
		const at = resolveCue(voice, lead, fps, k.at, Infinity) - from;
		if (!Number.isFinite(at)) continue;
		const p = prog(local - at, Math.round((k.secs ?? 0.8) * fps), easeInOut);
		if (k.z !== undefined) z = lerp(z, k.z, p);
		if (k.x !== undefined) fx = lerp(fx, k.x, p);
		if (k.y !== undefined) fy = lerp(fy, k.y, p);
	}
	let dx = 0;
	let dy = 0;
	for (const k of c.punch ?? []) {
		const dt = local - (resolveCue(voice, lead, fps, k, Infinity) - from);
		if (dt >= 0 && dt < 12) z += Math.sin((dt / 12) * Math.PI) * 0.07;
	}
	for (const k of c.shake ?? []) {
		const dt = local - (resolveCue(voice, lead, fps, k, Infinity) - from);
		if (dt >= 0 && dt < 16) {
			const a = (1 - dt / 16) * 22;
			dx += (rnd(local * 1.9) - 0.5) * a;
			dy += (rnd(local * 2.7 + 3) - 0.5) * a;
		}
	}
	const cam: Cam = {z, fx: fx * W, fy: fy * H, dx, dy};

	// ---- how this shot arrives over the previous one
	const kind: string = index === 0 ? 'cut' : shot.enter ?? 'punch';
	const n = ENTER_FRAMES[kind] ?? 8;
	const p = n === 0 ? 1 : prog(local, n, easeOut);
	const wrap: React.CSSProperties = {overflow: 'hidden'};
	let edge: React.ReactNode = null;
	const edgeBar = (style: React.CSSProperties) => <div style={{position: 'absolute', background: PROF.accent, borderStyle: 'solid', borderColor: PROF.ink, borderWidth: 0, ...style}} />;
	if (p < 1) {
		switch (kind) {
			case 'slide-l':
				wrap.transform = `translateX(${-(1 - p) * W}px)`;
				break;
			case 'slide-r':
				wrap.transform = `translateX(${(1 - p) * W}px)`;
				break;
			case 'slide-u':
				wrap.transform = `translateY(${(1 - p) * H}px)`;
				break;
			case 'wipe-r':
				wrap.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
				edge = edgeBar({left: p * W - 22, top: 0, width: 44, height: H, borderLeftWidth: 8, borderRightWidth: 8});
				break;
			case 'wipe-l':
				wrap.clipPath = `inset(0 0 0 ${(1 - p) * 100}%)`;
				edge = edgeBar({left: (1 - p) * W - 22, top: 0, width: 44, height: H, borderLeftWidth: 8, borderRightWidth: 8});
				break;
			case 'wipe-u':
				wrap.clipPath = `inset(${(1 - p) * 100}% 0 0 0)`;
				edge = edgeBar({left: 0, top: (1 - p) * H - 22, width: W, height: 44, borderTopWidth: 8, borderBottomWidth: 8});
				break;
			case 'punch':
				wrap.transform = `scale(${1 + (1 - p) * 0.3})`;
				wrap.opacity = clamp(local / 3);
				break;
			case 'iris':
				wrap.clipPath = `circle(${p * Math.hypot(W, H) * 0.72}px at ${(shot.irisAt?.[0] ?? 0.5) * W}px ${(shot.irisAt?.[1] ?? 0.45) * H}px)`;
				break;
			case 'drop':
				wrap.transform = `translateY(${-(1 - spr(local, fps, 9, 120, 0.9)) * H}px)`;
				break;
		}
	}
	const flash = kind === 'flash' ? 1 - clamp(local / 6) : 0;

	return (
		<ShotCtx.Provider value={{from, cam, index}}>
			<AbsoluteFill style={wrap}>
				<Bg spec={shot.bg ?? 'paper'} />
				{(shot.layers ?? []).map((layer: any, i: number) => (
					<LayerBox key={i} layer={layer} from={from} index={i} />
				))}
				{flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
			</AbsoluteFill>
			{edge}
		</ShotCtx.Provider>
	);
};

/* ------------------------------------------------------------------ the scene */

/**
 * A scene = one narration line cut into several shots (`shots`, each starting on a word cue).
 * visual: { type: "prof", sfx?: [{at, name, volume}], shots: [{at?, bg, enter?, cam?, layers: [...]}] }
 */
export const ProfScene: React.FC<{visual: Visual; drawOn: boolean}> = ({visual}) => {
	const {voice, lead, durationInFrames} = useScene();
	const {fps} = useVideoConfig();
	const shots: any[] = visual.shots ?? [];
	const starts: number[] = [];
	shots.forEach((s, i) => {
		if (i === 0) return starts.push(0);
		const f = resolveCue(voice, lead, fps, s.at, NaN);
		const prev = starts[i - 1];
		starts.push(Number.isFinite(f) ? Math.max(f, prev + 5) : prev + 30);
	});

	// sound effects: scene-level list + shot changes (soft whoosh) + layers that ask for one
	const sfx: {at: number; name: any; volume: number}[] = (visual.sfx ?? []).map((s: any) => ({at: resolveCue(voice, lead, fps, s.at, 0), name: s.name, volume: s.volume ?? 0.3}));
	shots.forEach((s, i) => {
		if (i > 0 && s.sfx !== false) sfx.push({at: starts[i], name: s.sfx ?? 'whoosh', volume: 0.16});
		(s.layers ?? []).forEach((l: any) => {
			if (l.sfx) sfx.push({at: resolveCue(voice, lead, fps, l.at, starts[i]) + Math.round((l.delay ?? 0) * fps), name: l.sfx, volume: l.sfxVolume ?? 0.26});
		});
	});

	return (
		<AbsoluteFill>
			{shots.map((shot, i) => {
				const from = starts[i];
				const next = i + 1 < shots.length ? starts[i + 1] : durationInFrames;
				const dur = next - from;
				return (
					<Sequence key={i} from={from} durationInFrames={dur + (i + 1 < shots.length ? 16 : 4)} name={`shot ${i + 1}`}>
						<ShotView shot={shot} index={i} from={from} dur={dur} />
					</Sequence>
				);
			})}
			{sfx.map((s, i) => (
				<Sfx key={i} name={s.name} at={s.at} volume={s.volume} />
			))}
		</AbsoluteFill>
	);
};
