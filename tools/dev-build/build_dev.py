"""Build Mad Minute Dev (dev/index.html) from the Mad Minute Auto engine page.

The engine code is kept as-is apart from the small, listed patches below. Recall first, the Skills
checkup and Roadmap come from /shared/mm-learn.js, which every app loads. Run from anywhere:
    python3 build_dev.py <repo_dir> <questions_dir>
"""
import json, sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from parse_q import parse

REPO, QDIR = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()

def sub(old, new, count=1):
    """Replace text that must exist exactly `count` times."""
    global src
    n = src.count(old)
    assert n == count, f"expected {count}x, found {n}x: {old[:80]!r}"
    src = src.replace(old, new)

RANKS = ["Newcomer", "Beginner", "Junior", "Intermediate", "Senior"]
PACKS = [
    ("vocab", "Dev Vocabulary", "Vocabulary", ["C", "W", "D", "T", "A", "O"],
     {"C": "Core Programming Terms", "W": "Web & Network Terms", "D": "Data & Database Terms",
      "T": "Tools & Workflow Terms", "A": "Architecture Terms", "O": "Ops & Cloud Terms"}),
    ("fund", "Programming Fundamentals", "Fundamentals", ["V", "L", "F", "A", "S", "C"],
     {"V": "Variables & Types", "L": "Conditions & Loops", "F": "Functions", "A": "Arrays & Objects",
      "S": "Strings & Text", "C": "Classes & Modules"}),
    ("dbg", "Read & Debug", "Read & Debug", ["P", "S", "B", "M", "R", "A"],
     {"P": "Predict the Output", "S": "Reading Errors", "B": "Spot the Bug", "M": "Debugging Method",
      "R": "Reading & Reviewing Code", "A": "Working with AI Code"}),
    ("git", "Git & Version Control", "Git", ["B", "C", "M", "F", "R", "W"],
     {"B": "Git Basics", "C": "Commits & History", "M": "Branches & Merging", "F": "Fixing Mistakes",
      "R": "Remotes & GitHub", "W": "Team Workflow"}),
    ("front", "Front-End", "Front-End", ["H", "C", "D", "A", "R", "P"],
     {"H": "HTML", "C": "CSS & Layout", "D": "DOM & Events", "A": "Async & Fetch",
      "R": "React & Components", "P": "Accessibility & Performance"}),
    ("back", "Back-End", "Back-End", ["H", "S", "Q", "M", "A", "T"],
     {"H": "HTTP & APIs", "S": "Servers & Routing", "Q": "SQL & Databases", "M": "Data Modeling",
      "A": "Auth & Security", "T": "Testing"}),
    ("full", "Full Stack & Architecture", "Full Stack", ["C", "F", "P", "A", "O", "S"],
     {"C": "How the Pieces Connect", "F": "State & Data Flow", "P": "Planning & Scope",
      "A": "Architecture & Patterns", "O": "Offline, PWA & Sync", "S": "Shipping & Maintenance"}),
    ("ops", "DevOps & Kubernetes", "DevOps", ["L", "N", "D", "C", "K", "X", "O", "I"],
     {"L": "Linux & Shell", "N": "Networking", "D": "Docker", "C": "CI/CD", "K": "Kubernetes Basics",
      "X": "Kubernetes in Practice", "O": "Observability", "I": "Cloud & Infrastructure as Code"}),
    ("real", "Real-World Problems", "Real World", ["G", "J", "C", "D", "E", "P"],
     {"G": "Git Disasters", "J": "JavaScript & Async Surprises", "C": "CSS & Layout Fights",
      "D": "Data & Database Surprises", "E": "Works on My Machine", "P": "Deploys & Production Fires"}),
]
DISCLAIM = "Study aid. Official docs win if anything here differs. Code examples use JavaScript unless they say Python."

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
    total += len(rows)
    out.append("{ id: %s, name: %s, short: %s, storeKey: %s," % (json.dumps(pid), json.dumps(name), json.dumps(short), json.dumps("mmdev_state_" + pid)))
    out.append("  order: %s," % json.dumps(order))
    out.append("  ranks: %s," % json.dumps(RANKS))
    out.append("  disclaimer: %s," % json.dumps(DISCLAIM))
    out.append("  topics: %s," % json.dumps(topics))
    out.append("  raw: [")
    cur = None
    lines = []
    for r in rows:
        if r["k"] != cur:
            cur = r["k"]; lines.append("  // ---- %s ----" % topics[cur])
        lines.append("  " + json.dumps([r["k"], r["lv"], r["q"], [r["a"]] + r["w"], r["e"]], ensure_ascii=False) + ",")
    lines[-1] = lines[-1].rstrip(",")
    out += lines
    out.append("] }" + ("," if i < len(PACKS) - 1 else ""))
