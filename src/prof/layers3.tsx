import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeInOut, lerp, prog, spr} from './anim';
import {useLayer} from './layers';
import {useResolve, useSceneFrame} from './ShotCtx';
import {col, FONT, PROF} from './theme';

type L = {layer: any};
const px = (v: number | undefined, base: number, dflt: number) => (v ?? dflt) * base;

const useKeyed = (keys: {at: any; v: number}[] | undefined, dflt: number, glide = 20): number => {
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

/** Battery: `level` keys [{at, v}] (0..1). Low levels turn the bar into a black one with a warning mark. */
export const Battery: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const level = useKeyed(layer.level, 1, layer.glide ?? 24);
	const w = px(layer.w, width, 0.7);
	const h = w * 0.42;
	const low = level < 0.3;
	return (
		<svg width={w + 40} height={h} viewBox={`0 0 ${w + 40} ${h}`} style={{overflow: 'visible', display: 'block'}}>
			<rect x={0} y={0} width={w} height={h} rx={h * 0.2} fill={PROF.white} stroke={PROF.ink} strokeWidth={12} />
			<rect x={w + 6} y={h * 0.3} width={28} height={h * 0.4} rx={8} fill={PROF.ink} />
			<rect x={16} y={16} width={Math.max(0, (w - 32) * level)} height={h - 32} rx={h * 0.1} fill={low ? PROF.ink : PROF.accent} />
			<text x={w / 2} y={h / 2 + h * 0.17} textAnchor="middle" fontFamily={FONT.display} fontSize={Math.min(h * 0.5, (w * 0.9) / (String(layer.label ?? '100%').length * 0.5))} fill={low ? PROF.paper : PROF.ink}>
				{layer.label ?? `${Math.round(level * 100)}%`}
			</text>
		</svg>
	);
};

/** Browser window with tabs. tabs: [{label, at, closeAt?}]. A memory bar at the bottom fills with every open tab. */
export const Tabs: React.FC<L> = ({layer}) => {
	const {width, height, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.9);
	const h = (layer.h ?? 0.3) * height;
	const tabs: any[] = layer.tabs ?? [];
	const openAt = tabs.map((tb) => resolve(tb.at, Infinity));
	const closeAt = tabs.map((tb) => resolve(tb.closeAt, Infinity));
	const isOpen = (i: number) => f >= openAt[i] && f < closeAt[i];
	const nOpen = tabs.filter((_, i) => isOpen(i)).length;
	const fillP = nOpen / Math.max(1, tabs.length);
	const tabH = h * 0.2;
	const labelSize = Math.min(30, (w / Math.max(1, nOpen || 1)) * 0.16);
	let slot = 0;
	return (
		<div style={{width: w, height: h, background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 28, boxShadow: `18px 18px 0 ${PROF.ink}`, position: 'relative', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: tabH, background: PROF.soft, borderBottom: `8px solid ${PROF.ink}`}} />
			<svg width={w - 20} height={h - 20} viewBox={`0 0 ${w - 20} ${h - 20}`} style={{position: 'absolute', left: 0, top: 0}}>
				{tabs.map((tb, i) => {
					if (!isOpen(i)) return null;
					const n = Math.max(1, nOpen);
					const tw = Math.min(w * 0.3, (w - 60) / n);
					const x = 14 + slot * tw;
					slot++;
					const t = f - openAt[i];
					const pop = spr(t, fps, 12, 240, 0.6);
					const done = tb.done && f >= resolve(tb.done, Infinity);
					return (
						<g key={i} transform={`translate(0 ${(1 - pop) * -30})`}>
							<rect x={x} y={tabH * 0.28} width={tw - 6} height={tabH * 0.8} rx={12} fill={done ? PROF.accent : PROF.white} stroke={PROF.ink} strokeWidth={6} />
							<text x={x + 14} y={tabH * 0.72} fontFamily={FONT.sans} fontWeight={700} fontSize={Math.max(16, labelSize)} fill={PROF.ink}>
								{done ? '✓ ' : ''}
								{tb.label}
							</text>
						</g>
					);
				})}
				{/* page area: a spinner that spins faster and slower as memory fills */}
				<g transform={`translate(${(w - 20) / 2} ${h * 0.5})`}>
					<circle r={h * 0.1} fill="none" stroke={PROF.soft} strokeWidth={16} />
					<path d={`M 0 ${-h * 0.1} A ${h * 0.1} ${h * 0.1} 0 0 1 ${h * 0.1} 0`} fill="none" stroke={PROF.ink} strokeWidth={16} strokeLinecap="round" transform={`rotate(${f * (4 + fillP * 12)})`} opacity={fillP > 0.4 ? 1 : 0.15} />
				</g>
				<text x={22} y={h - 100} fontFamily={FONT.sans} fontWeight={700} fontSize={26} fill={PROF.graphite} letterSpacing={2}>
					{layer.barLabel ?? 'BRAIN MEMORY'}
				</text>
				<rect x={20} y={h - 82} width={w - 60} height={34} rx={17} fill={PROF.paper2} stroke={PROF.ink} strokeWidth={6} />
				<rect x={24} y={h - 78} width={Math.max(0, (w - 68) * fillP)} height={26} rx={13} fill={fillP > 0.7 ? PROF.ink : PROF.accent} />
			</svg>
		</div>
	);
};

/** Analog clock. `time` keys [{at, v}] where v = minutes since 12:00 (so 22:00 = 600, 1:00 am next day = 780). */
export const Clock: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const m = useKeyed(layer.time, 0, layer.glide ?? 40);
	const w = px(layer.w, width, 0.5);
	const r = w / 2;
	const minA = (m % 60) * 6;
	const hourA = ((m / 60) % 12) * 30;
	const hh = Math.floor(m / 60) % 24;
	const mm = Math.round(m % 60);
	const digital = `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')}`;
	return (
		<svg width={w} height={w} viewBox={`${-r - 14} ${-r - 14} ${w + 28} ${w + 28}`} style={{overflow: 'visible', display: 'block'}}>
			<circle r={r} fill={PROF.white} stroke={PROF.ink} strokeWidth={14} />
			{Array.from({length: 12}, (_, i) => (
				<line key={i} x1={0} y1={-r * 0.84} x2={0} y2={-r * (i % 3 === 0 ? 0.68 : 0.76)} stroke={PROF.ink} strokeWidth={i % 3 === 0 ? 10 : 5} strokeLinecap="round" transform={`rotate(${i * 30})`} />
			))}
			<line x1={0} y1={0} x2={0} y2={-r * 0.46} stroke={PROF.ink} strokeWidth={16} strokeLinecap="round" transform={`rotate(${hourA})`} />
			<line x1={0} y1={0} x2={0} y2={-r * 0.7} stroke={PROF.ink} strokeWidth={9} strokeLinecap="round" transform={`rotate(${minA})`} />
			<circle r={12} fill={PROF.accent} stroke={PROF.ink} strokeWidth={6} />
			{layer.digital !== false && (
				<text y={r * 0.5} textAnchor="middle" fontFamily={FONT.display} fontSize={r * 0.28} fill={PROF.graphite}>
					{digital}
				</text>
			)}
		</svg>
	);
};

export const LAYERS3: Record<string, React.FC<L>> = {battery: Battery, tabs: Tabs, clock: Clock};
