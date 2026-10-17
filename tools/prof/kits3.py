#!/usr/bin/env python3
"""Delivery folder for the five 'reasoning' videos (p012-p016): out/Professor-Reasoning-5/ + zip.   python3 tools/prof/kits3.py"""
import json, shutil, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "out" / "Professor-Reasoning-5"
MUSIC = {
    "dreamer.mp3": '"Dreamer" by Kevin MacLeod (incompetech.com)',
    "easy-lemon.mp3": '"Easy Lemon" by Kevin MacLeod (incompetech.com)',
    "thinking-music.mp3": '"Thinking Music" by Kevin MacLeod (incompetech.com)',
    "gymnopedie-no-1.mp3": '"Gymnopedie No 1" by Kevin MacLeod (incompetech.com)',
}
LIC = "Licensed under Creative Commons: By Attribution 4.0\nhttp://creativecommons.org/licenses/by/4.0/"
EDU = "This video is educational and is not medical or psychological advice."

K = [
 dict(id="p012-willpower-battery", title="Is Willpower Really a Battery? (What 59 Labs Found)",
  alts=["Willpower Doesn't Run Out? The Famous Experiment Failed to Repeat", "Why Scientists Can't Find the Willpower Battery"],
  hook="Everyone says willpower is like a battery that drains by evening. So why can't scientists find the battery? 🔋",
  body="""The idea comes from a famous 1998 experiment: people who had to resist chocolate and eat radishes instead gave up sooner on an impossible puzzle. Hundreds of studies seemed to agree, and a 2010 review found a medium-sized effect.

But big, careful repeats found almost nothing. In 2016, 23 labs with 2,141 people found an effect close to zero. In 2021, 36 labs with 3,531 people again found a tiny effect close to zero. The only hint of an effect in the 2021 study showed up in people who already felt tired (an exploratory result).

My verdict: willpower is probably not a fuel tank that runs dry. But tiredness, boredom and stress still make self-control harder.

What to do (my advice, not a finding): rest first, make good choices easier (pack the gym bag the night before, hide the cookies), and take real breaks.""",
  ask="Do you feel your willpower 'run out' by evening? Tell me below.", tags_h="#willpower #selfcontrol #psychology #shorts",
  tags="willpower, is willpower a battery, ego depletion, ego depletion replication, self control psychology, willpower myth, why do I give in at night, decision fatigue, psychology myths, replication crisis, everyday psychology, psychology explained, animated psychology",
  pinned="🔋 Do you feel your willpower 'run out' by evening? Be honest: is it willpower, or are you just tired?",
  ru=["Вопрос: правда ли воля как батарейка, которая садится к вечеру.","Откуда идея: знаменитый опыт 1998 года (редиска вместо шоколада, потом неразрешимая головоломка).","Сомнение: большие повторные эксперименты не подтвердили. 2016: 23 лаборатории, 2141 человек, эффект около нуля. 2021: 36 лабораторий, 3531 человек, снова около нуля.","Рассуждение: возможно, батарейки нет, а есть усталость. Единственный намёк на эффект в 2021 году был у тех, кто уже устал (необязательный анализ).","Вывод: воля не бензобак, но усталость, скука и стресс реально мешают.","Советы (не из исследований): сначала отдохнуть, облегчить хорошие решения, делать настоящие перерывы."],
  facts="Baumeister et al. 1998; Hagger et al. 2016 (k=23, N=2141, d=0.04); Vohs et al. 2021 (36 лабораторий, N=3531, d=0.06 в подтверждающем анализе). Цифру «≈200 тестов / средний эффект» (метаанализ 2010) взял из вторичных пересказов, в ролике она подана приблизительно."),
 dict(id="p013-venting-anger", title="Does 'Letting It Out' Really Help When You're Angry?",
  alts=["Punching a Pillow Doesn't Calm You Down? What Science Found", "Venting Anger: Steam Valve or Fire?"],
  hook="'Don't bottle it up. Let it out.' It sounds logical. But is anger really like steam in a pot? 🔥",
  body="""The old idea is called catharsis: act out your anger and it drains away. In a 2002 experiment (Bushman), 600 college students wrote an essay and got insulting feedback. Then one group hit a punching bag while thinking about the person who insulted them, one group hit the bag while thinking about getting fit, and one group just sat quietly.

If catharsis were right, the group that vented the most should have calmed down the most. Instead, the group that hit the bag while thinking about the insulter ended up angriest, and was the most aggressive when later given a chance to blast that person with loud noise.

My reading: replaying the insult while venting isn't releasing anything, it's rehearsing. Important caveats: one lab study with students, and talking things through with a supportive friend is a different thing from punching a bag while you stew.

What to do (my advice, not a finding): let your body calm down first, take your mind off it, and talk it through once you're calmer.""",
  ask="What do you do when you're really angry? Tell me below.", tags_h="#anger #psychology #emotions #shorts",
  tags="venting anger, does venting anger work, catharsis, punching bag anger, how to calm down when angry, anger management, rumination, anger psychology, let it out myth, emotional regulation, everyday psychology, psychology explained, animated psychology",
  pinned="🔥 What do you do when you're really angry? Walk? Scream into a pillow? Tell me, and I'll tell you what the research says about it.",
  ru=["Вопрос: правда ли, что злость надо «выпускать», как пар.","Старая идея: катарсис, выплеснул злость и она уходит.","Эксперимент Bushman (2002): 600 студентов, оскорбительная оценка эссе, затем три группы: бить грушу и думать об обидчике; бить грушу и думать о спорте; просто сидеть.","Ожидали: больше всех успокоятся «выпускавшие». Вышло наоборот: самые злые и агрессивные были те, кто бил грушу и думал об обидчике.","Рассуждение: прокручивая обиду, ты не выпускаешь пар, а репетируешь злость, подливаешь масла в огонь.","Оговорка: одно лабораторное исследование на студентах; разговор с поддерживающим другом это другое.","Вывод: «выпусти» верно наполовину: чувствовать можно, подпитывать нельзя. Советы: сначала успокоить тело, отвлечься, потом проговорить."],
  facts="Bushman 2002 (PSPB 28(6), 724-731): 600 студентов; группа «руминация» была злее, чем «отвлечение» и «контроль», и самой агрессивной; контроль (без груши) наименее агрессивен. Разницу между «отвлечением» и «контролем» по злости не утверждаю."),
 dict(id="p014-dunning-kruger", title="Are Incompetent People Really Blind to It? (The Dunning-Kruger Myth)",
  alts=["The Dunning-Kruger Effect Might Be Mostly Statistics", "Why the Dunning-Kruger Meme Isn't the Whole Story"],
  hook="'The less you know, the more confident you are.' Everyone's heard it. So why do scientists still argue about it? 🧠",
  body="""In 1999, Kruger and Dunning tested students on humor, grammar and logic and asked them to guess how they did. People in the bottom quarter scored around the 12th percentile but guessed around the 62nd.

But there's another way to get that picture. If everyone guesses their own rank badly, and most people feel above average, then the lowest scorers can only guess too high, and the top scorers can only guess too low. In 2020, researchers re-analyzed such data and concluded the effect is mostly a statistical artifact. A 2023 replication reported a small but statistically significant effect remains.

My verdict: overconfidence is real and everyone has it. The dramatic version, that unskilled people are blind to their own gaps, is probably exaggerated.

What to do (my advice, not a finding): don't use the label as an insult. Ask 'how would I know I'm wrong?' and check your guess against a test, a number, or an honest friend.""",
  ask="When were you sure you'd nailed something... and hadn't? Tell me below.", tags_h="#dunningkruger #psychology #cognitivebias #shorts",
  tags="Dunning-Kruger effect, Dunning Kruger myth, is Dunning Kruger real, overconfidence, cognitive bias, unskilled and unaware, metacognition, statistical artifact, regression to the mean, psychology myths, everyday psychology, psychology explained, animated psychology",
  pinned="🧠 When were you completely sure you'd nailed something... and hadn't? Write it here. (Everyone has one.)",
  ru=["Вопрос: правда ли «чем меньше знаешь, тем увереннее».","Оригинал 1999: тесты на юмор, грамматику, логику; нижняя четверть набрала около 12-го перцентиля, а оценила себя около 62-го.","Рассуждение: если все плохо угадывают свой ранг и большинство считает себя выше среднего, то у самых слабых ошибка может быть только вверх, а у самых сильных только вниз. Получается знаменитая картинка и без «слепоты».","Наука: 2020 год: эффект «в основном статистический артефакт»; 2023: небольшой реальный эффект, возможно, остаётся.","Вывод: переоценка себя реальна и общая, а драматичная версия («некомпетентные слепы») преувеличена.","Советы: не использовать как оскорбление; спрашивать «как я пойму, что неправ?»; проверять догадку тестом, числом или честным другом."],
  facts="Kruger & Dunning 1999 (12-й и 62-й перцентиль); Gignac & Zajenkowski 2020 (Intelligence 80); Dunkel, Nedelec & van der Linden 2023 (Intelligence 96, 101717): значимый, но минимальный эффект. Диаграммы в ролике подписаны как иллюстрация идеи."),
 dict(id="p015-money-happiness", title="Does Money Buy Happiness? Two Scientists Disagreed, Then Worked It Out",
  alts=["Money and Happiness: The Plot Twist", "Does Happiness Stop Rising After a Certain Income?"],
  hook="'Money can't buy happiness.' One famous study said more money stops helping at some point. Another said the opposite. Then the two scientists teamed up. 💰",
  body="""A 2010 study (Kahneman & Deaton) found that day-to-day happiness flattened out at around $75,000 a year. A 2021 study (Killingsworth) pinged more than 33,000 workers on their phones, 1.7 million times in all, and found happiness kept rising with income, with no plateau.

In 2023, Killingsworth, Kahneman and a third scientist re-checked the data by how happy people were to begin with. For most people, happiness kept rising with income. For the least happy group (about 1 in 5), it rose and then flattened. So both studies were right, about different people.

Warnings: these are links, not proof that money causes happiness, and scientists still dispute exactly where the flattening point is, so no magic number.

My verdict: money helps most people, but it's not a cure for unhappiness that comes from somewhere else.""",
  ask="What would actually make your days better: more money, or something else? Tell me below.", tags_h="#money #happiness #psychology #shorts",
  tags="does money buy happiness, money and happiness, income and happiness, Kahneman, Killingsworth, happiness plateau, 75000 happiness, experienced well-being, adversarial collaboration, happiness research, everyday psychology, psychology explained, psychology facts, animated psychology",
  pinned="💰 What would actually make your days better: more money, or something money can't buy? Tell me below.",
  ru=["Вопрос: правда ли, что деньги не покупают счастье и после какой-то суммы перестают помогать.","Исследование 2010 (Канеман и Дитон): счастье «по ощущениям в течение дня» растёт с доходом и выравнивается около $75 тысяч в год.","Исследование 2021 (Киллингсворт): 33 тысячи работников, 1,7 млн опросов в случайные моменты на телефоне; плато нет.","Рассуждение: два качественных исследования, разные ответы, значит, возможно, речь о разных людях.","2023: совместная работа: у большинства счастье растёт с доходом, а у наименее счастливых (около 1 из 5) растёт и выравнивается. Правы оба.","Оговорки: связь, а не причина; точка выравнивания спорная, поэтому магической цифры в ролике нет.","Вывод: деньги помогают большинству, но не лечат несчастье с другим источником."],
  facts="Kahneman & Deaton 2010; Killingsworth 2021 (PNAS 118(4): 33 391 участник, 1 725 994 отчёта; рост с логарифмом дохода, нет излома); Killingsworth, Kahneman & Mellers 2023 (PNAS 120(10): плато только у наименее счастливых ≈20%). Порог ≈$100 тысяч спорный (критика 2024), в ролике не называется. $40K→$80K→$160K помечено как EXAMPLE."),
 dict(id="p016-positive-thinking", title="Does Positive Thinking Actually Work? (It Can Backfire)",
  alts=["Positive Affirmations Can Backfire. Here's When", "Why Daydreaming About Success Might Hurt Your Chances"],
  hook="'Think positive and good things happen.' It sounds so reasonable. But what if, for some people, it backfires? ✨",
  body="""In a 2009 study (Wood, Perunovic & Lee), people repeated 'I'm a lovable person.' Those with high self-esteem got a modest boost. But people with low self-esteem, the ones the advice is meant for, felt worse than those who didn't repeat it. One reason it could happen: if you don't believe the sentence, your mind argues back.

Then there's picturing success. In 2002, Oettingen and Mayer followed four groups (job seekers, students with a crush, students facing an exam, and hip-replacement patients). People who expected good results tended to put in more effort and do better. People who fantasized the most about success tended to put in less effort and do worse. The authors propose that vividly picturing success may make part of your mind feel as if you've already arrived (a proposal, not a proven mechanism).

My verdict: it depends on the kind. Believing you can, for real reasons, helps. Repeating sentences you don't believe can backfire, and daydreaming without a plan may drain your drive.

What to do (my advice, not a finding): use believable words ('I'm learning'), picture the obstacle too, and make a small plan (what, when, where).""",
  ask="Do affirmations work for you, or do they make you roll your eyes? Tell me below.", tags_h="#positivethinking #affirmations #psychology #shorts",
  tags="does positive thinking work, positive affirmations backfire, affirmations psychology, positive self-talk, low self-esteem affirmations, positive fantasies, Oettingen, expectations vs fantasies, motivation psychology, think positive myth, everyday psychology, psychology explained, animated psychology",
  pinned="✨ Do affirmations work for you, or do they make you roll your eyes? Be honest. Both answers are interesting.",
  ru=["Вопрос: работает ли «думай позитивно».","Эксперимент 2009 (Wood и др.): повторять «я достойный любви человек». У людей с высокой самооценкой небольшой плюс; у людей с низкой настроение стало хуже, чем у тех, кто фразу не повторял.","Рассуждение: если не веришь фразе, мозг спорит с ней, и позитивное предложение приглашает все негативные мысли.","Исследование 2002 (Oettingen & Mayer): четыре группы (ищущие работу, влюблённые студенты, экзамен, операция на бедре). Кто ожидал успех, прилагал больше усилий и добивался больше; кто много фантазировал об успехе, прилагал меньше усилий и добивался меньше.","Гипотеза авторов: яркая картинка успеха создаёт ощущение, что ты уже «приехал» (это предположение, не доказанный механизм).","Вывод: зависит от вида. Вера в себя по реальным причинам помогает; фразы, в которые не веришь, могут навредить; мечтания без плана могут снижать усилия.","Советы: правдоподобные слова («я учусь»), представлять и препятствие, составить маленький план: что, когда, где."],
  facts="Wood, Perunovic & Lee 2009 (Psych Science 20(7)); Oettingen & Mayer 2002 (JPSP 83(5)): ожидания → больше усилий, фантазии → меньше. Сравнение «ментального контрастирования» (позднее) не использовано как факт, а совет «представь препятствие» помечен как мой."),
]

