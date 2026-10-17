#!/usr/bin/env python3
"""Builds the delivery folder out/Professor-5-Shorts/ (videos + ONE text file with titles, descriptions, tags, summaries) and a zip.

    python3 tools/prof/kits2.py
"""
import json
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "out" / "Professor-5-Shorts"
MUSIC = {
    "dreamer.mp3": '"Dreamer" by Kevin MacLeod (incompetech.com)',
    "easy-lemon.mp3": '"Easy Lemon" by Kevin MacLeod (incompetech.com)',
    "thinking-music.mp3": '"Thinking Music" by Kevin MacLeod (incompetech.com)',
    "gymnopedie-no-1.mp3": '"Gymnopedie No 1" by Kevin MacLeod (incompetech.com)',
}
LICENSE = "Licensed under Creative Commons: By Attribution 4.0\nhttp://creativecommons.org/licenses/by/4.0/"
EDU = "This video is educational and is not medical or psychological advice."

KITS = [
    {
        "id": "p007-brain-rot",
        "title": "Is Short-Video 'Brain Rot' Real? (What 71 Studies Found)",
        "alts": ["Do Short Videos Hurt Your Attention?", "Why You Can't Watch a Movie Without Your Phone"],
        "hook": "You sit down to watch a movie. Ten minutes in, you're on your phone. 📱",
        "body": """People call it "brain rot." It's not a medical term, but scientists are studying it. Think of short videos like fast food: quick, tasty, always there (that's a comparison, not science).

A 2025 review (Nguyen et al., Psychological Bulletin) combined 71 studies with almost 100,000 people. The more people used short-form video, the weaker their attention and self-control tended to be. Heavier use also went along with more stress and anxiety.

Important: this is a link, not proof. Short videos might wear down focus, people who already struggle to focus might scroll more, or both. Most of the studies were one-time surveys, so they can't show cause and effect.

A simple trick (not from the study): put your phone in another room for the first 20 minutes of a movie or a work session.""",
        "ask": "What's the first thing you reach for when a movie gets slow? Tell me below.",
        "hashtags": "#brainrot #attention #psychology #shorts",
        "tags": "brain rot, is brain rot real, short form video and attention, does scrolling hurt your attention, attention span, why can't I focus, phone addiction, self control, social media and focus, everyday psychology, psychology explained, psychology facts, animated psychology, how to focus better",
        "pinned": "📱 What's the first thing you reach for when a movie gets slow? Now try it: phone in another room for the first 20 minutes. Report back!",
        "ru": [
            "Что такое «brain rot»: не медицинский термин, так называют привычку залипать в коротких видео и терять способность смотреть что-то долгое.",
            "Сравнение для простоты: короткие видео как фастфуд, быстро, вкусно, всегда под рукой, а от этого «обычная еда» кажется пресной (это сравнение, а не наука).",
            "Исследование: обзор 2025 года объединил 71 работу и почти 100 тысяч человек. Чем больше короткого видео, тем слабее внимание и самоконтроль, а также больше стресса и тревоги.",
            "Оговорка: это связь, а не доказательство причины. Возможно, видео ослабляют фокус, или люди с плохим фокусом больше листают, или и то и другое. Почти все исследования разовые опросы.",
            "Совет (не из исследования): первые 20 минут фильма или работы держать телефон в другой комнате.",
        ],
        "facts": "Nguyen et al. 2025 (Psychological Bulletin): 71 исследование, 98 299 участников; связь с вниманием, самоконтролем, стрессом и тревогой; в основном корреляционные данные.",
    },
    {
        "id": "p008-doomscrolling",
        "title": "Why You Can't Stop Doomscrolling",
        "alts": ["It's 2 a.m. and You're Still Reading Bad News (Here's Why)", "Doomscrolling and Anxiety: What a Study Found"],
        "hook": "It's two in the morning. The news is terrible. And you keep scrolling. 🌙",
        "body": """That has a name: doomscrolling, endlessly scrolling through bad news. Think of slowing down to look at a car crash on the highway: you don't want to look, but you can't help it (a comparison, not science).

In a 2024 survey of about 800 university students in Iran and the United States (Shabahang et al.), more doomscrolling went along with more existential anxiety: worry about big questions like life, death and what it all means. One idea is that a nonstop stream of bad news can make the world look scarier than it really is.

Important: it was a survey, so it shows a link, not a cause. Anxious people might also scroll more.

A simple idea (not from the study): pick a time to check the news, and a time to stop. Then put the phone down.""",
        "ask": "What time do you usually catch yourself scrolling? Tell me below.",
        "hashtags": "#doomscrolling #anxiety #psychology #shorts",
        "tags": "doomscrolling, why do I doomscroll, doomscrolling anxiety, how to stop doomscrolling, bad news and anxiety, existential anxiety, news anxiety, scrolling at night, social media and mental health, everyday psychology, psychology explained, psychology facts, animated psychology",
        "pinned": "🌙 What time do you usually catch yourself scrolling? Pick one 'news time' tomorrow and one 'stop time'. Tell me how it goes.",
        "ru": [
            "Что такое думскроллинг: бесконечное листание плохих новостей. Сравнение: как притормаживать и смотреть на аварию на дороге, не хочешь, а оторваться не можешь (сравнение, а не наука).",
            "Исследование: опрос около 800 студентов (Иран и США), 2024 год. Чем больше думскроллинга, тем больше экзистенциальной тревоги, то есть беспокойства о жизни, смерти и смысле.",
            "Идея авторов: поток плохих новостей может делать мир более страшным, чем он есть.",
            "Оговорка: это опрос, значит связь, а не причина. Тревожные люди могли и сами листать больше.",
            "Совет (не из исследования): назначить время, когда читаешь новости, и время, когда останавливаешься.",
        ],
        "facts": "Shabahang et al. 2024 (Computers in Human Behavior Reports): 620 студентов из Ирана и 180 из США; связь с экзистенциальной тревогой в обеих выборках; связь с мизантропией только в иранской выборке (в ролик не вошла).",
    },
    {
        "id": "p009-ai-loneliness",
        "title": "Can Talking to AI Make You Lonelier?",
        "alts": ["Millions Talk to AI About Their Feelings. Is It Healthy?", "AI Chatbots and Loneliness: What the Research Says"],
        "hook": "Millions of people now talk to AI about their feelings. Is that good for you? 💬",
        "body": """It makes sense: it's always awake, it never judges, and it always answers. In 2025, researchers at MIT Media Lab and OpenAI released two studies on this. In one, almost 1,000 people used a chatbot for four weeks.

In these studies, the worrying pattern (feeling lonelier, relying on the chatbot more, and spending less time with other people) showed up mostly among the heaviest users. The American Psychological Association also covered this topic in its 2026 trends report.

Important: this is a link, not proof. Lonely people may use chatbots more, or the two may feed each other. Think of a sweet drink and a glass of water: one feels great right now, but it can't replace the other (a comparison, not science).

A simple idea (not from the studies): use it to practice what you want to say, then say it to a person. If you often feel very low or alone, a friend or a professional can help in ways a chatbot can't. """,
        "ask": "Do you ever talk to an AI about your day? Tell me below.",
        "hashtags": "#ai #loneliness #psychology #shorts",
        "tags": "AI and loneliness, ChatGPT loneliness, do AI chatbots make you lonely, AI companions, talking to AI about feelings, emotional dependence on AI, MIT OpenAI study, chatbot psychology, loneliness psychology, everyday psychology, psychology explained, psychology facts, animated psychology",
        "pinned": "💬 Do you ever talk to an AI about your day? No judgment, just curious. And have you told a real person about it this week?",
        "ru": [
            "Почему тянет: ИИ всегда «не спит», не осуждает и всегда отвечает.",
            "Исследования: в 2025 году MIT Media Lab и OpenAI выпустили два исследования. В одном почти 1000 человек общались с чат-ботом четыре недели.",
            "Вывод: тревожная картина (больше одиночества, больше привязанности к боту, меньше времени с людьми) проявлялась в основном у самых активных пользователей.",
            "Оговорка: это связь, а не причина. Одинокие могут чаще пользоваться ботом, или одно подпитывает другое.",
            "Сравнение: сладкий напиток и вода. Один приятен сейчас, но не заменяет другое (сравнение, а не наука).",
            "Совет (не из исследований): использовать ИИ, чтобы потренировать, что хочешь сказать, а потом сказать человеку. Если часто очень плохо или одиноко, помогут друг или специалист.",
        ],
        "facts": "OpenAI + MIT Media Lab (март 2025): 4-недельное рандомизированное исследование (≈981 человек, цифры в пересказах прессы слегка расходятся) и анализ реальных чатов; у самых активных пользователей выше одиночество, зависимость и меньше общения; связь корреляционная. APA Monitor, янв.–фев. 2026. Первоисточники советую перечитать перед публикацией.",
    },
    {
        "id": "p010-bedtime-procrastination",
        "title": "Why You Stay Up Late When You're Exhausted",
        "alts": ["Bedtime Procrastination: Why You Won't Go to Sleep", "You Know You Should Sleep. Why Do You Scroll Anyway?"],
        "hook": "You're exhausted. You know you should sleep. And you scroll anyway. 🌙",
        "body": """Researchers call it bedtime procrastination: going to bed later than you planned, when nothing is stopping you. Why? During the day, your time often belongs to other people. At night, it's finally yours. It's like borrowing from a bank: you borrow hours from your sleep to pay yourself some free time, and tomorrow you pay it back with interest (a comparison, not science).

In a 2014 online survey of 177 adults (Kroese et al., Frontiers in Psychology), people with weaker self-control reported more bedtime procrastination. They also reported getting too little sleep, even after the researchers took other factors into account.

Important: it's one small survey. The internet name, "revenge bedtime procrastination," is newer and less studied, so treat all of this as a clue, not a verdict.

A simple idea (not from the study): give yourself free time earlier. Fifteen minutes that are just yours before the evening ends, then set an alarm for bed.""",
        "ask": "What do you do when you 'should' be asleep? Tell me below.",
        "hashtags": "#sleep #procrastination #psychology #shorts",
        "tags": "bedtime procrastination, revenge bedtime procrastination, why do I stay up late, why can't I go to bed, staying up late scrolling, sleep procrastination, sleep psychology, self control and sleep, how to go to bed earlier, everyday psychology, psychology explained, psychology facts, animated psychology",
        "pinned": "🌙 What do you do when you 'should' be asleep? Confess below. Tonight, try 15 minutes of 'yours' before the evening ends.",
        "ru": [
            "Что это: «откладывание сна», когда ложишься позже, чем планировал, хотя ничто не мешает.",
            "Почему: днём время принадлежит другим, а ночью наконец твоё. Сравнение: берёшь в долг часы сна, чтобы заплатить себе свободным временем, а завтра отдаёшь с процентами (сравнение, а не наука).",
            "Исследование: онлайн-опрос 177 взрослых, 2014 год. У людей с более слабым самоконтролем больше откладывания сна, и они сообщали о нехватке сна даже с учётом других факторов.",
            "Оговорка: один небольшой опрос. Интернет-название «revenge» новее и изучено меньше, так что это подсказка, а не вердикт.",
            "Совет (не из исследования): дать себе свободное время раньше (15 минут «только твоих»), а потом поставить будильник на сон.",
        ],
        "facts": "Kroese, De Ridder, Evers, Adriaanse 2014 (Frontiers in Psychology): онлайн-опрос, N=177; слабее самоконтроль, больше откладывания сна; связь с недосыпом сохраняется с поправкой на демографию и самоконтроль.",
    },
    {
        "id": "p011-open-tabs",
        "title": "Why Unfinished Tasks Won't Leave Your Head",
        "alts": ["Why Your Brain Replays Everything You Haven't Done", "The 2-Minute Trick for Unfinished Tasks at Night"],
        "hook": "It's night. You're tired. And your brain replays everything you haven't done yet. 🧠",
        "body": """Think of your brain as a browser: every unfinished thing is another open tab, and the more tabs you keep open, the slower everything runs (a comparison, not science).

In experiments with students (Masicampo & Baumeister, 2011), an unfinished goal kept popping into their thoughts, and they did worse on an unrelated puzzle. But when they wrote a specific plan (what they'd do, when and where), the problem went away. They didn't have to finish anything. Deciding when and where was enough.

Important: these were small lab experiments with students, so take it as a promising idea, not a guarantee. But the trick costs two minutes and a piece of paper.

Try it tonight: write down each open thing, and next to it write one step and when you'll do it.""",
        "ask": "What's your biggest 'open tab' right now? Tell me below.",
        "hashtags": "#productivity #psychology #sleep #shorts",
        "tags": "unfinished tasks, why can't I stop thinking about unfinished tasks, Zeigarnik effect, plan making, how to stop overthinking at night, to do list before bed, intrusive thoughts about tasks, racing thoughts at night, brain dump, everyday psychology, psychology explained, psychology facts, animated psychology, Masicampo Baumeister",
        "pinned": "🧠 What's your biggest 'open tab' right now? Write it here with ONE step and WHEN you'll do it. That's the whole trick.",
        "ru": [
            "Проблема: вечером мозг крутит всё, что ещё не сделано.",
            "Сравнение: мозг как браузер, каждое незавершённое дело как открытая вкладка, и чем их больше, тем медленнее всё работает (сравнение, а не наука).",
            "Исследование: эксперименты со студентами (2011). Незавершённая цель лезла в мысли, и они хуже справлялись с посторонней головоломкой.",
            "Поворот: когда студенты записывали конкретный план (что, когда, где), эффект исчезал. Заканчивать дело не требовалось.",
            "Оговорка: небольшие лабораторные эксперименты со студентами, поэтому это перспективная идея, а не гарантия.",
            "Совет: сегодня вечером записать каждое «открытое» дело, один шаг и когда его сделаешь.",
        ],
        "facts": "Masicampo & Baumeister 2011 (JPSP 101(4), 667-683): незавершённые цели вызывали навязчивые мысли и ухудшали решение посторонней задачи (анаграммы); конкретный план устранял эти эффекты. Старый «эффект Зейгарник» в ролике намеренно не используется (он срабатывает не всегда).",
    },
]


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "videos").mkdir(parents=True)
    parts = []
    index = []
    for n, k in enumerate(KITS, 1):
        ep = json.load(open(ROOT / "episodes" / f"{k['id']}.json"))
        src = ROOT / "out" / f"{k['id']}.mp4"
        name = f"{n:02d}-{k['id'].split('-', 1)[1]}.mp4"
        shutil.copy(src, OUT / "videos" / name)
        music = MUSIC[ep["music"]]
        sources = "\n".join(f"- {s}" for s in ep["sources"])
        desc = f"""{k['hook']}

{k['body'].strip()}

{EDU} {k['ask']}

Sources:
{sources}

Music: {music}
{LICENSE}

{k['hashtags']}"""
        alts = "\n".join(f"  - {a}" for a in k["alts"])
        ru = "\n".join(f"  {i}. {s}" for i, s in enumerate(k["ru"], 1))
        parts.append(
            f"""{'=' * 78}
ВИДЕО {n}: {name}
{'=' * 78}

КРАТКАЯ ВЫЖИМКА (что говорится в видео):
{ru}

ПРОВЕРКА ФАКТОВ:
  {k['facts']}

----- ДЛЯ YOUTUBE -----

НАЗВАНИЕ:
{k['title']}

Запасные названия (для A/B-теста):
{alts}

ОПИСАНИЕ (вставить как есть):
{desc}

ТЕГИ (через запятую, {len(k['tags'])} из 500 знаков):
{k['tags']}

ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ:
{k['pinned']}
"""
        )
        index.append(f"  {n}. {name}  —  {k['title']}")
    head = f"""PROFESSOR: 5 SHORTS — ПАКЕТ ПУБЛИКАЦИИ
{'=' * 78}

Содержимое папки:
  videos/  — 5 роликов (Shorts 1080x1920, субтитры вшиты, около 1 минуты каждый)
  ОПИСАНИЯ.txt — этот файл: выжимка, название, описание, теги, закреплённый комментарий

Ролики:
""" + "\n".join(index) + """

Порядок публикации: 1 → 4 → 2 → 5 → 3 (самые «на слуху» и безопасные по данным идут первыми,
тему про ИИ и одиночество лучше выкладывать позже, когда проверите её первоисточники).

ОБЩИЕ НАСТРОЙКИ ПРИ ЗАГРУЗКЕ:
  - Аудитория: «Нет, это видео не для детей»
  - Категория: «Образование»; язык видео: английский
  - Изменённый или синтетический контент: «Нет» (рисованная анимация, голос не имитирует реального человека; правила YouTube меняются, сверьтесь со справкой)
  - Субтитры отдельно НЕ загружать (они вшиты в видео). Если YouTube создал автоматические: Studio → Субтитры → «Английский (автоматически)» → ⋮ → «Отменить публикацию»
  - Плейлист: «Professor: Everyday Psychology»
  - Время публикации: будни 18:00–21:00 по Нью-Йорку (ET), примерно через день между роликами
  - Музыка Kevin MacLeod (CC-BY 4.0): строка-атрибуция уже есть в каждом описании, не удаляйте её
  - Хэштеги: в описании 4 штуки; первые три YouTube покажет над названием

ПРО ФАКТЫ: все цифры взяты из статей и аннотаций. Везде, где данные слабые (опросы, небольшие
выборки), это сказано в самом видео («это связь, а не доказательство»). Сравнения (фастфуд,
вкладки, сладкий напиток и т. д.) в видео подписаны как «a comparison, not science».
Диаграммы-иллюстрации подписаны «ILLUSTRATION, NOT REAL DATA».

"""
    (OUT / "ОПИСАНИЯ.txt").write_text(head + "\n\n".join(parts) + "\n")
    z = ROOT / "out" / "Professor-5-Shorts.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_STORED) as zf:
        for p in sorted(OUT.rglob("*")):
            if p.is_file():
                zf.write(p, f"Professor-5-Shorts/{p.relative_to(OUT)}")
    print("folder:", OUT, "| zip:", z, round(z.stat().st_size / 1e6, 1), "MB")


if __name__ == "__main__":
    main()
