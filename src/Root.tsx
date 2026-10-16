import React from 'react';
import {Composition} from 'remotion';
import {SketchSheet} from './SketchSheet';
import {EpisodeVideo} from './EpisodeVideo';
import {EPISODES} from './episodes';
import {calculateEpisodeMetadata, FPS} from './timing';
import type {EpisodeProps} from './types';

export const RemotionRoot: React.FC = () => (
	<>
		{EPISODES.map((ep) => (
			<Composition<any, EpisodeProps>
				key={ep.id}
				id={ep.id}
				component={EpisodeVideo}
				defaultProps={{episodeId: ep.id}}
				calculateMetadata={calculateEpisodeMetadata}
				fps={FPS}
				width={ep.format === 'short' ? 1080 : 1920}
				height={ep.format === 'short' ? 1920 : 1080}
				durationInFrames={FPS * 30}
			/>
		))}
		<Composition id="sketch-sheet" component={SketchSheet} fps={FPS} width={1920} height={1080} durationInFrames={FPS * 4} />
	</>
);
