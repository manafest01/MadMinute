# AGENTS.md — how to work on Mad Minute

This file is for any AI coding assistant (Grok, Claude, Copilot, Codex and others) or developer
picking up this repo. Read it all before changing anything.

Mad Minute is a set of one-minute quiz and flashcard apps from **Mana Industries LLC**.
Live site: https://manafest01.github.io/MadMinute/ (the Auto demo) and
https://manafest01.github.io/MadMinute/hub/ (all apps).

## 1. What this is

- **Plain static web apps.** No framework, no build step, no server, no npm. Each app is one big
  `index.html` (HTML, CSS and JavaScript together) plus a few shared files. GitHub Pages serves the
  repo as-is from the `main` branch.
- **Installable and offline (PWA).** Every app has its own `manifest.webmanifest` and `sw.js`
  (service worker). After the first visit it works with no internet.
- **No accounts, no backend.** Progress lives in the browser's `localStorage` on the user's device.
  Sign-in in Settings is a placeholder ("Coming soon"); company single sign-on and a database are
  planned but not built.

## 2. Folder map

| Path | What it is |
|---|---|
| `index.html` | **Mad Minute Auto** — the main demo. 6 subjects: Shop Safety, Automotive Technician, Basic Maintenance, 12 V & 48 V Electrical, Vehicle Networks, High Voltage |
| `sw.js`, `manifest.webmanifest`, `icons/` | Auto's offline cache, install info and icons |
| `shared/` | Add-ons loaded by every app: `mm-learn` (roadmap/learning layer), `mm-home` (compact home screen), `mm-goals` (Calendar tab, HI SCORE), `mm-settings` (gear/Settings screen), `mm-resume` (Pick up where you left off, Test history), `mm-flash` (flashcards, hub, Circuit Lab), `mm-symbols` (schematic symbol drawings), `mm-parts` (Exploded View: name the part, put it in order) |
| `flashcards/*.js` | Vocab decks for Auto (`safe`, `auto`, `maint`, `e12`, `net`, `hv`), symbol-circuit decks (`sym-*.js`) and Exploded View assemblies (`parts-*.js`, format in the file's top comment) |
| `biology/`, `music/`, `dev/`, `neta/` | The other apps, each a full copy with its own `index.html`, `sw.js`, manifest, icons and decks |
| `hub/` | The launcher page that lists every app |
| `tools/` | Python scripts that generate or bulk-edit content (see section 6) |
| `ENGINE_HISTORY.md` | Version history: one "Stage" per change. Add a stage for every change you ship |

## 3. Data formats

**Subject (pack)** — in `index.html`, inside `const BUILTIN_PACKS = [ ... ]`:

```js
{ id: "safe", name: "Shop Safety", short: "Safety", storeKey: "mmauto_state_safe",
  order: ["P", "Z", "F"],                       // topic keys, in learning order
  ranks: ["New Hire", "Safety Aware", "Safety Smart", "Safety Lead", "Safety Captain"],
  topics: {"P": "PPE", "Z": "Hazard Communication (SDS)", "F": "Fire Safety"},
  raw: [
  // ---- PPE ----
  ["P", 1, "Question text:", ["Right answer", "Wrong", "Wrong", "Wrong"], "Why the answer is right."],
  ...
  ]
},
```

- Question row: `[topicKey, level 1-4, question, [right answer FIRST, 3 wrong answers], explanation]`.
  The app shuffles the options; the right answer is always written first in the data.
- Levels: 1 = first week, 2 = working tech, 3 = experienced, 4 = expert / rule numbers.
- Aim for about 60 questions per topic, spread across all four levels.

**Shop path** — `const SHOP_PATH = [...]` in `index.html`: the ordered steps on the home screen.
`{ pack: "auto", keys: ["B"], name: "Brakes" }` (`keys: null` = the whole subject).

**Vocab flashcards** — `flashcards/<packId>.js`:

```js
(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).safe = {
P: [
  ["Term", "Plain meaning in one sentence.", "Shop tip: what a tech should actually do."],
],
};
```

Auto decks are at 80 cards per topic (Stage 27). Easy words first; new cards go at the end of each topic.

**Symbol circuits** — `flashcards/sym-*.js` add to `window.MM_SYMBOLS`; each circuit lists parts in the
order current meets them: `[symbolName, term, meaning, tip]`, or `[symbolName]` for a part already
taught. Symbol drawings live in `shared/mm-symbols.js` (SVG, `120x70` viewBox, wire at `y=35`).

## 4. Rules that must not break

1. **Bump the cache every time you change a file**, or phones keep the old copy:
   - change `const VERSION = "mm-auto-v35"` in that app's `sw.js` to the next number, and
   - when you change a shared or flashcard file, bump its `?v=N` in **both** the app's `index.html`
     `<script>`/`<link>` tag **and** the `CORE` list in that app's `sw.js`. They must match exactly.
   - A shared file used by several apps means bumping it in every app that loads it.
2. **Never rename or remove saved-progress keys.** Each app has its own prefix: `mmauto_`, `mmbio_`,
   `mmmus_`, `mmdev_`, `mmneta_` (plus `mmflash_<pack>` for flashcard progress). Pack `storeKey`s
   (for example `mmauto_state_safe`) and pack/topic ids hold users' progress. Add new ones; don't change old ones.
3. **Keep apps separate.** Each app's `sw.js` skips the other apps' folders. A new app gets its own
   folder, prefix, `sw.js`, manifest and icons, and gets added to the skip list in the root `sw.js`
   and to `APPS` in `hub/index.html`.
4. **Dev and NETA are generated** from the root `index.html` by `tools/dev-build/build_dev.py` and
   `tools/neta-build/build_neta.py`. Edit the source and rebuild rather than hand-editing those copies.
5. **Everything stays offline-capable**: no CDN scripts, no web fonts, no API calls. Any new file
   must be listed in that app's `sw.js` `CORE` list.
6. **Accuracy first.** Safety and technical answers must match a real source (OSHA 29 CFR, ANSI,
   EPA, SAE, the maker's service info). Put the rule number in the explanation when there is one.
   Never invent a number. The app tells users to follow the manufacturer's procedure and their
   employer's safety program; keep that.
7. **Writing style**: plain words a new tech understands; short answers (under ~45 characters) so
   they fit on a phone button; wrong answers believable and about the same length as the right one;
   no duplicate questions.
8. **Test before you push** (section 7). No JavaScript errors in the browser console.

## 5. How to add things

**More questions to an existing topic.** Add rows under the topic's `// ---- Name ----` comment in
the pack's `raw` array, sorted by level. For many rows, write a Python content file and a small
script like `tools/safety-build/append_safety.py` (it inserts rows by topic, skips duplicates and
rewrites the flashcard deck). Then bump `sw.js` `VERSION`.

**More flashcards.** Add rows to `flashcards/<pack>.js`, bump its `?v=` in `index.html` and `sw.js`,
and bump `VERSION`.

**A new subject in Auto.** Add a pack object to `BUILTIN_PACKS` with a new `id` and a new
`storeKey` (`mmauto_state_<id>`), optionally a step in `SHOP_PATH`, a new `flashcards/<id>.js`
deck loaded in `index.html` before `shared/mm-flash.js`, and list it in `sw.js` `CORE`.

**A new app (for example an EV or brand-specific edition).** Copy an existing app folder (for
example `neta/`), pick a new folder name and a new storage prefix (for example `mmev_`), replace
every old prefix, give its `sw.js` a new cache name (`mm-ev-v1`), new icons and manifest name, add
the folder to the root `sw.js` skip list and to `APPS` in `hub/index.html`.

## 6. Tools

All tools are plain Python 3 with no extra packages (icon makers need Pillow).

| Script | Does |
|---|---|
| `tools/safety-build/append_safety.py <repo> content_p2` | Adds questions and flashcards from a content module to the Shop Safety subject |
| `tools/safety-build/content_p1..p3.py` | The Shop Safety content and its sources |
| `tools/flash-build/maint_add.py` | Added the Basic Maintenance flashcards |
| `tools/flash-build/append_flash.py <repo> <pack> content_<pack>` | Adds vocab cards from a content module to any deck (skips duplicates; caps each topic at 40, or `--max N`) |
| `tools/dev-build/build_dev.py`, `tools/neta-build/build_neta.py` | Generate the Dev and NETA apps from the root app |
| `tools/hub-build/make_icons.py`, `tools/neta-build/make_icons.py` | Make app icons |

## 7. Testing

```bash
python3 -m http.server 8780        # from the repo root, then open http://localhost:8780/
```

Check, on a phone-sized window (about 412 x 915), in light and dark mode:
- the home screen loads, Go on the shop path starts a quiz, answers can be picked;
- the Subjects, Map and Calendar tabs and the Settings gear open;
- the flashcard hub opens, a deck flips, Circuit Lab opens and closes;
- the browser console shows no errors.

Automated checks used so far: Playwright (Python) with service workers blocked, clicking through
those screens and collecting `pageerror` events.

## 8. Shipping

1. Commit to `main` with a clear message.
2. Add a Stage to `ENGINE_HISTORY.md` (what changed, which cache versions).
3. Push. GitHub Pages updates in a minute or two; phones pick up the new copy on the next open
   because of the cache bump.
