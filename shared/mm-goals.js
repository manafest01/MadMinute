/* ===== Mad Minute Calendar + high scores (shared add-on) =====
   A Calendar tab in the bottom bar. The main score is time spent studying:
   - This week's minutes vs your best week (your high score: meet it or beat it)
   - Which days you studied this week (showing up every day is the point)
   - Today's minutes and your best single day
   - A month calendar with minutes per day; the best day gets a crown
   The daily XP goal stays, but only as a small gray line.

   Study time comes from the engine's own log (daily.act: seconds per day, one answer never
   counts for more than a minute, so leaving the app open doesn't inflate it). The engine keeps
   about two months of days; the high scores are saved separately so they last.
   Today's goal card leaves the home screen (it's kept, hidden, so the engine can still update it).

   Load it after shared/mm-home.js. Hooks goTab and show from outside; changes no core code. */
(function () {
  "use strict";
  var bar = document.getElementById("tabbar");
  if (!bar || typeof daily === "undefined" || typeof dayKey !== "function") return;
  var PREFIX = (typeof DAILY_KEY === "string" ? DAILY_KEY : "mm_daily_v1").replace(/_daily_v1$/, "");
  var HI_KEY = PREFIX + "_hiscore_v1";
  var DAY = 86400000;

  /* ---------- the screen ---------- */
  var sec = document.createElement("section");
  sec.id = "goalsScreen"; sec.hidden = true;
  sec.innerHTML =
    '<div class="back-row"><button class="icon-btn" type="button" aria-label="Back" id="mmgBack">←</button><h2>Calendar</h2></div>' +
    '<div class="stack mmg">' +
      '<div class="card stack mmg-week" id="mmgWeek"></div>' +
      '<div class="mmg-two" id="mmgTiles"></div>' +
      '<div class="card mmg-cal" id="mmgCal"></div>' +
      '<div class="mmg-goal" id="mmgGoal"></div>' +
    '</div>';
  var home = document.getElementById("homeScreen");
  home.parentNode.insertBefore(sec, home.nextSibling);
  document.getElementById("mmgBack").onclick = function () { showHome(); };
  try { SCREENS.push("goalsScreen"); } catch (e) {}
  try { TAB_FOR.goalsScreen = "goalsScreen"; } catch (e) {}

  /* ---------- the tab: a calendar icon, right after Map ---------- */
  var tab = document.createElement("button");
  tab.setAttribute("data-tab", "goalsScreen");
  tab.type = "button";
  tab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M8 14h2M14 14h2M8 17h2"/></svg>Calendar';
  tab.onclick = function () { openGoals(); };
  var mapBtn = bar.querySelector('[data-tab="mapScreen"]');
  if (mapBtn && mapBtn.nextSibling) bar.insertBefore(tab, mapBtn.nextSibling); else bar.appendChild(tab);
  if (typeof window.goTab === "function") {
    var baseTab = window.goTab;
    window.goTab = function (id) { if (id === "goalsScreen") { openGoals(); return; } return baseTab.apply(this, arguments); };
  }

  /* ---------- Today's goal card leaves home (kept hidden so the engine can still update it) ---------- */
  var dailyCard = document.getElementById("dailyCard");
  if (dailyCard) {
    var keep = document.createElement("div");
    keep.hidden = true; keep.id = "mmgKeep";
    keep.appendChild(dailyCard);
    sec.appendChild(keep);
  }

  /* ---------- numbers ---------- */
  function secOn(k) { var a = daily.act && daily.act[k]; return a ? a.sec || 0 : 0; }
  function keyOf(d) { return dayKey(d); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function weekStart(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -x.getDay()); }   // weeks run Sun–Sat
  function weekSec(start) { var s = 0; for (var i = 0; i < 7; i++) s += secOn(keyOf(addDays(start, i))); return s; }
  function mins(s) { if (!s) return "0"; var m = s / 60; return m < 1 ? "<1" : String(Math.round(m)); }
  function fmtDay(k) {
    var p = k.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  function loadHi() { try { return JSON.parse(localStorage.getItem(HI_KEY) || "null") || {}; } catch (e) { return {}; } }
  function saveHi(h) { try { localStorage.setItem(HI_KEY, JSON.stringify(h)); } catch (e) {} }
  // update the saved high scores from the days the engine still remembers
  function updateHi() {
    var h = loadHi(), changed = false, today = new Date();
    h.week = h.week || { sec: 0, start: null }; h.day = h.day || { sec: 0, key: null };
    var thisWeek = keyOf(weekStart(today));
    Object.keys(daily.act || {}).forEach(function (k) {
      var s = secOn(k);
      if (s > h.day.sec) { h.day = { sec: s, key: k }; changed = true; }
    });
    // completed weeks only count toward the record once they're over; this week is compared live
    for (var w = 1; w <= 9; w++) {
      var st = weekStart(addDays(today, -7 * w)), s = weekSec(st);
      if (s > h.week.sec) { h.week = { sec: s, start: keyOf(st) }; changed = true; }
    }
    if (changed) saveHi(h);
    return { hi: h, thisWeekKey: thisWeek };
  }

  /* ---------- drawing ---------- */
  var view = null;   // first day of the month being shown
  function openGoals() {
    show("goalsScreen");
    try { syncTabs("goalsScreen"); } catch (e) {}
    view = null;
    render();
  }
  function render() {
    var now = new Date(), todayK = keyOf(now);
    var info = updateHi(), hi = info.hi;
    var ws = weekStart(now), wSec = weekSec(ws), best = hi.week.sec || 0;
    var beat = wSec > best && best > 0, first = !best;

    // this week vs best week
    var pct = best ? Math.min(100, Math.round(wSec / best * 100)) : (wSec ? 100 : 0);
    var studied = 0, dots = "";
    for (var i = 0; i < 7; i++) {
      var d = addDays(ws, i), k = keyOf(d), on = secOn(k) > 0, future = k > todayK;
      if (on) studied++;
      dots += '<span class="mmg-dot' + (on ? " on" : "") + (k === todayK ? " today" : "") + (future ? " later" : "") + '">' +
        '<i>' + "SMTWTFS".charAt(i) + '</i><b>' + (on ? "✓" : "") + '</b></span>';
    }
    document.getElementById("mmgWeek").innerHTML =
      '<div class="eyebrow">This week</div>' +
      '<div class="mmg-big"><b>' + mins(wSec) + '</b> min studied</div>' +
      '<div class="mmg-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="mmg-sub">' + (first ? "Your first full week sets your high score."
        : beat ? '<span class="mmg-new">New high score!</span> Best week was ' + mins(best) + ' min.'
        : 'High score: <b>' + mins(best) + ' min</b> · ' + mins(Math.max(0, best - wSec)) + ' min to beat it') + '</div>' +
      '<div class="mmg-dots" aria-label="Days studied this week: ' + studied + ' of 7">' + dots + '</div>' +
      '<div class="mmg-sub">' + studied + ' of 7 days studied. A little every day beats a lot once a week.</div>';

    // today + best day
    var tSec = secOn(todayK), tXP = (daily.days && daily.days[todayK]) || 0;
    var bd = hi.day && hi.day.key ? hi.day : null;
    document.getElementById("mmgTiles").innerHTML =
      '<div class="card mmg-tile"><div class="eyebrow">Today</div><div class="mmg-num">' + mins(tSec) + ' <small>min</small></div>' +
        '<div class="mmg-sub">' + tXP + ' XP</div></div>' +
      '<div class="card mmg-tile mmg-hs"><div class="eyebrow">♛ Best day</div><div class="mmg-num">' + (bd ? mins(bd.sec) : "0") + ' <small>min</small></div>' +
        '<div class="mmg-sub">' + (bd ? fmtDay(bd.key) : "Not set yet") + '</div></div>';

    // month calendar
    if (!view) view = new Date(now.getFullYear(), now.getMonth(), 1);
    var first1 = new Date(view.getFullYear(), view.getMonth(), 1), daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    var cells = "";
    "SMTWTFS".split("").forEach(function (c) { cells += '<span class="mmg-h">' + c + '</span>'; });
    for (var b = 0; b < first1.getDay(); b++) cells += '<span></span>';
    for (var n = 1; n <= daysIn; n++) {
      var dk = keyOf(new Date(view.getFullYear(), view.getMonth(), n)), s = secOn(dk);
      var crown = bd && bd.key === dk, later = dk > todayK;
      cells += '<span class="mmg-c' + (s ? " on" : "") + (dk === todayK ? " today" : "") + (later ? " later" : "") + '">' +
        '<em>' + (crown ? "♛" : n) + '</em><small>' + (s ? mins(s) + "m" : (later ? "" : "·")) + '</small></span>';
    }
    var prevOk = new Date(view.getFullYear(), view.getMonth(), 0) >= addDays(now, -62);
    var nextOk = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= now;
    document.getElementById("mmgCal").innerHTML =
      '<div class="mmg-mhead"><button class="icon-btn" type="button" id="mmgPrev" aria-label="Previous month"' + (prevOk ? "" : " disabled") + '>‹</button>' +
      '<b>' + view.toLocaleDateString("en-US", { month: "long", year: "numeric" }) + '</b>' +
      '<button class="icon-btn" type="button" id="mmgNext" aria-label="Next month"' + (nextOk ? "" : " disabled") + '>›</button></div>' +
      '<div class="mmg-grid">' + cells + '</div>' +
      '<div class="mmg-sub">Minutes studied each day. ♛ = your best day.</div>';
    document.getElementById("mmgPrev").onclick = function () { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); render(); };
    document.getElementById("mmgNext").onclick = function () { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render(); };

    // the XP goal, small and gray
    var st = 0; try { st = currentStreak(); } catch (e) {}
    document.getElementById("mmgGoal").textContent = "Daily XP goal: " + tXP + " / " + (daily.goal || 100) +
      (st ? " · " + st + "-day streak" : "");
  }

  window.MMGoals = { open: openGoals, render: render };
})();
