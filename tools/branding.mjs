#!/usr/bin/env node
// Renders the channel artwork into branding/ (name and tagline come from config/channel.json):
//   npm run branding [-- remotion still options, e.g. --browser-executable=...]
import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const extra = process.argv.slice(2);
const jobs = [
	['banner', 'banner-2560x1440.png'],
	['banner', 'banner-safe-areas-preview.png', '--props={"showSafe":true}'],
	['avatar', 'avatar-800x800.png'],
	['watermark', 'watermark-150x150.png'],
	['thumbnail', 'thumbnail-template-1280x720.png'],
	['endscreen', 'endscreen-1920x1080.png'],
];
mkdirSync(path.join(root, 'branding'), {recursive: true});
for (const [id, file, ...args] of jobs) {
	console.log(`> ${id} -> branding/${file}`);
	const res = spawnSync('npx', ['remotion', 'still', id, `branding/${file}`, '--image-format=png', '--log=error', ...args, ...extra], {
		cwd: root,
		stdio: 'inherit',
		shell: process.platform === 'win32',
	});
	if (res.status !== 0) process.exit(res.status ?? 1);
}
console.log('Done: branding/');
