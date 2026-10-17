import React, {createContext, useContext} from 'react';
import {Img, staticFile, useVideoConfig} from 'remotion';
import {clamp, easeInOut, easeOut, lerp, noise, prog, rnd, spr} from './anim';
import {useResolve, useSceneFrame} from './ShotCtx';
import {col, FONT, PROF} from './theme';

/** Per-layer time: `t` = frames since the layer appeared. */
export const LayerCtx = createContext<{t: number; start: number}>({t: 0, start: 0});
export const useLayer = () => useContext(LayerCtx);

type L = {layer: any};
const px = (v: number | undefined, base: number, dflt: number) => (v ?? dflt) * base;

/* ------------------------------------------------------------------ pictures */

/** Cut-out of the professor / prop. `sticker` (default true) uses the version with the white die-cut outline. */
export const ImgLayer: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const name: string = layer.src;
	const file = layer.sticker === false || name.startsWith('panel-') || name.startsWith('bg-') ? name : `${name}-s`;
	return <Img src={staticFile(`prof/${file}.png`)} style={{width: px(layer.w, width, 0.5), display: 'block', transform: layer.flip ? 'scaleX(-1)' : undefined, filter: layer.filter}} />;
};

/** Framed picture card with a hard offset shadow; the picture drifts slowly inside the frame. */
export const PanelLayer: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.8);
	const zoom = lerp(layer.zoom?.[0] ?? 1.04, layer.zoom?.[1] ?? 1.14, clamp(t / 90));
	return (
		<div
			style={{
				width: w,
				aspectRatio: layer.ratio ?? undefined,
				border: `${layer.border ?? 10}px solid ${PROF.ink}`,
				borderRadius: 30,
				boxShadow: `${layer.shadow ?? 20}px ${layer.shadow ?? 20}px 0 ${PROF.ink}`,
				overflow: 'hidden',
				background: PROF.ink,
				position: 'relative',
			}}
		>
			<Img src={staticFile(`prof/${layer.src}.png`)} style={{width: '100%', display: 'block', transform: `scale(${zoom})`, transformOrigin: `${(layer.focus?.[0] ?? 0.5) * 100}% ${(layer.focus?.[1] ?? 0.5) * 100}%`}} />
		</div>
	);
};

/* ------------------------------------------------------------------ type */

/** Big display text. `\n` = new line (each line slams in 3 frames after the previous). `mark` = yellow marker behind. */
export const TextLayer: React.FC<L> = ({layer}) => {
	const {t} = useLayer();
	const {fps} = useVideoConfig();
	const size = layer.size ?? 160;
	const font = FONT[(layer.font as keyof typeof FONT) ?? 'display'];
	const lines = String(layer.text).split('\n');
	const color = col(layer.color ?? 'ink');
	const stroke = layer.stroke ? `${layer.strokeW ?? size * 0.06}px ${col(layer.stroke)}` : undefined;
	return (
		<div style={{textAlign: layer.align ?? 'center', fontFamily: font, fontSize: size, lineHeight: layer.lineHeight ?? 1.02, color, textTransform: layer.upper === false ? undefined : font === FONT.hand || font === FONT.type ? undefined : 'uppercase', letterSpacing: layer.tracking ?? (font === FONT.display ? size * 0.005 : 0), fontWeight: layer.weight ?? (font === FONT.sans ? 700 : 400), whiteSpace: 'nowrap'}}>
			{lines.map((line, i) => {
				const lt = t - i * 3;
				const s = spr(lt, fps, 12, 240, 0.6);
				const show = layer.lines === false || layer.enter === 'none' ? 1 : clamp(lt / 3);
				return (
					<div key={i} style={{opacity: show, transform: layer.lines === false ? undefined : `translateY(${(1 - s) * size * 0.35}px) scale(${0.85 + 0.15 * s})`, transformOrigin: '50% 80%'}}>
						<span
							style={{
								padding: layer.mark ? `0 ${size * 0.08}px` : undefined,
								background: layer.mark ? `linear-gradient(transparent 52%, ${col(layer.mark)} 52%, ${col(layer.mark)} 94%, transparent 94%)` : undefined,
								WebkitTextStroke: stroke,
								paintOrder: 'stroke fill',
								textShadow: layer.shadow ? `0 ${size * 0.05}px 0 ${col(layer.shadow)}` : undefined,
							}}
						>
							{line}
						</span>
					</div>
				);
			})}
		</div>
	);
};

