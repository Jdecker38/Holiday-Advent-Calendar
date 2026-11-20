
/**
 * HOLIDAY ADVENT CALENDAR 2026
 * Complete Website Script
 *
 * Train: 1 locomotive + 2 matching passenger carriages
 * Animation loop: 22 seconds
 * All original graphics and chapter interactions preserved
 */

'use strict';

const ASSET = 'assets/';

// ==========================================
// WEBSITE ELEMENTS
// ==========================================

const scene = document.getElementById('mountainScene');
const experience = document.querySelector('.experience');
const overlay = document.getElementById('chapterOverlay');
const dialog = overlay.querySelector('.chapter-dialog');
const dialogInner = document.getElementById('dialogInner');
const closeDialogButton = document.getElementById('closeDialog');

const music = document.getElementById('backgroundMusic');
const musicButton = document.getElementById('musicButton');
const dialogMusicButton = document.getElementById('dialogMusicButton');

const trainCanvas = document.getElementById('trainCanvas');
const trainHotspot = document.getElementById('trainHotspot');
const snowCanvas = document.getElementById('snowCanvas');
const starGlow = document.getElementById('starGlow');

const motionReduced = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
);

let priorFocus = null;
let lastTimestamp = 0;
let trainProgress = 0;
let trainX = 0;
let trainY = 0;
let trainWidth = 0;
let trainHeight = 0;
let snow = [];
let musicPlaying = false;

// ==========================================
// CHAPTER INFORMATION
// ==========================================

const CHAPTERS = {
  1: {
    unlocked: true,
    title: 'Chapter 1',
    guideTitle: 'The Holiday Express',
    image: 'Chapter1Conductor.jpg',
    imageDescription: 'The LEGO Holiday Express in a snowy landscape',

    story: [
      'Every holiday season, the employees of the LEGO Workshop gather for a very special tradition. Together, they board the candy-fueled Holiday Express and begin their journey through the snowy landscape to the top of Mount “Julefest”.',

      'At the top, a magical holiday celebration awaits, filled with lights, music, laughter, and LEGO holiday spirit.'
    ],

    brief: 'With only 10 elements from the stock (NO REDBRICK ELEMENTS) build your own characters who will join us on this magical trip!'
  },

  2: {
    unlocked: false,
    title: 'Chapter 2',
    unlockMessage: 'Unlocks Week 2'
  },

  3: {
    unlocked: false,
    title: 'Chapter 3',
    unlockMessage: 'Unlocks Week 3'
  }
};

// ==========================================
// CHAPTER CONTROLS
// ==========================================

function makeElement(tag, className, text) {
  const elem = document.createElement(tag);

  if (className) elem.className = className;
  if (text) elem.textContent = text;

  return elem;
}

function openChapter(number) {
  const chapter = CHAPTERS[number];
  if (!chapter) return;

  priorFocus = document.activeElement;
  dialogInner.replaceChildren();

  if (chapter.unlocked) {
    const heading = makeElement('h2', 'dialog-title', chapter.title);
    heading.id = 'dialogHeading';
    dialogInner.append(heading);

    if (chapter.image) {
      const picture = makeElement('img', 'story-picture');
      picture.src = ASSET + chapter.image;
      picture.alt = chapter.imageDescription ?? '';
      dialogInner.append(picture);
    }

    for (const paragraph of chapter.story) {
      dialogInner.append(
        makeElement('p', 'story-text', paragraph)
      );
    }

    const brief = makeElement('div', 'brief-card');
    const briefHeading = makeElement('h3', 'brief-heading');
    const marker = makeElement('span', 'brief-marker');
    marker.dataset.state = 'available';
    marker.setAttribute('aria-hidden', 'true');
    marker.append(makeElement('span', 'chapter-marker'));
    briefHeading.append(marker, 'Build challenge');
    brief.append(briefHeading, makeElement('p', '', chapter.brief));

    dialogInner.append(brief);
  } else {
    const content = makeElement('div', 'locked-content');
    const marker = makeElement('span', 'locked-marker');
    marker.setAttribute('aria-hidden', 'true');
    marker.append(makeElement('span', 'lock-icon'));

    const heading = makeElement('h2', 'dialog-title', chapter.title);
    heading.id = 'dialogHeading';

    content.append(
      marker,
      heading,
      makeElement('p', 'coming-soon', 'COMING SOON'),
      makeElement('p', '', chapter.unlockMessage)
    );

    dialogInner.append(content);
  }

  overlay.hidden = false;
  experience.inert = true;
  document.body.style.overflow = 'hidden';
  dialog.scrollTop = 0;
  closeDialogButton.focus();
}

