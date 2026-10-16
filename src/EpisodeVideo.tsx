import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, CaptionWord} from './components/Captions';
import {Paper, SketchDefs} from './components/ink';
import {EpisodeCtx, SceneCtx} from './context';
import {getEpisode, getTone} from './episodes';
import {SCENES} from './scenes';
import {buildTimeline} from './timing';
import type {EpisodeProps, TimedScene, Visual} from './types';

const Missing: React.FC<{visual: Visual}> = ({visual}) => (
	<AbsoluteFill style={{color: '#c00', fontSize: 60, alignItems: 'center', justifyContent: 'center'}}>Unknown scene type "{visual.type}"</AbsoluteFill>
);

/** Same backdrop as the previous scene -> no redraw, so cuts inside one location feel continuous. */
const sameSet = (a?: Visual, b?: Visual) => !!a && !!b && a.type === 'situation' && b.type === 'situation' && a.setting === b.setting;

const showsCaptions = (v: Visual) => v.captions !== false && !(v.type === 'quote' && !v.text);

const ease = Easing.inOut(Easing.cubic);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Fades/zooms a scene in and out according to its transitions.
 * fade: cross-dissolve. black: out to black, then in from black. zoom: outgoing pushes in, incoming settles from a slight pull-back.
 */
const TransitionShell: React.FC<{scene: TimedScene; children: React.ReactNode}> = ({scene, children}) => {
	const frame = useCurrentFrame();
	const {transIn, transOut, durationInFrames: d} = scene;
	let opacity = 1;
	let scale = 1;
	if (transIn.frames > 0) {
		const half = transIn.type === 'black' ? transIn.frames / 2 : 0;
		const p = interpolate(frame, [half, transIn.frames], [0, 1], {...clamp, easing: ease});
		opacity *= p;
		if (transIn.type === 'zoom') scale *= interpolate(p, [0, 1], [0.9, 1]);
	}
	if (transOut.frames > 0) {
		const start = d - transOut.frames;
		const end = transOut.type === 'black' ? start + transOut.frames / 2 : d;
		const p = interpolate(frame, [start, end], [1, 0], {...clamp, easing: ease});
		opacity *= p;
		if (transOut.type === 'zoom') scale *= interpolate(p, [0, 1], [1.18, 1]);
	}
	return <AbsoluteFill style={{opacity, transform: `scale(${scale})`}}>{children}</AbsoluteFill>;
};

/** Black overlay for "dip to black" transitions and the final fade-out. */
const Blackout: React.FC<{timeline: TimedScene[]}> = ({timeline}) => {
	const frame = useCurrentFrame();
	let o = 0;
	timeline.forEach((s, i) => {
		if (s.transIn.type === 'black' && i > 0) {
			const mid = s.from + s.transIn.frames / 2;
			o = Math.max(o, interpolate(Math.abs(frame - mid), [0, s.transIn.frames / 2], [1, 0], clamp));
		}
	});
	const last = timeline[timeline.length - 1];
	const end = last.from + last.durationInFrames;
	o = Math.max(o, interpolate(frame, [end - last.transOut.frames, end - 2], [0, 1], {...clamp, easing: ease}));
	return o > 0 ? <AbsoluteFill style={{background: '#14110E', opacity: o}} /> : null;
};

/** Looping ambience (e.g. running shower) that fades in and out with its scene. */
const Ambience: React.FC<{name: string; frames: number}> = ({name, frames}) => (
	<Audio
		src={staticFile(`sfx/${name}.wav`)}
		loop
		volume={(f) => 0.14 * interpolate(f, [0, 12, frames - 14, frames], [0, 1, 1, 0], clamp)}
	/>
);

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
	const last = tl[tl.length - 1];
	const total = last.from + last.durationInFrames;
	// music ducking: how much the narrator is talking around each frame (0-1), smoothed over ~0.3 s
	const talking = useMemo(() => {
		const raw = new Float32Array(total + 1);
		tl.forEach((s) => {
			for (let i = 0; i < s.voice.env.length; i++) {
				const f = s.from + s.lead + i;
				if (f <= total) raw[f] = Math.max(raw[f], Number(s.voice.env[i]) > 1 ? 1 : 0);
			}
		});
		const out = new Float32Array(total + 1);
		for (let f = 0; f <= total; f++) {
			let sum = 0;
			let n = 0;
			for (let k = Math.max(0, f - 12); k <= Math.min(total, f + 12); k++) {
				sum += raw[k];
				n++;
			}
			out[f] = sum / n; // moving average -> the music swells and dips smoothly
		}
		return out;
	}, [tl, total]);

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
								<TransitionShell scene={s}>
									<AbsoluteFill style={{filter: 'url(#boil)'}}>
										<Scene visual={s.def.visual} drawOn={drawOn} />
									</AbsoluteFill>
								</TransitionShell>
								{s.voice.file && (
									<Sequence from={s.lead} layout="none" name="voice">
										<Audio src={staticFile(s.voice.file)} />
									</Sequence>
								)}
								{s.def.ambience && <Ambience name={s.def.ambience} frames={s.durationInFrames} />}
							</SceneCtx.Provider>
						</Sequence>
					);
				})}
				<Blackout timeline={tl} />
				<Captions words={words} />
				{episode.music && (
					<Audio
						src={staticFile(`music/${episode.music}`)}
						loop
						// tracks are normalised to -14 LUFS: 0.2 sits ~14 dB under the voice, ducking a little more while she talks
						volume={(f) => (0.2 - 0.07 * (talking[f] ?? 0)) * interpolate(f, [0, 30, total - 40, total], [0.5, 1, 1, 0], clamp)}
					/>
				)}
			</AbsoluteFill>
		</EpisodeCtx.Provider>
	);
};
