"""Parse the plain-text question files into Mad Minute raw rows and check them.

File format:
  @pack <id>
  # <topicKey> <level>
  Q: question text (may continue on more lines, including ``` code fences)
  A: correct answer
  W: wrong answer (three of them)
  E: explanation
"""
import sys, json, glob, os, collections

def parse(path):
    pack, key, lv = None, None, None
    rows, cur, mode = [], None, None
    def flush():
        nonlocal cur
        if cur:
            cur["q"] = cur["q"].strip("\n")
            rows.append(cur)
        cur = None
    for n, line in enumerate(open(path, encoding="utf-8").read().split("\n"), 1):
        if line.startswith("@pack"):
            pack = line.split()[1]; continue
        if line.startswith("# ") and mode != "q":
            flush(); _, key, lv = line.split(); lv = int(lv); continue
        if line.startswith("Q: "):
            flush(); cur = {"k": key, "lv": lv, "q": line[3:], "a": None, "w": [], "e": "", "line": n}; mode = "q"; continue
        if line.startswith("A: ") and cur:
            cur["a"] = line[3:].strip(); mode = None; continue
        if line.startswith("W: ") and cur:
            cur["w"].append(line[3:].strip()); continue
        if line.startswith("E: ") and cur:
            cur["e"] = line[3:].strip(); continue
        if mode == "q" and cur is not None:
            cur["q"] += "\n" + line
    flush()
    return pack, rows

def check(path, rows):
    errs = []
    seen = set()
    for r in rows:
        where = f"{os.path.basename(path)}:{r['line']}"
        if not r["a"]: errs.append(f"{where} no answer")
        if len(r["w"]) != 3: errs.append(f"{where} has {len(r['w'])} wrong answers")
        opts = [r["a"]] + r["w"]
        if len(set(opts)) != len(opts): errs.append(f"{where} duplicate options")
        if not r["e"]: errs.append(f"{where} no explanation")
        if r["lv"] not in (1, 2, 3, 4): errs.append(f"{where} bad level")
        if r["q"].count("```") % 2: errs.append(f"{where} unclosed code fence")
        if r["q"] in seen: errs.append(f"{where} duplicate question")
        seen.add(r["q"])
    return errs

if __name__ == "__main__":
    total = 0
    for path in sorted(glob.glob(sys.argv[1] + "/*.txt")):
        pack, rows = parse(path)
        errs = check(path, rows)
        c = collections.Counter((r["k"], r["lv"]) for r in rows)
        thin = [f"{k}{l}:{c[(k,l)]}" for (k, l) in sorted(c) if c[(k, l)] < 4]
        keys = sorted(set(r["k"] for r in rows))
        missing = [f"{k}{l}" for k in keys for l in range(1, 5) if (k, l) not in c]
        total += len(rows)
        print(f"{pack}: {len(rows)} questions, topics {keys}", "THIN " + " ".join(thin) if thin else "", "MISSING " + " ".join(missing) if missing else "")
        for e in errs: print("  ", e)
    print("total", total)
