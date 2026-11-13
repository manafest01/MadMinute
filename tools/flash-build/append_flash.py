"""Add vocab flashcards from a content module to a deck in flashcards/<pack>.js.

Usage:  python3 append_flash.py <repo_dir> <pack_id> <content_module> [--max 40]
  content_module: a .py file in this folder with CARDS = {topicKey: [[term, meaning, tip], ...]}

- Keeps every existing card and its order (easy words first), then adds new ones at the end of each topic.
- Skips a card whose term already exists anywhere in that pack's deck (case-insensitive).
- Stops each topic at --max cards (default 40) and reports anything left over.
- Rewrites the deck file in the same format. Needs node (to read the existing JS deck).
Then bump the deck's ?v= in index.html and sw.js, and sw.js VERSION (AGENTS.md rule 1)."""
import importlib.util, json, os, re, subprocess, sys


def read_deck(path, pack):
    js = ("global.window={};require(%s);process.stdout.write(JSON.stringify(window.MM_FLASH_DECKS[%s]))"
          % (json.dumps(os.path.abspath(path)), json.dumps(pack)))
    return json.loads(subprocess.check_output(["node", "-e", js]))


def main():
    repo, pack, mod = sys.argv[1], sys.argv[2], sys.argv[3]
    cap = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 40
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location("content", os.path.join(here, mod if mod.endswith(".py") else mod + ".py"))
    content = importlib.util.module_from_spec(spec); spec.loader.exec_module(content)

    path = os.path.join(repo, "flashcards", pack + ".js")
    src = open(path, encoding="utf-8").read()
    header = re.match(r"\s*(/\*.*?\*/)", src, re.S)
    header = header.group(1) if header else "/* Vocab flashcards. Row = [term, plain meaning, shop tip]. Easy words first. */"
    deck = read_deck(path, pack)
    have = {r[0].strip().lower() for rows in deck.values() for r in rows}

    added, skipped, over = 0, [], []
    for key, rows in content.CARDS.items():
        if key not in deck:
            sys.exit("Topic key %r is not in %s" % (key, path))
        for r in rows:
            if len(r) != 3 or not all(isinstance(x, str) and x.strip() for x in r):
                sys.exit("Bad row in %s: %r" % (key, r))
            t = r[0].strip().lower()
            if t in have:
                skipped.append(r[0]); continue
            if len(deck[key]) >= cap:
                over.append(key + ": " + r[0]); continue
            deck[key].append([x.strip() for x in r]); have.add(t); added += 1

    out = [header, "(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {})." + pack + " = {"]
    keys = list(deck.keys())
    for i, k in enumerate(keys):
        out.append(k + ": [")
        rows = deck[k]
        for j, r in enumerate(rows):
            out.append("  " + json.dumps(r, ensure_ascii=False) + ("," if j < len(rows) - 1 else ""))
        out.append("]" + ("," if i < len(keys) - 1 else ""))
    out.append("};")
    open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")

    print("%s: added %d" % (pack, added), {k: len(v) for k, v in deck.items()})
    if skipped: print("  skipped (term already in deck):", "; ".join(skipped))
    if over: print("  over the %d cap, not added:" % cap, "; ".join(over))


if __name__ == "__main__":
    main()
