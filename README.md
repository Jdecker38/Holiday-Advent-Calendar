# Holiday Advent Calendar 2026 — Website

A mobile-first static website built from the **original Illustrator mountain illustration**, **LEGO train animation PNG layers**, and **maroon-and-gold Advent Calendar UI assets** from the previous Power Apps project.

## Preview locally

The simplest way: open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>. (The site also works from file:// in many browsers, but local HTTP is more reliable.)

## Deploy to GitHub Pages

The repository is `Jdecker38/Holiday-Advent-Calendar`. Its GitHub connection was read-only and the repository had no files when this version was prepared, so the files have **not** been pushed automatically.

1. Copy the **contents of this folder** into your local clone of the repository (not a surrounding extra folder).
2. Commit and push them to `main`.
3. GitHub repo **Settings → Pages → Build and deployment → Deploy from a branch**: choose `main` and `/ (root)`; save.
4. Your published site will ordinarily be at `https://jdecker38.github.io/Holiday-Advent-Calendar/` once Pages finishes deploying (this is the expected URL, not a verified live deployment).
5. Generate the QR code from the **live Pages URL**, not the GitHub repository URL.

If starting from an empty repository:

```bash
git clone https://github.com/Jdecker38/Holiday-Advent-Calendar.git
cd Holiday-Advent-Calendar
# Copy all files from this downloaded web package here.
git add .
git commit -m "Build mobile-first Advent Calendar website"
git push origin main
```

## Change artwork

Replace images in `assets/` while keeping filenames. `JulefestMountain.webp` is the transparent export of the Illustrator mountain. Keep the area around the mountain transparent so the sign and Santa show around its silhouette. The aurora, star, and snow are separate effects, and the train canvas draws separate LEGO train PNGs.

## Update chapters

Edit the `CHAPTERS` object near the top of `script.js`. Chapter 1 is available; chapters 2 and 3 are *intentionally locked*. Change `unlocked` to `true` once their story and brief text are ready. Calendar dates are not automatically enforced yet.

## Add your custom song

Replace `assets/JulefestSong.mp3` with your own audio file (same name). The included audio file is a **temporary original placeholder** from the earlier prototype, not your final custom song. Browsers generally require a tap before audio starts, so use the speaker control.

## Train animation

The locomotive pulls three matching carriages. Adjust the crossing time with `TRAIN_TRAVEL_MS` and the vertical position with `TRAIN_BASELINE` in `script.js`. The wheels use four image frames and the locomotive coupling rod moves in sync. The train is **clickable** when on screen and opens Chapter 1.

Turn on **Sound** for the music and the train effects. The whistle and rolling sound start as the train approaches. The pitch drops as it passes, and the sound fades after the last carriage leaves.

## Mobile & accessibility

- Maintains the entire illustration in frame (no zoom-in on chapter navigation).
- Portrait-first CSS; desktop adds an introduction panel alongside the mountain.
- Escape/back control closes chapter; focus is returned to the originating control.
- Respects `prefers-reduced-motion`.
- No cookies, analytics, database, or sign-in requirements.
- Static GitHub Pages is publicly accessible if published from a public repository. Don't put private LEGO data or unreleased internal information into a publicly deployed version without approval.

## Files

- `index.html` — interface and semantic markup
- `styles.css` — responsive design and maroon/gold storybook styling
- `script.js` — train, snowfall, chapter interactions, music
- `assets/` — original artwork, your conductor render, and replaceable graphics/audio
- `favicon.svg` — simple holiday icon
