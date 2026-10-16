import React from 'react';
import type {Visual} from '../types';
import {QuoteScene} from './QuoteScene';
import {SituationScene} from './Situation';
import {SplitScene} from './SplitScene';

export type SceneComponent = React.FC<{visual: Visual; drawOn: boolean}>;

/** Scene library: "visual.type" in an episode script -> component. Register new scene types here. */
export const SCENES: Record<string, SceneComponent> = {
	situation: SituationScene,
	quote: QuoteScene,
	split: SplitScene,
	// textbook style: the illustrated page is drawn once for the whole episode (src/textbook/BookPage.tsx)
	page: () => null,
};