/** Giant outlined word in the background (typographic texture). */
export const BigWord: React.FC<L> = ({layer}) => {
	const {t} = useLayer();
	return (
		<div
			style={{
				fontFamily: FONT.display,
				fontSize: layer.size ?? 520,
				lineHeight: 0.9,
				color: 'transparent',
				WebkitTextStroke: `${layer.strokeW ?? 4}px ${col(layer.color ?? 'ink')}`,
				opacity: layer.opacity ?? 0.16,
				whiteSpace: 'nowrap',
				textTransform: 'uppercase',
				transform: `translateX(${(layer.drift ?? -1.2) * t}px)`,
			}}
		>
			{layer.text}
		</div>
	);
};

/** Small label: "cite" = source tag with a book mark, "tag" = solid pill, "plain" = outlined. */
export const Chip: React.FC<L> = ({layer}) => {
	const size = layer.size ?? 38;
	const kind = layer.kind ?? 'tag';
	const bg = kind === 'cite' ? PROF.white : col(layer.bg ?? 'ink');
	const fg = kind === 'cite' ? PROF.ink : col(layer.color ?? 'paper');
	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: size * 0.4,
				fontFamily: FONT.sans,
				fontWeight: 700,
				fontSize: size,
				letterSpacing: size * 0.02,
				textTransform: layer.upper === false ? undefined : 'uppercase',
				color: fg,
				background: bg,
				border: `${Math.max(4, size * 0.12)}px solid ${PROF.ink}`,
				borderRadius: size * 0.7,
				padding: `${size * 0.28}px ${size * 0.7}px`,
				boxShadow: `${size * 0.16}px ${size * 0.16}px 0 ${PROF.ink}`,
				whiteSpace: 'nowrap',
			}}
		>
			{kind === 'cite' && (
				<svg width={size * 0.9} height={size * 0.9} viewBox="0 0 24 24" fill="none" stroke={PROF.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
					<path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z" />
					<path d="M8 9h6M8 13h6" />
				</svg>
			)}
			{layer.text}
		</div>
	);
};

/** Plain coloured shape (slabs behind characters, bars, discs). */
export const Slab: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const w = px(layer.w, width, 0.5);
	const h = layer.h !== undefined ? layer.h * height : layer.round ? w : w * (layer.ratio ?? 1);
	return (
		<div
			style={{
				width: w,
				height: h,
				background: col(layer.color ?? 'accent'),
				borderRadius: layer.round ? '50%' : (layer.radius ?? 0),
				border: layer.border ? `${layer.border}px solid ${PROF.ink}` : undefined,
				boxShadow: layer.shadow ? `${layer.shadow}px ${layer.shadow}px 0 ${PROF.ink}` : undefined,
			}}
		/>
	);
};

/* ------------------------------------------------------------------ doodles */

