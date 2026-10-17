import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, prog, rnd, spr} from './anim';
import {useLayer} from './layers';
import {useResolve, useSceneFrame} from './ShotCtx';
import {col, FONT, PROF} from './theme';

type L = {layer: any};
const px = (v: number | undefined, base: number, dflt: number) => (v ?? dflt) * base;

/** Value that glides between keyed targets: keys [{at, v}], first key is the start value. */
const useKeyed = (keys: {at: any; v: number}[] | undefined, dflt: number, glide = 16): number => {
	const resolve = useResolve();
	const f = useSceneFrame();
	let cur = keys?.[0]?.v ?? dflt;
	let from = cur;
	let at = -Infinity;
	for (const k of keys ?? []) {
		const kf = resolve(k.at, 0);
		if (f >= kf) {
			from = at === -Infinity ? k.v : cur;
			cur = k.v;
			at = kf;
		}
	}
	return at === -Infinity ? cur : lerp(from, cur, prog(f - at, glide, easeInOut));
};

/* ------------------------------------------------------------------ balance scale */

/**
 * Balance scale. Left pan collects `count` yellow coins (one by one from `leftAt`), the right pan gets one heavy dark
 * block at `rightAt`. `tilt` keys: -1 (left pan down) .. 1 (right pan down).
 */
export const Scale: React.FC<L> = ({layer}) => {
	const {width, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.9);
	const h = w * 0.78;
	const tilt = useKeyed(layer.tilt, 0, 22);
	const ang = tilt * 11;
	const beamLen = w * 0.6;
	const cx = w / 2;
	const beamY = h * 0.2;
	const rad = (ang * Math.PI) / 180;
	const lx = cx - (Math.cos(rad) * beamLen) / 2;
	const ly = beamY - (Math.sin(rad) * beamLen) / 2;
	const rx = cx + (Math.cos(rad) * beamLen) / 2;
	const ry = beamY + (Math.sin(rad) * beamLen) / 2;
	const drop = h * 0.34;
	const panW = w * 0.27;
	const count: number = layer.count ?? 10;
	const leftAt = resolve(layer.leftAt, 0);
	const rightAt = resolve(layer.rightAt, 0);
	const coinR = w * 0.026;
	const Pan = ({x, y, children}: {x: number; y: number; children: React.ReactNode}) => (
		<g>
			<line x1={x - panW / 2} y1={y} x2={x} y2={y - drop} stroke={PROF.ink} strokeWidth={6} />
			<line x1={x + panW / 2} y1={y} x2={x} y2={y - drop} stroke={PROF.ink} strokeWidth={6} />
			<path d={`M ${x - panW / 2} ${y} L ${x + panW / 2} ${y} Q ${x + panW * 0.42} ${y + w * 0.06} ${x} ${y + w * 0.06} Q ${x - panW * 0.42} ${y + w * 0.06} ${x - panW / 2} ${y} Z`} fill={PROF.white} stroke={PROF.ink} strokeWidth={8} strokeLinejoin="round" />
			{children}
		</g>
	);
	const lpy = ly + drop;
	const rpy = ry + drop;
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible', display: 'block'}}>
			<path d={`M ${cx} ${beamY} L ${cx} ${h * 0.97}`} stroke={PROF.ink} strokeWidth={16} />
			<path d={`M ${cx - w * 0.14} ${h * 0.97} L ${cx + w * 0.14} ${h * 0.97}`} stroke={PROF.ink} strokeWidth={18} strokeLinecap="round" />
			<line x1={lx} y1={ly} x2={rx} y2={ry} stroke={PROF.ink} strokeWidth={20} strokeLinecap="round" />
			<circle cx={cx} cy={beamY} r={w * 0.028} fill={PROF.accent} stroke={PROF.ink} strokeWidth={7} />
			<Pan x={lx} y={lpy}>
				{Array.from({length: count}, (_, i) => {
					const t = f - (leftAt + i * 3);
					if (t < 0) return null;
					const s = spr(t, fps, 11, 240, 0.6);
					const cols = Math.min(count, 5);
					const col2 = i % 5;
					const row = Math.floor(i / 5);
					const x = lx + (col2 - (cols - 1) / 2) * coinR * 2.1;
					const y = lpy - coinR * 1.2 - row * coinR * 2.0 - (1 - s) * 90;
					return (
						<g key={i}>
							<circle cx={x} cy={y} r={coinR * s} fill={PROF.accent} stroke={PROF.ink} strokeWidth={5} />
							<path d={`M ${x - coinR * 0.4} ${y} L ${x + coinR * 0.4} ${y} M ${x} ${y - coinR * 0.4} L ${x} ${y + coinR * 0.4}`} stroke={PROF.ink} strokeWidth={5} strokeLinecap="round" opacity={s} />
						</g>
					);
				})}
			</Pan>
			<Pan x={rx} y={rpy}>
				{f >= rightAt && (() => {
					const s = spr(f - rightAt, fps, 9, 200, 0.8);
					const bw = w * 0.17;
					const y = rpy - bw * 0.95 - (1 - s) * 160;
					return (
						<g>
							<rect x={rx - bw / 2} y={y} width={bw} height={bw * 0.95} rx={14} fill={PROF.ink} />
							<path d={`M ${rx - bw * 0.22} ${y + bw * 0.47} L ${rx + bw * 0.22} ${y + bw * 0.47}`} stroke={PROF.accent} strokeWidth={14} strokeLinecap="round" />
						</g>
					);
				})()}
			</Pan>
		</svg>
	);
};

