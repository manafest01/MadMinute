"""Phase 1 of the Shop Safety subject (run once).
- Moves the Automotive "Shop Safety" topic (H) out of Automotive into a new Shop Safety subject
  with 8 topics, sorting each old question and flashcard into its new topic.
- Adds the new PPE and Hazard Communication questions and flashcards from content_p1.py.
- Makes Shop Safety step 1 of the shop path.
Run: python3 build_safety.py <repo_dir>"""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from content_p1 import QUESTIONS, FLASH

REPO = sys.argv[1]
TOPICS = [("P", "PPE"), ("Z", "Hazard Communication (SDS)"), ("F", "Fire Safety"), ("L", "Lifts, Jacks & Stands"),
          ("T", "Tools & Equipment"), ("A", "Air & Exhaust"), ("E", "Electrical Safety"), ("X", "Emergencies & First Aid")]
# new topic for each old Shop Safety question, in the order they appear in Automotive
OLD_Q = "P L F T X P P F F X P P X T Z F T Z F L A E Z F L F F A F L L T T F F Z E L L E E E T A F L L L X A A Z T T P E L A E E A Z L A X E Z".split()
# new topic for each old Shop Safety flashcard, by term
OLD_F = {"PPE": "P", "SDS": "Z", "Lockout/tagout": "E", "Jack stand": "L", "Lift point": "L", "Wheel chock": "L",
         "Two-post lift": "L", "Lift safety lock": "L", "Carbon monoxide (CO)": "A", "Fire extinguisher class": "F",
         "PASS": "F", "Hearing protection": "P", "Eyewash station": "X", "Brake dust": "A", "Used oil": "Z",
         "Battery acid": "E", "Spill kit": "X", "Pinch point": "T", "Electric cooling fan": "E", "Airbag (SRS)": "E"}

# ---------- questions ----------
p = os.path.join(REPO, "index.html")
s = open(p, encoding="utf-8").read()
assert '{ id: "safe"' not in s, "already built"
a = s.index('{ id: "auto"'); b = s.index('{ id: "maint"')
auto = s[a:b]
rows = re.findall(r'\n  (\["H", \d, .*?\]),?(?=\n)', auto)
assert len(rows) == len(OLD_Q) == 67, (len(rows), len(OLD_Q))
old = []
for r, k in zip(rows, OLD_Q):
    q = json.loads(r); q[0] = k; old.append(q)
auto2 = re.sub(r'\n  \["H", \d, .*?\],?(?=\n)', "", auto)
auto2 = auto2.replace("  // ---- Shop Safety ----\n", "")
auto2 = auto2.replace('order: ["H", "W", "B", "S", "E", "C", "F", "D", "A"]', 'order: ["W", "B", "S", "E", "C", "F", "D", "A"]')
auto2 = auto2.replace(', "H": "Shop Safety"}', "}")
assert '"H"' not in auto2.split("raw:")[0], "H still in Automotive header"

allq = old + QUESTIONS
allq.sort(key=lambda q: ([k for k, _ in TOPICS].index(q[0]), q[1]))
lines = []
for key, name in TOPICS:
    lines.append("  // ---- " + name + " ----")
    for q in allq:
        if q[0] == key: lines.append("  " + json.dumps(q, ensure_ascii=False) + ",")
pack = ('{ id: "safe", name: "Shop Safety", short: "Safety", storeKey: "mmauto_state_safe",\n'
        '  order: ' + json.dumps([k for k, _ in TOPICS]) + ',\n'
        '  ranks: ["New Hire", "Safety Aware", "Safety Smart", "Safety Lead", "Safety Captain"],\n'
        '  topics: ' + json.dumps(dict(TOPICS), ensure_ascii=False) + ',\n'
        '  raw: [\n' + "\n".join(lines).rstrip(",") + "\n  ]\n},\n")
s = s[:a] + pack + auto2 + s[b:]
old_step = '{ pack: "auto",  keys: ["H"],           name: "Shop Safety" },'
assert s.count(old_step) == 1
s = s.replace(old_step, '{ pack: "safe",  keys: null,            name: "Shop Safety" },')
open(p, "w", encoding="utf-8").write(s)
print("questions:", {k: sum(1 for q in allq if q[0] == k) for k, _ in TOPICS}, "total", len(allq))

# ---------- flashcards ----------
fp = os.path.join(REPO, "flashcards", "auto.js")
f = open(fp, encoding="utf-8").read()
m = re.search(r"\nH: \[\n(.*?)\n\],?", f, re.S)
assert m
old_cards = [json.loads(x) for x in re.findall(r'^\s*(\[.*\]),?\s*$', m.group(1), re.M)]
assert len(old_cards) == 20, len(old_cards)
f = f[:m.start()] + f[m.end():]
open(fp, "w", encoding="utf-8").write(f)
deck = {k: [] for k, _ in TOPICS}
for c in old_cards: deck[OLD_F[c[0]]].append(c)
for k, rows in FLASH.items():
    have = {c[0].lower() for c in deck[k]}
    deck[k] += [r for r in rows if r[0].lower() not in have]
out = ["/* Vocab flashcards: Shop Safety. Row = [term, plain meaning, shop tip]. Easy words first. */",
       "(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).safe = {"]
parts = []
for k, _ in TOPICS:
    parts.append(k + ": [\n" + ",\n".join("  " + json.dumps(r, ensure_ascii=False) for r in deck[k]) + "\n]")
out.append(",\n".join(parts))
out.append("};")
open(os.path.join(REPO, "flashcards", "safe.js"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("flashcards:", {k: len(v) for k, v in deck.items()})
