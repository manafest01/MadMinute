/* ===== Mad Minute Auto extras =====
   Add-on for the Auto app only (same pattern as Smart jump and shared/mm-learn.js):
   it hooks the engine from outside, so the core engine code stays untouched.

   1) Vocabulary: flashcard decks for every topic (data in extras/vocab/*.js).
      - Spaced repeat: "Got it" pushes a card further out (1, 3, 7, 21, 60 days); "Again" brings it back now.
      - Tappable terms: key words in quiz questions get a dotted underline; tap for a quick definition.
        Before you answer, a term is left plain if its definition would give the answer away.
      - My Weak Words: terms tied to a question you missed (or a card you marked Again) collect here.
        Three "Got it"s in a row and a word graduates out.
   2) Diagnostic labs: Circuit Lab (12 V circuit + meter) and CAN bus Lab (scope + meter),
      each with Learn mode and a Quiz mode that pays XP.

   Saved on the device under mmauto_vocab_srs, mmauto_vocab_weak and mmauto_labs.
   To remove: delete the lines in index.html that load extras/. */
(function () {
  "use strict";
  if (typeof BUILTIN_PACKS === "undefined" || !document.getElementById("homeScreen")) return;
  var VOCAB = window.MM_VOCAB || {};
  var DAY = 86400000, BOX_DAYS = [0, 1, 3, 7, 21, 60];
  var SRS_KEY = "mmauto_vocab_srs", WEAK_KEY = "mmauto_vocab_weak", LAB_KEY = "mmauto_labs";
  var esc = function (s) { return escapeHtml(s); };
  function load(k, d) { try { return JSON.parse(localStorage.getItem(k) || "null") || d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function packById(id) { return BUILTIN_PACKS.find(function (p) { return p.id === id; }); }

  /* ================= vocabulary data ================= */
  var CARDS = {};          // id -> card
  var DECKS = {};          // packId -> [{key, name, cards}]
  BUILTIN_PACKS.forEach(function (p) {
    var v = VOCAB[p.id]; if (!v) return;
    DECKS[p.id] = (p.order || Object.keys(p.topics)).filter(function (k) { return p.topics[k] && v[k]; }).map(function (k) {
      var cards = v[k].map(function (r) {
        var c = { id: p.id + "|" + k + "|" + r[0], pack: p.id, topic: k, term: r[0], def: r[1], alt: r[2] || [] };
        CARDS[c.id] = c; return c;
      });
      return { key: k, name: p.topics[k], cards: cards };
    });
  });
  function deckOf(c) { var p = packById(c.pack); return (p ? (p.short || p.name) + " · " : "") + (p ? p.topics[c.topic] : ""); }

  // phrases for linking terms inside question text, longest first
  var NO_LINK = ["voltage", "current", "resistance", "load", "ground", "bus", "module", "node", "pack", "cell", "cells", "recall",
    "offset", "rotation", "interval", "terminal", "corrosion", "series", "frame", "valve", "valves", "dominant", "recessive", "floating",
    "balancing", "bonding", "regen", "precharge", "ringing", "termination", "stub", "differential", "commander", "responder", "master"];
  var PHRASES = [];
  (function () {
    var seen = {};
    Object.keys(CARDS).forEach(function (id) {
      var c = CARDS[id];
      [c.term].concat(c.alt).forEach(function (ph) {
        var low = ph.toLowerCase();
        if (ph.length < 2 || NO_LINK.indexOf(low) >= 0) return;
        var acr = /^[A-Z0-9][A-Z0-9 /$.\-]*$/.test(ph) && /[A-Z]/.test(ph);
        var key = (acr ? ph : low) + "|" + c.pack;
        if (seen[key]) return; seen[key] = 1;
        var src = ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
        var plural = acr || /[sx]$/i.test(ph) ? "" : "(?:s|es)?";
        PHRASES.push({ card: c, len: ph.length, re: new RegExp("(^|[^A-Za-z0-9])(" + src + plural + ")(?=$|[^A-Za-z0-9])", acr ? "g" : "gi") });
      });
    });
    PHRASES.sort(function (a, b) { return b.len - a.len; });
  })();

  /* ================= spaced repeat + weak words ================= */
  var srs = load(SRS_KEY, {}), weak = load(WEAK_KEY, {});
  function isDue(c, now) { var s = srs[c.id]; return !s || s.d <= now; }
  function isNew(c) { return !srs[c.id]; }
  function gotIt(c) {
    var s = srs[c.id] || { b: 0, d: 0 };
    s.b = Math.min(5, s.b + 1); s.d = Date.now() + BOX_DAYS[s.b] * DAY; srs[c.id] = s;
    if (weak[c.id]) { weak[c.id].s = (weak[c.id].s || 0) + 1; if (weak[c.id].s >= 3) delete weak[c.id]; }
    save(SRS_KEY, srs); save(WEAK_KEY, weak);
  }
  function again(c) {
    srs[c.id] = { b: 0, d: Date.now() };
    addWeak(c.id, "card");
    save(SRS_KEY, srs);
  }
  function addWeak(id, src) {
    if (!CARDS[id]) return false;
    var had = !!weak[id];
    weak[id] = { at: Date.now(), s: 0, src: src };
    save(WEAK_KEY, weak);
    return !had;
  }
  function weakCards() {
    return Object.keys(weak).filter(function (id) { return CARDS[id]; })
      .sort(function (a, b) { return weak[b].at - weak[a].at; }).map(function (id) { return CARDS[id]; });
  }
  function dueCount(cards) { var now = Date.now(); return cards.filter(function (c) { return !isNew(c) && isDue(c, now); }).length; }
  function newCount(cards) { return cards.filter(isNew).length; }

  /* ================= linking terms in text ================= */
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim(); }
  function spoils(c, q) {
    if (!q) return false;
    var ans = norm(q.o[q.a]), def = norm(c.def), names = [c.term].concat(c.alt).map(norm);
    if (!ans) return false;
    if (names.some(function (n) { return n && (ans.indexOf(n) >= 0 || n.indexOf(ans) >= 0); })) return true;
    if (ans.length >= 4 && def.indexOf(ans) >= 0) return true;
    var words = ans.split(" ").filter(function (w) { return w.length > 3; });
    if (words.length >= 2) {
      var hit = words.filter(function (w) { return def.indexOf(w) >= 0; }).length;
      if (hit / words.length >= 0.6) return true;
    }
    return false;
  }
  // returns HTML with up to `max` tappable terms
  function linkify(text, opts) {
    text = String(text == null ? "" : text);
    opts = opts || {};
    var pack = currentPack ? currentPack.id : "";
    var spans = [], used = {};
    var list = PHRASES.filter(function (p) { return p.card.pack === pack; }).concat(PHRASES.filter(function (p) { return p.card.pack !== pack; }));
    for (var i = 0; i < list.length && spans.length < (opts.max || 3); i++) {
      var ph = list[i], c = ph.card;
      if (used[c.term.toLowerCase()]) continue;
      if (opts.guard && spoils(c, opts.guard)) continue;
      ph.re.lastIndex = 0;
      var m;
      while ((m = ph.re.exec(text))) {
        var s = m.index + m[1].length, e = s + m[2].length;
        if (spans.some(function (x) { return s < x.e && e > x.s; })) continue;
        spans.push({ s: s, e: e, card: c }); used[c.term.toLowerCase()] = 1; break;
      }
    }
    if (!spans.length) return null;
    spans.sort(function (a, b) { return a.s - b.s; });
    var out = "", at = 0;
    spans.forEach(function (x) {
      out += esc(text.slice(at, x.s)) + '<button type="button" class="vt" data-card="' + esc(x.card.id) + '">' + esc(text.slice(x.s, x.e)) + "</button>";
      at = x.e;
    });
    return out + esc(text.slice(at));
  }
  function linkEl(el, text, opts) {
    if (!el) return;
    var html = linkify(text, opts);
    if (html) el.innerHTML = html;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".vt");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    openTerm(CARDS[b.getAttribute("data-card")]);
  }, true);

  // quick-definition sheet
  var sheet = document.createElement("div");
  sheet.className = "sheet-back"; sheet.hidden = true; sheet.id = "vtSheet";
  sheet.innerHTML = '<div class="sheet" role="dialog" aria-labelledby="vtTerm">' +
    '<div class="eyebrow" id="vtDeck"></div><h3 class="vt-term" id="vtTerm"></h3><div class="vt-def" id="vtDef"></div>' +
    '<div class="row-btns"><button class="btn btn-ghost" id="vtWeak">Add to My Weak Words</button><button class="btn btn-teal" id="vtClose">Got it</button></div></div>';
  document.body.appendChild(sheet);
  var sheetCard = null, sheetPaused = null;
  function openTerm(c) {
    if (!c) return;
    sheetCard = c;
    document.getElementById("vtDeck").textContent = deckOf(c);
    document.getElementById("vtTerm").textContent = c.term;
    document.getElementById("vtDef").textContent = c.def;
    var wb = document.getElementById("vtWeak");
    wb.textContent = weak[c.id] ? "In My Weak Words" : "Add to My Weak Words"; wb.disabled = !!weak[c.id];
    if (typeof quiz !== "undefined" && quiz && sheetPaused === null) { sheetPaused = !!quiz.paused; quiz.paused = true; if (quiz.cur) quiz.cur.lookedUp = true; }
    sheet.hidden = false;
    document.getElementById("vtClose").focus();
  }
  function closeTerm() {
    sheet.hidden = true;
    if (typeof quiz !== "undefined" && quiz && sheetPaused !== null) quiz.paused = sheetPaused;
    sheetPaused = null;
  }
  document.getElementById("vtClose").onclick = closeTerm;
  document.getElementById("vtWeak").onclick = function () {
    if (sheetCard && addWeak(sheetCard.id, "lookup")) showToast("Added to My Weak Words");
    closeTerm();
  };
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeTerm(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !sheet.hidden) closeTerm(); });

  /* ================= screens ================= */
  function addScreen(id) {
    var s = document.createElement("section");
    s.id = id; s.hidden = true;
    var home = document.getElementById("homeScreen");
    home.parentNode.insertBefore(s, home.nextSibling);
    SCREENS.push(id);
    if (typeof TAB_FOR !== "undefined") TAB_FOR[id] = "homeScreen";
    return s;
  }
  var vocabScreen = addScreen("vocabScreen"), cardScreen = addScreen("cardScreen"), labsScreen = addScreen("labsScreen");

  // home card: Vocabulary + Diagnostic labs
  var ICON_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="5" width="13" height="15" rx="2"/><path d="M8 5V3h12v15h-3M8 10h5M8 14h5"/></svg>';
  var ICON_LAB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>';
  var home = document.createElement("div");
  home.className = "card xtra-card"; home.id = "xtraCard";
  home.innerHTML =
    '<button class="xtra-row" id="xtraVocab"><span class="xtra-ico">' + ICON_BOOK + '</span><span style="flex:1;min-width:0;"><span class="eyebrow" style="display:block;">Flashcards</span><span class="xtra-title">Vocabulary</span><span class="muted" style="display:block;" id="xtraVocabMeta"></span></span><span class="xtra-go" aria-hidden="true">›</span></button>' +
    '<button class="xtra-row" id="xtraLabs"><span class="xtra-ico amber">' + ICON_LAB + '</span><span style="flex:1;min-width:0;"><span class="eyebrow" style="display:block;">Hands-on diagnosis</span><span class="xtra-title">Diagnostic labs</span><span class="muted" style="display:block;">Circuit Lab and CAN bus Lab: tap test points, read the meter and scope, find the fault</span></span><span class="xtra-go" aria-hidden="true">›</span></button>';
  var crewCard = document.getElementById("crewCard");
  crewCard.parentNode.insertBefore(home, crewCard);
  document.getElementById("xtraVocab").onclick = function () { showVocab(); };
  document.getElementById("xtraLabs").onclick = function () { showLabs(); };
  function renderXtraCard() {
    var decks = DECKS[currentPack && currentPack.id] || [];
    var all = [].concat.apply([], decks.map(function (d) { return d.cards; }));
    var due = dueCount(all), wk = weakCards().length;
    document.getElementById("xtraVocab").hidden = !all.length && !wk;
    document.getElementById("xtraVocabMeta").textContent = all.length
      ? all.length + " terms in " + (currentPack.short || currentPack.name) + (due ? " · " + due + " due" : "") + (wk ? " · " + wk + " weak words" : "")
      : wk + " weak words";
  }

  /* ---------- vocabulary screen ---------- */
  function showVocab() {
    show("vocabScreen");
    var decks = DECKS[currentPack.id] || [];
    var all = [].concat.apply([], decks.map(function (d) { return d.cards; }));
    var wk = weakCards();
    var h = '<div class="back-row"><button class="icon-btn" data-act="home" aria-label="Back">←</button><h2>Vocabulary</h2></div><div class="stack">';
    h += '<div class="card stack"><div class="eyebrow">My Weak Words · all subjects</div>';
    if (wk.length) {
      h += '<div class="muted">Words from questions you missed and cards you marked Again. Get one right 3 times in a row and it graduates out.</div>' +
        '<div class="weak-chips">' + wk.slice(0, 12).map(function (c) { return '<button class="weak-chip vt" data-card="' + esc(c.id) + '">' + esc(c.term) + "</button>"; }).join("") +
        (wk.length > 12 ? '<span class="muted" style="align-self:center;">+' + (wk.length - 12) + " more</span>" : "") + "</div>" +
        '<button class="btn btn-amber btn-block" data-act="weak">Study ' + wk.length + " weak word" + (wk.length === 1 ? "" : "s") + "</button>";
    } else {
      h += '<div class="muted">Empty for now. When you miss a quiz question, its key terms land here so you can drill them.</div>';
    }
    h += "</div>";
    if (all.length) {
      var due = dueCount(all), nw = newCount(all);
      h += '<div class="card stack"><div class="eyebrow">' + esc(currentPack.short || currentPack.name) + " · " + all.length + " terms</div>" +
        '<div class="muted">' + (due ? due + " cards due for review. " : "Nothing due right now. ") + nw + " new. Switch subjects to see other decks.</div>" +
        ((due || nw) ? '<button class="btn btn-teal btn-block" data-act="subject">Study due and new cards</button>' : "") +
        '<div class="deck-list">' + decks.map(function (d) {
          var dd = dueCount(d.cards), dn = newCount(d.cards);
          return '<div class="deck"><div class="deck-info"><div class="deck-name">' + (dd ? '<span class="due-dot"></span>' : "") + esc(d.name) + '</div><div class="muted">' +
            d.cards.length + " terms" + (dd ? " · " + dd + " due" : "") + (dn ? " · " + dn + " new" : "") + "</div></div>" +
            '<button class="btn btn-ghost" data-act="deck" data-key="' + esc(d.key) + '">Study</button></div>';
        }).join("") + "</div></div>";
    }
    h += "</div>";
    vocabScreen.innerHTML = h;
  }
  vocabScreen.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.getAttribute("data-act");
    if (act === "home") showHome();
    else if (act === "weak") startCards("My Weak Words", weakCards(), { all: true });
    else if (act === "subject") {
      var all = [].concat.apply([], (DECKS[currentPack.id] || []).map(function (d) { return d.cards; }));
      startCards((currentPack.short || currentPack.name) + " · due and new", all);
    } else if (act === "deck") {
      var d = (DECKS[currentPack.id] || []).find(function (x) { return x.key === b.getAttribute("data-key"); });
      if (d) startCards(d.name, d.cards);
    }
  });

  /* ---------- flashcards ---------- */
  var fc = null;
  function startCards(title, cards, opt) {
    opt = opt || {};
    var now = Date.now(), queue;
    if (opt.all) queue = shuffle(cards.slice());
    else {
      var due = cards.filter(function (c) { return !isNew(c) && isDue(c, now); }).sort(function (a, b) { return srs[a.id].b - srs[b.id].b; });
      queue = due.concat(cards.filter(isNew));
    }
    fc = { title: title, cards: cards, queue: queue, i: 0, flipped: false, got: 0, again: 0, reps: {} };
    show("cardScreen");
    renderCard();
  }
  function renderCard() {
    var h = '<div class="fc-top"><button class="icon-btn" data-act="close" aria-label="Close">←</button><div style="flex:1;min-width:0;"><b>' + esc(fc.title) + "</b></div>" +
      '<div class="fc-count">' + (fc.queue.length ? Math.min(fc.i + 1, fc.queue.length) + " of " + fc.queue.length : "") + "</div></div>";
    if (!fc.queue.length) {
      var next = fc.cards.map(function (c) { return srs[c.id] ? srs[c.id].d : 0; }).filter(Boolean).sort()[0];
      var days = next ? Math.max(1, Math.ceil((next - Date.now()) / DAY)) : 0;
      h += '<div class="card stack"><h3>All caught up</h3><div class="muted">Nothing is due in this deck' + (days ? ". The next card comes back in " + days + " day" + (days === 1 ? "" : "s") + "." : ".") + ' You can still run through every card.</div>' +
        '<button class="btn btn-teal btn-block" data-act="all">Practice all ' + fc.cards.length + " cards</button></div>";
    } else if (fc.i >= fc.queue.length) {
      h += '<div class="card stack"><h3>Deck done</h3><div class="muted">' + fc.got + " got it · " + fc.again + " again. Cards you got come back in a few days; the ones you missed come back first.</div>" +
        '<div class="row-btns"><button class="btn btn-ghost" data-act="all">Practice all again</button><button class="btn btn-teal" data-act="vocab">Back to vocabulary</button></div></div>';
    } else {
      var c = fc.queue[fc.i];
      h += '<div class="fc-bar"><i style="width:' + Math.round(fc.i / fc.queue.length * 100) + '%"></i></div>' +
        '<button class="fc' + (fc.flipped ? " flip" : "") + '" data-act="flip" aria-label="' + (fc.flipped ? "Definition" : "Tap to show the definition") + '">' +
        '<div class="fc-deck">' + esc(deckOf(c)) + (weak[c.id] ? " · weak word" : "") + "</div>" +
        '<div class="fc-term">' + esc(c.term) + "</div>" +
        (fc.flipped ? '<div class="fc-def">' + esc(c.def) + "</div>" : '<div class="fc-hint">Say what it means, then tap to check</div>') + "</button>" +
        (fc.flipped
          ? '<div class="fc-btns"><button class="btn btn-again" data-act="again">Again</button><button class="btn btn-teal" data-act="got">Got it</button></div>'
          : '<button class="btn btn-ghost btn-block" style="margin-top:14px;" data-act="flip">Show definition</button>');
    }
    cardScreen.innerHTML = h;
  }
  cardScreen.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b || !fc) return;
    var act = b.getAttribute("data-act"), c = fc.queue[fc.i];
    if (act === "close" || act === "vocab") { fc = null; showVocab(); return; }
    if (act === "all") { startCards(fc.title, fc.cards, { all: true }); return; }
    if (act === "flip") { fc.flipped = !fc.flipped; renderCard(); return; }
    if (act === "got" && c) { gotIt(c); fc.got++; fc.i++; fc.flipped = false; renderCard(); }
    if (act === "again" && c) {
      again(c); fc.again++;
      fc.reps[c.id] = (fc.reps[c.id] || 0) + 1;
      if (fc.reps[c.id] <= 2) fc.queue.splice(Math.min(fc.i + 4, fc.queue.length), 0, c);   // see it again in a few cards
      fc.i++; fc.flipped = false; renderCard();
    }
  });
  document.addEventListener("keydown", function (e) {
    if (cardScreen.hidden || !fc || !sheet.hidden) return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); fc.flipped = !fc.flipped; renderCard(); }
    else if (fc.flipped && (e.key === "1" || e.key === "ArrowLeft")) cardScreen.querySelector('[data-act="again"]').click();
    else if (fc.flipped && (e.key === "2" || e.key === "ArrowRight")) cardScreen.querySelector('[data-act="got"]').click();
  });

  /* ---------- hooks into the quiz ---------- */
  try {
    var origRenderQuestion = renderQuestion;
    renderQuestion = function () {
      var r = origRenderQuestion.apply(this, arguments);
      try { if (quiz && quiz.cur && quiz.mode !== "placement" && quiz.mode !== "checkup") linkEl(document.getElementById("quizQuestionText"), quiz.cur.q.q, { guard: quiz.cur.q }); } catch (e) {}
      return r;
    };
    var origAnswer = answer;
    answer = function () {
      var cur = quiz && quiz.cur;
      var r = origAnswer.apply(this, arguments);
      try {
        if (cur && quiz && quiz.mode !== "placement" && quiz.mode !== "checkup") {
          linkEl(document.getElementById("quizQuestionText"), cur.q.q, { max: 3 });
          var ex = document.getElementById("quizExplain");
          var tn = ex.firstChild;
          if (!ex.hidden && cur.q.e && tn && tn.nodeType === 3) {     // only the explanation text; keep anything other add-ons appended
            var html = linkify(tn.nodeValue, { max: 3 });
            if (html) { var span = document.createElement("span"); span.innerHTML = html; ex.replaceChild(span, tn); }
          }
        }
      } catch (e) {}
      return r;
    };
    var origRecord = record;
    record = function (q, correct) {
      var r = origRecord.apply(this, arguments);
      try {
        if (!correct && quiz && quiz.mode !== "placement" && quiz.mode !== "checkup") {
          quiz.vocabNew = quiz.vocabNew || [];
          termsIn([q.q, q.o[q.a], q.e].join(" \n ")).forEach(function (c) {
            if (addWeak(c.id, "quiz") && quiz.vocabNew.indexOf(c.id) < 0) quiz.vocabNew.push(c.id);
          });
        }
      } catch (e) {}
      return r;
    };
    var origShowResults = showResults;
    showResults = function (Q) {
      var r = origShowResults.apply(this, arguments);
      try { renderResultWords(Q); } catch (e) {}
      return r;
    };
    var origRenderHome = renderHome;
    renderHome = function () { var r = origRenderHome.apply(this, arguments); try { renderXtraCard(); } catch (e) {} return r; };
  } catch (e) {}

  function termsIn(text) {
    var pack = currentPack ? currentPack.id : "", found = [];
    PHRASES.forEach(function (p) {
      if (p.card.pack !== pack || found.indexOf(p.card) >= 0) return;
      p.re.lastIndex = 0;
      if (p.re.test(text)) found.push(p.card);
    });
    return found.slice(0, 4);
  }

  // results: "New weak words" card
  var resWords = document.createElement("div");
  resWords.className = "card stack"; resWords.id = "resWords"; resWords.hidden = true;
  var missWrap = document.getElementById("resMissWrap");
  missWrap.parentNode.insertBefore(resWords, missWrap);
  function renderResultWords(Q) {
    var ids = (Q && Q.vocabNew) || [];
    resWords.hidden = !ids.length;
    if (!ids.length) return;
    resWords.innerHTML = '<div class="eyebrow">New in My Weak Words (' + ids.length + ")</div>" +
      '<div class="weak-chips">' + ids.map(function (id) { return '<button class="weak-chip vt" data-card="' + esc(id) + '">' + esc(CARDS[id].term) + "</button>"; }).join("") + "</div>" +
      '<button class="btn btn-ghost btn-block" id="resWordsGo">Study these words</button>';
    document.getElementById("resWordsGo").onclick = function () { startCards("New weak words", ids.map(function (id) { return CARDS[id]; }), { all: true }); };
  }

  /* ================= diagnostic labs ================= */
  var labs = load(LAB_KEY, { circuit: { r: 0, n: 0 }, can: { r: 0, n: 0 } });
  var L = { lab: "circuit", mode: "learn", scen: "work", sw: true, pt: 0, m: "", answered: false, streak: 0 };

  var CIRCUIT = {
    order: ["work", "open", "gnd", "short"],
    names: { work: "Working normally", open: "Open wire", gnd: "Bad ground", short: "Short to ground" },
    learn: { work: "Working", open: "Open wire", gnd: "Bad ground", short: "Short to ground" },
    R: { work: [12.6, 12.6, 12.5, 12.4, 0.1, 0], open: [12.6, 12.6, 12.6, 0, 0, 0], gnd: [12.6, 12.6, 12.5, 12.5, 4.8, 0], short: [12.6, 0, 0, 0, 0, 0] },
    T: {
      work: "Normal circuit. Full voltage right up to the bulb, almost nothing after it. The bulb uses up the voltage, which is what a load should do. Ground side under about 0.3 V means a good ground.",
      open: "Voltage at point 3, nothing at point 4: the break is between them. With no current flowing there's no voltage drop, so everything before the break reads full battery voltage.",
      gnd: "The bulb is dim. Point 5 should read near 0 V but shows 4.8 V. The corroded ground strap is eating that voltage. Clean or replace the ground, then retest.",
      short: "Fuse blown: 12.6 V on one side of the fuse, 0 V on the other. A new fuse will just blow again. A wire after the switch is rubbing through to ground. Find and repair the short first."
    },
    off: "Switch off. No current flows, so everything after the switch is pulled to 0 V through the bulb. Only points 1 and 2 show battery voltage."
  };
  var CAN = {
    order: ["work", "hg", "lb", "hl", "term"],
    names: { work: "Working normally", hg: "CAN-H shorted to ground", lb: "CAN-L shorted to battery", hl: "CAN-H and CAN-L shorted together", term: "Missing terminating resistor" },
    learn: { work: "Working", hg: "CAN-H to ground", lb: "CAN-L to battery", hl: "H and L shorted", term: "Missing terminator" },
    M: { work: ["2.6 V", "2.4 V", "60 Ω"], hg: ["0.0 V", "0.2 V", "60 Ω"], lb: ["12.2 V", "12.6 V", "60 Ω"], hl: ["2.5 V", "2.5 V", "0.3 Ω"], term: ["2.6 V", "2.4 V", "120 Ω"] },
    T: {
      work: "Mirror image. Both lines rest at 2.5 V. On each dominant bit, CAN-H rises to about 3.5 V while CAN-L drops to about 1.5 V. That 2 V difference is the data. The meter averages them to about 2.6 V and 2.4 V. Two 120 Ω terminators in parallel read 60 Ω.",
      hg: "CAN-H is stuck at 0 V and drags the bus down. No messages get through, so modules set U-codes (lost communication). The trap: H to L still reads a normal 60 Ω. To find this short, check each line for voltage or for a path to ground.",
      lb: "CAN-L is tied to battery voltage, so both lines sit near 12 V and the bus is dead. Any CAN line reading near battery voltage is the giveaway. H to L resistance still looks normal at 60 Ω.",
      hl: "CAN-H and CAN-L are touching. Both sit at 2.5 V with no difference between them, so no data can move. H to L reads nearly 0 Ω instead of 60 Ω.",
      term: "One 120 Ω terminating resistor is open or missing. The bus may still work, but the edges ring and overshoot because the signal bounces off the unterminated end. H to L reads 120 Ω instead of 60 Ω. A classic cause of intermittent U-codes."
    },
    note: "These are typical values for high-speed CAN (the most common kind). Real vehicles vary: always check the service information."
  };
  var BITS = [1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1];

  function showLabs() { show("labsScreen"); renderLabs(); }
  function labDef() { return L.lab === "circuit" ? CIRCUIT : CAN; }
  function newQuizScen() {
    var k = labDef().order, n;
    do { n = k[Math.floor(Math.random() * k.length)]; } while (n === L.scen && k.length > 1);
    L.scen = n; L.sw = true; L.pt = 0; L.m = ""; L.answered = false;
  }

  function circuitSVG(reveal) {
    var on = L.sw, fb = on && L.scen === "short";
    var lit = on && (L.scen === "work" || L.scen === "gnd");
    var bulb = lit ? (L.scen === "gnd" ? 'style="fill:var(--amber);fill-opacity:.4;stroke:var(--amber)"' : 'style="fill:var(--amber);stroke:var(--amber)"') : 'class="part"';
    var openShown = reveal && L.scen === "open";
    var tp = function (n, x, y) { return '<g class="tp' + (L.pt === n ? " sel" : "") + '" data-pt="' + n + '" role="button" tabindex="0" aria-label="Test point ' + n + '"><circle cx="' + x + '" cy="' + y + '" r="13"/><text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="central">' + n + "</text></g>"; };
    return '<svg class="lab-svg" viewBox="0 0 380 250" role="img" aria-label="12 volt circuit: battery, fuse, switch, bulb and ground strap, with six test points">' +
      '<path class="w" d="M50 105 L50 50 L105 50"/>' +
      '<rect x="105" y="42" width="36" height="16" rx="4" class="part"' + (fb ? ' style="stroke:var(--red)"' : "") + "/>" +
      (fb ? '<line x1="118" y1="38" x2="128" y2="62" class="fault"/>' : "") +
      '<path class="w" d="M141 50 L190 50"/><circle cx="190" cy="50" r="3" style="fill:var(--text-dim)"/>' +
      '<line x1="190" y1="50" x2="' + (on ? 228 : 224) + '" y2="' + (on ? 50 : 30) + '" class="w"/><circle cx="230" cy="50" r="3" style="fill:var(--text-dim)"/>' +
      '<path class="w" d="M230 50 L276 50"/><path class="w" d="M294 50 L320 50 L320 107"/>' +
      (openShown ? '<line x1="280" y1="42" x2="290" y2="58" class="fault"/><line x1="290" y1="42" x2="280" y2="58" class="fault"/>' : '<path class="w" d="M276 50 L294 50"/>') +
      (reveal && L.scen === "short" ? '<path d="M285 50 L280 60 L290 66 L280 72 L285 80" class="fault"/><line x1="275" y1="82" x2="295" y2="82" class="fault"/>' : "") +
      '<circle cx="320" cy="125" r="18" ' + bulb + "/>" +
      '<path class="w" d="M320 143 L320 200 L262 200"/>' +
      '<rect x="230" y="193" width="32" height="14" rx="3" class="part"' + (reveal && L.scen === "gnd" ? ' style="fill:var(--amber);fill-opacity:.55"' : "") + "/>" +
      '<path class="w" d="M230 200 L50 200 L50 145"/>' +
      '<rect x="34" y="105" width="32" height="40" rx="4" class="part"/>' +
      '<text class="lbl" x="50" y="118" text-anchor="middle" dominant-baseline="central">+</text><text class="lbl" x="50" y="134" text-anchor="middle" dominant-baseline="central">−</text>' +
      '<text class="lbl" x="74" y="125" dominant-baseline="central">Battery</text><text class="lbl" x="123" y="28" text-anchor="middle">Fuse</text>' +
      '<text class="lbl" x="210" y="20" text-anchor="middle">Switch</text><text class="lbl" x="294" y="125" text-anchor="end" dominant-baseline="central">Bulb</text>' +
      '<text class="lbl" x="246" y="228" text-anchor="middle">Ground strap</text>' +
      tp(1, 80, 50) + tp(2, 165, 50) + tp(3, 255, 50) + tp(4, 320, 80) + tp(5, 320, 170) + tp(6, 150, 200) + "</svg>";
  }
  function canLevel(rec, line) {
    if (L.scen === "hg") return line === "h" ? 0 : 0.2;
    if (L.scen === "lb") return line === "h" ? 12.2 : 12.6;
    if (L.scen === "hl") return 2.5;
    return rec ? 2.5 : (line === "h" ? 3.5 : 1.5);
  }
  function canTrace(line, vmax) {
    var y = function (v) { return (170 - v / vmax * 150).toFixed(1); }, prev = null, d = "";
    BITS.forEach(function (b, i) {
      var v = canLevel(b, line), x = 40 + i * 20;
      if (prev === null) d = "M" + x + " " + y(v);
      else {
        d += " L" + x + " " + y(prev) + " L" + x + " " + y(v);
        if (L.scen === "term" && prev !== v) {
          var ov = (v - prev) * 0.45;
          d += " L" + (x + 2) + " " + y(v + ov) + " L" + (x + 4) + " " + y(v - ov * 0.6) + " L" + (x + 6) + " " + y(v + ov * 0.3) + " L" + (x + 8) + " " + y(v);
        }
      }
      prev = v;
    });
    return d + " L360 " + y(prev);
  }
  function canSVG() {
    var vmax = L.scen === "lb" ? 15 : 5, g = "";
    for (var k = 1; k < 5; k++) g += '<line x1="40" y1="' + (20 + k * 30) + '" x2="360" y2="' + (20 + k * 30) + '" style="stroke:var(--line)"/>';
    for (var j = 1; j < 8; j++) g += '<line x1="' + (40 + j * 40) + '" y1="20" x2="' + (40 + j * 40) + '" y2="170" style="stroke:var(--line)"/>';
    return '<svg class="lab-svg" viewBox="0 0 380 200" role="img" aria-label="Scope showing CAN-H and CAN-L voltages over time">' +
      '<rect x="40" y="20" width="320" height="150" rx="4" style="fill:var(--panel-2);stroke:var(--line)"/>' + g +
      '<path d="' + canTrace("h", vmax) + '" style="fill:none;stroke:var(--amber);stroke-width:2.2"/>' +
      '<path d="' + canTrace("l", vmax) + '" style="fill:none;stroke:var(--teal);stroke-width:2.2;stroke-dasharray:5 3"/>' +
      '<text class="lbl" x="34" y="24" text-anchor="end" dominant-baseline="central">' + vmax + " V</text>" +
      '<text class="lbl" x="34" y="95" text-anchor="end" dominant-baseline="central">' + (vmax / 2).toFixed(1) + "</text>" +
      '<text class="lbl" x="34" y="170" text-anchor="end" dominant-baseline="central">0 V</text>' +
      '<text class="lbl" x="40" y="190">Time →</text></svg>';
  }
  function circuitReading(p) { if (!L.sw) return p <= 2 ? 12.6 : 0; return CIRCUIT.R[L.scen][p - 1]; }

  function renderLabs() {
    var D = labDef(), quizMode = L.mode === "quiz", reveal = !quizMode || L.answered, st = labs[L.lab];
    var h = '<div class="back-row"><button class="icon-btn" data-act="home" aria-label="Back">←</button><h2>Diagnostic labs</h2></div><div class="stack">';
    h += '<div class="seg" role="group" aria-label="Lab"><button data-lab="circuit" class="' + (L.lab === "circuit" ? "on" : "") + '">Circuit Lab</button><button data-lab="can" class="' + (L.lab === "can" ? "on" : "") + '">CAN bus Lab</button></div>';
    h += '<div class="seg seg-sm" role="group" aria-label="Mode"><button data-mode="learn" class="' + (!quizMode ? "on" : "") + '">Learn</button><button data-mode="quiz" class="' + (quizMode ? "on" : "") + '">Quiz</button></div>';
    if (L.lab === "circuit") {
      h += circuitSVG(reveal);
      h += '<div class="lab-meter"><span class="muted">' + (L.pt ? "Point " + L.pt : "Tap a numbered test point") + "</span><b>" + (L.pt ? circuitReading(L.pt).toFixed(1) + " V" : "-- V") + "</b></div>";
      h += '<div class="muted">Black meter lead is on battery negative. Tap points 1 to 6 to move the red lead.</div>';
    } else {
      h += canSVG();
      h += '<div class="lab-legend"><span><i></i>CAN-H (solid)</span><span><i class="l"></i>CAN-L (dashed)</span></div>';
      h += '<div class="lab-grid">' + [["vh", "Volts CAN-H"], ["vl", "Volts CAN-L"]].map(function (t) { return '<button class="btn btn-ghost' + (L.m === t[0] ? " on" : "") + '" data-meas="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>";
      h += '<button class="btn btn-ghost btn-block' + (L.m === "oh" ? " on" : "") + '" data-meas="oh" style="' + (L.m === "oh" ? "background:var(--teal-soft);border-color:var(--teal);" : "") + '">Ohms CAN-H to CAN-L</button>';
      var mi = { vh: 0, vl: 1, oh: 2 }[L.m];
      h += '<div class="lab-meter"><span class="muted">' + ({ vh: "CAN-H to ground", vl: "CAN-L to ground", oh: "CAN-H to CAN-L" }[L.m] || "Pick a meter test") + "</span><b>" + (L.m ? CAN.M[L.scen][mi] : "--") + "</b></div>";
      h += '<div class="muted">Volts: key on, black lead to ground. Ohms: key off, battery disconnected.</div>';
    }
    if (!quizMode) {
      h += '<div class="lab-grid">' + D.order.map(function (s) { return '<button class="btn btn-ghost' + (L.scen === s ? " on" : "") + '" data-scen="' + s + '">' + esc(D.learn[s]) + "</button>"; }).join("") + "</div>";
      if (L.lab === "circuit") h += '<button class="btn btn-ghost btn-block" data-act="sw">' + (L.sw ? "Turn switch off" : "Turn switch on") + "</button>";
      h += '<div class="card lab-explain">' + esc(L.lab === "circuit" && !L.sw ? CIRCUIT.off : D.T[L.scen]) + "</div>";
    } else {
      h += '<div class="muted"><b style="color:var(--text);">' + (L.lab === "circuit" ? "Probe the points" : "Read the scope and meter") + ', then name the fault.</b> +10 XP for each right answer.</div>';
      h += '<div class="lab-grid">' + D.order.map(function (s) {
        var cls = L.answered ? (s === L.scen ? " on" : "") : "";
        return '<button class="btn btn-ghost' + cls + '" data-ans="' + s + '"' + (L.answered ? " disabled" : "") + ">" + esc(D.names[s]) + "</button>";
      }).join("") + "</div>";
      if (L.answered) {
        h += '<div class="card lab-explain">' + (L.lastOk ? '<span class="ok">Correct. </span>' : '<span class="no">Not quite. It was: ' + esc(D.names[L.scen]) + ". </span>") + esc(D.T[L.scen]) + "</div>";
        h += '<button class="btn btn-amber btn-block" data-act="next">' + (L.lab === "circuit" ? "Next circuit" : "Next bus") + "</button>";
      }
      h += '<div class="muted">' + (st.n ? "Your record here: " + st.r + " of " + st.n + " right" : "No quiz answers yet") + (L.streak >= 2 ? " · " + L.streak + " in a row" : "") + "</div>";
    }
    if (L.lab === "can") h += '<div class="muted">' + esc(CAN.note) + "</div>";
    h += "</div>";
    labsScreen.innerHTML = h;
  }
  labsScreen.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act],[data-lab],[data-mode],[data-scen],[data-ans],[data-meas],[data-pt]");
    if (!t) return;
    var a;
    if ((a = t.getAttribute("data-act"))) {
      if (a === "home") { showHome(); return; }
      if (a === "sw") L.sw = !L.sw;
      if (a === "next") newQuizScen();
    } else if ((a = t.getAttribute("data-lab"))) {
      L.lab = a; L.scen = "work"; L.sw = true; L.pt = 0; L.m = ""; L.answered = false; L.streak = 0;
      if (L.mode === "quiz") newQuizScen();
    } else if ((a = t.getAttribute("data-mode"))) {
      L.mode = a; L.answered = false; L.pt = 0; L.m = "";
      if (a === "quiz") newQuizScen(); else { L.scen = "work"; L.sw = true; }
    } else if ((a = t.getAttribute("data-scen"))) { L.scen = a; L.pt = 0; L.m = ""; L.sw = true; }
    else if ((a = t.getAttribute("data-meas"))) L.m = a;
    else if ((a = t.getAttribute("data-pt"))) L.pt = +a;
    else if ((a = t.getAttribute("data-ans")) && !L.answered) {
      L.answered = true; L.lastOk = a === L.scen;
      var st = labs[L.lab]; st.n++;
      if (L.lastOk) {
        st.r++; L.streak++;
        var met = addXP(10);
        showToast(met ? "+10 XP · Daily goal complete!" : "+10 XP");
        try { blip(true, L.streak); } catch (err) {}
      } else { L.streak = 0; try { blip(false, 0); } catch (err) {} }
      save(LAB_KEY, labs);
    }
    renderLabs();
  });
  labsScreen.addEventListener("keydown", function (e) {
    var t = e.target.closest && e.target.closest("[data-pt]");
    if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); L.pt = +t.getAttribute("data-pt"); renderLabs(); }
  });

  window.MMExtras = { cards: CARDS, decks: DECKS, linkify: linkify, showVocab: showVocab, showLabs: showLabs, weakCards: weakCards };
  try { if (!document.getElementById("homeScreen").hidden) renderXtraCard(); } catch (e) {}
})();
