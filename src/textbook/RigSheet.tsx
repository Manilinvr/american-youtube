import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BookDefs} from './ink';
import {BOOK} from './palette';
import {ELDER, Figure, FRIEND, MAIN, STRANGER} from './rig';

/** Reference sheet for the drawn character (Studio: "rig-sheet"). */
export const RigSheet: React.FC = () => (
	<AbsoluteFill style={{background: BOOK.paper}}>
		<svg width={1800} height={1000}>
			<BookDefs />
			<Figure x={110} y={300} />
			<Figure x={300} y={300} pose="walk" walk={0.9} look={MAIN} face={{smile: 0.5}} />
			<Figure x={490} y={300} pose="walk" walk={2.6} look={FRIEND} face={{smile: 0.8}} />
			<Figure x={680} y={300} near={{hand: [30, -220], grip: 'open'}} look={STRANGER} face={{smile: 0.8, talk: 0.5}} />
			<Figure x={870} y={300} near={{hand: [95, -80], grip: 'point'}} look={ELDER} face={{raise: 1}} />
			<Figure x={1060} y={300} lean={14} near={{hand: [95, -110], grip: 'open', rot: -80}} far={{hand: [90, -90], grip: 'open', rot: -80}} face={{worry: 1, lid: 1}} />
			<Figure x={1250} y={300} slouch={1} lean={6} face={{worry: 1, look: [0.5, 1]}} />
			<Figure x={1440} y={300} turn={-1} look={FRIEND} />
			<Figure x={1630} y={300} facing={-1} near={{hand: [30, -120], grip: 'hold'}} face={{look: [1, 0]}} look={STRANGER} />
			<rect x={40} y={770} width={1700} height={8} fill={BOOK.wood} />
			<Figure x={150} y={700} pose="sit" seat={70} near={{hand: [62, -44], grip: 'hold'}} face={{smile: 0.5}} />
			<Figure x={420} y={700} pose="sit" seat={70} facing={-1} near={{hand: [62, -48], grip: 'open'}} look={FRIEND} face={{talk: 0.7, smile: 0.4}} />
			<Figure x={680} y={700} pose="sit" seat={70} slouch={0.8} lean={14} near={{hand: [62, -28]}} far={{hand: [52, -26]}} face={{look: [0.6, 1], worry: 1}} look={STRANGER} />
			<Figure x={940} y={700} pose="sit" seat={70} near={{hand: [40, -118], grip: 'hold'}} face={{look: [1, -0.2]}} look={ELDER} />
			<Figure x={1200} y={700} pose="sit" seat={70} turn={0.1} near={{hand: [50, -60], grip: 'hold'}} face={{smile: 0.6}} look={FRIEND} />
			<Figure x={1460} y={700} pose="sit" seat={70} turn={-1} near={{hand: [44, -56], grip: 'hold'}} far={{hand: [-40, -56]}} />
		</svg>
	</AbsoluteFill>
);
