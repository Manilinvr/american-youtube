# Брендинг канала и единый стиль персонажа

## Мастер-промпт стиля

```text
STYLE (keep identical in every image):
Mixed-media cinematic illustration: a flat 2D hand-drawn cartoon character composited into a photorealistic real-world environment.
ENVIRONMENT: photorealistic, shot like a real photograph on a 35mm lens at eye level or slightly above, natural indoor locations (apartments, offices, kitchens, bedrooms, streets), real materials and textures, soft shallow depth of field, gentle film grain, muted desaturated colour grading with deep warm-brown and charcoal shadows, low-key moody lighting from practical sources (TV screen, laptop, desk lamp, window), realistic soft shadows. Calm, quiet, slightly melancholic atmosphere.
CHARACTER RENDERING: the character's head and hands are a clean flat 2D cartoon drawing with smooth bold black ink outlines of even weight, matte cel shading with one very soft gradient, no texture; clothing, blanket, shoes and props the character touches are photorealistic real fabric and objects that fit the scene; the cartoon parts are lit by the same light source as the room (soft coloured light and a gentle shadow on the side facing away from the light), so the character looks physically present in the photo, sitting or standing with real weight and contact shadows.
COMPOSITION: 16:9, one clear action, the character is the main focus, plenty of negative space, cinematic framing.
```

```text
CHARACTER (copy word for word into every prompt):
The same recurring cartoon man — a calm, friendly psychology professor — in every image.
Head: a large, smooth, slightly rounded-oval cartoon head, about one third bigger than a real human head, flat warm-ivory skin (#F1E6D6) with a very soft shadow on the side away from the light, outlined with a smooth bold black line of even weight; small simple rounded ears.
Hair: short, thick, jet-black hair with a soft side part and a few messy tufts sticking up on top and over the forehead, drawn as one solid black shape with small notches; never long, never grey.
Glasses: large perfectly round glasses with thin black wire frames, slightly bigger than his eyes, sitting low on the face; always worn.
Eyes: relaxed, half-closed eyes behind the glasses — each a short curved black upper eyelid line with a small black pupil just under it, giving a calm, knowing, slightly amused look; thin, short black eyebrows above the frames that tilt to show emotion.
Nose and mouth: no drawn nose or only a tiny curved line; a small closed smile drawn as a short curved black line (opens into a small dark oval only when surprised or talking).
Overall face: clean, minimal, gentle and intelligent; no blush, no wrinkles, no teeth, no realistic features.
Hands: cartoon hands with four fingers, warm-ivory with black outline, same style as the head.
Body and clothes: slim adult man of average height under realistic clothes: a black turtleneck sweater, a charcoal-grey wool blazer, black trousers and black sneakers with white soles (alternative casual outfit when the scene is at home: a dark charcoal knitted crewneck sweater and the same black trousers).
Emotion is shown through the eyebrows, the eyelids, the small mouth and body posture; the glasses and hair never change.
```

```text
Negative: realistic human face, realistic nose with nostrils, eyelashes, long hair, grey hair, beard, glasses missing, square glasses, 3D render, Pixar style, anime, chibi, thick watercolor, sketchy pencil look, extra fingers, distorted hands, text, letters, captions, watermark, logo, bright saturated colours, flat cartoon background, studio backdrop.
```

```text
TEMPLATE:
[STYLE block] + [CHARACTER block] + SCENE: <where he is, what he does, what emotion — one action> + LIGHT: <main light source in the room> + CAMERA: <framing, e.g. medium wide shot from slightly above> + [Negative]
```

### Примеры сцен

**Late night, procrastination**
```text
SCENE: a dark living room at night, he sits on a sofa under a rust-red blanket holding a mug, staring at a TV that shows a cartoon octopus, eyebrows raised, mouth a small open oval. LIGHT: cool blue glow from the TV on the right, everything else in deep shadow. CAMERA: medium wide shot, TV on the right third.
```

