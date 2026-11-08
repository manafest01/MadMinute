/* ===== Mad Minute compact home (shared add-on) =====
   Makes the top of the home screen take less room, in every app:
   1) Placement test + Skills checkup share one "Tests" card: two buttons side by side,
      one close X and one "Don't show this again" box. (The X and the box come from each app.)
   2) The path card is one line: the step, its name and Go. The Map tab shows the whole path.
   3) The Team / Crew overview card is gone from home: the Team / Crew tab opens the same screen.
   4) Once you're placed, the Tests card goes away, the roadmap card (from mm-learn.js) shows
      in a slimmer style, Today's goal and your rank share one slim row, and "Fill your next gap"
      is one line like the path card.

   Load it after shared/mm-learn.js. Like the other add-ons, it hooks renderHome from outside
   and changes no core code. To remove it: delete its <script> and <link> tags. */
(function () {
  "use strict";
  var place = document.getElementById("placeCard");
  if (!place) return;

  // 1) rebuild the placement card as the Tests card (same ids, so the app's code still works)
  place.classList.add("mmh-tests");
  place.innerHTML =
    '<button class="place-x" type="button" onclick="closePlaceCard()" aria-label="Close the tests card">✕</button>' +
    '<div class="eyebrow">Tests</div>' +
    '<h3 class="mmh-h">Where do you stand?</h3>' +
    '<div class="mmh-two">' +
      '<button class="mmh-btn mmh-main" type="button" id="mmhPlace"><b>Placement</b><span>Find your level</span></button>' +
      '<button class="mmh-btn" type="button" id="mmhCheck"><b>Skills checkup</b><span>Gaps and a roadmap</span></button>' +
    '</div>' +
    '<div class="mmh-hint">Tap <b>Not sure</b> instead of guessing. Every miss is explained at the end.</div>' +
    '<label class="place-never"><input type="checkbox" id="placeNever"> Don\'t show this again</label>';
  document.getElementById("mmhPlace").onclick = function () { startPlacement(); };
  document.getElementById("mmhCheck").onclick = function () {
    if (window.MMLearn && MMLearn.showRoadmap) MMLearn.showRoadmap();
    else { var ck = document.getElementById("ckCard"); if (ck) ck.click(); }
  };

  // 4) after placement: Today's goal and your rank share one slim row
  var daily = document.getElementById("dailyCard"), rank = document.getElementById("rankCard");
  var stats = null;
  if (daily && rank) {
    stats = document.createElement("div");
    stats.className = "mmh-stats"; stats.id = "mmhStats";
    daily.parentNode.insertBefore(stats, daily);
    stats.appendChild(daily); stats.appendChild(rank);
  }

  // after every home redraw: the roadmap card only shows once you're placed
  var hidByUs = false;
  function tidy() {
    if (stats) {
      stats.hidden = daily.hidden && rank.hidden;
      stats.classList.toggle("one", daily.hidden !== rank.hidden);
    }
    var ck = document.getElementById("ckCard");
    if (!ck) return;
    var placed = false;
    try { placed = !!state.placed; } catch (e) {}
    if (!placed) { if (!ck.hidden) { ck.hidden = true; hidByUs = true; } }
    else if (hidByUs) { ck.hidden = false; hidByUs = false; }
    ck.classList.add("mmh-slim");
  }
  if (typeof window.renderHome === "function") {
    var base = window.renderHome;
    window.renderHome = function () { var r = base.apply(this, arguments); try { tidy(); } catch (e) {} return r; };
  }
  try { tidy(); } catch (e) {}
})();
