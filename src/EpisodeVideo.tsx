import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {Captions, CaptionWord} from './components/Captions';
import {Paper, SketchDefs} from './components/ink';
import {EpisodeCtx, SceneCtx} from './context';
import {getEpisode, getTone} from './episodes';
import {SCENES} from './scenes';
import {buildTimeline} from './timing';
import type {EpisodeProps, Visual} from './types';

const Missing: React.FC<{visual: Visual}> = ({visual}) => (
	<AbsoluteFill style={{color: '#c00', fontSize: 60, alignItems: 'center', justifyContent: 'center'}}>Unknown scene type "{visual.type}"</AbsoluteFill>
);

/** Same backdrop as the previous scene -> no redraw, so cuts inside one location feel continuous. */
const sameSet = (a?: Visual, b?: Visual) => !!a && !!b && a.type === 'situation' && b.type === 'situation' && a.setting === b.setting;

const showsCaptions = (v: Visual) => v.captions !== false && !(v.type === 'quote' && !v.text);

export const EpisodeVideo: React.FC<EpisodeProps> = ({episodeId, timeline}) => {
	const {fps} = useVideoConfig();
	const episode = getEpisode(episodeId);
	const tone = getTone(episode.tone);
	const tl = useMemo(() => timeline ?? buildTimeline(episodeId, null), [timeline, episodeId]);
	const words: CaptionWord[] = useMemo(
		() =>
			tl
				.filter((s) => showsCaptions(s.def.visual))
				.flatMap((s) =>
					s.voice.words.map((w) => ({
						text: w.t,
						start: s.from + s.lead + Math.round(w.s * fps),
						end: s.from + s.lead + Math.round(w.e * fps),
						emph: w.em,
					})),
				),
		[tl, fps],
	);
	const info = useMemo(() => ({energy: tone.energy, vertical: episode.format === 'short'}), [tone, episode]);

	return (
		<EpisodeCtx.Provider value={info}>
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<SketchDefs />
				<Paper />
				{tl.map((s, i) => {
					const Scene = SCENES[s.def.visual.type] ?? Missing;
					// the very first frame must already show the picture (it is what people see while swiping)
					const drawOn = i > 0 && s.def.visual.draw !== false && !sameSet(tl[i - 1]?.def.visual, s.def.visual);
					return (
						<Sequence key={s.def.id} from={s.from} durationInFrames={s.durationInFrames} name={s.def.id}>
							<SceneCtx.Provider value={{voice: s.voice, lead: s.lead, durationInFrames: s.durationInFrames}}>
								<AbsoluteFill style={{filter: 'url(#boil)'}}>
									<Scene visual={s.def.visual} drawOn={drawOn} />
								</AbsoluteFill>
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
				{episode.music && <Audio src={staticFile(`music/${episode.music}`)} volume={0.08} loop />}
			</AbsoluteFill>
		</EpisodeCtx.Provider>
	);
};
