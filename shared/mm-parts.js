/* ===== Mad Minute Exploded View (shared add-on) =====
   Take an assembly apart on screen and learn every piece:
   - Explorer: the exploded drawing with numbered parts. Tap a part (or its name) to see what it
     does. "Put together" slides the parts into place; "Take apart" explodes them again.
   - Name the part: one part lights up, pick its name from 4. Fast answers earn bonus XP.
   - Put it in order: tap the parts in assembly (or flow) order.
   - Flashcards: every part becomes a card with the drawing on the front (that part lit up)
     and the meaning and shop tip on the back. Runs through shared/mm-flash.js, so it keeps the
     same spaced schedule. Parts you miss in "Name the part" go to the front of that deck.

   Data comes from the app: window.MM_PARTS = [assembly, ...] (see flashcards/parts-*.js).
   Needs shared/mm-flash.js (for the cards and the overlay styles). Load it after mm-flash.js.
   Progress: best scores in "mmparts_<assembly key>", card progress in "mmflash_parts".
   Like the other add-ons it hooks renderTopicsGrid from outside and changes no core code.
   Testing switch: hidden until a device opens the app with ?lab=1 (saved as mmparts_lab); ?lab=0 hides it again.
   To remove it: delete its <script> and <link> tags and its data file's <script> tag. */
