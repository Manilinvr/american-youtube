# Единый стиль канала Professor Lamalma — ОБЯЗАТЕЛЕН для всех роликов

Утверждён владельцем 18.10.2026. Все картинки для всех видео (кадры сцен, обложки, промо, оформление) генерируются **только** в этом стиле и **только** с этим героем. Старая карточка стиля `longform/lf001-procrastination/04-style.md` (белый фон, бирюзовый человечек) — устарела, для новых роликов не использовать.

## Эталоны стиля (прикладывать как Style Reference)
- `style-refs/ref-thumbnail-desk-night.png` — ночь, рабочий стол, свет ноутбука и лампы (главный эталон стиля)
- `style-refs/ref-sofa-livingroom.png` — гостиная, торшер, диван
- `style-refs/ref-portrait-study.png` — портрет в тёмном кабинете с книгами

## Эталоны героя (прикладывать как Character Reference, сила 0.75–0.85)
- `hero/hero-main.png`, `hero/hero-turnaround.png`, `hero/hero-expressions.png`, `hero/hero-poses.png` — описание в `hero/HERO.md`

## Как собирать КАЖДЫЙ промпт
[STYLE] + THE CHARACTER: [HERO] + SCENE: <локация, действие с предметом, эмоция> + [SCENE DRESSING] + LIGHT: <практический источник света> + CAMERA: <план, ракурс> + COMPOSITION: <где место под текст, если нужно> + [Negative]

Блоки STYLE, HERO, SCENE DRESSING и Negative копируются дословно, меняются только SCENE / LIGHT / CAMERA / COMPOSITION. Библиотека локаций и предметов — `SCENE-RULES.txt`.

### [STYLE]
```text
Mixed-media cinematic illustration in the "Professor Lamalma" house style: a flat 2D cartoon character (bold smooth black outlines, flat colours, simple two-tone cel shading) placed inside a moody, realistic, painterly real-world environment that looks like a cinematic film still. The environment has real materials and believable depth — real furniture, books, lamps, windows, city lights — rendered with soft painterly realism, shallow depth of field and gentle film grain. Low-key lighting from practical sources only (desk lamp, floor lamp, laptop or TV glow, window, streetlight): deep warm-brown and near-black shadows, one or two pools of warm amber light, cool blue screen or night-window light as the contrast colour. Muted, desaturated palette: espresso brown, charcoal, warm amber (#E0B25A), cool night blue, skin peach; no bright saturated colours. The cartoon character is lit by the same light sources (warm highlight on the lamp side, soft shadow on the far side, blue screen glow on the face when relevant) and casts a soft contact shadow, so he feels physically present in the room. Small symbolic doodles (thought cloud, motion lines, question mark, sparkle) may float near him, drawn as thin off-white chalk-like hand-drawn lines, used sparingly and only when they express his feeling. Calm, quiet, slightly melancholic, intelligent atmosphere.
```

### [HERO]
```text
A friendly cartoon psychology professor drawn in a clean flat 2D animation style: bold smooth black outlines of even weight, flat colours with simple two-tone cel shading (one soft shadow tone), no textures, no gradients, no 3D. Large slightly wide rounded head with a soft broad jaw, about one third of his total height, warm peach skin (#F2D3B3) with a darker peach shadow on one side, small rounded ears. Short jet-black hair swept up and back into a flat-top shape, with a few small spiky tufts at the back of the crown. Large perfectly round glasses with thin dark frames, always on. White eyes with small dark pupils and heavy half-closed upper eyelids — a relaxed, knowing, slightly amused look; thin arched black eyebrows. Nose as a single curved hook line between the eyes. Small lopsided friendly smile. Four-finger cartoon hands, peach skin. Black turtleneck sweater, charcoal-grey blazer with notched lapels and two flap pockets, slim black trousers, black sneakers with white soles and white laces.
```

### [SCENE DRESSING]
```text
SCENE DRESSING: three layers — FOREGROUND: one or two real objects near the camera, softly out of focus (mug, stack of books, plant leaf, chair back); MIDGROUND: the professor and the one main prop he physically interacts with, sharp and clearly readable; BACKGROUND: 4–7 believable decor objects that fit the location and topic (bookshelves, lamp, window with city lights, framed pictures without readable content, calendar without numbers, plants, coat on a hook), dim and slightly blurred. Every object has a reason to be there, organised composition, no random clutter, no readable text anywhere.
```

### [Negative]
```text
Negative: bright daylight flat lighting, saturated colours, plain studio background, empty room, white background (except for character sheets), realistic human face, 3D render, Pixar style, anime, chibi, watercolor, sketchy pencil look, extra fingers, distorted hands, missing glasses, different hairstyle, different outfit, text, letters, numbers, captions, logo, watermark.
```

## Правила
1. Один герой во всех роликах — Профессор. Другие люди — второстепенные, в том же 2D-стиле, и никогда не похожи на него.
2. Свет всегда «вечерний/кинематографичный»: тёплые лампы + холодный свет экрана или окна. Дневные сцены — тоже приглушённые (утро через окно, без пересвета).
3. Локации меняются каждые 2–3 кадра; в каждом кадре он что-то делает с главным предметом.
4. Символы-эмоции (тучка, линии движения, вопрос) — тонкие светлые «меловые» линии, не больше одного на кадр.
5. Никаких надписей в генерации: все тексты, цифры, ссылки — в монтаже.
6. Обложки: тот же стиль, тёмный фон, крупный текст сбоку (образец — `style-refs/ref-thumbnail-desk-night.png`: белый жирный шрифт + одно слово охрой/оранжевым).