/* ------------------------------------------------------------------ eyes */

/**
 * A pair of cartoon eyes. `look` keys [{at, x, y}] move the pupils (-1..1); `jitter` makes them dart about; `blur` softens
 * them (hard-to-read gaze); they blink now and then.
 */
export const Eyes: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.6);
	const h = w * 0.42;
	let lx = layer.look?.[0]?.x ?? 0;
	let ly = layer.look?.[0]?.y ?? 0;
	let fromX = lx;
	let fromY = ly;
	let at = -Infinity;
	for (const k of layer.look ?? []) {
		const kf = resolve(k.at, 0);
		if (f >= kf) {
			fromX = at === -Infinity ? k.x : lx;
			fromY = at === -Infinity ? k.y : ly;
			lx = k.x;
			ly = k.y;
			at = kf;
		}
	}
	const p = at === -Infinity ? 1 : prog(f - at, 7, easeOut);
	let ox = lerp(fromX, lx, p);
	let oy = lerp(fromY, ly, p);
	const jit = layer.jitter ?? 0;
	if (jit) {
		const k = Math.floor(f / 3);
		ox += (rnd(k * 1.7) - 0.5) * 2 * jit;
		oy += (rnd(k * 2.9 + 1) - 0.5) * 1.2 * jit;
	}
	const blur = layer.blur ?? 0;
	const pupilK = useKeyed(layer.pupil, 1, 30);
	const bt = f % 96;
	const blink = bt > 90 ? 1 - Math.abs(bt - 93) / 3 : 0;
	const eyeW = w * 0.4;
	const eye = (cx: number) => (
		<g key={cx}>
			<ellipse cx={cx} cy={h / 2} rx={eyeW / 2} ry={(h / 2) * (1 - blink * 0.92)} fill={PROF.white} stroke={PROF.ink} strokeWidth={w * 0.025} />
			<g clipPath={`url(#eyeclip-${layer.id ?? 'e'}-${cx})`}>
				<circle cx={cx + ox * eyeW * 0.28} cy={h / 2 + oy * h * 0.26} r={h * 0.27 * pupilK} fill={PROF.ink} />
				<circle cx={cx + ox * eyeW * 0.28 - h * 0.09} cy={h / 2 + oy * h * 0.26 - h * 0.09} r={h * 0.07} fill={PROF.white} />
			</g>
			<clipPath id={`eyeclip-${layer.id ?? 'e'}-${cx}`}>
				<ellipse cx={cx} cy={h / 2} rx={eyeW / 2} ry={(h / 2) * (1 - blink * 0.92)} />
			</clipPath>
		</g>
	);
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible', display: 'block', filter: blur ? `blur(${blur}px)` : undefined}}>
			{eye(w * 0.25)}
			{eye(w * 0.75)}
		</svg>
	);
};

/* ------------------------------------------------------------------ glasses */

