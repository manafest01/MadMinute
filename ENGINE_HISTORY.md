# Mad Minute Engine — Revision History

A breadcrumb trail from the first Mad Minute to today: what each stage added, which apps got it, and where to look in the code.

Newest stage is at the bottom. Commit hashes link a stage to the exact change in Git (`git show <hash>`).

---

## How to read the code

Every app (`/`, `/biology/`, `/music/`, `/dev/`, `/neta/`) is one self-contained `index.html`. Inside, the engine is split by comment headers. Search for these to jump to a part:

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

## Stage 11 — Vocab flashcards + Circuit Lab · 2026-10-30

- **Vocab flashcards** for every Auto topic: 35 decks, 503 cards across all five subjects. Each card is a term, its plain meaning, and an "In the shop" tip. Decks live in `flashcards/<subject>.js` (`auto`, `maint`, `e12`, `net`, `hv`), one row per card: `[term, meaning, tip]`.
- A **Vocab** button under every topic card shows how many cards are due. Tap it, say the meaning, flip, then **Again** or **Got it**. Keyboard: space flips, 1 = Again, 2 = Got it.
- Cards use the same **Leitner boxes** as spaced review (back in 1, 3, 7, 21, 60 days). "Again" sends a card to the end of the sitting once and puts it in **Drill my misses** until you get it right first try. Saved on the device under `mmflash_<subject>`.
- **Brush up the words** card on the results screen: after a round, it offers the vocab decks for the topics you missed.
- **Circuit Lab** (12 V & 48 V, Basic Maintenance, Automotive): a tappable battery → fuse → switch → lamp → ground circuit. Open the switch, blow the fuse, burn out the lamp, corrode or break the ground, or chafe a wire into a short. Live meter readings show what each fault does (across the lamp, ground side drop, current), with a plain explanation of each part.
- New shared add-on `shared/mm-flash.js` + `shared/mm-flash.css`. Same pattern as Smart jump: it wraps `renderTopicsGrid()` and `showResults()` from outside, so core engine code is untouched. Any app can turn it on by loading the files and adding a `flashcards/` folder. `window.MM_FLASH = { circuitLab: [...] }` picks which subjects show the lab.
- Auto `mm-auto-v15`.

## Stage 12 — Mad Minute NETA · 2026-11-02

- `/neta/`: electrical testing and commissioning, 4 subjects, 27 topics, 432 questions, built around the four domains of NETA's exam outline (Safety, Fundamentals & Theory, Component Testing, Systems & Commissioning).
- **Levels match NETA's**: the engine's four levels per topic are named L1 Trainee, L2 Assistant, L3 Certified, L4 Senior.
- **NETA Path**: 27 steps, one per topic, from job briefings and arc flash through component testing to generators and paralleling.
- **Vocab flashcards** for every topic: 241 cards in `neta/flashcards/<subject>.js`, using the shared `mm-flash.js` add-on.
- `mm-flash.js` gained one option: `window.MM_FLASH.tipLabel` sets the label before each card's tip ("On the job" here; Auto keeps the default "In the shop").
- Smart jump retargeted to Component Testing and Commissioning. No DEMO watermark.
- Built like Dev: `tools/neta-build/build_neta.py` copies the Auto engine and swaps in questions from plain-text files. Wrong answers were written to match the right answer's length so length doesn't give it away.
- NETA `mm-neta-v1`.

## Stage 13 — Challenge a question + hardening pass · 2026-11-06

- **Challenge this question**: a small red link under every question, and under every miss on the Results screen. Reasons: answer is wrong, the setup doesn't add up (a reading or situation that can't happen), more than one answer is right, unclear, typo, other. A "What's wrong?" note and an optional **Source** (manual, test, website, page).
- Challenging pauses the clock. In a practice round, an unanswered challenged question is skipped and doesn't count. The question stops coming up for that person until it's reviewed.
- The **+** screen lists challenges with their notes and sources, plus **Copy all as text** and **Download file**. Set `CHALLENGE_EMAIL` in `index.html` to add an **Email them** button.
- Fixed: the next question could start behind an open Challenge sheet after a fast right answer.
- Fixed: **Reset demo** left flashcard progress (`mmflash_*`) behind.
- Fixed: the Auto offline cache didn't skip `/neta/`, so opening NETA before its own cache existed could save the NETA page as the Auto app's offline copy.
- Picking a daily goal now confirms with a toast.
- Question fixes (edited in place, so saved progress still lines up): 0°F battery power (40%, not 60%), stuck-dominant CAN readings (3.5 V / 1.5 V, not 4.5 V / 0.5 V), CAN-L open outcome, scope time base note, DoIP pin note, two duplicate or awkward 48 V stems, two grammar fixes in Test Tools, "actual" vs "nominal" pack voltage.
- Tested: every visible button on every screen clicked for a new user and a placed user (251 clicks, no dead buttons, no script errors), plus 72 end-to-end checks across placement, practice, study, timeouts, review, all five subjects, flashcards, Circuit Lab, Skills checkup, crew view, theme, and reset.
- Auto `mm-auto-v16`.

