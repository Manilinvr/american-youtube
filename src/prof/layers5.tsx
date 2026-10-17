import React from 'react';
import {useVideoConfig} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, prog, spr} from './anim';
import {useLayer} from './layers';
import {useResolve, useSceneFrame} from './ShotCtx';
import {col, FONT, PROF} from './theme';

type L = {layer: any};
const px = (v: number | undefined, base: number, dflt: number) => (v ?? dflt) * base;

/** Two sides with a VS badge: left/right {title, text, color}. Sides slide in, the badge pops, the winner (optional) lights up. */
export const Versus: React.FC<L> = ({layer}) => {
	const {width, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.9);
	const h = w * (layer.ratio ?? 0.9);
	const size = layer.size ?? 54;
	const win = resolve(layer.winAt, Infinity);
	const side = (s: any, left: boolean) => {
		const k = spr(t - (left ? 0 : 4), fps, 13, 190, 0.7);
		const isWin = layer.winner === (left ? 'left' : 'right') && f >= win;
		const bg = isWin ? PROF.accent : col(s.color ?? (left ? 'white' : 'ink'));
		const fg = bg === PROF.ink || bg === PROF.graphite ? PROF.paper : PROF.ink;
		return (
			<div style={{position: 'absolute', top: 0, [left ? 'left' : 'right']: 0, width: w * 0.52, height: h, background: bg, border: `10px solid ${PROF.ink}`, borderRadius: 30, boxShadow: `14px 14px 0 ${PROF.ink}`, transform: `translateX(${(left ? -1 : 1) * (1 - k) * w * 0.6}px) scale(${isWin ? 1.04 : 1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.3, padding: size * 0.4, zIndex: isWin ? 2 : 1}}>
				<div style={{fontFamily: FONT.sans, fontWeight: 700, fontSize: size * 0.5, letterSpacing: size * 0.04, color: fg, textTransform: 'uppercase', opacity: 0.85}}>{s.title}</div>
				<div style={{fontFamily: FONT.display, fontSize: size * (s.scale ?? 1.5), lineHeight: 1, color: fg, textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'pre-line'}}>{s.text}</div>
			</div>
		);
	};
	const vs = spr(t - 10, fps, 8, 260, 0.6);
	return (
		<div style={{position: 'relative', width: w, height: h}}>
			{side(layer.left ?? {}, true)}
			{side(layer.right ?? {}, false)}
			<div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) scale(${vs}) rotate(${(1 - vs) * 90}deg)`, zIndex: 3, background: PROF.accent, border: `8px solid ${PROF.ink}`, borderRadius: '50%', width: size * 2, height: size * 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontSize: size * 1.1, color: PROF.ink}}>VS</div>
		</div>
	);
};

/** Horizontal timeline. events [{at, label, sub, x}] with x = 0..1 along the line. */
export const Timeline: React.FC<L> = ({layer}) => {
	const {width, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.9);
	const ev: any[] = layer.events ?? [];
	const h = w * 0.55;
	const lineP = prog(t, 18, easeInOut);
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible', display: 'block'}}>
			<line x1={0} y1={h * 0.5} x2={w * lineP} y2={h * 0.5} stroke={col(layer.labelColor ?? 'ink')} strokeWidth={14} strokeLinecap="round" />
			{ev.map((e, i) => {
				const at = resolve(e.at, Infinity);
				if (f < at) return null;
				const tt = f - at;
				const k = spr(tt, fps, 11, 230, 0.6);
				const x = e.x * w;
				const up = i % 2 === 0;
				return (
					<g key={i} transform={`translate(${x} 0)`}>
						<line x1={0} y1={h * 0.5} x2={0} y2={h * (up ? 0.28 : 0.72)} stroke={col(layer.labelColor ?? 'ink')} strokeWidth={6} />
						<circle cx={0} cy={h * 0.5} r={22 * k} fill={PROF.accent} stroke={PROF.ink} strokeWidth={8} />
						<g transform={`translate(0 ${(1 - k) * (up ? 40 : -40)})`} opacity={clamp(tt / 5)}>
							<text y={h * (up ? 0.22 : 0.84)} textAnchor="middle" fontFamily={FONT.display} fontSize={Math.min(64, w * 0.07)} fill={col(layer.labelColor ?? 'ink')}>
								{e.label}
							</text>
							{e.sub && (
								<text y={h * (up ? 0.22 : 0.84) + 40} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={Math.min(30, w * 0.032)} fill={col(layer.labelColor ?? 'graphite')} letterSpacing={1}>
									{e.sub}
								</text>
							)}
						</g>
					</g>
				);
			})}
		</svg>
	);
};

