import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

export type SfxName = 'pop' | 'whoosh' | 'ding' | 'tick' | 'boing' | 'scratch' | 'scribble' | 'page' | 'stamp' | 'buzz' | 'hit' | 'rise' | 'blip';

/** Plays a generated sound effect from public/sfx/ at a scene-relative frame. */
export const Sfx: React.FC<{name: SfxName; at: number; volume?: number}> = ({name, at, volume = 0.3}) =>
	Number.isFinite(at) ? (
		<Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
			<Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
		</Sequence>
	) : null;