const Draw: React.FC<{p: number; children: React.ReactNode; width: number; height: number; box?: string}> = ({p, children, width, height, box}) => (
	<svg width={width} height={height} viewBox={box ?? `0 0 ${width} ${height}`} style={{overflow: 'visible', display: 'block'}}>
		{React.Children.map(children, (c) => (React.isValidElement(c) ? React.cloneElement(c as React.ReactElement<any>, {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round'}) : c))}
	</svg>
);

/** Hand-drawn marker shapes that draw themselves on: circle | underline | arrow | cross | check | zigzag */
export const Scribble: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.5);
	const h = layer.h !== undefined ? layer.h * height : w * 0.4;
	const p = prog(t, layer.dur ?? 14, easeInOut);
	const c = col(layer.color ?? 'accent');
	const sw = layer.strokeW ?? 16;
	const ink = (d: string, k: string) => (
		<>
			<path key={k + 'o'} d={d} stroke={PROF.ink} strokeWidth={sw + 8} opacity={layer.outline === false ? 0 : 1} />
			<path key={k} d={d} stroke={c} strokeWidth={sw} />
		</>
	);
	let body: React.ReactNode;
	switch (layer.shape ?? 'circle') {
		case 'circle': {
			const d = `M ${w * 0.5} ${h * 0.04} C ${w * 0.9} ${h * 0.0}, ${w * 1.02} ${h * 0.6}, ${w * 0.7} ${h * 0.92} C ${w * 0.4} ${h * 1.06}, ${w * -0.03} ${h * 0.8}, ${w * 0.02} ${h * 0.44} C ${w * 0.06} ${h * 0.1}, ${w * 0.55} ${h * -0.02}, ${w * 0.86} ${h * 0.2}`;
			body = ink(d, 'c');
			break;
		}
		case 'underline': {
			const d = `M ${w * 0.02} ${h * 0.55} C ${w * 0.25} ${h * 0.2}, ${w * 0.5} ${h * 0.9}, ${w * 0.98} ${h * 0.35}`;
			body = ink(d, 'u');
			break;
		}
		case 'arrow': {
			const curve = layer.curve ?? 0.35;
			const d = `M ${w * 0.02} ${h * (0.5 + curve)} Q ${w * 0.5} ${h * (0.5 - curve * 1.2)} ${w * 0.96} ${h * 0.5}`;
			const head = `M ${w * 0.96} ${h * 0.5} L ${w * 0.8} ${h * 0.32} M ${w * 0.96} ${h * 0.5} L ${w * 0.78} ${h * 0.68}`;
			body = (
				<>
					{ink(d, 'a')}
					{ink(head, 'h')}
				</>
			);
			break;
		}
		case 'cross': {
			const d = `M ${w * 0.08} ${h * 0.08} L ${w * 0.92} ${h * 0.92} M ${w * 0.92} ${h * 0.08} L ${w * 0.08} ${h * 0.92}`;
			body = ink(d, 'x');
			break;
		}
		case 'check': {
			const d = `M ${w * 0.06} ${h * 0.55} L ${w * 0.38} ${h * 0.9} L ${w * 0.96} ${h * 0.1}`;
			body = ink(d, 'v');
			break;
		}
		case 'strike': {
			const d = `M ${w * 0.0} ${h * 0.55} L ${w * 1.0} ${h * 0.42}`;
			body = ink(d, 's');
			break;
		}
		default: {
			const d = `M ${w * 0.02} ${h * 0.8} L ${w * 0.22} ${h * 0.2} L ${w * 0.42} ${h * 0.8} L ${w * 0.62} ${h * 0.2} L ${w * 0.82} ${h * 0.8} L ${w * 0.98} ${h * 0.3}`;
			body = ink(d, 'z');
		}
	}
	return (
		<div style={{transform: layer.flip ? 'scaleX(-1)' : undefined}}>
			<Draw p={p} width={w} height={h}>
				{body}
			</Draw>
		</div>
	);
};

/** Comic burst with a word in it. */
export const Burst: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.4);
	const n = layer.spikes ?? 14;
	const pts = Array.from({length: n * 2}, (_, i) => {
		const a = (i / (n * 2)) * Math.PI * 2;
		const r = (i % 2 === 0 ? 0.5 : 0.34) * (0.92 + rnd(i + (layer.seed ?? 1)) * 0.16);
		return `${50 + Math.cos(a) * r * 100},${50 + Math.sin(a) * r * 100}`;
	}).join(' ');
	const wob = Math.sin(t * 0.7) * 3;
	return (
		<div style={{width: w, height: w, position: 'relative', transform: `rotate(${wob}deg)`}}>
			<svg width={w} height={w} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
				<polygon points={pts} fill={col(layer.fill ?? 'accent')} stroke={PROF.ink} strokeWidth={3.2} strokeLinejoin="round" />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.display, fontSize: layer.size ?? w * 0.26, color: col(layer.color ?? 'ink'), textAlign: 'center', lineHeight: 0.95, whiteSpace: 'pre', textTransform: 'uppercase'}}>{layer.text}</div>
		</div>
	);
};

/** Vibration arcs on both sides of whatever is in the middle; pulse while active. */
export const Waves: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.6);
	const dur = layer.dur ?? 40;
	const on = t >= 0 && (layer.loop === true || t < dur);
	const c = col(layer.color ?? 'ink');
	const arc = (side: 1 | -1, i: number) => {
		const phase = ((t * 0.16 + i * 0.33) % 1 + 1) % 1;
		const o = on ? Math.sin(phase * Math.PI) : 0;
		const x = side * (w * (0.38 + i * 0.1));
		const r = w * (0.1 + i * 0.03);
		return (
			<path key={`${side}${i}`} d={`M ${x} ${-r} Q ${x + side * r * 0.9} 0 ${x} ${r}`} stroke={c} strokeWidth={layer.strokeW ?? 14} strokeLinecap="round" fill="none" opacity={o} />
		);
	};
	return (
		<svg width={w} height={w * 0.6} viewBox={`${-w / 2} ${-w * 0.3} ${w} ${w * 0.6}`} style={{overflow: 'visible', display: 'block'}}>
			{[0, 1, 2].flatMap((i) => [arc(1, i), arc(-1, i)])}
		</svg>
	);
};

