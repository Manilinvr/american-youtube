---
name: prof-design
description: Design system and motion toolkit for the "Professor" YouTube Shorts (psychology, reasoning format). Use when making or restyling any p0NN video: choosing a theme, hook, layers, transitions, pacing, and running the quality checks before delivery.
---

# Professor Shorts: design toolkit

Read `docs/professor-style.md` for the full layer reference. This skill is the short decision guide.

## Make every video different (pick one of each)
- **Theme** (`"theme"` in the episode JSON): `yellow` (default), `coral`, `blue`, `mint`, `violet`. One accent per video; ink, paper and graphite stay the same.
- **Hook** (`tools/prof/lib.py`): `hook_number`, `hook_quote`, `hook_versus`, `hook_countdown`, or a plain face + slammed headline. Do not use the same hook twice in a row.
- **Backgrounds**: `paper`, `paper-grid`, `ink`, `ink-grid`, `accent`, `soft`, or a blurred photo (`{"photo": "bg-city"}`).
- **Entrances** (`enter` on a shot): `punch`, `slide-l/r/u`, `wipe-l/r/u`, `iris`, `flash`, `blinds`, `spin`, `split`, `zoom-out`, `drop`, `cut`. Use at least four different ones per video.
- **Scene layers**: `versus` (two sides, winner lights up), `timeline`, `post`, `countdown`, `quote`, `ticker`, `card` (for/against), `stamp` (verdict), `chart`, `bars`, `pairs`, `scale`, `battery`, `tabs`, `clock`, `eyes`, `rocks`, `phone`, `counter`, `dots`, `burst`.
- **Characters**: cut-outs in `public/prof/` (`kfull-*` full body, `kbust-*` big busts, `face-*` reactions). Rotate poses, do not repeat one image for more than ~5 seconds. More poses can be cut from `assets/prof-source/kling-sheet-*.webp` with `tools/prof/assets2.py` (avoid the watermark and garbled-text panels, see the README there).

## Pacing rules
- A new picture every 2-3 s. Check with `python3 tools/prof/cadence.py <id> 4.2`.
- First frame already shows a picture (give first-shot layers `delay=-0.3`).
- No shot starts empty: base layer (face or card) first, text slams on the cue word.
- Cues: first match of a word. Use `word#2` for the second one. `python3 tools/prof/check_cues.py <id>` shows what each cue hits.

## Honesty rules (psychology content)
- Every number comes from a source read in this session. Weak evidence is said out loud in the video ("a link, not proof").
- Invented chart shapes are labelled `ILLUSTRATION, NOT REAL DATA`. Comparisons are labelled `A COMPARISON, NOT SCIENCE`. Advice is labelled `MY ADVICE, NOT A FINDING`.
- No fabricated posts, quotes or screenshots presented as real; examples say `EXAMPLE`.

## Build and check
1. `python3 tools/episodes/pNNN.py` (writes the JSON), register in `src/episodes.ts`, `npx tsc --noEmit`.
2. `python3 tools/tts/voice.py <id>`, then `check_cues.py` and `cadence.py`.
3. `python3 tools/prof/review.py <id> 30` and look at the contact sheets.
4. `npm run make -- <id> --browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell --concurrency=4 --crf=24`.
5. Check loudness (about -16 LUFS) and a few frames of the final MP4, then build the publishing text.

## Sound
Do not embed copyrighted trending songs (Content ID). The owner adds a trending sound from the YouTube Shorts library at upload, quietly (10-15%).
