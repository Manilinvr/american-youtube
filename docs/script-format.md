# Формат сценария (`episodes/<id>.json`)

Сценарий — это JSON: что говорит рассказчик и что в этот момент нарисовано. Готовый пример: [`episodes/s001-doorway-forgetter.json`](../episodes/s001-doorway-forgetter.json).
Полный список поз, лиц и предметов виден в Remotion Studio, композиция **`sketch-sheet`**.

```jsonc
{
  "id": "s001-doorway-forgetter",   // = имя файла
  "format": "short",                // short = 9:16 (Shorts), long = 16:9
  "title": "Specimen #001: The Doorway Forgetter",
  "tone": "documentary",            // documentary | deep | funny  (config/tones.json)
  "voice": { "name": "bf_emma" },   // необязательно; голос канала задан в tones.json
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
  "transition": "fade",             // как сцена появляется: fade | black | zoom | cut
  "ambience": "shower",             // фоновый звук сцены из public/sfx/ (шум душа и т.п.)
  "visual": { "type": "situation", ... }
}
```

**Переходы:** `fade` — плавное растворение (по умолчанию), `black` — затемнение через чёрный (для смены места или настроения: перед field note и выводом), `zoom` — старая сцена «наезжает» и растворяется, новая мягко приближается, `cut` — жёсткая склейка. Ролик в конце плавно уходит в чёрный.

**Музыка:** поле `"music": "soft-pad.mp3"` на уровне ролика — тихая подложка (генерируется `tools/music.py`).

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
  "camera": { "zoom": [1, 1.04],                      // медленный дрейф за сцену
              "keys": [                                // движения камеры по ключевым словам
                { "at": "pen", "zoom": 1.5, "focus": [0.5, 0.33] },   // наезд на лицо
                { "at": "perfectly", "zoom": 1, "secs": 0.5 }        // отъезд
              ] },
  "card": { "no": 1, "common": "The Doorway Forgetter", "latin": "Homo oblitus",
            "habitat": "doorways, kitchens", "at": "specimen" },   // карточка вида сверху
  "stamp": { "at": "perfectly" }                                  // печать PERFECTLY HUMAN
}
```

- **Камера:** `focus` — точка, которую камера ставит в центр (доли кадра: `[x, y]`), `zoom` — приближение, `secs` — длительность плавного движения. Камера не показывает пустоту за краями рисунка. Работает во всех типах сцен.
- **Карточка вида (`card`)** приклеивается вверху кадра; с `at` — «шлёпается» на cue со звуком, без `at` — видна с первого кадра. **Печать (`stamp`)** ставится на карточку — это фирменный финал каждого ролика.

- **Позы:** `stand, hips, point, pointSide, think, shrug, facepalm, scratch, wave, sad, cross, phone, cheer, sit, hug-knees, type, walk` (`type` — печатает за столом)
- **Лица:** `neutral, smile, grin, meh, sad, surprised, worried, smug, annoyed, confused, peaceful, sleepy`
- **Эмоции над головой:** `? ! !? ... sweat zzz heart idea anger music`
- **Предметы:** `door, fridge, window, couch, bed, desk, plant, lamp, picture, clock, tv, tree, bench, car, suitcase, calendar, shower, bathtub, phone-big` (у `calendar` и `phone-big` есть `text`)
- `"front": true` у предмета рисует его перед персонажем — например, стол, за которым человек сидит/стоит и печатает
- **Пометки (`notes`):** `circle | arrow | underline | cross | label`, цель: `prop:N`, `person:N`, `head:N`, `all`. `label` — машинописная сноска полевого журнала с пунктирной линией: «fig. 1: the stare». `size` (по умолчанию 1) уменьшает надпись, если она наезжает на персонажа
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
