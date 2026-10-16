import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {cueFrame} from '../context';
import {Sfx, SfxName} from '../components/Sfx';
import {FELL, FELL_SC} from '../fonts';
import {captionTop} from '../scenes/stage';
import type {TimedScene} from '../types';
import {ART} from './art';
import {ArtCtx, ArtInfo, BookCamKey, Cam, PageDef, PanelDef} from './context';
import {BookDefs, clamp01, Ink, Reveal} from './ink';
import {BOOK, TONES, W} from './palette';
import {rng, roughLine, smooth} from './rough';

const ease = Easing.inOut(Easing.cubic);
/** How dark the rest of the page gets while one panel is lit. */
const SHADOW = 0.58;

type Box = {x: number; y: number; w: number; h: number};
type Key = {at: number; dur: number; target: Cam};

/** Panels (or the whole page) the camera can frame. */
const boxOf = (page: PageDef, ids: string | string[]): Box | null => {
	const list = (Array.isArray(ids) ? ids : [ids]).map((id) => page.panels.find((p) => p.id === id)).filter(Boolean) as PanelDef[];
	if (!list.length) return null;
	const x0 = Math.min(...list.map((p) => p.x));
	const y0 = Math.min(...list.map((p) => p.y));
	const x1 = Math.max(...list.map((p) => p.x + p.w));
	const y1 = Math.max(...list.map((p) => p.y + p.h));
	return {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
};

/** Absolute camera keys + named events + panel reveal times, from the scenes' cues. */
const plan = (page: PageDef, timeline: TimedScene[], fps: number, width: number, height: number) => {
	// the picture area above the burned-in captions
	const view = {x: width * 0.04, y: height * 0.035, w: width * 0.92, h: captionTop(width, height) - height * 0.065};
	const events = new Map<string, number>();
	const keys: Key[] = [];
	const firstVisit = new Map<string, number>();
	const sfx: {at: number; name: SfxName; volume: number}[] = [];
	let lastBox: Box = {x: 0, y: 0, w: page.width, h: page.height};
	timeline.forEach((s) => {
		const v = s.def.visual;
		if (v.type !== 'page') return;
		const at = (cue: string | number | undefined) => s.from + cueFrame(s.voice, s.lead, fps, cue, cue === undefined ? 0 : s.lead);
		events.set(`start:${s.def.id}`, s.from);
		events.set(`line:${s.def.id}`, s.from + s.lead);
		for (const [name, cue] of Object.entries((v.events ?? {}) as Record<string, string | number>)) events.set(name, at(cue));
		for (const k of (v.sfx ?? []) as {at?: string | number; name: SfxName; volume?: number}[]) sfx.push({at: at(k.at), name: k.name, volume: k.volume ?? 0.3});
		for (const k of (v.camera ?? []) as BookCamKey[]) {
			const t = at(k.at);
			const dur = Math.round((k.secs ?? 1.5) * fps);
			let target: Cam;
			if (k.page) {
				const z = k.zoom ?? Math.min((width * 0.94) / page.width, (height * 0.94) / page.height);
				target = {wx: page.width / 2, wy: page.height / 2, z, sx: width / 2, sy: height / 2, bx: -40, by: -40, bw: page.width + 80, bh: page.height + 80, dim: 0};
				lastBox = {x: 0, y: 0, w: page.width, h: page.height};
			} else {
				const box = (k.panel && boxOf(page, k.panel)) || lastBox;
				if (k.panel) {
					lastBox = box;
					for (const id of Array.isArray(k.panel) ? k.panel : [k.panel]) {
						if (!firstVisit.has(id)) firstVisit.set(id, t + Math.round(dur * 0.3));
					}
				}
				const fit = Math.min(view.w / box.w, view.h / box.h) * 0.97;
				const z = k.zoom ?? Math.min(fit, k.max ?? 3.1);
				const [fx, fy] = k.focus ?? [0.5, 0.5];
				const pad = 10;
				target = {wx: box.x + box.w * fx, wy: box.y + box.h * fy, z, sx: view.x + view.w / 2, sy: view.y + view.h / 2, bx: box.x - pad, by: box.y - pad, bw: box.w + pad * 2, bh: box.h + pad * 2, dim: SHADOW};
			}
			keys.push({at: t, dur, target});
		}
	});
	keys.sort((a, b) => a.at - b.at);
	const show = new Map<string, number>();
	page.panels.forEach((p) => {
		const explicit = events.get(`show:${p.id}`);
		const visit = firstVisit.get(p.id);
		const t = explicit ?? visit ?? -Infinity;
		show.set(p.id, t <= 2 ? -Infinity : t);
	});
	return {keys, events, show, sfx};
};

/** Camera at frame f: every key eases from wherever the camera is toward its target, with a slow drift once settled. */
const cameraAt = (keys: Key[], f: number, fps: number): Cam => {
	if (!keys.length) return {wx: 540, wy: 960, z: 1, sx: 540, sy: 960, bx: 0, by: 0, bw: 1080, bh: 1920, dim: 0};
	let c: Cam = {...keys[0].target};
	for (const k of keys) {
		const t = ease(clamp01((f - k.at) / Math.max(1, k.dur)));
		if (t <= 0) continue;
		// after a move settles, keep creeping in very slowly (+0.5 % per second, at most +3 %)
		const settled = Math.max(0, f - (k.at + k.dur)) / fps;
		const tz = k.target.z * (1 + Math.min(0.03, settled * 0.005));
		const mix = (from: number, to: number) => from + (to - from) * t;
		c = {
			wx: mix(c.wx, k.target.wx),
			wy: mix(c.wy, k.target.wy),
			sx: mix(c.sx, k.target.sx),
			sy: mix(c.sy, k.target.sy),
			z: Math.exp(Math.log(c.z) + (Math.log(tz) - Math.log(c.z)) * t),
			bx: mix(c.bx, k.target.bx),
			by: mix(c.by, k.target.by),
			bw: mix(c.bw, k.target.bw),
			bh: mix(c.bh, k.target.bh),
			dim: mix(c.dim, k.target.dim),
		};
	}
	return c;
};

/** Hand-drawn panel border: four strokes that overshoot the corners a little. */
const Border: React.FC<{w: number; h: number; seed: number; color: string}> = ({w, h, seed, color}) => {
	const lines = [
		roughLine(0, 0, w, 0, seed, 0.9, 4),
		roughLine(w, 0, w, h, seed + 1, 0.9, 4),
		roughLine(w, h, 0, h, seed + 2, 0.9, 4),
		roughLine(0, h, 0, 0, seed + 3, 0.9, 4),
	];
	return (
		<g>
			{lines.map((d, i) => (
				<Ink key={i} d={d} w={W.border} color={color} p={1} />
			))}
		</g>
	);
};

const Panel: React.FC<{page: PageDef; p: PanelDef; info: Omit<ArtInfo, 'w' | 'h' | 'panel' | 'show'>; show: number; index: number}> = ({p, info, show, index}) => {
	const tone = TONES[p.tone ?? 'cream'];
	const Art = ART[p.art];
	const a: ArtInfo = {...info, w: p.w, h: p.h, panel: p, show};
	const clip = `tb-clip-${p.id}`;
	const figP = Number.isFinite(show) ? clamp01((info.f - show - 30) / 20) : 1;
	const artVis = Number.isFinite(show) ? clamp01((info.f - show + 2) / 10) : 1;
	const pos = p.figPos ?? 'bl';
	const fx = pos.endsWith('l') ? 10 : p.w - 10;
	const fy = pos.startsWith('b') ? p.h - 10 : 22;
	return (
		<g transform={`translate(${p.x} ${p.y})`}>
			<clipPath id={clip}>
				<rect x={0} y={0} width={p.w} height={p.h} />
			</clipPath>
			<g clipPath={`url(#${clip})`}>
				<rect x={-4} y={-4} width={p.w + 8} height={p.h + 8} fill={tone.bg} />
				<rect x={0} y={0} width={p.w} height={p.h} fill="url(#tb-panel-light)" />
				<rect x={0} y={0} width={p.w} height={p.h} fill="url(#tb-wear)" opacity={0.45} />
				{artVis > 0 && (
					<g opacity={artVis}>
						<ArtCtx.Provider value={a}>{Art ? <Art {...(p.props ?? {})} /> : null}</ArtCtx.Provider>
					</g>
				)}
			</g>
			<Border w={p.w} h={p.h} seed={index * 17 + 3} color={BOOK.ink} />
			{p.fig && figP > 0 && (
				<text
					x={fx}
					y={fy}
					fontFamily={FELL}
					fontStyle="italic"
					fontSize={15}
					fill={tone.text}
					opacity={0.85 * figP}
					textAnchor={pos.endsWith('l') ? 'start' : 'end'}
				>
					{p.fig}
				</text>
			)}
		</g>
	);
};

/** The aged sheet itself: tone blotches, foxing, darker edges (all vector, in page space). */
const Sheet: React.FC<{page: PageDef}> = ({page}) => {
	const {width: w, height: h} = page;
	const blotches = useMemo(() => {
		const r = rng(5);
		return Array.from({length: 9}, () => ({x: r() * w, y: r() * h, rx: 120 + r() * 260, ry: 90 + r() * 200}));
	}, [w, h]);
	const fox = useMemo(() => {
		const r = rng(11);
		return Array.from({length: 26}, () => ({x: r() * w, y: r() * h, rad: 0.8 + r() * 3.2, o: 0.08 + r() * 0.18}));
	}, [w, h]);
	return (
		<g>
			{/* soft shadow of the page on the desk */}
			{[24, 16, 9, 4].map((s, i) => (
				<rect key={i} x={-s * 0.4} y={s * 0.2} width={w + s * 0.8} height={h + s * 0.8} rx={6} fill="#000" opacity={0.08} />
			))}
			<rect x={0} y={0} width={w} height={h} fill={BOOK.paper} />
			{blotches.map((b, i) => (
				<ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} fill="url(#tb-age)" />
			))}
			{fox.map((s, i) => (
				<circle key={i} cx={s.x} cy={s.y} r={s.rad} fill={BOOK.brown} opacity={s.o} />
			))}
			<defs>
				<linearGradient id="tb-edge-l" x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stopColor={BOOK.brown} stopOpacity={0.28} />
					<stop offset="1" stopColor={BOOK.brown} stopOpacity={0} />
				</linearGradient>
				<linearGradient id="tb-edge-t" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor={BOOK.brown} stopOpacity={0.24} />
					<stop offset="1" stopColor={BOOK.brown} stopOpacity={0} />
				</linearGradient>
			</defs>
			<rect x={0} y={0} width={60} height={h} fill="url(#tb-edge-l)" />
			<rect x={w - 60} y={0} width={60} height={h} fill="url(#tb-edge-l)" transform={`rotate(180 ${w - 30} ${h / 2})`} />
			<rect x={0} y={0} width={w} height={50} fill="url(#tb-edge-t)" />
			<rect x={0} y={h - 50} width={w} height={50} fill="url(#tb-edge-t)" transform={`rotate(180 ${w / 2} ${h - 25})`} />
			<rect x={0} y={0} width={w} height={h} fill="url(#tb-wear)" opacity={0.5} />
		</g>
	);
};

