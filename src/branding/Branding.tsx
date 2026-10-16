import React from 'react';
import {AbsoluteFill} from 'remotion';
import channel from '../../config/channel.json';
import {Paper, SketchDefs} from '../components/ink';
import {Emote} from '../components/marks';
import {Face, Person, PoseName} from '../components/Person';
import {CardSpec, Jar, SpecimenCard, Stamp} from '../components/specimen';
import {HAND, MARKER, TYPE} from '../fonts';
import {HIGHLIGHT, INK, RED} from '../theme';

/**
 * Channel artwork for "Specimen: You", rendered as stills by `npm run branding` into branding/.
 * Name, tagline and sign-off come from config/channel.json.
 */

const Sheet: React.FC<{children: React.ReactNode; paper?: boolean; margin?: boolean}> = ({children, paper = true, margin = true}) => (
	<AbsoluteFill>
		<SketchDefs boil={0} />
		{paper && <Paper margin={margin} />}
		<AbsoluteFill>{children}</AbsoluteFill>
	</AbsoluteFill>
);

const S001: CardSpec = {no: 1, common: 'The Doorway Forgetter', latin: 'Homo oblitus', habitat: 'doorways, kitchens'};
const S002: CardSpec = {no: 2, common: 'The Last-Minute Genius', latin: 'Homo procrastinans', habitat: 'desks, the night before'};

/** Coffee ring stain, because every real field journal has one. */
const CoffeeRing: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
	<g opacity={0.22}>
		<circle cx={x} cy={y} r={r} fill="none" stroke="#7A5230" strokeWidth={r * 0.07} />
		<circle cx={x + r * 0.05} cy={y - r * 0.03} r={r * 0.93} fill="none" stroke="#7A5230" strokeWidth={r * 0.02} />
	</g>
);

/** A small specimen sketch with a typewriter figure label (teasers of future episodes). */
const Fig: React.FC<{x: number; y: number; s: number; pose: PoseName; face: Face; label: string; holding?: 'phone' | 'cup' | 'book'}> = ({x, y, s, pose, face, label, holding}) => (
	<g>
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<Person pose={pose} face={face} holding={holding} phase={x / 300} />
		</g>
		<text x={x} y={y + 46} textAnchor="middle" fontFamily={TYPE} fontSize={30} fill={INK}>
			{label}
		</text>
	</g>
);

const Title: React.FC<{size: number; color?: string}> = ({size, color = INK}) => {
	const [a, b] = channel.name.split(':');
	return (
		<div style={{fontFamily: MARKER, fontSize: size, lineHeight: 1, color, whiteSpace: 'nowrap'}}>
			{a}
			{b !== undefined && (
				<>
					<span style={{color: RED}}>:</span>
					<span style={{position: 'relative', display: 'inline-block', marginLeft: size * 0.22}}>
						<span style={{position: 'absolute', left: size * 0.12, right: -size * 0.08, top: '42%', height: '48%', background: HIGHLIGHT, borderRadius: size * 0.06, transform: 'rotate(-2deg)'}} />
						<span style={{position: 'relative'}}>{b.trim()}</span>
					</span>
				</>
			)}
		</div>
	);
};

/** YouTube banner 2560x1440. Must-see content sits in the centre 1546x423 (visible on every device). */
export const Banner: React.FC<{showSafe?: boolean}> = ({showSafe}) => (
	<Sheet>
		<svg width={2560} height={1440} style={{position: 'absolute'}}>
			<CoffeeRing x={2280} y={260} r={120} />
			<CoffeeRing x={300} y={1180} r={95} />
			{/* TV-only teasers: future specimens */}
			<Fig x={560} y={400} s={0.6} pose="phone" holding="phone" face="worried" label="fig. 3: the phantom buzz" />
			<Fig x={1280} y={400} s={0.6} pose="facepalm" face="sad" label='fig. 4: the "you too" reply' />
			<Fig x={2000} y={400} s={0.6} pose="sad" face="sleepy" label="fig. 5: the 3 AM replay" />
			<Fig x={900} y={1330} s={0.6} pose="shrug" face="confused" label="fig. 6: the word on the tip" />
			<Fig x={1660} y={1330} s={0.6} pose="cross" face="annoyed" label="fig. 7: the other line" />
			{/* centre: the mascot jar */}
			<g transform="translate(720 918) scale(0.95)">
				<Jar label="YOU" face="smile" pose="wave" />
			</g>
		</svg>
		{/* desktop sides: pinned specimen cards */}
		<SpecimenCard spec={S001} x={40} y={600} width={440} />
		<SpecimenCard spec={S002} x={2080} y={590} width={440} stamp={1} stampText={channel.signoff} />
		{/* centre: title */}
		<div style={{position: 'absolute', left: 920, top: 565}}>
			<Title size={140} />
			<div style={{fontFamily: HAND, fontWeight: 700, fontSize: 50, color: INK, marginTop: 18}}>{channel.tagline}</div>
			<div style={{fontFamily: TYPE, fontSize: 38, color: RED, marginTop: 14}}>{channel.schedule}</div>
		</div>
		{showSafe && (
			<svg width={2560} height={1440} style={{position: 'absolute'}}>
				<rect x={0} y={508} width={2560} height={423} fill="none" stroke="#2A7FFF" strokeWidth={6} strokeDasharray="20 12" />
				<rect x={507} y={508} width={1546} height={423} fill="none" stroke="#E0322E" strokeWidth={6} />
				<text x={520} y={500} fontSize={34} fill="#E0322E" fontFamily="Arial">visible on all devices (1546x423)</text>
				<text x={10} y={500} fontSize={34} fill="#2A7FFF" fontFamily="Arial">desktop (2560x423)</text>
				<text x={10} y={40} fontSize={34} fill="#555" fontFamily="Arial">TV: full image</text>
			</svg>
		)}
	</Sheet>
);