/** Glasses filled to a level: items [{label, level (0..1), at}]. */
export const Cups: React.FC<L> = ({layer}) => {
	const {width, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.92);
	const items: any[] = layer.items ?? [];
	const cw = (w / items.length) * 0.62;
	const ch = cw * 1.5;
	return (
		<svg width={w} height={ch + 120} viewBox={`0 0 ${w} ${ch + 120}`} style={{overflow: 'visible', display: 'block'}}>
			{items.map((it, i) => {
				const cx = (w / items.length) * (i + 0.5);
				const at = resolve(it.at, 0);
				if (f < at) return null;
				const t = f - at;
				const pop = spr(t, fps, 12, 200, 0.7);
				const fill = prog(t - 6, 26, easeInOut) * (it.level ?? 0.5);
				const top = 40;
				const x0 = cx - cw / 2;
				const inner = ch - 20;
				const level = inner * fill;
				const id = `cup-${layer.id ?? 'c'}-${i}`;
				return (
					<g key={i} transform={`translate(0 ${(1 - pop) * 60})`} opacity={clamp(t / 4)}>
						<clipPath id={id}>
							<path d={`M ${x0 + 8} ${top} L ${x0 + cw - 8} ${top} L ${x0 + cw - cw * 0.14} ${top + ch} L ${x0 + cw * 0.14} ${top + ch} Z`} />
						</clipPath>
						<g clipPath={`url(#${id})`}>
							<rect x={x0} y={top + ch - level} width={cw} height={level + 4} fill={it.color ? col(it.color) : PROF.graphite} />
							<rect x={x0} y={top + ch - level} width={cw} height={10} fill={PROF.ink} opacity={0.5} />
						</g>
						<path d={`M ${x0} ${top} L ${x0 + cw} ${top} L ${x0 + cw - cw * 0.12} ${top + ch} L ${x0 + cw * 0.12} ${top + ch} Z`} fill="none" stroke={PROF.ink} strokeWidth={10} strokeLinejoin="round" />
						<text x={cx} y={top + ch + 78} textAnchor="middle" fontFamily={FONT.display} fontSize={cw * 0.3} fill={col(layer.labelColor ?? 'ink')} letterSpacing={1}>
							{it.label}
						</text>
						{it.sub && (
							<text x={cx} y={top + ch + 78 + cw * 0.26} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={cw * 0.17} fill={col(layer.labelColor ?? 'graphite')}>
								{it.sub}
							</text>
						)}
					</g>
				);
			})}
		</svg>
	);
};

/* ------------------------------------------------------------------ stress curve */

/** Inverted-U card: chance of an event (0..100%) against stress; a dot slides along it. Labels are qualitative. */
export const Curve: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const {t} = useLayer();
	const dot = useKeyed(layer.dot, 0.5, 26);
	const w = px(layer.w, width, 0.9);
	const h = (layer.h ?? 0.3) * height;
	const pad = w * 0.09;
	const gx = (u: number) => pad + u * (w - pad * 2 - 20);
	const gy = (v: number) => h * 0.78 - v * h * 0.56;
	const val = (u: number) => 1 - (2 * u - 1) ** 2 * 0.86;
	const N = 60;
	const d = Array.from({length: N + 1}, (_, i) => `${i ? 'L' : 'M'}${gx(i / N).toFixed(1)} ${gy(val(i / N)).toFixed(1)}`).join(' ');
	const reveal = prog(t, 12);
	const peak = dot > 0.42 && dot < 0.58;
	return (
		<div style={{width: w, height: h, background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 32, boxShadow: `20px 20px 0 ${PROF.ink}`, position: 'relative', overflow: 'hidden', opacity: reveal}}>
			<svg width={w - 20} height={h - 20} viewBox={`0 0 ${w - 20} ${h - 20}`} style={{position: 'absolute', left: 0, top: 0}}>
				<line x1={pad} x2={w - pad} y1={h * 0.8} y2={h * 0.8} stroke={PROF.ink} strokeWidth={6} />
				<line x1={pad} x2={pad} y1={h * 0.14} y2={h * 0.8} stroke={PROF.ink} strokeWidth={6} />
				{[0, 0.5, 1].map((u, i) => (
					<text key={i} x={gx(u)} y={h * 0.8 + 42} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={34} fill={PROF.ink}>
						{['0%', '50%', '100%'][i]}
					</text>
				))}
				<text x={w * 0.5} y={h * 0.8 + 86} textAnchor="middle" fontFamily={FONT.sans} fontWeight={500} fontSize={28} fill={PROF.graphite} letterSpacing={2}>
					CHANCE OF A SHOCK
				</text>
				<text x={pad + 12} y={h * 0.12} fontFamily={FONT.sans} fontWeight={700} fontSize={30} fill={PROF.ink} letterSpacing={2}>
					STRESS
				</text>
				<path d={d} fill="none" stroke={PROF.ink} strokeWidth={22} strokeLinecap="round" />
				<path d={d} fill="none" stroke={PROF.accent} strokeWidth={11} strokeLinecap="round" />
				<circle cx={gx(dot)} cy={gy(val(dot))} r={peak ? 30 : 22} fill={peak ? PROF.accent : PROF.ink} stroke={PROF.ink} strokeWidth={8} />
			</svg>
		</div>
	);
};

/* ------------------------------------------------------------------ bars */

