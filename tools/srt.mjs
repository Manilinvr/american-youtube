#!/usr/bin/env node
// Writes publish/<id>.srt (subtitles to upload to YouTube) from the same timeline the video uses.
//   npm run srt -- s001-doorway-forgetter
import {build} from 'esbuild';
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const id = process.argv[2];
if (!id) {
	console.error('Usage: npm run srt -- <episode-id>');
	process.exit(1);
}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

// bundle src/timing.ts for Node, with a tiny stand-in for the browser-only bits of "remotion"
const stub = {
	name: 'remotion-stub',
	setup(b) {
		b.onResolve({filter: /^remotion$/}, () => ({path: 'remotion', namespace: 'stub'}));
		b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({contents: 'export const staticFile = (s) => s;', loader: 'js'}));
	},
};
const out = await build({
	stdin: {contents: "export {buildTimeline, FPS} from './src/timing';", resolveDir: root, loader: 'ts'},
	bundle: true,
	platform: 'node',
	format: 'esm',
	write: false,
	plugins: [stub],
	logLevel: 'error',
});
const {buildTimeline, FPS} = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);
const manifest = JSON.parse((await import('node:fs')).readFileSync(path.join(root, 'public/voice', id, 'manifest.json'), 'utf8'));
const timeline = buildTimeline(id, manifest);

const words = timeline.flatMap((s) => s.voice.words.map((w) => ({t: w.t, start: (s.from + s.lead) / FPS + w.s, end: (s.from + s.lead) / FPS + w.e})));
// group into readable lines: up to 8 words, break after sentence punctuation
const cues = [];
let cur = [];
words.forEach((w, i) => {
	cur.push(w);
	const next = words[i + 1];
	if (cur.length >= 8 || /[.!?…]$/.test(w.t) || !next || next.start - w.end > 0.6) {
		cues.push({text: cur.map((x) => x.t).join(' '), start: cur[0].start, end: Math.min(w.end + 0.25, next ? next.start : w.end + 0.25)});
		cur = [];
	}
});
const ts = (sec) => {
	const ms = Math.round(sec * 1000);
	const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
	const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
	const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
	return `${h}:${m}:${s},${String(ms % 1000).padStart(3, '0')}`;
};
const srt = cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join('\n');
mkdirSync(path.join(root, 'publish'), {recursive: true});
writeFileSync(path.join(root, 'publish', `${id}.srt`), srt);
console.log(`publish/${id}.srt (${cues.length} lines)`);
