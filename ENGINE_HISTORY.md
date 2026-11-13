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
- Placement card: a close **✕** in the corner hides it until the app is opened again; ticking **Don't show this again** first keeps it hidden on this device (`mmauto_place_hidden`, cleared by Reset demo). Retake placement on the Progress screen still works. Auto `mm-auto-v18`.

## Stage 15 — Mad Minute Hub · 2026-11-08

- **Hub page** at `/hub/`: one home-screen icon ("MM Hub") that opens every Mad Minute app, grouped as Trades (Auto demo, NETA) and Learning (Dev, Biology, Music), each with its own icon and a one-line description.
- Works offline with its own small service worker (`hub/sw.js`, `mm-hub-v1`) that only looks after the hub folder. The Auto service worker now skips `/hub/` so the two never overwrite each other's offline copy. Auto `mm-auto-v19`.
- Icon drawn by `tools/hub-build/make_icons.py`. To add an app later: one line in `APPS` in `hub/index.html`, plus its icon in `hub/sw.js`.

## Stage 16 — Placement card close in every app · 2026-11-08

- The placement card's close **✕** and **Don't show this again** box are now in Biology, Music, Dev and NETA too.
- Each app remembers it separately (`mmauto_`, `mmbio_`, `mmmus_`, `mmdev_`, `mmneta_` + `place_hidden`), so hiding it in one app doesn't hide it in the others, and each app's Reset clears its own. Because Dev and NETA are built from the Auto page, their build scripts carry it automatically on the next rebuild.
- Tested in all five apps: shows, ✕ hides until reopen, ticked stays hidden, apps don't affect each other.
- Auto `mm-auto-v20`, Biology `mm-bio-v3`, Music `mm-mus-v4`, Dev `mm-dev-v4`, NETA `mm-neta-v3`.

## Stage 17 — Symbols in series: high voltage / EV and CAN · 2026-11-08

- 18 new symbol cards in 5 circuits, grouped in the Flashcards hub under **High voltage / EV** and **Networks (CAN)** (the 12 V circuits now sit under **12 V**). That's 37 symbol cards across 12 circuits in all.
  - **HV drive path:** HV pack, service disconnect, main contactor, precharge, DC link capacitor, inverter, 3-phase traction motor.
  - **Isolation check:** insulation tester (megohmmeter), chassis ground. **HV interlock (HVIL).**
  - **CAN bus:** terminating resistor, module, twisted pair, DLC. **Signals on the scope:** recessive bit, dominant bit, CAN-H shorted to ground, PWM.
- 18 new drawings in `shared/mm-symbols.js`; new decks `flashcards/sym-hv.js` and `flashcards/sym-net.js`.
- Tested: every new circuit walked card by card; all 37 symbols drawn on one sheet and checked; no script errors.
- Auto `mm-auto-v21`, NETA `mm-neta-v4` (shared flashcard file update).

## Stage 18 — Compact home, every app · 2026-11-08

- New shared add-on `shared/mm-home.js` / `.css`, loaded by all five apps right after `mm-learn.js`:
  - **Tests card:** Placement and Skills checkup are now two buttons side by side in one card, with one ✕ and one **Don't show this again** box. The roadmap card shows only after placement, in a slimmer style.
  - **Path card:** one line (step, name, Go). The step bubbles come off; the Map tab shows the whole path.
  - **Team / Crew overview card:** off the home screen; the Team / Crew tab opens the same screen (both only show for managers).
- Tested in all five apps: both buttons start the right test, ✕ hides the card, placed users see the slim roadmap card, no script errors.
- Auto `mm-auto-v22`, Biology `mm-bio-v4`, Music `mm-mus-v5`, Dev `mm-dev-v5`, NETA `mm-neta-v5`.
- **After placement:** Today's goal and Your rank share one slim row (tap the rank side for your profile, as before); "Fill your next gap" and the roadmap card are slimmer, one line each. Auto `mm-auto-v23`, Biology `mm-bio-v5`, Music `mm-mus-v6`, Dev `mm-dev-v6`, NETA `mm-neta-v6`.
- **Settings row:** Timed / Study, Recall first / Show choices and Retake placement fold into one tap-to-open **Settings** row that shows the current choice ("Timed · Recall first"). **Daily review** shows only when something is due. Auto `mm-auto-v24`, Biology `mm-bio-v6`, Music `mm-mus-v7`, Dev `mm-dev-v7`, NETA `mm-neta-v7`.

