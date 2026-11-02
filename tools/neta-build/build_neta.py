"""Build Mad Minute NETA (neta/index.html) from the Mad Minute Auto engine page.

Same approach as tools/dev-build: the engine code is kept as-is apart from the small, listed swaps
below. Questions come from plain-text files in questions/, vocab decks live in neta/flashcards/.
Recall first, Skills checkup, Roadmap (shared/mm-learn.js) and Flashcards (shared/mm-flash.js) are shared.
    python3 build_neta.py <repo_dir> <questions_dir>
"""
import json, sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from parse_q import parse

REPO, QDIR = sys.argv[1], sys.argv[2]
src = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()

def sub(old, new, count=1):
    """Replace text that must exist exactly `count` times."""
    global src
    n = src.count(old)
    assert n == count, f"expected {count}x, found {n}x: {old[:80]!r}"
    src = src.replace(old, new)

# The engine's 4 levels per topic line up with NETA's 4 certification levels.
RANKS = ["Newcomer", "L1 Trainee", "L2 Assistant", "L3 Certified", "L4 Senior"]
PACKS = [
    ("safe", "Electrical Safety", "Safety", ["R", "A", "P", "L", "G", "C"],
     {"R": "Risk & Job Briefings", "A": "Arc Flash & Boundaries", "P": "PPE & Rubber Gloves",
      "L": "Lockout/Tagout & Safe Work", "G": "Grounds & Hipot Safety", "C": "Codes & NETA Standards"}),
    ("theory", "Testing Fundamentals & Theory", "Theory", ["M", "T", "W", "F", "I", "X", "D"],
     {"M": "Units & Math", "T": "Three-Phase & Power", "W": "Reading Drawings", "F": "Faults & Grounding Systems",
      "I": "Insulation Theory", "X": "CTs & PTs", "D": "Protection & Device Numbers"}),
    ("comp", "Component Testing", "Components", ["V", "I", "H", "G", "T", "B", "R", "C", "M"],
     {"V": "Visual, Mechanical & Infrared", "I": "Insulation Resistance", "H": "Hipot, VLF & Power Factor",
      "G": "Grounding & Batteries", "T": "Transformers", "B": "Breakers & Switchgear",
      "R": "Relays & CT Testing", "C": "Cables & Fault Locating", "M": "Motors, Arresters & Capacitors"}),
    ("sys", "Systems & Commissioning", "Commissioning", ["D", "P", "F", "A", "G"],
     {"D": "Documentation & Reports", "P": "Commissioning Process", "F": "Functional & Trip Testing",
      "A": "ATS & Emergency Power", "G": "Generators & Paralleling"}),
]
DISCLAIM = ("Study aid built around the NETA exam outline. Questions are original, not NETA's. "
            "ANSI/NETA standards, NFPA 70E, the NEC, manufacturer data and your employer's safety program always win.")

# ---- question bank ----
rows_by_pack = {}
for f in sorted(os.listdir(QDIR)):
    if f.endswith(".txt"):
        pack, rows = parse(os.path.join(QDIR, f))
        rows_by_pack[pack] = rows

out = ["const BUILTIN_PACKS = ["]
total = 0
for i, (pid, name, short, order, topics) in enumerate(PACKS):
    rows = rows_by_pack[pid]
    assert set(r["k"] for r in rows) == set(order), (pid, set(r["k"] for r in rows))
    rows = sorted(rows, key=lambda r: (order.index(r["k"]), r["lv"]))
    total += len(rows)
    out.append("{ id: %s, name: %s, short: %s, storeKey: %s," % (json.dumps(pid), json.dumps(name), json.dumps(short), json.dumps("mmneta_state_" + pid)))
    out.append("  order: %s," % json.dumps(order))
    out.append("  ranks: %s," % json.dumps(RANKS))
    out.append("  disclaimer: %s," % json.dumps(DISCLAIM))
    out.append("  topics: %s," % json.dumps(topics))
    out.append("  raw: [")
    cur, lines = None, []
    for r in rows:
        if r["k"] != cur:
            cur = r["k"]; lines.append("  // ---- %s ----" % topics[cur])
        lines.append("  " + json.dumps([r["k"], r["lv"], r["q"], [r["a"]] + r["w"], r["e"]], ensure_ascii=False) + ",")
    lines[-1] = lines[-1].rstrip(",")
    out += lines
    out.append("] }" + ("," if i < len(PACKS) - 1 else ""))
out.append("];")

a = src.index("const BUILTIN_PACKS = [")
b = src.index("/* ================= storage ================= */")
src = src[:a] + "\n".join(out) + "\n\n" + src[b:]