export const Heart: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.3);
	const beat = 1 + Math.max(0, Math.sin(t * 0.35)) * 0.07;
	return (
		<svg width={w} height={w * 0.92} viewBox="0 0 100 92" style={{overflow: 'visible', transform: `scale(${beat})`}}>
			<path d="M50 88 C10 56 2 36 6 22 C10 6 34 2 50 22 C66 2 90 6 94 22 C98 36 90 56 50 88 Z" fill={col(layer.fill ?? 'accent')} stroke={PROF.ink} strokeWidth={5} strokeLinejoin="round" />
		</svg>
	);
};

/* ------------------------------------------------------------------ phone */

type Screen = 'off' | 'lock' | 'empty' | 'typing' | 'buzzing' | 'read' | 'feed' | 'news' | 'chat';

const Bell: React.FC<{x: number; y: number; s: number; slash?: boolean}> = ({x, y, s, slash}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`} stroke={PROF.mid} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round">
		<path d="M-22 14 C-16 6 -16 -6 -14 -14 C-12 -26 12 -26 14 -14 C16 -6 16 6 22 14 Z" />
		<path d="M-7 22 C-4 29 4 29 7 22" />
		{slash && <path d="M-30 -26 L32 30" stroke={PROF.graphite} />}
	</g>
);

/** Vector phone. `screens`: [{at, s}] switches the screen content on cues; `buzz`: cues where it shakes. */
export const Phone: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const w = px(layer.w, width, 0.4);
	const screens: {at: any; s: Screen}[] = layer.screens ?? [{at: 'shot', s: 'lock'}];
	let screen: Screen = 'off';
	let litAt = -999;
	for (const sc of screens) {
		const at = resolve(sc.at);
		if (f >= at) {
			screen = sc.s;
			if (sc.s !== 'off') litAt = litAt === -999 ? at : litAt;
		}
	}
	let shake = 0;
	for (const b of layer.buzz ?? []) {
		const bf = resolve(b);
		const dt = f - bf;
		if (dt >= 0 && dt < 26) shake = Math.max(shake, 1 - dt / 26);
	}
	const sx = shake * (rnd(f * 1.3) - 0.5) * 26;
	const sy = shake * (rnd(f * 2.1 + 5) - 0.5) * 18;
	const sr = shake * (rnd(f * 3.7 + 9) - 0.5) * 5;
	const on = screen !== 'off';
	const glow = on ? (litAt <= 0 ? 1 : clamp((f - litAt) / 6)) : 0;
	return (
		<svg width={w} height={w * 2.03} viewBox="0 0 300 610" style={{overflow: 'visible', display: 'block', transform: `translate(${sx}px, ${sy}px) rotate(${sr}deg)`}}>
			<rect x={14} y={22} width={288} height={598} rx={46} fill={PROF.ink} opacity={0.22} />
			<rect x={6} y={6} width={288} height={598} rx={46} fill={PROF.ink} />
			<rect x={18} y={18} width={264} height={574} rx={36} fill={on ? '#F6F3EC' : '#1B1B1A'} />
			{!on && <path d="M30 40 L120 40 L40 140 L30 140 Z" fill="#fff" opacity={0.05} />}
			<rect x={110} y={30} width={80} height={22} rx={11} fill={PROF.ink} />
			{on && (
				<g opacity={glow}>
					{screen !== 'feed' && screen !== 'news' && screen !== 'chat' && (
						<>
							<text x={150} y={196} textAnchor="middle" fontFamily={FONT.display} fontSize={104} fill={PROF.ink}>
								{layer.time ?? '2:47'}
							</text>
							<text x={150} y={232} textAnchor="middle" fontFamily={FONT.sans} fontWeight={500} fontSize={19} fill={PROF.mid}>
								{layer.day ?? 'Tuesday'}
							</text>
						</>
					)}
					{(screen === 'feed' || screen === 'news') && (
						<g>
							<clipPath id={`feedclip-${layer.id ?? 'p'}`}>
								<rect x={26} y={70} width={248} height={500} rx={14} />
							</clipPath>
							<g clipPath={`url(#feedclip-${layer.id ?? 'p'})`}>
								{Array.from({length: 7}, (_, i) => {
									const off = (f * (layer.feedSpeed ?? 7)) % 180;
									const y = 60 + i * 180 - off;
									const hot = (Math.floor((f * (layer.feedSpeed ?? 7)) / 180) + i) % 3 === 0;
									return (
										<g key={i}>
											<rect x={34} y={y} width={232} height={160} rx={16} fill={hot ? PROF.accent : PROF.white} stroke={PROF.ink} strokeWidth={5} />
											{screen === 'news' ? (
												<>
													<text x={48} y={y + 40} fontFamily={FONT.display} fontSize={30} fill={PROF.ink}>BREAKING</text>
													<rect x={48} y={y + 62} width={190} height={12} rx={6} fill={PROF.ink} opacity={0.75} />
													<rect x={48} y={y + 88} width={150} height={12} rx={6} fill={PROF.ink} opacity={0.45} />
													<rect x={48} y={y + 114} width={170} height={12} rx={6} fill={PROF.ink} opacity={0.45} />
												</>
											) : (
												<>
													<circle cx={90} cy={y + 80} r={34} fill={PROF.ink} opacity={hot ? 0.9 : 0.25} />
													<path d={`M ${80} ${y + 62} L ${80} ${y + 98} L ${108} ${y + 80} Z`} fill={hot ? PROF.accent : PROF.white} />
													<rect x={140} y={y + 56} width={96} height={12} rx={6} fill={PROF.ink} opacity={0.6} />
													<rect x={140} y={y + 84} width={70} height={12} rx={6} fill={PROF.ink} opacity={0.35} />
												</>
											)}
										</g>
									);
								})}
							</g>
						</g>
					)}
					{screen === 'chat' && (
						<g>
							<rect x={36} y={120} width={170} height={60} rx={26} fill={PROF.soft} />
							<text x={52} y={158} fontFamily={FONT.sans} fontWeight={700} fontSize={22} fill={PROF.ink}>Rough day?</text>
							<rect x={90} y={210} width={176} height={60} rx={26} fill={PROF.ink} />
							<text x={106} y={248} fontFamily={FONT.sans} fontWeight={700} fontSize={22} fill={PROF.paper}>Kind of...</text>
							<rect x={36} y={300} width={226} height={60} rx={26} fill={PROF.soft} />
							<text x={52} y={338} fontFamily={FONT.sans} fontWeight={700} fontSize={22} fill={PROF.ink}>I'm here. Tell me.</text>
							{[0, 1, 2].map((i) => (
								<circle key={i} cx={64 + i * 26} cy={410 - Math.max(0, Math.sin(f * 0.3 - i * 0.8)) * 7} r={8} fill={PROF.graphite} />
							))}
						</g>
					)}
					{screen === 'empty' && (
						<>
							<Bell x={150} y={352} s={1.5} slash />
							<text x={150} y={430} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={25} fill={PROF.graphite}>
								No new notifications
							</text>
						</>
					)}
					{screen === 'typing' && (
						<g>
							<rect x={40} y={300} width={140} height={64} rx={30} fill={PROF.soft} />
							{[0, 1, 2].map((i) => (
								<circle key={i} cx={78 + i * 24} cy={332 - Math.max(0, Math.sin(f * 0.3 - i * 0.8)) * 8} r={8} fill={PROF.graphite} />
							))}
						</g>
					)}
					{screen === 'read' && (
						<g>
							<rect x={48} y={282} width={204} height={84} rx={26} fill={PROF.ink} />
							<text x={150} y={334} textAnchor="middle" fontFamily={FONT.sans} fontWeight={700} fontSize={24} fill={PROF.paper}>
								Are we still on?
							</text>
							<text x={246} y={398} textAnchor="end" fontFamily={FONT.sans} fontWeight={500} fontSize={21} fill={PROF.mid}>
								Read 9:41 PM
							</text>
						</g>
					)}
					{screen === 'buzzing' && (
						<g>
							<rect x={36} y={290} width={228} height={92} rx={24} fill={PROF.accent} stroke={PROF.ink} strokeWidth={5} />
							<text x={150} y={348} textAnchor="middle" fontFamily={FONT.display} fontSize={44} fill={PROF.ink}>
								BZZZT!
							</text>
						</g>
					)}
					<rect x={100} y={566} width={100} height={7} rx={3.5} fill={PROF.ink} opacity={0.8} />
				</g>
			)}
			{on && <rect x={18} y={18} width={264} height={574} rx={36} fill="none" stroke={PROF.accent} strokeWidth={6} opacity={glow * 0.9} />}
		</svg>
	);
};

