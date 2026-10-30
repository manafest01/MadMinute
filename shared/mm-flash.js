/* ===== Mad Minute Flashcards + Circuit Lab (shared add-on) =====
   Vocab flip cards for every topic that has a deck, a "Drill my misses" deck,
   a "brush up the words" card on the results screen, and the hands-on Circuit Lab.

   Decks come from the app:  window.MM_FLASH_DECKS[packId][topicKey] = [[term, meaning, tip], ...]
   Options come from the app: window.MM_FLASH = { circuitLab: ["e12", ...] }  (packs that show the lab)

   Like Smart jump and mm-learn.js, it hooks engine functions from outside
   (renderTopicsGrid, showResults) and changes no core code.
   Progress: one Leitner box per card, saved on this device under "mmflash_<packId>".
   To remove it: delete its <script> and <link> tags in index.html. */
(function () {
  "use strict";
  var GAPS = [0, 1, 3, 7, 21, 60];   // days until a card comes back, by box 0–5 (same gaps as spaced review)
  var SESSION = 20;                  // cards per sitting
  var DAY = 86400000;
  var DECKS = window.MM_FLASH_DECKS || {};
  var OPT = window.MM_FLASH || {};

  /* ---------- data ---------- */
  function pack() { return (typeof currentPack !== "undefined" && currentPack) ? currentPack : null; }
  function decksOf(p) { return (p && DECKS[p.id]) || {}; }
  function keyOf(p, topicName) {
    for (var k in p.topics) if (p.topics[k] === topicName) return k;
    return null;
  }
  function cardsFor(p, topicName) {
    var k = keyOf(p, topicName), rows = k ? decksOf(p)[k] : null;
    if (!rows) return [];
    return rows.map(function (r) {
      return { id: k + "|" + r[0], term: r[0], meaning: r[1], tip: r[2] || "", topic: topicName };
    });
  }
  function allCards(p) {
    var out = [];
    Object.keys(p.topics).forEach(function (k) { out = out.concat(cardsFor(p, p.topics[k])); });
    return out;
  }
  function storeKey(p) { return "mmflash_" + p.id; }
  function load(p) {
    try { return JSON.parse(localStorage.getItem(storeKey(p)) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(p, m) { try { localStorage.setItem(storeKey(p), JSON.stringify(m)); } catch (e) {} }

  function isDue(rec, now) { return !rec || rec.due <= now; }
  function isMiss(rec) { return !!(rec && rec.miss); }   // you hit "Again" on it and haven't nailed it first try since
  function dueCount(p, cards, mem) {
    var now = Date.now();
    return cards.filter(function (c) { return isDue(mem[c.id], now); }).length;
  }
  function shuffled(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  // misses first, then cards that are due again, then new ones; up to SESSION
  function pickSession(cards, mem, studyAll) {
    var now = Date.now();
    var miss = [], due = [], fresh = [], rest = [];
    cards.forEach(function (c) {
      var r = mem[c.id];
      if (!r) fresh.push(c);
      else if (isMiss(r)) miss.push(c);
      else if (isDue(r, now)) due.push(c);
      else rest.push(c);
    });
    var pick = shuffled(miss).concat(shuffled(due), fresh);   // new cards keep deck order (easy words first)
    if (studyAll && !pick.length) pick = shuffled(rest);
    return pick.slice(0, SESSION);
  }

  /* ---------- small helpers ---------- */
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- the flip-card screen ---------- */
  var S = null;   // the open session

  function openDeck(title, cards) {
    var p = pack(); if (!p) return;
    var mem = load(p);
    var list = pickSession(cards, mem, false);
    var caughtUp = !list.length;
    if (caughtUp) list = pickSession(cards, mem, true);
    if (!list.length) { toast("No cards here yet"); return; }
    S = { p: p, title: title, all: cards, queue: list, i: 0, got: 0, again: 0, missed: {}, flipped: false, caughtUp: caughtUp };
    buildOverlay();
    renderCard();
  }

  function buildOverlay() {
    removeOverlay();
    var o = el("div", "mmf-overlay");
    o.id = "mmfOverlay";
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    o.setAttribute("aria-label", S.title + " flashcards");
    o.innerHTML =
      '<div class="mmf-top">' +
        '<button class="mmf-x" type="button" aria-label="Close flashcards">✕</button>' +
        '<div class="mmf-title"><b>' + esc(S.title) + '</b><span id="mmfCount"></span></div>' +
      '</div>' +
      '<div class="mmf-bar"><i id="mmfBar"></i></div>' +
      '<div class="mmf-stage" id="mmfStage"></div>';
    document.body.appendChild(o);
    document.body.classList.add("mmf-lock");
    o.querySelector(".mmf-x").onclick = closeOverlay;
    document.addEventListener("keydown", onKey);
  }
  // take the layer off the screen (used before drawing a new one)
  function removeOverlay() {
    var o = document.getElementById("mmfOverlay");
    if (o) o.remove();
    document.body.classList.remove("mmf-lock");
    document.removeEventListener("keydown", onKey);
  }
  // close for good: forget the session and redraw the home counts
  function closeOverlay() {
    removeOverlay();
    S = null; L = null;
    refreshHome();
  }
  function onKey(e) {
    if (!S) return;
    if (e.key === "Escape") { closeOverlay(); return; }
    if (!S.queue[S.i]) return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); }
    else if (S.flipped && (e.key === "1" || e.key === "ArrowLeft")) grade(false);
    else if (S.flipped && (e.key === "2" || e.key === "ArrowRight")) grade(true);
  }

  function renderCard() {
    var stage = document.getElementById("mmfStage");
    if (!stage) return;
    var c = S.queue[S.i];
    var total = S.queue.length;
    document.getElementById("mmfBar").style.width = Math.round(S.i / total * 100) + "%";
    if (!c) { renderDone(stage); return; }
    document.getElementById("mmfCount").textContent = (S.i + 1) + " / " + total;
    S.flipped = false;
    stage.innerHTML =
      (S.caughtUp && S.i === 0 ? '<div class="mmf-note">All caught up — this is extra practice.</div>' : "") +
      '<button class="mmf-card" type="button" id="mmfCard" aria-live="polite">' +
        '<span class="mmf-inner">' +
          '<span class="mmf-face mmf-front">' +
            '<span class="mmf-topic">' + esc(c.topic) + '</span>' +
            '<span class="mmf-term">' + esc(c.term) + '</span>' +
            '<span class="mmf-hint">Say what it means, then tap to flip</span>' +
          '</span>' +
          '<span class="mmf-face mmf-back">' +
            '<span class="mmf-topic">' + esc(c.term) + '</span>' +
            '<span class="mmf-meaning">' + esc(c.meaning) + '</span>' +
            (c.tip ? '<span class="mmf-tip"><b>In the shop:</b> ' + esc(c.tip) + '</span>' : "") +
          '</span>' +
        '</span>' +
      '</button>' +
      '<div class="mmf-actions" id="mmfActions">' +
        '<button class="btn mmf-again" type="button" disabled>Again</button>' +
        '<button class="btn btn-amber mmf-got" type="button" disabled>Got it</button>' +
      '</div>';
    document.getElementById("mmfCard").onclick = flip;
    stage.querySelector(".mmf-again").onclick = function () { grade(false); };
    stage.querySelector(".mmf-got").onclick = function () { grade(true); };
  }

  function flip() {
    var card = document.getElementById("mmfCard");
    if (!card) return;
    S.flipped = !S.flipped;
    card.classList.toggle("flipped", S.flipped);
    var b = document.querySelectorAll("#mmfActions button");
    for (var i = 0; i < b.length; i++) b[i].disabled = false;   // once seen, you can grade from either side
  }

  function grade(knew) {
    var c = S.queue[S.i];
    if (!c) return;
    var mem = load(S.p);
    var r = mem[c.id] || { box: 0, n: 0 };
    var now = Date.now();
    r.n = (r.n || 0) + 1;
    r.t = now;
    if (knew) {
      // a card you missed earlier in this sitting doesn't move up twice
      r.box = S.missed[c.id] ? Math.max(1, r.box) : Math.min(5, (r.box || 0) + 1);
      r.due = now + GAPS[r.box] * DAY;
      if (!S.missed[c.id]) r.miss = false;   // first-try right clears it from "Drill my misses"
      S.got++;
    } else {
      r.box = 0; r.due = now; r.miss = true;
      if (!S.missed[c.id]) { S.missed[c.id] = true; S.again++; S.queue.push(c); }   // comes back once at the end
    }
    mem[c.id] = r;
    save(S.p, mem);
    S.i++;
    renderCard();
  }

  function renderDone(stage) {
    document.getElementById("mmfCount").textContent = "Done";
    var p = S.p, mem = load(p);
    var left = dueCount(p, S.all, mem);
    var missedHere = Object.keys(S.missed).length;
    stage.innerHTML =
      '<div class="mmf-done">' +
        '<div class="mmf-big">' + (missedHere ? missedHere + " to keep working on" : "Clean deck") + '</div>' +
        '<p>' + (missedHere
          ? "Those are in Drill my misses until you get them right first try. Every card comes back on a growing schedule: 1 day, then 3, 7, 21 and 60."
          : "Every card stuck. Each one comes back on a growing schedule (1 day, then 3, 7, 21 and 60) so it stays stuck.") + '</p>' +
        '<div class="mmf-done-btns">' +
          (left ? '<button class="btn btn-amber" type="button" id="mmfMore">Keep going (' + left + ' due)</button>' : "") +
          '<button class="btn btn-ghost" type="button" id="mmfClose">Done</button>' +
        '</div>' +
      '</div>';
    var more = document.getElementById("mmfMore");
    if (more) more.onclick = function () { var t = S.title, a = S.all; openDeck(t, a); };
    document.getElementById("mmfClose").onclick = closeOverlay;
  }

  function toast(t) { if (typeof showToast === "function") showToast(t); }

  /* ---------- home screen: Vocab button on each topic + top bar ---------- */
  function decorateGrid() {
    var p = pack(), grid = document.getElementById("topicsGrid");
    if (!p || !grid) return;
    var bar = document.getElementById("mmfHomeBar");
    var decks = decksOf(p);
    var hasDecks = Object.keys(decks).length > 0;
    var lab = (OPT.circuitLab || []).indexOf(p.id) >= 0;
    if (!hasDecks && !lab) { if (bar) bar.remove(); return; }

    var mem = load(p);
    var names = (typeof allTopics === "function") ? allTopics() : [];
    var cards = Array.prototype.slice.call(grid.children);
    cards.forEach(function (card, i) {
      var t = names[i];
      var deck = t ? cardsFor(p, t) : [];
      if (!deck.length) return;
      var due = dueCount(p, deck, mem);
      var cell = el("div", "mmf-cell");
      grid.insertBefore(cell, card);
      cell.appendChild(card);
      var b = el("button", "mmf-vocab", '<span>Vocab</span><span class="mmf-n">' +
        (due ? due + " due" : deck.length + " cards") + '</span>');
      b.type = "button";
      b.setAttribute("aria-label", "Vocab flashcards for " + t + ", " + (due ? due + " due" : deck.length + " cards"));
      b.onclick = function (e) { e.stopPropagation(); openDeck(t, deck); };
      cell.appendChild(b);
    });

    if (!bar) {
      bar = el("div", "mmf-homebar");
      bar.id = "mmfHomeBar";
      grid.parentNode.insertBefore(bar, grid);
    }
    var everything = hasDecks ? allCards(p) : [];
    var misses = everything.filter(function (c) { return isMiss(mem[c.id]); });
    bar.innerHTML =
      (hasDecks ? '<button class="mmf-pill" type="button" id="mmfMissBtn"' + (misses.length ? "" : " disabled") + '>' +
        '<b>Drill my misses</b><span>' + (misses.length ? misses.length + (misses.length === 1 ? " vocab card" : " vocab cards") : "No missed cards yet") + '</span></button>' : "") +
      (lab ? '<button class="mmf-pill mmf-lab-pill" type="button" id="mmfLabBtn"><b>Circuit Lab</b><span>Tap the parts, watch it work</span></button>' : "");
    var mb = document.getElementById("mmfMissBtn");
    if (mb) mb.onclick = function () { openDeck("My misses", misses); };
    var lb = document.getElementById("mmfLabBtn");
    if (lb) lb.onclick = openLab;
  }
  function refreshHome() {
    var home = document.getElementById("homeScreen");
    if (home && !home.hidden && typeof renderTopicsGrid === "function") renderTopicsGrid();
  }

  /* ---------- results screen: brush up the words you slipped on ---------- */
  function decorateResults(Q) {
    var old = document.getElementById("mmfRes");
    if (old) old.remove();
    var p = pack();
    if (!p || !Q || !Q.log) return;
    var seen = {}, topics = [];
    Q.log.forEach(function (l) {
      if (!l.correct && l.q && !seen[l.q.t] && cardsFor(p, l.q.t).length) { seen[l.q.t] = 1; topics.push(l.q.t); }
    });
    if (!topics.length) return;
    var wrap = document.getElementById("resMissWrap");
    if (!wrap) return;
    var card = el("div", "card mmf-res");
    card.id = "mmfRes";
    card.innerHTML = '<div class="eyebrow">Brush up the words</div>' +
      '<p class="muted">Missed questions often come down to one term. Flip these before your next round.</p>' +
      '<div class="mmf-res-btns"></div>';
    var box = card.querySelector(".mmf-res-btns");
    topics.slice(0, 3).forEach(function (t) {
      var b = el("button", "btn btn-ghost", esc(t) + " vocab");
      b.type = "button";
      b.onclick = function () { openDeck(t, cardsFor(p, t)); };
      box.appendChild(b);
    });
    wrap.parentNode.insertBefore(card, wrap);
  }

  /* ---------- Circuit Lab: a 12 V lamp circuit you can tap ---------- */
  // Parts: battery → fuse → switch → lamp → ground. Lamp is 6 Ω (about 2 A at 12.6 V, a 25 W bulb).
  var LAMP_R = 6, BAD_GROUND_R = 3, VBAT = 12.6;
  var L = null;
  var INFO = {
    battery: ["Battery", "The power source: about 12.6 V when fully charged and resting. It pushes current out the positive post, through the circuit, and back to the negative post."],
    fuse: ["Fuse", "A weak link that melts and opens the circuit when current gets too high, usually from a short to ground. It protects the wire, not the part. Never upsize a fuse to stop it blowing; find the short."],
    sw: ["Switch", "Opens or closes the path. Open = no current anywhere in the loop, so the lamp is off and reads 0 V across it, because the switch is upstream of the lamp."],
    lamp: ["Lamp (the load)", "The part that does the work. It has resistance (6 Ω here), so almost all the battery's voltage should drop across it when the circuit is healthy. That's what you want to see on your meter."],
    ground: ["Ground", "The return path to the battery negative, through the body and engine. A corroded or loose ground adds resistance: the lamp gets dim and the ground side shows a voltage drop. Over about 0.1–0.2 V on a ground is worth a closer look."],
    short: ["Short to ground", "A chafed wire touching metal gives current a path with almost no resistance. Current spikes, and the fuse blows to protect the wire."],
    reblow: ["Fuse blew again", "A new fuse pops right away because the short is still there. Fix the chafed wire first (tap Fix everything), then replace the fuse."]
  };

  function openLab() {
    removeOverlay();
    S = null;
    L = { sw: true, fuse: true, ground: 0, lamp: true, sel: "lamp" };   // ground: 0 good, 1 corroded, 2 broken
    var o = el("div", "mmf-overlay mmf-lab");
    o.id = "mmfOverlay";
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    o.setAttribute("aria-label", "Circuit Lab");
    o.innerHTML =
      '<div class="mmf-top"><button class="mmf-x" type="button" aria-label="Close Circuit Lab">✕</button>' +
      '<div class="mmf-title"><b>Circuit Lab</b><span>12 V lamp circuit</span></div></div>' +
      '<div class="mmf-lab-body">' +
        '<div class="mmf-status" id="labStatus" aria-live="polite"></div>' +
        '<div class="mmf-svg-wrap" id="labSvg"></div>' +
        '<div class="mmf-meters" id="labMeters"></div>' +
        '<div class="mmf-lab-btns">' +
          '<button class="btn btn-ghost" type="button" id="labShort">Chafe the wire</button>' +
          '<button class="btn btn-ghost" type="button" id="labReset">Fix everything</button>' +
        '</div>' +
        '<div class="mmf-info" id="labInfo"></div>' +
        '<p class="mmf-foot">Tap any part to change it. Training model only; real circuits vary, so always follow the service procedure.</p>' +
      '</div>';
    document.body.appendChild(o);
    document.body.classList.add("mmf-lock");
    o.querySelector(".mmf-x").onclick = closeOverlay;
    document.addEventListener("keydown", onKey);
    document.getElementById("labShort").onclick = function () {
      L.shorted = true; L.fuse = false; L.sel = "short"; renderLab();
    };
    document.getElementById("labReset").onclick = function () { L = { sw: true, fuse: true, ground: 0, lamp: true, sel: "lamp" }; renderLab(); };
    renderLab();
  }

  function labMath() {
    var closed = L.sw && L.fuse && L.ground !== 2 && L.lamp;
    var rg = L.ground === 1 ? BAD_GROUND_R : 0;
    var amps = closed ? VBAT / (LAMP_R + rg) : 0;
    var vLamp, vGround;
    if (closed) { vLamp = amps * LAMP_R; vGround = amps * rg; }
    else if (!L.sw || !L.fuse) { vLamp = 0; vGround = 0; }          // open upstream: nothing reaches the lamp
    else if (!L.lamp) { vLamp = VBAT; vGround = 0; }                // open load: meter across it reads source voltage
    else { vLamp = 0; vGround = VBAT; }                             // open ground: full voltage shows across the break
    return { closed: closed, amps: amps, vLamp: vLamp, vGround: vGround, bright: closed ? Math.pow(vLamp / VBAT, 2) : 0 };
  }

  function part(id, label, x, y, inner) {
    return '<g class="lab-part' + (L.sel === id ? " sel" : "") + '" data-part="' + id + '" tabindex="0" role="button" aria-label="' + label + '" transform="translate(' + x + ' ' + y + ')">' +
      '<rect class="lab-hit" x="-34" y="-30" width="68" height="60" rx="10"/>' + inner + '</g>';
  }

  function renderLab() {
    var m = labMath();
    var flow = m.closed ? Math.max(0.35, 1.6 / m.amps) : 0;
    var glow = m.bright;
    var gState = ["good", "corroded", "broken"][L.ground];
    var svg =
      '<svg viewBox="0 0 340 250" class="lab-svg" aria-label="Lamp circuit diagram">' +
      // wire loop
      '<path class="lab-wire" d="M60 190 V60 H280 V190 H60"/>' +
      (m.closed ? '<path class="lab-flow" style="animation-duration:' + flow.toFixed(2) + 's" d="M60 190 V60 H280 V190 H60"/>' : "") +
      (L.shorted ? '<path class="lab-short" d="M120 60 l6 10 l-8 4 l6 10"/>' : "") +
      // battery (left side)
      part("battery", "Battery, 12.6 volts", 60, 125,
        '<rect class="lab-body" x="-20" y="-22" width="40" height="44" rx="5"/>' +
        '<text class="lab-sym" y="-4">+</text><text class="lab-small" y="14">12.6 V</text>') +
      // fuse (top left)
      part("fuse", "Fuse, " + (L.fuse ? "good" : "blown"), 115, 60,
        '<rect class="lab-body" x="-22" y="-10" width="44" height="20" rx="10"/>' +
        (L.fuse ? '<path class="lab-elem" d="M-14 0 C-7 -7 -2 7 4 0 S 12 -6 14 0"/>' : '<path class="lab-elem bad" d="M-14 0 L-4 -3 M4 3 L14 0"/>') +
        '<text class="lab-small" y="26">' + (L.fuse ? "Fuse 10 A" : "Blown") + '</text>') +
      // switch (top right)
      part("sw", "Switch, " + (L.sw ? "closed" : "open"), 205, 60,
        '<circle class="lab-dot" cx="-16" cy="0" r="4"/><circle class="lab-dot" cx="16" cy="0" r="4"/>' +
        '<path class="lab-elem" d="' + (L.sw ? "M-16 0 L16 0" : "M-16 0 L12 -18") + '"/>' +
        '<text class="lab-small" y="26">' + (L.sw ? "Switch on" : "Switch off") + '</text>') +
      // lamp (right side)
      part("lamp", "Lamp, " + (L.lamp ? (m.closed ? "lit" : "off") : "burned out"), 280, 125,
        '<circle class="lab-glow" r="26" style="opacity:' + (glow * 0.9).toFixed(2) + '"/>' +
        '<circle class="lab-bulb" r="16"/>' +
        (L.lamp ? '<path class="lab-elem" d="M-11 -11 L11 11 M11 -11 L-11 11"/>' : '<path class="lab-elem bad" d="M-11 -11 L-3 -3 M3 3 L11 11 M11 -11 L-11 11"/>') +
        '<text class="lab-small" y="34">' + (L.lamp ? "Lamp 6 Ω" : "Burned out") + '</text>') +
      // ground (bottom)
      part("ground", "Ground, " + gState, 170, 190,
        '<path class="lab-elem' + (L.ground ? " bad" : "") + '" d="M0 0 V12 M-14 12 H14 M-9 18 H9 M-4 24 H4"/>' +
        (L.ground === 2 ? '<path class="lab-elem bad" d="M-6 -6 L6 6 M6 -6 L-6 6"/>' : "") +
        (L.ground === 1 ? '<circle class="lab-rust" cx="0" cy="12" r="5"/>' : "") +
        '<text class="lab-small" y="-10">' + ["Ground good", "Ground corroded", "Ground broken"][L.ground] + '</text>') +
      '</svg>';
    document.getElementById("labSvg").innerHTML = svg;

    var status;
    if (m.closed && L.ground === 1) status = "Lamp is <b>dim</b>: the bad ground is stealing voltage.";
    else if (m.closed) status = "Lamp is <b>on</b>: the loop is complete.";
    else if (!L.fuse) status = "Lamp is <b>off</b>: the fuse is blown. Find the short before you replace it.";
    else if (!L.sw) status = "Lamp is <b>off</b>: the switch is open.";
    else if (!L.lamp) status = "Lamp is <b>off</b>: the bulb's filament is open.";
    else status = "Lamp is <b>off</b>: the ground path is broken.";
    document.getElementById("labStatus").innerHTML = status;

    function meter(label, val, unit, note) {
      return '<div class="mmf-meter"><span>' + label + '</span><b>' + val.toFixed(unit === "A" ? 2 : 1) + ' ' + unit + '</b><small>' + note + '</small></div>';
    }
    document.getElementById("labMeters").innerHTML =
      meter("Across the lamp", m.vLamp, "V", m.closed ? (L.ground ? "Should be ~12.6" : "Healthy") : (L.lamp ? "No push across it" : "Open load reads full voltage")) +
      meter("Ground side drop", m.vGround, "V", L.ground === 2 ? "Full voltage across the break" : (L.ground ? "Too high: bad ground" : "Under 0.2 is good")) +
      meter("Current", m.amps, "A", m.closed ? "Volts ÷ ohms" : "Open circuit, no flow");

    var info = INFO[L.sel] || INFO.lamp;
    document.getElementById("labInfo").innerHTML = "<b>" + info[0] + ":</b> " + info[1];

    var parts = document.querySelectorAll(".lab-part");
    for (var i = 0; i < parts.length; i++) {
      parts[i].onclick = onPart;
      parts[i].onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPart.call(this); } };
    }
  }
  function onPart() {
    var id = this.getAttribute("data-part");
    if (id === "sw") L.sw = !L.sw;
    else if (id === "fuse") {
      if (L.shorted && !L.fuse) { L.sel = "reblow"; renderLab(); return; }   // new fuse, same short: blows again
      L.fuse = !L.fuse;
    }
    else if (id === "lamp") L.lamp = !L.lamp;
    else if (id === "ground") L.ground = (L.ground + 1) % 3;
    L.sel = id;
    renderLab();
    var again = document.querySelector('.lab-part[data-part="' + id + '"]');
    if (again) again.focus();
  }

  /* ---------- hook into the engine from outside ---------- */
  if (typeof window.renderTopicsGrid === "function") {
    var baseGrid = window.renderTopicsGrid;
    window.renderTopicsGrid = function () { baseGrid.apply(this, arguments); try { decorateGrid(); } catch (e) {} };
  }
  if (typeof window.showResults === "function") {
    var baseResults = window.showResults;
    window.showResults = function (Q) { baseResults.apply(this, arguments); try { decorateResults(Q); } catch (e) {} };
  }
  window.MMFlash = { openDeck: openDeck, openLab: openLab, cardsFor: cardsFor };
  refreshHome();
})();
