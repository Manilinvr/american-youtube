import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Paper, SketchDefs} from './components/ink';
import {Face, Person, PoseName} from './components/Person';
import {PROPS, PropArt} from './components/props';
import {HAND} from './fonts';
import {INK} from './theme';

const POSES: PoseName[] = ['stand', 'point', 'think', 'shrug', 'facepalm', 'scratch', 'cross', 'phone', 'cheer', 'hips', 'sad', 'sit'];
const FACES: Face[] = ['neutral', 'smile', 'grin', 'meh', 'sad', 'surprised', 'worried', 'smug', 'annoyed', 'confused', 'peaceful', 'sleepy'];

/** Reference sheet of every pose, face and prop — open it in the Studio when writing scripts. */
export const SketchSheet: React.FC = () => (
	<AbsoluteFill>
		<SketchDefs />
		<Paper strokes={false} />
		<AbsoluteFill style={{filter: 'url(#boil)'}}>
			<svg width={1920} height={1080}>
				{POSES.map((pose, i) => (
					<g key={pose} transform={`translate(${90 + i * 150} ${pose === 'sit' ? 240 : 330}) scale(0.62)`}>
						<Person pose={pose} face={FACES[i]} look={i === 11 ? 'hoodie' : 'stick'} phase={i * 0.3} />
					</g>
				))}
				{Object.keys(PROPS).map((name, i) => (
					<g key={name} transform={`translate(${110 + (i % 8) * 230} ${i < 8 ? 690 : 960}) scale(0.4)`}>
						<PropArt name={name} frame={0} />
					</g>
				))}
			</svg>
			{POSES.map((pose, i) => (
				<div key={pose} style={{position: 'absolute', left: 30 + i * 150, top: 350, width: 120, textAlign: 'center', fontFamily: HAND, fontSize: 22, color: INK}}>
					{pose}
					<br />
					<i>{FACES[i]}</i>
				</div>
			))}
			{Object.keys(PROPS).map((name, i) => (
				<div key={name} style={{position: 'absolute', left: 30 + (i % 8) * 230, top: i < 8 ? 700 : 970, width: 160, textAlign: 'center', fontFamily: HAND, fontSize: 24, color: INK}}>
					{name}
				</div>
			))}
		</AbsoluteFill>
	</AbsoluteFill>
);
