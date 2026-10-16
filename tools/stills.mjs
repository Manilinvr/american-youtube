#!/usr/bin/env node
// Quality control: render a handful of frames of an episode as PNGs (one bundle, many stills).
//   node tools/stills.mjs <episode-id> 0 90 300 [--scale=0.5] [--browser-executable=/path/to/chrome]
// Frames may also be given in seconds: 12.5s. Output: out/stills/<id>/f<frame>.png
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const frames = args.filter((a) => !a.startsWith('--') && a !== id);
if (!id || !frames.length) {
	console.error('Usage: node tools/stills.mjs <episode-id> <frame|12.5s> ... [--scale=0.5] [--browser-executable=...]');
	process.exit(1);
}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'out', 'stills', id);
mkdirSync(outDir, {recursive: true});
const browserExecutable = opt('browser-executable') ?? null;
const scale = Number(opt('scale') ?? 1);

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id, inputProps: {episodeId: id}, browserExecutable});
console.log(`${id}: ${composition.durationInFrames} frames (${(composition.durationInFrames / composition.fps).toFixed(1)} s)`);
for (const f of frames) {
	const frame = f.endsWith('s') ? Math.round(parseFloat(f) * composition.fps) : Number(f);
	const output = path.join(outDir, `f${String(frame).padStart(5, '0')}.png`);
	await renderStill({composition, serveUrl, frame: Math.min(frame, composition.durationInFrames - 1), output, inputProps: composition.props, browserExecutable, scale});
	console.log(`  ${output}`);
}
