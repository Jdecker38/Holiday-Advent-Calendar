/**
 * Advent Calendar 2026 — static, mobile-first web experience.
 * To replace graphics, keep the same filenames in ./assets/.
 * The original Illustrator mountain image is never modified.
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
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let priorFocus = null;
let lastTimestamp = 0;
let trainProgress = .0;
let trainX = 0, trainY = 0, trainWidth = 0, trainHeight = 0;
let snow = [];
let musicPlaying = false;

// Chapters 2 and 3 intentionally stay locked until you supply their stories.
// When ready, set unlocked: true and add their story/brief content below.
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
  2: {unlocked: false, title: 'Chapter 2', unlockMessage: 'Unlocks Week 2'},
  3: {unlocked: false, title: 'Chapter 3', unlockMessage: 'Unlocks Week 3'}
};

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
    if (number === 1) {
      const banner = makeElement('img', 'dialog-banner');
      banner.src = ASSET + 'AdventChapterTitle.png';
      banner.alt = chapter.title;
      banner.id = 'dialogHeading';
      dialogInner.append(banner);
    } else {
      const heading = makeElement('h2', 'dialog-title', chapter.title);
      heading.id = 'dialogHeading';
      dialogInner.append(heading);
    }
    if (chapter.image) {
      const picture = makeElement('img', 'story-picture');
      picture.src = ASSET + chapter.image;
      picture.alt = 'The Christmas Express journey through the snow';
      dialogInner.append(picture);
    }
    for (const paragraph of chapter.story) dialogInner.append(makeElement('p', 'story-text', paragraph));
    const brief = makeElement('div', 'brief-card');
    const heading = makeElement('strong', '', 'BRIEF');
    brief.append(heading, makeElement('p', '', chapter.brief));
    dialogInner.append(brief);
  } else {
    const content = makeElement('div', 'locked-content');
    const icon = makeElement('div', 'locked-icon', '🔒');
    icon.setAttribute('aria-hidden', 'true');
    const h = makeElement('h2', '', chapter.title);
    h.id = 'dialogHeading';
    content.append(icon, h, makeElement('p', 'coming-soon', 'COMING SOON'), makeElement('p', '', chapter.unlockMessage));
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
  if (priorFocus?.focus) priorFocus.focus();
}
document.querySelectorAll('[data-chapter]').forEach(btn => {
  btn.addEventListener('click', () => openChapter(Number(btn.dataset.chapter)));
});
trainHotspot.addEventListener('click', () => openChapter(1));
closeDialogButton.addEventListener('click', closeChapter);
overlay.querySelector('[data-close]').addEventListener('click', closeChapter);
document.addEventListener('keydown', ev => {
  if (overlay.hidden) return;
  if (ev.key === 'Escape') closeChapter();
  if (ev.key === 'Tab') {
    // Keep keyboard focus inside the chapter's back and music controls.
    const items = [closeDialogButton, dialogMusicButton];
    const current = items.indexOf(document.activeElement);
    const direction = ev.shiftKey ? -1 : 1;
    ev.preventDefault();
    items[(current + direction + items.length) % items.length].focus();
  }
});

function updateMusicButton() {
  musicButton.setAttribute('aria-pressed', String(musicPlaying));
  musicButton.setAttribute('aria-label', musicPlaying ? 'Mute Christmas music' : 'Play Christmas music');
  musicButton.title = musicPlaying ? 'Mute Christmas music' : 'Play Christmas music';
  musicIcon.src = ASSET + (musicPlaying ? 'AdventMusicOn.png' : 'AdventMusicOff.png');
  dialogMusicIcon.src = musicIcon.src;
  dialogMusicButton.setAttribute('aria-pressed', String(musicPlaying));
  dialogMusicButton.setAttribute('aria-label', musicPlaying ? 'Mute Christmas music' : 'Play Christmas music');
}
async function toggleMusic() {
  if (musicPlaying) { music.pause(); musicPlaying = false; updateMusicButton(); return; }
  try { await music.play(); musicPlaying = true; }
  catch (e) { musicPlaying = false; console.warn('Music could not play:', e); }
  updateMusicButton();
}
musicButton.addEventListener('click', toggleMusic);
dialogMusicButton.addEventListener('click', toggleMusic);
music.addEventListener('ended', () => { musicPlaying = false; updateMusicButton(); });

/**
 * Holiday Advent Calendar — corrected TWO-vehicle LEGO train.
 * Draw order (back -> front):
 *   1. Straight rail
 *   2. Locomotive and passenger-carriage artwork
 *   3. Animated wheel PNGs
 *   4. Wheel covers/side-skirts (existing cover PNGs + matching body detail)
 *
 * The locomotive cover is restored from its new blue-render body; the
 * passenger wheels get their existing two separate black bogie-cover PNGs.
 * All these assets are already uploaded to GitHub.
 * Old middle tender (Cart 2) is removed.
 */