const Header: React.FC<{page: PageDef}> = ({page}) => {
	const w = page.width;
	return (
		<g>
			{page.plate && (
				<text x={w / 2} y={62} fontFamily={FELL_SC} fontSize={24} letterSpacing={6} fill={BOOK.ink} textAnchor="middle" opacity={0.85}>
					{page.plate}
				</text>
			)}
			{page.title && (
				<text x={w / 2} y={108} fontFamily={FELL} fontStyle="italic" fontSize={42} fill={BOOK.ink} textAnchor="middle">
					{page.title}
				</text>
			)}
			{page.subtitle && (
				<text x={w / 2} y={138} fontFamily={FELL} fontSize={18} fill={BOOK.brown} textAnchor="middle">
					{page.subtitle}
				</text>
			)}
			<Ink d={roughLine(44, 152, w - 44, 152, 3, 0.6)} w={1.6} p={1} />
			<Ink d={roughLine(44, 157, w - 44, 157, 4, 0.6)} w={0.8} p={1} second={false} />
		</g>
	);
};

const Footer: React.FC<{page: PageDef}> = ({page}) => {
	const lines = page.caption ?? [];
	const top = Math.max(...page.panels.map((p) => p.y + p.h)) + 44;
	return (
		<g>
			<Ink d={roughLine(44, top - 18, page.width - 44, top - 18, 9, 0.6)} w={0.8} p={1} second={false} />
			{lines.map((l, i) => (
				<text key={i} x={page.width / 2} y={top + 8 + i * 25} fontFamily={FELL} fontStyle={i === 0 ? 'normal' : 'italic'} fontSize={i === 0 ? 19 : 16} fill={BOOK.ink} opacity={i === 0 ? 0.9 : 0.75} textAnchor="middle">
					{l}
				</text>
			))}
		</g>
	);
};

