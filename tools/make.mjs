#!/usr/bin/env node
// One command from script to upload-ready MP4:
//   npm run make -- doorway-effect
// 1) voice-over (Kokoro, cached)  2) render (Remotion)  3) loudness to YouTube's -14 LUFS
// Extra arguments are passed to `remotion render` (e.g. --browser-executable=/path/to/chrome).
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, rmSync} from 'node:fs';
import path from 'node:path';

const [id, ...extra] = process.argv.slice(2);
if (!id) {
	console.error('Usage: npm run make -- <episode-id> [remotion render options]');
	process.exit(1);
}
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const python = ['.venv/bin/python', '.venv/Scripts/python.exe'].map((p) => path.join(root, p)).find(existsSync) ?? 'python3';
const run = (cmd, args) => {
	console.log(`\n> ${cmd} ${args.join(' ')}`);
	const res = spawnSync(cmd, args, {cwd: root, stdio: 'inherit', shell: process.platform === 'win32'});
	if (res.status !== 0) process.exit(res.status ?? 1);
};

mkdirSync(path.join(root, 'out'), {recursive: true});
const raw = `out/${id}.raw.mp4`;
const final = `out/${id}.mp4`;
run(python, ['tools/tts/voice.py', id]);
run('npx', ['remotion', 'render', id, raw, ...extra]);
run('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', final]);
rmSync(path.join(root, raw));
console.log(`\nDone: ${final}`);
