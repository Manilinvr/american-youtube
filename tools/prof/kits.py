#!/usr/bin/env python3
"""Writes publish/p002..p006-*.md (one publishing kit per video) and publish/p002-p006-publish-kit.md (all in one).

    python3 tools/prof/kits.py

The texts are written by hand below (facts checked against the papers, see sources); this script only lays them out.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
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
        "id": "p002-liking-gap",
        "no": "p002",
        "title": "They Liked You More Than You Think (The Liking Gap)",
        "alts": ["Why You Think They Disliked You (You're Probably Wrong)", "After a Conversation, Your Brain Lies to You"],
        "hook": "You had a great conversation. Then, on the walk home, your brain started the review. 💬",
        "body": """Did I talk too much? Was that joke weird? Here's the good news: psychologists tested this, and on average people underestimate how much their conversation partners liked them. Researchers call it the liking gap.

In the 2018 study (Boothby et al.), strangers chatted in the lab and then rated how much they liked their partner and how much they thought their partner liked them. The gap showed up in short and long conversations, and among first-year college students getting to know their dorm mates, where it lasted for months. One suggested reason: while you're busy worrying about how you're coming across, you can miss the other person's friendly signals.

This is about liking and enjoying a conversation, not about romantic attraction.

What helps: when the review starts, remind yourself that they probably liked you more than you think.""",
        "ask": "Which conversation are you still replaying? Tell me in the comments.",
        "hashtags": "#likinggap #psychology #everydaypsychology #shorts",
        "tags": "liking gap, why do I think people dislike me, people like you more than you think, social anxiety tips, overthinking conversations, after conversation anxiety, conversation psychology, everyday psychology, psychology explained, psychology facts, how to stop replaying conversations, small talk, animated psychology",
        "pinned": "💬 Which conversation are you still replaying in your head? Write it here, and I'll tell you the odds they liked you more than you think.",
        "replies": ["Odds are, they liked you more than you think. That's the liking gap. 💬", "Replaying it is your brain's review mode. The research says go a little easier on yourself."],
        "ru": """Вы отлично поговорили, а по дороге домой мозг запускает «разбор полётов». Психологи проверили это: в среднем люди недооценивают, насколько собеседнику понравились они сами. Это называют «liking gap» (разрыв симпатии). В исследовании 2018 года (Boothby и др.) разрыв нашли у незнакомцев в лаборатории, в коротких и длинных разговорах и у первокурсников в общежитии, где он держался месяцами. Одна из гипотез: пока вы заняты мыслями о том, как выглядите, вы не замечаете дружелюбных сигналов собеседника. Это про симпатию к беседе, а не про романтическое влечение.""",
        "cover": "Кадр 0:00 (панель с беседой и сердцем).",
    },
    {
        "id": "p003-being-stared-at",
        "no": "p003",
        "title": "Can You Really Feel Someone Staring at You?",
        "alts": ["The Sixth Sense You Don't Have (Why You Feel Watched)", "Why You Always Feel Like Someone Is Looking at You"],
        "hook": "You're on the train and suddenly you just know: someone is staring at you. 👀",
        "body": """You turn around... and they are! Is it a sixth sense? Scientists have been testing the feeling of being stared at for over a century (an early paper is from 1898), and careful tests have not found a reliable ability to sense unseen staring. A few experiments reported above-chance results, but a careful review suggested people could be learning patterns in the test sequences.

So why does it feel so real? A 2013 study (Mareschal, Calder & Clifford) showed people faces with blurry, hard-to-read eyes and asked where each face was looking. When the eyes were hard to read, people tended to see the gaze as aimed at them. The researchers describe it as an expectation that gaze is directed toward us, and suggest that assuming direct gaze may simply be a safer strategy. A direct gaze can also signal that an interaction, or a threat, is coming.

Caveat: the main experiments in that study used six observers, so it's a small lab study.

