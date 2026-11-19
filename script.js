
/**
 * Advent Calendar 2026
 * Mobile-first website.
 * Original Illustrator mountain is unchanged.
 */

'use strict';

const ASSET = 'assets/';

const scene = document.getElementById('mountainScene');
const overlay = document.getElementById('chapterOverlay');
const dialog = overlay.querySelector('.chapter-dialog');
const dialogInner = document.getElementById('dialogInner');
const closeDialogButton = document.getElementById('closeDialog');

const music = document.getElementById('backgroundMusic');
const musicButton = document.getElementById('musicButton');
const dialogMusicButton = document.getElementById('dialogMusicButton');
const musicIcon = document.getElementById('musicIcon');
const dialogMusicIcon = document.getElementById('dialogMusicIcon');

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
    image: 'Chapter1Conductor.jpg',

    story: [
      'Every Christmas, the employees of the LEGO Workshop gather for a very special tradition. Together, they board the candy fueled, Christmas express and begin their journey through the snowy landscape to the top of Mount “Julefest”.',

      'At the top, a magical Christmas celebration awaits, filled with lights, music, laughter, and LEGO Christmas spirit.'
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

  if (className) {
    elem.className = className;
  }

  if (text) {
    elem.textContent = text;
  }

  return elem;
}


function openChapter(number) {
  const chapter = CHAPTERS[number];

  if (!chapter) return;

  priorFocus = document.activeElement;
  dialogInner.replaceChildren();

  if (chapter.unlocked) {

    if (number === 1) {
      const banner = makeElement(
        'img',
        'dialog-banner'
      );

      banner.src = ASSET + 'AdventChapterTitle.png';
      banner.alt = chapter.title;
      banner.id = 'dialogHeading';

      dialogInner.append(banner);

    } else {

      const heading = makeElement(
        'h2',
        'dialog-title',
        chapter.title
      );

      heading.id = 'dialogHeading';
      dialogInner.append(heading);
    }

    if (chapter.image) {
      const picture = makeElement(
        'img',
        'story-picture'
      );

      picture.src = ASSET + chapter.image;
      picture.alt =
        'The Christmas Express journey through the snow';

      dialogInner.append(picture);
    }

    for (const paragraph of chapter.story) {
      dialogInner.append(
        makeElement('p', 'story-text', paragraph)
      );
    }

    const brief = makeElement(
      'div',
      'brief-card'
    );

    const heading = makeElement(
      'strong',
      '',
      'BRIEF'
    );

    brief.append(
      heading,
      makeElement('p', '', chapter.brief)
    );

    dialogInner.append(brief);

  } else {

    const content = makeElement(
      'div',
      'locked-content'
    );

    const icon = makeElement(
      'div',
      'locked-icon',
      '🔒'
    );

    icon.setAttribute('aria-hidden', 'true');

    const heading = makeElement(
      'h2',
      '',
      chapter.title
    );

    heading.id = 'dialogHeading';

    content.append(
      icon,
      heading,
      makeElement(
        'p',
        'coming-soon',
        'COMING SOON'
      ),
      makeElement(
        'p',
        '',
        chapter.unlockMessage
      )
    );

    dialogInner.append(content);
  }

  overlay.hidden = false;
  document.body.style.overflow = 'hidden';

  dialog.scrollTop = 0;
  closeDialogButton.focus();
}


function closeChapter() {
  overlay.hidden = true;
  document.body.style.overflow = '';

  if (priorFocus?.focus) {
    priorFocus.focus();
  }
}


document.querySelectorAll('[data-chapter]').forEach(
  button => {
    button.addEventListener('click', () => {
      openChapter(Number(button.dataset.chapter));
    });
  }
);

trainHotspot.addEventListener(
  'click',
  () => openChapter(1)
);

closeDialogButton.addEventListener(
  'click',
  closeChapter
);

overlay.querySelector('[data-close]').addEventListener(
  'click',
  closeChapter
);

document.addEventListener('keydown', event => {
  if (overlay.hidden) return;

  if (event.key === 'Escape') {
    closeChapter();
  }

  if (event.key === 'Tab') {
    const items = [
      closeDialogButton,
      dialogMusicButton
    ];

    const current = items.indexOf(
      document.activeElement
    );

    const direction = event.shiftKey ? -1 : 1;

    event.preventDefault();

    items[
      (current + direction + items.length) %
      items.length
    ].focus();
  }
});


