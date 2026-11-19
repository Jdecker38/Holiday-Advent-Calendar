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

/** Photoshop PSD coordinate map; separate pieces stay correctly registered. */
const RIG = [
  {name:'body1', x:0, y:0, w:1188,h:545, file:'Train-Animation-Layers_0035_Cart-1.png'},
  {name:'body2', x:1140,y:130,w:793,h:410,file:'Train-Animation-Layers_0034_Cart-2.png'},
  {name:'w21',x:1288,y:442,w:166,h:167,frame:'Cart-2-Wheel-1',first:26},
  {name:'w22',x:1617,y:442,w:166,h:167,frame:'Cart-2-Wheel-2',first:30},
  {name:'cover2',x:1269,y:459,w:534,h:108,file:'Train-Animation-Layers_0025_Cart-2-Wheel-Covers.png'},
  {name:'w11',x:213,y:355,w:255,h:254,frame:'Cart-1-Wheel-1',first:13},
  {name:'w13',x:652,y:355,w:255,h:254,frame:'Cart-1-Wheel-3',first:21},
  {name:'w12',x:448,y:375,w:215,h:214,frame:'Cart-1-Wheel-2',first:17},
  {name:'rod', x:294,y:398,w:507,h:53,file:'Train-Animation-Layers_0012_Cart-1-Wheel-Connector.png'},
  {name:'body3',x:1936,y:13,w:1133,h:540,file:'Train-Animation-Layers_0011_Cart-3.png'},
  {name:'w31',x:2187,y:451,w:157,h:158,frame:'Cart-3-Wheel-1',first:3},
  {name:'w32',x:2685,y:451,w:157,h:158,frame:'Cart-3-Wheel-2',first:7},
  {name:'cover31',x:2186,y:421,w:172,h:124,file:'Train-Animation-Layers_0001_Cart-3-Cover-1.png'},
  {name:'cover32',x:2678,y:425,w:172,h:124,file:'Train-Animation-Layers_0002_Cart-3-Cover-2.png'}
];
const trainImages = new Map();
const imgNames = new Set();
for (const item of RIG) {
  if (item.file) imgNames.add(item.file);
  if (item.frame) for (let i=0; i<4; i++) imgNames.add(`Train-Animation-Layers_${String(item.first+i).padStart(4,'0')}_${item.frame}_Frame-${i+1}.png`);
}
for (const filename of imgNames) {
  const img = new Image(); img.decoding = 'async';
  img.src = ASSET + filename;
  trainImages.set(filename, img);
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
const trainContext = trainCanvas.getContext('2d');
const snowContext = snowCanvas.getContext('2d');
function drawTrain(ts, delta) {
  const {ctx,width,height} = sizeCanvas(trainCanvas);
  ctx.clearRect(0,0,width,height);
  if (!overlay.hidden) return;
  const duration = 17000;
  if (!motionReduced.matches) trainProgress = (trainProgress + delta / duration) % 1;
  // Train faces left, so it enters from the right and exits off the left edge.
  const scale = width * 1.35 / 3072;
  trainWidth = 3072 * scale;
  trainHeight = 609 * scale;
  trainX = width - (width + trainWidth) * trainProgress;
  trainY = height * .84 - trainHeight;
  const phase = Math.floor(ts / 170) % 4;
  const couplingDX = [0,-20,0,20][phase];
  const couplingDY = [-20,0,20,0][phase];
  for (const piece of RIG) {
    const filename = piece.file || `Train-Animation-Layers_${String(piece.first+phase).padStart(4,'0')}_${piece.frame}_Frame-${phase+1}.png`;
    const img = trainImages.get(filename);
    if (!img?.complete || !img.naturalWidth) continue;
    const dx = piece.name === 'rod' ? couplingDX : 0;
    const dy = piece.name === 'rod' ? couplingDY : 0;
    ctx.drawImage(img,trainX+(piece.x+dx)*scale,trainY+(piece.y+dy)*scale,piece.w*scale,piece.h*scale);
  }
  const left = Math.max(-100, trainX);
  const right = Math.min(width+100, trainX+trainWidth);
  trainHotspot.style.display = (right > left) ? 'block' : 'none';
  trainHotspot.style.left = (left / width * 100) + '%';
  trainHotspot.style.top = ((trainY + trainHeight*.07) / height*100) + '%';
  trainHotspot.style.width = ((right-left)/width*100) + '%';
  trainHotspot.style.height = (trainHeight*.88 /height*100) + '%';
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
