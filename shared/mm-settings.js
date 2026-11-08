/* ===== Mad Minute Settings screen (shared add-on) =====
   A gear button at the top of the home screen opens Settings, with everything about you
   and how the app behaves in one place:
   - Profile: your name (saved on this device), your rank, a link to your full progress
   - Account: where your progress is saved, plus sign-in placeholders (company sign-in or email)
   - Appearance: System / Light / Dark
   - Practice: Timed or Study, Recall first or Show choices, daily XP goal, Retake placement
   - Data: Reset (in the demo build)
   The controls are the app's own, moved here with their ids, so they keep working.
   The old theme button in the header is hidden; the gear takes its place.

   Load it after shared/mm-goals.js. Hooks nothing in the core; changes no core code. */
(function () {
  "use strict";
  var app = document.getElementById("homeScreen");
  if (!app) return;
  var PREFIX = (typeof DAILY_KEY === "string" ? DAILY_KEY : "mm_daily_v1").replace(/_daily_v1$/, "");
  var NAME_KEY = PREFIX + "_profile_name";

  /* ---------- the screen ---------- */
  var sec = document.createElement("section");
  sec.id = "settingsScreen"; sec.hidden = true;
  sec.innerHTML =
    '<div class="back-row"><button class="icon-btn" type="button" aria-label="Back" id="mmsBack">←</button><h2>Settings</h2></div>' +
    '<div class="stack mms-page">' +
      '<div class="mms-h">Profile</div>' +
      '<div class="card mms-profile">' +
        '<div class="mms-avatar" id="mmsAvatar" aria-hidden="true">?</div>' +
        '<div class="mms-pmain">' +
          '<label class="mms-label" for="mmsName">Your name</label>' +
          '<input id="mmsName" type="text" maxlength="40" autocomplete="name" placeholder="Add your name">' +
          '<div class="mms-rank" id="mmsRank"></div>' +
        '</div>' +
      '</div>' +
      '<button class="card mms-link" type="button" id="mmsProgress"><span>Your progress and timeline</span><span aria-hidden="true">›</span></button>' +

      '<div class="mms-h">Account</div>' +
      '<div class="card mms-acct">' +
        '<div class="mms-row"><b>Sign in</b><span class="mms-pill">Coming soon</span></div>' +
        '<button class="btn btn-ghost mms-signin" type="button" id="mmsCompany">Sign in with your company</button>' +
        '<button class="btn btn-ghost mms-signin" type="button" id="mmsEmail">Use an email instead</button>' +
        '<div class="mms-note" id="mmsSync"></div>' +
        '<div class="mms-note">Your company will be able to give you a sign-in, so your progress follows you to any phone and your manager sees your training. Until then, keep using the same phone and browser.</div>' +
      '</div>' +

      '<div class="mms-h">Appearance</div>' +
      '<div class="seg" role="group" aria-label="Theme" id="mmsTheme">' +
        '<button type="button" data-t="system">System</button><button type="button" data-t="light">Light</button><button type="button" data-t="dark">Dark</button>' +
      '</div>' +

      '<div class="mms-h">Practice</div>' +
      '<div class="card stack mms-practice" id="mmsPractice"></div>' +

      '<div class="mms-h" id="mmsDataH" hidden>Data</div>' +
      '<div class="card stack" id="mmsData" hidden></div>' +
    '</div>';
  app.parentNode.insertBefore(sec, app.nextSibling);
  try { SCREENS.push("settingsScreen"); } catch (e) {}
  document.getElementById("mmsBack").onclick = function () { showHome(); };
  document.getElementById("mmsProgress").onclick = function () { showProfile(); };
  // sign-in placeholders: company sign-in (SSO) per company, or email; needs an online database first
  function soon() { try { showToast("Sign-in is coming soon"); } catch (e) {} }
  document.getElementById("mmsCompany").onclick = soon;
  document.getElementById("mmsEmail").onclick = soon;

  /* ---------- the gear button replaces the theme button in the header ---------- */
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    var gear = document.createElement("button");
    gear.className = "icon-btn"; gear.type = "button"; gear.id = "mmsGear";
    gear.setAttribute("aria-label", "Settings");
    gear.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
    gear.onclick = function () { openSettings(); };
    themeBtn.parentNode.insertBefore(gear, themeBtn);
    themeBtn.hidden = true;
  }

  /* ---------- move the app's own controls in (same ids, so they keep working) ---------- */
  var practice = document.getElementById("mmsPractice");
  var modeWrap = document.getElementById("modeWrap");
  if (modeWrap) practice.appendChild(modeWrap);
  var goalSel = document.getElementById("goalSelect");
  if (goalSel && goalSel.parentNode) practice.appendChild(goalSel.parentNode);
  var retake = document.getElementById("retakeBtn");
  if (retake) { var rw = document.createElement("div"); rw.className = "mms-retake"; rw.appendChild(retake); practice.appendChild(rw); }

  /* ---------- profile name ---------- */
  var nameIn = document.getElementById("mmsName");
  function getName() { try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; } }
  function initials(n) { var p = n.trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?"; }
  nameIn.addEventListener("input", function () {
    try { localStorage.setItem(NAME_KEY, nameIn.value.trim()); } catch (e) {}
    document.getElementById("mmsAvatar").textContent = initials(nameIn.value);
  });

  /* ---------- theme ---------- */
  function themeNow() { try { return currentTheme(); } catch (e) { return "system"; } }
  function renderTheme() {
    var t = themeNow();
    Array.prototype.forEach.call(document.querySelectorAll("#mmsTheme button"), function (b) {
      var on = b.getAttribute("data-t") === t;
      b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("#mmsTheme button"), function (b) {
    b.onclick = function () {
      var t = b.getAttribute("data-t");
      try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
      try { applyTheme(t); } catch (e) {}
      renderTheme();
    };
  });

  /* ---------- open ---------- */
  function openSettings() {
    show("settingsScreen");
    if (modeWrap) modeWrap.hidden = false;           // home hides it before placement; Settings always shows it
    try { renderModeToggle(); } catch (e) {}
    if (goalSel) try { goalSel.value = String(daily.goal); } catch (e) {}
    var n = getName();
    nameIn.value = n;
    document.getElementById("mmsAvatar").textContent = initials(n);
    var r = null; try { r = rankInfo(); } catch (e) {}
    document.getElementById("mmsRank").textContent = r ? "Rank: " + r.name : "";
    var sync = document.getElementById("syncStatus");
    document.getElementById("mmsSync").textContent = sync ? sync.textContent : "Progress is saved on this device.";
    // the demo build's Reset button lives on the progress screen; bring it here
    var data = document.getElementById("mmsData");
    if (!data.children.length && sync && sync.parentElement) {
      Array.prototype.forEach.call(sync.parentElement.querySelectorAll("button"), function (b) {
        if (/^Reset/.test(b.textContent)) data.appendChild(b);
      });
    }
    document.getElementById("mmsDataH").hidden = data.hidden = !data.children.length;
    renderTheme();
  }

  window.MMSettings = { open: openSettings };
})();
