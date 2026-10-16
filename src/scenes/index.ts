import React from 'react';
import type {Visual} from '../types';
import {CountdownScene} from './CountdownScene';
import {HeroScene} from './HeroScene';
import {ListScene} from './ListScene';
import {StatScene} from './StatScene';
import {VehicleScene} from './VehicleScene';
import {WakeupScene} from './WakeupScene';

/** Scene library: "visual.type" in an episode script -> component. Register new scene types here. */
export const SCENES: Record<string, React.FC<{visual: Visual}>> = {
	hero: HeroScene,
	stat: StatScene,
	list: ListScene,
	wakeup: WakeupScene,
	countdown: CountdownScene,
	vehicle: VehicleScene,
};