**Morning resolve**
```text
SCENE: a small real kitchen in the morning, he stands holding a coffee mug and raising one finger with a determined look, eyebrows lifted, small confident smile. LIGHT: warm sunlight through a window behind him. CAMERA: medium shot, eye level.
```

**Avoiding the email**
```text
SCENE: a cluttered home desk, he sits in front of an open laptop with an email on screen, leaning back slightly, one hand hovering over the trackpad, eyebrows tilted up with worry. LIGHT: laptop glow on his face and a dim desk lamp. CAMERA: over-the-shoulder from the side, shallow depth of field.
```

**Lying awake**
```text
SCENE: a real bedroom at night, he lies in bed with the duvet pulled to his chin, eyes wide open staring at the ceiling, worried eyebrows. LIGHT: thin streetlight through blinds. CAMERA: top-down view from above the bed.
```

```text
TIPS for consistency:
1. Generate one clean reference image first (a medium shot of him standing in a living room, neutral face) and attach it as a character reference to every next generation (Character Reference / Image Reference, strength 0.7–0.85).
2. Never shorten the CHARACTER block — paste it in full every time.
3. Change only SCENE / LIGHT / CAMERA lines.
4. Keep one main light source per image so the cartoon head gets a matching soft shadow.
5. If the head starts to look 3D or realistic, add: "flat 2D cartoon head, bold black outline, cel shading" at the start of the prompt.
```

## Теги к ролику lf001

```text
why do i procrastinate, procrastination psychology, procrastination, why you procrastinate, how to stop procrastinating, procrastination is not laziness, procrastination and emotions, psychology of procrastination, fear of failure, perfectionism, self compassion, self handicapping, avoidance, emotional regulation, motivation, productivity, psychology explained, everyday psychology, human behavior, mental health education
```

## Оформление канала

**Описание канала (About):**
```text
Why do we do the things we do? Short, calm, illustrated videos about everyday psychology — procrastination, overthinking, anxiety, habits, relationships and the quiet patterns behind them. Every episode is built on real research (sources in the description), explained simply, without hype or diagnoses.

New episodes every week. Educational content — not a substitute for professional help.
```

**Аватар (800×800):**
```text
[STYLE block] + [CHARACTER block] + SCENE: extreme close-up portrait of his round head and shoulders, three-quarter view, looking slightly to the side with curious raised eyebrows and a tiny smile, centred in a perfect square. LIGHT: warm soft desk-lamp light from the left, dark warm-brown blurred room behind him. CAMERA: square 1:1 composition, head fills 70% of the frame, simple dark blurred background, readable at very small size. Negative: text, letters, logo.
```

**Баннер (2560×1440, безопасная зона 1546×423):**
```text
[STYLE block] + [CHARACTER block] + SCENE: ultra-wide cinematic shot of a cosy dim apartment at dusk; he sits small on the left side on a windowsill with a mug, looking out at city lights, thoughtful eyebrows; the middle of the frame is calm, empty, softly blurred wall space. LIGHT: blue dusk through the window, one warm lamp inside. CAMERA: 2560x1440, very wide, keep all important elements inside the central 1546x423 area, the centre left empty for the channel name added later. Negative: text, letters, logo.
```

**Заставка в конце видео (end screen, 1920×1080):**
```text
[STYLE block] + [CHARACTER block] + SCENE: he sits on the right side of a dim living room sofa, turned toward the viewer, giving a small friendly wave; the left two-thirds of the frame is a softly blurred dark wall with empty space for two video cards and a subscribe circle. LIGHT: warm lamp from the right. CAMERA: 16:9, medium wide shot. Negative: text, letters, logo.
```

**Значок видео (watermark):** Круг 150×150 px с головой персонажа на прозрачном фоне (можно взять кадр аватара и вырезать голову). Поставить в Studio → Настройка → Брендинг → Значок видео, показывать «В течение всего видео».
