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

export type SceneDef = {
	id: string;
	say: string;
	visual: Visual;
	voice?: string;
	speed?: number;
	/** Extra seconds of silence after this scene's line (overrides the mood's default). */
	hold?: number;
};

export type CharacterSpec = {outfit: string; skin?: string; hair?: string};

export type Episode = {
	id: string;
	format: 'short' | 'long';
	title: string;
	profession: string;
	mood: string;
	voice?: {name?: string; speed?: number; pause?: number};
	character: CharacterSpec;
	/** Optional background music file in public/music/, played quietly under the voice. */
	music?: string;
	sources?: string[];
	scenes: SceneDef[];
};

export type Palette = {bg1: string; bg2: string; accent: string; ink: string; text: string; soft: string};

export type Mood = {
	label: string;
	voice: string;
	speed: number;
	pause: number;
	/** Animation intensity multiplier: bobbing, shake, pop strength. */
	energy: number;
	palette: Palette;
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
};

export type EpisodeProps = {episodeId: string; timeline?: TimedScene[]};