/** Profile picture 800x800 (shown as a circle, as small as 98px): the specimen jar. */
export const Avatar: React.FC = () => (
	<Sheet margin={false}>
		<svg width={800} height={800} style={{position: 'absolute'}}>
			<circle cx={400} cy={400} r={330} fill={HIGHLIGHT} opacity={0.45} />
			<g transform="translate(400 708) scale(1.45)">
				<Jar label="YOU" face="smile" pose="wave" />
			</g>
		</svg>
	</Sheet>
);

/** Video watermark 150x150, transparent background. */
export const Watermark: React.FC = () => (
	<Sheet paper={false}>
		<svg width={150} height={150} style={{position: 'absolute'}}>
			<circle cx={75} cy={75} r={71} fill="#F6F0E3" stroke={INK} strokeWidth={4} />
			<g transform="translate(75 137) scale(0.28)">
				<Jar label="YOU" face="smile" pose="wave" />
			</g>
		</svg>
	</Sheet>
);

/** Thumbnail for long videos, 1280x720. `lines` = title lines, `red` = the word to paint red. */
export const Thumbnail: React.FC<{lines: string[]; red?: string}> = ({lines, red}) => (
	<Sheet>
		<svg width={1280} height={720} style={{position: 'absolute'}}>
			<g transform="translate(1040 680) scale(1.05)">
				<Jar label="YOU" face="surprised" pose="shrug" />
			</g>
			<Emote kind="!" x={1200} y={150} p={1} size={80} />
		</svg>
		<div style={{position: 'absolute', left: 70, top: 60, width: 780, fontFamily: MARKER, fontSize: 104, lineHeight: 1.02, color: INK}}>
			{lines.map((line, i) => (
				<div key={i}>
					{line.split(' ').map((w, j) => (
						<span key={j} style={{position: 'relative', display: 'inline-block', marginRight: 26, color: w === red ? RED : INK}}>
							{w === red && <span style={{position: 'absolute', left: -8, right: -8, top: '45%', height: '45%', background: HIGHLIGHT, borderRadius: 8, transform: 'rotate(-2deg)', zIndex: -1}} />}
							{w}
						</span>
					))}
				</div>
			))}
		</div>
		<Stamp text={channel.signoff} size={56} p={1} style={{position: 'absolute', left: 90, top: 560}} />
	</Sheet>
);

/** Background for YouTube end screens (last 5-20 s of long videos), 1920x1080. */
export const EndScreen: React.FC = () => (
	<Sheet>
		<svg width={1920} height={1080} style={{position: 'absolute'}}>
			{[110, 785].map((x) => (
				<rect key={x} x={x} y={330} width={615} height={346} rx={6} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="22 14" />
			))}
			<circle cx={1640} cy={420} r={140} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="22 14" />
			<g transform="translate(1640 1010) scale(0.62)">
				<Jar label="YOU" face="grin" pose="wave" />
			</g>
			<CoffeeRing x={1450} y={170} r={80} />
		</svg>
		<div style={{position: 'absolute', left: 110, top: 140, fontFamily: MARKER, fontSize: 104, color: INK}}>
			more <span style={{color: RED}}>specimens</span> to study
		</div>
		<div style={{position: 'absolute', left: 110, top: 720, fontFamily: TYPE, fontSize: 38, color: INK, opacity: 0.8}}>field journal of {channel.handle}</div>
		<div style={{position: 'absolute', left: 1500, top: 588, width: 280, textAlign: 'center', fontFamily: HAND, fontWeight: 700, fontSize: 40, color: INK}}>subscribe</div>
	</Sheet>
);