function closeChapter() {
  overlay.hidden = true;
  experience.inert = false;
  document.body.style.overflow = '';

  if (priorFocus?.focus) priorFocus.focus();
}

document.querySelectorAll('[data-chapter]').forEach(button => {
  const number = Number(button.dataset.chapter);
  const chapter = CHAPTERS[number];
  if (!chapter) return;

  button.dataset.state = chapter.unlocked ? 'available' : 'locked';
  if (button.classList.contains('chapter-plaque')) {
    button.setAttribute('aria-label', chapter.unlocked
      ? `Week ${number}, open Chapter ${number}`
      : `Week ${number}, coming soon`);
  }

  const title = button.querySelector('.guide-title');
  if (title) {
    title.textContent = chapter.unlocked
      ? chapter.guideTitle ?? chapter.title
      : 'Coming soon';
  }
  const note = button.querySelector('.guide-note');
  if (note) note.hidden = !chapter.unlocked;

  button.addEventListener('click', () => openChapter(number));
});

trainHotspot.addEventListener('click', () => openChapter(1));
closeDialogButton.addEventListener('click', closeChapter);

overlay.querySelector('[data-close]').addEventListener(
  'click',
  closeChapter
);

document.addEventListener('keydown', event => {
  if (overlay.hidden) return;

  if (event.key === 'Escape') closeChapter();

  if (event.key === 'Tab') {
    const items = [
      closeDialogButton,
      dialogMusicButton
    ];

    const current = items.indexOf(document.activeElement);
    const direction = event.shiftKey ? -1 : 1;

    event.preventDefault();

    items[
      (current + direction + items.length) % items.length
    ].focus();
  }
});

// ==========================================
// HOLIDAY MUSIC
// ==========================================

function updateMusicButton() {
  const label = musicPlaying ? 'Mute holiday music' : 'Play holiday music';
  const status = musicPlaying ? 'Music on' : 'Music off';
  for (const button of [musicButton, dialogMusicButton]) {
    button.setAttribute('aria-pressed', String(musicPlaying));
    button.setAttribute('aria-label', label);
    button.querySelector('.music-label').textContent = status;
  }
}

async function toggleMusic() {
  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    updateMusicButton();
    return;
  }

  try {
    await music.play();
    musicPlaying = true;
  } catch (error) {
    musicPlaying = false;
    console.warn('Music could not play:', error);
  }

  updateMusicButton();
}

musicButton.addEventListener('click', toggleMusic);
dialogMusicButton.addEventListener('click', toggleMusic);

music.addEventListener('ended', () => {
  musicPlaying = false;
  updateMusicButton();
});

// ==========================================
// TRAIN CONFIGURATION
// ==========================================

/*
 * TRAIN STRUCTURE:
 *
 * CART 1: Blue locomotive
 * CART 2: Brown passenger carriage
 * CART 3: Copy of Cart 2
 *
 * Drawing order:
 *
 * 1. LEGO rails
 * 2. All train bodies
 * 3. Passenger carriage wheels
 * 4. Passenger carriage wheel covers
 * 5. Locomotive wheels
 * 6. Locomotive connecting rod
 *
 * Same wheel animation for both passenger
 * carriages, but rendered independently.
 */

const TRAIN_ASSETS = {
  locomotive: 'Train_2026_Wagon_1.png',
  carriage: 'Train_2026_Wagon_2.png',
  rail: 'Train_2026_Straight_Rail.png',

  carriageWheelCover:
    'Train-Animation-Layers_0025_Cart-2-Wheel-Covers.png',

  engineConnector:
    'Train-Animation-Layers_0012_Cart-1-Wheel-Connector.png'
};

// ==========================================
// TRAIN SIZE AND POSITION
// ==========================================

const ENGINE_W = 1188;
const ENGINE_H = 598;

const CARRIAGE_W = 1141;
const CARRIAGE_H = 594;

// Position of the first passenger carriage.
const PASSENGER_OFFSET_X = 1034;
const PASSENGER_OFFSET_Y = 4;