Next time you feel watched, remember: your brain is guessing, and it guesses "me".""",
        "ask": "Have you ever turned around and caught someone looking? Tell me below.",
        "hashtags": "#sixthsense #psychology #everydaypsychology #shorts",
        "tags": "feeling of being stared at, can you feel someone staring at you, sixth sense psychology, why do I feel watched, being watched feeling, gaze perception, eye contact psychology, is the sixth sense real, everyday psychology, psychology explained, psychology facts, animated psychology, how the brain works",
        "pinned": "👀 Be honest: have you ever turned around and caught someone staring? Tell me where it happened.",
        "replies": ["It feels real because your brain defaults to 'looking at me' when the eyes are hard to read. 👀", "Good point: some of those times someone really was looking. The study is about the times it's just a guess."],
        "ru": """Вы в поезде и вдруг «знаете», что на вас смотрят. Оборачиваетесь, и правда смотрят. Шестое чувство? Это проверяют больше ста лет (ранняя работа 1898 года), и аккуратные эксперименты не нашли надёжной способности чувствовать невидимый взгляд. В исследовании 2013 года (Mareschal, Calder, Clifford) людям показывали лица с размытыми, трудно читаемыми глазами и просили определить, куда смотрит лицо. Когда глаза трудно прочитать, люди склонны видеть взгляд, направленный на себя. Авторы называют это ожиданием прямого взгляда и предполагают, что так «безопаснее». Оговорка: в основных опытах было всего шесть наблюдателей.""",
        "cover": "Кадр 0:00 (профессор со спины у окна поезда).",
    },
    {
        "id": "p004-negativity-bias",
        "no": "p004",
        "title": "Why One Bad Comment Beats Ten Compliments",
        "alts": ["Why You Only Remember the One Bad Review", "The Negativity Bias: Why Bad Feels Stronger Than Good"],
        "hook": "Ten people loved your work. One person didn't. Guess which one you're still thinking about at midnight. 🌙",
        "body": """An old Russian proverb says a spoonful of tar spoils a barrel of honey. Psychologists call it the negativity bias: bad things tend to weigh more than good things.

A famous 2001 review (Baumeister et al., "Bad is stronger than good") gathered evidence from everyday life, relationships and learning, and concluded that bad events, feedback and impressions generally had more impact than good ones. Bad impressions also form faster and are harder to change.

You can see a version of it in the brain. In a 1998 experiment (Ito et al.), people looked at pictures while their brain waves were recorded. Negative pictures produced a bigger response than positive ones, even when the two sets were matched for how extreme and how arousing they were.

One common explanation is evolutionary: for our ancestors, missing a threat cost more than missing something good. It's an explanation, not a proven cause.

A simple trick (not from a study): when one comment stings, give the good ones equal airtime. Read them again, slowly.""",
        "ask": "What's the one comment you still remember word for word? Tell me below.",
        "hashtags": "#negativitybias #psychology #everydaypsychology #shorts",
        "tags": "negativity bias, why do I focus on negative comments, bad is stronger than good, why bad reviews hurt more, criticism psychology, why do I remember insults, overthinking criticism, how to handle criticism, everyday psychology, psychology explained, psychology facts, animated psychology, Baumeister",
        "pinned": "🌙 What's the one comment you still remember word for word? Now write down one nice comment you got this week. Equal airtime.",
        "replies": ["Your brain isn't being dramatic, it's being careful. You still get to choose what you keep. 🌙", "The trick: reread the good ones slowly. It's not science, it's just fair airtime."],
        "ru": """Старая русская пословица: ложка дёгтя портит бочку мёда. Психологи называют это негативным смещением: плохое весит больше хорошего. Известный обзор 2001 года (Baumeister и др.) собрал данные из повседневной жизни, отношений и обучения: плохие события, обратная связь и впечатления обычно влияют сильнее хороших; плохие впечатления формируются быстрее и труднее меняются. В эксперименте 1998 года (Ito и др.) негативные картинки вызывали больший ответ мозга, чем позитивные, даже при равной выраженности и возбуждающем действии. Распространённое объяснение: для предков пропустить угрозу было дороже, чем пропустить что-то хорошее (это объяснение, а не доказанная причина). Совет «перечитать хорошие отзывы медленно» не из исследования.""",
        "cover": "Кадр 0:00 (ряд точек: десять жёлтых и одна чёрная).",
    },
    {
        "id": "p005-future-self",
        "no": "p005",
        "title": "Why You Treat Future You Like a Stranger",
        "alts": ["Present You Keeps Dumping Work on Future You", "The Psychology of 'I'll Do It Tomorrow'"],
        "hook": "Present you says: \"I'll do it tomorrow.\" Tomorrow you says: \"Who agreed to this?\" 😅",
        "body": """Psychologists have a name for the gap: future self-continuity, how connected you feel to the person you'll become. Some research suggests we make choices for our future selves a lot like choices for other people. These are small lab studies, so treat them as interesting hints, not final answers.