(function () {
  "use strict";
  var ASM = window.MM_PARTS || [];
  if (!ASM.length) return;
  // Still being tested: hidden unless this device has opened the app once with ?lab=1 (?lab=0 turns it back off).
  try {
    var flag = new URLSearchParams(location.search).get("lab");
    if (flag === "1") localStorage.setItem("mmparts_lab", "1");
    if (flag === "0") localStorage.removeItem("mmparts_lab");
    if (localStorage.getItem("mmparts_lab") !== "1") return;
  } catch (e) { return; }
  var CARD_PACK = { id: "parts" };      // card progress lives in mmflash_parts
  var FAST_MS = 5000;                   // answer inside this for the speed bonus
  var DAY = 86400000;

  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function shuffled(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function toast(t) { if (typeof showToast === "function") showToast(t); }
  function giveXP(n) { try { if (n > 0 && typeof addXP === "function") addXP(n); } catch (e) {} }

  /* ---------- saved data ---------- */
  function bestKey(a) { return "mmparts_" + a.key; }
  function loadBest(a) { try { return JSON.parse(localStorage.getItem(bestKey(a)) || "{}") || {}; } catch (e) { return {}; } }
  function saveBest(a, field, val) {
    var b = loadBest(a);
    if (!(b[field] >= val)) b[field] = val;
    try { localStorage.setItem(bestKey(a), JSON.stringify(b)); } catch (e) {}
  }
  function cardId(a, p) { return "parts|" + a.key + "|" + p.id; }
  function loadCards() { try { return JSON.parse(localStorage.getItem("mmflash_parts") || "{}") || {}; } catch (e) { return {}; } }
  // a miss in Name the part puts the card at the front of the deck (same record mm-flash.js keeps)
  function markMiss(a, p) {
    var m = loadCards(), id = cardId(a, p), r = m[id] || { box: 0, n: 0 };
    r.box = 0; r.due = Date.now(); r.miss = true; r.t = Date.now();
    m[id] = r;
    try { localStorage.setItem("mmflash_parts", JSON.stringify(m)); } catch (e) {}
  }

  /* ---------- drawing ---------- */
  // opt: hi = part id to light up, together = parts in their put-together spots,
  //      badges = show the numbers, solo = draw only this part (thumbnails)
  function drawing(a, opt) {
    opt = opt || {};
    var cls = "mmp-svg" + (opt.hi ? " focus" : "") + (opt.together ? " together" : "");
    var view = (opt.together && a.viewTogether) || a.view;
    var out = '<svg class="' + cls + '" viewBox="' + view + '" role="img" aria-label="' + esc(a.name) + ' drawing">' +
      '<defs><marker id="mmpArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="mmp-arrowhead"/></marker></defs>';
    if (!opt.together) {
      (a.axes || []).forEach(function (d) { out += '<path class="mmp-axis" d="' + d + '"/>'; });
      (a.pipes || []).forEach(function (d) { out += '<path class="mmp-pipe" d="' + d + '"/>'; });
      (a.pushes || []).forEach(function (d) { out += '<path class="mmp-push" d="' + d + '" marker-end="url(#mmpArrow)"/>'; });
    }
    a.parts.slice().sort(function (x, y) { return (x.z || 0) - (y.z || 0); }).forEach(function (p) {
      var i = a.parts.indexOf(p);
      var at = (opt.together && p.a) ? p.a : p.e;
      out += '<g class="mmp-part' + (opt.hi === p.id ? " hi" : "") + (opt.sel === p.id ? " sel" : "") + '" data-part="' + esc(p.id) + '"' +
        (opt.tap ? ' tabindex="0" role="button" aria-label="' + (i + 1) + ', ' + esc(p.name) + '"' : "") +
        ' style="transform:translate(' + at[0] + 'px,' + at[1] + 'px)">' + p.d + '</g>';
    });
    // dTop: the bits of a part that sit in front of everything else (studs through the rotor hat, the axle nut)
    a.parts.forEach(function (p) {
      if (!p.dTop) return;
      var at = (opt.together && p.a) ? p.a : p.e;
      out += '<g class="mmp-part mmp-top' + (opt.hi === p.id ? " hi" : "") + (opt.sel === p.id ? " sel" : "") + '" data-part="' + esc(p.id) + '"' +
        ' style="transform:translate(' + at[0] + 'px,' + at[1] + 'px)">' + p.dTop + '</g>';
    });
    if (opt.badges && !opt.together) a.parts.forEach(function (p, i) {
      out += '<g class="mmp-badge' + (p.fixed ? " fixed" : "") + (opt.sel === p.id ? " sel" : "") + '" data-part="' + esc(p.id) + '" transform="translate(' + p.n[0] + ' ' + p.n[1] + ')"><circle r="9"/><text y="3.5">' + (i + 1) + '</text></g>';
    });
    return out + '</svg>';
  }
  // one part on its own, for tiles; the viewBox is fitted after it is on screen (fitThumbs)
  function thumb(p) {
    return '<svg class="mmp-svg mmp-thumb" viewBox="-50 -50 100 100" aria-hidden="true"><g class="mmp-part">' + p.d + (p.dTop || "") + '</g></svg>';
  }
  function fitThumbs(root) {
    Array.prototype.forEach.call(root.querySelectorAll(".mmp-thumb"), function (svg) {
      try {
        var b = svg.querySelector("g").getBBox(), pad = 4, s = Math.max(b.width, b.height) + pad * 2;
        var cx = b.x + b.width / 2, cy = b.y + b.height / 2;
        svg.setAttribute("viewBox", (cx - s / 2) + " " + (cy - s / 2) + " " + s + " " + s);
      } catch (e) {}
    });
  }
  // for a flashcard front: the whole drawing, one part lit, no numbers
  function cardPicture(a, p) { return drawing(a, { hi: p.id }); }

  /* ---------- the layer ---------- */
  var V = null;   // what's open: { a, mode, ... , fromHub }
  function layer(title, sub) {
    close(true);
    var o = document.createElement("div");
    o.className = "mmf-overlay mmp-overlay";
    o.id = "mmpOverlay";
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    o.setAttribute("aria-label", title);
    o.innerHTML = '<div class="mmf-top"><button class="mmf-x" type="button" aria-label="Close">✕</button>' +
      '<div class="mmf-title"><b>' + esc(title) + '</b><span>' + esc(sub || "") + '</span></div></div>' +
      '<div class="mmp-body" id="mmpBody"></div>';
    document.body.appendChild(o);
    document.body.classList.add("mmf-lock");
    o.querySelector(".mmf-x").onclick = function () { back(); };
    document.addEventListener("keydown", onKey);
    return document.getElementById("mmpBody");
  }
  function onKey(e) { if (e.key === "Escape") back(); }
  // quiet = swapping screens, not leaving
  function close(quiet) {
    var o = document.getElementById("mmpOverlay");
    if (o) o.remove();
    document.removeEventListener("keydown", onKey);
    if (!quiet) {
      document.body.classList.remove("mmf-lock");
      clearTimer();
    }
  }
  // the X: from a drill back to its explorer, from an explorer back to the list, then out
  function back() {
    if (!V) { close(); return; }
    if (V.mode === "name" || V.mode === "order") { openExplorer(V.a); return; }
    if (V.mode === "explore" && ASM.length > 1) { openList(V.fromHub); return; }
    leave();
  }
  function leave() {
    var fromHub = V && V.fromHub;
    V = null;
    close();
    try { if (typeof renderDailyCard === "function") renderDailyCard(); } catch (e) {}
    var home = document.getElementById("homeScreen");
    if (home && !home.hidden && typeof renderTopicsGrid === "function") renderTopicsGrid();
    if (fromHub && window.MMFlash && MMFlash.openHub) MMFlash.openHub();
  }

  /* ---------- list of assemblies ---------- */
  function openList(fromHub) {
    if (ASM.length === 1) { openExplorer(ASM[0], fromHub); return; }
    V = { mode: "list", fromHub: !!fromHub };
    var body = layer("Exploded View", "Take it apart, name every piece, put it back");
    var html = '<p class="mmp-lead">Pick an assembly. Learn the parts, then test yourself two ways.</p>';
    ASM.forEach(function (a, i) {
      var b = loadBest(a);
      var stats = [];
      if (b.name != null) stats.push("Name: best " + b.name + "%");
      if (b.order != null) stats.push("Order: best " + b.order + "%");
      html += '<button class="mmp-asm" type="button" data-asm="' + i + '">' +
        '<span class="mmp-asm-pic">' + drawing(a) + '</span>' +
        '<span class="mmp-asm-t"><b>' + esc(a.name) + '</b><span>' + esc(a.sub) + ' · ' + a.parts.length + ' parts</span>' +
        (stats.length ? '<span class="mmp-best">' + esc(stats.join(" · ")) + '</span>' : '<span class="mmp-best">New</span>') +
        '</span></button>';
    });
    body.innerHTML = html;
    Array.prototype.forEach.call(body.querySelectorAll("[data-asm]"), function (b) {
      b.onclick = function () { openExplorer(ASM[+b.getAttribute("data-asm")], V.fromHub); };
    });
  }

  /* ---------- explorer ---------- */
  function openExplorer(a, fromHub) {
    var keepHub = V ? V.fromHub : !!fromHub;
    if (fromHub != null) keepHub = !!fromHub;
    V = { mode: "explore", a: a, sel: null, together: !!a.startTogether, fromHub: keepHub };
    layer(a.name, a.sub);
    renderExplorer();
  }
  function renderExplorer() {
    var a = V.a, body = document.getElementById("mmpBody");
    if (!body) return;
    var mem = loadCards();
    var misses = a.parts.filter(function (p) { var r = mem[cardId(a, p)]; return r && r.miss; }).length;
    var sel = a.parts.filter(function (p) { return p.id === V.sel; })[0];
    var b = loadBest(a);
    var stays = a.parts.filter(function (p) { return p.fixed; }).map(function (p) { return p.name; });
    body.innerHTML =
      (a.explode ? '<div class="mmp-toggle" role="group" aria-label="View">' +
        '<button type="button" data-view="apart" aria-pressed="' + !V.together + '"' + (V.together ? "" : ' class="on"') + '>Taken apart</button>' +
        '<button type="button" data-view="together" aria-pressed="' + V.together + '"' + (V.together ? ' class="on"' : "") + '>Put together</button></div>' : "") +
      '<div class="mmf-svg-wrap mmp-wrap" id="mmpPic">' + drawing(a, { badges: true, tap: !V.together, together: V.together, sel: V.sel }) + '</div>' +
      '<div class="mmf-info mmp-info" aria-live="polite">' + (sel
        ? '<b>' + esc(sel.name) + ':</b> ' + esc(sel.meaning) + '<span class="mmp-tip"><b>In the shop:</b> ' + esc(sel.tip) + '</span>'
        : (V.together ? "This is how it sits on the car. Tap <b>Taken apart</b> to see every piece." : "Tap any part, or its name below, to see what it does." +
          (stays.length ? " Gray numbers stay on the car during service: " + esc(stays.join(", ").toLowerCase()) + "." : ""))) + '</div>' +
      '<div class="mmp-modes">' +
        '<button class="mmf-pill mmp-mode" type="button" id="mmpName"><b>Name the part</b><span>' + a.parts.length + ' parts, beat the clock' + (b.name != null ? ' · best ' + b.name + '%' : "") + '</span></button>' +
        '<button class="mmf-pill mmp-mode" type="button" id="mmpOrder"><b>Put it in order</b><span>' + esc(a.orderTitle) + (b.order != null ? ' · best ' + b.order + '%' : "") + '</span></button>' +
        '<button class="mmf-pill mmp-mode mmp-wide" type="button" id="mmpCards"><b>Flashcards</b><span>Picture on the front, flip for the name' + (misses ? " · " + misses + " missed" : "") + '</span></button>' +
      '</div>' +
      '<div class="mmp-legend">' + a.parts.map(function (p, i) {
        return '<button type="button" class="mmp-chip' + (p.fixed ? " fixed" : "") + (V.sel === p.id ? " on" : "") + '" data-part="' + esc(p.id) + '"><i>' + (i + 1) + '</i>' + esc(p.name) + '</button>';
      }).join("") + '</div>' +
      '<p class="mmf-foot">Training drawing, simplified and not to scale. Always follow the service information.</p>';

    Array.prototype.forEach.call(body.querySelectorAll("[data-view]"), function (btn) {
      btn.onclick = function () {
        var t = btn.getAttribute("data-view") === "together";
        if (t === V.together) return;
        V.together = t; V.anim = true;
        if (t) V.sel = null;
        renderExplorer();
      };
    });
    Array.prototype.forEach.call(body.querySelectorAll("[data-part]"), function (g) {
      if (V.together && g.tagName.toLowerCase() !== "button") return;
      g.onclick = function () { pick(g.getAttribute("data-part")); };
      g.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(g.getAttribute("data-part")); } };
    });
    document.getElementById("mmpName").onclick = function () { startName(a); };
    document.getElementById("mmpOrder").onclick = function () { startOrder(a); };
    document.getElementById("mmpCards").onclick = function () { openCards(a); };
    // after a toggle, the parts glide from where they were to where they're going
    if (V.anim && a.explode) {
      var svg = body.querySelector(".mmp-svg"), toTogether = V.together;
      V.anim = false;
      var gs = svg ? svg.querySelectorAll(".mmp-part") : [];
      var spot = function (g, together) {
        var p = a.parts.filter(function (x) { return x.id === g.getAttribute("data-part"); })[0];
        var at = together ? p.a : p.e;
        g.style.transform = "translate(" + at[0] + "px," + at[1] + "px)";
      };
      Array.prototype.forEach.call(gs, function (g) { g.style.transition = "none"; spot(g, !toTogether); });
      if (svg) svg.getBoundingClientRect();
      requestAnimationFrame(function () {
        Array.prototype.forEach.call(gs, function (g) { g.style.transition = ""; spot(g, toTogether); });
      });
    }
  }
  function pick(id) {
    if (V.together) { V.together = false; V.anim = true; }
    V.sel = V.sel === id ? null : id;
    renderExplorer();
    var c = document.querySelector('.mmp-chip[data-part="' + id + '"]');
    if (c && V.sel) c.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  /* ---------- Name the part ---------- */
  var timer = null;
  function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function startName(a) {
    V = { mode: "name", a: a, fromHub: V && V.fromHub, queue: shuffled(a.parts), i: 0, right: 0, xp: 0, missed: [], answered: false };
    layer("Name the part", a.name);
    renderName();
  }
  function choicesFor(a, p) {
    var pool = a.parts.filter(function (x) { return x.id !== p.id; }).map(function (x) { return x.name; });
    if (pool.length < 3) ASM.forEach(function (o) { if (o !== a) o.parts.forEach(function (x) { if (pool.indexOf(x.name) < 0 && x.name !== p.name) pool.push(x.name); }); });
    return shuffled([p.name].concat(shuffled(pool).slice(0, 3)));
  }
  function renderName() {
    var body = document.getElementById("mmpBody"), a = V.a;
    if (!body) return;
    var p = V.queue[V.i];
    if (!p) { nameDone(); return; }
    V.answered = false;
    V.t0 = Date.now();
    var opts = choicesFor(a, p);
    body.innerHTML =
      '<div class="mmp-hud"><span>' + (V.i + 1) + ' / ' + V.queue.length + '</span><span class="mmp-clock" id="mmpClock"><i></i></span><b>' + V.xp + ' XP</b></div>' +
      '<div class="mmf-svg-wrap mmp-wrap">' + drawing(a, { hi: p.id }) + '</div>' +
      '<div class="mmp-q">What is the lit-up part?</div>' +
      '<div class="mmp-opts">' + opts.map(function (n) { return '<button type="button" class="mmp-opt" data-n="' + esc(n) + '">' + esc(n) + '</button>'; }).join("") + '</div>' +
      '<div id="mmpAfter"></div>';
    Array.prototype.forEach.call(body.querySelectorAll(".mmp-opt"), function (b) {
      b.onclick = function () { answer(b, p); };
    });
    // the speed bar empties over FAST_MS; answer before it runs out for the bonus
    clearTimer();
    var bar = body.querySelector("#mmpClock i");
    timer = setInterval(function () {
      var left = Math.max(0, 1 - (Date.now() - V.t0) / FAST_MS);
      if (bar) bar.style.width = (left * 100) + "%";
      if (!left) clearTimer();
    }, 100);
  }
  function answer(btn, p) {
    if (V.answered) return;
    V.answered = true;
    clearTimer();
    var ok = btn.getAttribute("data-n") === p.name;
    var fast = Date.now() - V.t0 <= FAST_MS;
    var pts = ok ? 10 + (fast ? 5 : 0) : 0;
    Array.prototype.forEach.call(document.querySelectorAll(".mmp-opt"), function (b) {
      b.disabled = true;
      if (b.getAttribute("data-n") === p.name) b.classList.add("right");
    });
    if (ok) { V.right++; V.xp += pts; }
    else { btn.classList.add("wrong"); V.missed.push(p); markMiss(V.a, p); }
    var last = V.i + 1 >= V.queue.length;
    document.getElementById("mmpAfter").innerHTML =
      '<div class="mmf-info mmp-info' + (ok ? "" : " miss") + '"><b>' + (ok ? (fast ? "Right, and fast! +" + pts : "Right. +" + pts) : "It's the " + esc(p.name.toLowerCase()) + ".") + '</b> ' + esc(p.meaning) + '</div>' +
      '<button class="btn btn-amber mmp-next" type="button" id="mmpNext">' + (last ? "See results" : "Next part") + '</button>';
    var next = document.getElementById("mmpNext");
    next.onclick = function () { V.i++; renderName(); };
    next.focus();
  }
  function nameDone() {
    var a = V.a, body = document.getElementById("mmpBody"), n = V.queue.length;
    var pct = Math.round(V.right / n * 100);
    var bonus = V.right === n ? 20 : 0;
    V.xp += bonus;
    giveXP(V.xp);
    var before = loadBest(a).name;
    saveBest(a, "name", pct);
    var missed = V.missed;
    body.innerHTML =
      '<div class="mmf-done mmp-done">' +
        '<div class="mmf-big">' + V.right + ' of ' + n + ' named</div>' +
        '<p><b class="mmp-xp">+' + V.xp + ' XP</b>' + (bonus ? " (includes +20 for a clean sweep)" : "") +
          (before != null && pct > before ? " · new best!" : "") + '</p>' +
        (missed.length ? '<p>Missed: ' + esc(missed.map(function (p) { return p.name; }).join(", ")) + '. They\'re at the front of the flashcards now.</p>' : '<p>Every part, named. Try putting it in order next.</p>') +
        '<div class="mmf-done-btns">' +
          (missed.length ? '<button class="btn btn-amber" type="button" id="mmpFlipMiss">Flip the ones I missed</button>' : '<button class="btn btn-amber" type="button" id="mmpToOrder">Put it in order</button>') +
          '<button class="btn btn-ghost" type="button" id="mmpAgain">Go again</button>' +
          '<button class="btn btn-ghost" type="button" id="mmpBack">Back to the drawing</button>' +
        '</div>' +
      '</div>';
    var fm = document.getElementById("mmpFlipMiss");
    if (fm) fm.onclick = function () { openCards(a, missed); };
    var to = document.getElementById("mmpToOrder");
    if (to) to.onclick = function () { startOrder(a); };
    document.getElementById("mmpAgain").onclick = function () { startName(a); };
    document.getElementById("mmpBack").onclick = function () { openExplorer(a); };
  }

  /* ---------- Put it in order ---------- */
  function startOrder(a) {
    var parts = a.parts.filter(function (p) { return p.order != null; });
    V = { mode: "order", a: a, fromHub: V && V.fromHub, parts: parts, bank: shuffled(parts), placed: [], wrong: 0, slipped: {}, xp: 0 };
    layer("Put it in order", a.orderTitle);
    renderOrder();
  }
  function nextRank() {
    var left = V.parts.filter(function (p) { return V.placed.indexOf(p) < 0; });
    return left.length ? Math.min.apply(null, left.map(function (p) { return p.order; })) : null;
  }
  function renderOrder() {
    var body = document.getElementById("mmpBody"), a = V.a;
    if (!body) return;
    if (V.placed.length === V.parts.length) { orderDone(); return; }
    body.innerHTML =
      '<p class="mmp-lead">' + esc(a.orderHint) + '</p>' +
      '<ol class="mmp-slots">' + V.parts.map(function (x, i) {
        var p = V.placed[i];
        return '<li class="' + (p ? "full" : (i === V.placed.length ? "now" : "")) + '"><i>' + (i + 1) + '</i>' + (p ? esc(p.name) : (i === V.placed.length ? "Next?" : "")) + '</li>';
      }).join("") + '</ol>' +
      '<div class="mmp-bank">' + V.bank.map(function (p) {
        var used = V.placed.indexOf(p) >= 0;
        return '<button type="button" class="mmp-tile' + (used ? " used" : "") + '" data-part="' + esc(p.id) + '"' + (used ? " disabled" : "") + '>' + thumb(p) + '<span>' + esc(p.name) + '</span></button>';
      }).join("") + '</div>' +
      '<div class="mmp-status" id="mmpStatus" aria-live="polite">' + (V.wrong ? V.wrong + (V.wrong === 1 ? " slip" : " slips") + " so far" : "") + '</div>';
    fitThumbs(body);
    Array.prototype.forEach.call(body.querySelectorAll(".mmp-tile:not(.used)"), function (b) {
      b.onclick = function () { place(b); };
    });
  }
  function place(btn) {
    var p = V.parts.filter(function (x) { return x.id === btn.getAttribute("data-part"); })[0];
    var rank = nextRank();
    if (p.order === rank) {
      if (!V.slipped[V.placed.length]) V.xp += 5;
      V.placed.push(p);
      renderOrder();
    } else {
      V.wrong++;
      V.slipped[V.placed.length] = true;
      btn.classList.remove("shake"); void btn.offsetWidth; btn.classList.add("shake");
      var s = document.getElementById("mmpStatus");
      if (s) s.textContent = "Not yet: the " + p.name.toLowerCase() + " goes on " + (p.order > rank ? "later" : "earlier") + ".";
    }
  }
  function orderDone() {
    var a = V.a, body = document.getElementById("mmpBody"), n = V.parts.length;
    var clean = n - Object.keys(V.slipped).length;
    var pct = Math.round(clean / n * 100);
    var bonus = V.wrong ? 0 : 20;
    V.xp += bonus;
    giveXP(V.xp);
    var before = loadBest(a).order;
    saveBest(a, "order", pct);
    body.innerHTML =
      '<div class="mmf-done mmp-done">' +
        '<div class="mmf-big">' + (V.wrong ? "Built, with " + V.wrong + (V.wrong === 1 ? " slip" : " slips") : "Perfect build") + '</div>' +
        '<p><b class="mmp-xp">+' + V.xp + ' XP</b>' + (bonus ? " (includes +20 for no slips)" : "") + (before != null && pct > before ? " · new best!" : "") + '</p>' +
        '<ol class="mmp-slots mmp-final">' + V.placed.map(function (p, i) { return '<li class="full"><i>' + (i + 1) + '</i>' + esc(p.name) + '</li>'; }).join("") + '</ol>' +
        '<p class="mmp-note">' + esc(a.orderNote) + '</p>' +
        '<div class="mmf-done-btns">' +
          '<button class="btn btn-amber" type="button" id="mmpAgain">Go again</button>' +
          '<button class="btn btn-ghost" type="button" id="mmpBack">Back to the drawing</button>' +
        '</div>' +
      '</div>';
    document.getElementById("mmpAgain").onclick = function () { startOrder(a); };
    document.getElementById("mmpBack").onclick = function () { openExplorer(a); };
  }

  /* ---------- Flashcards (through mm-flash.js) ---------- */
  function cardsOf(a, only) {
    return (only || a.parts).map(function (p) {
      return { id: cardId(a, p), term: p.name, meaning: p.meaning, tip: p.tip, topic: a.name, pic: cardPicture(a, p) };
    });
  }
  function openCards(a, only) {
    if (!window.MMFlash || !MMFlash.openDeck) { toast("Flashcards aren't loaded"); return; }
    var fromHub = V && V.fromHub;
    close();
    V = null;
    MMFlash.openDeck(a.name, cardsOf(a, only), { p: CARD_PACK, back: function () { openExplorer(a, fromHub); } });
  }

  /* ---------- home screen: an Exploded View button beside Flashcards ---------- */
  function decorateHome() {
    var p = (typeof currentPack !== "undefined" && currentPack) ? currentPack : null;
    var grid = document.getElementById("topicsGrid");
    if (!p || !grid) return;
    var old = document.getElementById("mmpHomeBtn");
    if (old) old.remove();
    var bar = document.getElementById("mmfHomeBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "mmf-homebar"; bar.id = "mmfHomeBar";
      grid.parentNode.insertBefore(bar, grid);
    }
    bar.classList.add("mmp-has");
    var btn = document.createElement("button");
    btn.className = "mmf-pill mmp-home-pill"; btn.type = "button"; btn.id = "mmpHomeBtn";
    btn.innerHTML = '<b>Exploded View</b><span>Take a brake apart, name every part</span>';
    btn.onclick = function () { openList(false); };
    bar.appendChild(btn);
  }
  if (typeof window.renderTopicsGrid === "function") {
    var baseGrid = window.renderTopicsGrid;
    window.renderTopicsGrid = function () { baseGrid.apply(this, arguments); try { decorateHome(); } catch (e) {} };
  }

  window.MMParts = {
    open: openList, openExplorer: openExplorer, count: function () { return ASM.length; },
    cardPicture: cardPicture
  };
  try { var home = document.getElementById("homeScreen"); if (home && !home.hidden) decorateHome(); } catch (e) {}
})();