// ==========================================
// CHRISTMAS MUSIC
// ==========================================

function updateMusicButton() {

  musicButton.setAttribute(
    'aria-pressed',
    String(musicPlaying)
  );

  musicButton.setAttribute(
    'aria-label',
    musicPlaying
      ? 'Mute Christmas music'
      : 'Play Christmas music'
  );

  musicButton.title = musicPlaying
    ? 'Mute Christmas music'
    : 'Play Christmas music';

  musicIcon.src = ASSET + (
    musicPlaying
      ? 'AdventMusicOn.png'
      : 'AdventMusicOff.png'
  );

  dialogMusicIcon.src = musicIcon.src;

  dialogMusicButton.setAttribute(
    'aria-pressed',
    String(musicPlaying)
  );

  dialogMusicButton.setAttribute(
    'aria-label',
    musicPlaying
      ? 'Mute Christmas music'
      : 'Play Christmas music'
  );
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
    console.warn(
      'Music could not play:',
      error
    );
  }

  updateMusicButton();
}


musicButton.addEventListener(
  'click',
  toggleMusic
);

dialogMusicButton.addEventListener(
  'click',
  toggleMusic
);

music.addEventListener('ended', () => {
  musicPlaying = false;
  updateMusicButton();
});


// ==========================================
// LEGO TRAIN ASSETS
// ==========================================

// Photoshop order, bottom to top:
//
// 1. New Cart 1 and New Cart 2
// 2. Cart 2 Wheel 1
// 3. Cart 2 Wheel 2
// 4. Cart 2 Wheel Covers
// 5. Cart 1 Wheel 1
// 6. Cart 1 Wheel 3
// 7. Cart 1 Wheel 2
// 8. Cart 1 Wheel Connector
//
// The train's original reference image
// is NOT drawn over the animated layers.

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
// TRAIN DIMENSIONS
// ==========================================

// Corrected PNG image dimensions.

const ENGINE_W = 1188;
const ENGINE_H = 598;

const CARRIAGE_W = 1141;
const CARRIAGE_H = 594;

// Distance between the two vehicles.

const PASSENGER_OFFSET_X = 1034;
const PASSENGER_OFFSET_Y = 4;

const TRAIN_TOTAL_WIDTH = Math.max(
  ENGINE_W,
  PASSENGER_OFFSET_X + CARRIAGE_W
);

const TRAIN_IMAGE_HEIGHT = Math.max(
  ENGINE_H,
  PASSENGER_OFFSET_Y + CARRIAGE_H
);

// Adjust these if you want to change
// the size or height of the entire train.

const TRAIN_SCREEN_WIDTH = 1.15;
const TRAIN_BASELINE = 0.905;

// Train takes 17 seconds to travel off-screen.

const TRAIN_TRAVEL_MS = 17000;


// ==========================================
// WHEEL LAYER POSITIONS
// ==========================================

// Coordinates are relative to each cart PNG.
// x/y = top-left corner of each wheel layer.

const WHEEL_RIG = [

  // CART 1 - LOCOMOTIVE

  {
    vehicle: 'engine',
    x: 239,
    y: 354,
    w: 255,
    h: 254,
    first: 13,
    name: 'Cart-1-Wheel-1'
  },

  {
    vehicle: 'engine',
    x: 651,
    y: 354,
    w: 255,
    h: 254,
    first: 21,
    name: 'Cart-1-Wheel-3'
  },

  {
    vehicle: 'engine',
    x: 466,
    y: 374,
    w: 215,
    h: 214,
    first: 17,
    name: 'Cart-1-Wheel-2'
  },

  // CART 2 - PASSENGER CARRIAGE

  {
    vehicle: 'carriage',
    x: 252,
    y: 436,
    w: 166,
    h: 167,
    first: 26,
    name: 'Cart-2-Wheel-1'
  },

  {
    vehicle: 'carriage',
    x: 714,
    y: 436,
    w: 166,
    h: 167,
    first: 30,
    name: 'Cart-2-Wheel-2'
  }

];


// CART 2 WHEEL COVER

const CARRIAGE_WHEEL_COVER = {
  x: 304,
  y: 399,
  w: 534,
  h: 108
};


// CART 1 CONNECTING ROD

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

const imgNames = new Set(
  Object.values(TRAIN_ASSETS)
);

for (const wheel of WHEEL_RIG) {

  for (let phase = 0; phase < 4; phase++) {

    const filename =
      `Train-Animation-Layers_${String(
        wheel.first + phase
      ).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`;

    imgNames.add(filename);
  }
}