/* ------------------------------------------------------------------ charts */

/** Grid of dots: `total` people, the first `hit` of them highlighted at `hitAt`. */
export const Dots: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const {fps} = useVideoConfig();
	const total: number = layer.total ?? 169;
	const cols: number = layer.cols ?? 13;
	const rows = Math.ceil(total / cols);
	const w = px(layer.w, width, 0.78);
	const gap = w / cols;
	const hit: number = layer.hit ?? 0;
	const hitAt = resolve(layer.hitAt, Infinity);
	const step = layer.step ?? 0.22;
	const hitStep = layer.hitStep ?? 0.2;
	return (
		<svg width={w} height={rows * gap} viewBox={`0 0 ${w} ${rows * gap}`} style={{overflow: 'visible', display: 'block'}}>
			{Array.from({length: total}, (_, i) => {
				const c = i % cols;
				const r = Math.floor(i / cols);
				const s = spr(t - i * step, fps, 12, 260, 0.5);
				const isHit = i < hit && f >= hitAt + i * hitStep;
				const hp = isHit ? spr(f - (hitAt + i * hitStep), fps, 9, 300, 0.5) : 0;
				const rad = gap * 0.36 * s * (1 + hp * 0.18);
				return <circle key={i} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r={Math.max(0, rad)} fill={isHit ? PROF.accent : PROF.graphite} stroke={PROF.ink} strokeWidth={isHit ? gap * 0.07 : 0} />;
			})}
		</svg>
	);
};

