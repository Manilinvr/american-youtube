import React from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {clamp, easeInOut, prog, rnd, spr} from './anim';
import {useLayer} from './layers';
import {useResolve, useSceneFrame} from './ShotCtx';
import {col, FONT, PROF} from './theme';

type L = {layer: any};
const px = (v: number | undefined, base: number, dflt: number) => (v ?? dflt) * base;
const NOTE = '#E8D77F';

const Pin: React.FC<{size: number; color?: string}> = ({size, color}) => (
	<div style={{position: 'absolute', left: '50%', top: -size * 0.45, width: size, height: size, marginLeft: -size / 2, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #fff9, ${color ?? PROF.accent} 45%, ${PROF.accentDeep})`, boxShadow: `${size * 0.15}px ${size * 0.25}px ${size * 0.3}px rgba(0,0,0,0.45)`, zIndex: 2}} />
);

/** Polaroid: framed picture (a cut-out from public/prof) with a handwritten caption and a pin. */
export const Polaroid: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const w = px(layer.w, width, 0.4);
	return (
		<div style={{position: 'relative', width: w, background: PROF.white, padding: `${w * 0.06}px ${w * 0.06}px ${w * 0.04}px`, boxShadow: `${w * 0.03}px ${w * 0.05}px ${w * 0.06}px rgba(0,0,0,0.45)`}}>
			<Pin size={w * 0.1} />
			<div style={{width: '100%', aspectRatio: '1 / 1', background: col(layer.bg ?? 'soft'), overflow: 'hidden', position: 'relative'}}>
				{layer.src && <Img src={staticFile(`prof/${layer.src}.png`)} style={{position: 'absolute', left: '50%', bottom: layer.bottom ?? 0, width: `${(layer.fit ?? 1) * 100}%`, transform: 'translateX(-50%)', filter: layer.filter ?? 'sepia(0.55) contrast(1.05) saturate(0.7)'}} />}
				{layer.big && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontSize: w * 0.34, color: col(layer.bigColor ?? 'ink'), textAlign: 'center', lineHeight: 0.95, whiteSpace: 'pre-line'}}>{layer.big}</div>}
			</div>
			{layer.caption && <div style={{fontFamily: FONT.hand, fontSize: w * 0.12, color: PROF.ink, textAlign: 'center', marginTop: w * 0.03, whiteSpace: 'pre-line'}}>{layer.caption}</div>}
		</div>
	);
};

/** Sticky note with handwriting. */
export const Note: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const w = px(layer.w, width, 0.36);
	return (
		<div style={{position: 'relative', width: w, minHeight: w * 0.8, background: col(layer.bg ?? NOTE), padding: w * 0.08, boxShadow: `${w * 0.03}px ${w * 0.05}px ${w * 0.05}px rgba(0,0,0,0.4)`, fontFamily: FONT.hand, fontSize: layer.size ?? w * 0.17, lineHeight: 1.05, color: PROF.ink, whiteSpace: 'pre-line'}}>
			<Pin size={w * 0.09} />
			{layer.text}
		</div>
	);
};

/** Typed document. lines [{text, at, redact, revealAt, red}]: each line types itself at its cue; a redact bar covers it until revealAt. */
export const Doc: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.8);
	const size = layer.size ?? w * 0.05;
	return (
		<div style={{position: 'relative', width: w, background: PROF.white, padding: `${size * 1.6}px ${size * 1.2}px ${size * 1.2}px`, boxShadow: `${w * 0.02}px ${w * 0.03}px ${w * 0.04}px rgba(0,0,0,0.45)`, transform: `rotate(${layer.tilt ?? 0}deg)`}}>
			<Pin size={size * 1.1} />
			{layer.header && <div style={{fontFamily: FONT.type, fontSize: size * 1.25, letterSpacing: size * 0.12, color: PROF.ink, borderBottom: `${size * 0.1}px solid ${PROF.ink}`, paddingBottom: size * 0.35, marginBottom: size * 0.7}}>{layer.header}</div>}
			{(layer.lines ?? []).map((ln: any, i: number) => {
				const at = ln.at !== undefined ? resolve(ln.at, Infinity) : (layer.autoType === false ? 0 : i * 10);
				const tt = ln.at !== undefined ? f - at : t - at;
				const chars = Math.max(0, Math.min(ln.text.length, Math.floor(tt * 1.4)));
				const rv = ln.revealAt !== undefined ? resolve(ln.revealAt, Infinity) : Infinity;
				const barOpen = ln.redact ? clamp((f - rv) / 8) : 1;
				return (
					<div key={i} style={{position: 'relative', fontFamily: FONT.type, fontSize: size, lineHeight: 1.3, color: ln.red ? PROF.accent : PROF.ink, minHeight: size * 1.3, whiteSpace: 'pre-wrap'}}>
						{ln.text.slice(0, chars)}
						{ln.redact && chars > 0 && <div style={{position: 'absolute', left: 0, top: size * 0.1, height: size * 1.1, width: `${(1 - barOpen) * 100}%`, background: PROF.ink}} />}
					</div>
				);
			})}
		</div>
	);
};

