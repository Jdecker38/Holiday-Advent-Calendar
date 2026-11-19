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
 * New two-vehicle train — assets are the exact new LEGO renders supplied by the artist.
 * The old middle tender (original Cart 2) is intentionally removed.
 * Wagon 2 NEW.png is the renamed passenger carriage (original Cart 3).
 * The new bodies contain stationary wheel artwork.  Only the visible lower arcs
 * are overlaid with the prior four-frame wheel sprites, to preserve their
 * partially hidden, behind-the-chassis look without painting over the bodies.
 */
const TRAIN_ASSETS = {
  locomotive: 'Train_2026_Wagon_1.png',
  carriage: 'Train_2026_Wagon_3.png',
  rail: 'Train_2026_Straight_Rail.png'
};
const PASSENGER_OFFSET_X = 1785; // native-pixel coupling gap between the two uploads
const PASSENGER_OFFSET_Y = 40; // native-pixel adjustment for matching wheel heights
const TRAIN_TOTAL_WIDTH = PASSENGER_OFFSET_X + 2048;
const TRAIN_IMAGE_HEIGHT = 905;
const TRAIN_SCREEN_WIDTH = 1.23; // total train width relative to the phone scene
const TRAIN_BASELINE = 0.91; // fraction of scene height; below the illustrated mountain track
const WHEEL_RIG = [
  // The wheel-centre coordinates below refer to the original 2048x905 PNGs.
  // The yClip masks the wheel to the area visibly emerging below the chassis.
  {x:650,y:691,diameter:246,clipY:701,first:13,name:'Cart-1-Wheel-1'},
  {x:949,y:698,diameter:216,clipY:703,first:17,name:'Cart-1-Wheel-2'},
  {x:1239,y:692,diameter:246,clipY:700,first:21,name:'Cart-1-Wheel-3'},
  {x:PASSENGER_OFFSET_X+647,y:710+PASSENGER_OFFSET_Y,diameter:196,clipY:651+PASSENGER_OFFSET_Y,first:3,name:'Cart-3-Wheel-1'},
  {x:PASSENGER_OFFSET_X+1347,y:710+PASSENGER_OFFSET_Y,diameter:196,clipY:651+PASSENGER_OFFSET_Y,first:7,name:'Cart-3-Wheel-2'}
];
const trainImages = new Map();
const imgNames = new Set(Object.values(TRAIN_ASSETS));
for (const item of WHEEL_RIG) {
  for (let i=0;i<4;i++) imgNames.add(`Train-Animation-Layers_${String(item.first+i).padStart(4,'0')}_${item.name}_Frame-${i+1}.png`);
}
for (const filename of imgNames) {
  const img = new Image();
  img.decoding = 'async';
  img.src = ASSET + filename;
  trainImages.set(filename,img);
}
function sizeCanvas(canvas) {
  const rect = scene.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1,Math.round(rect.width*scale));
  const h = Math.max(1,Math.round(rect.height*scale));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale,0,0,scale,0,0);
  return {ctx,width:rect.width,height:rect.height};
}
function drawTrain(ts,delta) {
  const {ctx,width,height} = sizeCanvas(trainCanvas);
  ctx.clearRect(0,0,width,height);
  if (!overlay.hidden) return;
  const scale = width * TRAIN_SCREEN_WIDTH / TRAIN_TOTAL_WIDTH;
  const baseline = height * TRAIN_BASELINE;
  const rail = trainImages.get(TRAIN_ASSETS.rail);
  // The uploaded straight rail is drawn behind the new train.
  if (rail?.complete && rail.naturalWidth) {
    ctx.drawImage(rail,0,baseline - 24,width,width*42/2048);
  }
  if (!motionReduced.matches) trainProgress = (trainProgress + delta/17000)%1;
  trainWidth = TRAIN_TOTAL_WIDTH * scale;
  trainHeight = TRAIN_IMAGE_HEIGHT * scale;
  trainX = width - (width + trainWidth)*trainProgress;
  trainY = baseline - trainHeight;
  const engine = trainImages.get(TRAIN_ASSETS.locomotive);
  const passenger = trainImages.get(TRAIN_ASSETS.carriage);
  const drawBody = (img,x,y=0) => {
    if (img?.complete && img.naturalWidth) {
      ctx.drawImage(img,trainX+x*scale,trainY+y*scale,2048*scale,905*scale);
    }
  };
  drawBody(engine,0);
  drawBody(passenger,PASSENGER_OFFSET_X,PASSENGER_OFFSET_Y);
  // Lightweight, four-frame wheel animation behind the wagon's side-skirts.
  const phase = Math.floor(ts/175)%4;
  for (const wheel of WHEEL_RIG) {
    const filename=`Train-Animation-Layers_${String(wheel.first+phase).padStart(4,'0')}_${wheel.name}_Frame-${phase+1}.png`;
    const img=trainImages.get(filename);
    if (!img?.complete || !img.naturalWidth) continue;
    const cx=trainX+wheel.x*scale, cy=trainY+wheel.y*scale;
    const radius=wheel.diameter*scale/2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx,cy,radius,0,Math.PI*2);
    ctx.clip();
    ctx.beginPath();
    const carX=wheel.first<13 ? PASSENGER_OFFSET_X : 0;
    ctx.rect(trainX+carX*scale,trainY+wheel.clipY*scale,2048*scale,(905-wheel.clipY)*scale);
    ctx.clip();
    ctx.drawImage(img,cx-radius,cy-radius,radius*2,radius*2);
    ctx.restore();
  }
  const left=Math.max(0,trainX), right=Math.min(width,trainX+trainWidth);
  trainHotspot.style.display=right>left?'block':'none';
  trainHotspot.style.left=left/width*100+'%';
  trainHotspot.style.top=Math.max(0,trainY)/height*100+'%';
  trainHotspot.style.width=Math.max(0,right-left)/width*100+'%';
  trainHotspot.style.height=Math.min(height-Math.max(0,trainY),trainHeight)/height*100+'%';
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
