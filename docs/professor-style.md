# Стиль «Professor» (серия `pNNN`)

Текущая концепция канала: **Профессор рассказывает о психологии человека в повседневных ситуациях**. Никаких сравнений людей с животными (это было в «Specimen: You», `sNNN`). Формат: **Shorts 45 с – 2 мин** (`format: "short"`, 1080×1920) и **длинные 8–15 мин** (`format: "long"`, 1920×1080).

Образец: [`episodes/p001-phantom-vibration.json`](../episodes/p001-phantom-vibration.json) (67 с, 11 сцен, 33 смены кадра). Его собирает скрипт [`tools/episodes/p001.py`](../tools/episodes/p001.py): копируйте его для нового ролика.

## Как это работает

Анимации персонажа «кадр за кадром» нет. Профессор — **статичные вырезанные картинки** из листа персонажа, а вся «жизнь» — это моушен-дизайн поверх них: частые смены кадров, наезды камеры, плашки, графики, переходы, звуки. Новый кадр каждые ~2 секунды.

```
лист персонажа (assets/prof-source/sheet-*.webp)
   └─ python3 tools/prof/assets.py  →  public/prof/*.png  (вырез с прозрачным фоном, ×4, «стикер» с белым контуром: <имя>-s.png)
сценарий  tools/episodes/pNNN.py  →  episodes/pNNN-*.json  (сцена = одна фраза озвучки, режется на shots по словам)
   └─ npm run make -- pNNN-...  →  озвучка af_heart → Remotion (src/prof) → out/pNNN-....mp4
```

## Палитра и шрифты (`src/prof/theme.ts`)

