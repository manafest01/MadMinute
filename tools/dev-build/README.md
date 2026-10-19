# Building Mad Minute Dev

`dev/index.html` is generated. Edit the sources here, then rebuild.

- `questions/*.txt` — the question banks, one file per subject, in plain text:
  ```
  # <topic letter> <level 1-4>
  Q: question (code goes in ``` fences on the following lines)
  A: the right answer
  W: wrong answer   (three W lines)
  E: why the right answer is right
  ```
- Recall first, Skills checkup and Roadmap live in `/shared/mm-learn.js` and `.css`, shared by every app.
- `build_dev.py` — copies the Auto engine (`/index.html`), swaps in the Dev subjects, Dev Path and patches, and adds the Dev layer.
- `parse_q.py` — reads and checks the question files.

```
python3 tools/dev-build/parse_q.py tools/dev-build/questions        # check questions
python3 tools/dev-build/build_dev.py . tools/dev-build/questions    # rebuild dev/index.html
```
After a rebuild, bump `VERSION` in `dev/sw.js` so installed phones pick up the new copy.