def main():
    if OUT.exists(): shutil.rmtree(OUT)
    (OUT / "videos").mkdir(parents=True)
    parts, idx = [], []
    for n, k in enumerate(K, 1):
        ep = json.load(open(ROOT / "episodes" / f"{k['id']}.json"))
        name = f"{n:02d}-{k['id'].split('-',1)[1]}.mp4"
        shutil.copy(ROOT / "out" / f"{k['id']}.mp4", OUT / "videos" / name)
        src = "\n".join(f"- {s}" for s in ep["sources"])
        desc = f"""{k['hook']}

{k['body'].strip()}

{EDU} {k['ask']}

Sources:
{src}

Music: {MUSIC[ep['music']]}
{LIC}

{k['tags_h']}"""
        ru = "\n".join(f"  {i}. {s}" for i, s in enumerate(k["ru"], 1))
        alts = "\n".join(f"  - {a}" for a in k["alts"])
        parts.append(f"""{'='*78}
ВИДЕО {n}: {name}
{'='*78}

КРАТКАЯ ВЫЖИМКА (ход рассуждения в видео):
{ru}

ПРОВЕРКА ФАКТОВ:
  {k['facts']}

----- ДЛЯ YOUTUBE -----

НАЗВАНИЕ:
{k['title']}

Запасные названия (A/B-тест):
{alts}

ОПИСАНИЕ (вставить как есть):
{desc}

ТЕГИ ({len(k['tags'])} из 500 знаков):
{k['tags']}

ЗАКРЕПЛЁННЫЙ КОММЕНТАРИЙ:
{k['pinned']}
""")
        idx.append(f"  {n}. {name}  —  {k['title']}")
    head = f"""PROFESSOR: 5 РОЛИКОВ-РАССУЖДЕНИЙ — ПАКЕТ ПУБЛИКАЦИИ
{'='*78}

Папка: videos/ (5 роликов, Shorts 1080x1920, 1,5–2,5 минуты, субтитры вшиты) + этот файл.

Ролики:
""" + "\n".join(idx) + """

Формат каждого: вопрос-хук → «все так думают» → что нашли «за» → что нашли «против» →
рассуждение вслух → ВЕРДИКТ (печать) → советы → итог.

ЗВУК (важно прочитать):
  В видео уже есть тихая подложка без авторских прав (Kevin MacLeod, CC-BY 4.0) и озвучка.
  Популярные «трендовые» песни я встроить не могу: на них авторские права, и YouTube
  заблокирует монетизацию или удалит звук (Content ID). Что делать:
  1. При загрузке Shorts в приложении YouTube: «Добавить звук» → вкладка «Тренды / Популярные».
     Звуки из библиотеки YouTube лицензированы для Shorts. Ставьте её ТИХО (10–15%),
     озвучка должна оставаться главной. Тренды меняются каждую неделю, смотреть нужно в день публикации.
  2. Если добавляете звук из библиотеки, оставьте строку про музыку Kevin MacLeod в описании только если
     подложка из видео не заменена. Если убрали подложку, строку можно удалить.
  3. Для длинного видео (не Shorts) используйте YouTube Audio Library (бесплатно и безопасно по правам).

ОБЩИЕ НАСТРОЙКИ: «Для детей» — нет; категория «Образование»; язык английский; субтитры отдельно
не загружать; плейлист «Professor: Everyday Psychology»; публикация по будням 18:00–21:00 ET.
Порядок: 1 (воля) → 3 (Даннинг-Крюгер) → 4 (деньги) → 2 (злость) → 5 (позитивное мышление).

ПРО ФАКТЫ: цифры взяты из аннотаций и статей. Слабые места названы в самих роликах. Все диаграммы с
формой кривых подписаны «ILLUSTRATION, NOT REAL DATA» / «ILLUSTRATION OF THE SHAPE».

"""
    (OUT / "ОПИСАНИЯ.txt").write_text(head + "\n\n".join(parts) + "\n")
    z = ROOT / "out" / "Professor-Reasoning-5.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_STORED) as zf:
        for p in sorted(OUT.rglob("*")):
            if p.is_file(): zf.write(p, f"Professor-Reasoning-5/{p.relative_to(OUT)}")
    print("zip", z, round(z.stat().st_size/1e6, 1), "MB")

if __name__ == "__main__":
    main()
