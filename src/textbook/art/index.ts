import React from 'react';
import {Cafe, LabChat, Message, Meters, OtherWalk, Roommates, Signals, WalkHome} from './ep002';
import {CatchEye, GazeTest, LabStare, Relax, SaferMistake, Tally, Train, TurnAround} from './ep003';
import {Ancestor, Barrel, Comments, EEG, Keep, Reread, Review, Scale} from './ep004';
import {Drink, Favor, Glasses, Handoff, HighFive, Mirror, Morning, Scanner} from './ep005';
import {AlertFork, BodySignals, Branches, MaybeDoor, ReadNoReply, RockGame, ShrinkMaybe, StressCurve} from './ep006';
import {StudyCard, TitleCard} from './generic';
import {Bedroom, DayDesk, LoopCloseup, NightBed, Notebook} from './night';
import {Evidence, Neuron, Note, WhiteBear} from './science';

/** Illustration library for textbook panels: "art" in a page panel -> component. Register new ones here. */
export const ART: Record<string, React.FC<any>> = {
	// shared
	'title-card': TitleCard,
	'study-card': StudyCard,
	// ep001 night thoughts
	bedroom: Bedroom,
	loop: LoopCloseup,
	neuron: Neuron,
	day: DayDesk,
	night: NightBed,
	evidence: Evidence,
	'white-bear': WhiteBear,
	notebook: Notebook,
	note: Note,
	// ep002 liking gap
	cafe: Cafe,
	'walk-home': WalkHome,
	'lab-chat': LabChat,
	meters: Meters,
	signals: Signals,
	roommates: Roommates,
	'other-walk': OtherWalk,
	message: Message,
	// ep003 being stared at
	train: Train,
	'turn-around': TurnAround,
	'lab-stare': LabStare,
	'gaze-test': GazeTest,
	'safer-mistake': SaferMistake,
	'catch-eye': CatchEye,
	tally: Tally,
	relax: Relax,
	// ep004 negativity bias
	comments: Comments,
	barrel: Barrel,
	scale: Scale,
	eeg: EEG,
	ancestor: Ancestor,
	review: Review,
	reread: Reread,
	keep: Keep,
	// ep005 future self
	handoff: Handoff,
	drink: Drink,
	glasses: Glasses,
	scanner: Scanner,
	mirror: Mirror,
	morning: Morning,
	favor: Favor,
	'high-five': HighFive,
	// ep006 uncertainty
	'read-no-reply': ReadNoReply,
	branches: Branches,
	'rock-game': RockGame,
	'stress-curve': StressCurve,
	'body-signals': BodySignals,
	'alert-fork': AlertFork,
	'shrink-maybe': ShrinkMaybe,
	'maybe-door': MaybeDoor,
};