## Stage 19 — Calendar tab: study time and high scores · 2026-11-08

- New shared add-on `shared/mm-goals.js` / `.css` in all five apps: a **Calendar** tab (calendar icon) right after Map.
  - **This week:** minutes studied, a bar toward your **high score** (best week so far), and "N min to beat it" / "New high score!".
  - **Days studied:** a Sun–Sat row of check circles. Showing up every day is the point.
  - **Today** (minutes and XP) and **Best day** (crowned).
  - **Month calendar** with minutes per day; studied days tinted, today outlined, best day crowned; back about two months.
  - The daily XP goal stays only as a small gray line at the bottom.
- Study time comes from the engine's existing log (`daily.act`, capped at a minute per answer so idle time doesn't count). High scores are saved separately (`<app>_hiscore_v1`) so they outlast the two months of day-by-day history. Flashcard time isn't counted yet.
- Today's goal card left the home screen (kept hidden so the engine still updates it); your rank now has the row to itself.
- Tested in all five apps with sample data: tab, month arrows, switching tabs, home row; light and dark; no script errors.
- Auto `mm-auto-v25`, Biology `mm-bio-v7`, Music `mm-mus-v8`, Dev `mm-dev-v8`, NETA `mm-neta-v8`.
- Labels changed to arcade-style **HI SCORE** (week line, best-day tile, "NEW HI SCORE!"). Auto `mm-auto-v26`, Biology `mm-bio-v8`, Music `mm-mus-v9`, Dev `mm-dev-v9`, NETA `mm-neta-v9`.
- Calendar days now show **XP** instead of minutes, in vibrant colors: solid amber on days you hit the daily goal, lighter amber on days you studied, teal outline on today. The **HI SCORE · day** tile is the most XP in one day (solid amber); Today shows XP big, minutes small. The weekly HI SCORE stays in minutes. Auto `mm-auto-v27`, Biology `mm-bio-v9`, Music `mm-mus-v10`, Dev `mm-dev-v10`, NETA `mm-neta-v10`.

## Stage 20 — Settings screen · 2026-11-08

- New shared add-on `shared/mm-settings.js` / `.css` in all five apps. A **gear** at the top of home (in place of the old theme button) opens **Settings**:
  - **Profile:** your name (saved on this device, shown as initials), your rank, a link to your progress and timeline.
  - **Account:** where progress is saved. Sign-in is marked "Not set up yet"; syncing across phones is planned.
  - **Appearance:** System / Light / Dark.
  - **Practice:** Timed or Study, Recall first or Show choices, the daily XP goal, Retake placement.
  - **Data:** Reset (moved here from the progress screen).
- The app's own controls are moved in with their ids, so they keep working. The home **Settings** row from Stage 18 is gone; Settings lives on its own screen now.
- Calendar days show a small **xp** mark next to each number.
- Flashcards tidy-up: home keeps **one** Flashcards button; the per-topic Flashcards bars, Drill my misses and Circuit Lab moved into the hub (Circuit Lab at its top, closing it returns to the hub). The flip card now sits near the top instead of floating mid-screen, and **Again** is a red outline button instead of looking switched off.
- Fixed: the path card's **Go** did nothing before placement (it only started a round for placed users, so it looked dead). It now always starts the next topic on the path, or says what unlocks it. Shared fix in `mm-home.js`, all apps.
- Sign in is a placeholder for now: **Sign in with your company** (each company gets its own single sign-on) and **Use an email instead**, both showing "coming soon". Real sign-in needs an online database, planned later.
- Tested in all five apps: gear, name saved after reload, theme, goal, timed/study, retake, back; light and dark; no script errors.
- Auto `mm-auto-v28`, Biology `mm-bio-v10`, Music `mm-mus-v11`, Dev `mm-dev-v11`, NETA `mm-neta-v11`.

## Stage 21 — Bigger Maintenance flashcard decks · 2026-11-08

- Basic Maintenance flashcards went from 63 to 239 cards: about **40 per topic** (Oil & Filter, Fluids & Levels, Belts/Hoses/Filters, Battery/Lights/Wipers, Under-Car Checks, Inspections & Intervals). Same format: term, plain meaning, shop tip.
- Added by `tools/flash-build/maint_add.py`, which skips any term the topic already has. Some basics also appear in the Automotive, 12 V and HV decks on purpose; each subject keeps its own progress.
- Still 20 cards per sitting, on the same 1/3/7/21/60-day schedule.
- Next decks to build up to 40 per topic: 12 V & 48 V, High Voltage, Networks, Automotive.
- Auto `mm-auto-v32`.