// Distance between passenger carriages.
const CARRIAGE_STEP_X = 1030;

// Both passenger carriage locations.
const CARRIAGE_POSITIONS = [
  PASSENGER_OFFSET_X,
  PASSENGER_OFFSET_X + CARRIAGE_STEP_X
];

const TRAIN_TOTAL_WIDTH = Math.max(
  ENGINE_W,
  CARRIAGE_POSITIONS[1] + CARRIAGE_W
);

const TRAIN_IMAGE_HEIGHT = Math.max(
  ENGINE_H,
  PASSENGER_OFFSET_Y + CARRIAGE_H
);

// Keep the individual carriages the same
// size as the working two-vehicle version.
const ORIGINAL_TWO_CAR_WIDTH =
  PASSENGER_OFFSET_X + CARRIAGE_W;

// Change this to adjust train size.
const TRAIN_SCREEN_WIDTH = 1.15;

// Change this to adjust train height.
const TRAIN_BASELINE = 0.905;

// COMPLETE ANIMATION LOOP:
// Previous = 17000 milliseconds
// Updated  = 22000 milliseconds
const TRAIN_TRAVEL_MS = 22000;

// ==========================================
// LOCOMOTIVE WHEELS
// ==========================================

const ENGINE_WHEELS = [
  {
    x: 239,
    y: 354,
    w: 255,
    h: 254,
    first: 13,
    name: 'Cart-1-Wheel-1'
  },
  {
    x: 651,
    y: 354,
    w: 255,
    h: 254,
    first: 21,
    name: 'Cart-1-Wheel-3'
  },
  {
    x: 466,
    y: 374,
    w: 215,
    h: 214,
    first: 17,
    name: 'Cart-1-Wheel-2'
  }
];

// ==========================================
// PASSENGER CARRIAGE WHEELS
// ==========================================

const CARRIAGE_WHEELS = [
  {
    x: 252,
    y: 436,
    w: 166,
    h: 167,
    first: 26,
    name: 'Cart-2-Wheel-1'
  },
  {
    x: 714,
    y: 436,
    w: 166,
    h: 167,
    first: 30,
    name: 'Cart-2-Wheel-2'
  }
];

// Passenger wheel cover positioning.
const CARRIAGE_WHEEL_COVER = {
  x: 304,
  y: 399,
  w: 534,
  h: 108
};

// Locomotive connecting rod positioning.
const ENGINE_CONNECTOR = {
  x: 333,
  y: 455,
  w: 481,
  h: 50
};

// ==========================================
// LOAD TRAIN IMAGES
// ==========================================

const trainImages = new Map();
const filenames = new Set(Object.values(TRAIN_ASSETS));

for (const wheel of [
  ...ENGINE_WHEELS,
  ...CARRIAGE_WHEELS
]) {
  for (let phase = 0; phase < 4; phase++) {
    filenames.add(
      `Train-Animation-Layers_${String(
        wheel.first + phase
      ).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`
    );
  }
}

for (const filename of filenames) {
  const image = new Image();
  image.decoding = 'async';
  image.src = ASSET + filename;
  trainImages.set(filename, image);
}

function loadedTrainImage(filename) {
  const image = trainImages.get(filename);

  return image && image.complete && image.naturalWidth
    ? image
    : null;
}

// ==========================================
// CANVAS SETUP
// ==========================================

function sizeCanvas(canvas) {
  const rect = scene.getBoundingClientRect();

  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  const canvasWidth = Math.max(
    1,
    Math.round(rect.width * pixelRatio)
  );

  const canvasHeight = Math.max(
    1,
    Math.round(rect.height * pixelRatio)
  );

  if (
    canvas.width !== canvasWidth ||
    canvas.height !== canvasHeight
  ) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  const ctx = canvas.getContext('2d');
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  return {
    ctx,
    width: rect.width,
    height: rect.height
  };
}

// ==========================================
// DRAW ANIMATED TRAIN
// ==========================================

