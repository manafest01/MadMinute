# Building Mad Minute NETA

`neta/index.html` is generated. Edit the sources here, then rebuild.

- `questions/*.txt` — the question banks, one file per subject, same plain-text format as Dev:
  ```
  # <topic letter> <level 1-4>
  Q: question
  A: the right answer
  W: wrong answer   (three W lines, about the same length as the right answer)
  E: why the right answer is right
  ```
  Engine levels 1–4 = NETA Level 1 Trainee → Level 4 Senior.
- `/neta/flashcards/*.js` — vocab decks, one per subject, one row per card: `[term, plain meaning, on-the-job tip]`.
- `build_neta.py` — copies the Auto engine (`/index.html`), swaps in the NETA subjects, NETA Path, sample crew and labels.
- `parse_q.py` — reads and checks the question files (same as Dev's).
- `make_icons.py` — draws the NETA home-screen icons.

```
python3 tools/neta-build/parse_q.py tools/neta-build/questions        # check questions
python3 tools/neta-build/build_neta.py . tools/neta-build/questions   # rebuild neta/index.html
```
After a rebuild, bump `VERSION` in `neta/sw.js` so installed phones pick up the new copy.

Subjects follow the four domains of NETA's exam outline (Safety, Electrical Testing Fundamentals & Theory,
Component Testing, Systems & Commissioning). Every question is written fresh; nothing is copied from NETA's
standards or paid study material.
