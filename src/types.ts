export type Word = {t: string; s: number; e: number; em: boolean};

export type VoiceScene = {
	id: string;
	file: string;
	duration: number;
	words: Word[];
	/** Loudness per frame, one digit 0-9 per frame (drives mouth movement). */
	env: string;
};

export type Manifest = {episode: string; fps: number; scenes: VoiceScene[]};

export type Visual = {type: string; [key: string]: any};

export type Transition = 'fade' | 'black' | 'zoom' | 'cut';

export type SceneDef = {
	id: string;
	say: string;
	visual: Visual;
	voice?: string;
	speed?: number;
	/** Read this line in another tone (e.g. "deep" for the closing thought). */
	tone?: string;
	/**
	 * How this scene arrives: "fade" (cross-dissolve, default), "black" (dip through black),
	 * "zoom" (outgoing scene pushes in while the new one settles), or "cut".
	 */
	transition?: Transition;
	/** Looping background sound for this scene, e.g. "shower" (public/sfx/<name>.wav). */
	ambience?: string;
	/** Extra seconds of silence after this scene's line (overrides the tone's default pause). */
	hold?: number;
};

export type Episode = {
	id: string;
	format: 'short' | 'long';
	title: string;
	/** Narration tone from config/tones.json; scenes may override it. */
	tone: string;
	voice?: {name?: string; speed?: number; pause?: number};
	/** Optional background music file in public/music/, played quietly under the voice. */
	music?: string;
	sources?: string[];
	/**
	 * Illustrated-textbook style: one page of panels for the whole episode; scenes of type "page"
	 * move the camera across it (see src/textbook and docs/textbook-style.md).
	 */
	page?: import('./textbook/context').PageDef;
	/** "prof": the Professor series (cut-out character, motion-graphics shots, see src/prof and docs/professor-style.md). */
	style?: 'sketch' | 'textbook' | 'prof';
	scenes: SceneDef[];
};

export type Tone = {
	label: string;
	voice: string;
	speed: number;
	pause: number;
	/** Animation intensity multiplier: idle motion, pop strength. */
	energy: number;
};

export type TimedScene = {
	def: SceneDef;
	/** Voice line; `file` is empty while the voice-over has not been generated yet. */
	voice: VoiceScene;
	/** First frame of the scene in the episode. */
	from: number;
	durationInFrames: number;
	/** Frame (relative to the scene) where the voice line starts. */
	lead: number;
	/** Transition into this scene (overlapping the previous one) and out of it (into the next). */
	transIn: {type: Transition; frames: number};
	transOut: {type: Transition; frames: number};
};

export type EpisodeProps = {episodeId: string; timeline?: TimedScene[]};