function drawTrain(timestamp, delta) {
  const { ctx, width, height } =
    sizeCanvas(trainCanvas);

  ctx.clearRect(0, 0, width, height);

  if (!overlay.hidden) return;

  // Same visual scale as the previous
  // working two-vehicle train.
  const scale =
    width * TRAIN_SCREEN_WIDTH /
    ORIGINAL_TWO_CAR_WIDTH;

  const baseline = height * TRAIN_BASELINE;

  // ========================================
  // LAYER 1: STRAIGHT RAILS
  // ========================================

  const rail = loadedTrainImage(TRAIN_ASSETS.rail);

  if (rail) {
    const railHeight =
      width * (rail.naturalHeight / rail.naturalWidth);

    ctx.drawImage(
      rail,
      0,
      baseline - railHeight * 0.55,
      width,
      railHeight
    );
  }

  // ========================================
  // MOVE TRAIN RIGHT TO LEFT
  // ========================================

  if (!motionReduced.matches) {
    trainProgress = (
      trainProgress + delta / TRAIN_TRAVEL_MS
    ) % 1;
  }

  trainWidth = TRAIN_TOTAL_WIDTH * scale;
  trainHeight = TRAIN_IMAGE_HEIGHT * scale;

  trainX =
    width - (width + trainWidth) * trainProgress;

  trainY = baseline - trainHeight;

  const engine = loadedTrainImage(
    TRAIN_ASSETS.locomotive
  );

  const carriage = loadedTrainImage(
    TRAIN_ASSETS.carriage
  );

  const engineX = trainX;
  const engineY = trainY;

  const carriageY =
    trainY + PASSENGER_OFFSET_Y * scale;

  function carriageX(offset) {
    return trainX + offset * scale;
  }

  // ========================================
  // LAYER 2: ALL TRAIN BODIES
  // ========================================

  if (engine) {
    ctx.drawImage(
      engine,
      engineX,
      engineY,
      ENGINE_W * scale,
      ENGINE_H * scale
    );
  }

  // Draw passenger carriage 1 AND 2.
  // Both use the same image.
  if (carriage) {
    for (const offset of CARRIAGE_POSITIONS) {
      ctx.drawImage(
        carriage,
        carriageX(offset),
        carriageY,
        CARRIAGE_W * scale,
        CARRIAGE_H * scale
      );
    }
  }

  // ========================================
  // ANIMATION PHASE
  // ========================================

  // All wheels animate together.
  const phase = Math.floor(timestamp / 175) % 4;

  function getWheelImage(wheel) {
    const filename =
      `Train-Animation-Layers_${String(
        wheel.first + phase
      ).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`;

    return loadedTrainImage(filename);
  }

  // ========================================
  // LAYER 3: BOTH PASSENGER WHEEL SETS
  // ========================================

  const cover = loadedTrainImage(
    TRAIN_ASSETS.carriageWheelCover
  );

  // Repeat wheel animation for BOTH carriages.
  for (const offset of CARRIAGE_POSITIONS) {
    const x = carriageX(offset);

    // Wheels go above each carriage body.
    for (const wheel of CARRIAGE_WHEELS) {
      const wheelImage = getWheelImage(wheel);
      if (!wheelImage) continue;

      ctx.drawImage(
        wheelImage,
        x + wheel.x * scale,
        carriageY + wheel.y * scale,
        wheel.w * scale,
        wheel.h * scale
      );
    }

    // ======================================
    // LAYER 4: WHEEL COVERS
    // ======================================

    // Wheel cover is above the wheels.
    if (cover) {
      ctx.drawImage(
        cover,
        x + CARRIAGE_WHEEL_COVER.x * scale,
        carriageY + CARRIAGE_WHEEL_COVER.y * scale,
        CARRIAGE_WHEEL_COVER.w * scale,
        CARRIAGE_WHEEL_COVER.h * scale
      );
    }
  }

  // ========================================
  // LAYER 5: LOCOMOTIVE WHEELS
  // ========================================

  for (const wheel of ENGINE_WHEELS) {
    const wheelImage = getWheelImage(wheel);
    if (!wheelImage) continue;

    ctx.drawImage(
      wheelImage,
      engineX + wheel.x * scale,
      engineY + wheel.y * scale,
      wheel.w * scale,
      wheel.h * scale
    );
  }

  // ========================================
  // LAYER 6: LOCOMOTIVE CONNECTING ROD
  // ========================================

  const connector = loadedTrainImage(
    TRAIN_ASSETS.engineConnector
  );

  if (connector) {
    const shift = [
      { x: 0, y: -15 },
      { x: -15, y: 0 },
      { x: 0, y: 15 },
      { x: 15, y: 0 }
    ][phase];

    // Metal rod stays on top of the wheels.
    ctx.drawImage(
      connector,

      engineX +
        (ENGINE_CONNECTOR.x + shift.x) * scale,

      engineY +
        (ENGINE_CONNECTOR.y + shift.y) * scale,

      ENGINE_CONNECTOR.w * scale,
      ENGINE_CONNECTOR.h * scale
    );
  }

  // ========================================
  // CLICKABLE TRAIN AREA
  // ========================================

  const left = Math.max(0, trainX);
  const right = Math.min(width, trainX + trainWidth);

  trainHotspot.style.display =
    right > left ? 'block' : 'none';

  trainHotspot.style.left =
    left / width * 100 + '%';

  trainHotspot.style.top =
    Math.max(0, trainY) / height * 100 + '%';

  trainHotspot.style.width =
    Math.max(0, right - left) / width * 100 + '%';

  trainHotspot.style.height =
    Math.max(
      0,
      Math.min(
        height - Math.max(0, trainY),
        trainHeight
      )
    ) / height * 100 + '%';
}