# ---- NETA Path (the engine calls it SHOP_PATH): one easy-to-hard route, roughly Level 1 → Level 4 work ----
PATH = [
    ("safe", ["R"], "Risk & Job Briefings"),
    ("safe", ["A"], "Arc Flash & Boundaries"),
    ("safe", ["P"], "PPE & Rubber Gloves"),
    ("safe", ["L"], "Lockout/Tagout & Safe Work"),
    ("theory", ["M"], "Units & Math"),
    ("theory", ["T"], "Three-Phase & Power"),
    ("theory", ["W"], "Reading Drawings"),
    ("comp", ["V"], "Visual, Mechanical & Infrared"),
    ("comp", ["I"], "Insulation Resistance"),
    ("safe", ["G"], "Grounds & Hipot Safety"),
    ("theory", ["I"], "Insulation Theory"),
    ("comp", ["H"], "Hipot, VLF & Power Factor"),
    ("theory", ["F"], "Faults & Grounding Systems"),
    ("comp", ["G"], "Grounding & Batteries"),
    ("theory", ["X"], "CTs & PTs"),
    ("comp", ["T"], "Transformers"),
    ("comp", ["B"], "Breakers & Switchgear"),
    ("theory", ["D"], "Protection & Device Numbers"),
    ("comp", ["R"], "Relays & CT Testing"),
    ("comp", ["C"], "Cables & Fault Locating"),
    ("comp", ["M"], "Motors, Arresters & Capacitors"),
    ("sys", ["D"], "Documentation & Reports"),
    ("safe", ["C"], "Codes & NETA Standards"),
    ("sys", ["P"], "Commissioning Process"),
    ("sys", ["F"], "Functional & Trip Testing"),
    ("sys", ["A"], "ATS & Emergency Power"),
    ("sys", ["G"], "Generators & Paralleling"),
]
covered = {(p, k) for p, ks, _ in PATH for k in ks}
for pid, _, _, order, _ in PACKS:
    for k in order:
        assert (pid, k) in covered, ("not on path", pid, k)
path_js = "const SHOP_PATH = [\n" + ",\n".join(
    "  { pack: %s, keys: %s, name: %s }" % (json.dumps(p), json.dumps(ks), json.dumps(n)) for p, ks, n in PATH) + "\n];"
a = src.index("const SHOP_PATH = [")
b = src.index("];", a) + 2
src = src[:a] + path_js + src[b:]
sub("/* ---------- shop path: one easy-to-hard route across the auto subjects ---------- */",
    "/* ---------- NETA path: one easy-to-hard route across the NETA subjects (named SHOP_PATH in the engine) ---------- */")

# ---- names, storage keys and labels ----
src = src.replace("mmauto_", "mmneta_")
sub("<title>Mad Minute Auto</title>", "<title>Mad Minute NETA</title>")
src = src.replace('content="MM Auto"', 'content="MM NETA"')
src = re.sub(r'<meta name="description" content="[^"]*">',
             '<meta name="description" content="Mad Minute NETA: one-minute drills for electrical testing and commissioning, NETA Level 1 to Level 4. A Mana Industries product.">', src, count=1)
sub('<small class="auto-tag">AUTO</small>', '<small class="auto-tag">NETA</small>')
sub('<span id="subjectName">Electrical</span>', '<span id="subjectName">Safety</span>')
sub('Shop path · step <span id="pathStepNum">', 'NETA path · step <span id="pathStepNum">')
sub('aria-label="Shop path steps"', 'aria-label="NETA path steps"')
sub("Mad Minute Auto · © 2026 Mana Industries LLC. All rights reserved.", "Mad Minute NETA · © 2026 Mana Industries LLC. All rights reserved.")
src = src.replace('id="homeRank">Trainee<', 'id="homeRank">Newcomer<').replace('id="profRank">Trainee<', 'id="profRank">Newcomer<')
sub('"Demo build · not for resale · progress is saved on this device · works offline once loaded"',
    '"Personal build · progress is saved on this device · works offline once loaded"')
a = src.index('<div id="demoWatermark"'); b = src.index("</div>", a) + 6
src = src[:a] + src[b:]

# ---- smart jump: suggest Component Testing or Commissioning when you're fast and right on that kind of question ----
a = src.index("  var TARGETS = [")
b = src.index("  ];", a) + 4
src = src[:a] + r'''  var TARGETS = [
    { pack: "comp", label: "component testing", from: ["safe", "theory"],
      topics: ["Insulation Theory", "CTs & PTs"],
      words: /\b(megg?(er|ohmmeter)|insulation resistance|hipot|polarization index|turns ratio|contact resistance|primary injection|secondary injection|excitation|winding resistance|infrared|thermograph\w*)\b/i,
      acronyms: /\b(TTR|PI|DAR|VLF|DGA|DLRO|SFRA)\b/ },
    { pack: "sys", label: "commissioning", from: ["safe", "theory", "comp"],
      topics: [],
      words: /\b(commissioning|functional test\w*|transfer switch|generators?|paralleling|synchroni\w+|load bank|switching order|as-left|as-found)\b/i,
      acronyms: /\b(ATS|IST|FAT|NFPA 110)\b/ }
  ];''' + src[b:]
sub('var SKIP_TOPICS = ["Shop Safety"];   // safety questions mention batteries and wires but aren\'t electrical skill',
    'var SKIP_TOPICS = [];')
sub("Watches for a tech who answers a run of electrical, network, or high-voltage style questions",
    "Watches for a tech who answers a run of component-testing or commissioning style questions")

