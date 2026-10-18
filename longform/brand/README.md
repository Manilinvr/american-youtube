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
The same recurring cartoon man in every image. His head is a very large, perfectly smooth round ball, slightly wider than tall, colour warm ivory-beige (#EADBC8) with a soft peach shadow on one side, outlined with a smooth bold black line. No hair, no ears, no neck visible, no wrinkles.
Face: two large round eyes placed close together in the upper middle of the head, each a white circle with a thick black outline and a small solid black pupil; thin, curved black eyebrows floating above the eyes (they carry most of the emotion); a small nose drawn as a single curved black line shaped like a hook or a reversed "J" between and slightly below the eyes; a small simple mouth (a short curved line when calm, a small open oval with a dark-red inside when surprised). Face features sit slightly off-centre toward the side he is looking at. No cheeks blush, no teeth unless shouting, no realistic features.
Hands: cartoon hands with four fingers, ivory-beige with black outline, same style as the head.
Body and clothes: an average adult man's body under realistic clothes: a dark charcoal-teal knitted crewneck sweater with a navy t-shirt collar visible underneath, dark trousers, clean white leather sneakers. The head is about one third larger than a real human head would be.
Emotion is shown only through eyebrows, eye direction, the mouth and body posture.
```

```text
Negative: realistic human face, nose with nostrils, ears, hair, eyelashes, 3D render, Pixar style, anime, chibi, thick watercolor, sketchy pencil look, extra fingers, distorted hands, text, letters, captions, watermark, logo, bright saturated colours, flat cartoon background, studio backdrop.
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