Графит (`ink` #121212), бумага (`paper` #EEE9DE), серые, и **один акцент — жёлтый маркер `accent` #FFC51A**. Других цветов нет. Шрифты: **Anton** (заголовки и числа), **Space Grotesk** (плашки), **Caveat Brush** (рукописные пометки, как на листе персонажа).

## Структура сценария

```jsonc
{ "id": "p001-phantom-vibration", "format": "short", "style": "prof", "tone": "prof",
  "music": "thinking-music.mp3", "sources": ["..."],
  "scenes": [{
    "id": "hook", "say": "Your pocket buzzes. ... *nothing*.", "transition": "cut",
    "visual": {"type": "prof", "shots": [ {shot}, {shot, "at": "grab", "enter": "wipe-r"} ]}
  }] }
```

- `tone`: `prof` (быстрый, бодрый) и `prof-soft` (финальная мысль). Голос пока **af_heart** (правило проекта: не менять без запроса владельца).
- `transition` у сцен всегда `cut`. Переход между сценами рисует `ProfTransitions` (жёлтая плашка, вспышка, диафрагма по кругу): по порядку, либо `visual.enter`.
- **Правило**: первый кадр видео уже с картинкой; новый кадр не реже чем раз в 3 с.

### Shot (кадр)

| поле | значение |
|---|---|
| `at` | слово-метка, на котором кадр начинается (у первого кадра сцены не нужно) |
| `enter` | как кадр приходит поверх предыдущего: `punch` (по умолчанию), `slide-l/r/u`, `wipe-l/r/u` (с жёлтой кромкой), `iris`, `flash`, `drop`, `cut` |
| `bg` | `paper`, `paper-grid`, `ink`, `ink-grid`, `accent`, `soft`, `white` или `{photo: "bg-city", blur, bright, dim}` |
| `cam` | `{z:[от,до], x:[..], y:[..], keys:[{at,z,x,y,secs}], punch:[слова], shake:[слова]}` — медленный наезд, наезд по слову, «удар» и тряска |
| `layers` | слои (ниже) |

### Слои

Общие поля: `x`, `y` (центр, доли кадра), `w` (ширина, доля ширины), `at` (слово появления), `out` (слово исчезновения), `enter` (`pop`, `slam`, `up`, `down`, `left`, `right`, `wipe`, `drop`, `spin`, `fade`, `none`), `loop` (`float`, `bob`, `breathe`, `wobble`, `buzz`), `buzz`/`pulse` (список слов, на которых слой трясётся/подпрыгивает), `rot`, `depth` (параллакс: 0.2 — почти не реагирует на камеру), `sfx` (звук при появлении).

| `type` | что рисует |
|---|---|
| `img` | вырез из `public/prof/` (`src: "face-shock"`, `flip`), с белым контуром-стикером |
| `panel` | картинка-панель в рамке с жёсткой тенью, внутри медленно «едет» (`panel-*` из листа B) |
| `text` | заголовок Anton (`\n` — перенос; `mark` — жёлтый маркер под текстом; `stroke`, `shadow`; `font: "hand"` — рукописный) |
| `chip` | плашка: `kind: "tag"` или `"cite"` (источник с иконкой книги) |
| `counter`, `ring`, `dots`, `calendar` | числа, кольцо %, сетка из точек (N людей, доля подсвечена), календарь на 2 недели |
| `graph` | «сигнал» с планкой; участки выше планки жёлтые (`bumps`, `bar:[{at,v}]`) |
| `phone` | векторный телефон (`screens:[{at,s}]`: `off/lock/empty/typing/buzzing`, `buzz:[слова]`) |
| `burst`, `heart`, `waves`, `pulse`, `wave`, `bubble`, `scribble`, `slab`, `bigword` | всплеск, сердце, дуги вибрации, кольца, волна, пузырь, маркерные каракули (`circle/underline/arrow/cross/check/strike`), цветная плита, гигантское слово на фоне |

### Слова-метки (`at`) — частая ошибка

Метка — это **начало слова**, первое совпадение в сцене. `"Is"` сработает на «So **is** your phone» (раньше, чем нужно), `"A"` — на «**a**lways». Чтобы взять второе вхождение: `"Is#2"`; секунды от начала фразы: число `2.38`; смещение: `"phone+0.3"`. Если слой повторяется в нескольких кадрах сцены (график, точки), задайте ему одинаковый **явный** `at`: тогда состояние сохранится на склейке, а не начнётся заново.

`python3 tools/prof/timeline.py <id>` показывает старты сцен; `node tools/stills.mjs <id> <кадры> --scale=0.5 --browser-executable=...` + `python3 tools/prof/sheet.py <id> <кадры>` собирают контрольный лист.

## Графика из листа персонажа

`python3 tools/prof/assets.py [--preview]` режет лист на вырезы. Лица: `face-calm/smile/serious/surprised/thinking/annoyed/laugh/tired/angry/shock/joy/skeptic`; тело: `body-front/side/back/34/coffee/walk/point/book/gesture/pockets`; предметы: `prop-laptop/mug/books/notebook/pen/backpack/cap/headphones`, `brain`; панели: `panel-board/thinking/armchair/laptop/sofa/street/window/lecture/walk`; фоны: `bg-classroom/city/livingroom/window`. Русский текст на доске панели `panel-board` закрашен. **Панели с русскими надписями (`pose`-списки на доске) не использовать**.

Ограничение: лист 1536×1024, лица всего ~70 px. Мы увеличиваем ×4 с резкостью линий, этого хватает для лица на 500 px, но для крупных планов нужны исходники выше. Лучше всего: каждый нужный ракурс/эмоцию сгенерировать отдельной картинкой в 2K и положить в `assets/prof-source/`.

## Проверка перед публикацией

1. Все цифры и исследования проверены поиском (правило 8 в `CLAUDE.md`), источники в `sources` и в описании.
2. Контрольные кадры: ничего не обрезано, плашки не залезают на субтитры (`y` 0.66–0.76), нет слов-меток, сработавших рано.
3. Музыка: Kevin MacLeod, CC-BY 4.0, строка-атрибуция в описании (`public/music/LICENSE.md`).
4. Пакет публикации `publish/pNNN-*.md`.