// ==========================================
// SNOW ANIMATION
// ==========================================

function resetSnow(width, height) {
  const count = Math.min(
    55,
    Math.max(25, Math.round(width / 13))
  );

  snow = Array.from(
    { length: count },
    (_, index) => ({
      x:
        ((index * 0.618033988749895) % 1) *
        width,

      y:
        ((index * 0.3632713) % 1) *
        height,

      r:
        index % 8 === 0
          ? 2.3
          : 0.9 + (index % 4) * 0.21,

      speed: 10 + (index * 19) % 35,

      sway: (index % 7 - 3) * 0.65,

      opacity: 0.25 + (index % 6) * 0.1
    })
  );
}

let lastSnowWidth = 0;

function drawSnow(delta) {
  const { ctx, width, height } =
    sizeCanvas(snowCanvas);

  ctx.clearRect(0, 0, width, height);

  if (lastSnowWidth !== width) {
    resetSnow(width, height);
    lastSnowWidth = width;
  }

  if (!overlay.hidden) return;

  for (const flake of snow) {
    if (!motionReduced.matches) {
      flake.y += flake.speed * delta / 1000;
      flake.x += flake.sway * delta / 1000;

      if (flake.y > height + 4) {
        flake.y = -4;
        flake.x = Math.random() * width;
      }

      if (flake.x < 0) flake.x += width;
      if (flake.x > width) flake.x -= width;
    }

    ctx.fillStyle =
      `rgba(255,255,255,${flake.opacity})`;

    ctx.beginPath();

    ctx.arc(
      flake.x,
      flake.y,
      flake.r,
      0,
      Math.PI * 2
    );

    ctx.fill();

    if (flake.r > 2) {
      ctx.lineWidth = 1;

      ctx.strokeStyle =
        `rgba(255,255,255,${flake.opacity * 0.8})`;

      ctx.beginPath();

      ctx.moveTo(flake.x - 4, flake.y);
      ctx.lineTo(flake.x + 4, flake.y);

      ctx.stroke();
    }
  }
}

// ==========================================
// STAR SHINE
// ==========================================

const starFrames = [
  'JulefestStarShine01.png',
  'JulefestStarShine02.png',
  'JulefestStarShine03.png',
  'JulefestStarShine04.png'
];

let lastStarFrame = -1;
let animationId;

// ==========================================
// MAIN ANIMATION LOOP
// ==========================================

function frame(timestamp) {
  const delta = Math.min(
    timestamp - (lastTimestamp || timestamp),
    60
  );

  lastTimestamp = timestamp;

  if (!motionReduced.matches) {
    const frameNumber =
      Math.floor(timestamp / 950) % 4;

    if (frameNumber !== lastStarFrame) {
      starGlow.src =
        ASSET + starFrames[frameNumber];

      lastStarFrame = frameNumber;
    }
  }

  drawSnow(delta);
  drawTrain(timestamp, delta);

  animationId = requestAnimationFrame(frame);
}

// ==========================================
// PAGE EVENTS
// ==========================================

window.addEventListener('pagehide', () => {
  cancelAnimationFrame(animationId);
  music.pause();
});

window.addEventListener('visibilitychange', () => {
  lastTimestamp = 0;
});

// Start animations.
requestAnimationFrame(frame);