for (const filename of imgNames) {

  const image = new Image();

  image.decoding = 'async';
  image.src = ASSET + filename;

  trainImages.set(filename, image);
}


function loadedTrainImage(filename) {

  const image = trainImages.get(filename);

  return image &&
    image.complete &&
    image.naturalWidth
      ? image
      : null;
}


// ==========================================
// CANVAS SIZE
// ==========================================

function sizeCanvas(canvas) {

  const rect = scene.getBoundingClientRect();

  const scale = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  const width = Math.max(
    1,
    Math.round(rect.width * scale)
  );

  const height = Math.max(
    1,
    Math.round(rect.height * scale)
  );

  if (
    canvas.width !== width ||
    canvas.height !== height
  ) {

    canvas.width = width;
    canvas.height = height;
  }

  const ctx = canvas.getContext('2d');

  ctx.setTransform(
    scale, 0, 0, scale, 0, 0
  );

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

  ctx.clearRect(
    0, 0, width, height
  );

  if (!overlay.hidden) return;

  const scale =
    width * TRAIN_SCREEN_WIDTH /
    TRAIN_TOTAL_WIDTH;

  const baseline =
    height * TRAIN_BASELINE;


  // ========================================
  // LAYER 1 - STRAIGHT LEGO RAIL
  // ========================================

  const rail = loadedTrainImage(
    TRAIN_ASSETS.rail
  );

  if (rail) {

    const railHeight =
      width *
      (rail.naturalHeight / rail.naturalWidth);

    ctx.drawImage(
      rail,
      0,
      baseline - railHeight * 0.55,
      width,
      railHeight
    );
  }


  // ========================================
  // HORIZONTAL TRAIN MOVEMENT
  // ========================================

  if (!motionReduced.matches) {

    trainProgress = (
      trainProgress +
      delta / TRAIN_TRAVEL_MS
    ) % 1;
  }

  trainWidth =
    TRAIN_TOTAL_WIDTH * scale;

  trainHeight =
    TRAIN_IMAGE_HEIGHT * scale;

  trainX =
    width -
    (width + trainWidth) * trainProgress;

  trainY =
    baseline - trainHeight;


  const engine = loadedTrainImage(
    TRAIN_ASSETS.locomotive
  );

  const carriage = loadedTrainImage(
    TRAIN_ASSETS.carriage
  );


  function bodyX(vehicle) {

    return trainX + (
      vehicle === 'carriage'
        ? PASSENGER_OFFSET_X
        : 0
    ) * scale;
  }


  function bodyY(vehicle) {

    return trainY + (
      vehicle === 'carriage'
        ? PASSENGER_OFFSET_Y
        : 0
    ) * scale;
  }


  // ========================================
  // LAYER 2 - CART BODY IMAGES
  // ========================================

  if (engine) {

    ctx.drawImage(
      engine,
      bodyX('engine'),
      bodyY('engine'),
      ENGINE_W * scale,
      ENGINE_H * scale
    );
  }


  if (carriage) {

    ctx.drawImage(
      carriage,
      bodyX('carriage'),
      bodyY('carriage'),
      CARRIAGE_W * scale,
      CARRIAGE_H * scale
    );
  }


  // All wheels and the connector use
  // the same 4-frame animation phase.

  const phase =
    Math.floor(timestamp / 175) % 4;


  // ========================================
  // LAYER 3 - CART 2 WHEELS
  // ========================================

  for (
    const wheel of WHEEL_RIG.filter(
      wheel => wheel.vehicle === 'carriage'
    )
  ) {

    const filename =
      `Train-Animation-Layers_${String(
        wheel.first + phase
      ).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`;

    const image =
      loadedTrainImage(filename);

    if (!image) continue;

    ctx.drawImage(
      image,

      bodyX('carriage') +
        wheel.x * scale,

      bodyY('carriage') +
        wheel.y * scale,

      wheel.w * scale,
      wheel.h * scale
    );
  }


  // ========================================
  // LAYER 4 - CART 2 WHEEL COVERS
  // ========================================

  const carriageWheelCover =
    loadedTrainImage(
      TRAIN_ASSETS.carriageWheelCover
    );

  if (carriageWheelCover) {

    ctx.drawImage(
      carriageWheelCover,

      bodyX('carriage') +
        CARRIAGE_WHEEL_COVER.x * scale,

      bodyY('carriage') +
        CARRIAGE_WHEEL_COVER.y * scale,

      CARRIAGE_WHEEL_COVER.w * scale,
      CARRIAGE_WHEEL_COVER.h * scale
    );
  }


  // ========================================
  // LAYER 5 - CART 1 WHEELS
  // ========================================

  for (
    const wheel of WHEEL_RIG.filter(
      wheel => wheel.vehicle === 'engine'
    )
  ) {

    const filename =
      `Train-Animation-Layers_${String(
        wheel.first + phase
      ).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`;

    const image =
      loadedTrainImage(filename);

    if (!image) continue;

    ctx.drawImage(
      image,

      bodyX('engine') +
        wheel.x * scale,

      bodyY('engine') +
        wheel.y * scale,

      wheel.w * scale,
      wheel.h * scale
    );
  }


  // ========================================
  // LAYER 6 - CART 1 WHEEL CONNECTOR
  // ========================================

  // This is the long metal coupling rod
  // connecting the locomotive's 3 wheels.
  //
  // It is drawn in FRONT of the wheels.
  //
  // It follows a simple 4-phase circular
  // movement synchronized with wheel frames.

  const engineConnector =
    loadedTrainImage(
      TRAIN_ASSETS.engineConnector
    );

  if (engineConnector) {

    const connectorShift = [

      { x: 0, y: -15 },

      { x: -15, y: 0 },

      { x: 0, y: 15 },

      { x: 15, y: 0 }

    ][phase];


    const connectorX =
      bodyX('engine') +
      (
        ENGINE_CONNECTOR.x +
        connectorShift.x
      ) * scale;


    const connectorY =
      bodyY('engine') +
      (
        ENGINE_CONNECTOR.y +
        connectorShift.y
      ) * scale;


    ctx.drawImage(
      engineConnector,

      connectorX,
      connectorY,

      ENGINE_CONNECTOR.w * scale,
      ENGINE_CONNECTOR.h * scale
    );
  }


  // ========================================
  // CLICKABLE TRAIN AREA
  // ========================================

  const left = Math.max(
    0,
    trainX
  );

  const right = Math.min(
    width,
    trainX + trainWidth
  );


  trainHotspot.style.display =
    right > left
      ? 'block'
      : 'none';


  trainHotspot.style.left =
    left / width * 100 + '%';


  trainHotspot.style.top =
    Math.max(0, trainY) /
    height * 100 + '%';


  trainHotspot.style.width =
    Math.max(
      0,
      right - left
    ) / width * 100 + '%';


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
    Math.max(
      25,
      Math.round(width / 13)
    )
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

      speed:
        10 + (index * 19) % 35,

      sway:
        (index % 7 - 3) * 0.65,

      opacity:
        0.25 + (index % 6) * 0.1

    })
  );
}