/** Number that counts up. */
export const Counter: React.FC<L> = ({layer}) => {
	const {t} = useLayer();
	const dur = layer.dur ?? 26;
	const v = Math.round(lerp(layer.from ?? 0, layer.to ?? 100, prog(t, dur, easeOut)));
	const size = layer.size ?? 300;
	return (
		<div style={{fontFamily: FONT.display, fontSize: size, lineHeight: 0.95, color: col(layer.color ?? 'ink'), WebkitTextStroke: layer.stroke ? `${size * 0.04}px ${col(layer.stroke)}` : undefined, paintOrder: 'stroke fill', whiteSpace: 'nowrap', textShadow: layer.shadow ? `${size * 0.04}px ${size * 0.04}px 0 ${col(layer.shadow)}` : undefined}}>
			{layer.prefix}
			{v}
			<span style={{fontSize: size * (layer.suffixScale ?? 0.6)}}>{layer.suffix}</span>
		</div>
	);
};

/** Donut that fills to `value` percent. */
export const Ring: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.6);
	const stroke = w * 0.13;
	const r = (w - stroke) / 2;
	const p = prog(t, layer.dur ?? 30, easeInOut);
	const circ = 2 * Math.PI * r;
	return (
		<svg width={w} height={w} viewBox={`0 0 ${w} ${w}`} style={{overflow: 'visible', display: 'block'}}>
			<circle cx={w / 2} cy={w / 2} r={r} fill="none" stroke={PROF.ink} strokeWidth={stroke + 14} opacity={0.12} />
			<circle cx={w / 2} cy={w / 2} r={r} fill="none" stroke={col(layer.track ?? 'soft')} strokeWidth={stroke} />
			<circle cx={w / 2} cy={w / 2} r={r} fill="none" stroke={PROF.ink} strokeWidth={stroke + 12} strokeLinecap="butt" strokeDasharray={`${circ * (layer.value / 100) * p} ${circ}`} transform={`rotate(-90 ${w / 2} ${w / 2})`} />
			<circle cx={w / 2} cy={w / 2} r={r} fill="none" stroke={PROF.accent} strokeWidth={stroke} strokeLinecap="butt" strokeDasharray={`${circ * (layer.value / 100) * p} ${circ}`} transform={`rotate(-90 ${w / 2} ${w / 2})`} />
		</svg>
	);
};

