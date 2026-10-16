import React from 'react';
import {FELL, FELL_SC, TYPE} from '../../fonts';
import {prog, shown, useArt} from '../context';
import {Ink, Reveal, Shape, Write} from '../ink';
import {BOOK} from '../palette';
import {roughLine, roughRect} from '../rough';

/** Progress for line i: by its own event if given, otherwise staggered after the panel is drawn. */
const lineProg = (a: ReturnType<typeof useArt>, i: number, ats?: (string | null)[], dur = 26) => {
	const ev = ats?.[i];
	if (ev) return prog(a, ev, dur, 0, false);
	if (!Number.isFinite(a.show)) return 1;
	return Math.max(0, Math.min(1, (a.f - a.show - 20 - i * 16) / dur));
};

/**
 * Dark text panel: a field term, written on like a heading in an old textbook.
 * props: kicker, title (use \n for two lines), sub, cite, at (event for the title), subAt
 */
export const TitleCard: React.FC<{kicker?: string; title: string; sub?: string; cite?: string; at?: string; subAt?: string; size?: number}> = ({kicker, title, sub, cite, at, subAt, size = 40}) => {
	const a = useArt();
	const titleP = at ? prog(a, at, 30, 0, false) : Number.isFinite(a.show) ? Math.max(0, Math.min(1, (a.f - a.show - 6) / 26)) : 1;
	const subP = subAt ? prog(a, subAt, 40, 0, false) : Math.max(0, titleP * 1.6 - 0.6);
	const lines = title.split('\n');
	const cy = a.h / 2 - (lines.length - 1) * size * 0.6 - (sub ? 14 : 0);
	return (
		<Reveal p={shown(a)}>
			<rect x={-4} y={-4} width={a.w + 8} height={a.h + 8} fill="url(#tb-wear)" opacity={0.5} />
			{kicker && (
				<text x={a.w / 2} y={cy - size * 1.05} fontFamily={FELL_SC} fontSize={17} letterSpacing={3} fill={BOOK.ochre} textAnchor="middle" opacity={Math.min(1, titleP * 3)}>
					{kicker}
				</text>
			)}
			{lines.map((l, i) => (
				<Write key={i} text={l} p={Math.max(0, Math.min(1, titleP * lines.length - i))} x={a.w / 2} y={cy + i * size * 1.15} size={size} font={FELL_SC} color={BOOK.parchment} anchor="middle" spacing={1} />
			))}
			{titleP > 0 && <Ink d={roughLine(a.w / 2 - 110 * titleP, cy + (lines.length - 1) * size * 1.15 + 18, a.w / 2 + 110 * titleP, cy + (lines.length - 1) * size * 1.15 + 18, 901, 0.4)} w={1.4} color={BOOK.ochre} p={1} second={false} />}
			{sub && <Write text={sub} p={subP} x={a.w / 2} y={cy + (lines.length - 1) * size * 1.15 + 50} size={19} italic color={BOOK.parchment} anchor="middle" opacity={0.9} />}
			{cite && (
				<text x={a.w - 14} y={a.h - 14} fontFamily={FELL} fontStyle="italic" fontSize={14} fill={BOOK.parchment} opacity={0.7 * Math.min(1, subP * 2)} textAnchor="end">
					{cite}
				</text>
			)}
		</Reveal>
	);
};

/**
 * A typed index card pinned to the page: what the researchers did, line by line.
 * props: head, lines (typed), ats (event per line, optional), cite
 */
export const StudyCard: React.FC<{head?: string; lines: string[]; ats?: (string | null)[]; cite?: string; rot?: number; size?: number}> = ({head = 'The study', lines, ats, cite, rot = -1.5, size = 19}) => {
	const a = useArt();
	const cw = a.w - 50;
	const ch = a.h - 50;
	return (
		<Reveal p={shown(a)}>
			<g transform={`translate(${a.w / 2} ${a.h / 2}) rotate(${rot}) translate(${-cw / 2} ${-ch / 2})`}>
				<rect x={5} y={6} width={cw} height={ch} fill={BOOK.black} opacity={0.18} />
				<Shape d={roughRect(0, 0, cw, ch, 911, 0.6)} color="#F6EEDC" w={1.6} />
				<line x1={0} x2={cw} y1={44} y2={44} stroke={BOOK.terracotta} strokeWidth={1.4} opacity={0.7} />
				{Array.from({length: Math.floor((ch - 60) / 30)}, (_, i) => (
					<line key={i} x1={8} x2={cw - 8} y1={74 + i * 30} y2={74 + i * 30} stroke={BOOK.blue} strokeWidth={0.9} opacity={0.45} />
				))}
				<text x={18} y={31} fontFamily={FELL_SC} fontSize={20} letterSpacing={2} fill={BOOK.ink}>
					{head}
				</text>
				{lines.map((l, i) => (
					<Write key={i} text={l} p={lineProg(a, i, ats)} x={18} y={70 + i * 30} size={size} font={TYPE} color={BOOK.ink} />
				))}
				{cite && (
					<text x={cw - 14} y={ch - 12} fontFamily={FELL} fontStyle="italic" fontSize={14} fill={BOOK.brown} textAnchor="end">
						{cite}
					</text>
				)}
				{/* red pin */}
				<circle cx={cw / 2} cy={-2} r={7} fill={BOOK.terracotta} stroke={BOOK.ink} strokeWidth={1.4} />
				<circle cx={cw / 2 - 2} cy={-4} r={2} fill={BOOK.parchment} opacity={0.7} />
			</g>
		</Reveal>
	);
};
