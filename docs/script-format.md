# Формат сценария (`episodes/<id>.json`)

Сценарий — это JSON: что говорит рассказчик и что в этот момент нарисовано. Готовый пример: [`episodes/doorway-effect.json`](../episodes/doorway-effect.json).
Полный список поз, лиц и предметов виден в Remotion Studio, композиция **`sketch-sheet`**.

```jsonc
{
  "id": "doorway-effect",           // = имя файла
  "format": "short",                // short = 9:16 (Shorts), long = 16:9
  "title": "Why You Forget Things When You Walk Into a Room",
  "tone": "relatable",              // relatable | deep | funny  (config/tones.json)
  "voice": { "name": "af_heart" },  // необязательно; можно смешивать: "af_heart:70,af_bella:30"
  "music": "calm-piano.mp3",        // необязательно, файл в public/music/
  "sources": ["Radvansky et al., 2011 ..."],
  "scenes": [ ... ]
}
```

## Сцена

```jsonc
{
  "id": "hook",                     // уникальное имя сцены
  "say": "Have you ever walked into a room... and *completely* forgotten why?",
  "tone": "deep",                   // необязательно: прочитать эту фразу другим тоном
  "visual": { "type": "situation", ... }
}
```

Разметка внутри `say`:

- `*слово*` — выделение: красное в субтитрах и в цитатах.
- `[4%|four percent]` — на экране «4%», голос говорит «four percent».
- `...` — пауза (между предложениями — длинная).

### Cue — «момент времени»

Многие поля принимают **cue**: слово, на котором что-то происходит (`"fridge"`, второе вхождение — `"door#2"`), или число секунд от начала фразы (`1.5`).

## Типы сцен

### `situation` — персонажи в обстановке

```jsonc
{
  "type": "situation",
  "setting": "room",                 // room | street | park | rooftop | blank
  "props": [
    { "type": "fridge", "x": 0.74, "open": "fridge" }   // open: true или cue, когда открыть
  ],
  "people": [{
    "x": 0.33,                       // 0 = левый край, 1 = правый
    "pose": "cross", "face": "meh", "gaze": 0.9,
    "look": "hoodie",                // stick (палочка) | hoodie (в тёмной толстовке)
    "walk": { "from": 0.1, "seconds": 1.3 },             // зайти в кадр
    "then": [{ "at": "owes", "pose": "hips", "face": "annoyed" }],
    "emote": "...", "emoteAt": "staring",
    "bubble": { "text": "grab my keys!", "kind": "thought", "at": 0.2 },
    "holding": "phone"               // phone | cup | book
  }],
  "notes": [                         // пометки красной ручкой
    { "kind": "arrow", "target": "prop:0", "at": "money", "label": "owes me $20" }
  ],
  "camera": { "zoom": [1, 1.1], "focus": [0.4, 0.45] }
}
```

- **Позы:** `stand, hips, point, pointSide, think, shrug, facepalm, scratch, wave, sad, cross, phone, cheer, sit, hug-knees, walk`
- **Лица:** `neutral, smile, grin, meh, sad, surprised, worried, smug, annoyed, confused, peaceful, sleepy`
- **Эмоции над головой:** `? ! !? ... sweat zzz heart idea anger music`
- **Предметы:** `door, fridge, window, couch, bed, desk, plant, lamp, picture, clock, tv, tree, bench, car, phone-big` (у `phone-big` есть `text` — уведомление на экране)
- **Пометки (`notes`):** `circle | arrow | underline | cross`, цель: `prop:N`, `person:N`, `head:N`, `all`
- Сидящий персонаж: `"pose": "sit"` и `"y"` — высота сиденья (диван ≈ 70, парапет на `rooftop` = 0).
- Если у соседних сцен одинаковый `setting`, обстановка не перерисовывается заново — склейка выглядит непрерывной. Иначе сцена «рисуется карандашом» за полсекунды.

### `quote` — крупный рукописный текст

```jsonc
{ "type": "quote", "text": "THE DOORWAY EFFECT", "sub": "Radvansky et al., 2011",
  "person": { "pose": "think", "face": "smug" } }
```

Без `text` фраза рассказчика пишется на экране слово за словом (субтитры при этом скрываются) — идеально для финального вывода.

### `split` — сравнение двух панелей

```jsonc
{ "type": "split", "panels": [
  { "label": "EXPECTATION", "setting": "room", "people": [ ... ] },
  { "label": "REALITY", "at": "reality", "setting": "room", "people": [ ... ] }
]}
```

Вторая панель «дорисовывается» на своём cue. Панели принимают всё то же, что `situation`.

## Добавить новое

- **Предмет:** запись в `PROPS` в `src/components/props.tsx`.
- **Поза:** запись в `POSES` в `src/components/Person.tsx` (углы рук/ног в градусах).
- **Тип сцены:** компонент в `src/scenes/` + регистрация в `src/scenes/index.ts`.
- **Звук:** функция в `tools/sfx.py` (звуки синтезируются, никаких лицензий).
