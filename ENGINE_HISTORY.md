# Mad Minute Engine — Revision History

A breadcrumb trail from the first Mad Minute to today: what each stage added, which apps got it, and where to look in the code.

Newest stage is at the bottom. Commit hashes link a stage to the exact change in Git (`git show <hash>`).

---

## How to read the code

Every app (`/`, `/biology/`, `/music/`, `/dev/`) is one self-contained `index.html`. Inside, the engine is split by comment headers. Search for these to jump to a part:

| Header in the code | What it does |
|---|---|
| `levels & ranks` | Rank names and level names (filled in from the subject) |
| `built-in subjects` | The question banks. Each row: `[topic, level, question, [right, wrong, wrong, wrong], explanation]` |
| `storage` | Saving and loading progress on the device |
| `model helpers` | Levels, rank, unlock rules, recommended topic |
| `quiz engine` | Placement test, timed rounds, review, scoring, level-ups |
| `results + learning animation` | The results screen |
| `subject packs` | Switching subjects; each keeps its own progress |
| `spaced review` | Brings right answers back on a schedule so they stick |
| `crew overview` | Manager view (coaching, not scoring) |
| `coach` | Six study methods that ask Claude (only when opened inside Claude) |
| `Smart jump` | Add-on: suggests a harder subject when you're fast and right |
| `shared/mm-learn.js` | Shared add-on loaded by every app: Recall first, Skills checkup, Roadmap |
| `Standalone demo layer` | Makes the page work anywhere, offline, without a Claude account |

---

## Stage 0 — The original Mad Minute (Claude artifact, before GitHub)

*Order of the features in Stages 0–1 is approximate; they were built in Claude before the project moved to GitHub.*

- One-minute timed quiz for electrical trade knowledge: Ohm's/Watt's Law, PPE & Arc Flash, Lockout/Tagout, Switchgear, Transformers, Grounding & Bonding.
- Questions you can add yourself (the ＋ button → Question bank).
- Still kept separate and unchanged, as requested.

## Stage 1 — The engine takes shape (Claude artifact, before GitHub)

The quiz became a reusable engine that any subject can plug into.

- **Four levels per topic and five ranks per subject** (e.g. Trainee → Master Tech).
- **Placement test**: adaptive, two questions per level, every answer must be right to test out of a level. "Not sure" instead of guessing.
- **Progress timeline**: every placement, level-up and rank-up is logged.
- **Subject packs**: one engine, many subjects, each with its own rank, levels, misses and timeline.
- **Build a new subject / Grow this subject**: Claude writes a full course or adds questions (needs Claude).
- **Coach**: six study methods — Explain it back (Feynman), Test me, Study sheet, Learning ladder, Best resources, 20-hour plan (needs Claude).
- **Crew overview**: manager view of practice minutes, days and repeat misses, for coaching rather than scoring. Sample crew for previews.
- **Daily goal, XP, streaks, combo points**, timed vs study mode, per-question timer that scales with question length.
- **Spaced review**: right answers return after growing gaps (Leitner boxes); misses come back first.
- **Flag a bad question**, theme switch (System / Light / Dark), skill map, sound.
- **Cloud save** to the person's Claude account when opened inside Claude.
- **Control illustrations**: original drawings for the DJ (Booth Ready) content.

## Stage 2 — Mad Minute Auto goes public · 2026-10-06 · `7d2e4e0`

- Moved to GitHub; served free by GitHub Pages at `manafest01.github.io/MadMinute/`.
- **Standalone demo layer**: works with no Claude account, hides Claude-only features, runs the manager view on sample data.
- **Installable and offline (PWA)**: manifest + home-screen icon + service worker (`sw.js`) that caches the app after the first visit.
- Automotive, 12 V, CAN bus and high-voltage content. **DEMO watermark** for showing at work (`f7e39c4`, `ccb86aa` tuned its opacity).

## Stage 3 — Second app on the same engine · 2026-10-08 · `01eb23a`