let lastSnowWidth = 0;


function drawSnow(delta) {

  const { ctx, width, height } =
    sizeCanvas(snowCanvas);

  ctx.clearRect(
    0, 0, width, height
  );


  if (lastSnowWidth !== width) {

    resetSnow(width, height);

    lastSnowWidth = width;
  }


  if (!overlay.hidden) return;


  for (const flake of snow) {

    if (!motionReduced.matches) {

      flake.y +=
        flake.speed * delta / 1000;

      flake.x +=
        flake.sway * delta / 1000;


      if (flake.y > height + 4) {

        flake.y = -4;

        flake.x =
          Math.random() * width;
      }


      if (flake.x < 0) {
        flake.x += width;
      }

      if (flake.x > width) {
        flake.x -= width;
      }
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

      ctx.moveTo(
        flake.x - 4,
        flake.y
      );

      ctx.lineTo(
        flake.x + 4,
        flake.y
      );

      ctx.moveTo(
        flake.x,
        flake.y - 4
      );

      ctx.lineTo(
        flake.x,
        flake.y + 4
      );

      ctx.stroke();
    }
  }
}


// ==========================================
// STAR SHINE ANIMATION
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

  drawTrain(
    timestamp,
    delta
  );


  animationId =
    requestAnimationFrame(frame);
}


// ==========================================
// PAGE EVENTS
// ==========================================

window.addEventListener(
  'pagehide',
  () => {

    cancelAnimationFrame(animationId);

    music.pause();
  }
);


window.addEventListener(
  'visibilitychange',
  () => {

    lastTimestamp = 0;
  }
);


// Start the animations.

requestAnimationFrame(frame);
