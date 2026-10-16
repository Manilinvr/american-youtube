import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

export type SfxName = 'pop' | 'whoosh' | 'ding' | 'alarm' | 'tick' | 'siren' | 'boing' | 'scratch';

/** Plays a generated sound effect from public/sfx/ at a scene-relative frame. */
export const Sfx: React.FC<{name: SfxName; at: number; volume?: number}> = ({name, at, volume = 0.35}) => (
	<Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
		<Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
	</Sequence>
);