## Stage 22 — Shop Safety subject, Phase 1 · 2026-11-08

- **Shop Safety is its own subject** (id `safe`, first in the subject list and **step 1 of the shop path**), with 8 topics: PPE, Hazard Communication (SDS), Fire Safety, Lifts/Jacks & Stands, Tools & Equipment, Air & Exhaust, Electrical Safety, Emergencies & First Aid. Ranks: New Hire, Safety Aware, Safety Smart, Safety Lead, Safety Captain.
- The old Automotive "Shop Safety" topic (67 questions, 20 flashcards) moved into the new subject, each item sorted into its topic. Automotive now has 8 topics.
- **PPE** (60 questions, 40 flashcards) and **Hazard Communication / SDS** (61 questions, 40 flashcards) are built out in full: Z87 eyewear, gloves by hazard, 85 dBA hearing program, respirators (medical evaluation, yearly fit test, change schedules), hierarchy of controls, insulating gloves; all 16 SDS sections, label elements, the 8 pictograms, Danger vs. Warning, secondary labels, PEL/TWA, flash point, NFPA vs. GHS.
- Built by `tools/safety-build/build_safety.py` from `content_p1.py`, with sources in the plan doc (OSHA 1910.132/.134/.95/.137/.1200, ANSI Z87.1). The Fire, Lifts, Tools, Air, Electrical and Emergencies topics are filled out in Phases 2–3.
- New users now open on Shop Safety (first subject).
- Auto `mm-auto-v34`, NETA `mm-neta-v15` (shared flashcard file).

## Stage 23 — Shop Safety subject, Phases 2 and 3 · 2026-11-08

- **All 8 Shop Safety topics are built out**: 491 questions and 320 flashcards (was 175 and 104).
  - Fire Safety 63 / 40: extinguisher classes and types, monthly and yearly checks, 75 ft (Class A) and 50 ft (Class B) travel, safety cans and cabinets, bonding/grounding, hot work (35-foot rule, 30-minute fire watch), oxygen and fuel-gas cylinders, EV thermal runaway.
  - Lifts, Jacks & Stands 63 / 40: ANSI/ALI ALOIM and the ALI gold label, spotting and center of gravity, symmetric vs. asymmetric lifts, four-post lifts and rolling jacks, jack stands, engine hoists, EV lift points, air-suspension jack mode.
  - Tools & Equipment 63 / 40: 30 psi cleaning air, grinders (1/8 in rest, 1/4 in tongue guard, ring test), hand and air tools, presses and spring compressors, tire service (40 psi bead seating, cages and clip-on chucks per 1910.177), injection injuries, oxy-acetylene (15 psi limit).
  - Air & Exhaust 59 / 42: CO (OSHA 50 ppm, NIOSH 35 ppm), extraction and the hierarchy of controls, brake and clutch dust (1910.1001 App F), respirators and fit tests, isocyanates, welding fumes, refrigerants and EPA Section 609, oxygen-deficient air and pits.
  - Electrical Safety 60 / 40: HV above 60 V DC, Class 0 gloves and 6-month retest, service disconnect and wait times, CAT III meters and live-dead-live, lockout/tagout, GFCIs, batteries and jump-starting, airbags.
  - Emergencies & First Aid 62 / 38: emergency action plans (1910.38), exits, eyewash (10 seconds, 15 minutes, weekly), first aid (1910.151), CPR/AED, bleeding and burns, bloodborne pathogens, OSHA reporting (1904.39) and the 300 log.
- **Accuracy pass**: 82 questions where the right answer stood out as the longest option got more believable wrong answers.
- Built by `tools/safety-build/append_safety.py` (reusable: `python3 append_safety.py <repo> content_p2`) from `content_p2.py` and `content_p3.py`, then `polish_distractors.py`. The append script skips duplicate questions and flashcard terms, so adding more content later is safe.
- Auto `mm-auto-v35`, `flashcards/safe.js?v=2`.

## Stage 24 — Handoff guide for other AI assistants · 2026-11-08

- **AGENTS.md**: how the repo is built, the question/flashcard/symbol formats, the rules that must not break (cache bumps, progress keys, offline-only, accuracy), how to add subjects and apps, tools, testing and shipping.
- **GROK_STARTER_PROMPT.md**: a ready-to-paste first message for Grok (or any AI) to pick up the project, with notes on where to run it and checking the service's terms before uploading.
- README updated for the Shop Safety subject and links to both files. No app files changed, so no cache bump.

