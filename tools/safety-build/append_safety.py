"""Append Shop Safety questions and flashcards from a content module (Phase 2+).
Run: python3 append_safety.py <repo_dir> content_p2
- Inserts each question under its topic's "// ---- Name ----" block in the safe pack, keeping rows sorted by level.
- Skips questions whose text already exists in the pack, and cards whose term already exists in the deck.
- Rewrites flashcards/safe.js with the new cards added to each topic."""
import importlib, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
REPO, MOD = sys.argv[1], sys.argv[2]
C = importlib.import_module(MOD)
TOPICS = [("P", "PPE"), ("Z", "Hazard Communication (SDS)"), ("F", "Fire Safety"), ("L", "Lifts, Jacks & Stands"),
          ("T", "Tools & Equipment"), ("A", "Air & Exhaust"), ("E", "Electrical Safety"), ("X", "Emergencies & First Aid")]
KEYS = [k for k, _ in TOPICS]

for q in C.QUESTIONS:
    assert q[0] in KEYS and q[1] in (1, 2, 3, 4) and len(q[3]) == 4 and len(set(q[3])) == 4 and q[4], q

p = os.path.join(REPO, "index.html")
s = open(p, encoding="utf-8").read()
a = s.index('{ id: "safe"'); r0 = s.index("raw: [", a) + len("raw: [")
r1 = s.index("\n  ]\n},", r0)
rows = [json.loads(x) for x in re.findall(r'^  (\[".*\]),?$', s[r0:r1], re.M)]
have = {q[2].strip().lower() for q in rows}
added = {k: 0 for k in KEYS}
for q in C.QUESTIONS:
    if q[2].strip().lower() in have: print("skip dup:", q[2]); continue
    have.add(q[2].strip().lower()); rows.append(q); added[q[0]] += 1
rows.sort(key=lambda q: (KEYS.index(q[0]), q[1]))  # stable: old order kept within a level
lines = []
for key, name in TOPICS:
    lines.append("  // ---- " + name + " ----")
    lines += ["  " + json.dumps(q, ensure_ascii=False) + "," for q in rows if q[0] == key]
body = "\n" + "\n".join(lines).rstrip(",")
s = s[:r0] + body + s[r1:]
open(p, "w", encoding="utf-8").write(s)
print("questions added:", added)
print("questions now:", {k: sum(1 for q in rows if q[0] == k) for k in KEYS}, "total", len(rows))

fp = os.path.join(REPO, "flashcards", "safe.js")
f = open(fp, encoding="utf-8").read()
deck = {}
for k in KEYS:
    m = re.search(r"\n" + k + r": \[\n(.*?)\n\]", f, re.S)
    deck[k] = [json.loads(x) for x in re.findall(r'^\s*(\[.*\]),?\s*$', m.group(1), re.M)] if m else []
for k, cards in C.FLASH.items():
    terms = {c[0].lower() for c in deck[k]}
    for c in cards:
        assert len(c) == 3 and all(c), c
        if c[0].lower() in terms: print("skip dup card:", c[0]); continue
        terms.add(c[0].lower()); deck[k].append(c)
out = ["/* Vocab flashcards: Shop Safety. Row = [term, plain meaning, shop tip]. Easy words first. */",
       "(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).safe = {",
       ",\n".join(k + ": [\n" + ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in deck[k]) + "\n]" for k in KEYS),
       "};"]
open(fp, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("flashcards now:", {k: len(v) for k, v in deck.items()})