out.append("];")
packs_js = "\n".join(out)

a = src.index("const BUILTIN_PACKS = [")
b = src.index("/* ================= storage ================= */")
src = src[:a] + packs_js + "\n\n" + src[b:]

# ---- Dev Path (the engine calls it SHOP_PATH) ----
PATH = [
    ("vocab", ["C"], "Core Programming Terms"),
    ("fund", ["V"], "Variables & Types"),
    ("fund", ["L"], "Conditions & Loops"),
    ("fund", ["F"], "Functions"),
    ("fund", ["A", "S"], "Arrays, Objects & Strings"),
    ("dbg", ["P"], "Predict the Output"),
    ("git", ["B", "C"], "Git Basics & Commits"),
    ("dbg", ["S", "B"], "Reading Errors & Spotting Bugs"),
    ("vocab", ["W"], "Web & Network Terms"),
    ("front", ["H", "C"], "HTML & CSS"),
    ("front", ["D"], "DOM & Events"),
    ("real", ["C"], "Real World: CSS & Layout Fights"),
    ("dbg", ["M"], "Debugging Method"),
    ("git", ["M", "F"], "Branches & Fixing Mistakes"),
    ("real", ["G"], "Real World: Git Disasters"),
    ("front", ["A"], "Async & Fetch"),
    ("real", ["J"], "Real World: JavaScript & Async Surprises"),
    ("vocab", ["D"], "Data & Database Terms"),
    ("back", ["Q"], "SQL & Databases"),
    ("back", ["H", "S"], "HTTP, APIs & Servers"),
    ("back", ["M"], "Data Modeling"),
    ("real", ["D"], "Real World: Data & Database Surprises"),
    ("dbg", ["R", "A"], "Reviewing Code & Working with AI"),
    ("fund", ["C"], "Classes & Modules"),
    ("front", ["R", "P"], "React, Accessibility & Performance"),
    ("back", ["A", "T"], "Auth, Security & Testing"),
    ("full", ["C", "F"], "Full Stack: Connecting & State"),
    ("full", ["P"], "Planning & Scope"),
    ("git", ["R", "W"], "GitHub & Team Workflow"),
    ("ops", ["L", "N"], "Linux & Networking"),
    ("ops", ["D"], "Docker"),
    ("real", ["E"], "Real World: Works on My Machine"),
    ("ops", ["C"], "CI/CD"),
    ("real", ["P"], "Real World: Deploys & Production Fires"),
    ("vocab", ["T", "A", "O"], "Tools, Architecture & Ops Terms"),
    ("full", ["A", "O", "S"], "Architecture, Offline & Shipping"),
    ("ops", ["K", "X"], "Kubernetes"),
    ("ops", ["O", "I"], "Observability & Cloud"),
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
    "/* ---------- dev path: one easy-to-hard route across the dev subjects (named SHOP_PATH in the engine) ---------- */")

# ---- engine patches: show code in questions, answers and explanations ----
sub('function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str == null ? "" : String(str); return d.innerHTML; }',
    'function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str == null ? "" : String(str); return d.innerHTML; }\n'
    '// Question text can hold code: ```fenced blocks``` become code boxes and `backticks` become inline code.\n'
    'function inlineHTML(str) { return escapeHtml(str).replace(/`([^`\\n]+)`/g, "<code>$1</code>"); }\n'
    'function qHTML(str) {\n'
    '  return String(str == null ? "" : str).split("```").map((part, i) => {\n'
    '    if (i % 2) return \'<pre class="code"><code>\' + escapeHtml(part.replace(/^[a-z]*\\n/, "").replace(/\\n$/, "")) + "</code></pre>";\n'
    '    const t = part.replace(/^\\n+|\\n+$/g, "");\n'
    '    return t ? "<span>" + inlineHTML(t).replace(/\\n/g, "<br>") + "</span>" : "";\n'
    '  }).join("");\n'
    '}')
