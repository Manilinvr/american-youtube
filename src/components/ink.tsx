import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {INK, LINE, PAPER, PAPER_LIGHT, PENCIL} from '../theme';

/**
 * Pencil-sketch primitives.
 *  - every stroke is drawn twice (a main line + a faint offset "second pass") like a real sketch
 *  - everything inside <Draw p={0..1}> draws itself on as p goes 0 -> 1
 *  - <SketchDefs> provides the line-boil filter and hatching patterns (url(#hatch), url(#hatch-dark))
 */
const DrawCtx = createContext(1);

export const Draw: React.FC<{p: number; children: React.ReactNode}> = ({p, children}) => (
	<DrawCtx.Provider value={Math.max(0, Math.min(1, p))}>{children}</DrawCtx.Provider>
);

type Paint = {fill?: string; fillOpacity?: number; stroke?: string; strokeWidth?: number | string; sketch?: boolean};

const useStroke = (fill: string | undefined, fillOpacity = 1) => {
	const p = useContext(DrawCtx);
	const dash: Record<string, number> = p >= 0.999 ? {} : {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p};
	return {
		p,
		main: {
			stroke: INK,
			strokeWidth: LINE,
			strokeLinecap: 'round' as const,
			strokeLinejoin: 'round' as const,
			fill: fill ?? 'none',
			fillOpacity: fill ? fillOpacity * Math.min(1, p * 1.5) : undefined,
			...dash,
		},
		ghost: {
			fill: 'none',
			strokeLinecap: 'round' as const,
			strokeLinejoin: 'round' as const,
			opacity: 0.4,
			transform: 'translate(1.8 -1.4)',
			...dash,
		},
	};
};

/** Generic sketchy shape: renders `Tag` twice (main + offset ghost stroke). */
function sketchy<T extends object>(Tag: string) {
	const C: React.FC<T & Paint> = ({fill, fillOpacity, sketch = true, ...rest}) => {
		const {main, ghost} = useStroke(fill, fillOpacity);
		const r = rest as Record<string, unknown>;
		const width = Number(r.strokeWidth ?? LINE);
		return (
			<>
				{React.createElement(Tag, {...main, ...rest})}
				{sketch &&
					React.createElement(Tag, {
						...rest,
						...ghost,
						stroke: (r.stroke as string) ?? INK,
						strokeWidth: width * 0.55,
						transform: `${(r.transform as string) ?? ''} translate(1.8 -1.4)`,
					})}
			</>
		);
	};
	return C;
}

export const P = sketchy<React.SVGProps<SVGPathElement>>('path');
export const Circ = sketchy<React.SVGProps<SVGCircleElement>>('circle');
export const Ell = sketchy<React.SVGProps<SVGEllipseElement>>('ellipse');
export const Rect = sketchy<React.SVGProps<SVGRectElement>>('rect');

/** An outlined "tube" (sleeve, trouser leg): ink outline with a fill core (paper or dark hatching). */
export const Tube: React.FC<{d: string; width: number; core?: string}> = ({d, width, core = PAPER_LIGHT}) => {
	const {main} = useStroke(undefined);
	return (
		<g>
			<path d={d} {...main} strokeWidth={width} />
			<path d={d} {...main} stroke={core} strokeWidth={Math.max(0, width - LINE * 1.6)} />
		</g>
	);
};

/** Filters and patterns used by every sketch. Render once per frame. */
export const SketchDefs: React.FC<{boil?: number; every?: number}> = ({boil = 2.4, every = 4}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(frame / every) % 5;
	return (
		<svg width={0} height={0} style={{position: 'absolute'}}>
			<defs>
				{/* line boil: the drawing wobbles a few times per second like hand-drawn frames */}
				<filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
					<feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed} result="noise" />
					<feDisplacementMap in="SourceGraphic" in2="noise" scale={boil} xChannelSelector="R" yChannelSelector="G" />
				</filter>
				<filter id="paper-grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={3} />
					<feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0.09 0" />
				</filter>
				<filter id="paper-blotch">
					<feTurbulence type="fractalNoise" baseFrequency="0.004" numOctaves={3} seed={11} />
					<feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.16 0" />
				</filter>
				<pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
					<line x1="0" y1="0" x2="0" y2="9" stroke={INK} strokeWidth="1.6" opacity="0.55" />
				</pattern>
				<pattern id="hatch-dark" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
					<rect width="6" height="6" fill="#4A443D" />
					<line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeWidth="2.6" />
				</pattern>
				<pattern id="hatch-light" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
					<line x1="0" y1="0" x2="0" y2="12" stroke={PENCIL} strokeWidth="1.3" opacity="0.6" />
				</pattern>
			</defs>
		</svg>
	);
};

/** Warm sketchbook paper: grain, soft blotches and loose diagonal pencil strokes in the air. */
export const Paper: React.FC<{strokes?: boolean}> = ({strokes = true}) => {
	const {width, height} = useVideoConfig();
	const marks = React.useMemo(() => {
		if (!strokes) return [];
		const out: {x: number; y: number; l: number; o: number}[] = [];
		let s = 7;
		const rnd = () => {
			s = (s * 16807) % 2147483647;
			return s / 2147483647;
		};
		for (let i = 0; i < 140; i++) {
			out.push({x: rnd() * width, y: rnd() * height * 0.75, l: 40 + rnd() * 120, o: 0.12 + rnd() * 0.18});
		}
		return out;
	}, [width, height, strokes]);
	return (
		<AbsoluteFill style={{background: PAPER}}>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<rect width={width} height={height} filter="url(#paper-blotch)" />
				<rect width={width} height={height} filter="url(#paper-grain)" />
				{marks.map((m, i) => (
					<line key={i} x1={m.x} y1={m.y} x2={m.x - m.l * 0.55} y2={m.y + m.l} stroke={PENCIL} strokeWidth={1.6} opacity={m.o} strokeLinecap="round" />
				))}
			</svg>
		</AbsoluteFill>
	);
};
