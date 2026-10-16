import React from 'react';
import {Composition, Still} from 'remotion';
import {Avatar, Banner, EndScreen, Thumbnail, Watermark} from './branding/Branding';
import {SketchSheet} from './SketchSheet';
import {RigSheet} from './textbook/RigSheet';
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
		<Still id="rig-sheet" component={RigSheet} width={1800} height={1000} />
		{/* channel branding (npm run branding) */}
		<Still id="banner" component={Banner} width={2560} height={1440} defaultProps={{showSafe: false}} />
		<Still id="avatar" component={Avatar} width={800} height={800} />
		<Still id="watermark" component={Watermark} width={150} height={150} />
		<Still id="thumbnail" component={Thumbnail} width={1280} height={720} defaultProps={{lines: ['10 SPECIMENS', "YOU'VE MET", 'THIS WEEK'], red: 'SPECIMENS'}} />
		<Still id="endscreen" component={EndScreen} width={1920} height={1080} />
	</>
);