sub('document.getElementById("quizQuestionText").textContent = q.q;', 'document.getElementById("quizQuestionText").innerHTML = qHTML(q.q);')
sub('b.className = "option"; b.textContent = text;', 'b.className = "option"; b.innerHTML = inlineHTML(text);')
sub('ex.textContent = q.e; ex.hidden = false;', 'ex.innerHTML = inlineHTML(q.e); ex.hidden = false;')
sub('"Your answer: " + escapeHtml(l.chosen);', '"Your answer: " + inlineHTML(l.chosen);')
sub('<div class="q">${escapeHtml(l.q.q)}</div>', '<div class="q">${qHTML(l.q.q)}</div>')
sub('<div class="right">Correct: ${escapeHtml(l.rightText)}</div>', '<div class="right">Correct: ${inlineHTML(l.rightText)}</div>')
sub('`<div class="why">${escapeHtml(l.q.e)}</div>`', '`<div class="why">${inlineHTML(l.q.e)}</div>`')
# reading code takes longer than reading a sentence
sub('  return Math.max(10, Math.min(25, Math.round(4 + words / 3)));',
    '  const codeLines = (q.q.split("```")[1] || "").split("\\n").filter(Boolean).length;\n'
    '  return Math.max(10, Math.min(codeLines ? 45 : 25, Math.round(4 + words / 3 + codeLines * 2)));')

# ---- names, storage keys and labels ----
src = src.replace("mmauto_", "mmdev_")
sub("<title>Mad Minute Auto</title>", "<title>Mad Minute Dev</title>")
src = src.replace('content="MM Auto"', 'content="MM Dev"')
src = re.sub(r'<meta name="description" content="[^"]*">',
             '<meta name="description" content="Mad Minute Dev: one-minute drills from first code to junior full-stack and DevOps. A Mana Industries product.">', src, count=1)
sub('<small class="auto-tag">AUTO</small>', '<small class="auto-tag">DEV</small>')
sub('<span id="subjectName">Electrical</span>', '<span id="subjectName">Vocabulary</span>')
sub('Shop path · step <span id="pathStepNum">', 'Dev path · step <span id="pathStepNum">')
sub('aria-label="Shop path steps"', 'aria-label="Dev path steps"')
sub("Mad Minute Auto · © 2026 Mana Industries LLC. All rights reserved.", "Mad Minute Dev · © 2026 Mana Industries LLC. All rights reserved.")
src = src.replace('id="homeRank">Trainee<', 'id="homeRank">Newcomer<').replace('id="profRank">Trainee<', 'id="profRank">Newcomer<')
src = src.replace("Crew overview", "Team overview")
src = src.replace("Preview with sample crew", "Preview with sample team").replace("Show my real crew", "Show my real team")
src = src.replace("Other crew members can't see them.", "Other team members can't see them.")
src = src.replace(">Crew</button>", ">Team</button>")
sub('"Demo build · not for resale · progress is saved on this device · works offline once loaded"',
    '"Personal build · progress is saved on this device · works offline once loaded"')
# no DEMO watermark on the learning app
a = src.index('<div id="demoWatermark"'); b = src.index("</div>", a) + 6
src = src[:a] + src[b:]

# ---- smart jump: suggest Git, Back-End or DevOps when you're fast and right on that kind of question ----
a = src.index("  var TARGETS = [")
b = src.index("  ];", a) + 4
src = src[:a] + r'''  var TARGETS = [
    { pack: "git", label: "Git", from: ["vocab", "fund", "dbg", "real"],
      topics: ["Tools & Workflow Terms"],
      words: /\b(git|commits?|branch(es)?|merg(e|ed|ing)|pull requests?|repo(sitory|sitories)?|version control)\b/i,
      acronyms: /\b(PRs?)\b/ },
    { pack: "back", label: "back-end", from: ["vocab", "fund", "front", "dbg", "real"],
      topics: ["Data & Database Terms"],
      words: /\b(SQL|databases?|servers?|endpoints?|API|quer(y|ies)|status codes?|tables?|rows?)\b/i,
      acronyms: /\b(REST|CRUD|HTTP|JSON|ORM)\b/ },
    { pack: "ops", label: "DevOps", from: ["vocab", "fund", "back", "full", "git", "real"],
      topics: ["Ops & Cloud Terms"],
      words: /\b(linux|shell|terminal|docker|containers?|kubernetes|pods?|clusters?|pipelines?|deploy\w*|logs?|monitoring)\b/i,
      acronyms: /\b(CI|CD|K8s|SSH|DNS|VM)\b/ }
  ];''' + src[b:]
