import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Character, Expression} from './components/Character';
import {OUTFITS} from './components/outfits';
import {EpisodeCtx} from './context';
import {getMood} from './episodes';
import {BODY} from './fonts';

const EXPRESSIONS: Expression[] = ['happy', 'smirk', 'surprised', 'serious', 'worried', 'sleepy'];

/** Preview of every outfit and expression — handy when adding a new profession. */
export const CharacterSheet: React.FC = () => {
	const mood = getMood('playful');
	const outfits = Object.keys(OUTFITS);
	return (
		<EpisodeCtx.Provider value={{palette: mood.palette, energy: 1, character: {outfit: 'civilian'}, vertical: false}}>
			<AbsoluteFill style={{background: '#F4EFE6', fontFamily: BODY, padding: 40}}>
				<div style={{display: 'flex', gap: 0, alignItems: 'flex-end'}}>
					{outfits.map((o) => (
						<div key={o} style={{textAlign: 'center', fontSize: 30, fontWeight: 700}}>
							<Character height={300} outfit={o} pose={o === 'civilian' ? 'wave' : 'idle'} talking={false} />
							<div>{o}</div>
						</div>
					))}
				</div>
				<div style={{display: 'flex', gap: 10, marginTop: 60, alignItems: 'flex-end'}}>
					{EXPRESSIONS.map((e, i) => (
						<div key={e} style={{textAlign: 'center', fontSize: 30, fontWeight: 700}}>
							<Character height={420} outfit="firefighter" expression={e} pose={(['idle', 'shrug', 'cheer', 'point', 'hold', 'idle'] as const)[i]} talking={false} />
							<div>{e}</div>
						</div>
					))}
				</div>
			</AbsoluteFill>
		</EpisodeCtx.Provider>
	);
};