/** Shadow over the page outside the lit panel (soft-edged), so the eye goes where the narration is. */
const Shadow: React.FC<{cam: Cam}> = ({cam}) => {
	if (cam.dim < 0.01) return null;
	return (
		<g>
			<defs>
				<filter id="tb-soft" x="-20%" y="-20%" width="140%" height="140%">
					<feGaussianBlur stdDeviation={9} />
				</filter>
				<mask id="tb-spot" maskUnits="userSpaceOnUse" x={-6000} y={-6000} width={14000} height={14000}>
					<rect x={-6000} y={-6000} width={14000} height={14000} fill="white" />
					<rect x={cam.bx} y={cam.by} width={cam.bw} height={cam.bh} rx={8} fill="black" filter="url(#tb-soft)" />
				</mask>
			</defs>
			<rect x={-6000} y={-6000} width={14000} height={14000} fill={BOOK.black} opacity={cam.dim} mask="url(#tb-spot)" />
		</g>
	);
};

/** Film grain + a few specks of dust + a soft vignette, in screen space (it is the "camera", not the page). */
const Grain: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const seed = Math.floor(frame / 2) % 7;
	const dust = Array.from({length: 4}, (_, i) => {
		const k = `${Math.floor(frame / 3)}-${i}`;
		const on = random(`on${k}`) < 0.35;
		return on ? {x: random(`x${k}`) * width, y: random(`y${k}`) * height, r: 0.8 + random(`r${k}`) * 2.2, hair: random(`h${k}`) < 0.25, a: random(`a${k}`) * Math.PI} : null;
	});
	return (
		<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
			<defs>
				<filter id="tb-grain" x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
					<feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.14  0 0 0 0 0.12  0 0 0 0.07 0" />
				</filter>
				<radialGradient id="tb-vignette" cx="0.5" cy="0.45" r="0.75">
					<stop offset="0.6" stopColor={BOOK.black} stopOpacity={0} />
					<stop offset="1" stopColor={BOOK.black} stopOpacity={0.32} />
				</radialGradient>
			</defs>
			<rect width={width} height={height} filter="url(#tb-grain)" />
			<rect width={width} height={height} fill="url(#tb-vignette)" />
			{dust.map((d, i) =>
				d ? (
					d.hair ? (
						<path key={i} d={smooth([[d.x, d.y], [d.x + Math.cos(d.a) * 14, d.y + Math.sin(d.a) * 9], [d.x + Math.cos(d.a) * 26, d.y + Math.sin(d.a) * 22]])} stroke={BOOK.black} strokeWidth={1} fill="none" opacity={0.35} />
					) : (
						<circle key={i} cx={d.x} cy={d.y} r={d.r} fill={BOOK.black} opacity={0.3} />
					)
				) : null,
			)}
		</svg>
	);
};