sub('var SKIP_TOPICS = ["Shop Safety"];   // safety questions mention batteries and wires but aren\'t electrical skill',
    'var SKIP_TOPICS = [];')
sub("Watches for a tech who answers a run of electrical, network, or high-voltage style questions",
    "Watches for a learner who answers a run of Git, back-end or DevOps style questions")

# ---- sample team for previewing the manager view ----
a = src.index("const SAMPLE_CREW = (() => {")
b = src.index("})();", a) + 5
src = src[:a] + r'''const SAMPLE_CREW = (() => {
  const FUND = ["Variables & Types", "Conditions & Loops", "Functions", "Arrays & Objects", "Strings & Text", "Classes & Modules"];
  const GIT = ["Git Basics", "Commits & History", "Branches & Merging", "Fixing Mistakes", "Remotes & GitHub", "Team Workflow"];
  const lvN = ["Beginner", "Junior", "Intermediate", "Senior"];
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
    mk("Jordan", [12, 9, 0, 15, 11, 0, 0], 4, {
      fund: pk("Programming Fundamentals", FUND, "Junior", [4, 3, 2, 2, 1, 0],
        [{ t: "Functions", misses: 4, level: 2 }],
        [{ q: "What does a function return if it has no return statement (JavaScript)?", t: "Functions", lv: 1, a: "undefined", e: "Python returns None in the same case.", n: 3 }]),
      git: pk("Git & Version Control", GIT, "Beginner", [2, 1, 0, 0, 0, 0],
        [{ t: "Branches & Merging", misses: 3, level: 1 }],
        [{ q: "A merge conflict happens when:", t: "Branches & Merging", lv: 2, a: "Both branches changed the same lines differently", e: "Git can't guess which version is right, so it asks you to choose.", n: 3 }]) }),
    mk("Priya", [20, 18, 22, 0, 16, 10, 0], 9, {
      fund: pk("Programming Fundamentals", FUND, "Intermediate", [4, 4, 4, 3, 3, 2], [], []),
      git: pk("Git & Version Control", GIT, "Junior", [4, 3, 2, 2, 1, 1],
        [{ t: "Fixing Mistakes", misses: 2, level: 2 }],
        [{ q: "Which undo is safe on a branch others have pulled?", t: "Fixing Mistakes", lv: 2, a: "git revert", e: "revert adds a new commit instead of rewriting history.", n: 2 }]) }),
    mk("Sam", [0, 5, 0, 0, 6, 0, 0], 0, {
      fund: pk("Programming Fundamentals", FUND, "Beginner", [2, 1, 1, 0, 0, 0],
        [{ t: "Conditions & Loops", misses: 5, level: 1 }],
        [{ q: "What does break do inside a loop?", t: "Conditions & Loops", lv: 2, a: "Exits the loop immediately", e: "continue skips to the next pass; break leaves the loop entirely.", n: 4 }]) })
  ];
})();''' + src[b:]

# ---- shared learning layer (Recall first, Skills checkup, Roadmap) lives in /shared/, loaded by every app ----
marker = "<script>\n/* ===== Standalone demo layer ====="
sub('<link rel="stylesheet" href="shared/mm-learn.css', '<link rel="stylesheet" href="../shared/mm-learn.css')
sub('<script>window.MM_LEARN = { recall: "off" };</script>', '<script>window.MM_LEARN = { recall: "on" };</script>')
sub('<script src="shared/mm-learn.js', '<script src="../shared/mm-learn.js')
# leftovers that would look wrong in the Dev app
for bad in ["Mad Minute Auto", "mmauto_", "Shop path"]:
    assert bad not in src, bad

os.makedirs(os.path.join(REPO, "dev"), exist_ok=True)
open(os.path.join(REPO, "dev", "index.html"), "w", encoding="utf-8").write(src)
print("wrote dev/index.html", len(src), "bytes,", total, "questions,", len(PATH), "path steps")
