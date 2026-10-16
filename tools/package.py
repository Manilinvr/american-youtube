#!/usr/bin/env python3
"""Builds the upload package: out/Specimen-You-upload.zip with the videos, subtitles and one text
document (titles, descriptions, hashtags, tags, pinned comments, upload settings).

    python3 tools/package.py s001-doorway-forgetter s002-last-minute-genius s003-shower-philosopher
"""
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "publish"


def code_blocks_by_heading(md: str) -> list[tuple[str, str]]:
    """[(heading, first code block under it)] from a publish/<id>.md file."""
    out = []
    for part in re.split(r"^## ", md, flags=re.M)[1:]:
        heading, _, body = part.partition("\n")
        m = re.search(r"```\n(.*?)\n```", body, flags=re.S)
        extra = re.sub(r"```.*?```", "", body, flags=re.S).strip()
        out.append((heading.strip(), m.group(1).strip() if m else "", extra))
    return out


def main() -> None:
    ids = sys.argv[1:]
    lines = ["SPECIMEN: YOU - UPLOAD KIT", "=" * 60, ""]
    settings = (PUB / "README.md").read_text()
    settings = settings[settings.index("## Настройки при загрузке"):]  # skip the repo-only intro
    rows = []
    for line in settings.splitlines():
        cells = [c.strip() for c in line.strip().strip("|").split("|")] if line.startswith("|") else None
        if cells is None:
            rows.append(line)
        elif set(cells[0]) <= set("-: ") or cells[0] == "Поле":
            continue  # table header / separator
        else:
            rows.append(f"- {cells[0]}: {cells[1]}" + (f" ({cells[2]})" if len(cells) > 2 and cells[2] not in ("", "—") else ""))
    settings = "\n".join(rows)
    settings = re.sub(r"^#+ ", "", settings, flags=re.M)
    settings = re.sub(r"\*\*|`", "", settings)
    lines += ["UPLOAD SETTINGS / НАСТРОЙКИ ЗАГРУЗКИ", "-" * 60, settings.strip(), "", ""]
    for i, eid in enumerate(ids, 1):
        md = (PUB / f"{eid}.md").read_text()
        title = md.splitlines()[0].lstrip("# ").strip()
        lines += ["=" * 60, f"VIDEO {i}: {title}", f"File: {eid}.mp4   Subtitles: {eid}.srt", "=" * 60, ""]
        for heading, block, extra in code_blocks_by_heading(md):
            label = {"Название (до 100 символов)": "TITLE / НАЗВАНИЕ", "Название": "TITLE / НАЗВАНИЕ", "Описание": "DESCRIPTION / ОПИСАНИЕ",
                     "Теги (поле «Теги», через запятую)": "TAGS / ТЕГИ", "Теги": "TAGS / ТЕГИ", "Закреплённый комментарий": "PINNED COMMENT / ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ",
                     "Связанное видео": "RELATED VIDEO / СВЯЗАННОЕ ВИДЕО", "Субтитры": "SUBTITLES / СУБТИТРЫ"}.get(heading, heading.upper())
            lines.append(f"--- {label} ---")
            if block:
                lines.append(block)
            if extra:
                lines.append(re.sub(r"\*\*|`", "", extra))
            lines.append("")
        lines.append("")
    txt = "\n".join(lines).replace("\r", "")
    doc = ROOT / "out" / "Specimen-You-upload-kit.txt"
    doc.write_text(txt, encoding="utf-8-sig")  # BOM so Windows Notepad shows Cyrillic correctly
    zpath = ROOT / "out" / "Specimen-You-upload.zip"
    with zipfile.ZipFile(zpath, "w", compression=zipfile.ZIP_DEFLATED) as z:
        z.write(doc, "Specimen-You-upload-kit.txt")
        for eid in ids:
            z.write(ROOT / "out" / f"{eid}.mp4", f"videos/{eid}.mp4", compress_type=zipfile.ZIP_STORED)
            z.write(PUB / f"{eid}.srt", f"subtitles/{eid}.srt")
    print(doc.relative_to(ROOT), "|", zpath.relative_to(ROOT), f"{zpath.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