/** Social-style post card: name, handle, text, and a like counter that ticks up. */
export const Post: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.86);
	const size = layer.size ?? 46;
	const likes = Math.round(lerp(0, layer.likes ?? 12400, prog(t, 40, easeOut)));
	return (
		<div style={{width: w, background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 30, boxShadow: `16px 16px 0 ${PROF.ink}`, padding: size * 0.6, fontFamily: FONT.sans, color: PROF.ink}}>
			<div style={{display: 'flex', alignItems: 'center', gap: size * 0.4}}>
				<div style={{width: size * 1.4, height: size * 1.4, borderRadius: '50%', background: PROF.accent, border: `6px solid ${PROF.ink}`, flex: 'none'}} />
				<div>
					<div style={{fontWeight: 700, fontSize: size * 0.7}}>{layer.name ?? 'Someone Online'}</div>
					<div style={{fontWeight: 500, fontSize: size * 0.5, color: PROF.mid}}>{layer.handle ?? '@everyone'}</div>
				</div>
			</div>
			<div style={{fontWeight: 700, fontSize: size, lineHeight: 1.15, marginTop: size * 0.5, whiteSpace: 'pre-line'}}>{layer.text}</div>
			<div style={{display: 'flex', gap: size * 0.8, marginTop: size * 0.5, fontWeight: 700, fontSize: size * 0.55, color: PROF.graphite}}>
				<span>♥ {likes.toLocaleString('en-US')}</span>
				<span>↻ {Math.round(likes * 0.31).toLocaleString('en-US')}</span>
			</div>
		</div>
	);
};

/** Big number that counts down (3, 2, 1, ...) with a pop for every step, one per `step` seconds. */
export const Countdown: React.FC<L> = ({layer}) => {
	const {fps} = useVideoConfig();
	const {t} = useLayer();
	const from: number = layer.from ?? 3;
	const step = Math.round((layer.step ?? 0.7) * fps);
	const i = Math.min(from, Math.floor(t / step));
	const v = Math.max(layer.end ?? 1, from - i);
	const tt = t - i * step;
	const k = spr(tt, fps, 9, 260, 0.6);
	const size = layer.size ?? 520;
	return (
		<div style={{fontFamily: FONT.display, fontSize: size, lineHeight: 0.9, color: col(layer.color ?? 'ink'), WebkitTextStroke: `${size * 0.03}px ${col(layer.stroke ?? 'paper')}`, paintOrder: 'stroke fill', textShadow: `${size * 0.03}px ${size * 0.03}px 0 ${PROF.accent}`, transform: `scale(${0.5 + 0.5 * k}) rotate(${(1 - k) * -12}deg)`, opacity: clamp(tt / 2)}}>{v}</div>
	);
};

/** Big pull quote with giant quotation marks. */
export const Quote: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.86);
	const size = layer.size ?? 78;
	const p = prog(t, 14);
	return (
		<div style={{width: w, position: 'relative', background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 30, boxShadow: `16px 16px 0 ${PROF.ink}`, padding: `${size * 0.9}px ${size * 0.6}px ${size * 0.6}px`, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
			<div style={{position: 'absolute', left: size * 0.3, top: -size * 0.5, fontFamily: FONT.display, fontSize: size * 3, lineHeight: 1, color: PROF.accent, WebkitTextStroke: `${size * 0.05}px ${PROF.ink}`}}>“</div>
			<div style={{fontFamily: FONT.display, fontSize: size, lineHeight: 1.08, color: PROF.ink, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{layer.text}</div>
			{layer.by && <div style={{fontFamily: FONT.sans, fontWeight: 700, fontSize: size * 0.4, letterSpacing: size * 0.03, marginTop: size * 0.4, color: PROF.graphite, textTransform: 'uppercase'}}>— {layer.by}</div>}
		</div>
	);
};

/** Endless scrolling band of words (energy / texture). */
export const Ticker: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const size = layer.size ?? 70;
	const text = `${layer.text}   ✦   `.repeat(8);
	return (
		<div style={{width: width * 1.2, overflow: 'hidden', background: col(layer.bg ?? 'ink'), borderTop: `8px solid ${PROF.ink}`, borderBottom: `8px solid ${PROF.ink}`, transform: `rotate(${layer.tilt ?? -4}deg)`, padding: `${size * 0.15}px 0`}}>
			<div style={{whiteSpace: 'nowrap', fontFamily: FONT.display, fontSize: size, color: col(layer.color ?? 'accent'), textTransform: 'uppercase', transform: `translateX(${-((t * (layer.speed ?? 9)) % (width * 1.2))}px)`}}>{text}</div>
		</div>
	);
};

export const LAYERS5: Record<string, React.FC<L>> = {versus: Versus, timeline: Timeline, post: Post, countdown: Countdown, quote: Quote, ticker: Ticker};
