import React from 'react';

/**
 * Profession outfits for <Character>. Add a new profession by adding an entry here
 * (colors + hat + accessory). Hats are drawn in the character's 400x720 coordinate space,
 * where the head is a circle at (200, 250) with radius 125.
 */
export type Outfit = {
	coat: string;
	coatShade: string;
	pants: string;
	shoes: string;
	hands?: string; // gloves; defaults to skin
	stripe?: string; // reflective / decorative band on the coat
	collar?: string;
	hat: HatName;
	accessory?: 'stethoscope' | 'neckerchief' | 'tie' | 'badge' | 'vest' | 'none';
	accessoryColor?: string;
};

export type HatName = 'none' | 'firefighter' | 'toque' | 'hardhat' | 'pilot' | 'police' | 'cap';

export const OUTFITS: Record<string, Outfit> = {
	civilian: {coat: '#4D7CC7', coatShade: '#3A64A8', pants: '#3C3F58', shoes: '#F4F4F4', hat: 'none'},
	firefighter: {
		coat: '#C9A66B',
		coatShade: '#A8844E',
		pants: '#C9A66B',
		shoes: '#232323',
		hands: '#3A3A3A',
		stripe: '#E6FF3D',
		hat: 'firefighter',
	},
	doctor: {coat: '#FFFFFF', coatShade: '#D5DEE8', pants: '#4FA3D1', shoes: '#F4F4F4', collar: '#4FA3D1', hat: 'none', accessory: 'stethoscope', accessoryColor: '#2D3142'},
	nurse: {coat: '#5FB6C9', coatShade: '#4598AB', pants: '#5FB6C9', shoes: '#FFFFFF', hat: 'none', accessory: 'badge', accessoryColor: '#FFFFFF'},
	chef: {coat: '#FFFFFF', coatShade: '#DCDCDC', pants: '#2B2B2B', shoes: '#2B2B2B', hat: 'toque', accessory: 'neckerchief', accessoryColor: '#E63946'},
	builder: {coat: '#5B7DB1', coatShade: '#46679A', pants: '#3D5A80', shoes: '#6B4226', hands: '#D9A441', stripe: '#E6FF3D', hat: 'hardhat', accessory: 'vest', accessoryColor: '#FF7F11'},
	pilot: {coat: '#1D2D50', coatShade: '#13203D', pants: '#1D2D50', shoes: '#111111', stripe: '#E9C46A', collar: '#FFFFFF', hat: 'pilot', accessory: 'tie', accessoryColor: '#111111'},
	police: {coat: '#22408A', coatShade: '#1A3170', pants: '#1A2A55', shoes: '#111111', collar: '#22408A', hat: 'police', accessory: 'badge', accessoryColor: '#F2C94C'},
};

export const getOutfit = (name: string): Outfit => OUTFITS[name] ?? OUTFITS.civilian;

export const Hat: React.FC<{hat: HatName; color?: string}> = ({hat}) => {
	switch (hat) {
		case 'firefighter':
			return (
				<g>
					{/* long back brim */}
					<path d="M60 200 Q200 150 345 205 Q360 222 330 226 Q200 205 70 222 Q45 218 60 200Z" fill="#9E1B1B" />
					{/* dome */}
					<path d="M85 205 Q85 95 200 90 Q315 95 315 205 Q200 185 85 205Z" fill="#D62828" />
					<path d="M200 92 Q212 150 205 196" stroke="#A91E1E" strokeWidth="10" fill="none" />
					<path d="M115 150 Q140 110 185 100" stroke="#FF6B6B" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.7" />
					{/* front shield */}
					<path d="M165 115 L235 115 L245 175 Q200 200 155 175Z" fill="#FFFFFF" stroke="#1D1A1F" strokeWidth="5" />
					<text x="200" y="168" fontSize="44" fontWeight="900" textAnchor="middle" fill="#D62828" fontFamily="Arial Black, Arial">7</text>
				</g>
			);
		case 'toque':
			return (
				<g>
					<rect x="110" y="150" width="180" height="55" rx="10" fill="#F2F2F2" stroke="#D0D0D0" strokeWidth="4" />
					<circle cx="130" cy="110" r="55" fill="#FFFFFF" />
					<circle cx="200" cy="80" r="65" fill="#FFFFFF" />
					<circle cx="270" cy="110" r="55" fill="#FFFFFF" />
					<rect x="105" y="105" width="190" height="60" fill="#FFFFFF" />
				</g>
			);
		case 'hardhat':
			return (
				<g>
					<path d="M85 200 Q85 100 200 95 Q315 100 315 200Z" fill="#FFC300" />
					<rect x="60" y="190" width="280" height="24" rx="12" fill="#E0A800" />
					<rect x="185" y="97" width="30" height="100" rx="12" fill="#FFD633" />
				</g>
			);
		case 'pilot':
			return (
				<g>
					<path d="M80 180 Q90 95 200 100 Q310 95 320 180Z" fill="#1D2D50" />
					<rect x="85" y="170" width="230" height="30" rx="8" fill="#111111" />
					<path d="M110 205 Q200 240 290 205 L290 195 L110 195Z" fill="#111111" />
					<circle cx="200" cy="140" r="20" fill="#E9C46A" />
				</g>
			);
		case 'police':
			return (
				<g>
					<path d="M80 175 Q80 90 200 92 Q320 90 320 175Z" fill="#1A2A55" />
					<rect x="85" y="165" width="230" height="30" rx="8" fill="#111111" />
					<path d="M110 200 Q200 235 290 200 L290 190 L110 190Z" fill="#111111" />
					<path d="M200 115 L218 140 L200 165 L182 140Z" fill="#F2C94C" />
				</g>
			);
		case 'cap':
			return (
				<g>
					<path d="M80 195 Q80 100 200 98 Q320 100 320 195Z" fill="#E63946" />
					<path d="M80 195 Q30 200 20 220 Q120 225 200 205Z" fill="#B82D38" />
				</g>
			);
		default:
			return null;
	}
};