const TRAIN_ASSETS = {
  locomotive: 'Train_2026_Wagon_1.png',
  carriage: 'Train_2026_Wagon_2.png', // Corrected passenger render uploaded to GitHub
  rail: 'Train_2026_Straight_Rail.png',
  passengerCover1: 'Train-Animation-Layers_0001_Cart-3-Cover-1.png',
  passengerCover2: 'Train-Animation-Layers_0002_Cart-3-Cover-2.png'
};

// Corrected source-image sizes (pixels), rather than the OLD 2048 x 905 canvases.
const ENGINE_W = 1188;
const ENGINE_H = 598;
const CARRIAGE_W = 1141;
const CARRIAGE_H = 594;
const PASSENGER_OFFSET_X = 1034;
const PASSENGER_OFFSET_Y = 4;
const TRAIN_TOTAL_WIDTH = Math.max(ENGINE_W, PASSENGER_OFFSET_X + CARRIAGE_W);
const TRAIN_IMAGE_HEIGHT = Math.max(ENGINE_H, PASSENGER_OFFSET_Y + CARRIAGE_H);
const TRAIN_SCREEN_WIDTH = 1.15;
const TRAIN_BASELINE = 0.905;
const TRAIN_TRAVEL_MS = 17000;

// Wheel anchor points are LOCAL to each of the corrected PNGs.
// The 4-frame sprites already exist in your GitHub assets folder.
const WHEEL_RIG = [
  {vehicle:'engine', x:366, y:514, diameter:164, first:13, name:'Cart-1-Wheel-1'},
  {vehicle:'engine', x:568, y:515, diameter:147, first:17, name:'Cart-1-Wheel-2'},
  {vehicle:'engine', x:770, y:514, diameter:164, first:21, name:'Cart-1-Wheel-3'},
  {vehicle:'carriage', x:335, y:520, diameter:147, first:3, name:'Cart-3-Wheel-1'},
  {vehicle:'carriage', x:801, y:520, diameter:147, first:7, name:'Cart-3-Wheel-2'}
];

const trainImages = new Map();
const imgNames = new Set(Object.values(TRAIN_ASSETS));
for (const wheel of WHEEL_RIG) {
  for (let phase = 0; phase < 4; phase++) {
    imgNames.add(`Train-Animation-Layers_${String(wheel.first + phase).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`);
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
  return image && image.complete && image.naturalWidth ? image : null;
}

function sizeCanvas(canvas) {
  const rect = scene.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(rect.width * scale));
  const h = Math.max(1, Math.round(rect.height * scale));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return {ctx, width:rect.width, height:rect.height};
}

function drawTrain(ts, delta) {
  const {ctx, width, height} = sizeCanvas(trainCanvas);
  ctx.clearRect(0, 0, width, height);
  if (!overlay.hidden) return;

  const scale = width * TRAIN_SCREEN_WIDTH / TRAIN_TOTAL_WIDTH;
  const baseline = height * TRAIN_BASELINE;

  // Layer 1 — straight LEGO rails (behind the locomotive and carriage).
  const rail = loadedTrainImage(TRAIN_ASSETS.rail);
  if (rail) {
    const railHeight = width * (rail.naturalHeight / rail.naturalWidth);
    ctx.drawImage(rail, 0, baseline - railHeight * 0.55, width, railHeight);
  }

  if (!motionReduced.matches) {
    trainProgress = (trainProgress + delta / TRAIN_TRAVEL_MS) % 1;
  }
  trainWidth = TRAIN_TOTAL_WIDTH * scale;
  trainHeight = TRAIN_IMAGE_HEIGHT * scale;
  trainX = width - (width + trainWidth) * trainProgress;
  trainY = baseline - trainHeight;

  const engine = loadedTrainImage(TRAIN_ASSETS.locomotive);
  const carriage = loadedTrainImage(TRAIN_ASSETS.carriage);
  const bodyX = (vehicle) => trainX + (vehicle === 'carriage' ? PASSENGER_OFFSET_X : 0) * scale;
  const bodyY = (vehicle) => trainY + (vehicle === 'carriage' ? PASSENGER_OFFSET_Y : 0) * scale;

  // Layer 2 — FULL new cart render images.
  // Wheels will be painted over these images in the next pass.
  if (engine) ctx.drawImage(engine, bodyX('engine'), bodyY('engine'), ENGINE_W * scale, ENGINE_H * scale);
  if (carriage) ctx.drawImage(carriage, bodyX('carriage'), bodyY('carriage'), CARRIAGE_W * scale, CARRIAGE_H * scale);

  // Layer 3 — FIVE animated wheels, IN FRONT of the bodies.
  const phase = Math.floor(ts / 175) % 4;
  for (const wheel of WHEEL_RIG) {
    const filename = `Train-Animation-Layers_${String(wheel.first + phase).padStart(4, '0')}_${wheel.name}_Frame-${phase + 1}.png`;
    const image = loadedTrainImage(filename);
    if (!image) continue;
    const radius = wheel.diameter * scale / 2;
    const centerX = bodyX(wheel.vehicle) + wheel.x * scale;
    const centerY = bodyY(wheel.vehicle) + wheel.y * scale;
    ctx.drawImage(image, centerX - radius, centerY - radius, 2 * radius, 2 * radius);
  }

  // Layer 4 — WHEEL COVERS (ON TOP of the animated wheels).
  // Re-render the original wheel-skirt regions from the SAME cart art.
  // This hides wheel sections that should sit behind the black chassis,
  // without needing mismatched cover graphics from the old green train.
  function drawWheelCover(bodyImage, vehicle, sourceWidth, top, bottom) {
    if (!bodyImage) return;
    const coverHeight = bottom - top;
    ctx.drawImage(
      bodyImage, 0, top, sourceWidth, coverHeight,
      bodyX(vehicle), bodyY(vehicle) + top * scale,
      sourceWidth * scale, coverHeight * scale
    );
  }
  drawWheelCover(engine, 'engine', ENGINE_W, 432, 529);
  drawWheelCover(carriage, 'carriage', CARRIAGE_W, 402, 491);

  // Final top layer: the two separately exported bogie/wheel-cover parts
  // from the passenger carriage. They sit ABOVE both animated wheels.
  const bogieCover1 = loadedTrainImage(TRAIN_ASSETS.passengerCover1);
  const bogieCover2 = loadedTrainImage(TRAIN_ASSETS.passengerCover2);
  if (bogieCover1) {
    ctx.drawImage(bogieCover1,
      bodyX('carriage') + 249 * scale, bodyY('carriage') + 422 * scale,
      172 * scale, 124 * scale);
  }
  if (bogieCover2) {
    ctx.drawImage(bogieCover2,
      bodyX('carriage') + 715 * scale, bodyY('carriage') + 422 * scale,
      172 * scale, 124 * scale);
  }

  // Keep the clickable hotspot following the complete moving train.
  const left = Math.max(0, trainX);
  const right = Math.min(width, trainX + trainWidth);
  trainHotspot.style.display = right > left ? 'block' : 'none';
  trainHotspot.style.left = left / width * 100 + '%';
  trainHotspot.style.top = Math.max(0, trainY) / height * 100 + '%';
  trainHotspot.style.width = Math.max(0, right - left) / width * 100 + '%';
  trainHotspot.style.height = Math.max(0, Math.min(height - Math.max(0, trainY), trainHeight)) / height * 100 + '%';
}