/** Vertical bars: items [{label, value (0..1), color, at, text}]. `gap: [i, j]` draws a yellow bracket between two bars. */
export const Bars: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.84);
	const h = (layer.h ?? 0.3) * height;
	const items: any[] = layer.items ?? [];
	const bw = (w / items.length) * 0.56;
	const base = h * 0.84;
	const top = (it: any, t: number) => base - (base - h * 0.08) * (it.value ?? 0.5) * prog(t, 22, easeOut);
	let gapEl: React.ReactNode = null;
	if (layer.gap) {
		const [a, b] = layer.gap as [number, number];
		const ia = items[a];
		const ib = items[b];
		const t = f - resolve(layer.gapAt ?? ib.at, 0);
		if (t >= 0) {
			const ya = top(ia, 99);
			const yb = top(ib, 99);
			const x = (w / items.length) * (b + 0.5) + bw / 2 + 24;
			const p = prog(t, 12);
			gapEl = (
				<g opacity={p}>
					<path d={`M ${x} ${ya} L ${x + 24} ${ya} L ${x + 24} ${yb} L ${x} ${yb}`} fill="none" stroke={PROF.ink} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
					<path d={`M ${x} ${ya} L ${x + 24} ${ya} L ${x + 24} ${yb} L ${x} ${yb}`} fill="none" stroke={PROF.accent} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
				</g>
			);
		}
	}
	return (
		<svg width={w + 90} height={h} viewBox={`0 0 ${w + 90} ${h}`} style={{overflow: 'visible', display: 'block'}}>
			<line x1={0} x2={w} y1={base} y2={base} stroke={PROF.ink} strokeWidth={8} strokeLinecap="round" />
			{items.map((it, i) => {
				const at = resolve(it.at, 0);
				if (f < at) return null;
				const t = f - at;
				const cx = (w / items.length) * (i + 0.5);
				const y = top(it, t);
				return (
					<g key={i}>
						<rect x={cx - bw / 2} y={y} width={bw} height={base - y} rx={12} fill={col(it.color ?? 'graphite')} stroke={PROF.ink} strokeWidth={8} />
						<text x={cx} y={base + 54} textAnchor="middle" fontFamily={FONT.display} fontSize={bw * 0.24} fill={col(layer.labelColor ?? 'ink')} letterSpacing={1}>
							{it.label}
						</text>
						{it.text && (
							<text x={cx} y={y - 20} textAnchor="middle" fontFamily={FONT.display} fontSize={bw * 0.36} fill={col(layer.labelColor ?? 'ink')} opacity={prog(t - 14, 8)}>
								{it.text}
							</text>
						)}
					</g>
				);
			})}
			{gapEl}
		</svg>
	);
};

/* ------------------------------------------------------------------ months */

/** Row of months, each with two markers ("what they felt" high, "what you think" low) so the gap stays visible. */
export const Months: React.FC<L> = ({layer}) => {
	const {width, fps: FPS} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.9);
	const names: string[] = layer.names ?? ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'];
	const cell = w / names.length;
	return (
		<svg width={w} height={cell * 2.6} viewBox={`0 0 ${w} ${cell * 2.6}`} style={{overflow: 'visible', display: 'block'}}>
			{names.map((n, i) => {
				const s = spr(t - i * 5, FPS, 12, 220, 0.6);
				const cx = cell * (i + 0.5);
				return (
					<g key={n} opacity={clamp((t - i * 5) / 4)} transform={`translate(0 ${(1 - s) * 40})`}>
						<line x1={cx} x2={cx} y1={cell * 0.55} y2={cell * 1.5} stroke={PROF.ink} strokeWidth={5} strokeDasharray="2 10" strokeLinecap="round" />
						<circle cx={cx} cy={cell * 0.55} r={cell * 0.2} fill={PROF.accent} stroke={PROF.ink} strokeWidth={6} />
						<circle cx={cx} cy={cell * 1.5} r={cell * 0.2} fill={PROF.graphite} stroke={PROF.ink} strokeWidth={6} />
						<text x={cx} y={cell * 2.2} textAnchor="middle" fontFamily={FONT.display} fontSize={cell * 0.36} fill={col(layer.labelColor ?? 'ink')} letterSpacing={1}>
							{n}
						</text>
					</g>
				);
			})}
		</svg>
	);
};

/* ------------------------------------------------------------------ misc */

