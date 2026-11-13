/* ===== Mad Minute: pick up where you left off + test history (shared add-on) =====
   1) Pick up where you left off
      The app remembers your last practice round (subject, topic, when, what you missed).
      When you come back later (an hour or more), Home shows a "Pick up where you left off" card.
      Tap it: a short summary of where you stand, then 3 untimed refresh questions from last time
      (your misses first, then reviews that are due, then recent ones), then straight back into
      a normal practice round in that topic.
   2) Test history
      Every Placement test and every Skills checkup is saved as its own snapshot (date, score,
      level in each topic), so nothing gets overwritten. The Progress tab shows a "Test history"
      card: a bar per attempt and, for each attempt, what went up or down since the one before.
      Retaking Placement never lowers a level you already earned in practice; the snapshot still
      keeps that day's honest result.

   Like the other add-ons it hooks the engine from outside (beginQuiz, endQuiz, renderHome,
   renderProfile) and changes no core code. Load it after shared/mm-settings.js.
   To remove it: delete its <script> and <link> tags. Saved keys: <prefix>resume, <prefix>tests. */
(function () {
  "use strict";
  if (typeof BUILTIN_PACKS === "undefined" || !document.getElementById("homeScreen")) return;

  var PREFIX = String((BUILTIN_PACKS[0] && BUILTIN_PACKS[0].storeKey) || "mm_state_").split("state_")[0] || "mm_";
  var RESUME_KEY = PREFIX + "resume", TESTS_KEY = PREFIX + "tests";
  var AWAY_MS = 60 * 60 * 1000;        // the card shows once you've been away an hour or more
  var REFRESH_N = 3;                   // refresh questions before you're back in
  var MULTI = BUILTIN_PACKS.length > 1;

  function load(key, fallback) { try { var v = JSON.parse(localStorage.getItem(key) || "null"); return v == null ? fallback : v; } catch (e) { return fallback; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function packById(id) { return BUILTIN_PACKS.find(function (p) { return p.id === id; }); }
  function packLabel(p) { return p ? (p.short || p.name) : ""; }
  function lvName(n) { return n > 0 ? (LV_NAME[n] || "Level " + n) : "Starting out"; }
  function when(t) {
    var d = new Date(t), now = new Date();
    var day = d.toDateString() === now.toDateString() ? "Today"
      : d.toDateString() === new Date(now - 864e5).toDateString() ? "Yesterday"
      : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    return day + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  function shortDate(t) { return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }

  /* ================= 1) pick up where you left off ================= */
  // No saved round yet (practiced before this add-on existed)? Use the last question answered in any subject.
  function fromHistory() {
    var best = null;
    BUILTIN_PACKS.forEach(function (p) {
      var st = p.id === currentPack.id ? state : load(packStoreKey(p), null);
      var seen = (st && st.seen) || {};
      Object.keys(seen).forEach(function (id) {
        if (seen[id].t && (!best || seen[id].t > best.at)) best = { pack: p, id: id, at: seen[id].t };
      });
    });
    if (!best) return null;
    var q = buildBank(best.pack).find(function (x) { return x.id === best.id; });
    return q ? { pack: best.pack.id, topic: q.t, at: best.at, right: 0, total: 0, missed: [], derived: true } : null;
  }
  function lastSession() {
    var r = load(RESUME_KEY, null) || fromHistory();
    if (!r || !r.topic || !packById(r.pack)) return null;
    var p = packById(r.pack);
    var names = (p.order || Object.keys(p.topics)).map(function (k) { return p.topics[k]; });
    return names.indexOf(r.topic) >= 0 ? r : null;
  }
  function stillMissed(r) {
    if (r.derived) return allQuestions().filter(function (q) { return q.t === r.topic && state.missed[q.id]; }).length;
    return (r.missed || []).filter(function (id) { return state.missed[id] && byId(id); }).length;
  }
  function refreshQuestions(r) {
    var seen = state.seen || {}, out = [], used = {};
    var inTopic = allQuestions().filter(function (q) { return q.t === r.topic && !isFlagged(q.id); });
    function add(list) { list.forEach(function (q) { if (q && out.length < REFRESH_N && !used[q.id]) { used[q.id] = 1; out.push(q); } }); }
    add(shuffle((r.missed || []).map(byId).filter(function (q) { return q && q.t === r.topic && state.missed[q.id]; })));
    add(shuffle(inTopic.filter(function (q) { return state.missed[q.id]; })));
    add(dueList(r.topic));
    add(shuffle(inTopic.filter(function (q) { return seen[q.id]; })
      .sort(function (a, b) { return (seen[b.id].t || 0) - (seen[a.id].t || 0); }).slice(0, 10)));
    return out;
  }

  // Home card
  var pathCard = document.getElementById("pathCard");
  var card = document.createElement("button");
  card.type = "button"; card.id = "resumeCard"; card.className = "card resume-home"; card.hidden = true;
  if (pathCard) pathCard.parentNode.insertBefore(card, pathCard);
  card.onclick = function () { showResume(); };
  function renderCard() {
    var r = lastSession();
    var show = !!r && Date.now() - (r.at || 0) >= AWAY_MS;
    card.hidden = !show;
    if (!show) return;
    var p = packById(r.pack);
    var bits = [when(r.at).split(" · ")[0]];
    if (MULTI && p.id !== currentPack.id) bits.push(packLabel(p));
    if (r.total) bits.push(r.right + " of " + r.total + " right");
    card.innerHTML =
      '<div style="min-width:0;flex:1;"><div class="eyebrow">Pick up where you left off</div>' +
      '<div class="rec-topic">' + escapeHtml(r.topic) + '</div>' +
      '<div class="resume-meta">' + escapeHtml(bits.join(" · ")) + '</div></div>' +
      '<span class="btn btn-amber resume-go">Resume</span>';
  }

  // Summary screen
  var screen = document.createElement("section");
  screen.id = "resumeScreen"; screen.hidden = true;
  var home = document.getElementById("homeScreen");
  home.parentNode.insertBefore(screen, home.nextSibling);
  SCREENS.push("resumeScreen");
  if (typeof TAB_FOR !== "undefined") TAB_FOR.resumeScreen = "homeScreen";

  function showResume() {
    var r = lastSession();
    if (!r) { showHome(); return; }
    var p = packById(r.pack);
    if (p.id !== currentPack.id) activatePack(p);
    show("resumeScreen");
    var L = levelOf(r.topic), miss = stillMissed(r), due = dueList(r.topic).length;
    var qs = refreshQuestions(r);
    var lines = [];
    if (r.total) lines.push("Last round: <b>" + r.right + " of " + r.total + " right</b>");
    else if (!r.derived) lines.push("Last round wasn't finished");
    if (miss || due) lines.push("To work on: " + [miss ? miss + " missed question" + (miss > 1 ? "s" : "") : "", due ? due + " review" + (due > 1 ? "s" : "") + " due" : ""].filter(Boolean).join(" · "));
    var pathLine = "";
    if (typeof SHOP_PATH !== "undefined" && typeof pathStepInfo === "function") {
      var i = SHOP_PATH.findIndex(function (s) { var x = pathStepInfo(s); return x && x.pack.id === p.id && x.names.indexOf(r.topic) >= 0; });
      if (i >= 0) {
        var x = pathStepInfo(SHOP_PATH[i]);
        pathLine = '<div class="resume-path">Shop path · step ' + (i + 1) + ' of ' + SHOP_PATH.length + ': <b>' + escapeHtml(SHOP_PATH[i].name) + '</b><br>' +
          (x.done ? "Step complete" : x.reached + " of " + x.total + " topic" + (x.total > 1 ? "s" : "") + " at " + escapeHtml(lvName(UNLOCK_AT))) + '</div>';
      }
    }
    screen.innerHTML =
      '<div class="back-row"><button class="icon-btn" id="rsBack" aria-label="Back">←</button><h2>Welcome back</h2></div>' +
      '<div class="stack">' +
      '<div class="card glow stack">' +
        '<div class="eyebrow">Last time · ' + escapeHtml(when(r.at)) + '</div>' +
        '<div class="rm-big resume-topic">' + escapeHtml(r.topic) + '</div>' +
        (MULTI ? '<div class="muted">' + escapeHtml(p.name) + '</div>' : '') +
        '<div class="resume-level">' + pipsHTML(L) + '<span>' + escapeHtml(lvName(L)) + '</span></div>' +
        '<div class="resume-lines">' + lines.map(function (l) { return "<div>" + l + "</div>"; }).join("") + '</div>' +
        pathLine +
      '</div>' +
      '<div class="card stack">' +
        (qs.length
          ? '<div class="muted">Warm up with ' + qs.length + ' quick question' + (qs.length > 1 ? "s" : "") + ' from last time (no clock), then you\'re straight back into ' + escapeHtml(r.topic) + '.</div>' +
            '<button class="btn btn-amber btn-block" id="rsGo">Start refresh · ' + qs.length + ' question' + (qs.length > 1 ? "s" : "") + '</button>' +
            '<button class="btn btn-ghost btn-block" id="rsSkip">Skip to practice</button>'
          : '<div class="muted">Nothing to refresh yet, so you\'ll go straight back into ' + escapeHtml(r.topic) + '.</div>' +
            '<button class="btn btn-amber btn-block" id="rsSkip">Back into practice</button>') +
      '</div></div>';
    document.getElementById("rsBack").onclick = showHome;
    var go = document.getElementById("rsGo");
    if (go) go.onclick = function () { startRefresh(r, qs); };
    document.getElementById("rsSkip").onclick = function () { backInto(r.topic); };
  }
  function backInto(topic) {
    showHome();
    if (isUnlocked(topic)) startPractice(topic);
    else showToast(unlockNote(topic));
  }
  function startRefresh(r, qs) {
    if (!qs.length) { backInto(r.topic); return; }
    quiz = Object.assign(baseQuiz("refresh", "Refresh · " + r.topic), { questions: qs, topicName: r.topic });
    beginQuiz();
  }

  /* ================= 2) test history ================= */
  function tests() { var t = load(TESTS_KEY, []); return Array.isArray(t) ? t : []; }
  function saveTests(list) { save(TESTS_KEY, list.slice(-60)); }
  function score(s) {
    var v = Object.keys(s.levels || {}).map(function (k) { return s.levels[k] || 0; });
    return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / (4 * v.length) * 100) : 0;
  }
  function ckResults() {
    var d = load(PREFIX + "checkup", null);
    return d && d.results ? d : { results: {} };
  }
  function checkupSnapshot(sessionRight, sessionTotal) {
    var d = ckResults(), ids = Object.keys(d.results);
    if (!ids.length) return;
    var list = tests(), key = d.startedAt || 0;
    var s = list.find(function (x) { return x.kind === "checkup" && x.ck === key; });
    if (!s) { s = { kind: "checkup", ck: key, right: 0, total: 0 }; list.push(s); }
    s.at = Date.now();
    if (s.right != null) { s.right += sessionRight; s.total += sessionTotal; }
    s.levels = {};
    ids.forEach(function (id) { s.levels[id] = d.results[id].lv || 0; });
    try { s.of = MMLearn.pathTopics().length; } catch (e) {}
    saveTests(list);
  }
  // a checkup taken before this add-on existed still counts as attempt 1
  (function seed() {
    var d = ckResults();
    if (!Object.keys(d.results).length || tests().some(function (x) { return x.kind === "checkup"; })) return;
    var list = tests();
    var s = { kind: "checkup", ck: d.startedAt || 0, at: d.startedAt || Date.now(), right: null, total: null, levels: {} };
    Object.keys(d.results).forEach(function (id) { s.levels[id] = d.results[id].lv || 0; });
    list.unshift(s); saveTests(list);
  })();

  function topicLabel(s, key) {
    if (s.kind !== "checkup") return key;
    var bar = key.indexOf("|"), p = packById(key.slice(0, bar));
    return key.slice(bar + 1) + (MULTI && p ? " · " + packLabel(p) : "");
  }
  function chartSVG(list) {
    var shown = list.slice(-8), W = 300, H = 128, top = 18, base = 96, gap = 8;
    var bw = Math.min(42, (W - gap * (shown.length + 1)) / shown.length);
    var x0 = (W - (bw * shown.length + gap * (shown.length - 1))) / 2;
    var h = '<svg class="th-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Skill score by attempt">' +
      '<line x1="0" x2="' + W + '" y1="' + base + '" y2="' + base + '" class="th-axis"/>';
    shown.forEach(function (s, i) {
      var sc = score(s), bh = Math.max(3, (base - top) * sc / 100), x = x0 + i * (bw + gap);
      var last = i === shown.length - 1;
      h += '<rect x="' + x + '" y="' + (base - bh) + '" width="' + bw + '" height="' + bh + '" rx="4" class="' + (last ? "th-bar-now" : "th-bar") + '"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base - bh - 5) + '" class="th-val">' + sc + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base + 14) + '" class="th-lbl">#' + (list.length - shown.length + i + 1) + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (base + 25) + '" class="th-lbl">' + escapeHtml(shortDate(s.at)) + '</text>';
    });
    return h + '</svg>';
  }
  function groupHTML(title, list) {
    var h = '<div class="th-group"><div class="th-head"><b>' + escapeHtml(title) + '</b><span>' + list.length + ' attempt' + (list.length > 1 ? "s" : "") + '</span></div>';
    h += chartSVG(list);
    for (var i = list.length - 1; i >= 0; i--) {
      var s = list[i], prev = list[i - 1], sc = score(s);
      var diff = prev ? sc - score(prev) : null;
      var keys = Object.keys(s.levels || {});
      var at2 = keys.filter(function (k) { return s.levels[k] >= UNLOCK_AT; }).length;
      var meta = [at2 + " of " + (s.of || keys.length) + " topics at Lv " + UNLOCK_AT + "+"];
      if (s.total) meta.push(s.right + " of " + s.total + " right");
      if (s.kind === "checkup" && s.of && keys.length < s.of) meta.push(keys.length + " of " + s.of + " checked");
      h += '<details class="th-att"><summary><span class="th-n">#' + (i + 1) + '</span><span class="th-d">' + escapeHtml(shortDate(s.at)) + '</span>' +
        '<span class="th-s">' + sc + '%</span>' +
        (diff === null ? '<span class="th-delta">first</span>' : '<span class="th-delta ' + (diff > 0 ? "up" : diff < 0 ? "down" : "") + '">' + (diff > 0 ? "▲ +" : diff < 0 ? "▼ " : "= ") + (diff || "") + '</span>') +
        '</summary><div class="th-meta">' + escapeHtml(meta.join(" · ")) + '</div>';
      keys.forEach(function (k) {
        var now = s.levels[k], was = prev && prev.levels ? prev.levels[k] : undefined;
        var cls = was === undefined ? "" : now > was ? "up" : now < was ? "down" : "";
        h += '<div class="th-row"><span>' + escapeHtml(topicLabel(s, k)) + '</span><span class="th-lv ' + cls + '">' +
          (was === undefined ? "" : was + " → ") + now + (cls === "up" ? " ▲" : cls === "down" ? " ▼" : "") + '</span></div>';
      });
      h += '</details>';
    }
    return h + '</div>';
  }
  var histCard = document.createElement("div");
  histCard.className = "card stack th-card"; histCard.id = "testHistory";
  var histTitle = document.createElement("div");
  histTitle.className = "section-title"; histTitle.textContent = "Test history";
  var tl = document.getElementById("profTimeline");
  if (tl) {
    var tlTitle = tl.previousElementSibling;
    var anchor = tlTitle && tlTitle.classList.contains("section-title") ? tlTitle : tl;
    anchor.parentNode.insertBefore(histTitle, anchor);
    anchor.parentNode.insertBefore(histCard, anchor);
  }
  function renderHistory() {
    var list = tests().sort(function (a, b) { return a.at - b.at; });
    if (!list.length) {
      histCard.innerHTML = '<div class="muted">Take <b>Placement</b> or the <b>Skills checkup</b>. Every attempt is saved here, so you can study, retake it and watch your score climb.</div>';
      return;
    }
    var groups = [], byKey = {};
    list.forEach(function (s) {
      var key = s.kind === "checkup" ? "checkup" : "placement|" + s.pack;
      if (!byKey[key]) {
        byKey[key] = { title: s.kind === "checkup" ? "Skills checkup" + (MULTI ? " · all subjects" : "") : "Placement" + (MULTI ? " · " + (s.packName || s.pack) : ""), list: [] };
        groups.push(byKey[key]);
      }
      byKey[key].list.push(s);
    });
    histCard.innerHTML = '<div class="muted th-note">Skill score = your average level across the topics tested (level 4 in all = 100). Tap an attempt to see each topic.</div>' +
      groups.map(function (g) { return groupHTML(g.title, g.list); }).join("");
  }

  /* ================= hooks into the engine ================= */
  var origBegin = beginQuiz;
  beginQuiz = function () {
    var r = origBegin.apply(this, arguments);
    if (quiz && quiz.mode === "practice" && quiz.topicName) {
      save(RESUME_KEY, { pack: currentPack.id, topic: quiz.topicName, at: Date.now(), right: 0, total: 0, missed: [] });
    }
    if (quiz && quiz.mode === "refresh") {                  // a warm-up: no clock
      clearInterval(quiz.timerId); clearInterval(quiz.qTimerId);
      quiz.timed = false;
      document.getElementById("quizTimer").hidden = true;
      document.getElementById("qtimerRow").hidden = true;
      document.getElementById("endBtn").textContent = "Skip to practice";
    }
    return r;
  };

  var origEnd = endQuiz;
  endQuiz = function () {
    var Q = quiz;
    if (Q && Q.mode === "refresh") {
      clearInterval(Q.timerId); clearInterval(Q.qTimerId);
      quiz = null;
      var c = Q.log.filter(function (l) { return l.correct; }).length;
      if (Q.log.length) addEvent("session", "Refresh · " + Q.topicName, c + " of " + Q.log.length + " correct");
      saveState();
      if (Q.log.length) showToast("Refresh: " + c + " of " + Q.log.length + " · back into " + Q.topicName);
      backInto(Q.topicName);
      return;
    }
    var mode = Q && Q.mode, packNow = currentPack;
    var right = Q ? Q.log.filter(function (l) { return l.correct; }).length : 0, total = Q ? Q.log.length : 0;
    var out = origEnd.apply(this, arguments);
    try {
      if (mode === "practice" && Q.topicName) {
        save(RESUME_KEY, {
          pack: packNow.id, topic: Q.topicName, at: Date.now(), right: right, total: total,
          missed: Q.log.filter(function (l) { return !l.correct; }).map(function (l) { return l.q.id; })
        });
      } else if (mode === "placement") {
        // keep levels already earned in practice; the snapshot keeps the honest test result
        var kept = 0;
        Object.keys(Q.results || {}).forEach(function (t) {
          var before = (Q.levelsBefore || {})[t] || 0;
          if (before > (state.topicLevel[t] || 0)) { state.topicLevel[t] = before; kept++; }
        });
        if (kept) { saveState(); showToast("Saved. Your practice levels were kept where they were higher."); }
        var levels = {};
        CORE_TOPICS.forEach(function (t) { levels[t] = (Q.results || {})[t] || 0; });
        var list = tests();
        list.push({ kind: "placement", pack: packNow.id, packName: packNow.name, at: Date.now(), right: right, total: total, levels: levels });
        saveTests(list);
      } else if (mode === "checkup") {
        checkupSnapshot(right, total);
      }
    } catch (e) {}
    return out;
  };

  var origHome = renderHome;
  renderHome = function () { var r = origHome.apply(this, arguments); try { renderCard(); } catch (e) {} return r; };
  var origProfile = renderProfile;
  renderProfile = function () { var r = origProfile.apply(this, arguments); try { renderHistory(); } catch (e) {} return r; };
  try { renderCard(); } catch (e) {}

  window.MMResume = { showResume: showResume, tests: tests, lastSession: lastSession };
})();
