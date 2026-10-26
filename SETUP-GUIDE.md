# MATHFEST — Math Sprint (Round 1): Setup Guide

## 1. Files
```
mathfest/
├── index.html   style.css   script.js   START-WINDOWS.bat
└── presentations/class-9 | class-10 | class-11 | class-12/   (15 files each)
```

## 2. Where to put your PDFs
Copy each class's 15 PDF files into its folder. The site expects these names:
`set-01.pdf` … `set-15.pdf` (Door 01 → set-01, Door 15 → set-15).

## 3. Connecting your real files
**Option A (easiest):** rename your files to the example names above.
**Option B:** leave the names alone and edit the mapping at the top of `script.js`.
Each class is a list of 15 paths, in door order:
```js
9: [ "presentations/class-9/MyFirstQuiz.pdf", ... ]
```
Avoid renaming mid-list: the first path is Door 01, the fifteenth is Door 15.

## 4. Running on Windows
**Recommended (full checks):** install Python, then double-click `START-WINDOWS.bat`.
It starts a local server and opens http://localhost:8000/index.html. Keep its window open.
**Simplest (no install):** double-click `index.html`. Everything works, but missing files cannot be detected.

## 5. PDF preview and browser notes
- Choosing a door opens its PDF in an in-page preview. Use the built-in PDF controls to zoom, navigate, or print. "Open in new tab" is available as a fallback.
- Each preview includes a 90-second set timer. Start begins the countdown, Stop pauses it, and Resume continues from the remaining time. Opening a different set resets the timer to 90 seconds.
- PDF display depends on the browser's built-in PDF viewer. If it is disabled, use "Open in new tab" and configure the browser to display PDFs.
- Missing-file detection only works over http (the .bat method). From a plain folder (`file://`), the browser blocks that check.
- Full Screen needs a click (browser rule). F11 also works.
- Opened-door marks are kept in the browser (localStorage), so use the same browser on event day. "Reset Door Selections" clears them for the current class.

## 6. Coordinator Mode
Off: a door is marked OPENED automatically when its PDF preview opens.
On: nothing is marked automatically; use "Mark Door as Opened" in the preview. Failed or missing files are never marked.

## 7. Pre-event testing checklist
- [ ] Open the site on the event laptop and projector; check the resolution and Full Screen.
- [ ] All four class cards open the right class; each shows exactly 15 doors (01–15).
- [ ] Back to Classes, Home, Reset and Coordinator Mode work in every class.
- [ ] Click EVERY door in every class (60 total): the correct PDF previews in the page.
- [ ] Test one missing file: friendly error, Retry and Back to Doors work.
- [ ] Close the PDF preview: the door grid and opened marks are still there.
- [ ] Reset door selections before the event starts.
- [ ] Keyboard check: Tab, Enter, Esc.
- [ ] Keep a copy of the whole folder on a USB drive.