/** Two weeks as 14 boxes; one of them flashes (a phantom buzz on that day). */
export const Calendar: React.FC<L> = ({layer}) => {
	const {width, fps} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.84);
	const gap = w / 7;
	const hitAt = resolve(layer.hitAt, Infinity);
	const hitDay: number = layer.hitDay ?? 4;
	const days = layer.days ?? 14;
	return (
		<svg width={w} height={gap * Math.ceil(days / 7)} viewBox={`0 0 ${w} ${gap * Math.ceil(days / 7)}`} style={{overflow: 'visible', display: 'block'}}>
			{Array.from({length: days}, (_, i) => {
				const c = i % 7;
				const r = Math.floor(i / 7);
				const s = spr(t - i * 1.4, fps, 12, 220, 0.6);
				const isHit = i === hitDay && f >= hitAt;
				const hp = isHit ? spr(f - hitAt, fps, 7, 260, 0.6) : 0;
				const sz = gap * 0.78 * s;
				const cx = c * gap + gap / 2;
				const cy = r * gap + gap / 2;
				return (
					<g key={i} transform={`translate(${cx} ${cy}) scale(${1 + hp * 0.25}) rotate(${isHit ? Math.sin(f * 1.9) * 4 * (1 - clamp((f - hitAt) / 24)) : 0})`}>
						<rect x={-sz / 2} y={-sz / 2} width={sz} height={sz} rx={gap * 0.14} fill={isHit ? PROF.accent : PROF.white} stroke={PROF.ink} strokeWidth={gap * 0.07} />
						<text y={gap * 0.1} textAnchor="middle" fontFamily={FONT.display} fontSize={gap * 0.38 * s} fill={PROF.ink} opacity={isHit ? 0 : 0.55}>
							{i + 1}
						</text>
						{isHit && (
							<g transform={`scale(${gap / 100})`}>
								<rect x={-17} y={-31} width={34} height={62} rx={8} fill={PROF.ink} />
								<rect x={-12} y={-24} width={24} height={44} rx={4} fill={PROF.white} />
							</g>
						)}
					</g>
				);
			})}
		</svg>
	);
};

/**
 * Scrolling signal: a quiet noisy line with a dashed "bar" (threshold). Parts of the line above the bar turn yellow.
 *   bumps: [{at, h}] extra peaks arriving at the pen on a cue;  bar: [{at, v}] moves the bar;  amp: noise size
 */
export const Graph: React.FC<L> = ({layer}) => {
	const {width, height} = useVideoConfig();
	const resolve = useResolve();
	const f = useSceneFrame();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.9);
	const h = (layer.h ?? 0.3) * height;
	const speed = layer.speed ?? 6;
	const amp = layer.amp ?? 0.22;
	const y0 = h * 0.7;
	const unit = h * 0.56;
	const nowX = w * 0.9;
	const bumps = (layer.bumps ?? []).map((b: any) => ({f: resolve(b.at, Infinity), h: b.h ?? 0.6, s: b.s ?? 46}));
	const val = (u: number) => {
		let v = noise(u, layer.seed ?? 3) * amp;
		for (const b of bumps) {
			if (!Number.isFinite(b.f)) continue;
			const c = nowX + b.f * speed + b.s * 1.1;
			v += b.h * Math.exp(-(((u - c) / b.s) ** 2));
		}
		return v;
	};
	// bar value over time
	let bar = layer.bar?.[0]?.v ?? 0.8;
	let barFrom = bar;
	let lastAt = -Infinity;
	for (const k of layer.bar ?? []) {
		const at = resolve(k.at, 0);
		if (f >= at) {
			barFrom = bar;
			lastAt = at;
			bar = k.v;
		}
	}
	const barNow = lastAt === -Infinity ? bar : lerp(barFrom, bar, prog(f - lastAt, 14, easeInOut));
	const barY = y0 - barNow * unit;
	const N = 150;
	const pts: [number, number][] = [];
	for (let i = 0; i <= N; i++) {
		const x = (i / N) * nowX;
		pts.push([x, y0 - val(x + f * speed) * unit]);
	}
	const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
	const penY = pts[pts.length - 1][1];
	const above = penY < barY;
	const showCross = layer.cross !== false;
	const reveal = prog(t, 10);
	const clipId = `gclip-${layer.id ?? 'g'}`;
	return (
		<div style={{width: w, height: h, background: PROF.white, border: `10px solid ${PROF.ink}`, borderRadius: 32, boxShadow: `20px 20px 0 ${PROF.ink}`, position: 'relative', overflow: 'hidden', opacity: reveal}}>
			<svg width={w - 20} height={h - 20} viewBox={`0 0 ${w - 20} ${h - 20}`} style={{position: 'absolute', left: 0, top: 0}}>
				<defs>
					<clipPath id={clipId}>
						<rect x={0} y={0} width={w} height={Math.max(0, barY)} />
					</clipPath>
				</defs>
				{[0.2, 0.4, 0.6, 0.8].map((g) => (
					<line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={PROF.soft} strokeWidth={3} opacity={0.7} />
				))}
				<line x1={0} x2={w} y1={y0} y2={y0} stroke={PROF.mid} strokeWidth={3} strokeDasharray="4 10" />
				<path d={d} fill="none" stroke={PROF.ink} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
				{showCross && (
					<g clipPath={`url(#${clipId})`}>
						<path d={d} fill="none" stroke={PROF.ink} strokeWidth={21} strokeLinejoin="round" strokeLinecap="round" />
						<path d={d} fill="none" stroke={PROF.accent} strokeWidth={11} strokeLinejoin="round" strokeLinecap="round" />
					</g>
				)}
				<line x1={0} x2={w} y1={barY} y2={barY} stroke={PROF.ink} strokeWidth={7} strokeDasharray="26 16" />
				{layer.barLabel && (
					<g transform={`translate(${w * 0.04} ${barY - 18})`}>
						<text fontFamily={FONT.sans} fontWeight={700} fontSize={32} fill={PROF.ink} letterSpacing={1.5}>
							{layer.barLabel}
						</text>
					</g>
				)}
				<circle cx={nowX} cy={penY} r={above && showCross ? 20 : 14} fill={above && showCross ? PROF.accent : PROF.ink} stroke={PROF.ink} strokeWidth={6} />
			</svg>
		</div>
	);
};

