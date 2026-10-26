/* MATHFEST — navigation, door selection and PDF previews. */
"use strict";

/* ==MAPPING-START==
   CENTRAL MAPPING: class number -> list of 15 presentation paths.
   Entry 1 is Door 01, entry 15 is Door 15.
   >>> EXAMPLE FILENAMES: replace any path below with your real file's path. <<<
   Paths are relative to index.html. */
const PRESENTATIONS = {
  9: [
    "presentations/class-9/set-01.pdf",
    "presentations/class-9/set-02.pdf",
    "presentations/class-9/set-03.pdf",
    "presentations/class-9/set-04.pdf",
    "presentations/class-9/set-05.pdf",
    "presentations/class-9/set-06.pdf",
    "presentations/class-9/set-07.pdf",
    "presentations/class-9/set-08.pdf",
    "presentations/class-9/set-09.pdf",
    "presentations/class-9/set-10.pdf",
    "presentations/class-9/set-11.pdf",
    "presentations/class-9/set-12.pdf",
    "presentations/class-9/set-13.pdf",
    "presentations/class-9/set-14.pdf",
    "presentations/class-9/set-15.pdf"
  ],
  10: [
    "presentations/class-10/set-01.pdf",
    "presentations/class-10/set-02.pdf",
    "presentations/class-10/set-03.pdf",
    "presentations/class-10/set-04.pdf",
    "presentations/class-10/set-05.pdf",
    "presentations/class-10/set-06.pdf",
    "presentations/class-10/set-07.pdf",
    "presentations/class-10/set-08.pdf",
    "presentations/class-10/set-09.pdf",
    "presentations/class-10/set-10.pdf",
    "presentations/class-10/set-11.pdf",
    "presentations/class-10/set-12.pdf",
    "presentations/class-10/set-13.pdf",
    "presentations/class-10/set-14.pdf",
    "presentations/class-10/set-15.pdf"
  ],
  11: [
    "presentations/class-11/set-01.pdf",
    "presentations/class-11/set-02.pdf",
    "presentations/class-11/set-03.pdf",
    "presentations/class-11/set-04.pdf",
    "presentations/class-11/set-05.pdf",
    "presentations/class-11/set-06.pdf",
    "presentations/class-11/set-07.pdf",
    "presentations/class-11/set-08.pdf",
    "presentations/class-11/set-09.pdf",
    "presentations/class-11/set-10.pdf",
    "presentations/class-11/set-11.pdf",
    "presentations/class-11/set-12.pdf",
    "presentations/class-11/set-13.pdf",
    "presentations/class-11/set-14.pdf",
    "presentations/class-11/set-15.pdf"
  ],
  12: [
    "presentations/class-12/set-01.pdf",
    "presentations/class-12/set-02.pdf",
    "presentations/class-12/set-03.pdf",
    "presentations/class-12/set-04.pdf",
    "presentations/class-12/set-05.pdf",
    "presentations/class-12/set-06.pdf",
    "presentations/class-12/set-07.pdf",
    "presentations/class-12/set-08.pdf",
    "presentations/class-12/set-09.pdf",
    "presentations/class-12/set-10.pdf",
    "presentations/class-12/set-11.pdf",
    "presentations/class-12/set-12.pdf",
    "presentations/class-12/set-13.pdf",
    "presentations/class-12/set-14.pdf",
    "presentations/class-12/set-15.pdf"
  ]
};
/* ==MAPPING-END== */

const CLASSES = [9, 10, 11, 12];
const DOORS_PER_CLASS = 15;
const SET_TIME_SECONDS = 90;

const STORAGE_KEY = "mathfest-opened-doors";

/* ---------- State ---------- */
let currentClass = null;
let coordinatorMode = false;
let lastDoor = null;
let opened = loadOpened();
let timerRemaining = SET_TIME_SECONDS;
let timerDeadline = null;
let timerInterval = null;

function loadOpened() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
}
function saveOpened() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(opened)); } catch (e) { /* storage unavailable: state stays in memory */ }
}
const pad = (n) => String(n).padStart(2, "0");
const isOpened = (cls, door) => (opened[cls] || []).includes(door);
const pathFor = (cls, door) => (PRESENTATIONS[cls] || [])[door - 1];

