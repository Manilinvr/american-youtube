import React from 'react';
import {Bedroom, DayDesk, LoopCloseup, NightBed, Notebook} from './night';
import {Evidence, Neuron, Note, WhiteBear} from './science';

/** Illustration library for textbook panels: "art" in a page panel -> component. Register new ones here. */
export const ART: Record<string, React.FC<any>> = {
	bedroom: Bedroom,
	loop: LoopCloseup,
	neuron: Neuron,
	day: DayDesk,
	night: NightBed,
	evidence: Evidence,
	'white-bear': WhiteBear,
	notebook: Notebook,
	note: Note,
};