/** Chat bubble (typing dots or text). */
export const Bubble: React.FC<L> = ({layer}) => {
	const {t} = useLayer();
	const size = layer.size ?? 60;
	const typing = !layer.text;
	return (
		<div style={{background: col(layer.bg ?? 'white'), border: `8px solid ${PROF.ink}`, borderRadius: size * 0.9, padding: typing ? `${size * 0.45}px ${size * 0.7}px` : `${size * 0.3}px ${size * 0.7}px`, boxShadow: `10px 10px 0 ${PROF.ink}`, fontFamily: FONT.sans, fontWeight: 700, fontSize: size, color: PROF.ink, display: 'flex', gap: size * 0.3, alignItems: 'center', whiteSpace: 'nowrap'}}>
			{typing
				? [0, 1, 2].map((i) => <div key={i} style={{width: size * 0.4, height: size * 0.4, borderRadius: '50%', background: PROF.ink, transform: `translateY(${-Math.max(0, Math.sin(t * 0.32 - i * 0.9)) * size * 0.3}px)`}} />)
				: layer.text}
		</div>
	);
};

/** Pulse rings radiating from the centre ("signals"). */
export const Pulse: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.9);
	return (
		<svg width={w} height={w} viewBox={`${-w / 2} ${-w / 2} ${w} ${w}`} style={{overflow: 'visible', display: 'block'}}>
			{[0, 1, 2, 3].map((i) => {
				const p = (((t * 0.012 + i * 0.25) % 1) + 1) % 1;
				return <circle key={i} r={p * w * 0.5} fill="none" stroke={col(layer.color ?? 'ink')} strokeWidth={layer.strokeW ?? 8} strokeDasharray="2 22" strokeLinecap="round" opacity={(1 - p) * 0.9} />;
			})}
		</svg>
	);
};

/** Waveform of a vibration: continuous buzz vs short pulses. */
export const Wave: React.FC<L> = ({layer}) => {
	const {width} = useVideoConfig();
	const {t} = useLayer();
	const w = px(layer.w, width, 0.7);
	const h = layer.h ? layer.h * 1920 : w * 0.26;
	const pulses: boolean = layer.pulses ?? false;
	const p = prog(t, 22, easeInOut);
	const n = 120;
	const d = Array.from({length: n + 1}, (_, i) => {
		const x = (i / n) * w * p;
		const u = i / n;
		const on = pulses ? (Math.floor(u * 6) % 2 === 0 ? 1 : 0.08) : 1;
		const y = h / 2 + Math.sin(u * 90 + t * 0.9) * h * 0.42 * on;
		return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(' ');
	return (
		<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible', display: 'block'}}>
			<path d={d} fill="none" stroke={PROF.ink} strokeWidth={18} strokeLinejoin="round" />
			<path d={d} fill="none" stroke={col(layer.color ?? 'accent')} strokeWidth={9} strokeLinejoin="round" />
		</svg>
	);
};

export const LAYERS: Record<string, React.FC<L>> = {
	img: ImgLayer,
	panel: PanelLayer,
	text: TextLayer,
	bigword: BigWord,
	chip: Chip,
	slab: Slab,
	scribble: Scribble,
	burst: Burst,
	waves: Waves,
	heart: Heart,
	phone: Phone,
	dots: Dots,
	counter: Counter,
	ring: Ring,
	calendar: Calendar,
	graph: Graph,
	bubble: Bubble,
	pulse: Pulse,
	wave: Wave,
};