- **Mad Minute Biology** at `/biology/`: 637 questions, 12 topics.
- Each app gets **its own folder, icon, offline cache and saved progress**, so apps never touch each other's data.

## Stage 4 — Content quality pass · 2026-10-11 · `d388e07`, `157429f`

- Auto restructured into 4 subjects × 600 validated questions; High Voltage became its own subject.
- Fixed inaccurate questions, removed duplicates, **balanced answer lengths** (the longest answer shouldn't give it away).
- Replaced 195 weak "joke" wrong answers with believable ones.
- Habit started here: **bump the service worker version** with every content change so installed phones update.
- (`438ba60` / `48ee6b2`: ManaFlow briefly lived here, then moved to its own repo.)

## Stage 5 — Learning paths · 2026-10-15 · `5e69d34`, `664e5ff`

- **Shop Path card**: one easy-to-hard route across all subjects; tap a step to jump there. (The code calls it `SHOP_PATH`; every app with a path reuses it.)
- Basic Maintenance subject; Automotive topics reordered easy to hard.
- **Free choice vs Guided**: topics open by default with a "Suggested next" badge; Guided keeps the one-at-a-time unlocks. Placement tests every topic in free mode.

## Stage 6 — Smart jump · 2026-10-15 · `d8616a2`

- First **add-on layer**: its own `<script>` block that wraps `record()` and `showResults()` from outside, so the core engine is untouched.
- Five fast, correct answers in a row on a harder subject's kind of question → suggests that subject. Snooze for 7 days; on/off switch on Progress.
- Set the pattern later add-ons follow: self-contained, switchable, removable by deleting one block.

## Stage 7 — Mad Minute Music · 2026-10-15 · `d717cc6`, `a31b8ac`

- `/music/`: 7 subjects, 2,114 questions, a Music Path.
- Engine gained **real staff notation, a drawn piano keyboard and ear-training sound** that works offline.

## Stage 8 — Mad Minute Dev · 2026-10-19

- `/dev/`: 8 subjects (9 after Stage 10), 1,205 questions, Beginner → Junior → Intermediate → Senior.
  Dev Vocabulary · Programming Fundamentals · Read & Debug · Git · Front-End · Back-End · Full Stack & Architecture · DevOps & Kubernetes.
- **Dev Path**: 32 steps covering all 50 topics; finishing it means Junior or better everywhere.
- **Code in questions**: ```` ``` ```` fenced blocks show as scrollable code boxes; `` `backticks` `` show as inline code. Questions with code get more time. (`qHTML()` / `inlineHTML()` in model helpers.)
- **Dev layer** add-on (same pattern as Smart jump; moved to the shared file in Stage 9):
  - **Recall first**: choices stay hidden until you've pulled the answer from memory (optionally typed). Clocks pause while you think; on a miss it shows what you recalled next to the right answer. On by default, switch on Home.
  - **Skills checkup**: one adaptive test across every subject in path order. Junior question first; right → Intermediate, wrong → Beginner. ~2 questions per topic, saved topic by topic so you can stop and resume. Results seed each subject's levels (never lowering them).
  - **Roadmap**: topics at Junior+, your next 3 moves in learning order, strengths, a full color-coded map, and "Copy roadmap as text" to share with a mentor or manager.
- Smart jump retargeted to Git, Back-End and DevOps; manager view relabeled **Team**; no DEMO watermark.
- Built by a script from the Auto engine plus plain-text question files, so the engine code stays identical to the other apps apart from small, listed patches.

## Stage 9 — First shared engine file · 2026-10-19

- Recall first, the Skills checkup and the Roadmap moved out of the Dev page into **`shared/mm-learn.js` + `shared/mm-learn.css`**, loaded by all four apps. This is the first piece of engine code that lives in one place: fix it once, every app gets it.
- It adapts to whichever app loads it: that app's subjects, path order, level names (B Tech, Section Ready, Junior...) and saved-data keys (`mmauto_`, `mmbio_`, `mmmus_`, `mmdev_`), so progress never mixes between apps.
- **Recall first** default per app (`window.MM_LEARN = { recall: ... }` just above the script tag): on for Biology, Music and Dev; off for Auto so the timed "mad minute" feel stays for techs. Everyone can switch it on Home.
- Works with Music's staff, keyboard and sound: the drawing stays visible while you recall.
- Each app's offline worker precaches the shared files. When `mm-learn.js` changes, bump its `?v=` in each `index.html` and `sw.js` so phones pick it up.
- Auto `mm-auto-v14`, Biology `mm-bio-v2`, Music `mm-mus-v3`, Dev `mm-dev-v2`.

## Stage 10 — Real-World Problems for Dev · 2026-10-19

- New Dev subject, **Real-World Problems**: 164 scenario questions written like a bug report or a coworker's message, in 6 topics: Git Disasters, JavaScript & Async Surprises, CSS & Layout Fights, Data & Database Surprises, Works on My Machine, Deploys & Production Fires.
- Chosen by researching what developers hit most: Stack Overflow's most popular questions (undoing commits, async "why is it undefined", removing array items, centering a div) and published outage studies (config changes and ignored errors cause most major outages). Every question is written fresh; no text is copied from those sites.
- Wrong answers are realistic mistakes people actually make (like `--force`, `slice` vs `splice`, `margin: auto`), not joke options.
- Woven into the Dev Path as 6 "Real World" steps right after the matching lessons (38 steps, 56 topics, 1,369 questions). Dev `mm-dev-v3`.

## Stage 11 — Vocabulary and diagnostic labs (Auto) · 2026-10-22

- New Auto-only add-on, `extras/mm-extras.js` + `extras/mm-extras.css`, same hook-from-outside pattern (wraps `renderQuestion`, `answer`, `record`, `showResults`, `renderHome`). Remove it by deleting the `extras/` lines in `index.html`.
- **Vocabulary**: 408 terms in 35 decks (one per topic), data in `extras/vocab/<subject>.js` as `[term, definition, other names]` rows.
  - Spaced repeat per card (boxes 0 to 5: now, 1, 3, 7, 21, 60 days).
  - **Tappable terms** in questions and explanations. Before you answer, a term stays plain if its definition would give the answer away. Opening one pauses the clocks.
  - **My Weak Words**: terms from missed questions and cards marked Again; three Got its in a row and a word graduates. Results show the words a round added.
- **Diagnostic labs** screen: Circuit Lab and CAN bus Lab, Learn and Quiz modes, +10 XP per right quiz answer, record saved per lab.
- Saved keys: `mmauto_vocab_srs`, `mmauto_vocab_weak`, `mmauto_labs`. Auto `mm-auto-v15`.

---

## Which app has what

| Feature | Auto `/` | Biology | Music | Dev |
|---|:-:|:-:|:-:|:-:|
| Placement, ranks, timeline, spaced review | ✓ | ✓ | ✓ | ✓ |
| Offline + home-screen install | ✓ | ✓ | ✓ | ✓ |
| Path card + Free/Guided | ✓ | — | ✓ | ✓ |
| Smart jump | ✓ | — | — | ✓ |
| Staff, keyboard, sound | — | — | ✓ | — |
| Code blocks in questions | — | — | — | ✓ |
| Recall first, Skills checkup, Roadmap (shared file) | ✓ | ✓ | ✓ | ✓ |
| Vocabulary flashcards, tappable terms, Weak Words | ✓ | — | — | — |
| Diagnostic labs (Circuit, CAN bus) | ✓ | — | — | — |

## Ideas parked for later

- Show each person's roadmap in the Crew / Team view, so a manager sees gaps and next moves per tech.
- Keep moving engine parts into `shared/` until each app is just its subjects plus settings.
- Manager sync over Wi-Fi from phones to a PC (the Team / Crew view on real data).
