import React from 'react';

/**
 * Flat cartoon icons, each drawn in a 100x100 box. Use <Icon name="heart" size={160} />.
 * Add new ones to ICONS; scripts reference them by name ("icon": "heart").
 */
const INK = '#1D1A1F';
const S = {stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

const ICONS: Record<string, React.ReactNode> = {
	fire: (
		<g {...S}>
			<path d="M50 6 C62 26 82 36 82 62 C82 82 68 94 50 94 C32 94 18 82 18 62 C18 46 28 36 34 28 C36 40 42 46 46 46 C44 30 46 18 50 6Z" fill="#FF6B1A" />
			<path d="M50 44 C58 56 68 62 68 74 C68 86 60 92 50 92 C40 92 32 86 32 74 C32 64 40 58 44 52 C46 60 50 62 50 62Z" fill="#FFD23F" strokeWidth={0} />
		</g>
	),
	heart: (
		<g {...S}>
			<path d="M50 88 C20 66 8 50 8 32 C8 18 19 8 32 8 C40 8 46 12 50 20 C54 12 60 8 68 8 C81 8 92 18 92 32 C92 50 80 66 50 88Z" fill="#E63946" />
			<path d="M24 46 L38 46 L44 34 L52 60 L58 46 L76 46" fill="none" stroke="#FFFFFF" strokeWidth={6} />
		</g>
	),
	car: (
		<g {...S}>
			<path d="M10 62 L14 46 Q16 40 22 40 L30 40 L38 26 Q40 22 46 22 L66 22 Q72 22 75 28 L82 40 L86 42 Q92 44 92 52 L92 64 Q92 68 88 68 L12 68 Q8 68 10 62Z" fill="#4D96FF" />
			<path d="M42 28 L36 40 L58 40 L58 28Z M64 28 L64 40 L76 40 L70 28Z" fill="#CFE8FF" />
			<circle cx="28" cy="70" r="11" fill="#2B2B2B" />
			<circle cx="74" cy="70" r="11" fill="#2B2B2B" />
			<path d="M82 22 L92 12 M88 30 L98 26 M76 16 L80 4" stroke="#FFB703" strokeWidth={6} />
		</g>
	),
	shower: (
		<g {...S}>
			<path d="M20 92 L20 30 Q20 12 38 12 Q56 12 56 30 L56 34" fill="none" strokeWidth={8} stroke="#9AA5B1" />
			<path d="M40 34 L72 34 L66 46 L46 46Z" fill="#C3CED9" />
			{[46, 56, 66].map((x) => (
				<path key={x} d={`M${x} 54 L${x - 4} 66 M${x + 2} 72 L${x - 2} 82`} stroke="#4DB8FF" strokeWidth={5} />
			))}
			<path d="M70 86 Q80 74 92 84 Q84 92 70 86Z" fill="#FFD23F" />
		</g>
	),
	medical: (
		<g {...S}>
			<circle cx="50" cy="50" r="42" fill="#FFFFFF" />
			<path d="M40 22 L60 22 L60 40 L78 40 L78 60 L60 60 L60 78 L40 78 L40 60 L22 60 L22 40 L40 40Z" fill="#E63946" />
		</g>
	),
	clock: (
		<g {...S}>
			<circle cx="50" cy="52" r="40" fill="#FFFFFF" strokeWidth={6} />
			<path d="M50 52 L50 28 M50 52 L66 60" strokeWidth={6} />
			<path d="M18 18 L30 10 M82 18 L70 10" strokeWidth={7} />
		</g>
	),
	helmet: (
		<g {...S}>
			<path d="M8 66 Q50 50 94 68 Q96 76 88 76 Q50 66 12 76 Q4 74 8 66Z" fill="#9E1B1B" />
			<path d="M18 68 Q18 24 50 22 Q82 24 82 68 Q50 60 18 68Z" fill="#D62828" />
			<path d="M40 30 L60 30 L63 52 Q50 60 37 52Z" fill="#FFFFFF" />
		</g>
	),
	coat: (
		<g {...S}>
			<path d="M30 12 L42 12 L50 24 L58 12 L70 12 L90 30 L82 50 L74 44 L74 92 L26 92 L26 44 L18 50 L10 30Z" fill="#C9A66B" />
			<rect x="26" y="70" width="48" height="8" fill="#E6FF3D" strokeWidth={0} />
			<path d="M50 24 L50 92" />
		</g>
	),
	boots: (
		<g {...S}>
			<path d="M12 20 L36 20 L36 66 L48 70 Q52 72 52 80 L52 88 L12 88Z" fill="#232323" />
			<path d="M52 20 L76 20 L76 66 L88 70 Q92 72 92 80 L92 88 L52 88Z" fill="#232323" />
			<rect x="12" y="42" width="24" height="7" fill="#E6FF3D" strokeWidth={0} />
			<rect x="52" y="42" width="24" height="7" fill="#E6FF3D" strokeWidth={0} />
		</g>
	),
	dollar: (
		<g {...S}>
			<circle cx="50" cy="50" r="42" fill="#2DC653" />
			<text x="50" y="68" fontSize="52" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="none" fontFamily="Arial Black, Arial">$</text>
		</g>
	),
	star: (
		<g {...S}>
			<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="#FFD23F" />
		</g>
	),
	check: (
		<g {...S}>
			<circle cx="50" cy="50" r="42" fill="#2DC653" />
			<path d="M28 52 L44 66 L72 34" fill="none" stroke="#FFFFFF" strokeWidth={10} />
		</g>
	),
	cross: (
		<g {...S}>
			<circle cx="50" cy="50" r="42" fill="#E63946" />
			<path d="M32 32 L68 68 M68 32 L32 68" stroke="#FFFFFF" strokeWidth={10} />
		</g>
	),
	bell: (
		<g {...S}>
			<path d="M50 10 Q74 12 76 40 L78 64 L88 76 L12 76 L22 64 L24 40 Q26 12 50 10Z" fill="#FFD23F" />
			<circle cx="50" cy="84" r="9" fill="#FFB703" />
		</g>
	),
	question: (
		<g {...S}>
			<circle cx="50" cy="50" r="42" fill="#7B61FF" />
			<text x="50" y="68" fontSize="54" fontWeight="900" textAnchor="middle" fill="#FFFFFF" stroke="none" fontFamily="Arial Black, Arial">?</text>
		</g>
	),
};

export const ICON_NAMES = Object.keys(ICONS);

export const Icon: React.FC<{name: string; size: number; style?: React.CSSProperties}> = ({name, size, style}) => (
	<svg viewBox="0 0 100 100" width={size} height={size} style={{overflow: 'visible', ...style}}>
		{ICONS[name] ?? ICONS.question}
	</svg>
);
