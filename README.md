# Everyday Psychology — скетч-мультики для американского YouTube

Короткие (Shorts, 15–30 с) и длинные (7–15 мин) мультики в стиле **карандашного скетча** о ситуациях, в которые попадал каждый, — с психологией повседневности, мудрым выводом и юмором. Язык роликов — английский, аудитория — США.

Весь конвейер бесплатный и работает локально:

```
сценарий (JSON)  →  ИИ-озвучка Kokoro  →  анимация Remotion  →  MP4 (1080×1920 или 1920×1080, −14 LUFS)
```

Первый готовый ролик — [`episodes/doorway-effect.json`](episodes/doorway-effect.json): *"Have you ever walked into a room... and completely forgotten why?"*

## Документы

- [Концепция канала, структура роликов, хуки, риски монетизации](docs/concept.md)
- [Бесплатная озвучка: что выбрано и почему](docs/voice.md)
- [40 готовых идей с источниками](docs/ideas.md)
- [Формат сценария: сцены, позы, эмоции, предметы](docs/script-format.md)

## Установка (один раз)

Нужны **Node.js 18+**, **Python 3.10+** и ~1 ГБ места.

```bash
npm install
python3 -m venv .venv
.venv/bin/pip install -r tools/tts/requirements.txt      # Windows: .venv\Scripts\pip ...
```

Модель озвучки (~350 МБ) скачается сама при первом запуске.

## Сделать ролик

```bash
npm run make -- doorway-effect
```

Готовый файл: `out/doorway-effect.mp4`. Команда сама озвучит сценарий (с кэшем), отрендерит видео и выровняет громкость под YouTube.

Посмотреть и подправить анимацию в браузере, с перемоткой по кадрам:

```bash
.venv/bin/python tools/tts/voice.py doorway-effect   # озвучка (если ещё не делали)
npm run studio
```

## Новый ролик с помощью Claude

Напишите Claude, например: *«Сделай шортс про то, почему мы слышим вибрацию телефона, которой не было»* — он напишет сценарий по правилам из [`CLAUDE.md`](CLAUDE.md), зарегистрирует его, соберёт видео и пришлёт MP4. Идеи берите из [docs/ideas.md](docs/ideas.md) или из своей жизни — это и делает канал живым.

Вручную: скопируйте `episodes/doorway-effect.json` под новым именем, поменяйте `id`, текст и сцены, добавьте файл в `src/episodes.ts` и запустите `npm run make -- <id>`.

## Структура

```
episodes/              сценарии роликов (JSON)
config/tones.json      тоны озвучки: relatable / deep / funny
tools/tts/voice.py     озвучка Kokoro → public/voice/<id>/ (wav + тайминги слов)
tools/sfx.py           синтез звуковых эффектов (поп, карандаш, шелест страницы...)
tools/make.mjs         озвучка → рендер → нормализация громкости
src/components/        скетч-движок: человечки, предметы, фоны, эмоции, субтитры
src/scenes/            типы сцен: situation, quote, split
public/fonts/          рукописные шрифты (лицензии OFL/Apache — можно монетизировать)
```

## Лицензии того, что попадает в видео

| Что | Лицензия |
|---|---|
| Голос Kokoro-82M | Apache 2.0 — коммерческое использование разрешено |
| Шрифты Kalam, Permanent Marker | SIL OFL 1.1 / Apache 2.0 |
| Звуковые эффекты | синтезируются кодом в `tools/sfx.py` |
| Remotion | бесплатно для физических лиц и компаний до 3 человек ([условия](https://www.remotion.dev/license)) |
| Графика | рисуется кодом этого репозитория |