In one experiment (Pronin, Olivola & Kennedy, 2008), students decided how much of a disgusting drink (a murky mix of soy sauce, ketchup and water) they would swallow for science. As described in Pronin's own review, people committed to roughly two tablespoons for right now, but roughly half a cup for a later session, about the same amount they assigned to a stranger. The numbers are approximate. One idea from the researchers: in the present you feel the yuck, later it's just an idea.

A small brain-scan study (Ersner-Hershfield, Wimmer & Knutson, 2009) of 18 students found that a region linked to thinking about yourself was less active when they pictured themselves ten years from now than when they thought about themselves now.

In another line of work (Hershfield et al., 2011), people who saw an aged version of their own face said they would put more money toward retirement.

So make future you real. Picture them tomorrow morning, tired, opening this task. Then do them a favor.""",
        "ask": "What did you leave for future you this week? Tell me below.",
        "hashtags": "#futureself #psychology #everydaypsychology #shorts",
        "tags": "future self, future self continuity, why do I procrastinate, procrastination psychology, I'll do it tomorrow, future you, present bias, why we put things off, self control psychology, everyday psychology, psychology explained, psychology facts, animated psychology, Hal Hershfield",
        "pinned": "😅 What did you leave for future you this week? Confess below. Future you is reading this too.",
        "replies": ["Present you owes future you a favor. Tomorrow morning, tired, opening that task. 😅", "These are small lab studies, so take them as hints. But the 'make future you real' trick is cheap to try."],
        "ru": """У психологов есть термин «future self-continuity»: насколько вы чувствуете связь с тем, кем станете. Некоторые исследования говорят, что решения за «будущего себя» похожи на решения за другого человека (это небольшие лабораторные работы, воспринимайте как подсказки). В эксперименте Pronin и др. (2008) студенты решали, сколько отвратительной смеси (соевый соус, кетчуп, вода) выпить ради науки. По описанию в обзоре самой Pronin: примерно две столовые ложки «прямо сейчас» и примерно полстакана «на потом», столько же, сколько назначали незнакомцу (цифры приблизительные). В небольшом исследовании с МРТ (18 студентов, 2009) область мозга, связанная с мыслями о себе, была менее активна, когда они представляли себя через десять лет. В работе Hershfield и др. (2011) люди, увидевшие состаренную версию своего лица, говорили, что отложат на пенсию больше денег.""",
        "cover": "Кадр 0:00 (улыбающийся профессор на жёлтом круге).",
        "warn": "Цифры про ложки/полстакана взяты из вторичных пересказов обзора Pronin (2008), поэтому в тексте помечены как приблизительные. Корреляция в мозговом исследовании 2009 года хрупкая (пропадает без одного выброса), поэтому в ролике и описании она не упоминается.",
    },
    {
        "id": "p006-uncertainty",
        "no": "p006",
        "title": "Why 'Maybe' Feels Worse Than Bad News",
        "alts": ["Why Waiting for a Reply Is So Stressful", "A Shock Game Shows Why Uncertainty Hurts"],
        "hook": "You sent the text. It says \"read.\" No reply. And your brain starts writing every possible ending. 📱",
        "body": """Scientists wanted to measure that feeling, so they turned it into a game. In a 2016 study (de Berker et al.), 45 volunteers turned over rocks on a screen. Under some rocks there might be a snake, and if there was one they got a mild electric shock to the hand. The researchers changed the odds: sometimes a snake was impossible, sometimes certain, sometimes a coin flip.

The most stressful moments weren't when a shock was certain. They were when it was 50/50. Reported stress, pupil size and sweating (skin conductance) all tracked the uncertainty. One of the researchers said it is much worse not knowing whether a shock is coming than knowing for sure.

Caveat: it was a lab game with electric shocks, not a text message. But it hints at why waiting feels so awful.