# ---- sample crew for previewing the manager view ----
a = src.index("const SAMPLE_CREW = (() => {")
b = src.index("})();", a) + 5
src = src[:a] + r'''const SAMPLE_CREW = (() => {
  const SAFE = ["Risk & Job Briefings", "Arc Flash & Boundaries", "PPE & Rubber Gloves", "Lockout/Tagout & Safe Work", "Grounds & Hipot Safety", "Codes & NETA Standards"];
  const COMP = ["Visual, Mechanical & Infrared", "Insulation Resistance", "Hipot, VLF & Power Factor", "Grounding & Batteries", "Transformers", "Breakers & Switchgear", "Relays & CT Testing", "Cables & Fault Locating", "Motors, Arresters & Capacitors"];
  const lvN = ["L1 Trainee", "L2 Assistant", "L3 Certified", "L4 Senior"];
  const pk = (name, order, rank, levels, focus, missed) => {
    const lv = {}; order.forEach((t, i) => lv[t] = levels[i] || 0);
    return { name, rank, order, levels: lv, lvNames: lvN, focus, missed };
  };
  const mk = (name, pattern, streak, packs) => {
    const days = {};
    lastNDays(14).forEach((d, i, all) => { const m = pattern[(all.length - 1 - i) % pattern.length]; if (m) days[dayKey(d)] = { min: m, n: Math.round(m * 4), c: Math.round(m * 3) }; });
    return { id: "sample-" + name, name: name + " (sample)", updatedAt: Date.now(), streak, days, packs };
  };
  return [
    mk("Marcus", [14, 10, 0, 12, 9, 0, 0], 3, {
      safe: pk("Electrical Safety", SAFE, "L2 Assistant", [3, 2, 2, 2, 1, 1],
        [{ t: "Grounds & Hipot Safety", misses: 3, level: 1 }],
        [{ q: "A common rule after a DC hipot is to keep the item grounded for at least:", t: "Grounds & Hipot Safety", lv: 2, a: "Four times the test duration", e: "Charge can come back from deep in the insulation.", n: 3 }]),
      comp: pk("Component Testing", COMP, "L1 Trainee", [2, 2, 1, 1, 1, 0, 0, 0, 0],
        [{ t: "Insulation Resistance", misses: 4, level: 2 }],
        [{ q: "The guard terminal on a megohmmeter is used to:", t: "Insulation Resistance", lv: 2, a: "Remove surface leakage from the reading", e: "Guarding bypasses leakage across the surface.", n: 4 }]) }),
    mk("Dana", [22, 18, 20, 0, 15, 12, 0], 8, {
      safe: pk("Electrical Safety", SAFE, "L3 Certified", [4, 4, 3, 3, 3, 2], [], []),
      comp: pk("Component Testing", COMP, "L2 Assistant", [3, 3, 3, 2, 2, 2, 2, 1, 1],
        [{ t: "Relays & CT Testing", misses: 2, level: 2 }],
        [{ q: "A CT secondary should NEVER be:", t: "CTs & PTs", lv: 1, a: "Open-circuited while the primary carries current", e: "It can develop dangerous voltage.", n: 2 }]) }),
    mk("Luis", [0, 6, 0, 0, 7, 0, 0], 0, {
      safe: pk("Electrical Safety", SAFE, "L1 Trainee", [2, 1, 1, 1, 0, 0],
        [{ t: "Lockout/Tagout & Safe Work", misses: 5, level: 1 }],
        [{ q: "\"Live-dead-live\" means:", t: "Lockout/Tagout & Safe Work", lv: 2, a: "Prove the tester, test the circuit, prove the tester again", e: "It proves a dead reading wasn't a dead meter.", n: 4 }]) })
  ];
})();''' + src[b:]

# ---- shared add-ons live one folder up; NETA vocab decks live in neta/flashcards/ ----
sub('<link rel="stylesheet" href="shared/mm-learn.css', '<link rel="stylesheet" href="../shared/mm-learn.css')
sub('<script>window.MM_LEARN = { recall: "off" };</script>', '<script>window.MM_LEARN = { recall: "on" };</script>')
sub('<script src="shared/mm-learn.js', '<script src="../shared/mm-learn.js')
sub('<link rel="stylesheet" href="shared/mm-flash.css', '<link rel="stylesheet" href="../shared/mm-flash.css')
a = src.index('<script src="flashcards/auto.js')
b = src.index('<script src="shared/mm-flash.js')
src = src[:a] + "".join('<script src="flashcards/%s.js?v=1"></script>\n' % p[0] for p in PACKS) + \
    '<script>window.MM_FLASH = { circuitLab: [], tipLabel: "On the job" };</script>\n' + src[b:]
sub('<script src="shared/mm-flash.js?v=1', '<script src="../shared/mm-flash.js?v=2')

# leftovers that would look wrong in the NETA app
for bad in ["Mad Minute Auto", "mmauto_", "Shop path", "flashcards/auto.js", '"shared/']:
    assert bad not in src, bad

os.makedirs(os.path.join(REPO, "neta"), exist_ok=True)
open(os.path.join(REPO, "neta", "index.html"), "w", encoding="utf-8").write(src)
print("wrote neta/index.html", len(src), "bytes,", total, "questions,", len(PATH), "path steps")