## Stage 25 — Pick up where you left off + test history · 2026-11-12

- **Pick up where you left off** (`shared/mm-resume.js`): the app saves your last practice round (subject, topic, when, score, misses). Come back an hour or more later and Home shows a card for it. Tap it for a "Welcome back" summary (your level, last round, what's left to fix, where you are on the shop path), then 3 untimed refresh questions (last round's misses first, then due reviews, then recent ones), then a normal practice round in that topic. "Skip to practice" goes straight in.
- **Test history**: every Placement test and every Skills checkup is saved as its own snapshot (date, score, level per topic) instead of being overwritten. The Progress tab has a Test history card: a bar per attempt (skill score = average level, level 4 everywhere = 100) and, per attempt, each topic's level compared with the attempt before. A checkup you continue later stays one attempt; a retake starts a new one. A checkup taken before this stage is saved as attempt 1.
- **Retaking Placement never lowers a level you earned in practice.** The snapshot still keeps that day's honest result.
- New keys (nothing old renamed): `mmauto_resume`, `mmauto_tests`. Auto only for now; other apps can load the same two files.
- Auto `mm-auto-v36`, `shared/mm-resume.css?v=1`, `shared/mm-resume.js?v=1`.
- Fix (same day): with no saved round yet (practiced before this update), the card falls back to the last question answered in any subject, so it shows right away. Auto `mm-auto-v37`, `shared/mm-resume.js?v=2`.

## Stage 26 — Every Auto subject's flashcards to 40 per topic + subject picker · 2026-11-13

- **Subject picker in the Flashcards hub** (`shared/mm-flash.js`): chips across the top switch between every subject that has a vocab deck (Safety, Automotive, Maintenance, 12 V & 48 V, Networks, High Voltage) without changing the app's subject. Tapping one jumps to its words. Closing a deck returns to the same subject.
- **"New" vs "to review"**: cards you've never studied are no longer counted as "due". Each deck shows "New deck", "12 new · 2 to review" or "All caught up"; the Home Flashcards button counts only real reviews.
- **700 new cards** with `tools/flash-build/append_flash.py` (reusable: skips terms already in the pack, caps each topic at 40, rewrites the deck), every topic now at 40:
  - 12 V & 48 V (+154, `content_e12.py`): 48 V mid-voltage first (P0–P2 layouts, ISG, DC-DC, 60 V DC line, ISO 21780), batteries, starting/charging, wiring, sensors/actuators, test tools.
  - High Voltage (+161, `content_hv.py`): HVIL and isolation first (100 Ω/V DC and 500 Ω/V AC per SAE J1766 / FMVSS 305, bonding, megohmmeter use), contactors and pre-charge, battery and BMS, inverter/motor/charging (J1772, CCS, NACS/SAE J3400), NFPA 70E boundaries and PPE (Class 0 = 1,000 V AC / 1,500 V DC; OSHA 1910.137 daily inspection).
  - Vehicle Networks (+216, `content_net.py`): CAN voltages and termination, frames and errors, diagnosis, LIN/FlexRay/MOST, OBD-II modes and UDS services (ISO 14229), automotive Ethernet (802.3bw/bp/cg), DoIP (ISO 13400).
  - Automotive Technician (+169, `content_auto.py`): tires, brakes, steering/suspension, engine, fuel/ignition/emissions, cooling/lube, drivetrain, heating & A/C.
- Auto `mm-auto-v38`: `shared/mm-flash.js?v=7`, `shared/mm-flash.css?v=5`, `flashcards/e12.js?v=2`, `hv.js?v=2`, `net.js?v=2`, `auto.js?v=3`. NETA `mm-neta-v16` (shared flash file).

## Stage 27 — Every Auto deck to 80 cards per topic · 2026-11-13