function resetSnow(width,height) {
  const n = Math.min(55,Math.max(25,Math.round(width/13)));
  snow = Array.from({length:n}, (_,i)=>({
    x: ((i*0.618033988749895)%1)*width,
    y: ((i*0.3632713)%1)*height,
    r: i%8===0 ? 2.3 : .9+(i%4)*.21,
    speed: 10+(i*19)%35,
    sway:(i%7-3)*.65,
    opacity:.25+(i%6)*.1
  }));
}
let lastSnowWidth = 0;
function drawSnow(delta) {
  const {ctx,width,height} = sizeCanvas(snowCanvas);
  ctx.clearRect(0,0,width,height);
  if (lastSnowWidth !== width) {resetSnow(width,height);lastSnowWidth=width;}
  if (!overlay.hidden) return;
  for (const flake of snow) {
    if (!motionReduced.matches) {
      flake.y += flake.speed * delta/1000;
      flake.x += flake.sway * delta/1000;
      if (flake.y > height + 4) {flake.y = -4;flake.x = Math.random()*width;}
      if (flake.x < 0) flake.x += width;
      if (flake.x > width) flake.x -= width;
    }
    ctx.fillStyle = `rgba(255,255,255,${flake.opacity})`;
    ctx.beginPath();ctx.arc(flake.x,flake.y,flake.r,0,Math.PI*2);ctx.fill();
    if (flake.r>2) {ctx.lineWidth=1; ctx.strokeStyle=`rgba(255,255,255,${flake.opacity*.8})`;ctx.beginPath();ctx.moveTo(flake.x-4,flake.y);ctx.lineTo(flake.x+4,flake.y);ctx.moveTo(flake.x,flake.y-4);ctx.lineTo(flake.x,flake.y+4);ctx.stroke();}
  }
}
const starFrames = ['JulefestStarShine01.png','JulefestStarShine02.png','JulefestStarShine03.png','JulefestStarShine04.png'];
let lastStarFrame = -1;
let animationId;
function frame(ts) {
  const delta = Math.min(ts - (lastTimestamp||ts),60);
  lastTimestamp=ts;
  if (!motionReduced.matches) {
    const frameNo = Math.floor(ts/950)%4;
    if (frameNo !== lastStarFrame) { starGlow.src = ASSET + starFrames[frameNo];lastStarFrame = frameNo; }
  }
  drawSnow(delta);
  drawTrain(ts,delta);
  animationId=requestAnimationFrame(frame);
}
window.addEventListener('pagehide',()=>{cancelAnimationFrame(animationId);music.pause();});
window.addEventListener('visibilitychange',()=>{lastTimestamp=0;});
requestAnimationFrame(frame);