## Stage 14 — Flashcards button + symbol cards in series · 2026-11-08

- **Flashcards button**: a full-width amber button at the top of Topics opens the new **Flashcards hub**, with everything in one place: symbol circuits, word decks for every topic with due counts, and Drill my misses. The small per-topic button now says **Flashcards** instead of Vocab. NETA gets the button and hub too (words only).
- **Symbols in series**: 19 symbol cards across 7 real 12 V circuits (lamp, relay control side, relay load side, coolant temp sensor, throttle position sensor, dash indicator LED, charging). The symbol is on the front; flip for the name, what it does, and a shop tip. A strip on each card shows the whole circuit in the order current flows, with the current part in amber. A part already learned shows in the strip but doesn't get a second card.
- **Walk every circuit** runs all 19 in order; finishing a circuit offers the next one. **Drill symbol misses** collects the ones you hit Again on.
- New files: `shared/mm-symbols.js` (the symbol drawings, standard wiring-diagram symbols as SVG, sharp at any size and offline) and `flashcards/sym-e12.js` (the circuits). Symbol progress is saved under `mmflash_symbols`, so Reset demo clears it too.
- Escape now closes the hub and Circuit Lab as well as a deck.
- Plan doc: Mad Minute — Visual Flashcards Plan (v0.2). Next phases: EV/HV and CAN symbols in series, then coding in series.
- Tested: every circuit walked card by card, hub buttons, back-to-hub on close, Escape, light and dark, Circuit Lab, NETA hub; no script errors.
- Auto `mm-auto-v17`, NETA `mm-neta-v2`.
- Placement card: a close **✕** in the corner hides it until the app is opened again; ticking **Don't show this again** first keeps it hidden on this device (`mm_place_hidden`, cleared by Reset demo). Retake placement on the Progress screen still works. Auto `mm-auto-v18`.

## Stage 15 — Mad Minute Hub · 2026-11-08

- **Hub page** at `/hub/`: one home-screen icon ("MM Hub") that opens every Mad Minute app, grouped as Trades (Auto demo, NETA) and Learning (Dev, Biology, Music), each with its own icon and a one-line description.
- Works offline with its own small service worker (`hub/sw.js`, `mm-hub-v1`) that only looks after the hub folder. The Auto service worker now skips `/hub/` so the two never overwrite each other's offline copy. Auto `mm-auto-v19`.
- Icon drawn by `tools/hub-build/make_icons.py`. To add an app later: one line in `APPS` in `hub/index.html`, plus its icon in `hub/sw.js`.

---

## Which app has what

| Feature | Auto `/` | Biology | Music | Dev | NETA |
|---|:-:|:-:|:-:|:-:|:-:|
| Placement, ranks, timeline, spaced review | ✓ | ✓ | ✓ | ✓ | ✓ |
| Offline + home-screen install | ✓ | ✓ | ✓ | ✓ | ✓ |
| Path card + Free/Guided | ✓ | — | ✓ | ✓ | ✓ |
| Smart jump | ✓ | — | — | ✓ | ✓ |
| Staff, keyboard, sound | — | — | ✓ | — | — |
| Code blocks in questions | — | — | — | ✓ | — |
| Recall first, Skills checkup, Roadmap (shared file) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Vocab flashcards + Drill my misses (shared file) | ✓ | — | — | — | ✓ |
| Flashcards button + hub (shared file) | ✓ | — | — | — | ✓ |
| Symbol cards in series | ✓ | — | — | — | — |
| Circuit Lab | ✓ | — | — | — | — |

## Ideas parked for later

- Show each person's roadmap in the Crew / Team view, so a manager sees gaps and next moves per tech.
- Keep moving engine parts into `shared/` until each app is just its subjects plus settings.
- Manager sync over Wi-Fi from phones to a PC (the Team / Crew view on real data).