- **About 1,760 more vocab cards**: all 44 topics across the 6 Auto subjects now have 80 cards each (3,520 in all), built with `tools/flash-build/append_flash.py --max 80`. Shipped a subject at a time, in this order:
  - High Voltage +240 (`content_hv2.py`): NFPA 70E boundaries, incident energy, glove class labels, 1,000 V tools, isolation math for 800 V, HVIL pins and latches, contactor and pre-charge faults, cell chemistry and aging, charging (J1772 pilot, ISO 15118, NEC 80% rule).
  - 12 V & 48 V +240 (`content_e12b.py`): battery ratings (CCA vs CA vs MCA), charging stages, draw testing, starter and alternator diagnosis, series/parallel math, diagram reading, sensors, scopes and meters, the 48 V operating range (ISO 21780).
  - Vehicle Networks +320 (`content_net2.py`, `content_net3.py`): CAN IDs and diagnostic addressing (0x7DF, +8 responses), physical-layer readings (60/120/40 Ω), error confinement (127/255), ISO-TP, J1939 (PGN/SPN/FMI), LIN frames, SENT/PSI5, FlexRay, OBD services and UDS NRCs, multi-gig and 10BASE-T1S Ethernet, DoIP and cybersecurity rules (UN R155/R156).
  - Automotive Technician +320 (`content_auto2.py`), Basic Maintenance +241 (`content_maint2.py`, `content_maint3.py`), Shop Safety +320 (`content_safe2.py`, `content_safe3.py`; OSHA 1910.95/.132–.138/.147/.157/.177/.242/.1001/.1200, 1904.33/.39, NFPA 10, ANSI Z87.1/Z89.1, ASTM F2413).
- Self-review changes before shipping: 48 V cable color and cell count reworded to avoid an unsupported claim; an HV "annual retraining" card corrected to NFPA 70E's three-year maximum; a brake-dust card changed to OSHA Appendix F's "equivalent method".
- Auto `mm-auto-v44`: `flashcards/hv.js?v=3`, `e12.js?v=3`, `net.js?v=3`, `auto.js?v=4`, `maint.js?v=3`, `safe.js?v=3`.

## Stage 28 — Exploded View: take a brake apart · 2026-11-13

- **Exploded View** (`shared/mm-parts.js`, `shared/mm-parts.css`, data in `flashcards/parts-brakes.js`): a new section in Auto, opened from an **Exploded View** button beside Flashcards on Home, or from the Flashcards hub.
  - **Disc Brake Corner** (11 parts: knuckle, dust shield, hub and bearing, rotor, caliper bracket, abutment clips, inner and outer pads, piston and seal, caliper housing, slide pins and boots). Numbered exploded drawing; tap a part or its name for what it does and a shop tip. **Taken apart / Put together** slides the parts into place and back.
  - **Brake Hydraulic Path** (9 parts: pedal, booster, master cylinder and reservoir, ABS unit, steel line, flex hose, caliper, pads, rotor), drawn as a flow with the fluid lines.
  - **Name the part**: one part lights up, pick its name from 4. 10 XP each, +5 under 5 seconds, +20 for a clean sweep. Misses go to the front of that assembly's flashcards.
  - **Put it in order**: tap the parts in the order they go on (corner) or the order the push travels (path). Ties are allowed (inner/outer pad). 5 XP per clean step, +20 with no slips. Ends with the order and a note on how designs vary.
  - **Flashcards**: picture on the front (whole drawing, that part lit up), name, meaning and shop tip on the back, on the usual spaced schedule.
- `shared/mm-flash.js`: picture cards (`c.pic`), a `back` option so another add-on's deck closes back to it, and the Exploded View button in the hub (only when `MMParts` is loaded, so NETA shows nothing new).
- New keys (nothing old renamed): `mmparts_disc-corner`, `mmparts_brake-path` (best scores), `mmflash_parts` (card progress).
- Auto `mm-auto-v45`: `shared/mm-flash.js?v=8`, `shared/mm-parts.css?v=1`, `shared/mm-parts.js?v=1`, `flashcards/parts-brakes.js?v=1`. NETA `mm-neta-v17` (shared flash file).
- Fix (same day, from Thomas's review on his phone): the rotor was drawn backwards. Now the friction disc sits inboard by the dust shield and the hat faces out toward the wheel, over the hub flange. The knuckle, dust shield and hub stay on the car during a brake job, so they no longer move in the exploded view, have gray numbers, and are left out of Put it in order. The order is now rotor → caliper bracket → abutment clips → pads → caliper. Auto `mm-auto-v46`, `shared/mm-parts.css?v=2`, `shared/mm-parts.js?v=2`, `flashcards/parts-brakes.js?v=2`.

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
| Exploded View (shared file) | ✓ | — | — | — | — |
| Pick up where you left off, Test history (shared file) | ✓ | — | — | — | — |

## Ideas parked for later

- Show each person's roadmap in the Crew / Team view, so a manager sees gaps and next moves per tech.
- Keep moving engine parts into `shared/` until each app is just its subjects plus settings.
- Manager sync over Wi-Fi from phones to a PC (the Team / Crew view on real data).
