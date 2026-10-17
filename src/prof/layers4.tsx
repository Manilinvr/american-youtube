import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, prog, spr} from './anim';
import {useLayer} from './layers';
import {useResolve, useSceneFrame} from './ShotCtx';
import {col, FONT, PROF} from './theme';

type L = {layer: any};
const px = (v: number | undefined, base: number, dflt: number) => (v ?? dflt) * base;

/** Argument card: kind "for" (yellow header + tick), "against" (black header + cross), "neutral". */
export const Card: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const w = px(layer.w, width, 0.84);
	const size = layer.size ?? 54;
	const kind: string = layer.kind ?? 'neutral';
	const head = kind === 'for' ? PROF.accent : kind === 'against' ? PROF.ink : PROF.soft;
	const headText = kind === 'against' ? PROF.paper : PROF.ink;
	const icon = kind === 'for' ? 'M4 12 L10 18 L20 6' : kind === 'against' ? 'M5 5 L19 19 M19 5 L5 19' : 'M4 12 L20 12';
	return (
		<div style={{width: w, background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 30, boxShadow: `18px 18px 0 ${PROF.ink}`, overflow: 'hidden'}}>
			<div style={{background: head, color: headText, padding: `${size * 0.28}px ${size * 0.6}px`, display: 'flex', alignItems: 'center', gap: size * 0.4, fontFamily: FONT.sans, fontWeight: 700, fontSize: size * 0.62, letterSpacing: size * 0.04, textTransform: 'uppercase', borderBottom: `8px solid ${PROF.ink}`}}>
				<svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" stroke={headText} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
					<path d={icon} />
				</svg>
				{layer.title}
			</div>
			<div style={{padding: `${size * 0.5}px ${size * 0.6}px`, fontFamily: FONT.display, fontSize: size, lineHeight: 1.08, color: PROF.ink, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{layer.text}</div>
		</div>
	);
};

/** Rubber stamp (verdict). */
export const Stamp: React.FC<L> = ({layer}) => {
	const {t} = useLayer();
	const size = layer.size ?? 190;
	const k = clamp(t / 4);
	return (
		<div style={{display: 'inline-block', transform: `rotate(${layer.tilt ?? -7}deg)`, opacity: 0.2 + 0.8 * k}}>
			<div style={{border: `${size * 0.07}px solid ${PROF.ink}`, outline: `${size * 0.03}px solid ${PROF.ink}`, outlineOffset: size * 0.05, background: col(layer.bg ?? 'accent'), color: PROF.ink, padding: `${size * 0.1}px ${size * 0.3}px`, fontFamily: FONT.display, fontSize: size, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center', boxShadow: `${size * 0.08}px ${size * 0.08}px 0 ${PROF.ink}`}}>
				{layer.text}
				{layer.sub && <div style={{fontFamily: FONT.sans, fontWeight: 700, fontSize: size * 0.22, letterSpacing: size * 0.02, marginTop: size * 0.06}}>{layer.sub}</div>}
			</div>
		</div>
	);
};

/** Line chart on a card. series [{pts:[[x,y],..] 0..1, color, label, at, dash}], marks [{x,label,at}]. */
export const Chart: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.9);
	const h = (layer.h ?? 0.3) * height;
	const padL = w * 0.1;
	const padB = h * 0.18;
	const gx = (u: number) => padL + u * (w - padL - 40);
	const gy = (v: number) => h - padB - v * (h - padB - 36);
	const marks: any[] = layer.marks ?? [];
	return (
		<div style={{width: w, height: h, background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 30, boxShadow: `18px 18px 0 ${PROF.ink}`, position: 'relative', overflow: 'hidden', opacity: prog(t, 8)}}>
			<svg width={w - 20} height={h - 20} viewBox={`0 0 ${w - 20} ${h - 20}`} style={{position: 'absolute', left: 0, top: 0}}>
				<line x1={padL} x2={w - 40} y1={h - padB} y2={h - padB} stroke={PROF.ink} strokeWidth={6} strokeLinecap="round" />
				<line x1={padL} x2={padL} y1={30} y2={h - padB} stroke={PROF.ink} strokeWidth={6} strokeLinecap="round" />
				<text x={(padL + w - 40) / 2} y={h - padB + 52} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={Math.min(34, w * 0.04)} fill={PROF.graphite} letterSpacing={2}>
					{layer.xlabel}
				</text>
				<text transform={`translate(${padL - 22} ${(h - padB) / 2 + 20}) rotate(-90)`} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={Math.min(34, w * 0.04)} fill={PROF.graphite} letterSpacing={2}>
					{layer.ylabel}
				</text>
				{marks.map((m, i) => {
					const at = resolve(m.at, 0);
					if (f < at) return null;
					const p = prog(f - at, 10);
					return (
						<g key={i} opacity={p}>
							<line x1={gx(m.x)} x2={gx(m.x)} y1={30} y2={h - padB} stroke={PROF.ink} strokeWidth={5} strokeDasharray="14 12" />
							<text x={gx(m.x)} y={h - padB + 52} textAnchor="middle" fontFamily={FONT.display} fontSize={36} fill={PROF.ink}>
								{m.label}
							</text>
						</g>
					);
				})}
				{(layer.series ?? []).map((s: any, i: number) => {
					const at = resolve(s.at, 0);
					if (f < at) return null;
					const p = prog(f - at, s.dur ?? 40, easeInOut);
					const d = s.pts.map(([x, y]: number[], k: number) => `${k ? 'L' : 'M'}${gx(x).toFixed(1)} ${gy(y).toFixed(1)}`).join(' ');
					const last = s.pts[s.pts.length - 1];
					return (
						<g key={i}>
							<path d={d} pathLength={1} strokeDasharray={s.dash ? undefined : `${p} 1`} fill="none" stroke={PROF.ink} strokeWidth={(s.width ?? 14) + 10} strokeLinecap="round" strokeLinejoin="round" opacity={s.dash ? 0 : 1} />
							<path d={d} pathLength={1} strokeDasharray={s.dash ? `0.02 0.02` : `${p} 1`} fill="none" stroke={col(s.color ?? 'accent')} strokeWidth={s.width ?? 14} strokeLinecap="round" strokeLinejoin="round" opacity={s.dash ? p : 1} />
							{s.label && p > 0.9 && (
								<text x={gx(last[0]) - 10} y={gy(last[1]) - 26} textAnchor="end" fontFamily={FONT.display} fontSize={36} fill={PROF.ink}>
									{s.label}
								</text>
							)}
						</g>
					);
				})}
			</svg>
		</div>
	);
};

/** Paired bars per group: a (dark, "real") and b (yellow, "guess"). groups [{label, a, b, at}]. */
export const Pairs: React.FC<L> = ({layer}) => {
	const {width, height, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.86);
	const h = (layer.h ?? 0.3) * height;
	const groups: any[] = layer.groups ?? [];
	const cw = w / groups.length;
	const bw = cw * 0.3;
	const base = h * 0.78;
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible', display: 'block'}}>
			<line x1={0} x2={w} y1={base} y2={base} stroke={PROF.ink} strokeWidth={8} strokeLinecap="round" />
			{groups.map((g, i) => {
				const at = resolve(g.at, 0);
				if (f < at) return null;
				const t = f - at;
				const cx = cw * (i + 0.5);
				const ha = (base - h * 0.06) * g.a * prog(t, 18, easeOut);
				const hb = (base - h * 0.06) * g.b * prog(t - 8, 18, easeOut);
				return (
					<g key={i}>
						<rect x={cx - bw - 6} y={base - ha} width={bw} height={ha} rx={10} fill={PROF.graphite} stroke={PROF.ink} strokeWidth={7} />
						<rect x={cx + 6} y={base - hb} width={bw} height={hb} rx={10} fill={PROF.accent} stroke={PROF.ink} strokeWidth={7} />
						<text x={cx} y={base + 50} textAnchor="middle" fontFamily={FONT.display} fontSize={cw * 0.16} fill={col(layer.labelColor ?? 'ink')} letterSpacing={1}>
							{g.label}
						</text>
					</g>
				);
			})}
			<g transform={`translate(0 ${-h * 0.04})`}>
				<rect x={0} y={0} width={34} height={34} rx={8} fill={PROF.graphite} stroke={PROF.ink} strokeWidth={5} />
				<text x={46} y={28} fontFamily={FONT.sans} fontWeight={700} fontSize={30} fill={col(layer.labelColor ?? 'ink')}>{layer.legendA ?? 'REAL'}</text>
				<rect x={w * 0.42} y={0} width={34} height={34} rx={8} fill={PROF.accent} stroke={PROF.ink} strokeWidth={5} />
				<text x={w * 0.42 + 46} y={28} fontFamily={FONT.sans} fontWeight={700} fontSize={30} fill={col(layer.labelColor ?? 'ink')}>{layer.legendB ?? 'GUESS'}</text>
			</g>
		</svg>
	);
};

export const LAYERS4: Record<string, React.FC<L>> = {card: Card, stamp: Stamp, chart: Chart, pairs: Pairs};
