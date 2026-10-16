import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEpisode} from '../context';

export type Setting = 'burst' | 'city' | 'night-room';

/** Darken (amount < 0) or lighten (amount > 0) a hex colour. */
export const shade = (hex: string, amount: number): string => {
	const n = parseInt(hex.slice(1), 16);
	const mix = (c: number) => Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
	const r = mix(n >> 16);
	const g = mix((n >> 8) & 255);
	const b = mix(n & 255);
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/** Rotating cartoon sunburst — the default "studio" background. */
const Burst: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const {palette, energy} = useEpisode();
	const r = Math.hypot(width, height);
	const rays = 18;
	const rot = frame * 0.25 * energy;
	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, ${palette.bg1}, ${palette.bg2})`}}>
			<svg width={width} height={height} style={{position: 'absolute', opacity: 0.18}}>
				<g transform={`translate(${width / 2} ${height * 0.45}) rotate(${rot})`}>
					{Array.from({length: rays}, (_, i) => {
						const a0 = (i / rays) * Math.PI * 2;
						const a1 = a0 + Math.PI / rays;
						return <path key={i} d={`M0 0 L${Math.cos(a0) * r} ${Math.sin(a0) * r} L${Math.cos(a1) * r} ${Math.sin(a1) * r}Z`} fill="#FFFFFF" />;
					})}
				</g>
			</svg>
		</AbsoluteFill>
	);
};

/** Simple skyline with lit windows; drifts slowly for parallax. */
const City: React.FC<{drift?: number}> = ({drift = 1}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const {palette} = useEpisode();
	const ground = height * 0.8;
	const far = shade(palette.bg2, -0.25);
	const near = shade(palette.bg2, -0.45);
	const buildings = (seed: number, color: string, scale: number, speed: number) => {
		const out: React.ReactNode[] = [];
		let x = -200 - ((frame * speed * drift) % 400);
		let i = 0;
		while (x < width + 200) {
			const w = 150 + ((seed * (i + 3) * 37) % 120);
			const h = (300 + ((seed * (i + 7) * 53) % 420)) * scale;
			out.push(
				<g key={`${seed}-${i}`}>
					<rect x={x} y={ground - h} width={w} height={h} fill={color} />
					{Array.from({length: Math.floor(h / 70)}, (_, row) =>
						Array.from({length: Math.floor(w / 55)}, (_, col) =>
							(row * 7 + col * 3 + i) % 3 === 0 ? (
								<rect key={`${row}-${col}`} x={x + 18 + col * 52} y={ground - h + 24 + row * 66} width={24} height={34} rx={4} fill={palette.accent} opacity={0.55} />
							) : null,
						),
					)}
				</g>,
			);
			x += w + 24;
			i++;
		}
		return out;
	};
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, ${palette.bg1} 0%, ${palette.bg2} 85%)`}}>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<circle cx={width * 0.78} cy={height * 0.2} r={Math.min(width, height) * 0.12} fill={palette.accent} opacity={0.85} />
				{buildings(3, far, 1.25, 0.3)}
				{buildings(5, near, 0.8, 0.7)}
				<rect x={0} y={ground} width={width} height={height - ground} fill={shade(palette.ink, 0.25)} />
				<rect x={0} y={ground} width={width} height={14} fill={shade(palette.ink, 0.45)} />
				{Array.from({length: Math.ceil(width / 260) + 1}, (_, i) => {
					const span = width + 260;
					const x = ((((i * 260 - frame * 6 * drift) % span) + span) % span) - 130;
					return <rect key={i} x={x} y={ground + (height - ground) * 0.55} width={120} height={14} rx={7} fill="#FFFFFF" opacity={0.5} />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Fire-station bunk room at night. `alarm` (0-1) floods it with flashing red light. */
const NightRoom: React.FC<{alarm?: number}> = ({alarm = 0}) => {
	const frame = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const flash = alarm > 0 ? (Math.sin(frame * 0.9) > 0 ? 1 : 0.35) * alarm : 0;
	const wall = '#1F2A4D';
	return (
		<AbsoluteFill style={{background: wall}}>
			<svg width={width} height={height} style={{position: 'absolute'}}>
				<rect x={0} y={height * 0.78} width={width} height={height * 0.22} fill="#141B33" />
				{/* window with moon */}
				<rect x={width * 0.08} y={height * 0.14} width={width * 0.3} height={height * 0.16} rx={16} fill="#0D1330" stroke="#3A4A7A" strokeWidth={12} />
				<circle cx={width * 0.27} cy={height * 0.2} r={height * 0.035} fill="#FFF3B0" />
				<circle cx={width * 0.285} cy={height * 0.192} r={height * 0.03} fill="#0D1330" />
				{[0.12, 0.17, 0.33].map((x, i) => (
					<circle key={x} cx={width * x} cy={height * (0.17 + i * 0.03)} r={4} fill="#FFFFFF" opacity={0.6 + 0.4 * Math.sin(frame * 0.1 + i)} />
				))}
			</svg>
			<AbsoluteFill style={{background: '#FF1E1E', opacity: flash * 0.45, mixBlendMode: 'screen'}} />
			<AbsoluteFill style={{background: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,${interpolate(alarm, [0, 1], [0.45, 0.1])}))`}} />
		</AbsoluteFill>
	);
};

export const Backdrop: React.FC<{setting?: Setting; alarm?: number; drift?: number}> = ({setting = 'burst', alarm, drift}) => {
	if (setting === 'city') return <City drift={drift} />;
	if (setting === 'night-room') return <NightRoom alarm={alarm} />;
	return <Burst />;
};