/**
 * The textbook page: one illustrated spread for the whole episode. Scenes only move the camera across it,
 * fire named events (lamp on, labels, ...) and add sounds; panels draw themselves on when first visited.
 */
export const BookPage: React.FC<{page: PageDef; timeline: TimedScene[]}> = ({page, timeline}) => {
	const f = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const {keys, events, show, sfx} = useMemo(() => plan(page, timeline, fps, width, height), [page, timeline, fps, width, height]);
	const cam = cameraAt(keys, f, fps);
	const info = {f, fps, ev: (n: string) => events.get(n) ?? Infinity, cam};
	// what part of the page is on screen (skip panels that are not)
	const vx0 = cam.wx - cam.sx / cam.z;
	const vy0 = cam.wy - cam.sy / cam.z;
	const vx1 = vx0 + width / cam.z;
	const vy1 = vy0 + height / cam.z;
	const visible = (p: PanelDef) => p.x + p.w > vx0 - 20 && p.x < vx1 + 20 && p.y + p.h > vy0 - 20 && p.y < vy1 + 20;
	return (
		<AbsoluteFill style={{background: BOOK.black}}>
			<svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
				<BookDefs />
				<g transform={`translate(${cam.sx} ${cam.sy}) scale(${cam.z}) translate(${-cam.wx} ${-cam.wy})`}>
					<Sheet page={page} />
					<Header page={page} />
					<Footer page={page} />
					{page.panels.map((p, i) => (visible(p) ? <Panel key={p.id} page={page} p={p} info={info} show={show.get(p.id) ?? -Infinity} index={i} /> : null))}
					{(page.threads ?? []).map((t, i) => {
						const at = events.get(t.at) ?? Infinity;
						const p = Number.isFinite(at) ? clamp01((f - at) / ((t.secs ?? 1.4) * fps)) : 0;
						return (
							<Reveal key={i} p={ease(p)}>
								<Ink d={smooth(t.points)} w={t.width ?? W.bold} color={t.color ?? BOOK.terracotta} />
							</Reveal>
						);
					})}
					<Shadow cam={cam} />
				</g>
			</svg>
			<Grain />
			{sfx.map((s, i) => (
				<Sfx key={i} name={s.name} at={s.at} volume={s.volume} />
			))}
		</AbsoluteFill>
	);
};
