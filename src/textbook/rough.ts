/**
 * Hand-drawn geometry: seeded jitter so every line is slightly imperfect but identical on every frame
 * (book illustrations do not "boil"; life comes from motion, not from wobbling ink).
 */
export type Pt = [number, number];

export const rng = (seed: number) => {
	let s = Math.abs(Math.floor(seed * 9301 + 49297)) % 233280 || 1;
	return () => {
		s = (s * 9301 + 49297) % 233280;
		return s / 233280;
	};
};

/** Smooth curve through points (Catmull-Rom -> cubic Bezier). */
export const smooth = (pts: Pt[], closed = false, tension = 1): string => {
	if (pts.length < 2) return '';
	const n = pts.length;
	const get = (i: number): Pt => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
	const last = closed ? n : n - 1;
	for (let i = 0; i < last; i++) {
		const p0 = get(i - 1);
		const p1 = get(i);
		const p2 = get(i + 1);
		const p3 = get(i + 2);
		const k = tension / 6;
		const c1: Pt = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
		const c2: Pt = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
		d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
	}
	return closed ? `${d} Z` : d;
};

/** Points along a polyline with a little perpendicular jitter. */
export const jitter = (pts: Pt[], seed: number, amp = 1.2): Pt[] => {
	const r = rng(seed);
	return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp]);
};

/** A slightly bowed, wobbly straight line (overshoot extends it a little past its ends, like a pen stroke). */
export const roughLine = (x1: number, y1: number, x2: number, y2: number, seed: number, amp = 1.2, overshoot = 0): string => {
	const r = rng(seed);
	const len = Math.hypot(x2 - x1, y2 - y1) || 1;
	const ux = (x2 - x1) / len;
	const uy = (y2 - y1) / len;
	const sx = x1 - ux * overshoot * r();
	const sy = y1 - uy * overshoot * r();
	const ex = x2 + ux * overshoot * r();
	const ey = y2 + uy * overshoot * r();
	const bow = (r() - 0.5) * amp * 2.4;
	const steps = Math.max(2, Math.min(8, Math.round(len / 60)));
	const pts: Pt[] = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		const b = Math.sin(Math.PI * t) * bow + (i > 0 && i < steps ? (r() - 0.5) * amp : 0);
		pts.push([sx + (ex - sx) * t - uy * b, sy + (ey - sy) * t + ux * b]);
	}
	return smooth(pts);
};

/** Closed wobbly polygon (corners stay sharp-ish because points are dense near them). */
export const roughPoly = (pts: Pt[], seed: number, amp = 1.2, closed = true): string => {
	const dense: Pt[] = [];
	const n = pts.length;
	const segs = closed ? n : n - 1;
	for (let i = 0; i < segs; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % n];
		dense.push(a, [a[0] + (b[0] - a[0]) * 0.08, a[1] + (b[1] - a[1]) * 0.08], [a[0] + (b[0] - a[0]) * 0.5, a[1] + (b[1] - a[1]) * 0.5], [a[0] + (b[0] - a[0]) * 0.92, a[1] + (b[1] - a[1]) * 0.92]);
	}
	if (!closed) dense.push(pts[n - 1]);
	const j = jitter(dense, seed, amp);
	return smooth(j, closed, 0.6);
};

export const roughRect = (x: number, y: number, w: number, h: number, seed: number, amp = 1.2): string =>
	roughPoly(
		[
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h],
		],
		seed,
		amp,
	);

/** Wobbly ellipse/circle. */
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed: number, amp = 1, n = 14): string => {
	const r = rng(seed);
	const pts: Pt[] = [];
	const rot = r() * Math.PI * 2;
	for (let i = 0; i < n; i++) {
		const a = rot + (i / n) * Math.PI * 2;
		const k = 1 + (r() - 0.5) * 0.04 * amp;
		pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
	}
	return smooth(pts, true);
};

/** Point on a polyline at fraction t (by length). */
export const along = (pts: Pt[], t: number): Pt => {
	const lens: number[] = [];
	let total = 0;
	for (let i = 1; i < pts.length; i++) {
		const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
		lens.push(l);
		total += l;
	}
	let d = ((t % 1) + 1) % 1 * total;
	for (let i = 0; i < lens.length; i++) {
		if (d <= lens[i]) {
			const k = lens[i] ? d / lens[i] : 0;
			return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
		}
		d -= lens[i];
	}
	return pts[pts.length - 1];
};

/** Sample a parametric curve into points. */
export const sample = (f: (t: number) => Pt, n: number, closed = false): Pt[] => {
	const out: Pt[] = [];
	const count = closed ? n : n + 1;
	for (let i = 0; i < count; i++) out.push(f(i / n));
	return out;
};

export const polyline = (pts: Pt[]): string => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
