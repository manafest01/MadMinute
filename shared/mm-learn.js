/* ===== Mad Minute shared learning layer =====
   One file loaded by every app (Auto, Biology, Music, Dev), so a fix here reaches all of them.
   It adapts to whatever app loads it: its subjects, topic order, level names and saved-data keys.

   1) Recall first: hides the answer choices until you've pulled the answer from memory (typing it
      is optional). That's active recall, which builds memory far better than recognizing a right answer.
   2) Skills checkup: one adaptive test across every subject, in learning-path order, about two
      questions per topic. Each topic is saved as soon as it's settled, so you can stop and resume.
   3) Roadmap: what you have, what's missing and your next three moves, from the checkup plus
      everything practiced afterwards. Can be copied as text for a manager, teacher or mentor.

   Optional settings, set before this file loads:
     window.MM_LEARN = { recall: "on" | "off" }   // Recall first default for this app (default "on")

   It hooks renderQuestion(), answer(), record(), beginQuiz(), endQuiz() and renderHome() from outside,
   the same way Smart jump does, so the core engine stays untouched.
   To remove it from an app: delete the two lines that load shared/mm-learn.css and mm-learn.js. */
(function () {
  "use strict";
  if (typeof BUILTIN_PACKS === "undefined" || !document.getElementById("quizOptions")) return;

  var CFG = window.MM_LEARN || {};
  // each app's keys start with its own prefix (mmauto_, mmbio_, mmmus_, mmdev_)
  var PREFIX = String((BUILTIN_PACKS[0] && BUILTIN_PACKS[0].storeKey) || "mm_state_").split("state_")[0] || "mm_";
  var RECALL_KEY = PREFIX + "recall", CK_KEY = PREFIX + "checkup";
  var BAR = typeof UNLOCK_AT === "number" ? UNLOCK_AT : 2;   // level 2: the bar for "done" on a path step
  var MULTI = BUILTIN_PACKS.length > 1;

  function packById(id) { return BUILTIN_PACKS.find(function (p) { return p.id === id; }); }
  function orderOf(p) { return (p.order || Object.keys(p.topics)).filter(function (k) { return p.topics[k]; }); }
  function namesOf(p) { return orderOf(p).map(function (k) { return p.topics[k]; }); }
  function stateOf(p) {
    if (p.id === currentPack.id) return state;
    try { return JSON.parse(localStorage.getItem(packStoreKey(p)) || "null") || {}; } catch (e) { return {}; }
  }
  function lv(n) { return (typeof LV_NAME !== "undefined" && LV_NAME[n]) || ("Level " + n); }
  function shortName(p) { return p.short || p.name; }
  function scopeText() { return MULTI ? "all " + BUILTIN_PACKS.length + " subjects" : "every topic"; }

  /* ---------- 1) recall first ---------- */
  function recallOn() {
    try { var v = localStorage.getItem(RECALL_KEY); if (v) return v === "on"; } catch (e) {}
    return CFG.recall !== "off";
  }
  function setRecall(on) {
    try { localStorage.setItem(RECALL_KEY, on ? "on" : "off"); } catch (e) {}
    renderRecallToggle();
    showToast(on ? "Recall first: on" : "Recall first: off");
  }
  function renderRecallToggle() {
    var a = document.getElementById("recallOnBtn"), b = document.getElementById("recallOffBtn");
    if (!a) return;
    var on = recallOn();
    a.classList.toggle("on", on); b.classList.toggle("on", !on);
    a.setAttribute("aria-pressed", on); b.setAttribute("aria-pressed", !on);
  }
  var modeWrap = document.getElementById("modeWrap");
  if (modeWrap) {
    var row = document.createElement("div");
    row.className = "recall-row";
    row.innerHTML =
      '<div class="seg" role="group" aria-label="How answers appear">' +
      '<button id="recallOnBtn">Recall first</button><button id="recallOffBtn">Show choices</button></div>' +
      '<div class="recall-note">Recall first hides the choices until you’ve pulled the answer from memory. Slower, but it sticks.</div>';
    modeWrap.appendChild(row);
    document.getElementById("recallOnBtn").onclick = function () { setRecall(true); };
    document.getElementById("recallOffBtn").onclick = function () { setRecall(false); };
    renderRecallToggle();
  }
  var opts = document.getElementById("quizOptions");
  var box = document.createElement("div");
  box.className = "recall-box"; box.id = "recallBox"; box.hidden = true;
  box.innerHTML =
    '<div class="recall-hint">Answer it in your head first. Typing it is optional, but it makes you commit.</div>' +
    '<textarea id="recallText" rows="2" placeholder="Your answer (optional)" aria-label="Your answer"></textarea>' +
    '<button class="btn btn-teal btn-block" id="recallReveal">Show choices</button>';
  opts.parentNode.insertBefore(box, opts);
  var ta = document.getElementById("recallText");
  document.getElementById("recallReveal").onclick = reveal;
  ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); reveal(); } });

  function startRecall() {
    var use = quiz && quiz.cur && quiz.mode !== "placement" && quiz.mode !== "checkup" && recallOn();
    box.hidden = !use; opts.hidden = !!use;
    if (!use) return;
    quiz.cur.recalling = true;
    quiz.paused = true;                       // both clocks stop while you think
    ta.value = "";
  }
  function reveal() {
    if (!quiz || !quiz.cur || !quiz.cur.recalling) return;
    quiz.cur.recalling = false;
    quiz.cur.recallText = ta.value.trim();
    quiz.recalls = (quiz.recalls || 0) + 1;
    quiz.paused = false;
    quiz.questionStart = performance.now();   // answer time counts from when the choices appear
    box.hidden = true; opts.hidden = false;
    ta.blur();
    var first = opts.querySelector(".option");
    if (first && !("ontouchstart" in window)) first.focus();
  }

  /* ---------- 2) skills checkup ---------- */
  function ckLoad() {
    try { var d = JSON.parse(localStorage.getItem(CK_KEY) || "null"); if (d && d.results) return d; } catch (e) {}
    return { results: {} };
  }
  function ckSave(d) { try { localStorage.setItem(CK_KEY, JSON.stringify(d)); } catch (e) {} }

  // every topic, in learning-path order when the app has a path, then everything else in subject order
  function pathTopics() {
    var out = [], seen = {};
    function add(p, k) {
      var name = p.topics[k], id = p.id + "|" + name;
      if (!name || seen[id]) return;
      seen[id] = 1; out.push({ pack: p, name: name, id: id });
    }
    var path = typeof SHOP_PATH !== "undefined" ? SHOP_PATH : [];
    path.forEach(function (step) {
      var p = packById(step.pack); if (!p) return;
      (step.keys || orderOf(p)).forEach(function (k) { add(p, k); });
    });
    BUILTIN_PACKS.forEach(function (p) { orderOf(p).forEach(function (k) { add(p, k); }); });
    return out;
  }
  var bankCache = {};
  function bankFor(p) {
    if (!bankCache[p.id]) bankCache[p.id] = buildBank(p).map(function (q) {
      return Object.assign({}, q, { id: p.id + ":" + q.id, pk: p.id });
    });
    return bankCache[p.id];
  }
  function pickQ(item, level, used) {
    var list = bankFor(item.pack).filter(function (q) { return q.t === item.name && q.lv === level && !used[q.id]; });
    return list.length ? shuffle(list)[0] : null;
  }
  // save one topic's result right away: into the checkup record and that subject's own progress (never lowering it)
  function saveTopic(item, level) {
    var d = ckLoad();
    d.results[item.id] = { lv: level, at: Date.now() };
    if (!d.startedAt) d.startedAt = Date.now();
    ckSave(d);
    var p = item.pack;
    if (p.id === currentPack.id) {
      state.topicLevel[item.name] = Math.max(state.topicLevel[item.name] || 0, level);
      state.placed = true;
      saveState();
    } else {
      var key = packStoreKey(p), st = null;
      try { st = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) {}
      if (!st) st = freshState();
      st.topicLevel = st.topicLevel || {};
      st.topicLevel[item.name] = Math.max(st.topicLevel[item.name] || 0, level);
      st.placed = true;
      st.updatedAt = Date.now();
      try { localStorage.setItem(key, JSON.stringify(st)); } catch (e) {}
    }
  }
  // per topic: a level-2 question first; right → try level 3, wrong → try level 1
  function ckAdvance(ck, correct) {
    var item = ck.items[ck.ti];
    if (!item) return;
    if (ck.stage === 2) { ck.stage = correct ? 3 : 1; return; }
    saveTopic(item, ck.stage === 3 ? (correct ? 3 : 2) : (correct ? 1 : 0));
    ck.settled++;
    ck.ti++; ck.stage = 2;
  }
  function ckNext(ck) {
    while (ck.ti < ck.items.length) {
      var q = pickQ(ck.items[ck.ti], ck.stage, ck.used);
      if (q) { ck.used[q.id] = 1; return q; }
      ck.ti++; ck.stage = 2;                  // no question at that level: skip the topic for now
    }
    return null;
  }
  function startCheckup() {
    var all = pathTopics(), done = ckLoad().results;
    var items = all.filter(function (it) { return !done[it.id]; });
    if (!items.length) { showRoadmap(); return; }
    quiz = Object.assign(baseQuiz("checkup", "Skills checkup"), {
      questions: [],
      ck: { items: items, ti: 0, stage: 2, used: {}, lastLen: 0, total: all.length, before: all.length - items.length, settled: 0 }
    });
    beginQuiz();
  }

  /* ---------- 3) roadmap ---------- */
  function topicStatus(item, results) {
    var st = stateOf(item.pack) || {};
    var practiced = (st.topicLevel || {})[item.name] || 0;
    var r = results[item.id];
    var checked = !!r || practiced > 0 || !!(st.stats && st.stats[item.name]);
    return { lv: Math.max(practiced, r ? r.lv : 0), checked: checked };
  }
  function tagFor(s) {
    if (!s.checked) return { cls: "none", text: "Not checked" };
    if (s.lv <= 0) return { cls: "gap", text: "Gap" };
    if (s.lv < BAR) return { cls: "shaky", text: lv(s.lv) };
    if (s.lv === BAR) return { cls: "ok", text: lv(s.lv) };
    return { cls: "strong", text: lv(s.lv) };
  }
  function roadmapData() {
    var results = ckLoad().results, items = pathTopics();
    var rows = items.map(function (it) { return { item: it, s: topicStatus(it, results) }; });
    var checked = rows.filter(function (r) { return r.s.checked; });
    var moves = [];
    // walk the path in order: the first checked topics still below the bar are the next moves
    rows.forEach(function (r) { if (moves.length < 3 && r.s.checked && r.s.lv < BAR) moves.push(r); });
    if (moves.length < 3) rows.forEach(function (r) { if (moves.length < 3 && !r.s.checked) moves.push(r); });
    var avg = checked.length ? checked.reduce(function (n, r) { return n + r.s.lv; }, 0) / checked.length : 0;
    return {
      rows: rows, checked: checked.length, total: rows.length, moves: moves, avg: avg,
      strong: checked.filter(function (r) { return r.s.lv > BAR; }),
      atBar: rows.filter(function (r) { return r.s.lv >= BAR; }).length,
      ckDone: Object.keys(results).filter(function (id) { return items.some(function (it) { return it.id === id; }); }).length
    };
  }
  function whyText(r) {
    if (!r.s.checked) return "Not checked yet";
    if (r.s.lv <= 0) return "Gap · start with " + lv(1) + " questions";
    return "At " + lv(r.s.lv) + " · push it to " + lv(BAR);
  }
  function where(item) { return MULTI ? shortName(item.pack) + " · " : ""; }
  function goTopic(item) {
    if (item.pack.id !== currentPack.id) activatePack(item.pack);
    showHome();
    if (state.placed) startPractice(item.name);
  }

  var section = document.createElement("section");
  section.id = "roadmapScreen"; section.hidden = true;
  var home = document.getElementById("homeScreen");
  home.parentNode.insertBefore(section, home.nextSibling);
  SCREENS.push("roadmapScreen");
  if (typeof TAB_FOR !== "undefined") TAB_FOR.roadmapScreen = "homeScreen";

  var retakeArmed = false;
  function showRoadmap(afterCheckup) {
    show("roadmapScreen");
    var d = roadmapData();
    var left = d.total - d.ckDone;
    var rankIdx = Math.min(4, Math.floor(d.avg + 1e-9));
    var html = '<div class="back-row"><button class="icon-btn" id="rmBack" aria-label="Back">←</button><h2>Your roadmap</h2></div><div class="stack">';

    html += '<div class="card glow stack"><div class="eyebrow">Skills checkup · ' + scopeText() + '</div>' +
      '<div class="rm-big">' + d.atBar + ' of ' + d.total + ' topics at ' + escapeHtml(lv(BAR)) + '+</div>' +
      '<div class="ck-bar"><i style="width:' + Math.round(d.atBar / d.total * 100) + '%"></i></div>' +
      '<div class="muted">' + (d.checked
        ? 'Overall you test around <b>' + escapeHtml(RANKS[rankIdx] || RANKS[0]) + '</b> across the ' + d.checked + ' topics checked so far.'
        : 'One test across ' + scopeText() + ', easy to hard. About two questions per topic (' + d.total * 2 + ' at most). Stop any time; it picks up where you left off.') + '</div>' +
      (afterCheckup ? '<div class="muted"><b>Checkup saved.</b> ' + (MULTI ? 'Each subject’s' : 'Your') + ' levels now start from these results.</div>' : '') +
      '<div class="row-btns">' +
      (left > 0 ? '<button class="btn btn-amber" id="rmStart">' + (d.ckDone ? 'Continue checkup (' + left + ' left)' : 'Take the skills checkup') + '</button>' : '') +
      (d.ckDone ? '<button class="btn btn-ghost" id="rmRetake">Retake checkup</button>' : '') +
      '</div></div>';

    html += '<div class="card stack"><div class="eyebrow">Your next 3 moves</div>';
    if (!d.checked) html += '<div class="muted">Take the checkup and this fills in with the three topics that will move you most, in learning order.</div>';
    else if (!d.moves.length) html += '<div class="muted">Every topic is at ' + escapeHtml(lv(BAR)) + ' or better. Push your weakest ones toward ' + escapeHtml(lv(4)) + ' with timed rounds and Recall first.</div>';
    else {
      html += '<ol class="rm-moves">';
      d.moves.forEach(function (r, i) {
        html += '<li class="rm-move"><span class="rm-num">' + (i + 1) + '</span><div class="rm-txt"><div class="rm-name">' + escapeHtml(r.item.name) +
          '</div><div class="rm-why">' + escapeHtml(where(r.item) + whyText(r)) + '</div></div>' +
          '<button class="btn btn-teal" data-go="' + escapeHtml(r.item.id) + '">Go</button></li>';
      });
      html += '</ol>';
    }
    html += '</div>';

    if (d.strong.length) {
      html += '<div class="card stack"><div class="eyebrow">Strengths</div><div class="rm-strengths">' +
        d.strong.map(function (r) { return '<span class="rm-tag strong">' + escapeHtml(r.item.name) + '</span>'; }).join("") + '</div></div>';
    }

    html += '<div class="section-title">Full map</div><div class="rm-legend">' +
      [["none", "Not checked"], ["gap", "Gap"], ["shaky", lv(1)], ["ok", lv(BAR)], ["strong", lv(BAR + 1) + "+"]].map(function (a) {
        return '<span class="rm-tag ' + a[0] + '">' + escapeHtml(a[1]) + '</span>';
      }).join("") + '</div>';
    BUILTIN_PACKS.forEach(function (p) {
      var names = namesOf(p);
      var rows = d.rows.filter(function (r) { return r.item.pack.id === p.id; })
        .sort(function (a, b) { return names.indexOf(a.item.name) - names.indexOf(b.item.name); });
      var ok = rows.filter(function (r) { return r.s.lv >= BAR; }).length;
      html += '<div class="card rm-subject"><div class="rm-subject-head"><b>' + escapeHtml(p.name) + '</b><span>' + ok + ' / ' + rows.length + ' at ' + escapeHtml(lv(BAR)) + '+</span></div>';
      rows.forEach(function (r) {
        var t = tagFor(r.s);
        html += '<div class="rm-row"><span>' + escapeHtml(r.item.name) + '</span><span class="rm-tag ' + t.cls + '">' + escapeHtml(t.text) + '</span></div>';
      });
      html += '</div>';
    });

    html += '<div class="muted">Levels go ' + [1, 2, 3, 4].map(lv).map(escapeHtml).join(" → ") + '. The checkup can place you up to ' + escapeHtml(lv(3)) +
      '; ' + escapeHtml(lv(4)) + ' is earned in practice. Your map updates as you practice.</div>' +
      '<button class="btn btn-ghost btn-block" id="rmCopy">Copy roadmap as text</button></div>';
    section.innerHTML = html;

    document.getElementById("rmBack").onclick = showHome;
    var s = document.getElementById("rmStart"); if (s) s.onclick = startCheckup;
    var rt = document.getElementById("rmRetake");
    retakeArmed = false;
    if (rt) rt.onclick = function () {
      if (!retakeArmed) { retakeArmed = true; rt.textContent = "Tap again to clear checkup results"; return; }
      ckSave({ results: {} });
      showToast("Checkup cleared. Practice levels are kept.");
      showRoadmap();
    };
    section.querySelectorAll("[data-go]").forEach(function (b) {
      b.onclick = function () {
        var it = pathTopics().find(function (x) { return x.id === b.getAttribute("data-go"); });
        if (it) goTopic(it);
      };
    });
    document.getElementById("rmCopy").onclick = function () { copyRoadmap(d); };
  }
  function copyRoadmap(d) {
    var lines = [document.title + " · roadmap · " + new Date().toLocaleDateString(), d.atBar + " of " + d.total + " topics at " + lv(BAR) + " or better", ""];
    if (d.checked && d.moves.length) {
      lines.push("Next moves:");
      d.moves.forEach(function (r, i) { lines.push((i + 1) + ". " + r.item.name + (MULTI ? " (" + shortName(r.item.pack) + ")" : "") + " — " + whyText(r)); });
      lines.push("");
    }
    BUILTIN_PACKS.forEach(function (p) {
      lines.push(p.name + ":");
      d.rows.filter(function (r) { return r.item.pack.id === p.id; }).forEach(function (r) { lines.push("  " + r.item.name + ": " + tagFor(r.s).text); });
    });
    var text = lines.join("\n");
    function fallback() {
      var x = document.createElement("textarea"); x.value = text; document.body.appendChild(x); x.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) {}
      x.remove(); showToast(ok ? "Roadmap copied" : "Couldn't copy on this device");
    }
    try { navigator.clipboard.writeText(text).then(function () { showToast("Roadmap copied"); }, fallback); } catch (e) { fallback(); }
  }

  // Home card: start the checkup, or show the next move once there are results
  var place = document.getElementById("placeCard");
  var ckCard = document.createElement("button");
  ckCard.className = "card stack ck-home"; ckCard.id = "ckCard";
  place.parentNode.insertBefore(ckCard, place);
  ckCard.onclick = function () { showRoadmap(); };
  function renderCkCard() {
    var d = roadmapData();
    var next = d.checked && d.moves[0];
    ckCard.innerHTML = d.ckDone
      ? '<div class="eyebrow">Your roadmap · ' + d.atBar + ' of ' + d.total + ' topics at ' + escapeHtml(lv(BAR)) + '+</div>' +
        '<div class="rec-topic">' + (next ? 'Next: ' + escapeHtml(next.item.name) : 'Every topic at ' + escapeHtml(lv(BAR)) + '+') + '</div>' +
        '<div class="ck-meta">' + (next ? escapeHtml(where(next.item) + whyText(next)) : 'Keep pushing toward ' + escapeHtml(lv(4))) +
        (d.ckDone < d.total ? ' · checkup ' + d.ckDone + ' of ' + d.total + ' done' : '') + '</div>' +
        '<div class="ck-bar"><i style="width:' + Math.round(d.atBar / d.total * 100) + '%"></i></div>'
      : '<div class="eyebrow">Skills checkup · ' + scopeText() + '</div>' +
        '<div class="rec-topic">Find your gaps, get a roadmap</div>' +
        '<div class="ck-meta">One test across everything, easy to hard. About 2 questions per topic. Stop any time.</div>';
  }

  /* ---------- hooks into the engine ---------- */
  var origRender = renderQuestion;
  renderQuestion = function () {
    if (quiz && quiz.mode === "checkup") {
      var ck = quiz.ck;
      if (quiz.log.length > ck.lastLen) { ck.lastLen = quiz.log.length; ckAdvance(ck, quiz.log[quiz.log.length - 1].correct); }
      var q = ckNext(ck);
      if (!q) { endQuiz(); return; }
      quiz.questions[quiz.idx] = q;
      var r = origRender.apply(this, arguments);
      var it = ck.items[ck.ti];
      document.getElementById("quizTopicTag").textContent = where(it) + it.name;
      document.getElementById("quizCount").textContent = "Topic " + (ck.before + ck.ti + 1) + " of " + ck.total + " · tap Not sure instead of guessing";
      document.getElementById("quizProgress").style.width = Math.round((ck.before + ck.ti) / ck.total * 100) + "%";
      box.hidden = true; opts.hidden = false;
      return r;
    }
    var out = origRender.apply(this, arguments);
    try { startRecall(); } catch (e) {}
    return out;
  };

  var origAnswer = answer;
  answer = function () {
    if (quiz && quiz.cur && quiz.cur.recalling) return;      // choices are hidden until revealed
    var cur = quiz && quiz.cur;
    var r = origAnswer.apply(this, arguments);
    try {
      var ex = document.getElementById("quizExplain");
      if (cur && cur.recallText && !ex.hidden) {
        var you = document.createElement("div");
        you.className = "recall-you";
        you.innerHTML = "<b>You recalled:</b>" + escapeHtml(cur.recallText);
        ex.appendChild(you);
      }
    } catch (e) {}
    return r;
  };

  // checkup answers count toward today's practice minutes, but not toward one subject's stats
  var origRecord = record;
  record = function (q, correct, ms) {
    if (quiz && quiz.mode === "checkup") { try { logActivity(ms, correct); saveDaily(); } catch (e) {} return; }
    return origRecord.apply(this, arguments);
  };

  var origBegin = beginQuiz;
  beginQuiz = function () {
    var r = origBegin.apply(this, arguments);
    if (quiz && quiz.mode === "checkup") {                   // the checkup measures you: no clock
      clearInterval(quiz.timerId); clearInterval(quiz.qTimerId);
      quiz.timed = false;
      document.getElementById("quizTimer").hidden = true;
      document.getElementById("qtimerRow").hidden = true;
      var hud = document.querySelector("#quizScreen .hud"); if (hud) hud.hidden = true;
      document.getElementById("endBtn").textContent = "Stop and save";
    }
    return r;
  };

  var origEnd = endQuiz;
  endQuiz = function () {
    if (quiz && quiz.mode === "checkup") {
      clearInterval(quiz.timerId); clearInterval(quiz.qTimerId);
      var Q = quiz; quiz = null;
      var ck = Q.ck;
      if (Q.log.length > ck.lastLen) { ck.lastLen = Q.log.length; ckAdvance(ck, Q.log[Q.log.length - 1].correct); }
      // stopped right after getting the level-2 question right: that topic is at least level 2
      if (ck.ti < ck.items.length && ck.stage === 3) { saveTopic(ck.items[ck.ti], 2); ck.settled++; }
      if (ck.settled) {
        addEvent("placement", "Skills checkup", ck.settled + " topics checked · " +
          Q.log.filter(function (l) { return l.correct; }).length + " of " + Q.log.length + " correct");
        saveState();
      }
      invalidateQuestions();
      showRoadmap(ck.settled > 0);
      return;
    }
    return origEnd.apply(this, arguments);
  };

  var origHome = renderHome;
  renderHome = function () {
    var r = origHome.apply(this, arguments);
    try { renderCkCard(); renderRecallToggle(); } catch (e) {}
    return r;
  };
  try { renderCkCard(); } catch (e) {}

  window.MMLearn = { startCheckup: startCheckup, showRoadmap: showRoadmap, roadmapData: roadmapData, pathTopics: pathTopics, recallOn: recallOn, prefix: PREFIX };
})();