So shrink the maybe. Ask the question. Pick a time to check back. And decide what you'll do either way. (These steps are practical suggestions, not findings of the study.)""",
        "ask": "What's your longest 'read' with no reply? Tell me below.",
        "hashtags": "#uncertainty #psychology #everydaypsychology #shorts",
        "tags": "uncertainty stress, why is waiting so stressful, why does not knowing feel worse, left on read anxiety, anxiety about waiting for a reply, uncertainty psychology, de Berker, electric shock experiment, stress and uncertainty, everyday psychology, psychology explained, psychology facts, animated psychology, how to deal with uncertainty",
        "pinned": "📱 What's your longest 'read' with no reply? Tell me below. Bonus: what would you do either way?",
        "replies": ["Maybe is a door your brain keeps open. Try picking a time to check back and deciding what you'll do either way. 📱", "Remember it was a lab game with shocks, so it's a hint about uncertainty in general, not a rule about texts."],
        "ru": """Вы отправили сообщение, оно «прочитано», ответа нет, и мозг начинает писать все возможные концовки. Учёные превратили это чувство в игру. В исследовании 2016 года (de Berker и др.) 45 добровольцев переворачивали на экране камни: под некоторыми мог быть змей, и тогда они получали слабый удар током. Менялись шансы: ноль, сто и «орёл или решка». Самыми стрессовыми были не моменты с гарантированным ударом, а момент 50 на 50. Субъективный стресс, размер зрачков и потоотделение следовали за неопределённостью. Оговорка: это лабораторная игра с ударами тока, а не сообщение, но она намекает, почему ожидание так тяжело. Советы в конце — практические предложения, а не выводы исследования.""",
        "cover": "Кадр 0:00 (телефон со статусом Read на жёлтом круге).",
    },
]


def kit(k: dict) -> str:
    ep = json.load(open(ROOT / "episodes" / f"{k['id']}.json"))
    music = MUSIC[ep["music"]]
    sources = "\n".join(f"- {s}" for s in ep["sources"])
    desc = f"""{k['hook']}

{k['body']}

{EDU} {k['ask']}

Sources:
{sources}

Music: {music}
{LICENSE}

{k['hashtags']}"""
    alts = "\n".join(f"- `{a}`" for a in k["alts"])
    replies = "\n".join(f"```\n{r}\n```" for r in k["replies"])
    warn = f"\n## Что стоит знать о фактах\n\n{k['warn']}\n" if k.get("warn") else ""
    return f"""# {k['no']}: {ep['title']}

Файл: `out/{k['id']}.mp4` (Shorts, 1080×1920). Стиль «Professor». Субтитры вшиты в видео.

## Название

```
{k['title']}
```

Запасные варианты для A/B-теста:
{alts}

## Описание

```
{desc}
```

Первые две строки видны в ленте без раскрытия, поэтому в них хук. Первые три хэштега YouTube покажет над названием.

## Перевод для вас

{k['ru']}
{warn}
## Теги

```
{k['tags']}
```

{len(k['tags'])} символов из 500 допустимых.

## Закреплённый комментарий

```
{k['pinned']}
```

## Ответы на комментарии

{replies}

## Обложка

{k['cover']} Первый кадр ролика уже с картинкой, поэтому подойдёт обычное превью.

## Настройки

- «Для детей»: **нет**. Категория: **Образование**. Язык: **английский**.
- Изменённый или синтетический контент: **нет** (рисованная анимация, синтетический голос, не имитирующий реального человека). Правила меняются, сверьтесь со справкой YouTube.
- Субтитры: **не загружать** (вшиты). Если YouTube создал автоматические: Studio → Субтитры → «Английский (автоматически)» → ⋮ → «Отменить публикацию».
- Плейлист: **Professor: Everyday Psychology**.
- Время: будни 18:00–21:00 по Нью-Йорку (ET).
"""


def main() -> None:
    allk = []
    for k in KITS:
        text = kit(k)
        (ROOT / "publish" / f"{k['id']}.md").write_text(text)
        allk.append(text)
    head = """# Professor: пакет публикации p002–p006

Пять Shorts в стиле «Professor» (рисованный персонаж, моушен-дизайн). У каждого: название, описание с источниками и строкой про музыку, теги, закреплённый комментарий, ответы. Описания можно вставлять в YouTube как есть.

Общие правила: «Для детей» — нет; субтитры не загружать (вшиты); музыка Kevin MacLeod CC-BY 4.0 (строка уже в описаниях); плейлист «Professor: Everyday Psychology»; публикация по будням 18:00–21:00 ET, примерно через день между роликами.

Рекомендуемый порядок: p002 (liking gap) → p004 (один плохой комментарий) → p003 (взгляд в спину) → p006 (maybe) → p005 (будущий я). Самые универсальные хуки идут первыми, самые осторожные по данным (p005, p006) — позже.

---

"""
    (ROOT / "publish" / "p002-p006-publish-kit.md").write_text(head + "\n\n---\n\n".join(allk))
    print("wrote", len(KITS), "kits + combined file")


if __name__ == "__main__":
    main()
