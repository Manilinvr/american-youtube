import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {HAND, TYPE} from '../../fonts';

/** Channel art for "Professor Lamalma": YouTube banner (2560x1440) and logo/avatar (800x800). */

const C = {ink: '#15120F', warm: '#3A2E25', ivory: '#F4EEE3', ochre: '#E0B25A', ochreDeep: '#C9963B', peach: '#F2D3B3'};
const HERO = staticFile('longform/brand/hero-cutout.png'); // 469x949

const Grain: React.FC<{id: string; opacity: number}> = ({id, opacity}) => (
	<svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity, mixBlendMode: 'overlay'}}>
		<filter id={id}>
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
		</filter>
		<rect width="100%" height="100%" filter={`url(#${id})`} />
	</svg>
);

/** Thin hand-drawn doodles that hint at the topics (thought cloud, question mark, envelope, light bulb, loop). */
const Doodles: React.FC = () => (
	<svg width={2560} height={1440} style={{position: 'absolute', inset: 0}} fill="none" stroke={C.ochre} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.16}>
		<path d="M300 420 c-40 0 -60 -50 -20 -70 c0 -40 60 -50 80 -20 c30 -30 90 -10 80 30 c40 10 30 70 -10 70 z" />
		<circle cx="270" cy="470" r="9" />
		<circle cx="245" cy="500" r="5" />
		<path d="M380 1000 c0 -40 70 -40 70 0 c0 30 -35 30 -35 60 M415 1095 l0 2" />
		<rect x="2200" y="300" width="150" height="100" rx="6" />
		<path d="M2200 300 l75 55 l75 -55" />
		<path d="M2300 1080 c0 -50 80 -50 80 0 c0 25 -20 35 -20 55 l-40 0 c0 -20 -20 -30 -20 -55 z M2325 1150 l30 0" />
		<path d="M640 300 a40 40 0 1 1 30 70 M670 370 l-12 -18 M670 370 l20 -8" />
		<path d="M1980 260 l10 30 l30 10 l-30 10 l-10 30 l-10 -30 l-30 -10 l30 -10 z" />
	</svg>
);

export const LamalmaBanner: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(ellipse 60% 75% at 74% 52%, ${C.warm} 0%, #241D18 45%, ${C.ink} 100%)`}}>
		<Doodles />
		{/* warm lamp glow behind the hero */}
		<div style={{position: 'absolute', left: 1490, top: 420, width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(224,178,90,0.30) 0%, rgba(224,178,90,0) 70%)'}} />
		<Img src={HERO} style={{position: 'absolute', left: 1575, top: 515, height: 1010, filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))'}} />
		{/* title block inside the 1546x423 safe area (x 507-2053, y 508-931) */}
		<div style={{position: 'absolute', left: 600, top: 520, width: 940}}>
			<div style={{fontFamily: TYPE, fontSize: 62, letterSpacing: 18, color: C.ochre}}>PROFESSOR</div>
			<div style={{fontFamily: HAND, fontWeight: 700, fontSize: 210, lineHeight: 0.95, color: C.ivory, marginTop: 4, textShadow: '0 6px 18px rgba(0,0,0,0.5)'}}>Lamalma</div>
			<svg width={640} height={36} viewBox="0 0 640 36" style={{marginTop: 4}}>
				<path d="M6 22 C 120 6, 250 32, 360 16 S 560 10, 634 20" fill="none" stroke={C.ochreDeep} strokeWidth={10} strokeLinecap="round" />
			</svg>
			<div style={{fontFamily: HAND, fontSize: 54, color: 'rgba(244,238,227,0.85)', marginTop: 10}}>everyday psychology, explained calmly</div>
		</div>
		<Grain id="bg-grain" opacity={0.35} />
	</AbsoluteFill>
);

export const LamalmaLogo: React.FC = () => (
	<AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${C.ochreDeep} 0%, #8A5F2C 38%, #2A211B 78%, ${C.ink} 100%)`, overflow: 'hidden'}}>
		<Grain id="logo-grain" opacity={0.3} />
		<Img src={HERO} style={{position: 'absolute', left: 46, top: 92, width: 620, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))'}} />
		<div style={{position: 'absolute', inset: 22, borderRadius: '50%', border: `6px solid ${C.ochre}`, opacity: 0.9}} />
	</AbsoluteFill>
);