/* ---------- Elements ---------- */
const $ = (id) => document.getElementById(id);
const viewLanding = $("view-landing"), viewDoors = $("view-doors");
const grid = $("doorGrid"), overlay = $("overlay");
const previewOverlay = $("previewOverlay"), pdfFrame = $("pdfFrame");

/* ---------- Rendering ---------- */
function renderClassCards() {
  $("classCards").innerHTML = "";
  CLASSES.forEach((cls) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "class-card";
    b.innerHTML = "CLASS " + cls + "<small>15 doors</small>";
    b.addEventListener("click", () => { location.hash = "#/class-" + cls; });
    $("classCards").appendChild(b);
  });
}

/* One reusable renderer for all four classes */
function renderDoors(cls) {
  grid.innerHTML = "";
  for (let n = 1; n <= DOORS_PER_CLASS; n++) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "door"; b.dataset.door = n;
    if (isOpened(cls, n)) b.classList.add("opened");
    b.setAttribute("aria-label", "Class " + cls + ", Door " + pad(n) + (isOpened(cls, n) ? ", opened" : ""));
    b.innerHTML = '<span class="door-num">' + pad(n) + '</span><span class="door-label">DOOR ' + pad(n) + '</span><span class="door-badge"></span>';
    b.addEventListener("click", () => selectDoor(cls, n, b));
    grid.appendChild(b);
  }
}

/* ---------- Navigation (hash routes: #/class-9 ... #/class-12) ---------- */
function route() {
  closePanel();
  closePreview();
  const m = /^#\/class-(9|10|11|12)$/.exec(location.hash);
  if (m) {
    currentClass = Number(m[1]);
    $("classTitle").textContent = "CLASS " + currentClass;
    renderDoors(currentClass);
    viewLanding.hidden = true; viewDoors.hidden = false;
    $("btnBackClasses").hidden = false; $("btnReset").hidden = false;
  } else {
    currentClass = null;
    viewDoors.hidden = true; viewLanding.hidden = false;
    $("btnBackClasses").hidden = true; $("btnReset").hidden = true;
  }
}

/* ---------- Opening a presentation ---------- */
function selectDoor(cls, door, button) {
  lastDoor = door;
  grid.querySelectorAll(".door.selected").forEach((d) => d.classList.remove("selected"));
  button.classList.add("selected");
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600;
  showPanel("Opening Class " + cls + ", Set " + pad(door) + "…", "Door " + pad(door) + " selected.", []);
  setTimeout(() => openPresentation(cls, door), delay);
}

async function openPresentation(cls, door) {
  const path = pathFor(cls, door);
  if (!path) return showError(cls, door, "No presentation is mapped to this door in script.js.");
  const url = new URL(path, location.href).href;

  // Check the file exists. Browsers only allow this when served over http(s).
  if (/^https?:/.test(location.protocol)) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (!res.ok) return showError(cls, door, "The file was not found at: " + path);
    } catch (e) {
      return showError(cls, door, "The file could not be reached at: " + path);
    }
  }
  showPreview(cls, door, url);
  if (!coordinatorMode) markOpened(cls, door);
}

function markOpened(cls, door) {
  if (!isOpened(cls, door)) { (opened[cls] = opened[cls] || []).push(door); saveOpened(); }
  if (currentClass === cls) renderDoors(cls);
}

function showError(cls, door, detail) {
  showPanel("Presentation not available",
    "Class " + cls + ", Set " + pad(door) + ". " + detail + " Check the file name and folder, then retry.",
    [button("Retry", () => openPresentation(cls, door)), button("Back to Doors", closePanel, true)], true);
}

function showPreview(cls, door, url) {
  closePanel();
  $("previewTitle").textContent = "Class " + cls + " · Set " + pad(door);
  $("openPdfTab").href = url;
  $("btnMarkPreview").hidden = !coordinatorMode || isOpened(cls, door);
  resetTimer();
  pdfFrame.src = url + "#toolbar=1&navpanes=0&view=FitH";
  previewOverlay.hidden = false;
  $("btnClosePreview").focus();
}

