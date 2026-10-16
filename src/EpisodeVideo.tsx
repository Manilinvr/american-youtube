import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, CaptionWord} from './components/Captions';
import {Sfx} from './components/Sfx';
import {EpisodeCtx, SceneCtx} from './context';
import {getEpisode, getMood} from './episodes';
import {SCENES} from './scenes';
import {buildTimeline} from './timing';
import type {EpisodeProps, Visual} from './types';

/** Quick zoom-punch at every cut, the standard Shorts editing rhythm. */
const SceneShell: React.FC<{children: React.ReactNode; first: boolean}> = ({children, first}) => {
	const frame = useCurrentFrame();
	const scale = first ? 1 : interpolate(frame, [0, 7], [1.08, 1], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{transform: `scale(${scale})`}}>
			{children}
			{!first && <Sfx name="whoosh" at={0} volume={0.12} />}
		</AbsoluteFill>
	);
};

const Missing: React.FC<{visual: Visual}> = ({visual}) => (
	<AbsoluteFill style={{background: '#222', color: '#fff', fontSize: 60, alignItems: 'center', justifyContent: 'center'}}>
		Unknown scene type "{visual.type}"
	</AbsoluteFill>
);

export const EpisodeVideo: React.FC<EpisodeProps> = ({episodeId, timeline}) => {
	const {fps} = useVideoConfig();
	const episode = getEpisode(episodeId);
	const mood = getMood(episode.mood);
	const tl = useMemo(() => timeline ?? buildTimeline(episodeId, null), [timeline, episodeId]);
	const words: CaptionWord[] = useMemo(
		() =>
			tl.flatMap((s) =>
				s.voice.words.map((w) => ({
					text: w.t,
					start: s.from + s.lead + Math.round(w.s * fps),
					end: s.from + s.lead + Math.round(w.e * fps),
					emph: w.em,
				})),
			),
		[tl, fps],
	);
	const info = useMemo(
		() => ({palette: mood.palette, energy: mood.energy, character: episode.character, vertical: episode.format === 'short'}),
		[mood, episode],
	);

	return (
		<EpisodeCtx.Provider value={info}>
			<AbsoluteFill style={{background: mood.palette.bg2, overflow: 'hidden'}}>
				{tl.map((s, i) => {
					const Scene = SCENES[s.def.visual.type] ?? Missing;
					return (
						<Sequence key={s.def.id} from={s.from} durationInFrames={s.durationInFrames} name={s.def.id}>
							<SceneCtx.Provider value={{voice: s.voice, lead: s.lead, durationInFrames: s.durationInFrames}}>
								<SceneShell first={i === 0}>
									<Scene visual={s.def.visual} />
								</SceneShell>
								{s.voice.file && (
									<Sequence from={s.lead} layout="none" name="voice">
										<Audio src={staticFile(s.voice.file)} />
									</Sequence>
								)}
							</SceneCtx.Provider>
						</Sequence>
					);
				})}
				<Captions words={words} />
				{episode.music && <Audio src={staticFile(`music/${episode.music}`)} volume={0.1} loop />}
			</AbsoluteFill>
		</EpisodeCtx.Provider>
	);
};