/** Red string between two points of the frame (fractions), with pins, drawing itself on. */
export const RedString: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const {t} = useLayer();
	const [x1, y1] = layer.from as [number, number];
	const [x2, y2] = layer.to as [number, number];
	const sag = (layer.sag ?? 0.03) * height;
	const p = prog(t, layer.dur ?? 14, easeInOut);
	const ax = x1 * width, ay = y1 * height, bx = x2 * width, by = y2 * height;
	const mx = (ax + bx) / 2, my = (ay + by) / 2 + sag;
	const ex = ax + (bx - ax) * p, ey = ay + (by - ay) * p;
	const cx = ax + (mx - ax) * p, cy = ay + (my - ay) * p;
	const c = col(layer.color ?? 'accent');
	return (
		<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{overflow: 'visible', display: 'block'}}>
			<path d={`M ${ax} ${ay} Q ${cx} ${cy} ${ex} ${ey}`} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={9} strokeLinecap="round" transform="translate(5 7)" />
			<path d={`M ${ax} ${ay} Q ${cx} ${cy} ${ex} ${ey}`} fill="none" stroke={c} strokeWidth={7} strokeLinecap="round" />
			<circle cx={ax} cy={ay} r={13} fill={PROF.accentDeep} stroke="rgba(0,0,0,0.5)" strokeWidth={3} />
			{p > 0.98 && <circle cx={bx} cy={by} r={13} fill={PROF.accentDeep} stroke="rgba(0,0,0,0.5)" strokeWidth={3} />}
		</svg>
	);
};

/** Rubber-stamp text in red ink: CLASSIFIED, MYTH, CONFIRMED... */
export const Rubber: React.FC<L> = ({layer}) => {
	const {t} = useLayer();
	const size = layer.size ?? 150;
	const k = clamp(t / 3);
	const c = col(layer.color ?? 'accent');
	return (
		<div style={{display: 'inline-block', transform: `rotate(${layer.tilt ?? -9}deg) scale(${1 + (1 - k) * 0.8})`, opacity: 0.2 + 0.8 * k, mixBlendMode: 'multiply'}}>
			<div style={{border: `${size * 0.07}px solid ${c}`, borderRadius: size * 0.08, color: c, padding: `${size * 0.06}px ${size * 0.25}px`, fontFamily: FONT.type, fontSize: size, lineHeight: 1.05, letterSpacing: size * 0.04, textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center', opacity: 0.92}}>
				{layer.text}
				{layer.sub && <div style={{fontSize: size * 0.28, letterSpacing: size * 0.05, borderTop: `${size * 0.03}px solid ${c}`, marginTop: size * 0.05, paddingTop: size * 0.03}}>{layer.sub}</div>}
			</div>
		</div>
	);
};

/** Evidence tag ("EXHIBIT A") with a string hole. */
export const Exhibit: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const w = px(layer.w, width, 0.3);
	return (
		<div style={{position: 'relative', width: w, background: '#E7D9B0', border: `${w * 0.02}px solid ${PROF.ink}`, borderRadius: w * 0.05, padding: `${w * 0.1}px ${w * 0.08}px ${w * 0.06}px`, boxShadow: `${w * 0.03}px ${w * 0.04}px ${w * 0.04}px rgba(0,0,0,0.4)`, textAlign: 'center'}}>
			<div style={{position: 'absolute', left: '50%', top: w * 0.025, width: w * 0.06, height: w * 0.06, marginLeft: -w * 0.03, borderRadius: '50%', background: PROF.ink}} />
			<div style={{fontFamily: FONT.type, fontSize: w * 0.12, color: PROF.accent, letterSpacing: w * 0.02}}>EXHIBIT</div>
			<div style={{fontFamily: FONT.display, fontSize: w * 0.5, lineHeight: 1, color: PROF.ink}}>{layer.label}</div>
			{layer.sub && <div style={{fontFamily: FONT.type, fontSize: w * 0.09, color: PROF.graphite, marginTop: w * 0.03}}>{layer.sub}</div>}
		</div>
	);
};

export const LAYERS6: Record<string, React.FC<L>> = {polaroid: Polaroid, note: Note, doc: Doc, string: RedString, rubber: Rubber, exhibit: Exhibit};