function closePreview() {
  if (previewOverlay.hidden) return;
  stopTimer();
  previewOverlay.hidden = true;
  pdfFrame.src = "about:blank";
  const door = lastDoor && grid.querySelector('[data-door="' + lastDoor + '"]');
  if (door) door.focus();
}

function renderTimer() {
  const minutes = Math.floor(timerRemaining / 60);
  const seconds = timerRemaining % 60;
  $("timerDisplay").textContent = String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  $("setTimer").classList.toggle("timer-expired", timerRemaining === 0);
  $("btnStartTimer").disabled = timerInterval !== null || timerRemaining === 0;
  $("btnStartTimer").textContent = timerRemaining === SET_TIME_SECONDS ? "Start" : "Resume";
  $("btnStopTimer").disabled = timerInterval === null;
  $("timerDisplay").setAttribute("aria-label", timerRemaining === 0 ? "Time is up" : minutes + " minutes " + seconds + " seconds remaining");
}

function resetTimer() {
  stopTimer();
  timerRemaining = SET_TIME_SECONDS;
  renderTimer();
}

function startTimer() {
  if (timerInterval !== null || timerRemaining === 0) return;
  timerDeadline = Date.now() + timerRemaining * 1000;
  timerInterval = window.setInterval(() => {
    timerRemaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    renderTimer();
    if (timerRemaining === 0) {
      window.clearInterval(timerInterval);
      timerInterval = null;
      timerDeadline = null;
      $("setTimer").classList.add("timer-expired");
      $("btnStartTimer").textContent = "Time's up";
      $("btnStartTimer").disabled = true;
      $("btnStopTimer").disabled = true;
    }
  }, 200);
  renderTimer();
}

function stopTimer() {
  if (timerInterval === null) return;
  timerRemaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
  window.clearInterval(timerInterval);
  timerInterval = null;
  timerDeadline = null;
  renderTimer();
}

/* ---------- Status panel ---------- */
function button(text, fn) { const b = document.createElement("button"); b.type = "button"; b.textContent = text; b.addEventListener("click", fn); return b; }
function showPanel(title, text, actions, isError) {
  $("panelTitle").textContent = title; $("panelText").textContent = text;
  const box = $("panelActions"); box.innerHTML = ""; actions.forEach((a) => box.appendChild(a));
  overlay.querySelector(".panel").classList.toggle("error", !!isError);
  overlay.hidden = false;
  overlay.querySelector(".panel").focus();
}
function closePanel() {
  overlay.hidden = true;
  grid.querySelectorAll(".door.selected").forEach((d) => d.classList.remove("selected"));
  const d = lastDoor && grid.querySelector('[data-door="' + lastDoor + '"]');
  if (d) d.focus();
}

/* ---------- Controls ---------- */
$("btnHome").addEventListener("click", () => { location.hash = ""; route(); });
$("btnBackClasses").addEventListener("click", () => { location.hash = ""; route(); });
$("btnReset").addEventListener("click", () => {
  if (currentClass && confirm("Reset all opened doors for Class " + currentClass + "?")) {
    opened[currentClass] = []; saveOpened(); renderDoors(currentClass);
  }
});
$("btnCoord").addEventListener("click", (e) => {
  coordinatorMode = !coordinatorMode;
  e.target.setAttribute("aria-pressed", coordinatorMode);
  e.target.textContent = "Coordinator Mode: " + (coordinatorMode ? "On" : "Off");
  $("btnMarkPreview").hidden = !coordinatorMode || !currentClass || !lastDoor || isOpened(currentClass, lastDoor);
});
$("btnFull").addEventListener("click", () => {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  } catch (e) { /* full screen unavailable: press F11 instead */ }
});
$("btnClosePreview").addEventListener("click", closePreview);
$("btnStartTimer").addEventListener("click", startTimer);
$("btnStopTimer").addEventListener("click", stopTimer);
$("btnMarkPreview").addEventListener("click", () => {
  if (currentClass && lastDoor) {
    markOpened(currentClass, lastDoor);
    $("btnMarkPreview").hidden = true;
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!previewOverlay.hidden) closePreview();
    else if (!overlay.hidden) closePanel();
  }
});
window.addEventListener("hashchange", route);

renderClassCards();
route();