/** Magnifier for "looking closer" shots. */
export const Gaze: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.8);
	const n = layer.rays ?? 9;
	return (
		<svg width={w} height={w} viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`} style={{overflow: 'visible', display: 'block', transform: `rotate(${layer.rot ?? 0}deg)`}}>
			{Array.from({length: n}, (_, i) => {
				const a = ((i - (n - 1) / 2) / n) * 1.3;
				const len = w * 0.48;
				const p = (((t * 0.03 + i * 0.13) % 1) + 1) % 1;
				return <line key={i} x1={Math.sin(a) * w * 0.06} y1={-Math.cos(a) * w * 0.06} x2={Math.sin(a) * len * (0.5 + p * 0.5)} y2={-Math.cos(a) * len * (0.5 + p * 0.5)} stroke={col(layer.color ?? 'ink')} strokeWidth={layer.strokeW ?? 9} strokeDasharray="2 22" strokeLinecap="round" opacity={0.35 + (1 - p) * 0.65} />;
			})}
		</svg>
	);
};


/* ------------------------------------------------------------------ rocks */

/** Rocks you turn over: items [{at, snake}]. Each lifts and flips at its cue, showing a snake or nothing; a bolt = shock. */
export const Rocks: React.FC<L> = ({layer}) => {
	const {width, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.86);
	const items: any[] = layer.items ?? [{}, {}, {}];
	const n = items.length;
	const cell = w / n;
	return (
		<svg width={w} height={cell * 1.3} viewBox={`0 0 ${w} ${cell * 1.3}`} style={{overflow: 'visible', display: 'block'}}>
			{items.map((it, i) => {
				const cx = cell * (i + 0.5);
				const cy = cell * 0.75;
				const s = spr(t - i * 4, fps, 12, 220, 0.6);
				const at = resolve(it.at, Infinity);
				const lift = Number.isFinite(at) ? prog(f - at, 14, easeOut) : 0;
				return (
					<g key={i} opacity={clamp((t - i * 4) / 4)} transform={`translate(0 ${(1 - s) * 50})`}>
						{/* what is underneath */}
						<ellipse cx={cx} cy={cy + cell * 0.2} rx={cell * 0.36} ry={cell * 0.14} fill={PROF.ink} opacity={0.18} />
						{it.snake && lift > 0.2 && (
							<g opacity={lift}>
								<path d={`M ${cx - cell * 0.3} ${cy + cell * 0.18} q ${cell * 0.15} ${-cell * 0.3} ${cell * 0.3} 0 t ${cell * 0.3} 0`} fill="none" stroke={PROF.ink} strokeWidth={cell * 0.17} strokeLinecap="round" />
								<path d={`M ${cx - cell * 0.3} ${cy + cell * 0.18} q ${cell * 0.15} ${-cell * 0.3} ${cell * 0.3} 0 t ${cell * 0.3} 0`} fill="none" stroke={PROF.accent} strokeWidth={cell * 0.09} strokeLinecap="round" />
								<circle cx={cx + cell * 0.3} cy={cy + cell * 0.14} r={cell * 0.035} fill={PROF.ink} />
							</g>
						)}
						{it.shock && lift > 0.6 && (
							<path d={`M ${cx + cell * 0.05} ${cy - cell * 0.5} L ${cx - cell * 0.12} ${cy - cell * 0.12} L ${cx} ${cy - cell * 0.12} L ${cx - cell * 0.06} ${cy + cell * 0.2} L ${cx + cell * 0.16} ${cy - cell * 0.2} L ${cx + cell * 0.04} ${cy - cell * 0.2} Z`} fill={PROF.accent} stroke={PROF.ink} strokeWidth={6} strokeLinejoin="round" />
						)}
						{/* the rock */}
						<g transform={`translate(${cx} ${cy}) translate(${lift * cell * 0.1} ${-lift * cell * 0.42}) rotate(${lift * -24})`}>
							<path d={`M ${-cell * 0.38} ${cell * 0.16} Q ${-cell * 0.42} ${-cell * 0.2} ${-cell * 0.12} ${-cell * 0.3} Q ${cell * 0.2} ${-cell * 0.38} ${cell * 0.38} ${-cell * 0.02} Q ${cell * 0.44} ${cell * 0.18} ${cell * 0.2} ${cell * 0.22} Z`} fill={PROF.mid} stroke={PROF.ink} strokeWidth={8} strokeLinejoin="round" />
							<path d={`M ${-cell * 0.2} ${-cell * 0.08} q ${cell * 0.1} ${-cell * 0.06} ${cell * 0.2} 0 M ${cell * 0.05} ${cell * 0.08} q ${cell * 0.1} ${-cell * 0.05} ${cell * 0.18} 0`} stroke={PROF.graphite} strokeWidth={6} fill="none" strokeLinecap="round" />
						</g>
					</g>
				);
			})}
		</svg>
	);
};

export const LAYERS2: Record<string, React.FC<L>> = {rocks: Rocks, scale: Scale, eyes: Eyes, cups: Cups, curve: Curve, bars: Bars, months: Months, gaze: Gaze};
