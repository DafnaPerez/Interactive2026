// =====================================================
// WILDLIFE TRIANGLE PLATFORM — ONE P5 SKETCH
// Native mobile portrait layout (390×844)
// =====================================================

// --- Globals & scaling ---
// App mode, share/menu state, viewport size helpers (mx/my/ms).

let platformMode = "splash"; // splash | intro | loading | turtle | eagle | deer | toad | hyena
let platformSelectedStarted = false;
let platformSessionAnimalId = null;
let platformIntroHover = -1;
let platformCanvasReady = false;
let platformSplashStarted = false;
let platformSplashPhase = "idle"; // idle | preWhite | play | hold | fadeOut | whiteBeat | fadeIn | done
let platformSplashPhaseStart = 0;
let platformSplashPreWhiteMs = 600;
let platformSplashHoldMs = 380;
let platformSplashFadeOutMs = 380;
let platformSplashWhiteBeatMs = 0;
let platformSplashFadeInMs = 480;
let platformSplashAnimStart = 0;
let platformSplashSettleAt = 0;
let platformSplashLogoAlpha = 1;
let platformSplashPieces = null;
let platformGameAssetsLoadStarted = false;
let platformLineArtProcessed = false;
let platformIntroTransitionActive = false;
let platformIntroTransitionIndex = -1;
let platformIntroTransitionStart = 0;
let platformIntroTransitionDuration = 400;
let platformIntroTransitionSnapshot = null;
let platformIntroTransitionSoundLeadMs = 15;

let platformPosterFadeStartTime = null;
let platformPosterFadeDuration = 320;
let platformPosterFadeColor = null;
let platformSkipNextSessionFade = false;

let platformShareOpen = false;
let platformShareOpenTime = 0;
let platformShareCopiedUntil = 0;
let platformShareCopiedMessage = "";
let platformShareBoxes = null;
let platformSharePointerDown = false;
let platformSharePointerStartX = 0;
let platformSharePointerStartY = 0;
let platformShareDragEligible = false;
let platformShareDragActive = false;
let platformShareDragOffsetY = 0;
let platformShareDragSnapStart = null;
let platformShareDragSnapFrom = 0;
let platformShareDragSnapTarget = 0;
let platformShareDragClosing = false;
let platformSharePreviewStill = false;
let platformShareFrozenFrame = 0;
const PLATFORM_SHARE_PREVIEW_STILL_FRAME = 0;
const PLATFORM_SHARE_PREVIEW_CACHE_VER = 6;
const platformSharePreviewStillCache = new Map();

function platformSharePreviewCacheKey(id) {
  return id + "|v" + PLATFORM_SHARE_PREVIEW_CACHE_VER;
}
const PLATFORM_SHARE_SLIDE_MS = 340;
const PLATFORM_SHARE_DRAG_SNAP_MS = 220;
let platformShareWhatsappLogo = null;
let platformShareInstagramLogo = null;
let platformShareFacebookLogo = null;
let platformFinalHomeIcon = null;
let platformFinalShareIcon = null;
let platformFinalMenuIcon = null;
let platformAnimalMenuOpen = false;
let platformAnimalMenuOpenTime = 0;
let platformAnimalMenuBoxes = null;
const PLATFORM_ANIMAL_MENU_FADE_MS = 260;
let platformLineArtRecolorCache = new Map();

function platformLineArtSourceKey(img) {
  if (!img.__lineArtSourceKey) {
    img.__lineArtSourceKey =
      (img.src || "inline") + "@" + img.width + "x" + img.height;
  }
  return img.__lineArtSourceKey;
}

function platformHexToRgb(hex) {
  let c = color(hex);
  return [red(c), green(c), blue(c)];
}

function platformDesaturateRgb(rgb, amount = 0) {
  if (amount <= 0) {
    return rgb;
  }

  let [r, g, b] = rgb;
  let lum = 0.299 * r + 0.587 * g + 0.114 * b;

  return [
    Math.round(lerp(r, lum, amount)),
    Math.round(lerp(g, lum, amount)),
    Math.round(lerp(b, lum, amount))
  ];
}

function platformShareAnimFrame() {
  return platformSharePreviewStill ? platformShareFrozenFrame : frameCount;
}

let platformLoadingTargetAnimal = null;
let platformLoadingStartTime = null;
let platformHasCompletedAnyPoster = false;
const PLATFORM_LOADING_HOLD_MS = 450;
const PLATFORM_LOADING_MORPH_MS = 280;
const PLATFORM_LOADING_TOTAL_MS = 5000;

// Original poster art/layout reference (650×975)
const REF_W = 650;
const REF_H = 975;

const PLATFORM_EAGLE_ANIMAL_SCALE = 0.69 * 0.85;
const PLATFORM_DEER_ANIMAL_SCALE = 0.815;

// Standard phone portrait canvas
const platformW = 390;
const platformH = 844;
let platformScreenScale = 1;
let platformScreenScaleX = 1;
let platformScreenScaleY = 1;
let platformLastLayoutTighten = 1;
let platformActivePosterQuestionNudgeY = 0;
let platformSafeAreaProbe = null;
let platformFinalDockBleedEl = null;
let platformAudioCtx = null;
let platformAudioMaster = null;
let platformAudioUnlocked = false;
let platformAudioMuted = false;
let platformAudioSilentEl = null;
let platformAudioSelectEl = null;
let platformAudioHtmlEls = Object.create(null);
let platformAudioSuppressUiClose = 0;
let platformAudioBuffers = Object.create(null);
let platformAudioBufferPromises = Object.create(null);
let platformAudioActiveSources = [];
let platformAudioGestureBound = false;
let platformIgnoreNextMousePress = false;
let platformIgnoreNextTouchStarted = false;
// Android: first triangle tap may need Web Audio on press + HTML on pointerup.
let platformPendingIntroSelectSound = false;
let platformIntroSelectSoundPlayed = false;
const PLATFORM_AUDIO_MASTER_GAIN = 0.42;
const PLATFORM_SFX_SAMPLE_V = 26;
const PLATFORM_SFX_SAMPLE_URLS = {
  wrong: `sfx/fail.mp3?v=${PLATFORM_SFX_SAMPLE_V}`,
  correct: `sfx/correct.wav?v=${PLATFORM_SFX_SAMPLE_V}`,
  correct2: `sfx/correct2.wav?v=${PLATFORM_SFX_SAMPLE_V}`,
  complete: `sfx/complete.wav?v=${PLATFORM_SFX_SAMPLE_V}`,
  select: `sfx/select.mp3?v=${PLATFORM_SFX_SAMPLE_V}`
};

function mx(x) {
  return x * platformW / REF_W;
}

function my(y) {
  return y * platformH / REF_H;
}

function ms(s) {
  return s * platformW / REF_W;
}

const PLATFORM_TITLE_Y = my(110) + 20;
const PLATFORM_BG_COLOR = "#F4EBDD";
const PLATFORM_TEXT_COLOR = "#4E463D";
const PLATFORM_TEXT_RGB = [78, 70, 61];
const PLATFORM_UI_ICON_V = 8;
const PLATFORM_SHARE_LOGO_V = 2;
const PLATFORM_SHARE_LOGO_CONTENT_FRAC = {
  whatsapp: { w: 382 / 840, h: 382 / 859 },
  instagram: { w: 430 / 850, h: 430 / 530 },
  facebook: { w: 696 / 736, h: 694 / 736 }
};
const PLATFORM_SHARE_PUBLIC_URL = "https://dafnaperez.github.io/Interactive2026/";

// Procedural UI SFX (no audio files). Alive / musical, not flat beeps.
// Keep select + complete loud; other cues sit quieter underneath.
const PLATFORM_SFX_OTHER_VOLUME_SCALE = 0.58;
const PLATFORM_SFX = {
  select: { kind: "sample", sample: "select", gain: 0.62 },
  correct: { kind: "sample", sample: "correct", gain: 0.18 },
  correct2: { kind: "sample", sample: "correct2", gain: 0.18 },
  wrong: { kind: "sample", sample: "wrong", gain: 0.18 },
  progress: { kind: "pluck", freq: 884, dur: 0.09, gain: 0.1 },
  complete: { kind: "sample", sample: "complete", gain: 1.35 },
  uiOpen: { kind: "pluck", freq: 440, dur: 0.14, gain: 0.14 },
  uiClose: { kind: "pluck", freq: 370, dur: 0.12, gain: 0.12 },
  share: { kind: "pluck", freq: 660, dur: 0.15, gain: 0.14 }
};

const PLATFORM_SHARE_ANIMAL_PHRASE = {
  turtle: "Green Sea Turtles",
  eagle: "Griffon Vultures",
  deer: "Acacia Gazelles",
  toad: "Pelobates Syriacus",
  hyena: "Striped Hyenas"
};

const ANIMAL_REF_W = REF_W;
const ANIMAL_ANCHOR_Y = 400;
const ANIMAL_SCREEN_OFFSET_Y = 50;
const DEER_HYENA_EXTRA_SCREEN_OFFSET_Y = 20;
const INTRO_TRIANGLES_OFFSET_Y = -50;
const INTRO_SCREEN_NUDGE_Y = ms(50);

const WRONG_WAIT_FRAMES = 60; // 1 s pause
const WRONG_RISE_FRAMES = 38;
const PROGRESS_FILL_FRAMES = 26;
const WRONG_TRY_AGAIN_FADE_OUT = 0.42;
const WRONG_TRY_AGAIN_FALL_START = 0.58;
const WRONG_OFFSCREEN_Y = platformH * 1.7;

function wrongFallGetRiseScreenY(p) {
  if (!p.wrongRiseActive) return 0;
  let t = constrain(p.wrongRiseT / WRONG_RISE_FRAMES, 0, 1);
  let ease = (1 - t) * (1 - t);
  return ease * WRONG_OFFSCREEN_Y;
}

function wrongFallGetRiseT(p) {
  if (!p.wrongRiseActive) return 1;
  return constrain(p.wrongRiseT / WRONG_RISE_FRAMES, 0, 1);
}

// Build random fall params for UI elements (title, progress, choices).
// All start near frame 0 so they feel like one group, but with slight variation.
function wrongFallBuildUIElements() {
  function el(delayF, fallF, driftX, rotDir) {
    return { delayF, fallF, driftX, rotDir };
  }
  let lx = random(-1, -0.25) * ms(80);
  let rx = random(0.25, 1)   * ms(80);
  return {
    choiceL:  el(floor(random(0, 4)),  floor(random(44, 58)), lx, random(-0.7, 0) * 0.18),
    choiceR:  el(floor(random(0, 4)),  floor(random(44, 58)), rx, random(0, 0.7)  * 0.18),
    question: el(floor(random(0, 3)),  floor(random(46, 60)), random(-0.4, 0.4) * ms(40), random(-0.15, 0.15) * 0.1),
    progress: el(floor(random(0, 4)),  floor(random(42, 56)), random(-0.5, 0.5) * ms(50), 0)
  };
}

// Build per-piece fall params for a given number of pieces.
function wrongFallBuildPieces(totalPieces) {
  let arr = [];
  for (let i = 0; i < totalPieces; i++) {
    arr.push({
      delayF: floor(random(0, 18)),           // staggered start
      fallF:  floor(random(26, 46)),           // each piece has its own duration
      driftX: random(-1, 1) * ms(95),         // random left/right
      rotDir: random(-1, 1) * 0.32,           // random spin
      wobble: random(0.5, 1.4)               // swing intensity
    });
  }
  return arr;
}

// Screen-space Y offset for a piece during fall/wait phase.
// Returns a screen-px value (to be converted to animal-space inside the draw transform).
function wrongFallGetPieceScreenY(p, index) {
  if (!p.wrongFallPieces || !p.wrongFallPieces[index]) return 0;
  let el = p.wrongFallPieces[index];

  if (p.wrongFallActive) {
    let raw = p.wrongFallT - el.delayF;
    if (raw <= 0) return 0;
    let t    = constrain(raw / el.fallF, 0, 1);
    let ease = t * t * t;
    return ease * WRONG_OFFSCREEN_Y;
  }
  if (p.wrongWaitActive) return WRONG_OFFSCREEN_Y;
  if (p.wrongRiseActive) return wrongFallGetRiseScreenY(p);
  return 0;
}

function wrongFallGetPieceScreenX(p, index) {
  if (!p.wrongFallPieces || !p.wrongFallPieces[index]) return 0;
  let el = p.wrongFallPieces[index];

  if (p.wrongFallActive) {
    let raw = p.wrongFallT - el.delayF;
    if (raw <= 0) return 0;
    let t    = constrain(raw / el.fallF, 0, 1);
    let ease = t * t * t;
    let swing = sin(raw * 0.28 + index * 0.7) * el.wobble * ms(22) * t;
    return el.driftX * ease + swing;
  }
  if (p.wrongWaitActive) return el.driftX;
  if (p.wrongRiseActive) {
    let riseT = wrongFallGetRiseT(p);
    return el.driftX * (1 - riseT);
  }
  return 0;
}

function wrongFallGetPieceRot(p, index) {
  if (!p.wrongFallPieces || !p.wrongFallPieces[index]) return 0;
  let el = p.wrongFallPieces[index];

  if (p.wrongFallActive) {
    let raw = p.wrongFallT - el.delayF;
    if (raw <= 0) return 0;
    let t = constrain(raw / el.fallF, 0, 1);
    return el.rotDir * t * t * t;
  }
  if (p.wrongWaitActive) return el.rotDir;
  if (p.wrongRiseActive) return el.rotDir * (1 - wrongFallGetRiseT(p));
  return 0;
}

// Returns {x, y, rot} for a UI element during fall/rise.
function wrongFallGetElemTransform(p, key) {
  if (!p.wrongFallEls) return { x:0, y:0, rot:0 };
  let el = p.wrongFallEls[key];
  if (!el) return { x:0, y:0, rot:0 };

  let fallDist = WRONG_OFFSCREEN_Y;

  if (p.wrongFallActive) {
    let raw = p.wrongFallT - el.delayF;
    if (raw <= 0) return { x:0, y:0, rot:0 };
    let t    = constrain(raw / el.fallF, 0, 1);
    let ease = t * t * t;
    let swing = sin(raw * 0.28) * ms(14) * t;
    return { x: el.driftX * ease + swing, y: ease * fallDist, rot: el.rotDir * ease };
  }
  if (p.wrongWaitActive) {
    return { x: el.driftX, y: fallDist, rot: el.rotDir };
  }
  if (p.wrongRiseActive) {
    let riseT = wrongFallGetRiseT(p);
    return { x: el.driftX * (1 - riseT), y: wrongFallGetRiseScreenY(p), rot: el.rotDir * (1 - riseT) };
  }
  return { x:0, y:0, rot:0 };
}

// Convert screen-px fall/rise offset into the local coords of a piece draw path.
function wrongFallGetPieceDrawOffset(p, index, cfg) {
  if (!p.wrongFallActive && !p.wrongWaitActive && !p.wrongRiseActive) {
    return { x: 0, y: 0, rot: 0 };
  }

  let canvasScale = platformW / ANIMAL_REF_W;
  let sx = canvasScale;
  let sy = canvasScale;

  if (cfg?.id === "hyena" && p.hyena) {
    sx *= p.hyena.scale;
    sy *= p.hyena.scale;
  } else {
    let dt = platformLooseGetDrawTransform(cfg);
    sx *= dt.scaleX || 1;
    sy *= dt.scaleY || 1;
  }

  return {
    x: wrongFallGetPieceScreenX(p, index) / sx,
    y: wrongFallGetPieceScreenY(p, index) / sy,
    rot: wrongFallGetPieceRot(p, index)
  };
}
const PLATFORM_SHARE_BACKDROP_DARKEN = 0.44;
const PLATFORM_SHARE_BACKDROP_BLUR_PX = 18;

let platformBlurScratchCanvas = null;
let platformBlurDownCanvas = null;
let platformBlurTinyCanvas = null;
let platformBlurLiveResult = null;
let platformBlurSnapCacheKey = "";
let platformBlurSnapCache = null;
let platformBlurFrameStamp = -1;
let platformBlurFilterContentOk = null;
let platformCanvasFilterWorks = null;

function platformGetSnapCanvas(snap) {
  if (!snap) {
    return null;
  }
  return snap.canvas || snap.elt || snap;
}

function platformDetectCanvasFilterWorks() {
  if (platformCanvasFilterWorks !== null) {
    return platformCanvasFilterWorks;
  }

  try {
    let src = document.createElement("canvas");
    src.width = 32;
    src.height = 32;
    let sctx = src.getContext("2d");
    sctx.fillStyle = "#000";
    sctx.fillRect(0, 0, 32, 32);
    sctx.fillStyle = "#fff";
    sctx.fillRect(14, 14, 4, 4);

    let dst = document.createElement("canvas");
    dst.width = 32;
    dst.height = 32;
    let dctx = dst.getContext("2d");
    if (!("filter" in dctx)) {
      platformCanvasFilterWorks = false;
      return false;
    }

    dctx.filter = "blur(4px)";
    dctx.drawImage(src, 0, 0);
    dctx.filter = "none";
    let px = dctx.getImageData(15, 16, 1, 1).data;
    platformCanvasFilterWorks = px[0] > 20 && px[0] < 235;
  } catch (err) {
    platformCanvasFilterWorks = false;
  }

  return platformCanvasFilterWorks;
}

function platformSampleCanvasDiff(sourceCanvas, blurredCanvas, sw, sh, refX, refY) {
  let sx = Math.min(Math.max(Math.floor(refX * sw / platformW), 1), sw - 2);
  let sy = Math.min(Math.max(Math.floor(refY * sh / platformH), 1), sh - 2);
  let before = sourceCanvas.getContext("2d").getImageData(sx, sy, 1, 1).data;
  let after = blurredCanvas.getContext("2d").getImageData(sx, sy, 1, 1).data;
  return before[0] !== after[0] || before[1] !== after[1] || before[2] !== after[2];
}

function platformBoxBlurHorizontal(rgba, w, h, radius) {
  let r = Math.max(1, Math.floor(radius));
  let out = new Uint8ClampedArray(rgba.length);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let outIdx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        for (let k = -r; k <= r; k++) {
          let px = Math.min(Math.max(x + k, 0), w - 1);
          sum += rgba[(y * w + px) * 4 + c];
          count++;
        }
        out[outIdx + c] = (sum / count) | 0;
      }
      out[outIdx + 3] = rgba[outIdx + 3];
    }
  }

  rgba.set(out);
}

function platformBoxBlurVertical(rgba, w, h, radius) {
  let r = Math.max(1, Math.floor(radius));
  let out = new Uint8ClampedArray(rgba.length);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let outIdx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let count = 0;
        for (let k = -r; k <= r; k++) {
          let py = Math.min(Math.max(y + k, 0), h - 1);
          sum += rgba[(py * w + x) * 4 + c];
          count++;
        }
        out[outIdx + c] = (sum / count) | 0;
      }
      out[outIdx + 3] = rgba[outIdx + 3];
    }
  }

  rgba.set(out);
}

function platformManualBlurCanvasInto(sourceCanvas, destCanvas, blurPx) {
  let sw = sourceCanvas.width;
  let sh = sourceCanvas.height;
  // Fallback when canvas filter blur is unavailable. Stepwise downscale keeps
  // this softer than a single tiny upscale.
  let scale = 0.42;
  let dw = Math.max(1, Math.round(sw * scale));
  let dh = Math.max(1, Math.round(sh * scale));

  if (!platformBlurDownCanvas) {
    platformBlurDownCanvas = document.createElement("canvas");
  }
  if (
    platformBlurDownCanvas.width !== dw ||
    platformBlurDownCanvas.height !== dh
  ) {
    platformBlurDownCanvas.width = dw;
    platformBlurDownCanvas.height = dh;
  }

  let dctx = platformBlurDownCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  dctx.clearRect(0, 0, dw, dh);
  dctx.imageSmoothingEnabled = true;
  dctx.imageSmoothingQuality = "high";

  let mw = Math.max(dw, Math.round(sw * 0.65));
  let mh = Math.max(dh, Math.round(sh * 0.65));
  if (!platformBlurTinyCanvas) {
    platformBlurTinyCanvas = document.createElement("canvas");
  }
  if (
    platformBlurTinyCanvas.width !== mw ||
    platformBlurTinyCanvas.height !== mh
  ) {
    platformBlurTinyCanvas.width = mw;
    platformBlurTinyCanvas.height = mh;
  }
  let mctx = platformBlurTinyCanvas.getContext("2d");
  mctx.clearRect(0, 0, mw, mh);
  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = "high";
  mctx.drawImage(sourceCanvas, 0, 0, mw, mh);
  dctx.drawImage(platformBlurTinyCanvas, 0, 0, mw, mh, 0, 0, dw, dh);

  let imageData = dctx.getImageData(0, 0, dw, dh);
  let radius = Math.max(1, Math.round((blurPx * scale * sw) / platformW / 1.6));
  for (let i = 0; i < 2; i++) {
    platformBoxBlurHorizontal(imageData.data, dw, dh, radius);
    platformBoxBlurVertical(imageData.data, dw, dh, radius);
  }
  dctx.putImageData(imageData, 0, 0);

  let sctx = destCanvas.getContext("2d");
  sctx.clearRect(0, 0, sw, sh);
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(platformBlurDownCanvas, 0, 0, dw, dh, 0, 0, sw, sh);
}

// iPhone live overlay blur: downscale → Gaussian at small size → keep small.
// Stretched when drawn. Updates every frame without freezing or full-res lag.
function platformIosLiveBlurCanvas(sourceCanvas, blurPx) {
  let sw = sourceCanvas.width | 0;
  let sh = sourceCanvas.height | 0;
  if (!sw || !sh) {
    return null;
  }
  let scale = 0.34;
  let dw = Math.max(1, Math.round(sw * scale));
  let dh = Math.max(1, Math.round(sh * scale));

  if (!platformBlurDownCanvas) {
    platformBlurDownCanvas = document.createElement("canvas");
  }
  if (
    platformBlurDownCanvas.width !== dw ||
    platformBlurDownCanvas.height !== dh
  ) {
    platformBlurDownCanvas.width = dw;
    platformBlurDownCanvas.height = dh;
  }
  if (!platformBlurLiveResult) {
    platformBlurLiveResult = document.createElement("canvas");
  }
  if (
    platformBlurLiveResult.width !== dw ||
    platformBlurLiveResult.height !== dh
  ) {
    platformBlurLiveResult.width = dw;
    platformBlurLiveResult.height = dh;
  }

  let dctx = platformBlurDownCanvas.getContext("2d");
  dctx.imageSmoothingEnabled = true;
  dctx.imageSmoothingQuality = "high";
  dctx.clearRect(0, 0, dw, dh);
  dctx.drawImage(sourceCanvas, 0, 0, dw, dh);

  let rctx = platformBlurLiveResult.getContext("2d");
  rctx.imageSmoothingEnabled = true;
  rctx.imageSmoothingQuality = "high";
  rctx.clearRect(0, 0, dw, dh);
  // Radius scales with the buffer so softness matches full-res blur(~18px).
  let smallBlur = Math.max(2, blurPx * scale * 1.2);
  if (platformDetectCanvasFilterWorks()) {
    rctx.filter = `blur(${smallBlur}px)`;
    rctx.drawImage(platformBlurDownCanvas, 0, 0);
    rctx.filter = "none";
  } else {
    // Soft fallback: extra mid downscale pass, still live each frame.
    let tw = Math.max(1, Math.round(dw * 0.7));
    let th = Math.max(1, Math.round(dh * 0.7));
    if (!platformBlurTinyCanvas) {
      platformBlurTinyCanvas = document.createElement("canvas");
    }
    if (
      platformBlurTinyCanvas.width !== tw ||
      platformBlurTinyCanvas.height !== th
    ) {
      platformBlurTinyCanvas.width = tw;
      platformBlurTinyCanvas.height = th;
    }
    let tctx = platformBlurTinyCanvas.getContext("2d");
    tctx.clearRect(0, 0, tw, th);
    tctx.drawImage(platformBlurDownCanvas, 0, 0, dw, dh, 0, 0, tw, th);
    rctx.drawImage(platformBlurTinyCanvas, 0, 0, tw, th, 0, 0, dw, dh);
  }
  return platformBlurLiveResult;
}

function platformIsIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }
  return (
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

let platformAndroidDeviceCached = null;

function platformIsAndroidDevice() {
  if (platformAndroidDeviceCached !== null) {
    return platformAndroidDeviceCached;
  }
  if (typeof navigator === "undefined") {
    platformAndroidDeviceCached = false;
    return false;
  }
  platformAndroidDeviceCached = /Android/i.test(navigator.userAgent);
  return platformAndroidDeviceCached;
}

function platformDesiredPixelDensity() {
  let dpr = 1;
  if (typeof window !== "undefined" && window.devicePixelRatio) {
    dpr = window.devicePixelRatio;
  }
  let dd = 1;
  try {
    dd = displayDensity() || 1;
  } catch (e) {
    // p5 not ready yet
  }
  // Some Android WebViews under-report one of these — take the sharper reading.
  return min(max(dpr, dd, 1), 3);
}

function platformApplyPixelDensity() {
  // Full device DPR — never downscale (that looks pixelized). Lag is fixed in CPU paths.
  let d = platformDesiredPixelDensity();
  pixelDensity(d);

  // If the backing store is still 1× after CSS upscaling, Android looks blocky.
  let cnv =
    typeof drawingContext !== "undefined" && drawingContext
      ? drawingContext.canvas
      : typeof document !== "undefined"
        ? document.querySelector("canvas")
        : null;
  if (!cnv) {
    return;
  }
  let needW = Math.round(platformW * d);
  let needH = Math.round(platformH * d);
  if (Math.abs(cnv.width - needW) > 1 || Math.abs(cnv.height - needH) > 1) {
    pixelDensity(d);
    resizeCanvas(platformW, platformH);
  }
}

function platformEnsureHiDpiCanvas() {
  let cnv =
    typeof drawingContext !== "undefined" && drawingContext
      ? drawingContext.canvas
      : typeof document !== "undefined"
        ? document.querySelector("canvas")
        : null;
  if (!cnv) {
    return;
  }
  let d = platformDesiredPixelDensity();
  let needW = Math.round(platformW * d);
  let needH = Math.round(platformH * d);
  if (Math.abs(cnv.width - needW) > 1 || Math.abs(cnv.height - needH) > 1) {
    pixelDensity(d);
    resizeCanvas(platformW, platformH);
  }
}

function platformLooseAndroidHeavyAnimal(p) {
  // Gazelle/toad run the costly hyena-style bbox repel with many pieces.
  return (
    platformIsAndroidDevice() &&
    p &&
    p.cfg &&
    (p.cfg.id === "deer" || p.cfg.id === "toad")
  );
}

function platformIsSafari() {
  if (typeof navigator === "undefined") {
    return false;
  }
  let ua = navigator.userAgent || "";
  let isIOS =
    /iP(hone|od|ad)/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  // iOS Chrome/Firefox/Edge/Opera ship with "Safari" in the UA — exclude them.
  if (/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) {
    return false;
  }
  if (isIOS) {
    // Remaining iOS browsers here are Safari (or Safari WebView with Apple UA).
    return /AppleWebKit/i.test(ua) && !/Chrome|Firefox|SamsungBrowser/i.test(ua);
  }

  // Desktop Safari
  return (
    /Safari/i.test(ua) &&
    /AppleWebKit/i.test(ua) &&
    !/Chrome|Chromium|Edg\/|OPR|Firefox|SamsungBrowser/i.test(ua)
  );
}

function platformGetSafariQuestionNudgeY() {
  return platformIsSafari() ? POSTER_LAYOUT.questionPhaseSafariNudgeY : 0;
}

let platformMenuBackdropEl = null;
let platformMenuOverlayGfx = null;

function platformUseLiveDomMenuBackdrop() {
  // iOS Safari/Chrome: backdrop-filter often fails to sample the p5 canvas
  // and composites as solid white. Use canvas manual blur (same as Android).
  return false;
}

function platformUseLiveDomBackdrop() {
  return platformUseLiveDomMenuBackdrop();
}

function platformGetDrawCtx(gfx) {
  return gfx ? gfx.drawingContext : drawingContext;
}

function platformGetLiveCanvasSnap() {
  return { canvas: drawingContext.canvas };
}

function platformApplyFixedLayerLayout(el, zIndex) {
  let cnv = document.querySelector("canvas");
  if (!cnv || !el) {
    return;
  }

  el.style.position = "fixed";
  el.style.margin = "0";
  el.style.transform = "none";
  el.style.left = cnv.style.left;
  el.style.top = cnv.style.top;
  el.style.width = cnv.style.width;
  el.style.height = cnv.style.height;
  el.style.zIndex = String(zIndex);
  el.style.pointerEvents = "none";
}

function platformEnsureMenuBackdropEl() {
  if (!platformMenuBackdropEl && typeof document !== "undefined") {
    let el = document.createElement("div");
    el.id = "platform-menu-backdrop";
    document.body.appendChild(el);
    platformMenuBackdropEl = el;
  }
  return platformMenuBackdropEl;
}

function platformSyncMenuBackdropEl(shadeAlpha) {
  let el = platformEnsureMenuBackdropEl();
  if (!el) {
    return;
  }

  platformApplyFixedLayerLayout(el, 3);
  let blurPx = PLATFORM_SHARE_BACKDROP_BLUR_PX;
  let shade = (shadeAlpha / 255) * PLATFORM_SHARE_BACKDROP_DARKEN;
  el.style.display = "block";
  el.style.backdropFilter = `blur(${blurPx}px)`;
  el.style.webkitBackdropFilter = `blur(${blurPx}px)`;
  el.style.backgroundColor = `rgba(${PLATFORM_TEXT_RGB[0]},${PLATFORM_TEXT_RGB[1]},${PLATFORM_TEXT_RGB[2]},${shade})`;
}

function platformEnsureMenuOverlayGfx() {
  if (!platformMenuOverlayGfx) {
    platformMenuOverlayGfx = createGraphics(platformW, platformH);
    platformMenuOverlayGfx.pixelDensity(pixelDensity());
    if (typeof document !== "undefined") {
      document.body.appendChild(platformMenuOverlayGfx.elt);
      platformMenuOverlayGfx.elt.style.pointerEvents = "none";
    }
  } else if (
    platformMenuOverlayGfx.width !== platformW ||
    platformMenuOverlayGfx.height !== platformH
  ) {
    platformMenuOverlayGfx.resizeCanvas(platformW, platformH);
    platformMenuOverlayGfx.pixelDensity(pixelDensity());
  }
  platformApplyFixedLayerLayout(platformMenuOverlayGfx.elt, 4);
  return platformMenuOverlayGfx;
}

function platformShowMenuOverlayLayers() {
  let cnv = document.querySelector("canvas");
  if (cnv) {
    cnv.style.zIndex = "2";
  }
  if (platformMenuBackdropEl) {
    platformMenuBackdropEl.style.display = "block";
  }
  if (platformMenuOverlayGfx) {
    platformMenuOverlayGfx.elt.style.display = "block";
  }
}

function platformHideMenuOverlayLayers() {
  if (platformMenuBackdropEl) {
    platformMenuBackdropEl.style.display = "none";
  }
  if (platformMenuOverlayGfx) {
    platformMenuOverlayGfx.elt.style.display = "none";
  }
  let cnv = document.querySelector("canvas");
  if (cnv) {
    cnv.style.zIndex = "";
  }
}

function platformCanvasBlurActuallyWorked(sourceCanvas, blurredCanvas, sw, sh) {
  let refs = [
    [0.5, 0.42],
    [0.5, 0.58],
    [0.34, 0.5],
    [0.66, 0.5]
  ];

  for (let i = 0; i < refs.length; i++) {
    if (
      platformSampleCanvasDiff(
        sourceCanvas,
        blurredCanvas,
        sw,
        sh,
        platformW * refs[i][0],
        platformH * refs[i][1]
      )
    ) {
      return true;
    }
  }

  return false;
}

function platformBlurCanvasSource(sourceCanvas, blurPx) {
  if (!sourceCanvas || blurPx <= 0) {
    return null;
  }

  // iPhone: live small-buffer Gaussian each frame (smooth + cheap).
  if (platformIsIosDevice()) {
    return platformIosLiveBlurCanvas(sourceCanvas, blurPx);
  }

  let sw = sourceCanvas.width;
  let sh = sourceCanvas.height;
  if (!platformBlurScratchCanvas) {
    platformBlurScratchCanvas = document.createElement("canvas");
  }
  if (
    platformBlurScratchCanvas.width !== sw ||
    platformBlurScratchCanvas.height !== sh
  ) {
    platformBlurScratchCanvas.width = sw;
    platformBlurScratchCanvas.height = sh;
  }

  let sctx = platformBlurScratchCanvas.getContext("2d");
  sctx.clearRect(0, 0, sw, sh);

  if (platformDetectCanvasFilterWorks()) {
    sctx.filter = `blur(${blurPx}px)`;
    sctx.drawImage(sourceCanvas, 0, 0, sw, sh);
    sctx.filter = "none";
    // Verify once — getImageData every frame would tank performance.
    if (platformBlurFilterContentOk === null) {
      platformBlurFilterContentOk = platformCanvasBlurActuallyWorked(
        sourceCanvas,
        platformBlurScratchCanvas,
        sw,
        sh
      );
    }
    if (platformBlurFilterContentOk) {
      return platformBlurScratchCanvas;
    }
    sctx.clearRect(0, 0, sw, sh);
  }

  platformManualBlurCanvasInto(sourceCanvas, platformBlurScratchCanvas, blurPx);
  return platformBlurScratchCanvas;
}

function platformInvalidateBlurSnapCache() {
  platformBlurSnapCache = null;
  platformBlurSnapCacheKey = "";
  platformBlurFrameStamp = -1;
}

function platformOverlayWantsLiveBlur() {
  return platformAnimalMenuOpen || platformShareOpen;
}

function platformGetBlurredSnap(snap, blurPx) {
  let sourceCanvas = platformGetSnapCanvas(snap);
  if (!sourceCanvas) {
    return null;
  }

  let cacheKey =
    sourceCanvas.width + "x" + sourceCanvas.height + "@" + blurPx;

  // While menu/share is open, refresh blur every frame so the poster keeps
  // moving inside the blur — but reuse within the same frame (backdrop + frost).
  if (platformOverlayWantsLiveBlur()) {
    let stamp = typeof frameCount === "number" ? frameCount : millis();
    if (
      platformBlurFrameStamp === stamp &&
      platformBlurSnapCacheKey === cacheKey &&
      platformBlurSnapCache
    ) {
      return platformBlurSnapCache;
    }
    platformBlurSnapCache = platformBlurCanvasSource(sourceCanvas, blurPx);
    platformBlurSnapCacheKey = cacheKey;
    platformBlurFrameStamp = stamp;
    return platformBlurSnapCache;
  }

  if (platformBlurSnapCacheKey === cacheKey && platformBlurSnapCache) {
    return platformBlurSnapCache;
  }

  platformBlurSnapCache = platformBlurCanvasSource(sourceCanvas, blurPx);
  platformBlurSnapCacheKey = cacheKey;
  return platformBlurSnapCache;
}

function platformDrawBlurredSnapIntoRect(ctx, snap, blurred, x, y, w, h) {
  if (!blurred) {
    return false;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    blurred,
    0,
    0,
    blurred.width,
    blurred.height,
    x,
    y,
    w,
    h
  );
  return true;
}

const PLATFORM_LOADING_TRIANGLE_SIZE = mx(72);

function platformGetLoadingTriangleCy() {
  return platformLayoutY(420) + INTRO_TRIANGLES_OFFSET_Y + ms(25);
}

function platformScreenPxToAnimalRefY(screenPx) {
  return screenPx * ANIMAL_REF_W / platformW;
}

const PLATFORM_EAGLE_FINAL_ORIGIN_Y = 405 - platformScreenPxToAnimalRefY(20);
const PLATFORM_DEER_FINAL_ORIGIN_X = 30 + platformScreenPxToAnimalRefY(10);
const PLATFORM_DEER_FINAL_ORIGIN_Y =
  -80 +
  platformScreenPxToAnimalRefY(DEER_HYENA_EXTRA_SCREEN_OFFSET_Y) +
  platformScreenPxToAnimalRefY(15);

let platformTriangleDrawPass = 0;
let platformSuppressAnimalPieceDraw = false;
let platformAnimalDrawAllPieces = false;
const platformAssembledDrawThreshold = 0.82;

function platformPrepareAnimalPieceDraw(t) {
  // Android gazelle/toad single pass must draw every piece (no pass-1 layer).
  if (platformAnimalDrawAllPieces || platformTriangleDrawPass < 0) {
    platformSuppressAnimalPieceDraw = false;
    return true;
  }
  if (platformTriangleDrawPass === 0) {
    platformSuppressAnimalPieceDraw = t >= platformAssembledDrawThreshold;
  } else {
    platformSuppressAnimalPieceDraw = t < platformAssembledDrawThreshold;
  }

  return !platformSuppressAnimalPieceDraw;
}

function posterDrawAnimalMobile(p) {
  push();
  let shake = platformGetPieceShakeOffset(p);
  let s = platformW / ANIMAL_REF_W;
  translate(
    platformW / 2 + shake.x,
    platformLayoutY(ANIMAL_ANCHOR_Y) +
      ms(ANIMAL_SCREEN_OFFSET_Y) +
      posterGetBelowHeaderNudgeY() +
      shake.y
  );
  rotate(shake.rot);
  scale(s);
  translate(-ANIMAL_REF_W / 2, -ANIMAL_ANCHOR_Y);

  // Android gazelle/toad: one draw pass while connecting — dual pass doubles
  // morph cost. Draw all pieces in that single pass.
  let singlePass = platformLooseAndroidHeavyAnimal(p);
  platformAnimalDrawAllPieces = singlePass;
  platformTriangleDrawPass = singlePass ? -1 : 0;
  platformSuppressAnimalPieceDraw = false;
  p.cfg.drawAnimal();

  if (!singlePass) {
    platformTriangleDrawPass = 1;
    p.cfg.drawAnimal();
  }

  platformTriangleDrawPass = 0;
  platformAnimalDrawAllPieces = false;
  platformSuppressAnimalPieceDraw = false;
  pop();
}

function platformGetSharePreviewTuning(animalId) {
  switch (animalId) {
    case "eagle":
      return {
        scale: 0.54,
        screenX: 0,
        screenY: -12,
        refX: -6,
        refY: -18,
        shareExtraDown: 10,
        shareAnimalNudgeY: -ms(15)
      };
    case "turtle":
      return {
        scale: 0.62,
        screenX: 0,
        screenY: -12,
        refX: 0,
        refY: 0,
        shareExtraDown: 8
      };
    case "deer":
      return {
        scale: 0.52,
        screenX: 18,
        screenY: -28,
        refX: -102,
        refY: 8,
        shareExtraDown: 28,
        shareAnimalNudgeY: -ms(15)
      };
    case "toad":
      return {
        scale: 0.60,
        screenX: 0,
        screenY: -18,
        refX: 0,
        refY: 0,
        shareExtraDown: 6,
        shareAnimalNudgeY: -ms(15)
      };
    case "hyena":
      return {
        scale: 0.64,
        screenX: 0,
        screenY: -24,
        refX: -14,
        refY: 8,
        shareExtraDown: 26,
        shareAnimalNudgeY: -ms(15)
      };
    default:
      return { scale: 0.64, screenX: 0, screenY: 0, refX: 0, refY: 0 };
  }
}

function posterDrawAnimalSharePreview(p, rectBox) {
  push();
  let screenScale = rectBox.w / platformW;
  let tuning = platformGetSharePreviewTuning(p.id);
  let animalScale = (platformW / ANIMAL_REF_W) * screenScale * tuning.scale;
  let previewNudgeY = POSTER_LAYOUT.sharePreviewAnimalNudgeY;
  let extraDown = tuning.shareExtraDown || 0;
  let animalNudgeY = tuning.shareAnimalNudgeY || 0;
  translate(
    rectBox.x + rectBox.w / 2 + tuning.screenX,
    rectBox.y +
      rectBox.h / 2 +
      ANIMAL_SCREEN_OFFSET_Y * screenScale +
      tuning.screenY +
      previewNudgeY +
      animalNudgeY +
      extraDown
  );
  scale(animalScale);
  translate(
    -ANIMAL_REF_W / 2 + tuning.refX,
    -ANIMAL_ANCHOR_Y + tuning.refY
  );

  if (platformSharePreviewStill) {
    platformTriangleDrawPass = 1;
    p.cfg.drawAnimal();
    platformTriangleDrawPass = 0;
    platformSuppressAnimalPieceDraw = false;
    pop();
    return;
  }

  platformTriangleDrawPass = 0;
  p.cfg.drawAnimal();

  platformTriangleDrawPass = 1;
  p.cfg.drawAnimal();

  platformTriangleDrawPass = 0;
  platformSuppressAnimalPieceDraw = false;
  pop();
}

function platformGetIntroZoomScale(pts, cx, cy) {
  let maxDist = 1;
  for (let i = 0; i < 3; i++) {
    maxDist = max(maxDist, dist(pts[i][0], pts[i][1], cx, cy));
  }
  return (max(platformW, platformH) / maxDist) * 1.12;
}

const platformText = {
  introTitle: {
    text: "Choose a Triangle",
    x: platformW / 2,
    y: PLATFORM_TITLE_Y,
    size: ms(46),
    leading: ms(42)
  },

  introHint: {
    text: "Tap a triangle to begin",
    x: platformW / 2,
    y: my(620) + 160,
    size: ms(20),
    alpha: 180
  },

  loadingHint: {
    text: "Let's answer a few questions about everyday choices and their impact.",
    x: platformW / 2,
    y: my(560),
    size: ms(24),
    leading: ms(28),
    wordGapScale: 0.72
  },

  questionTitle: {
    text: "What would you choose?",
    x: platformW / 2,
    y: my(920) - ms(162) - ms(35) - ms(28) - ms(14),
    size: ms(24),
    leading: ms(28)
  },

  tryAgain: {
    text: "Try again"
  },

  choiceLabel: {
    size: ms(17),
    alpha: 255,
    yOffset: ms(10)
  },

  preFinalFooter: {
    size: ms(48),
    leading: ms(46)
  },

  finalTitle: {
    lines: ["EVERY", "CHOICE", "COUNTS"],
    size: ms(50),
    leading: ms(50)
  },

  finalFooter: {
    leading: ms(50)
  },

  finalCta: {
    text: "Turn small choices into change >>",
    size: ms(24)
  },

  share: {
    title: "Share this poster",
    body: "Help friends discover how everyday choices\ncan protect the Israeli wildlife.",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    facebook: "Facebook",
    copied: "Link copied — paste in Instagram",
    copiedOpeningInstagram: "Caption copied — pick Instagram for the image",
    copiedOpeningFacebook: "Opening Facebook — text ready for your post",
    instagramFallback: "Caption copied — open Instagram and paste it",
    close: "Not now",
    back: "try another animal >>"
  }
};


const platformAnimals = [
  {
    id: "eagle",
    color: "#5A4637",
    pts: [[78, 500], [150, 365], [255, 438]]
  },
  {
    id: "turtle",
    color: "#5F744A",
    pts: [[286, 520], [300, 340], [398, 575]]
  },
  {
    id: "toad",
    color: "#c1b783",
    pts: [[205, 740], [129, 551], [285, 577]]
  },
  {
    id: "hyena",
    color: "#b4895d",
    pts: [[337, 681], [495, 568], [476, 749]]
  },
  {
    id: "deer",
    color: "#D8B788",
    pts: [[452, 495], [468, 330], [615, 525]]
  }
];

function preload() {
  // Heavy assets load during the splash (see setup) so we don't sit on a long
  // white screen before the opening animation. Deep links still preload now.
  if (platformStartupAnimalId()) {
    platformLoadAllGameAssets();
  }
}

function platformStartupAnimalId() {
  if (typeof window === "undefined" || !window.location) {
    return null;
  }
  try {
    let animal = new URLSearchParams(window.location.search).get("animal");
    return animal && posterRegistry && posterRegistry[animal] ? animal : null;
  } catch (e) {
    return null;
  }
}

function platformLoadAllGameAssets() {
  if (platformGameAssetsLoadStarted) {
    return;
  }
  platformGameAssetsLoadStarted = true;
  posterPreloadAll();
  platformShareWhatsappLogo = loadImage(`whatsapp_logo.png?v=${PLATFORM_SHARE_LOGO_V}`);
  platformShareInstagramLogo = loadImage(`instagram_logo.png?v=${PLATFORM_SHARE_LOGO_V}`);
  platformShareFacebookLogo = loadImage(`facebook_logo.png?v=${PLATFORM_SHARE_LOGO_V}`);
  platformFinalHomeIcon = loadImage(`home.png?v=${PLATFORM_UI_ICON_V}`);
  platformFinalShareIcon = loadImage(`share.png?v=${PLATFORM_UI_ICON_V}`);
  platformFinalMenuIcon = loadImage(`menu.png?v=${PLATFORM_UI_ICON_V}`);
}

function platformApplyCanvasSize() {
  resizeCanvas(platformW, platformH);
  platformApplyPixelDensity();
  platformApplyViewportLayout();
}

function platformApplyStartupQuery() {
  if (typeof window === "undefined" || !window.location) {
    return;
  }

  let animal = new URLSearchParams(window.location.search).get("animal");

  if (animal && posterRegistry[animal]) {
    platformSkipSplashToAnimal(animal);
  }
}

function platformSkipSplashToAnimal(animal) {
  platformTeardownSplash();
  platformSplashPhase = "done";
  platformMode = animal;
  platformSelectedStarted = false;
  platformSessionAnimalId = null;
  platformIntroTransitionActive = false;
  platformIntroTransitionIndex = -1;
  platformIntroTransitionSnapshot = null;
  platformPosterFadeStartTime = null;
  platformPosterFadeColor = null;
}

// --- Audio ---
// HTMLAudio samples for iOS reliability; Web Audio fallbacks / UI plucks.

function platformAudioApplyPlaybackSession() {
  // iOS: default Web Audio is "ambient" and follows the mute switch.
  // "playback" matches music/video so SFX still audibly play while silenced.
  try {
    if (typeof navigator !== "undefined" && navigator.audioSession) {
      navigator.audioSession.type = "playback";
    }
  } catch (e) {
    // ignore unsupported / restricted
  }
}

function platformEnsureHtmlSampleEl(sampleName) {
  if (typeof document === "undefined" || !PLATFORM_SFX_SAMPLE_URLS[sampleName]) {
    return null;
  }
  if (platformAudioHtmlEls[sampleName]) {
    return platformAudioHtmlEls[sampleName];
  }
  let el = document.createElement("audio");
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.preload = "auto";
  el.src = PLATFORM_SFX_SAMPLE_URLS[sampleName];
  el.volume = platformAudioMuted ? 0 : 0.55;
  el.style.cssText =
    "position:fixed;width:0;height:0;opacity:0;pointer-events:none;";
  document.body.appendChild(el);
  try {
    el.load();
  } catch (e) {
    // ignore
  }
  platformAudioHtmlEls[sampleName] = el;
  if (sampleName === "select") {
    platformAudioSelectEl = el;
    // Android: avoid src swap + load() racing the first triangle tap.
    if (!platformIsAndroidDevice()) {
      platformPrimeSelectAudioBlob(el);
    }
  }
  return el;
}

function platformPrimeSelectAudioBlob(el) {
  // Fully buffer select into a blob URL so the first tap plays with less delay.
  if (!el || el.dataset.primed === "1") {
    return;
  }
  fetch(PLATFORM_SFX_SAMPLE_URLS.select)
    .then((res) => res.blob())
    .then((blob) => {
      let url = URL.createObjectURL(blob);
      el.src = url;
      el.dataset.primed = "1";
      try {
        el.load();
      } catch (e) {
        // ignore
      }
    })
    .catch(() => {});
}

function platformPlayHtmlEl(el, volume = 0.55) {
  if (platformAudioMuted || !el) {
    return false;
  }
  platformAudioApplyPlaybackSession();
  try {
    // Reuse the primed element. cloneNode() re-buffers on iPhone and makes
    // correct/wrong (and select) feel late vs Android.
    el.muted = false;
    el.volume = Math.max(0, Math.min(1, volume));
    // Skip pause/seek on a fresh element — Android Chrome can abort the
    // following play() if we pause before the first successful start.
    let needsReset = !el.paused || el.ended || el.currentTime > 0.02;
    if (needsReset) {
      try {
        el.pause();
      } catch (e) {
        // ignore
      }
      try {
        el.currentTime = 0;
      } catch (e) {
        // ignore
      }
    }
    let playResult = el.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(() => {});
    }
    platformAudioUnlocked = true;
    return true;
  } catch (e) {
    return false;
  }
}

function platformPlayHtmlSample(sampleName, volume = 0.55) {
  return platformPlayHtmlEl(platformEnsureHtmlSampleEl(sampleName), volume);
}

// Soft UI plucks as HTMLAudio (iOS silent-switch / gesture safe).
// Web Audio oscillators often stay silent after quiz SFX moved to <audio>.
function platformBuildToneBlobUrl(freq, durSec, peak = 0.55) {
  let sampleRate = 22050;
  let numSamples = Math.max(1, Math.floor(sampleRate * durSec));
  let dataBytes = numSamples * 2;
  let buffer = new ArrayBuffer(44 + dataBytes);
  let view = new DataView(buffer);
  let writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataBytes, true);
  for (let i = 0; i < numSamples; i++) {
    let t = i / sampleRate;
    let env = Math.exp(-t * 22);
    // Soft sine only — triangle harmonics read as “loud” even at low gain.
    let s = Math.sin(2 * Math.PI * freq * t) * env * peak;
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s)) * 32767, true);
  }
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

function platformEnsurePluckHtmlEl(patch) {
  if (typeof document === "undefined" || !patch) {
    return null;
  }
  // Versioned key so older quiet blobs are dropped after volume changes.
  let key = "pluck:v6:" + patch.freq + ":" + patch.dur;
  if (platformAudioHtmlEls[key]) {
    return platformAudioHtmlEls[key];
  }
  let el = document.createElement("audio");
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.preload = "auto";
  // UI menu/share beeps — loud enough on Android + iPhone (quiz SFX are separate).
  el.src = platformBuildToneBlobUrl(patch.freq, Math.max(0.06, patch.dur || 0.1), 0.32);
  el.volume = platformAudioMuted ? 0 : 1;
  el.style.cssText =
    "position:fixed;width:0;height:0;opacity:0;pointer-events:none;";
  document.body.appendChild(el);
  try {
    el.load();
  } catch (e) {
    // ignore
  }
  platformAudioHtmlEls[key] = el;
  return el;
}

function platformPlayPluckHtml(patch) {
  if (platformAudioMuted) {
    return false;
  }
  let el = platformEnsurePluckHtmlEl(patch);
  if (!el) {
    return false;
  }
  platformAudioApplyPlaybackSession();
  try {
    // Volume 1 on both platforms — sample is already leveled. Android used to
    // multiply a low .volume on top and sounded much quieter than iPhone.
    el.muted = false;
    el.volume = 1;
    try {
      if (el.ended || el.currentTime > 0.02) {
        el.currentTime = 0;
      }
    } catch (e) {
      // ignore
    }
    let playResult = el.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(() => {});
    }
    platformAudioUnlocked = true;
    return true;
  } catch (e) {
    return false;
  }
}

function platformWarmUiPluckHtml() {
  ["uiOpen", "uiClose", "share", "progress"].forEach((name) => {
    let patch = PLATFORM_SFX[name];
    if (patch && patch.kind === "pluck") {
      platformEnsurePluckHtmlEl(patch);
    }
  });
}

function platformPlaySelectHtml() {
  // Same hot path as other samples — keep a dedicated entry for the intro tap.
  return platformPlayHtmlSample("select", 0.7);
}

function platformPlaySelectWebAudio() {
  let ctx = platformEnsureAudio();
  let buf = platformAudioBuffers.select;
  if (!ctx || !buf) {
    return false;
  }
  try {
    let src = ctx.createBufferSource();
    src.buffer = buf;
    let g = ctx.createGain();
    // Bypass the quiet master bus so intro select matches HTML volume.
    g.gain.value = 0.72;
    src.connect(g);
    g.connect(ctx.destination);
    src.start(0);
    platformAudioUnlocked = true;
    platformIntroSelectSoundPlayed = true;
    return true;
  } catch (e) {
    return false;
  }
}

function platformAudioUnlockWebOnly() {
  // Unlock Web Audio without kicking HTML silent media (competing HTML
  // play() calls abort the select clip on Android Chrome).
  platformAudioApplyPlaybackSession();
  let ctx = platformEnsureAudio();
  if (!ctx) {
    return null;
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  try {
    let buf = ctx.createBuffer(1, 1, ctx.sampleRate || 44100);
    let src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    platformAudioUnlocked = true;
  } catch (e) {
    // ignore
  }
  return ctx;
}

function platformFlushPendingIntroSelectSound() {
  if (!platformPendingIntroSelectSound || platformIntroSelectSoundPlayed) {
    return;
  }
  platformAudioApplyPlaybackSession();
  let el = platformEnsureHtmlSampleEl("select");
  if (platformAudioMuted || !el) {
    platformPendingIntroSelectSound = false;
    return;
  }
  try {
    el.muted = false;
    el.volume = 0.7;
    // Do not pause/seek before the first successful play on Android.
    let playResult = el.play();
    if (playResult && typeof playResult.then === "function") {
      playResult
        .then(() => {
          platformIntroSelectSoundPlayed = true;
          platformPendingIntroSelectSound = false;
          platformAudioUnlocked = true;
        })
        .catch(() => {
          // Keep pending so the following click can retry.
        });
    } else {
      platformIntroSelectSoundPlayed = true;
      platformPendingIntroSelectSound = false;
    }
  } catch (e) {
    // keep pending for retry
  }
}

function platformPlayIntroSelectSound() {
  // Intro triangle tap must sound inside the same gesture that starts the zoom.
  platformAudioApplyPlaybackSession();
  platformIntroSelectSoundPlayed = false;
  if (!platformIsAndroidDevice()) {
    platformPlaySelectHtml();
    return;
  }

  // Android Chrome blocks HTMLAudio.play() from pointerdown/touchstart.
  // Web Audio resume()+start() usually works in that gesture; keep HTML as
  // a pointerup/click backup if the buffer isn't ready yet.
  platformPendingIntroSelectSound = true;
  // Drop the backup if nothing plays within this tap (avoid a late random click).
  setTimeout(() => {
    if (!platformIntroSelectSoundPlayed) {
      platformPendingIntroSelectSound = false;
    }
  }, 1500);
  let ctx = platformAudioUnlockWebOnly();
  if (!ctx || !platformAudioBuffers.select) {
    platformLoadAudioSample("select");
    return;
  }

  let tryPlay = () => {
    if (platformIntroSelectSoundPlayed) {
      return;
    }
    if (platformPlaySelectWebAudio()) {
      platformPendingIntroSelectSound = false;
    }
  };

  if (ctx.state === "running") {
    tryPlay();
  } else {
    // Start while suspended (Chrome queues it) and again after resume.
    tryPlay();
    ctx.resume().then(tryPlay).catch(() => {});
  }
}

function platformPreloadAllHtmlSamples() {
  Object.keys(PLATFORM_SFX_SAMPLE_URLS).forEach((key) => {
    platformEnsureHtmlSampleEl(key);
  });
}

function platformEnsureSilentMediaUnlock() {
  if (platformAudioSilentEl || typeof document === "undefined") {
    return platformAudioSilentEl;
  }
  // Tiny silent WAV — helps older iOS treat this page as media playback.
  let el = document.createElement("audio");
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");
  el.preload = "auto";
  el.loop = true;
  el.volume = 0.001;
  el.src =
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
  el.style.cssText = "position:fixed;width:0;height:0;opacity:0;pointer-events:none;";
  document.body.appendChild(el);
  platformAudioSilentEl = el;
  return el;
}

function platformKickSilentMedia() {
  let el = platformEnsureSilentMediaUnlock();
  if (!el) {
    return;
  }
  try {
    let playResult = el.play();
    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(() => {});
    }
  } catch (e) {
    // ignore autoplay rejection outside a gesture
  }
}

function platformEnsureAudio() {
  if (typeof window === "undefined") {
    return null;
  }
  let AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) {
    return null;
  }
  if (!platformAudioCtx) {
    platformAudioApplyPlaybackSession();
    platformAudioCtx = new AC();
    platformAudioMaster = platformAudioCtx.createGain();
    platformAudioMaster.gain.value = platformAudioMuted ? 0 : PLATFORM_AUDIO_MASTER_GAIN;
    platformAudioMaster.connect(platformAudioCtx.destination);
  }
  return platformAudioCtx;
}

function platformLoadAudioSample(name) {
  let ctx = platformEnsureAudio();
  if (!ctx || !PLATFORM_SFX_SAMPLE_URLS[name]) {
    return Promise.resolve(false);
  }
  if (platformAudioBuffers[name]) {
    return Promise.resolve(true);
  }
  if (platformAudioBufferPromises[name]) {
    return platformAudioBufferPromises[name];
  }

  platformAudioBufferPromises[name] = fetch(PLATFORM_SFX_SAMPLE_URLS[name])
    .then((res) => {
      if (!res.ok) {
        throw new Error("sfx fetch failed: " + name);
      }
      return res.arrayBuffer();
    })
    .then((ab) => ctx.decodeAudioData(ab.slice(0)))
    .then((buf) => {
      platformAudioBuffers[name] = buf;
      return true;
    })
    .catch(() => {
      platformAudioBufferPromises[name] = null;
      return false;
    });

  return platformAudioBufferPromises[name];
}

function platformLoadAudioSamples() {
  // Warm all samples in the background; individual plays wait only on their own file.
  return Promise.all(
    Object.keys(PLATFORM_SFX_SAMPLE_URLS).map((key) => platformLoadAudioSample(key))
  ).then(() => true);
}

function platformStopActiveSfx() {
  for (let i = 0; i < platformAudioActiveSources.length; i++) {
    try {
      platformAudioActiveSources[i].stop();
    } catch (e) {
      // already stopped
    }
  }
  platformAudioActiveSources = [];
}

function platformPlaySample(name, gain) {
  let ctx = platformEnsureAudio();
  let buf = platformAudioBuffers[name];
  if (!ctx || !buf || !platformAudioMaster) {
    return false;
  }
  let src = ctx.createBufferSource();
  src.buffer = buf;
  let g = ctx.createGain();
  // Complete bypasses the quiet master bus so the finale can hit hard.
  let peak = Math.max(0.0001, gain == null ? 0.6 : gain);
  let dest = platformAudioMaster;
  if (name === "complete") {
    dest = ctx.destination;
    peak = Math.max(peak, 1.35);
  }
  g.gain.value = peak;
  src.connect(g);
  g.connect(dest);
  platformAudioActiveSources.push(src);
  src.onended = () => {
    platformAudioActiveSources = platformAudioActiveSources.filter((s) => s !== src);
  };
  src.start(ctx.currentTime + 0.01);
  return true;
}

function platformAudioUnlockSync() {
  // Must run inside the user-gesture call stack (triangle tap / touch).
  platformAudioApplyPlaybackSession();
  platformKickSilentMedia();
  let ctx = platformEnsureAudio();
  if (!ctx) {
    return;
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  // Tiny silent buffer started in-gesture unlocks Web Audio for later SFX.
  try {
    let buf = ctx.createBuffer(1, 1, ctx.sampleRate || 44100);
    let src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    platformAudioUnlocked = true;
  } catch (e) {
    // ignore
  }
}

function platformAudioUnlock() {
  platformAudioUnlockSync();
  let ctx = platformEnsureAudio();
  if (!ctx) {
    return Promise.resolve(false);
  }
  let ready =
    ctx.state === "suspended"
      ? ctx.resume().then(() => true).catch(() => false)
      : Promise.resolve(true);
  return ready.then((ok) => {
    if (ok) {
      platformAudioUnlocked = true;
      platformAudioApplyPlaybackSession();
    }
    return ok;
  });
}

function platformScheduleAudioWarmup(delayMs = 500) {
  if (typeof window === "undefined") {
    return;
  }
  setTimeout(() => {
    platformWarmUiPluckHtml();
    platformAudioUnlock().then(() => {
      platformLoadAudioSample("select");
      platformLoadAudioSamples();
    });
  }, delayMs);
}

function platformBindAudioGestureUnlock() {
  if (platformAudioGestureBound || typeof window === "undefined") {
    return;
  }
  platformAudioGestureBound = true;
  let kick = () => {
    // Avoid creating AudioContext during intro zoom — that hitchs iOS hard.
    if (
      platformMode === "intro" ||
      platformMode === "splash" ||
      platformIntroTransitionActive
    ) {
      // Android: skip silent HTML kick here — pointerdown play() is blocked
      // and a failed/queued play can abort the real select sound.
      if (!platformIsAndroidDevice()) {
        platformKickSilentMedia();
      }
      return;
    }
    platformAudioUnlockSync();
  };
  window.addEventListener("touchstart", kick, { capture: true, passive: true });
  window.addEventListener("pointerdown", kick, { capture: true });
}

function platformAudioVoiceAt(freq, start, dur, gain, opts = {}) {
  let ctx = platformEnsureAudio();
  if (!ctx || !platformAudioMaster) {
    return;
  }
  let type = opts.type || "triangle";
  let bright = opts.bright == null ? 0.22 : opts.bright;
  let slideTo = opts.slideTo || 0;
  let attack = opts.attack == null ? 0.012 : opts.attack;
  let peak = Math.max(0.0001, gain);

  let filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(Math.min(4200, freq * 4.5), start);
  filter.Q.setValueAtTime(0.7, start);

  let g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + Math.max(0.006, attack));
  g.gain.exponentialRampToValueAtTime(peak * 0.55, start + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  let osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo > 0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), start + dur);
  }

  let harm = ctx.createOscillator();
  harm.type = "sine";
  harm.frequency.setValueAtTime(freq * 2.01, start);
  if (slideTo > 0) {
    harm.frequency.exponentialRampToValueAtTime(Math.max(80, slideTo * 2.01), start + dur);
  }
  let harmG = ctx.createGain();
  harmG.gain.setValueAtTime(peak * bright, start);

  osc.connect(filter);
  harm.connect(harmG);
  harmG.connect(filter);
  filter.connect(g);
  g.connect(platformAudioMaster);

  osc.start(start);
  harm.start(start);
  osc.stop(start + dur + 0.03);
  harm.stop(start + dur + 0.03);
}

function platformAudioNoiseBurst(start, dur, gain, opts = {}) {
  let ctx = platformEnsureAudio();
  if (!ctx || !platformAudioMaster) {
    return;
  }
  let len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  let buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  let data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  let src = ctx.createBufferSource();
  src.buffer = buffer;
  let filter = ctx.createBiquadFilter();
  filter.type = opts.highpass ? "highpass" : "bandpass";
  filter.frequency.setValueAtTime(opts.freq || 1800, start);
  filter.Q.setValueAtTime(opts.q || 0.8, start);
  let g = ctx.createGain();
  let peak = Math.max(0.0001, gain);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(platformAudioMaster);
  src.start(start);
  src.stop(start + dur + 0.02);
}

function platformPlaySelectSfx(t0) {
  // Soft airy whoosh into the animal — not a musical pluck.
  platformAudioVoiceAt(620, t0, 0.2, 0.04, {
    type: "sine",
    bright: 0.05,
    slideTo: 980,
    attack: 0.02
  });
  platformAudioNoiseBurst(t0, 0.14, 0.05, { freq: 1600, q: 0.55, highpass: true });
}

function platformPlayCorrectSfx(t0) {
  // Fallback if sample not loaded yet — same ta-da family as success.wav.
  platformAudioVoiceAt(784.0, t0, 0.12, 0.1, {
    type: "triangle",
    bright: 0.18,
    attack: 0.006
  });
  let da = t0 + 0.13;
  platformAudioVoiceAt(523.25, da, 0.42, 0.07, { type: "sine", bright: 0.1, attack: 0.01 });
  platformAudioVoiceAt(659.25, da, 0.45, 0.095, {
    type: "triangle",
    bright: 0.22,
    attack: 0.008
  });
  platformAudioVoiceAt(1046.5, da, 0.48, 0.08, { type: "sine", bright: 0.3, attack: 0.008 });
}

function platformPlayWrongSfx(t0) {
  // Fallback if sample not loaded yet — descending drop in fail.mp3's register.
  let notes = [880.0, 783.99, 698.46, 587.33, 493.88, 415.3];
  for (let i = 0; i < notes.length; i++) {
    let t = t0 + i * 0.08;
    let next = notes[Math.min(i + 1, notes.length - 1)] * 0.94;
    platformAudioVoiceAt(notes[i], t, 0.3, 0.1 - i * 0.008, {
      type: "triangle",
      bright: 0.16,
      slideTo: next,
      attack: 0.009
    });
  }
}

function platformPlaySfx(name) {
  if (platformAudioMuted) {
    return;
  }
  let patch = PLATFORM_SFX[name];
  if (!patch) {
    return;
  }

  // Unlock Web Audio in-gesture for any later/delayed playback.
  platformAudioUnlockSync();

  // Sample SFX: HTMLAudio play() on the primed element (no clone — iOS lag).
  if (patch.kind === "sample") {
    let vol;
    if (patch.sample === "complete") {
      vol = 1;
    } else if (patch.sample === "select") {
      vol = 0.7;
    } else if (
      patch.sample === "correct" ||
      patch.sample === "correct2" ||
      patch.sample === "wrong"
    ) {
      // Answer cues only — keep a bit under the old level, independent of UI beeps.
      vol = Math.max(
        0.05,
        Math.min(1, (patch.gain || 0.6) * 0.9 * PLATFORM_SFX_OTHER_VOLUME_SCALE)
      );
    } else {
      vol = Math.max(
        0.05,
        Math.min(1, (patch.gain || 0.6) * 0.9 * PLATFORM_SFX_OTHER_VOLUME_SCALE)
      );
    }
    // Ensure element exists before play (preload may not have finished yet).
    platformEnsureHtmlSampleEl(patch.sample);
    if (patch.sample === "complete") {
      platformStopActiveSfx();
      Object.keys(platformAudioHtmlEls).forEach((key) => {
        if (key === "complete" || String(key).indexOf("pluck:") === 0) {
          return;
        }
        try {
          platformAudioHtmlEls[key].pause();
        } catch (e) {
          // ignore
        }
      });
    }
    if (platformPlayHtmlSample(patch.sample, vol)) {
      // Warm remaining buffers off the critical path.
      platformScheduleAudioWarmup(250);
      return;
    }
  }

  // UI plucks: HTMLAudio first; Web Audio fallback if HTML play fails.
  if (patch.kind === "pluck") {
    if (platformPlayPluckHtml(patch)) {
      return;
    }
  }

  let run = () => {
    let ctx = platformEnsureAudio();
    if (!ctx || !platformAudioMaster) {
      return;
    }
    let startPlay = () => {
      platformAudioApplyPlaybackSession();
      let t0 = ctx.currentTime + 0.01;
      if (patch.kind === "sample") {
        if (patch.sample === "complete") {
          platformStopActiveSfx();
        }
        if (!platformPlaySample(patch.sample, patch.gain)) {
          if (patch.sample === "correct") {
            platformPlayCorrectSfx(t0);
          } else if (patch.sample === "wrong") {
            platformPlayWrongSfx(t0);
          } else if (patch.sample === "select") {
            platformPlaySelectSfx(t0);
          }
        }
        return;
      }
      if (patch.kind === "select") {
        platformPlaySelectSfx(t0);
        return;
      }
      if (patch.kind === "correct") {
        platformPlayCorrectSfx(t0);
        return;
      }
      if (patch.kind === "wrong") {
        platformPlayWrongSfx(t0);
        return;
      }
      if (patch.kind === "pluck") {
        platformAudioVoiceAt(patch.freq, t0, patch.dur, patch.gain, {
          type: "triangle",
          bright: 0.2,
          attack: 0.008
        });
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(startPlay).catch(() => {});
      return;
    }
    startPlay();
  };

  let sampleName = patch.kind === "sample" ? patch.sample : null;

  platformAudioUnlock()
    .then((ok) => {
      if (ok === false) {
        return false;
      }
      if (sampleName) {
        return platformLoadAudioSample(sampleName);
      }
      return true;
    })
    .then((ok) => {
      if (ok !== false) {
        run();
      }
    });
}

function platformPlayUiOpenSfx() {
  platformPlaySfx("uiOpen");
}

function platformPlayUiCloseSfx() {
  if (platformAudioSuppressUiClose > 0) {
    return;
  }
  platformPlaySfx("uiClose");
}

function platformWithSuppressedUiClose(fn) {
  platformAudioSuppressUiClose++;
  try {
    fn();
  } finally {
    platformAudioSuppressUiClose--;
  }
}

function platformNotifyFinalReveal(p) {
  if (!p || p.audioFinalRevealPlayed) {
    return;
  }
  p.audioFinalRevealPlayed = true;
  // Default +300ms; toad plays as soon as assembly counts as done.
  let delayMs = p.id === "toad" ? 0 : 300;
  let playComplete = () => {
    // Prefer full-volume HTML first. Web Audio through the master bus was
    // making great-success much quieter than the other sample SFX.
    platformAudioApplyPlaybackSession();
    platformKickSilentMedia();
    if (platformPlayHtmlSample("complete", 1)) {
      return;
    }
    platformAudioUnlockSync();
    platformAudioUnlock()
      .then((ok) => (ok === false ? false : platformLoadAudioSample("complete")))
      .then((ok) => {
        if (ok === false) {
          return;
        }
        platformPlaySample("complete", 1.35);
      });
  };
  if (delayMs <= 0) {
    if (!platformPlayHtmlSample("complete", 1)) {
      playComplete();
    }
    return;
  }
  platformAudioUnlockSync();
  platformEnsureHtmlSampleEl("complete");
  platformLoadAudioSample("complete");
  setTimeout(playComplete, delayMs);
}

// --- p5 lifecycle ---
// setup / draw / mouse / touch / resize / Escape routing.

function setup() {
  let cnv = createCanvas(platformW, platformH);
  // Density must be set after createCanvas so Android Chrome gets a true HiDPI buffer.
  platformApplyPixelDensity();
  let mainEl = document.querySelector("main");

  if (mainEl) {
    cnv.parent(mainEl);
  }

  platformCanvasReady = true;
  platformAudioMuted = false;
  platformAudioApplyPlaybackSession();
  platformEnsureSilentMediaUnlock();
  platformPreloadAllHtmlSamples();
  // Android first-triangle tap uses Web Audio; decode select during splash.
  if (platformIsAndroidDevice()) {
    platformEnsureAudio();
    platformLoadAudioSample("select");
  }
  platformBindAudioGestureUnlock();
  platformBindViewportListeners();
  platformBindIntroCanvasPointer();
  platformApplyViewportLayout();
  platformApplyStartupQuery();

  // Start splash as soon as the canvas exists, then load game art in parallel.
  if (platformMode === "splash") {
    platformAdoptOrStartSplash();
    platformLoadAllGameAssets();
  } else {
    platformLoadAllGameAssets();
    platformProcessLineArtImages();
  }
}

function draw() {
  if (platformMode === "splash") {
    platformDrawSplash();
    return;
  }

  if (platformMode === "intro") {
    platformDrawIntro();
    if (platformMode !== "intro" && platformMode !== "loading") {
      platformDrawPosterHandoffFrame();
    }
    return;
  }

  if (platformMode === "loading") {
    platformDrawLoading();
    return;
  }

  platformEnsureAnimalStarted();
  platformInvokeAnimal("draw");
  platformDrawPosterFadeOverlay();
  if (platformShareOpen) {
    platformUpdateShareDragMotion();
  }
  if (!platformAnimalMenuOpen && !platformShareOpen) {
    platformHideMenuOverlayLayers();
  }
  if (platformShareOpen) {
    platformDrawShareOverlay();
    platformHideFinalDockBleed();
  } else if (platformAnimalMenuOpen) {
    platformDrawAnimalMenuOverlay();
  } else if (platformIsCurrentPosterFinal()) {
    let p = posterRegistry[platformMode];
    if (p) {
      let alpha = posterGetFinalAlpha(p);
      if (alpha > 0) {
        platformDrawFinalActionBar(p, alpha);
      } else {
        platformHideFinalDockBleed();
      }
    }
  } else {
    platformHideFinalDockBleed();
  }
}

function mousePressed(event) {
  // iOS synthesizes mouse events after touch; audio unlock/play only counts on touchstart.
  if (platformIgnoreNextMousePress) {
    platformIgnoreNextMousePress = false;
    return;
  }
  if (platformMode === "intro" || platformCanAcceptIntroPressFromSplash()) {
    platformTryIntroPressFromEvent(event);
    return;
  }
  if (platformMode === "splash") {
    return;
  }
  platformAudioUnlockSync();
  platformAudioUnlock();
  platformScheduleAudioWarmup(0);

  if (platformMode === "loading") {
    return;
  }

  if (platformShareOpen) {
    platformHandleSharePointerDown(mouseX, mouseY);
    return;
  }

  if (platformAnimalMenuOpen) {
    platformHandleAnimalMenuPress();
    return;
  }

  if (platformHandlePosterBackPress()) {
    return;
  }

  if (platformIsCurrentPosterFinal()) {
    platformHandleFinalActionPress();
    return;
  }

  platformInvokeAnimal("mousePressed");
}

function platformEventToCanvasXY(event) {
  let clientX = null;
  let clientY = null;
  if (event) {
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else if (typeof event.clientX === "number") {
      clientX = event.clientX;
      clientY = event.clientY;
    }
  }
  let cnv = typeof document !== "undefined" ? document.querySelector("canvas") : null;
  if (cnv && clientX != null && clientY != null) {
    let rect = cnv.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) {
      return {
        x: ((clientX - rect.left) / rect.width) * platformW,
        y: ((clientY - rect.top) / rect.height) * platformH
      };
    }
  }
  if (typeof touches !== "undefined" && touches.length > 0) {
    return { x: touches[0].x, y: touches[0].y };
  }
  return { x: mouseX, y: mouseY };
}

function platformTryIntroPressFromEvent(event) {
  if (platformIntroTransitionActive) {
    return false;
  }
  if (!(platformMode === "intro" || platformCanAcceptIntroPressFromSplash())) {
    return false;
  }
  platformFinishSplashForIntroIfNeeded();
  let pt = platformEventToCanvasXY(event);
  return platformHandleIntroPress(pt.x, pt.y);
}

function platformBindIntroCanvasPointer() {
  if (typeof document === "undefined") {
    return;
  }
  let cnv = document.querySelector("canvas");
  if (!cnv || cnv.dataset.platformIntroPointerBound === "1") {
    return;
  }
  cnv.dataset.platformIntroPointerBound = "1";

  let onDown = (event) => {
    if (!(platformMode === "intro" || platformCanAcceptIntroPressFromSplash())) {
      return;
    }
    if (platformIntroTransitionActive) {
      return;
    }
    // Ignore secondary mouse buttons.
    if (typeof event.button === "number" && event.button !== 0) {
      return;
    }
    let hit = platformTryIntroPressFromEvent(event);
    if (hit) {
      // Stop p5's follow-up touchStarted + synthetic mousePressed from
      // double-firing or eating the success as a "miss".
      platformIgnoreNextMousePress = true;
      platformIgnoreNextTouchStarted = true;
      // On Android, do NOT preventDefault — that can suppress the click
      // activation event needed for the HTMLAudio select fallback.
      if (
        !platformIsAndroidDevice() &&
        typeof event.preventDefault === "function"
      ) {
        event.preventDefault();
      }
    }
  };

  let onUp = () => {
    platformFlushPendingIntroSelectSound();
  };

  cnv.addEventListener("pointerdown", onDown, { passive: false });
  cnv.addEventListener("pointerup", onUp, { passive: true });
  cnv.addEventListener("click", onUp, { passive: true });
  // Window backup: canvas can miss up/click during the zoom handoff.
  if (typeof window !== "undefined") {
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("click", onUp, { passive: true });
  }
  // Older WebKit paths without PointerEvent still get a native touch sample.
  cnv.addEventListener(
    "touchstart",
    (event) => {
      if (typeof window !== "undefined" && window.PointerEvent) {
        return;
      }
      onDown(event);
    },
    { passive: false }
  );
  cnv.addEventListener(
    "touchend",
    (event) => {
      if (typeof window !== "undefined" && window.PointerEvent) {
        return;
      }
      onUp(event);
    },
    { passive: true }
  );
}

function touchStarted(event) {
  if (platformIgnoreNextTouchStarted) {
    platformIgnoreNextTouchStarted = false;
    return false;
  }

  // Menu is visible during splash fade-in; accept that tap and finish splash.
  if (platformMode === "intro" || platformCanAcceptIntroPressFromSplash()) {
    let hit = platformTryIntroPressFromEvent(event);
    // Only suppress the synthetic mouse click when this touch actually selected
    // a triangle. Otherwise a miss (stale coords) used to eat the real click.
    if (hit) {
      platformIgnoreNextMousePress = true;
    }
    return false;
  }

  if (platformMode === "splash") {
    // Don't set ignore-next-mouse: this touch did not select anything, and
    // blocking the follow-up mouse click ate the first real triangle tap.
    return false;
  }

  platformIgnoreNextMousePress = true;

  platformAudioUnlockSync();
  platformAudioUnlock();
  platformScheduleAudioWarmup(0);

  if (platformMode === "loading") {
    return false;
  }

  if (platformShareOpen) {
    let pt = platformEventToCanvasXY(event);
    platformHandleSharePointerDown(pt.x, pt.y);
    return false;
  }

  if (platformAnimalMenuOpen) {
    platformHandleAnimalMenuPress();
    return false;
  }

  if (platformHandlePosterBackPress()) {
    return false;
  }

  if (platformIsCurrentPosterFinal()) {
    platformHandleFinalActionPress();
    return false;
  }

  return platformInvokeAnimal("touchStarted") ?? false;
}

function mouseDragged() {
  if (platformShareOpen && platformSharePointerDown) {
    platformHandleSharePointerMove(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (platformShareOpen && platformSharePointerDown) {
    platformHandleSharePointerUp(mouseX, mouseY);
  }
}

function touchMoved() {
  if (platformShareOpen && platformSharePointerDown) {
    platformHandleSharePointerMove(mouseX, mouseY);
    return false;
  }
  return false;
}

function touchEnded() {
  if (platformShareOpen && platformSharePointerDown) {
    platformHandleSharePointerUp(mouseX, mouseY);
    return false;
  }
  return false;
}

function windowResized() {
  platformApplyViewportLayout();

  if (platformMode !== "intro" && platformMode !== "loading") {
    platformInvokeAnimal("windowResized");
  }
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    if (platformAnimalMenuOpen) {
      platformCloseAnimalMenu();
      return;
    }
    if (platformShareOpen) {
      platformCloseShare();
      return;
    }
    platformReturnToIntro();
  }
}

// --- Final poster dock & liquid-glass UI ---
// Home / share / menu dock, glass buttons, final text layout.

function platformIsCurrentPosterFinal() {
  let p = posterRegistry[platformMode];
  return p && p.clickCount >= p.cfg.finalClickCount;
}

function platformGetFinalBodyLeading(cfg) {
  return cfg?.finalBody?.leading ?? POSTER_LAYOUT.finalBodyLeading;
}

function platformGetTripleIconCentersInBar(barX, barW, padX) {
  let slotW = (barW - padX * 2) / 3;
  return [
    barX + padX + slotW * 0.5,
    barX + padX + slotW * 1.5,
    barX + padX + slotW * 2.5
  ];
}

function platformGetShareSheetIconCenters() {
  let barW = POSTER_LAYOUT.shareSheetIconsBarW;
  let barX = (platformW - barW) / 2;
  return platformGetTripleIconCentersInBar(
    barX,
    barW,
    POSTER_LAYOUT.shareSheetIconsPadX
  );
}

function platformGetFinalActionBarLayout(p) {
  let dock = platformGetFinalActionDockLayout();
  let hit = POSTER_LAYOUT.shareIconTouchSize;
  let dipDepth = POSTER_LAYOUT.finalActionDockDipDepth;
  let cx = dock.x + dock.w / 2;
  let leftCx =
    dock.x +
    dock.w * POSTER_LAYOUT.finalActionHomeXRatio +
    POSTER_LAYOUT.finalActionHomeXNudge;
  let rightCx =
    dock.x +
    dock.w * POSTER_LAYOUT.finalActionShareXRatio +
    POSTER_LAYOUT.finalActionShareXNudge;
  let shapeDown = POSTER_LAYOUT.finalActionDockShapeDownNudge;
  let wingCy =
    dock.y +
    (dock.h + dipDepth) / 2 +
    POSTER_LAYOUT.finalActionWingIconNudgeY +
    POSTER_LAYOUT.finalActionDockContentNudgeY +
    POSTER_LAYOUT.finalActionWingIconUpNudge -
    shapeDown;
  let notchCy =
    dock.y +
    dipDepth * POSTER_LAYOUT.finalActionMenuNotchYRatio +
    POSTER_LAYOUT.finalActionDockContentNudgeY;

  function slotAt(x, y) {
    return { x: x - hit / 2, y: y - hit / 2, w: hit, h: hit };
  }

  return {
    bar: { x: dock.x, y: dock.y, w: dock.w, h: dock.h },
    home: slotAt(leftCx, wingCy),
    share: slotAt(rightCx, wingCy),
    menu: slotAt(cx, notchCy)
  };
}

function platformGetSafeAreaInsetBottomPx() {
  if (typeof document === "undefined") {
    return 0;
  }
  if (!platformSafeAreaProbe) {
    platformSafeAreaProbe = document.createElement("div");
    platformSafeAreaProbe.style.cssText =
      "position:fixed;left:0;bottom:0;visibility:hidden;pointer-events:none;height:0;padding-bottom:env(safe-area-inset-bottom, 0px)";
    document.body.appendChild(platformSafeAreaProbe);
  }
  return parseFloat(getComputedStyle(platformSafeAreaProbe).paddingBottom) || 0;
}

function platformGetViewportCanvasBottomY() {
  let layoutBottom = platformLayoutY(REF_H);
  if (typeof window === "undefined") {
    return layoutBottom;
  }
  let scale = platformScreenScale || 1;
  if (scale <= 0) {
    return layoutBottom;
  }
  let vp = platformGetViewportSize();
  return min(layoutBottom, vp.h / scale);
}

function platformEnsureFinalDockBleedEl() {
  if (platformFinalDockBleedEl) {
    return platformFinalDockBleedEl;
  }
  if (typeof document === "undefined") {
    return null;
  }
  platformFinalDockBleedEl = document.createElement("div");
  platformFinalDockBleedEl.id = "platform-final-dock-bleed";
  platformFinalDockBleedEl.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;pointer-events:none;background:#ffffff;opacity:0;z-index:4;display:none;";
  document.body.appendChild(platformFinalDockBleedEl);
  return platformFinalDockBleedEl;
}

function platformGetFinalDockBleedHeightPx() {
  if (typeof window === "undefined") {
    return 0;
  }
  if (window.visualViewport) {
    let vv = window.visualViewport;
    let vp = platformGetViewportSize();
    return max(0, window.innerHeight - (vv.offsetTop + vp.h));
  }
  return platformGetSafeAreaInsetBottomPx();
}

function platformUpdateFinalDockBleed(alpha, visible) {
  let el = platformEnsureFinalDockBleedEl();
  if (!el) {
    return;
  }
  if (!visible || alpha <= 0) {
    el.style.display = "none";
    el.style.opacity = "0";
    return;
  }
  let bleedH = platformGetFinalDockBleedHeightPx();
  if (bleedH <= 0.5) {
    el.style.display = "none";
    return;
  }
  el.style.display = "block";
  el.style.height = bleedH + "px";
  el.style.opacity = String(alpha / 255);
}

function platformHideFinalDockBleed() {
  platformUpdateFinalDockBleed(0, false);
}

function platformGetFinalActionDockLayout() {
  let dockH = POSTER_LAYOUT.finalActionDockH;
  let scale = max(platformScreenScale || 1, 0.001);
  let screenBleed = platformGetFinalDockBleedHeightPx() / scale;
  let shapeDown = POSTER_LAYOUT.finalActionDockShapeDownNudge;
  let bottomY = min(
    platformGetViewportCanvasBottomY() +
      POSTER_LAYOUT.finalActionDockDownNudge +
      screenBleed +
      shapeDown,
    platformH
  );
  return {
    x: 0,
    y: bottomY - dockH,
    w: platformW,
    h: dockH,
    bleedBottom: bottomY
  };
}

function platformFinalActionDockPath(ctx, x, y, w, h) {
  let cr = POSTER_LAYOUT.finalActionDockCornerR;
  let cx = x + w / 2;
  let dipHalfW = w * POSTER_LAYOUT.finalActionDockDipHalfWRatio;
  let dipDepth = POSTER_LAYOUT.finalActionDockDipDepth;
  let shoulder = dipHalfW * POSTER_LAYOUT.finalActionDockDipShoulder;

  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + cr);
  ctx.quadraticCurveTo(x, y, x + cr, y);
  ctx.lineTo(cx - dipHalfW, y);
  ctx.bezierCurveTo(
    cx - dipHalfW + shoulder, y,
    cx - shoulder, y + dipDepth,
    cx, y + dipDepth
  );
  ctx.bezierCurveTo(
    cx + shoulder, y + dipDepth,
    cx + dipHalfW - shoulder, y,
    cx + dipHalfW, y
  );
  ctx.lineTo(x + w - cr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + cr);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function platformFillLiquidGlassDockInterior(ctx, bx, by, bw, bh, hover, a) {
  let r = bh * 0.5;
  let edgeCx = bx + bw / 2;
  let edgeCy = by + bh / 2;

  let innerShadow = ctx.createLinearGradient(
    bx,
    by,
    bx + bw * 0.42,
    by + bh * 0.72
  );
  innerShadow.addColorStop(0, `rgba(158, 150, 140, ${(hover ? 0.15 : 0.12) * a})`);
  innerShadow.addColorStop(0.42, `rgba(210, 204, 196, ${(hover ? 0.07 : 0.05) * a})`);
  innerShadow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = innerShadow;
  ctx.fillRect(bx, by, bw, bh);

  let edgeShade = ctx.createRadialGradient(
    edgeCx - r * 0.08,
    edgeCy - r * 0.12,
    r * 0.2,
    edgeCx,
    edgeCy,
    max(bw, bh) * 0.52
  );
  edgeShade.addColorStop(0.7, "rgba(255, 255, 255, 0)");
  edgeShade.addColorStop(0.9, `rgba(148, 140, 130, ${(hover ? 0.075 : 0.058) * a})`);
  edgeShade.addColorStop(1, `rgba(132, 124, 114, ${(hover ? 0.115 : 0.09) * a})`);
  ctx.fillStyle = edgeShade;
  ctx.fillRect(bx, by, bw, bh);
}

function platformDrawFinalActionDockShapeShadow(dock, hover, a, gfx = null) {
  let ctx = platformGetDrawCtx(gfx);
  let bx = dock.x;
  let by = dock.y;
  let bw = dock.w;
  let bh = dock.h;

  ctx.save();
  ctx.filter = `blur(${ms(18)}px)`;
  platformFinalActionDockPath(ctx, bx, by - ms(6), bw, bh);
  ctx.fillStyle = `rgba(132, 124, 114, ${0.09 * a})`;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = `blur(${ms(9)}px)`;
  platformFinalActionDockPath(ctx, bx, by - ms(3), bw, bh);
  ctx.fillStyle = `rgba(132, 124, 114, ${(hover ? 0.15 : 0.12) * a})`;
  ctx.fill();
  ctx.restore();
}

function platformDrawFinalActionDock(dock, hover = false, alpha = 255, gfx = null) {
  let ctx = platformGetDrawCtx(gfx);
  let a = alpha / 255;
  let bx = dock.x;
  let by = dock.y;
  let bw = dock.w;
  let bh = dock.h;

  platformDrawFinalActionDockShapeShadow(dock, hover, a, gfx);

  ctx.save();
  platformFinalActionDockPath(ctx, bx, by, bw, bh);
  ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
  ctx.fill();
  ctx.restore();

  ctx.save();
  platformFinalActionDockPath(ctx, bx, by, bw, bh);
  ctx.clip();

  platformFillLiquidGlassDockInterior(ctx, bx, by, bw, bh, hover, a);

  let topSheen = ctx.createLinearGradient(bx, by, bx, by + bh * 0.52);
  topSheen.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.52 : 0.44) * a})`);
  topSheen.addColorStop(0.38, `rgba(255, 255, 255, ${0.1 * a})`);
  topSheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = topSheen;
  ctx.fillRect(bx, by, bw, bh);

  let bottomShade = ctx.createLinearGradient(bx, by + bh * 0.38, bx, by + bh);
  bottomShade.addColorStop(0, "rgba(255, 255, 255, 0)");
  bottomShade.addColorStop(0.65, `rgba(188, 182, 174, ${(hover ? 0.07 : 0.052) * a})`);
  bottomShade.addColorStop(1, `rgba(132, 124, 114, ${(hover ? 0.17 : 0.14) * a})`);
  ctx.fillStyle = bottomShade;
  ctx.fillRect(bx, by, bw, bh);
  ctx.restore();

  ctx.save();
  platformFinalActionDockPath(ctx, bx, by, bw, bh);
  let rim = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  rim.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.88 : 0.78) * a})`);
  rim.addColorStop(0.32, `rgba(244, 240, 234, ${0.18 * a})`);
  rim.addColorStop(0.68, `rgba(255, 255, 255, ${0.05 * a})`);
  rim.addColorStop(1, `rgba(148, 140, 130, ${(hover ? 0.28 : 0.24) * a})`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = ms(0.85);
  ctx.stroke();
  ctx.restore();

  platformDrawFinalActionDockUnderbleed(dock, alpha, gfx);
}

function platformDrawFinalActionDockUnderbleed(dock, alpha, gfx = null) {
  let extBottom = dock.bleedBottom;
  if (extBottom == null) {
    return;
  }
  let extTop = dock.y + dock.h;
  if (extBottom <= extTop + 0.5) {
    return;
  }

  let ctx = platformGetDrawCtx(gfx);
  let a = alpha / 255;
  ctx.save();
  ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
  ctx.fillRect(dock.x, extTop, dock.w, extBottom - extTop);
  ctx.restore();
}

function platformRoundRectPath(ctx, x, y, w, h, radius) {
  let r = min(radius, w / 2, h / 2);
  ctx.beginPath();
  if (r >= h / 2 - 0.01 && w > h) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -HALF_PI, HALF_PI);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + r, r, HALF_PI, -HALF_PI);
    ctx.closePath();
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function platformRoundRectTopPath(ctx, x, y, w, h, radius) {
  let r = min(radius, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function platformClipCircle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, max(0.5, radius), 0, Math.PI * 2);
  ctx.closePath();
}

const CHOICE_BUTTON_SCALE = 0.7;
const CHOICE_IMAGE_SCALE = 0.9025;

function platformApplyChoiceLayoutMetrics() {
  POSTER_LAYOUT.choiceBtnSize = ms(210) * CHOICE_BUTTON_SCALE;
  POSTER_LAYOUT.choiceW = POSTER_LAYOUT.choiceBtnSize;
  POSTER_LAYOUT.choiceBtnH = POSTER_LAYOUT.choiceBtnSize;
  POSTER_LAYOUT.choiceImageSize =
    ms(132) * CHOICE_BUTTON_SCALE * CHOICE_IMAGE_SCALE;
  POSTER_LAYOUT.choiceH =
    POSTER_LAYOUT.choiceBtnSize +
    POSTER_LAYOUT.choiceLabelGap +
    ms(50);
}

function platformFillLiquidGlassInterior(
  ctx,
  bx,
  by,
  bw,
  bh,
  cx,
  cy,
  r,
  hover,
  a,
  stretchX = 1
) {
  let innerShadow = ctx.createLinearGradient(
    cx - r * 0.75,
    cy - r * 0.75,
    cx + r * 0.5,
    cy + r * 0.5
  );
  innerShadow.addColorStop(0, `rgba(158, 150, 140, ${(hover ? 0.13 : 0.1) * a})`);
  innerShadow.addColorStop(0.3, `rgba(188, 182, 174, ${(hover ? 0.045 : 0.03) * a})`);
  innerShadow.addColorStop(0.55, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = innerShadow;
  ctx.fillRect(bx, by, bw, bh);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(stretchX, 1);
  let localW = bw / stretchX;

  let edgeShade = ctx.createRadialGradient(
    r * 0.15,
    r * 0.22,
    r * 0.45,
    0,
    0,
    r
  );
  edgeShade.addColorStop(0.72, "rgba(255, 255, 255, 0)");
  edgeShade.addColorStop(0.9, `rgba(148, 140, 130, ${(hover ? 0.07 : 0.05) * a})`);
  edgeShade.addColorStop(1, `rgba(132, 124, 114, ${(hover ? 0.11 : 0.08) * a})`);
  ctx.fillStyle = edgeShade;
  ctx.fillRect(-localW / 2 - 2, -bh / 2 - 2, localW + 4, bh + 4);
  ctx.restore();

  let spec = ctx.createRadialGradient(
    cx - r * 0.36,
    cy - r * 0.4,
    r * 0.03,
    cx - r * 0.1,
    cy - r * 0.1,
    r * 0.9
  );
  spec.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.5 : 0.38) * a})`);
  spec.addColorStop(0.32, `rgba(255, 255, 255, ${0.06 * a})`);
  spec.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = spec;
  ctx.fillRect(bx, by, bw, bh);
}

// Frosted liquid-glass circle for overlays sitting on a blurred/darkened backdrop.
function platformDrawMenuGlassCircle(
  baseSnap,
  cx,
  cy,
  r,
  hover = false,
  alpha = 255,
  gfx = null
) {
  let ctx = platformGetDrawCtx(gfx);
  let a = alpha / 255;
  // Reuse backdrop blur cache (same radius) — a second frost radius forced a
  // full extra blur bake on open and made iPhone sheet animation stutter.
  let frostBlur = PLATFORM_SHARE_BACKDROP_BLUR_PX;
  let frostAlpha = (hover ? 0.34 : 0.28) * a;
  let iosLite = platformIsIosDevice();

  if (!iosLite) {
    ctx.save();
    platformClipCircle(ctx, cx, cy, r);
    ctx.filter = `blur(${ms(22)}px)`;
    ctx.fillStyle = `rgba(20, 16, 12, ${(hover ? 0.22 : 0.18) * a})`;
    ctx.fill();
    ctx.filter = "none";
    ctx.restore();

    ctx.save();
    platformClipCircle(ctx, cx, cy, r);
    ctx.shadowColor = `rgba(20, 16, 12, ${(hover ? 0.42 : 0.34) * a})`;
    ctx.shadowBlur = ms(hover ? 28 : 22);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = ms(hover ? 9 : 7);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.001 * a})`;
    ctx.fill();
    ctx.restore();

    ctx.save();
    platformClipCircle(ctx, cx, cy, r - ms(1));
    ctx.shadowColor = `rgba(30, 26, 22, ${(hover ? 0.28 : 0.22) * a})`;
    ctx.shadowBlur = ms(hover ? 12 : 10);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = ms(hover ? 4 : 3);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.001 * a})`;
    ctx.fill();
    ctx.restore();
  } else {
    // Cheap soft drop shadow — WebKit filter/shadowBlur on many circles is laggy.
    ctx.save();
    platformClipCircle(ctx, cx + ms(0.5), cy + ms(3), r);
    ctx.fillStyle = `rgba(20, 16, 12, ${(hover ? 0.2 : 0.14) * a})`;
    ctx.fill();
    ctx.restore();
  }

  if (baseSnap && !iosLite) {
    let blurredFrost = platformGetBlurredSnap(baseSnap, frostBlur);
    ctx.save();
    platformClipCircle(ctx, cx, cy, r);
    ctx.clip();
    platformDrawBlurredSnapIntoRect(
      ctx,
      baseSnap,
      blurredFrost,
      0,
      0,
      platformW,
      platformH
    );
    ctx.fillStyle = `rgba(255, 255, 255, ${frostAlpha})`;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.restore();
  }

  ctx.save();
  platformClipCircle(ctx, cx, cy, r - 0.5);
  ctx.clip();

  ctx.fillStyle = `rgba(255, 255, 255, ${(hover ? 0.94 : 0.9) * a})`;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  platformFillLiquidGlassInterior(
    ctx,
    cx - r,
    cy - r,
    r * 2,
    r * 2,
    cx,
    cy,
    r,
    hover,
    a,
    1
  );

  let topInnerShadow = ctx.createLinearGradient(
    cx - r * 0.82,
    cy - r * 0.9,
    cx + r * 0.35,
    cy + r * 0.45
  );
  topInnerShadow.addColorStop(0, `rgba(120, 112, 102, ${(hover ? 0.3 : 0.24) * a})`);
  topInnerShadow.addColorStop(0.22, `rgba(148, 140, 130, ${(hover ? 0.16 : 0.12) * a})`);
  topInnerShadow.addColorStop(0.5, `rgba(188, 182, 174, ${(hover ? 0.05 : 0.03) * a})`);
  topInnerShadow.addColorStop(0.72, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = topInnerShadow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  let topArcShadow = ctx.createLinearGradient(cx, cy - r, cx, cy + r * 0.2);
  topArcShadow.addColorStop(0, `rgba(110, 102, 94, ${(hover ? 0.18 : 0.14) * a})`);
  topArcShadow.addColorStop(0.45, `rgba(158, 150, 140, ${(hover ? 0.06 : 0.04) * a})`);
  topArcShadow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = topArcShadow;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  let bottomDepth = ctx.createLinearGradient(cx, cy + r * 0.15, cx, cy + r);
  bottomDepth.addColorStop(0, "rgba(255, 255, 255, 0)");
  bottomDepth.addColorStop(0.55, `rgba(120, 112, 102, ${(hover ? 0.06 : 0.04) * a})`);
  bottomDepth.addColorStop(1, `rgba(90, 82, 74, ${(hover ? 0.14 : 0.1) * a})`);
  ctx.fillStyle = bottomDepth;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.save();
  platformClipCircle(ctx, cx, cy, r - ms(0.45));
  let rim = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.22, cy + r);
  rim.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.78 : 0.68) * a})`);
  rim.addColorStop(0.32, `rgba(244, 240, 234, ${0.1 * a})`);
  rim.addColorStop(0.68, `rgba(255, 255, 255, ${0.02 * a})`);
  rim.addColorStop(1, `rgba(148, 140, 130, ${(hover ? 0.18 : 0.14) * a})`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = ms(0.85);
  ctx.stroke();
  ctx.restore();
}

// Figma ref: Button - Liquid Glass - Symbol, 126×126 circle (ms(210) at 390w).
function platformDrawChoiceButton(bx, by, bw, bh, cornerR, hover = false, alpha = 255) {
  let ctx = drawingContext;
  let a = alpha / 255;
  let size = min(bw, bh);
  let cx = bx + size / 2 + (bw - size) / 2;
  let cy = by + size / 2 + (bh - size) / 2;
  let r = size / 2;

  ctx.save();
  platformClipCircle(ctx, cx, cy, r);
  if (platformIsAndroidDevice()) {
    // shadowBlur is expensive on Android Chromium while triangles are connecting.
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    ctx.fill();
    ctx.fillStyle = `rgba(132, 124, 114, ${(hover ? 0.08 : 0.05) * a})`;
    ctx.beginPath();
    ctx.arc(cx, cy + ms(2), r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.shadowColor = `rgba(132, 124, 114, ${(hover ? 0.11 : 0.08) * a})`;
    ctx.shadowBlur = ms(hover ? 22 : 18);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = ms(hover ? 4 : 3);
    ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  platformClipCircle(ctx, cx, cy, r - 0.5);
  ctx.clip();

  platformFillLiquidGlassInterior(ctx, bx, by, bw, bh, cx, cy, r, hover, a, 1);
  ctx.restore();

  ctx.save();
  platformClipCircle(ctx, cx, cy, r - ms(0.45));
  let rim = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.22, cy + r);
  rim.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.7 : 0.6) * a})`);
  rim.addColorStop(0.32, `rgba(244, 240, 234, ${0.1 * a})`);
  rim.addColorStop(0.68, `rgba(255, 255, 255, ${0.02 * a})`);
  rim.addColorStop(1, `rgba(148, 140, 130, ${(hover ? 0.16 : 0.12) * a})`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = ms(0.85);
  ctx.stroke();
  ctx.restore();
}

function platformFillLiquidGlassPillInterior(ctx, bx, by, bw, bh, hover, a) {
  let r = bh / 2;

  let innerShadow = ctx.createLinearGradient(
    bx,
    by,
    bx + bw * 0.42,
    by + bh * 0.72
  );
  innerShadow.addColorStop(0, `rgba(158, 150, 140, ${(hover ? 0.12 : 0.095) * a})`);
  innerShadow.addColorStop(0.42, `rgba(210, 204, 196, ${(hover ? 0.05 : 0.035) * a})`);
  innerShadow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = innerShadow;
  ctx.fillRect(bx, by, bw, bh);

  let edgeCx = bx + bw / 2;
  let edgeCy = by + bh / 2;
  let edgeShade = ctx.createRadialGradient(
    edgeCx - r * 0.08,
    edgeCy - r * 0.12,
    r * 0.2,
    edgeCx,
    edgeCy,
    max(bw, bh) * 0.52
  );
  edgeShade.addColorStop(0.7, "rgba(255, 255, 255, 0)");
  edgeShade.addColorStop(0.9, `rgba(148, 140, 130, ${(hover ? 0.055 : 0.042) * a})`);
  edgeShade.addColorStop(1, `rgba(132, 124, 114, ${(hover ? 0.085 : 0.065) * a})`);
  ctx.fillStyle = edgeShade;
  ctx.fillRect(bx, by, bw, bh);

  let topSheen = ctx.createLinearGradient(bx, by, bx, by + bh * 0.52);
  topSheen.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.48 : 0.4) * a})`);
  topSheen.addColorStop(0.38, `rgba(255, 255, 255, ${0.08 * a})`);
  topSheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = topSheen;
  ctx.fillRect(bx, by, bw, bh);

  let bottomShade = ctx.createLinearGradient(bx, by + bh * 0.42, bx, by + bh);
  bottomShade.addColorStop(0, "rgba(255, 255, 255, 0)");
  bottomShade.addColorStop(0.7, `rgba(188, 182, 174, ${(hover ? 0.052 : 0.038) * a})`);
  bottomShade.addColorStop(1, `rgba(132, 124, 114, ${(hover ? 0.13 : 0.1) * a})`);
  ctx.fillStyle = bottomShade;
  ctx.fillRect(bx, by, bw, bh);
}

function platformDrawLiquidGlassPillOuterShadows(ctx, bx, by, bw, bh, a) {
  let r = bh / 2;

  ctx.save();
  ctx.filter = `blur(${ms(7)}px)`;
  platformRoundRectPath(ctx, bx, by + ms(1.5), bw, bh, r);
  ctx.fillStyle = `rgba(132, 124, 114, ${0.065 * a})`;
  ctx.fill();
  ctx.restore();
}

function platformFillLiquidGlassPillLightDepth(ctx, bx, by, bw, bh, a) {
  let topInner = ctx.createLinearGradient(
    bx,
    by,
    bx + bw * 0.38,
    by + bh * 0.88
  );
  topInner.addColorStop(0, `rgba(120, 112, 102, ${0.18 * a})`);
  topInner.addColorStop(0.3, `rgba(148, 140, 130, ${0.08 * a})`);
  topInner.addColorStop(0.55, `rgba(188, 182, 174, ${0.025 * a})`);
  topInner.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = topInner;
  ctx.fillRect(bx, by, bw, bh);

  let bottomDepth = ctx.createLinearGradient(bx, by + bh * 0.38, bx, by + bh);
  bottomDepth.addColorStop(0, "rgba(255, 255, 255, 0)");
  bottomDepth.addColorStop(0.65, `rgba(120, 112, 102, ${0.045 * a})`);
  bottomDepth.addColorStop(1, `rgba(90, 82, 74, ${0.085 * a})`);
  ctx.fillStyle = bottomDepth;
  ctx.fillRect(bx, by, bw, bh);
}

function platformStrokeLiquidGlassPillRim(ctx, bx, by, bw, bh, hover, a) {
  let r = bh / 2;
  let rimInset = ms(0.45);

  ctx.save();
  platformRoundRectPath(
    ctx,
    bx + rimInset,
    by + rimInset,
    bw - rimInset * 2,
    bh - rimInset * 2,
    r - rimInset
  );
  let rim = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  rim.addColorStop(0, `rgba(255, 255, 255, ${(hover ? 0.82 : 0.72) * a})`);
  rim.addColorStop(0.32, `rgba(244, 240, 234, ${0.15 * a})`);
  rim.addColorStop(0.68, `rgba(255, 255, 255, ${0.04 * a})`);
  rim.addColorStop(1, `rgba(148, 140, 130, ${(hover ? 0.22 : 0.18) * a})`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = ms(0.85);
  ctx.stroke();
  ctx.restore();
}

function platformDrawLiquidGlassPillSurface(
  bx,
  by,
  bw,
  bh,
  baseR,
  baseG,
  baseB,
  baseAlpha,
  hover = false,
  glossAlpha = 1,
  depth = "standard"
) {
  let ctx = drawingContext;
  let a = glossAlpha;
  let r = bh / 2;
  let isLight = depth === "light";
  let shadowMul = isLight ? 1.12 : 1;

  if (isLight) {
    platformDrawLiquidGlassPillOuterShadows(ctx, bx, by, bw, bh, a);
  }

  ctx.save();
  platformRoundRectPath(ctx, bx, by, bw, bh, r);
  ctx.shadowColor = `rgba(132, 124, 114, ${(hover ? 0.14 : 0.12) * a * shadowMul})`;
  ctx.shadowBlur = ms(hover ? 24 : 20);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = ms(hover ? 5 : 4);
  ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${baseAlpha})`;
  ctx.fill();
  ctx.restore();

  ctx.save();
  platformRoundRectPath(ctx, bx + 0.5, by + 0.5, bw - 1, bh - 1, r - 0.5);
  ctx.clip();
  platformFillLiquidGlassPillInterior(ctx, bx, by, bw, bh, hover, a);
  if (isLight) {
    platformFillLiquidGlassPillLightDepth(ctx, bx, by, bw, bh, a);
  }
  ctx.restore();

  platformStrokeLiquidGlassPillRim(ctx, bx, by, bw, bh, hover, a);
}

function platformDrawFinalActionIcon(
  box,
  img,
  alpha,
  hover,
  iconNudgeY = 0,
  maxSize,
  brownTint = false,
  gfx = null
) {
  if (!img || img.width <= 0) {
    return;
  }

  let aspect = img.width / img.height;
  let drawW = aspect >= 1 ? maxSize : maxSize * aspect;
  let drawH = aspect >= 1 ? maxSize / aspect : maxSize;
  let cx = box.x + box.w / 2;
  let cy = box.y + box.h / 2 + iconNudgeY;

  if (gfx) {
    gfx.push();
    gfx.translate(cx, cy);
    gfx.scale(hover ? 1.05 : 1);
    gfx.imageMode(CENTER);
    if (brownTint) {
      gfx.tint(
        PLATFORM_TEXT_RGB[0],
        PLATFORM_TEXT_RGB[1],
        PLATFORM_TEXT_RGB[2],
        alpha
      );
    } else {
      gfx.tint(255, alpha);
    }
    gfx.drawingContext.imageSmoothingEnabled = true;
    gfx.drawingContext.imageSmoothingQuality = "high";
    gfx.image(img, 0, 0, drawW, drawH);
    gfx.noTint();
    gfx.pop();
    gfx.imageMode(CORNER);
    return;
  }

  push();
  translate(cx, cy);
  scale(hover ? 1.05 : 1);
  imageMode(CENTER);
  if (brownTint) {
    tint(PLATFORM_TEXT_RGB[0], PLATFORM_TEXT_RGB[1], PLATFORM_TEXT_RGB[2], alpha);
  } else {
    tint(255, alpha);
  }
  drawingContext.imageSmoothingEnabled = true;
  drawingContext.imageSmoothingQuality = "high";
  image(img, 0, 0, drawW, drawH);
  noTint();
  pop();
  imageMode(CORNER);
}

function platformDrawFinalActionIntroTriangle(
  box,
  animal,
  alpha,
  hover,
  iconNudgeY,
  size,
  iconNudgeX = 0,
  fillHex = PLATFORM_TEXT_COLOR,
  gfx = null
) {
  if (gfx) {
    gfx.push();
    gfx.translate(box.x + box.w / 2 + iconNudgeX, box.y + box.h / 2 + iconNudgeY);
    gfx.scale(hover ? 1.05 : 1);
    platformDrawMenuAnimalTriangle(animal, 0, 0, size, alpha, fillHex, gfx);
    gfx.pop();
    return;
  }

  push();
  translate(box.x + box.w / 2 + iconNudgeX, box.y + box.h / 2 + iconNudgeY);
  scale(hover ? 1.05 : 1);
  platformDrawMenuAnimalTriangle(animal, 0, 0, size, alpha, fillHex);
  pop();
}

function platformGetCurrentAnimalTriangleColor() {
  let animal = platformGetIntroAnimal(platformMode);
  return animal ? animal.color : PLATFORM_TEXT_COLOR;
}

function platformDrawFinalActionBar(p, alpha, gfx = null) {
  let layout = platformGetFinalActionBarLayout(p);
  let dock = platformGetFinalActionDockLayout();
  p.finalActionBoxes = layout;
  let iconNudgeY = POSTER_LAYOUT.finalActionIconNudgeY;
  let iconMax =
    POSTER_LAYOUT.finalActionBarRefH * POSTER_LAYOUT.finalActionIconScale;
  let hoverKey = null;

  for (let key of ["home", "share", "menu"]) {
    let box = layout[key];
    if (
      !p.touchDevice &&
      mouseX > box.x &&
      mouseX < box.x + box.w &&
      mouseY > box.y &&
      mouseY < box.y + box.h
    ) {
      hoverKey = key;
    }
  }

  platformDrawFinalActionDock(dock, hoverKey !== null, alpha, gfx);
  platformUpdateFinalDockBleed(alpha, true);

  let wingIconMax =
    iconMax * POSTER_LAYOUT.finalActionWingIconScale;

  for (let key of ["home", "share", "menu"]) {
    let box = layout[key];
    if (key === "home") {
      platformDrawFinalActionIcon(
        box,
        platformFinalHomeIcon,
        alpha,
        hoverKey === key,
        iconNudgeY,
        wingIconMax,
        false,
        gfx
      );
    } else if (key === "share") {
      platformDrawFinalActionIcon(
        box,
        platformFinalShareIcon,
        alpha,
        hoverKey === key,
        iconNudgeY,
        wingIconMax,
        false,
        gfx
      );
    } else {
      let eagle = platformGetIntroAnimal("eagle");
      if (eagle) {
        let menuFill = platformAnimalMenuOpen
          ? platformGetCurrentAnimalTriangleColor()
          : PLATFORM_TEXT_COLOR;
        platformDrawFinalActionIntroTriangle(
          box,
          eagle,
          alpha,
          hoverKey === key,
          POSTER_LAYOUT.finalActionMenuNotchNudgeY,
          iconMax * 0.847,
          POSTER_LAYOUT.finalActionMenuIconNudgeX,
          menuFill,
          gfx
        );
      }
    }
  }
}

function platformHandleFinalActionPress() {
  let p = posterRegistry[platformMode];
  if (!p || !p.finalActionBoxes) {
    return;
  }

  let boxes = p.finalActionBoxes;
  if (platformWasBoxClicked(boxes.home)) {
    platformPlayUiOpenSfx();
    platformReturnToIntro();
    return;
  }
  if (platformWasBoxClicked(boxes.share)) {
    platformOpenShare();
    return;
  }
  if (platformWasBoxClicked(boxes.menu)) {
    platformOpenAnimalMenu();
  }
}

function platformGetSharePreviewCaptureSpec() {
  let sheetH = floor(platformH * POSTER_LAYOUT.shareSheetHeightRatio);
  let previewH = floor(sheetH * POSTER_LAYOUT.sharePreviewHeightRatio);
  let pad = ms(20);
  let previewInset = ms(10);
  let previewW = platformW - pad * 2 - previewInset * 2;
  return {
    w: max(1, floor(previewW)),
    h: max(1, previewH)
  };
}

function platformBakeSharePreviewStill(p) {
  if (!p || !platformCanBakeSharePreviewStill(p)) {
    return null;
  }

  let id = p.id;
  let cacheKey = platformSharePreviewCacheKey(id);
  if (platformSharePreviewStillCache.has(cacheKey)) {
    return platformSharePreviewStillCache.get(cacheKey);
  }

  let spec = platformGetSharePreviewCaptureSpec();
  let bakeBox = { x: 0, y: 0, w: spec.w, h: spec.h };
  let saved = get(0, 0, spec.w, spec.h);

  push();
  noStroke();
  fill(255);
  rect(0, 0, spec.w, spec.h);

  let prevStill = platformSharePreviewStill;
  let prevFrame = platformShareFrozenFrame;
  let prevMotion = p.finalMotion;
  let savedTGroup = p.tGroup.slice();
  platformSharePreviewStill = true;
  platformShareFrozenFrame = PLATFORM_SHARE_PREVIEW_STILL_FRAME;
  p.finalMotion = 1;
  p.tGroup = [1, 1, 1, 1];

  posterDrawAnimalSharePreview(p, bakeBox);

  platformSharePreviewStill = prevStill;
  platformShareFrozenFrame = prevFrame;
  p.finalMotion = prevMotion;
  p.tGroup = savedTGroup;

  let img = get(0, 0, spec.w, spec.h);
  image(saved, 0, 0);
  pop();

  platformSharePreviewStillCache.set(cacheKey, img);
  return img;
}

function platformCanBakeSharePreviewStill(p) {
  if (!p || p.clickCount < p.cfg.finalClickCount) {
    return false;
  }
  if (p.cfg.isFullyAssembled) {
    return p.cfg.isFullyAssembled(p);
  }
  return (
    p.tGroup[0] > 0.96 &&
    p.tGroup[1] > 0.96 &&
    p.tGroup[2] > 0.96 &&
    p.tGroup[3] > 0.96
  );
}

function platformTryBakeSharePreviewStill(p) {
  if (!p || platformShareOpen) {
    return;
  }
  // Android: baking a full preview mid-assemble hitchs the connect animation.
  // Share open already bakes on demand.
  if (platformIsAndroidDevice()) {
    return;
  }
  if (!platformCanBakeSharePreviewStill(p)) {
    return;
  }
  let cacheKey = platformSharePreviewCacheKey(p.id);
  if (platformSharePreviewStillCache.has(cacheKey)) {
    return;
  }
  platformBakeSharePreviewStill(p);
}

// --- Share sheet & animal menu ---
// Overlay open/close, drag-to-dismiss, social share actions.

function platformOpenShare() {
  platformWithSuppressedUiClose(() => {
    platformCloseAnimalMenu();
  });
  platformResetShareDragState();
  let p = posterRegistry[platformMode];
  platformInvalidateBlurSnapCache();
  platformShareOpen = true;
  platformShareOpenTime = millis();
  platformShareCopiedUntil = 0;
  platformShareCopiedMessage = "";
  if (p) {
    platformBakeSharePreviewStill(p);
  }
  platformShareBoxes = p ? platformGetShareOverlayLayout(p) : null;
  platformPlayUiOpenSfx();
}

function platformCloseShare() {
  let wasOpen = platformShareOpen;
  platformShareOpen = false;
  platformShareCopiedUntil = 0;
  platformShareCopiedMessage = "";
  platformShareBoxes = null;
  platformSharePreviewStill = false;
  platformResetShareDragState();
  platformHideMenuOverlayLayers();
  platformInvalidateBlurSnapCache();
  if (wasOpen) {
    platformPlayUiCloseSfx();
  }
}

function platformResetShareDragState() {
  platformSharePointerDown = false;
  platformShareDragEligible = false;
  platformShareDragActive = false;
  platformShareDragOffsetY = 0;
  platformShareDragSnapStart = null;
  platformShareDragSnapFrom = 0;
  platformShareDragSnapTarget = 0;
  platformShareDragClosing = false;
}

function platformGetAnimalMenuEntries() {
  let entries = [];
  for (let i = 0; i < platformAnimals.length; i++) {
    let animal = platformAnimals[i];
    if (animal.id === platformMode || !posterRegistry[animal.id]) {
      continue;
    }
    entries.push({
      id: animal.id,
      animal
    });
  }
  return entries;
}

function platformGetAnimalMenuPopoverMotion() {
  if (!platformAnimalMenuOpen) {
    return { alpha: 0, offsetY: 0, scale: 1 };
  }
  let t = constrain(
    (millis() - platformAnimalMenuOpenTime) / PLATFORM_ANIMAL_MENU_FADE_MS,
    0,
    1
  );
  let e = platformEaseOutCubic(t);
  return {
    alpha: e,
    offsetY: lerp(ms(12), 0, e),
    scale: lerp(0.94, 1, e)
  };
}

function platformGetIntroAnimal(id) {
  for (let animal of platformAnimals) {
    if (animal.id === id) {
      return animal;
    }
  }
  return null;
}

function platformDrawMenuAnimalTriangle(
  animal,
  centerX,
  centerY,
  size,
  alpha = 255,
  fillHex = null,
  gfx = null
) {
  let pts = platformGetIntroTriangleRefPts(animal);
  let cx0 = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
  let cy0 = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
  let maxR = 0;
  for (let pt of pts) {
    maxR = max(maxR, dist(pt[0], pt[1], cx0, cy0));
  }
  let s = maxR > 0 ? size / maxR : 1;
  let triColor = color(fillHex || animal.color);
  triColor.setAlpha(alpha);
  let x1 = centerX + (pts[0][0] - cx0) * s;
  let y1 = centerY + (pts[0][1] - cy0) * s;
  let x2 = centerX + (pts[1][0] - cx0) * s;
  let y2 = centerY + (pts[1][1] - cy0) * s;
  let x3 = centerX + (pts[2][0] - cx0) * s;
  let y3 = centerY + (pts[2][1] - cy0) * s;

  if (gfx) {
    gfx.noStroke();
    gfx.fill(triColor);
    gfx.triangle(x1, y1, x2, y2, x3, y3);
    return;
  }

  noStroke();
  fill(triColor);
  triangle(x1, y1, x2, y2, x3, y3);
}

function platformGetAnimalMenuLayout(p) {
  let entries = platformGetAnimalMenuEntries();
  let actionBar = platformGetFinalActionBarLayout(p);
  let anchor = actionBar.menu;
  let anchorCx = anchor.x + anchor.w / 2;
  let anchorCy = anchor.y + anchor.h / 2;
  let btnSize = POSTER_LAYOUT.choiceBtnSize * POSTER_LAYOUT.animalMenuCircleScale;
  let gap = POSTER_LAYOUT.animalMenuCircleGap;
  let arcSpan = POSTER_LAYOUT.animalMenuArcSpan;
  let count = entries.length;
  let step = count > 1 ? arcSpan / (count - 1) : 0;
  let minRadius =
    count > 1 && step > 0
      ? (btnSize + gap) / (2 * sin(step / 2))
      : POSTER_LAYOUT.animalMenuArcRadiusMin;
  let radius = max(POSTER_LAYOUT.animalMenuArcRadiusMin, minRadius);
  let centerA = -PI / 2;
  let startA = centerA - arcSpan / 2;
  let endA = centerA + arcSpan / 2;

  let buttons = [];
  for (let i = 0; i < count; i++) {
    let t = count === 1 ? 0.5 : i / (count - 1);
    let a = lerp(startA, endA, t);
    let cx = anchorCx + cos(a) * radius;
    let cy = anchorCy + sin(a) * radius;
    buttons.push({
      id: entries[i].id,
      animal: entries[i].animal,
      x: cx - btnSize / 2,
      y: cy - btnSize / 2,
      w: btnSize,
      h: btnSize,
      cx,
      cy
    });
  }

  return { anchor, buttons };
}

function platformOpenAnimalMenu() {
  platformWithSuppressedUiClose(() => {
    platformCloseShare();
  });
  let p = posterRegistry[platformMode];
  platformInvalidateBlurSnapCache();
  platformAnimalMenuOpen = true;
  platformAnimalMenuOpenTime = millis();
  platformAnimalMenuBoxes = p ? platformGetAnimalMenuLayout(p) : null;
  platformPlayUiOpenSfx();
}

function platformCloseAnimalMenu() {
  let wasOpen = platformAnimalMenuOpen;
  platformAnimalMenuOpen = false;
  platformAnimalMenuBoxes = null;
  platformHideMenuOverlayLayers();
  platformInvalidateBlurSnapCache();
  if (wasOpen) {
    platformPlayUiCloseSfx();
  }
}

function platformSwitchToAnimal(animalId) {
  if (!animalId || !posterRegistry[animalId] || animalId === platformMode) {
    return;
  }
  platformWithSuppressedUiClose(() => {
    platformCloseAnimalMenu();
    platformCloseShare();
  });
  platformPlaySfx("select");
  platformEnterAnimal(animalId);
}

function platformDrawAnimalMenuOverlayUi(
  p,
  layout,
  finalAlpha,
  motion,
  shadeAlpha,
  baseSnap,
  gfx
) {
  if (baseSnap && shadeAlpha > 0) {
    platformDrawShareBackdrop(shadeAlpha, baseSnap);
  }

  let triSize = POSTER_LAYOUT.animalMenuTriSize;
  let staggerMs = POSTER_LAYOUT.animalMenuButtonStaggerMs;

  for (let i = 0; i < layout.buttons.length; i++) {
    let btn = layout.buttons[i];
    let btnY = btn.y + motion.offsetY;
    let btnCy = btn.cy + motion.offsetY;
    let hover =
      !p.touchDevice &&
      mouseX > btn.x &&
      mouseX < btn.x + btn.w &&
      mouseY > btnY &&
      mouseY < btnY + btn.h;

    let staggerT = constrain(
      (millis() - platformAnimalMenuOpenTime - i * staggerMs) /
        PLATFORM_ANIMAL_MENU_FADE_MS,
      0,
      1
    );
    let staggerE = platformEaseOutCubic(staggerT);
    let btnScale = lerp(0.86, 1, staggerE) * motion.scale;
    let btnAlpha = finalAlpha * staggerE;
    let drawR = (btn.w * btnScale) / 2;

    platformDrawMenuGlassCircle(
      baseSnap,
      btn.cx,
      btnCy,
      drawR,
      hover,
      btnAlpha,
      gfx
    );
    platformDrawMenuAnimalTriangle(
      btn.animal,
      btn.cx,
      btnCy,
      triSize * btnScale,
      btnAlpha,
      null,
      gfx
    );
  }

  platformDrawFinalActionBar(p, finalAlpha, gfx);
}

function platformDrawAnimalMenuOverlay() {
  let p = posterRegistry[platformMode];
  if (!p) {
    return;
  }

  let layout = platformGetAnimalMenuLayout(p);
  platformAnimalMenuBoxes = layout;
  let finalAlpha = posterGetFinalAlpha(p);
  let motion = platformGetAnimalMenuPopoverMotion();
  let shadeAlpha = motion.alpha * finalAlpha;
  let useLiveBackdrop = platformUseLiveDomMenuBackdrop();

  if (useLiveBackdrop) {
    platformSyncMenuBackdropEl(shadeAlpha);
    let gfx = platformEnsureMenuOverlayGfx();
    gfx.clear();
    platformShowMenuOverlayLayers();
    platformDrawAnimalMenuOverlayUi(
      p,
      layout,
      finalAlpha,
      motion,
      shadeAlpha,
      null,
      gfx
    );
  } else {
    platformHideMenuOverlayLayers();
    let baseSnap = platformGetLiveCanvasSnap();
    push();
    platformDrawAnimalMenuOverlayUi(
      p,
      layout,
      finalAlpha,
      motion,
      shadeAlpha,
      baseSnap,
      null
    );
    pop();
  }
}

function platformHandleAnimalMenuPress() {
  let p = posterRegistry[platformMode];
  let boxes = platformAnimalMenuBoxes;
  if (!boxes && p) {
    boxes = platformGetAnimalMenuLayout(p);
    platformAnimalMenuBoxes = boxes;
  }
  if (!boxes) {
    return;
  }

  let motion = platformGetAnimalMenuPopoverMotion();

  for (let i = 0; i < boxes.buttons.length; i++) {
    let btn = boxes.buttons[i];
    let btnBox = {
      x: btn.x,
      y: btn.y + motion.offsetY,
      w: btn.w,
      h: btn.h
    };
    if (platformWasBoxClicked(btnBox)) {
      platformSwitchToAnimal(btn.id);
      return;
    }
  }

  platformCloseAnimalMenu();
}

function platformGetSharePageUrl() {
  return PLATFORM_SHARE_PUBLIC_URL;
}

function platformGetShareAnimalPhrase(p) {
  let animalId = p?.id || platformMode;
  return PLATFORM_SHARE_ANIMAL_PHRASE[animalId] || "wildlife in Israel";
}

function platformGetShareMessage(p) {
  let phrase = platformGetShareAnimalPhrase(p);
  return (
    "I didn't realize my daily choices could affect " +
    phrase +
    ".\nTake the quiz and see yours 🌿✨"
  );
}

function platformGetSharePayload(p) {
  let message = platformGetShareMessage(p);
  let url = platformGetSharePageUrl();
  return { message, url, text: message + "\n" + url };
}

function platformOpenExternalUrl(url, sameTab = false) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    let link = document.createElement("a");
    link.href = url;
    if (!sameTab) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    window.location.href = url;
  }
}

function platformIsTouchLikeDevice() {
  return (
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );
}

function platformCopyShareText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  let field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();

  try {
    document.execCommand("copy");
  } catch (err) {
    // Clipboard unavailable in this environment.
  }

  document.body.removeChild(field);
}

function platformShareViaWhatsApp(p) {
  if (typeof window === "undefined") {
    return;
  }

  platformPlaySfx("share");
  let text = platformGetSharePayload(p).text;
  let encoded = encodeURIComponent(text);

  if (platformIsTouchLikeDevice()) {
    window.location.href = "whatsapp://send?text=" + encoded;
    return;
  }

  platformOpenExternalUrl("https://api.whatsapp.com/send?text=" + encoded);
}

function platformShowShareCopiedMessage(message, durationMs = 2400) {
  platformShareCopiedMessage = message;
  platformShareCopiedUntil = millis() + durationMs;
}

function platformGetShareImageCanvas(p) {
  let still = platformBakeSharePreviewStill(p);
  if (!still) {
    return null;
  }
  return still.canvas || still.elt || null;
}

function platformCanvasToImageFile(canvas, fileName) {
  if (!canvas || typeof canvas.toDataURL !== "function") {
    return null;
  }
  try {
    let dataUrl = canvas.toDataURL("image/png");
    let parts = dataUrl.split(",");
    if (parts.length < 2) {
      return null;
    }
    let mimeMatch = parts[0].match(/:(.*?);/);
    let mime = (mimeMatch && mimeMatch[1]) || "image/png";
    let binary = atob(parts[1]);
    let bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], fileName || "wildlife-poster.png", { type: mime });
  } catch (err) {
    return null;
  }
}

function platformGetShareImageFile(p) {
  let canvas = platformGetShareImageCanvas(p);
  let animalId = (p && p.id) || platformMode || "poster";
  return platformCanvasToImageFile(canvas, animalId + "-poster.png");
}

function platformDownloadShareImage(p) {
  let canvas = platformGetShareImageCanvas(p);
  if (!canvas || typeof document === "undefined") {
    return false;
  }
  try {
    let link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = ((p && p.id) || "wildlife") + "-poster.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  } catch (err) {
    return false;
  }
}

function platformShareViaInstagram(p) {
  if (typeof window === "undefined") {
    return;
  }

  platformPlaySfx("share");
  let payload = platformGetSharePayload(p);
  // Caption can't reliably be injected into Instagram from the web — copy it.
  platformCopyShareText(payload.text);

  let file = platformGetShareImageFile(p);
  let shareData = file ? { files: [file], title: "" } : null;

  // Best path: system share sheet with the animal image. User picks Instagram
  // (Stories / Feed / Messages). Caption is already on the clipboard.
  if (
    shareData &&
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare(shareData) &&
    typeof navigator.share === "function"
  ) {
    navigator
      .share(shareData)
      .then(() => {
        platformShowShareCopiedMessage(platformText.share.copiedOpeningInstagram);
      })
      .catch((err) => {
        if (err && err.name === "AbortError") {
          return;
        }
        platformShareInstagramFallback(p, payload);
      });
    return;
  }

  platformShareInstagramFallback(p, payload);
}

function platformShareInstagramFallback(p, payload) {
  platformCopyShareText(payload.text);
  platformDownloadShareImage(p);
  platformShowShareCopiedMessage(platformText.share.instagramFallback);

  if (typeof window === "undefined") {
    return;
  }

  // Open Instagram; user creates a post from the saved image and pastes caption.
  let opened = false;
  try {
    window.location.href = "instagram://app";
    opened = true;
  } catch (err) {
    opened = false;
  }
  if (!opened || !platformIsTouchLikeDevice()) {
    platformOpenExternalUrl("https://www.instagram.com/");
  }
}

function platformShareViaFacebook(p) {
  if (typeof window === "undefined") {
    return;
  }

  platformPlaySfx("share");
  let payload = platformGetSharePayload(p);
  // Facebook often strips prefilled "quote" text — clipboard is the reliable backup.
  platformCopyShareText(payload.text);
  platformShowShareCopiedMessage(platformText.share.copiedOpeningFacebook);

  let u = encodeURIComponent(payload.url);
  let q = encodeURIComponent(payload.message);
  let sharer =
    "https://www.facebook.com/sharer/sharer.php?u=" + u + "&quote=" + q;

  if (platformIsAndroidDevice()) {
    // Prefer the Facebook app via Android intent, fall back to the web sharer.
    window.location.href =
      "intent://www.facebook.com/sharer/sharer.php?u=" +
      u +
      "&quote=" +
      q +
      "#Intent;scheme=https;package=com.facebook.katana;S.browser_fallback_url=" +
      encodeURIComponent(sharer) +
      ";end";
    return;
  }

  if (platformIsTouchLikeDevice()) {
    // iPhone / mobile: https sharer usually hands off into the Facebook app.
    window.location.href = sharer;
    return;
  }

  platformOpenExternalUrl(sharer);
}

function platformGetShareSheetHeight() {
  return floor(platformH * POSTER_LAYOUT.shareSheetHeightRatio);
}

function platformGetShareSheetMotion() {
  if (!platformShareOpen) {
    return { alpha: 0, offsetY: 0 };
  }

  let sheetH = platformGetShareSheetHeight();
  let t = constrain(
    (millis() - platformShareOpenTime) / PLATFORM_SHARE_SLIDE_MS,
    0,
    1
  );
  let e = platformEaseOutCubic(t);
  let openOffsetY = lerp(sheetH, 0, e);
  let dragOffsetY = platformShareDragOffsetY;
  let dragFade =
    dragOffsetY > 0
      ? constrain(1 - dragOffsetY / (sheetH * 0.55), 0.25, 1)
      : 1;

  return {
    alpha: e * dragFade,
    offsetY: openOffsetY + dragOffsetY
  };
}

function platformUpdateShareDragMotion() {
  if (platformShareDragSnapStart === null) {
    return;
  }

  let duration = platformShareDragClosing
    ? PLATFORM_SHARE_SLIDE_MS
    : PLATFORM_SHARE_DRAG_SNAP_MS;
  let t = constrain((millis() - platformShareDragSnapStart) / duration, 0, 1);
  let eased = platformShareDragClosing ? pow(t, 3) : platformEaseOutCubic(t);
  platformShareDragOffsetY = lerp(
    platformShareDragSnapFrom,
    platformShareDragSnapTarget,
    eased
  );

  if (t >= 1) {
    platformShareDragOffsetY = platformShareDragSnapTarget;
    platformShareDragSnapStart = null;
    if (platformShareDragClosing) {
      platformCloseShare();
    }
    platformShareDragClosing = false;
  }
}

function platformGetShareDragDismissThreshold() {
  return max(ms(72), platformGetShareSheetHeight() * 0.18);
}

function platformEnsureShareOverlayBoxes() {
  let p = posterRegistry[platformMode];
  if (!p) {
    return null;
  }

  if (!platformShareBoxes) {
    platformShareBoxes = platformGetShareOverlayLayout(p);
  }

  return platformShareBoxes;
}

function platformHandleSharePointerDown(x, y) {
  if (!platformShareOpen) {
    return;
  }

  let boxes = platformEnsureShareOverlayBoxes();
  if (!boxes) {
    return;
  }

  platformSharePointerDown = true;
  platformSharePointerStartX = x;
  platformSharePointerStartY = y;
  platformShareDragSnapStart = null;
  platformShareDragClosing = false;

  let offsetY = platformGetShareSheetMotion().offsetY;
  let grabBox = platformShareBoxWithMotion(boxes.grab, offsetY);
  platformShareDragEligible = platformPointInBox(x, y, grabBox);
}

function platformHandleSharePointerMove(x, y) {
  if (!platformSharePointerDown || !platformShareDragEligible) {
    return;
  }

  let dy = y - platformSharePointerStartY;
  if (!platformShareDragActive && dy > ms(6)) {
    platformShareDragActive = true;
  }

  if (platformShareDragActive) {
    platformShareDragOffsetY = max(0, dy);
    platformShareDragSnapStart = null;
  }
}

function platformFinishShareDrag() {
  let sheetH = platformGetShareSheetHeight();
  let threshold = platformGetShareDragDismissThreshold();

  if (platformShareDragOffsetY >= threshold) {
    platformShareDragSnapFrom = platformShareDragOffsetY;
    platformShareDragSnapTarget = sheetH;
    platformShareDragClosing = true;
  } else {
    platformShareDragSnapFrom = platformShareDragOffsetY;
    platformShareDragSnapTarget = 0;
    platformShareDragClosing = false;
  }

  platformShareDragSnapStart = millis();
  platformShareDragActive = false;
  platformShareDragEligible = false;
}

function platformHandleSharePointerUp(x, y) {
  if (!platformSharePointerDown) {
    return;
  }

  if (platformShareDragActive) {
    platformFinishShareDrag();
    platformSharePointerDown = false;
    return;
  }

  let moved = dist(x, y, platformSharePointerStartX, platformSharePointerStartY);
  platformSharePointerDown = false;
  platformShareDragEligible = false;

  if (moved < ms(10)) {
    platformHandleShareTap();
  }
}

function platformShareBoxWithMotion(box, offsetY) {
  return {
    x: box.x,
    y: box.y + offsetY,
    w: box.w,
    h: box.h
  };
}

function platformIsSamsungInternet() {
  return (
    typeof navigator !== "undefined" &&
    /SamsungBrowser/i.test(navigator.userAgent)
  );
}

function platformGetShareSheetNudgeY() {
  let nudge = POSTER_LAYOUT.shareSheetNudgeY;
  if (!platformIsSamsungInternet()) {
    return nudge;
  }

  // Samsung Internet overlays a bottom toolbar that clips the sheet bleed.
  // Lift the share overlay only — poster layout stays unchanged.
  nudge -= ms(56);

  if (typeof window !== "undefined" && window.visualViewport) {
    let vv = window.visualViewport;
    let bottomChromePx = max(0, window.innerHeight - vv.offsetTop - vv.height);
    if (bottomChromePx > 0) {
      nudge -= bottomChromePx * (platformW / vv.width);
    }
  }

  return nudge;
}

function platformGetShareOverlayLayout(p) {
  let sheetH = platformGetShareSheetHeight();
  let sheetW = platformW;
  let sheetX = 0;
  let sheetY = platformH - sheetH + platformGetShareSheetNudgeY();
  let grabHitH = POSTER_LAYOUT.shareSheetGrabHitH;
  let pad = ms(20);
  let shareTouchSize = POSTER_LAYOUT.shareIconTouchSize;
  let iconHit = shareTouchSize;
  let titleSize = platformText.finalCta.size;
  let bodySize = ms(20);
  let bodyLeading = ms(22);
  let bodyMaxW = sheetW - pad * 2;
  let titleGap = ms(10);
  let titleNudgeY = POSTER_LAYOUT.shareTitleNudgeY;
  let bodyNudgeY = POSTER_LAYOUT.shareBodyNudgeY;
  let contentNudgeY = POSTER_LAYOUT.shareSheetContentNudgeY;
  let previewGap = ms(12);
  let previewInset = ms(10);

  if (p?.grungeFont) {
    textFont(p.grungeFont);
  }
  textSize(bodySize);
  let bodyLines = platformWrapTextLines(
    platformText.share.body,
    bodyMaxW,
    1
  );
  let bodyBlockH =
    bodyLines.length > 0 ? (bodyLines.length - 1) * bodyLeading + bodySize : 0;

  let textTop = sheetY + grabHitH + ms(8) + titleNudgeY + contentNudgeY;
  let headerBottom =
    textTop + titleSize + titleGap + bodyNudgeY + bodyBlockH;
  let previewY = headerBottom + previewGap + POSTER_LAYOUT.sharePreviewBoxNudgeY;
  let previewH = floor(sheetH * POSTER_LAYOUT.sharePreviewHeightRatio);
  let iconsGap = POSTER_LAYOUT.shareIconsGapBelowPreview;
  let previewBottom = previewY + previewH;
  let iconsRowY = previewBottom + iconsGap + iconHit / 2;
  let iconsY = iconsRowY;

  let previewW = sheetW - pad * 2 - previewInset * 2;
  let previewX = sheetX + pad + previewInset;
  let iconCenters = platformGetShareSheetIconCenters();

  function iconBox(cx) {
    return {
      x: cx - iconHit / 2,
      y: iconsY - iconHit / 2,
      w: iconHit,
      h: iconHit
    };
  }

  return {
    sheet: { x: sheetX, y: sheetY, w: sheetW, h: sheetH },
    grab: { x: sheetX, y: sheetY, w: sheetW, h: grabHitH },
    whatsapp: {
      ...iconBox(iconCenters[0]),
      accent: "#25D366",
      kind: "whatsapp",
      iconR: POSTER_LAYOUT.shareSheetIconR
    },
    instagram: {
      ...iconBox(iconCenters[1]),
      accent: "#C13584",
      kind: "instagram",
      iconR: POSTER_LAYOUT.shareSheetIconR
    },
    facebook: {
      ...iconBox(iconCenters[2]),
      accent: "#1877F2",
      kind: "facebook",
      iconR: POSTER_LAYOUT.shareSheetIconR
    },
    iconR: POSTER_LAYOUT.shareSheetIconR,
    titleSize,
    bodySize,
    bodyLeading,
    bodyMaxW,
    titleGap,
    titleNudgeY,
    bodyNudgeY,
    bodyLineCount: bodyLines.length,
    shareTouchSize,
    textTop,
    preview: { x: previewX, y: previewY, w: previewW, h: previewH },
    copiedY: iconsRowY + iconHit / 2 + ms(10)
  };
}

function platformRecolorLineArtImage(img, rgb = PLATFORM_TEXT_RGB, solidInk = false) {
  if (!img || img.width <= 0) {
    return img;
  }

  let cacheKey =
    platformLineArtSourceKey(img) + "|" + rgb.join(",") + "|" + (solidInk ? "solid" : "lum");
  if (platformLineArtRecolorCache.has(cacheKey)) {
    return platformLineArtRecolorCache.get(cacheKey);
  }

  let w = img.width;
  let h = img.height;
  let out = createImage(w, h);
  img.loadPixels();
  out.loadPixels();
  let [tr, tg, tb] = rgb;

  for (let i = 0; i < img.pixels.length; i += 4) {
    let a = img.pixels[i + 3];
    if (a < 6) {
      out.pixels[i + 3] = 0;
      continue;
    }

    let ink;
    if (solidInk) {
      ink = a;
    } else {
      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];
      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let darkness = 255 - lum;
      ink = darkness > 12 ? min(a, darkness) : (a * darkness) / 255;
    }

    if (ink < 8) {
      out.pixels[i + 3] = 0;
      continue;
    }

    out.pixels[i] = tr;
    out.pixels[i + 1] = tg;
    out.pixels[i + 2] = tb;
    out.pixels[i + 3] = ink;
  }

  out.updatePixels();
  platformLineArtRecolorCache.set(cacheKey, out);
  return out;
}

function platformProcessPosterChoiceImages() {
  for (let id in posterRegistry) {
    let p = posterRegistry[id];
    let imgs = p?.images;
    let tintHex = p?.cfg?.choiceImageColor;
    if (!imgs || !tintHex) {
      continue;
    }

    let rgb = platformHexToRgb(tintHex);
    if (p.cfg.choiceImageDesaturate > 0) {
      rgb = platformDesaturateRgb(rgb, p.cfg.choiceImageDesaturate);
    }
    for (let key in imgs) {
      imgs[key] = platformRecolorLineArtImage(imgs[key], rgb);
    }
  }
}

function platformThickenLineArtImage(img, radius = 1) {
  if (!img || img.width <= 0 || radius <= 0) {
    return img;
  }

  img.loadPixels();
  let w = img.width;
  let h = img.height;
  let src = new Uint8ClampedArray(img.pixels);
  let r2 = radius * radius;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let bestA = 0;
      let bestR = 0;
      let bestG = 0;
      let bestB = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) {
            continue;
          }
          let nx = x + dx;
          let ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
            continue;
          }
          let si = (ny * w + nx) * 4;
          let a = src[si + 3];
          if (a > bestA) {
            bestA = a;
            bestR = src[si];
            bestG = src[si + 1];
            bestB = src[si + 2];
          }
        }
      }

      let di = (y * w + x) * 4;
      img.pixels[di] = bestR;
      img.pixels[di + 1] = bestG;
      img.pixels[di + 2] = bestB;
      img.pixels[di + 3] = bestA;
    }
  }

  img.updatePixels();
  return img;
}

function platformProcessLineArtImages() {
  if (platformLineArtProcessed) {
    return;
  }
  platformLineArtProcessed = true;
  platformFinalHomeIcon = platformRecolorLineArtImage(
    platformFinalHomeIcon,
    PLATFORM_TEXT_RGB,
    true
  );
  platformFinalShareIcon = platformRecolorLineArtImage(platformFinalShareIcon);
  platformProcessPosterChoiceImages();
}

function platformGetShareLogo(kind) {
  switch (kind) {
    case "whatsapp":
      return platformShareWhatsappLogo;
    case "instagram":
      return platformShareInstagramLogo;
    case "facebook":
      return platformShareFacebookLogo;
    default:
      return null;
  }
}

function platformGetShareIconDrawSize(drawR) {
  return (
    drawR * 2 +
    POSTER_LAYOUT.shareIconSizeBonus +
    POSTER_LAYOUT.shareSheetIconDrawPad
  );
}

function platformGetShareIconDrawDimensions(img, kind, drawR) {
  let drawSize = platformGetShareIconDrawSize(drawR);
  let fbFrac = PLATFORM_SHARE_LOGO_CONTENT_FRAC.facebook;
  let frac = PLATFORM_SHARE_LOGO_CONTENT_FRAC[kind] || fbFrac;
  let targetVisual = drawSize * fbFrac.h;
  let aspect = img.width / max(img.height, 1);
  let drawH = targetVisual / frac.h;
  let drawW = drawH * aspect;
  return { drawW, drawH };
}

function platformDrawShareOptionButton(box, alpha, hover, iconR, gfx = null) {
  let img = platformGetShareLogo(box.kind);
  if (!img || img.width <= 0 || img.height <= 0) {
    return;
  }

  let cx = box.x + box.w / 2;
  let cy = box.y + box.h / 2;
  let drawR = box.iconR ?? iconR;
  let dims = platformGetShareIconDrawDimensions(img, box.kind, drawR);
  let s = hover ? 1.05 : 1;

  if (gfx) {
    gfx.push();
    gfx.imageMode(CENTER);
    gfx.drawingContext.imageSmoothingEnabled = true;
    gfx.drawingContext.imageSmoothingQuality = "high";
    gfx.tint(255, alpha);
    gfx.image(img, cx, cy, dims.drawW * s, dims.drawH * s);
    gfx.noTint();
    gfx.pop();
    gfx.imageMode(CORNER);
    return;
  }

  push();
  imageMode(CENTER);
  drawingContext.imageSmoothingEnabled = true;
  drawingContext.imageSmoothingQuality = "high";
  tint(255, alpha);
  image(img, cx, cy, dims.drawW * s, dims.drawH * s);
  noTint();
  pop();
  imageMode(CORNER);
}

function platformSyncShareIconBoxes(layout, previewRect) {
  let iconHit = layout.shareTouchSize;
  let iconCenters = platformGetShareSheetIconCenters();
  let iconsRowY =
    previewRect.y +
    previewRect.h +
    POSTER_LAYOUT.shareIconsGapBelowPreview +
    iconHit / 2;

  function iconBox(cx, kind, accent, iconR) {
    return {
      x: cx - iconHit / 2,
      y: iconsRowY - iconHit / 2,
      w: iconHit,
      h: iconHit,
      kind,
      accent,
      iconR
    };
  }

  layout.whatsapp = iconBox(
    iconCenters[0],
    "whatsapp",
    "#25D366",
    POSTER_LAYOUT.shareSheetIconR
  );
  layout.instagram = iconBox(
    iconCenters[1],
    "instagram",
    "#C13584",
    POSTER_LAYOUT.shareSheetIconR
  );
  layout.facebook = iconBox(
    iconCenters[2],
    "facebook",
    "#1877F2",
    POSTER_LAYOUT.shareSheetIconR
  );
  layout.copiedY = iconsRowY + iconHit / 2 + ms(10);
}

function platformDrawShareBackdrop(shadeAlpha, snap = null, maxY = null) {
  if (shadeAlpha <= 0) {
    return;
  }

  let snapImg = snap || platformGetLiveCanvasSnap();
  let clipH = maxY != null ? maxY : platformH;
  let ctx = drawingContext;

  let blurredBackdrop = platformGetBlurredSnap(snapImg, PLATFORM_SHARE_BACKDROP_BLUR_PX);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, platformW, clipH);
  ctx.clip();
  platformDrawBlurredSnapIntoRect(
    ctx,
    snapImg,
    blurredBackdrop,
    0,
    0,
    platformW,
    platformH
  );
  let shade = (shadeAlpha / 255) * PLATFORM_SHARE_BACKDROP_DARKEN;
  ctx.fillStyle = `rgba(${PLATFORM_TEXT_RGB[0]},${PLATFORM_TEXT_RGB[1]},${PLATFORM_TEXT_RGB[2]},${shade})`;
  ctx.fillRect(0, 0, platformW, clipH);
  ctx.restore();
}

function platformDrawShareSheetBackground(sheet, gfx = null) {
  let ctx = platformGetDrawCtx(gfx);
  let r = POSTER_LAYOUT.shareSheetTopRadius;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,1)";
  platformRoundRectTopPath(ctx, sheet.x, sheet.y, sheet.w, sheet.h, r);
  ctx.fill();
  ctx.restore();

  if (gfx) {
    gfx.noFill();
    gfx.stroke(228, 220, 210, 220);
    gfx.strokeWeight(1);
    ctx.save();
    platformRoundRectTopPath(ctx, sheet.x + 0.5, sheet.y + 0.5, sheet.w - 1, sheet.h - 1, r);
    ctx.stroke();
    ctx.restore();
    gfx.noStroke();
    return;
  }

  noFill();
  stroke(228, 220, 210, 220);
  strokeWeight(1);
  let ctx2 = drawingContext;
  ctx2.save();
  platformRoundRectTopPath(ctx2, sheet.x + 0.5, sheet.y + 0.5, sheet.w - 1, sheet.h - 1, r);
  ctx2.stroke();
  ctx2.restore();
  noStroke();
}

function platformDrawShareSheetGrabBar(sheet, alpha, gfx = null) {
  let grabW = POSTER_LAYOUT.shareSheetGrabW;
  let grabH = POSTER_LAYOUT.shareSheetGrabH;
  let cx = sheet.x + sheet.w / 2;
  let cy =
    sheet.y +
    POSTER_LAYOUT.shareSheetGrabTop +
    grabH / 2 +
    POSTER_LAYOUT.shareSheetGrabNudgeY +
    POSTER_LAYOUT.shareSheetContentNudgeY;

  if (gfx) {
    gfx.noStroke();
    gfx.fill(188, 182, 174, alpha * 255);
    gfx.rectMode(CENTER);
    gfx.rect(cx, cy, grabW, grabH, grabH / 2);
    gfx.rectMode(CORNER);
    return;
  }

  noStroke();
  fill(188, 182, 174, alpha * 255);
  rectMode(CENTER);
  rect(cx, cy, grabW, grabH, grabH / 2);
  rectMode(CORNER);
}

function platformDrawAnimalPreviewInRect(p, rectBox, gfx = null) {
  let still = platformBakeSharePreviewStill(p);
  if (!still) {
    return;
  }

  if (gfx) {
    gfx.push();
    let ctx = gfx.drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.rect(rectBox.x, rectBox.y, rectBox.w, rectBox.h);
    ctx.clip();
    gfx.imageMode(CORNER);
    gfx.noTint();
    gfx.image(still, rectBox.x, rectBox.y, rectBox.w, rectBox.h);
    ctx.restore();
    gfx.pop();
    return;
  }

  push();
  let ctx = drawingContext;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rectBox.x, rectBox.y, rectBox.w, rectBox.h);
  ctx.clip();
  imageMode(CORNER);
  noTint();
  image(still, rectBox.x, rectBox.y, rectBox.w, rectBox.h);
  ctx.restore();
  pop();
}

function platformDrawShareOverlayUi(
  p,
  layout,
  motion,
  shadeAlpha,
  baseSnap,
  gfx
) {
  let offsetY = motion.offsetY;
  let sheet = platformShareBoxWithMotion(layout.sheet, offsetY);
  let preview = platformShareBoxWithMotion(layout.preview, offsetY);
  let textTop = layout.textTop + offsetY;
  let copiedY = layout.copiedY + offsetY;

  if (gfx) {
    gfx.push();
    gfx.rectMode(CORNER);
    gfx.noStroke();
  } else {
    push();
    rectMode(CORNER);
    noStroke();
  }

  if (baseSnap && shadeAlpha > 0) {
    platformDrawShareBackdrop(shadeAlpha, baseSnap);
  }

  platformDrawShareSheetBackground(sheet, gfx);
  platformDrawShareSheetGrabBar(sheet, motion.alpha, gfx);

  if (gfx) {
    if (p.grungeFont) {
      gfx.textFont(p.grungeFont);
    }
    let ink = gfx.color(PLATFORM_TEXT_COLOR);
    gfx.fill(ink);
    gfx.noStroke();
    gfx.textAlign(CENTER, TOP);
    gfx.textSize(layout.titleSize);
    gfx.text(platformText.share.title, sheet.x + sheet.w / 2, textTop);

    ink.setAlpha(210);
    gfx.fill(ink);
    gfx.textSize(layout.bodySize);
    platformDrawWrappedCenterText(
      platformText.share.body,
      sheet.x + sheet.w / 2,
      textTop + layout.titleSize + layout.titleGap + layout.bodyNudgeY,
      layout.bodyMaxW,
      layout.bodyLeading,
      1,
      gfx
    );
  } else {
    platformApplyGrungeFont(p.grungeFont);
    let ink = color(PLATFORM_TEXT_COLOR);
    fill(ink);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(layout.titleSize);
    text(platformText.share.title, sheet.x + sheet.w / 2, textTop);

    ink.setAlpha(210);
    fill(ink);
    textSize(layout.bodySize);
    platformDrawWrappedCenterText(
      platformText.share.body,
      sheet.x + sheet.w / 2,
      textTop + layout.titleSize + layout.titleGap + layout.bodyNudgeY,
      layout.bodyMaxW,
      layout.bodyLeading
    );
  }

  platformDrawAnimalPreviewInRect(p, preview, gfx);
  platformSyncShareIconBoxes(layout, preview);
  platformShareBoxes = layout;

  let shareButtons = [layout.whatsapp, layout.instagram, layout.facebook];
  for (let i = 0; i < shareButtons.length; i++) {
    let box = shareButtons[i];
    let hover =
      !p.touchDevice &&
      mouseX > box.x &&
      mouseX < box.x + box.w &&
      mouseY > box.y &&
      mouseY < box.y + box.h;
    platformDrawShareOptionButton(box, 255, hover, layout.iconR, gfx);
  }

  if (millis() < platformShareCopiedUntil) {
    if (gfx) {
      if (p.grungeFont) {
        gfx.textFont(p.grungeFont);
      }
      let ink = gfx.color(PLATFORM_TEXT_COLOR);
      gfx.fill(ink);
      gfx.textAlign(CENTER, TOP);
      gfx.textSize(ms(13));
      gfx.text(
        platformShareCopiedMessage || platformText.share.copied,
        platformW / 2,
        copiedY
      );
    } else {
      platformApplyGrungeFont(p.grungeFont);
      let ink = color(PLATFORM_TEXT_COLOR);
      fill(ink);
      textAlign(CENTER, TOP);
      textSize(ms(13));
      text(platformShareCopiedMessage || platformText.share.copied, platformW / 2, copiedY);
    }
  }

  if (gfx) {
    gfx.pop();
  } else {
    pop();
  }
}

function platformDrawShareOverlay() {
  let p = posterRegistry[platformMode];
  if (!p) {
    return;
  }

  let layout = platformGetShareOverlayLayout(p);
  platformShareBoxes = layout;
  let motion = platformGetShareSheetMotion();
  let shadeAlpha = motion.alpha * 255;
  let useLiveBackdrop = platformUseLiveDomBackdrop();

  if (useLiveBackdrop) {
    platformSyncMenuBackdropEl(shadeAlpha);
    let g = platformEnsureMenuOverlayGfx();
    g.clear();
    platformShowMenuOverlayLayers();
    platformDrawShareOverlayUi(p, layout, motion, shadeAlpha, null, g);
  } else {
    platformHideMenuOverlayLayers();
    platformDrawShareOverlayUi(
      p,
      layout,
      motion,
      shadeAlpha,
      platformGetLiveCanvasSnap(),
      null
    );
  }
}

function platformHandleShareTap() {
  let p = posterRegistry[platformMode];
  let boxes = platformEnsureShareOverlayBoxes();
  if (!p || !boxes) {
    return;
  }

  let offsetY = platformGetShareSheetMotion().offsetY;
  let preview = platformShareBoxWithMotion(boxes.preview, offsetY);
  platformSyncShareIconBoxes(boxes, preview);
  platformShareBoxes = boxes;

  if (platformWasBoxClicked(boxes.whatsapp)) {
    platformShareViaWhatsApp(p);
    return;
  }

  if (platformWasBoxClicked(boxes.instagram)) {
    platformShareViaInstagram(p);
    return;
  }

  if (platformWasBoxClicked(boxes.facebook)) {
    platformShareViaFacebook(p);
    return;
  }

  if (platformWasBoxClicked(platformShareBoxWithMotion(boxes.grab, offsetY))) {
    platformCloseShare();
    return;
  }

  if (!platformWasBoxClicked(platformShareBoxWithMotion(boxes.sheet, offsetY))) {
    platformCloseShare();
  }
}

function platformReturnToIntro() {
  platformCloseShare();
  platformCloseAnimalMenu();
  platformMode = "intro";
  platformSelectedStarted = false;
  platformSessionAnimalId = null;
  platformIntroTransitionActive = false;
  platformIntroTransitionIndex = -1;
  platformIntroTransitionSnapshot = null;
  platformLoadingTargetAnimal = null;
  platformLoadingStartTime = null;
  platformPosterFadeStartTime = null;
  platformPosterFadeColor = null;
  platformSkipNextSessionFade = false;
  posterResetAll();
  platformApplyCanvasSize();
}

function platformEnsureAnimalStarted() {
  if (platformMode === "intro" || platformMode === "loading") {
    return;
  }
  if (!posterRegistry[platformMode]) {
    return;
  }

  if (platformSessionAnimalId === platformMode && platformSelectedStarted) {
    posterEnsurePlayReady(posterRegistry[platformMode]);
    return;
  }

  posterPrepareForPlay(platformMode);
}
function platformRotatePoint(px, py, cx, cy, ang) {
  let dx = px - cx;
  let dy = py - cy;

  let rx = dx * cos(ang) - dy * sin(ang);
  let ry = dx * sin(ang) + dy * cos(ang);

  return [cx + rx, cy + ry];
}

function platformGetIntroTriangleRefPts(animal) {
  let scale = animal.introTriScale ?? 1;
  if (scale === 1) {
    return animal.pts;
  }
  let cx = (animal.pts[0][0] + animal.pts[1][0] + animal.pts[2][0]) / 3;
  let cy = (animal.pts[0][1] + animal.pts[1][1] + animal.pts[2][1]) / 3;
  return animal.pts.map((p) => [
    cx + (p[0] - cx) * scale,
    cy + (p[1] - cy) * scale
  ]);
}

function platformGetAnimatedTrianglePoints(index) {
  let animal = platformAnimals[index];
  let refPts = platformGetIntroTriangleRefPts(animal);
  let p0 = refPts[0];
  let p1 = refPts[1];
  let p2 = refPts[2];

  let cx = (p0[0] + p1[0] + p2[0]) / 3;
  let cy = (p0[1] + p1[1] + p2[1]) / 3;

  let phase = index * 1.35;

  let floatX = sin(frameCount * 0.007 + phase) * 2.5;
  let floatY = cos(frameCount * 0.008 + phase * 1.1) * 3;
  let rot = sin(frameCount * 0.005 + phase) * 0.01;

  let rp0 = platformRotatePoint(p0[0], p0[1], cx, cy, rot);
  let rp1 = platformRotatePoint(p1[0], p1[1], cx, cy, rot);
  let rp2 = platformRotatePoint(p2[0], p2[1], cx, cy, rot);

  return [
    [mx(rp0[0] + floatX), platformLayoutY(rp0[1] + floatY) + INTRO_TRIANGLES_OFFSET_Y + INTRO_SCREEN_NUDGE_Y],
    [mx(rp1[0] + floatX), platformLayoutY(rp1[1] + floatY) + INTRO_TRIANGLES_OFFSET_Y + INTRO_SCREEN_NUDGE_Y],
    [mx(rp2[0] + floatX), platformLayoutY(rp2[1] + floatY) + INTRO_TRIANGLES_OFFSET_Y + INTRO_SCREEN_NUDGE_Y]
  ];
}

function platformAddMeshGradient(ctx, cx, cy, maxR, rgb, peakAlpha, kind) {
  let [r, g, b] = rgb;
  let rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

  if (kind === "wisp") {
    rg.addColorStop(0, `rgba(${r},${g},${b},${peakAlpha * 0.7})`);
    rg.addColorStop(0.28, `rgba(${r},${g},${b},${peakAlpha * 0.5})`);
    rg.addColorStop(0.55, `rgba(${r},${g},${b},${peakAlpha * 0.16})`);
    rg.addColorStop(0.78, `rgba(${r},${g},${b},${peakAlpha * 0.04})`);
    rg.addColorStop(1, `rgba(${r},${g},${b},0)`);
  } else {
    rg.addColorStop(0, `rgba(${r},${g},${b},${peakAlpha})`);
    rg.addColorStop(0.32, `rgba(${r},${g},${b},${peakAlpha * 0.68})`);
    rg.addColorStop(0.56, `rgba(${r},${g},${b},${peakAlpha * 0.24})`);
    rg.addColorStop(0.76, `rgba(${r},${g},${b},${peakAlpha * 0.07})`);
    rg.addColorStop(1, `rgba(${r},${g},${b},0)`);
  }

  return rg;
}

function platformDrawMainBackground() {
  noStroke();
  rectMode(CORNER);
  // Solid white bitmap fill — Android auto-dark does not recolor canvas pixels
  // the way it darkens CSS backgrounds.
  background(255);
  fill(255);
  rect(0, 0, platformW, platformH);
}

// --- Opening splash ---
// Drawn entirely on the p5 canvas (no DOM/CSS logo) so Android dark mode
// and viewport quirks cannot recolor or shrink it.

const PLATFORM_SPLASH_LOGO_VB_W = 297.81;
const PLATFORM_SPLASH_LOGO_VB_H = 318.5;

// Triangles: points in logo viewBox space + bounce start offsets.
const PLATFORM_SPLASH_POLYS = [
  {
    fill: '#7F905F',
    points: [[123.99, 168.29], [8.59, 119.63], [155.49, 3.67]],
    dx: -70, dy: -110, rot: -28, delay: 0, dur: 1080
  },
  {
    fill: '#71553F',
    points: [[148.89, 185.94], [66.03, 277.02], [6.19, 125.58]],
    dx: 55, dy: -95, rot: 22, delay: 90, dur: 1080
  },
  {
    fill: '#525D46',
    points: [[273.03, 143.56], [130.29, 169.63], [149.14, 71.44]],
    dx: 95, dy: 20, rot: 34, delay: 180, dur: 1080
  },
  {
    fill: '#C79961',
    points: [[247.1, 220.98], [139.27, 314.53], [156.7, 189.14]],
    dx: 40, dy: 105, rot: -18, delay: 270, dur: 1080
  },
  {
    fill: '#8F5B2E',
    points: [[132.72, 313.93], [70.53, 282.29], [148.63, 196.25]],
    dx: -85, dy: 70, rot: 26, delay: 360, dur: 1080
  }
];

// Hebrew wordmark paths (viewBox space). Centers are approximate glyph pivots.
const PLATFORM_SPLASH_PATHS = [
  { fill: '#4E463D', cx: 185, cy: 55, d: 'M167.06,47.09c1.16-1.96,2.27-3.21,2.94-4.35.35-.59.69-1.07.76-1.71,2.77-4.7,3.11-4.75-.74-7.39-.81-.91-.97-1.68-.49-2.5.61-.93,1.44-1.18,2.3-.67.14.08.27.16.43.31.29.23.58.47.9.66,1.96,1.16,3.41.9,4.86-2.3.22-.48.7-1.19,1.37-1.59.64-.36,1.65-.19,2.47.29.18.11.37.22.47.34.59.47.33.69.13,1.55-.11.49-.3.93-.37,1.26-.13.54-.58.89-.85,1.34-.59,1-.95,2.02-.05,3.42.58.9,1.5,1.32,2.37,1.83,1.05.62,2.82,1.48,3.77,2.16.3.12.58.28.8.41,1,.59,1.41,1.26.71,2.45-1,1.69-2.17,1.18-3.48.47-1.81-1.31-4.05-2.21-5.05-2.8-2.65-1.56-3.26-.63-5.61,3.15l-2.44,4.03c-2.79,4.94-4.38,7.63-.82,9.73.82.48,1.81.89,3.16,1.31.46.15,2.12.27,2.85.7.88.58.85.75.12,1.98-.19.32-1,1.69-2.27,1.55-3.01-.73-5.23-1.67-6.87-2.64-5.34-3.15-4.58-7.56-1.37-12.99Z' },
  { fill: '#4E463D', cx: 200, cy: 62, d: 'M181.05,67.04c-.81-.6-1.01-1.52-.43-2.29.42-.61,1.22-.82,1.81-.47,3.65,2.15,5.3-.13,6.5-2.68,1.08-2.25,2.47-4.7,3.91-6.61,1.94-2.55,3.86-5.29.07-8.14-.72-.55-.86-1.67-.26-2.37.52-.68,1.5-.77,2.44-.28l3.08,1.76c3.74,2.21-.56,5.33,10.66,6.11,1.2.16,3.02,1.04,2.13,3.17-.79,1.87-2.1,2.2-4.07,1.16-1.08-.57-2.21-1.37-3.38-1.68-2.96-.83-4.57-1.22-6.72,2.31-1.61,2.62-3.3,5.49-4.94,8.16-1.34,2.16-.91,3.83,1.1,5.02,1,.59,3.12,1.9,3.79,2.54.61.42.69,1.02.28,1.82-.46.78-1.15,1.11-1.77.8-4.52-2.24-6.76-3.13-7.5-4.18-2.13-1.38-4.58-2.77-6.72-4.15Z' },
  { fill: '#4E463D', cx: 215, cy: 78, d: 'M204.11,79.68c-1.3-2.18-.94-5.17.27-7.22,1.37-2.33,3.92-3.83,6.71-3.85,3.33,0,6.13,1.59,8.87,3.21,1.19.7,2.62,1.61,4.37-1.36,1.05-1.78.74-3.75-.71-5.46-.5-.61-1.18-1.13-2.28-1.78l-2.33-1.37c-.66-.45-1.65-.54-2.38-.97-.87-.51-.95-1.3-.41-2.33,1.13-2.22,2.73-.35,4.45.29.81.29,1.52.65,2.3,1.11.5.3.93.61,1.43.91,5.66,3.34,6.64,6.57,3.72,12.35-.39.76-1.61,2.93-2.5,4.43-.7,1.19-3.19,5.19-4.02,6.61l-1.05,1.78c-1.67,2.83-2.13,3.29-3.16,2.75-1.3-.71-.55-1.99-1.83-2.74-1.32-.78-3.16.04-5.94-1.6-.5-.3-1.08-.46-1.59-.75-1.06-.81-2.52-1.67-3.93-3.98ZM218.58,80.71c2.53-4.29,2.59-4.07-1.47-6.47-3.83-2.26-6.93-2.43-8.68.53-1.43,2.42-.96,4.23,2.78,6.44,2.42,1.43,6.57.86,7.37-.51Z' },
  { fill: '#4E463D', cx: 240, cy: 90, d: 'M226.95,89.35c-.34-2.97,1.05-5.53,2.77-8.64,1.06-1.9,2.24-3.9,4.16-5.48,4.31-3.55,9.38-3.07,14.08-.3,1.5.89,4.07,2.9,4.95,4.22.72.98.2,1.23-.39,2.23-.54.91-1.2,1.82-2.24.77-.16-.15-.36-.21-.57-.4-.52-.37-.71-1.09-1.23-1.46-.47-.34-1.33-1.09-2.69-1.9-4.43-2.61-8.36-1.68-11.22,3.16-.73,1.23-1.65,2.47-1.97,3.45-.46.78-.81,1.68-.58,2.86-1.1,1.87-.04,6.01,5.87,8.51.61.42,2.79.79,3.62,1.27.91.54,1.34.54.4,2.14-.11.18-.14.35-.22.48-.92,1.55-2.03,1.14-3.53.56-.65-.26-1.11-.72-1.68-.81-1.11-.41-2.12-.88-3.04-1.42-3.74-2.21-5.97-4.57-6.48-9.24Z' },
  { fill: '#4E463D', cx: 258, cy: 100, d: 'M247.97,100.03c.16-2.25,1.03-4.56,2.57-7.16,2.72-4.61,4.98-6.35,8.03-7.56,2.98-1.19,6.28-.42,9.2,1.31,1.28.75,2.42,1.74,3.26,3.03,1.93,2.99,3.06,6.79-.33,12.54-.19.32-.35.59-.56.84-1.04,1.23-2.17,1.18-3.77.24-3.01-1.78-5.91-3.74-9.12-5.39-1.92-1.13-2.54-2.36-4.08.24-.38.64-.56,1.58-.56,2.93-.02,3.37,1.83,5.02,3.98,6.29.68.4,1.42.72,2.06,1.09.16.15.33.38.61.42,1.41.22,2.29.49,2.93.87.87.51.95.99.55,1.99-1.03,2.47-3.37.91-5.9.21-.83-.37-2.1-.93-2.73-1.31-4.47-2.64-6.47-6.03-6.12-10.57ZM264.7,97.74c1.32.78,2.45.65,3.04-.36.27-.46.53-1.1.55-1.77.09-2.65-.79-4.59-3.36-5.98-3.55-1.91-7.04.15-8.5,2.61-.63.86,2.73,2.35,4.24,3.24,1.32.78,2.75,1.5,4.02,2.25Z' },
  { fill: '#4E463D', cx: 278, cy: 115, d: 'M267.83,117.24c-.81-.72-.51-1.53.03-2.45.22-.36.52-.68.88-.96.58-.46.57-.65,1.21-.27.32.19.8.41,1.18.82,1.61,1.75,3.21,3.43,5.12,4.56.64.38,1.38.69,2.07.98,1.39.45,2.78,1.03,4.04-.38.11-.18.53-.49.8-.94.4-.68.58-1.81-.89-3.6-.84-1.17-1.7-2.23-2.48-3.31-.83-1.1-1.81-2.24-2.54-3.41-1.6-2.61-2.27-5.22-.6-8.05,2.05-3.47,6.29-4.41,9.73-2.31l3.51,1.76c1.44,1.1,2.85,2.05,4.24,3.24.99.83,1.17,1.67.71,2.45-.08.14-.21.25-.32.43-.48.82-.85,1.65-1.72,1.14-.18-.11-1.15-.56-1.4-.76-1.18-1.13-2.34-2.49-3.67-3.27-.41-.24-.84-.56-1.25-.8-1.6-.94-3.47-1.62-5.18.02-.28.27-.27.46-.43.73-1.27,2.14.76,4.02,2.12,5.68,1.01,1.21,1.92,2.48,2.87,3.79,1.15,1.6,1.96,3.25,2.13,4.83.22,1.61-.23,3-.99,4.28-1.21,2.05-3.46,3.37-6.18,3.18-2.53-.2-4.59-.99-6.59-2.17-2.33-1.37-4.41-3.16-6.4-5.2Z' }
];

function platformSplashPolyCentroid(points) {
  let x = 0;
  let y = 0;
  for (let i = 0; i < points.length; i++) {
    x += points[i][0];
    y += points[i][1];
  }
  return { x: x / points.length, y: y / points.length };
}

function platformSplashSpringEase(t) {
  // Approx. cubic-bezier(0.22, 1.55, 0.36, 1) — overshoot settle like the old WAAPI bounce.
  t = constrain(t, 0, 1);
  let c1 = 1.70158;
  let c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function platformSplashKeyframeLerp(frames, t) {
  if (t <= 0) {
    return frames[0];
  }
  if (t >= 1) {
    return frames[frames.length - 1];
  }
  for (let i = 0; i < frames.length - 1; i++) {
    let a = frames[i];
    let b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      let u = (t - a.t) / Math.max(0.0001, b.t - a.t);
      return {
        opacity: lerp(a.opacity, b.opacity, u),
        x: lerp(a.x, b.x, u),
        y: lerp(a.y, b.y, u),
        rot: lerp(a.rot, b.rot, u),
        scale: lerp(a.scale, b.scale, u)
      };
    }
  }
  return frames[frames.length - 1];
}

function platformBuildSplashPieces() {
  let pieces = [];
  PLATFORM_SPLASH_POLYS.forEach((poly) => {
    let c = platformSplashPolyCentroid(poly.points);
    pieces.push({
      kind: 'poly',
      fill: poly.fill,
      points: poly.points,
      cx: c.x,
      cy: c.y,
      delay: poly.delay,
      dur: poly.dur,
      frames: [
        { t: 0, opacity: 0, x: poly.dx, y: poly.dy, rot: poly.rot, scale: 0.35 },
        {
          t: 0.58,
          opacity: 1,
          x: poly.dx * 0.08,
          y: 14,
          rot: poly.rot * 0.15,
          scale: 1.16
        },
        {
          t: 0.78,
          opacity: 1,
          x: 0,
          y: -7,
          rot: -poly.rot * 0.08,
          scale: 0.94
        },
        { t: 1, opacity: 1, x: 0, y: 0, rot: 0, scale: 1 }
      ]
    });
  });

  let markEnd = 0;
  PLATFORM_SPLASH_POLYS.forEach((poly) => {
    markEnd = Math.max(markEnd, poly.delay + poly.dur);
  });
  let wordDelay = Math.max(160, markEnd - 920);

  PLATFORM_SPLASH_PATHS.forEach((path, i) => {
    pieces.push({
      kind: 'path',
      fill: path.fill,
      d: path.d,
      cx: path.cx,
      cy: path.cy,
      delay: wordDelay + i * 48,
      dur: 720,
      path2d: null,
      frames: [
        { t: 0, opacity: 0, x: 0, y: 14, rot: -6, scale: 0.7 },
        { t: 0.7, opacity: 1, x: 0, y: -3, rot: 1, scale: 1.06 },
        { t: 1, opacity: 1, x: 0, y: 0, rot: 0, scale: 1 }
      ]
    });
  });

  return pieces;
}

function platformEnsureSplashPieces() {
  if (platformSplashPieces) {
    return platformSplashPieces;
  }
  platformSplashPieces = platformBuildSplashPieces();
  if (typeof Path2D !== 'undefined') {
    platformSplashPieces.forEach((piece) => {
      if (piece.kind === 'path') {
        try {
          piece.path2d = new Path2D(piece.d);
        } catch (e) {
          piece.path2d = null;
        }
      }
    });
  }
  return platformSplashPieces;
}

function platformSplashLogoLayout() {
  // Same visual size as original min(58vw, 240px) in canvas units.
  let logoW = Math.min(platformW * 0.58, 240);
  let scale = logoW / PLATFORM_SPLASH_LOGO_VB_W;
  return {
    scale,
    ox: platformW / 2 - (PLATFORM_SPLASH_LOGO_VB_W * scale) / 2,
    // Sit a bit above true center — felt low after moving splash onto canvas.
    oy: platformH / 2 - (PLATFORM_SPLASH_LOGO_VB_H * scale) / 2 - 56
  };
}

function platformSampleSplashPiece(piece, elapsedMs) {
  let local = (elapsedMs - piece.delay) / piece.dur;
  if (local <= 0) {
    return piece.frames[0];
  }
  if (local >= 1) {
    return piece.frames[piece.frames.length - 1];
  }
  // Ease progress with a mild overshoot, then sample bounce keyframes.
  // Clamp so we never run past the final rest pose.
  let eased = constrain(platformSplashSpringEase(local), 0, 1.05);
  return platformSplashKeyframeLerp(piece.frames, Math.min(1, eased));
}

function platformDrawSplashLogo(alpha = 1) {
  if (alpha <= 0.001) {
    return;
  }
  let pieces = platformEnsureSplashPieces();
  let layout = platformSplashLogoLayout();
  let elapsed =
    platformSplashAnimStart > 0 ? millis() - platformSplashAnimStart : 0;

  push();
  translate(layout.ox, layout.oy);
  scale(layout.scale);
  noStroke();

  for (let i = 0; i < pieces.length; i++) {
    let piece = pieces[i];
    let pose = platformSampleSplashPiece(piece, elapsed);
    let a = constrain(pose.opacity * alpha, 0, 1);
    if (a <= 0.001) {
      continue;
    }

    push();
    translate(piece.cx, piece.cy);
    translate(pose.x, pose.y);
    rotate(radians(pose.rot));
    scale(pose.scale);
    translate(-piece.cx, -piece.cy);

    let c = color(piece.fill);
    fill(red(c), green(c), blue(c), a * 255);

    if (piece.kind === 'poly') {
      beginShape();
      for (let p = 0; p < piece.points.length; p++) {
        vertex(piece.points[p][0], piece.points[p][1]);
      }
      endShape(CLOSE);
    } else if (piece.path2d && drawingContext) {
      drawingContext.save();
      drawingContext.fillStyle =
        'rgba(' +
        red(c) +
        ',' +
        green(c) +
        ',' +
        blue(c) +
        ',' +
        a +
        ')';
      drawingContext.fill(piece.path2d);
      drawingContext.restore();
    }
    pop();
  }

  pop();
}

function platformSplashSettleMs() {
  let pieces = platformEnsureSplashPieces();
  let end = 0;
  for (let i = 0; i < pieces.length; i++) {
    end = Math.max(end, pieces[i].delay + pieces[i].dur);
  }
  return end;
}

function platformDrawSplash() {
  if (!platformSplashStarted) {
    platformAdoptOrStartSplash();
    platformDrawMainBackground();
    return;
  }

  if (platformSplashPhase === 'preWhite') {
    platformDrawMainBackground();
    if (millis() - platformSplashPhaseStart >= platformSplashPreWhiteMs) {
      platformSplashPhase = 'play';
      platformSplashPhaseStart = millis();
      platformSplashAnimStart = millis();
      platformSplashLogoAlpha = 1;
      platformEnsureSplashPieces();
      platformSplashSettleAt = millis() + platformSplashSettleMs();
    }
    return;
  }

  if (platformSplashPhase === 'play') {
    platformDrawMainBackground();
    platformDrawSplashLogo(platformSplashLogoAlpha);
    if (millis() >= platformSplashSettleAt) {
      platformSplashPhase = 'hold';
      platformSplashPhaseStart = millis();
    }
    return;
  }

  if (platformSplashPhase === 'hold') {
    platformDrawMainBackground();
    platformDrawSplashLogo(1);
    platformProcessLineArtImages();
    if (millis() - platformSplashPhaseStart >= platformSplashHoldMs) {
      platformBeginSplashFadeOut();
    }
    return;
  }

  if (platformSplashPhase === 'fadeOut') {
    platformDrawMainBackground();
    let t = constrain(
      (millis() - platformSplashPhaseStart) / platformSplashFadeOutMs,
      0,
      1
    );
    let e = platformEaseInOutSine(t);
    platformSplashLogoAlpha = 1 - e;
    platformDrawSplashLogo(platformSplashLogoAlpha);
    if (t >= 1) {
      platformSplashLogoAlpha = 0;
      platformSplashPhase = 'whiteBeat';
      platformSplashPhaseStart = millis();
    }
    return;
  }

  if (platformSplashPhase === 'whiteBeat') {
    platformDrawMainBackground();
    if (millis() - platformSplashPhaseStart >= platformSplashWhiteBeatMs) {
      platformProcessLineArtImages();
      platformSplashPhase = 'fadeIn';
      platformSplashPhaseStart = millis();
    }
    return;
  }

  if (platformSplashPhase === 'fadeIn') {
    platformDrawIntro();
    let t = constrain(
      (millis() - platformSplashPhaseStart) / platformSplashFadeInMs,
      0,
      1
    );
    let e = platformEaseInOutSine(t);
    noStroke();
    fill(255, 255, 255, (1 - e) * 255);
    rect(0, 0, platformW, platformH);
    if (t >= 1) {
      platformSplashPhase = 'done';
      platformMode = 'intro';
      platformTeardownSplash();
    }
  }
}

function platformAdoptOrStartSplash() {
  if (platformSplashStarted) {
    return;
  }
  platformSplashStarted = true;
  platformSplashPhase = 'preWhite';
  platformSplashPhaseStart = millis();
  platformSplashLogoAlpha = 1;
  platformEnsureSplashPieces();
}

function platformCanAcceptIntroPressFromSplash() {
  return (
    platformMode === 'splash' &&
    (platformSplashPhase === 'fadeIn' ||
      platformSplashPhase === 'done' ||
      // White beat is brief; accept early so the first menu tap is never dropped.
      platformSplashPhase === 'whiteBeat')
  );
}

function platformFinishSplashForIntroIfNeeded() {
  if (platformMode !== 'splash') {
    return;
  }
  platformSplashPhase = 'done';
  platformMode = 'intro';
  platformTeardownSplash();
}

function platformTeardownSplash() {
  platformSplashLogoAlpha = 0;
  platformSplashAnimStart = 0;
  platformSplashSettleAt = 0;
}

function platformBeginSplashFadeOut() {
  if (platformSplashPhase !== 'hold') {
    return;
  }
  platformSplashPhase = 'fadeOut';
  platformSplashPhaseStart = millis();
}

// --- Intro, loading morph & viewport ---
// Triangle menu, zoom into animal, loading morph, canvas layout.

function platformDrawIntro() {
  // Zoom-only path: skip title/other triangles so the fill stays smooth.
  if (platformIntroTransitionActive && platformIntroTransitionSnapshot) {
    let elapsed = millis() - platformIntroTransitionStart;
    let animal = platformAnimals[platformIntroTransitionIndex];
    let snap = platformIntroTransitionSnapshot;
    let pts = snap.pts;
    let cx = snap.cx;
    let cy = snap.cy;

    // Hold still briefly so the select sound attack leads the zoom.
    if (elapsed < 0) {
      noStroke();
      background("#FFFFFF");
      push();
      translate(cx, cy);
      scale(snap.startScale);
      translate(-cx, -cy);
      fill(animal.color);
      triangle(
        pts[0][0], pts[0][1],
        pts[1][0], pts[1][1],
        pts[2][0], pts[2][1]
      );
      pop();
      return;
    }

    let t = constrain(elapsed / platformIntroTransitionDuration, 0, 1);
    let e = platformEaseOutCubic(t);
    let zoomScale = lerp(snap.startScale, snap.zoomScale, e);
    let bgMix = constrain(map(e, 0.35, 0.85, 0, 1), 0, 1);

    noStroke();
    background("#FFFFFF");
    if (bgMix > 0) {
      fill(lerpColor(color("#FFFFFF"), color(animal.color), bgMix));
      rect(0, 0, platformW, platformH);
    }

    push();
    translate(cx, cy);
    scale(zoomScale);
    translate(-cx, -cy);
    fill(animal.color);
    triangle(
      pts[0][0], pts[0][1],
      pts[1][0], pts[1][1],
      pts[2][0], pts[2][1]
    );
    pop();

    if (t >= 1) {
      platformIntroTransitionActive = false;
      platformIntroTransitionIndex = -1;
      platformIntroTransitionSnapshot = null;
      platformPosterFadeColor = animal.color;
      platformPosterFadeDuration = 420;
      platformPosterFadeStartTime = millis();
      platformSkipNextSessionFade = true;
      platformEnterAnimal(animal.id);
      // Unlock Web Audio + decode quiz SFX only after the zoom finishes.
      platformScheduleAudioWarmup(0);
    }
    return;
  }

  platformDrawMainBackground();

  // title
  fill(PLATFORM_TEXT_COLOR);
  noStroke();

  let introFont = platformGetIntroGrungeFont();

  if (introFont) {
    textFont(introFont);
  }

  textAlign(CENTER, TOP);
  textSize(platformText.introTitle.size);
  textLeading(platformText.introTitle.leading);
  text(
    platformText.introTitle.text,
    platformText.introTitle.x,
    platformText.introTitle.y
  );

  platformIntroHover = -1;

  for (let i = 0; i < platformAnimals.length; i++) {
    let animal = platformAnimals[i];
    let pts = platformGetAnimatedTrianglePoints(i);

    let isHover = platformPointInTriangle(
      mouseX,
      mouseY,
      pts[0],
      pts[1],
      pts[2]
    );

    if (isHover) {
      platformIntroHover = i;
    }

    let hoverScale = isHover ? 1.035 : 1;

    let cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
    let cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;

    push();
    translate(cx, cy);
    scale(hoverScale);
    translate(-cx, -cy);

    noStroke();
    fill(animal.color);

    triangle(
      pts[0][0], pts[0][1],
      pts[1][0], pts[1][1],
      pts[2][0], pts[2][1]
    );

    pop();
  }

  fill(PLATFORM_TEXT_RGB[0], PLATFORM_TEXT_RGB[1], PLATFORM_TEXT_RGB[2], 180);
  textAlign(CENTER, TOP);
  textSize(platformText.introHint.size);
  text(
    platformText.introHint.text,
    platformText.introHint.x,
    platformText.introHint.y
  );
}

function platformGetLoadingStartIndex() {
  for (let i = 0; i < platformAnimals.length; i++) {
    if (platformAnimals[i].id === platformLoadingTargetAnimal) {
      return i;
    }
  }
  return 0;
}

function platformGetLoadingTriangleRefPts(index) {
  let animal = platformAnimals[index];
  return platformGetIntroTriangleRefPts(animal).map((p) => [
    mx(p[0]),
    platformLayoutY(p[1]) + INTRO_TRIANGLES_OFFSET_Y
  ]);
}

function platformSortTriangleVerts(pts) {
  let cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
  let cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
  return pts
    .slice()
    .sort((a, b) => atan2(a[1] - cy, a[0] - cx) - atan2(b[1] - cy, b[0] - cx));
}

function platformNormalizeTriangleVerts(pts, targetCx, targetCy, targetSize) {
  let sorted = platformSortTriangleVerts(pts);
  let cx = (sorted[0][0] + sorted[1][0] + sorted[2][0]) / 3;
  let cy = (sorted[0][1] + sorted[1][1] + sorted[2][1]) / 3;
  let maxR = 1;

  for (let i = 0; i < 3; i++) {
    maxR = max(maxR, dist(sorted[i][0], sorted[i][1], cx, cy));
  }

  let scale = targetSize / maxR;
  return sorted.map((p) => [
    targetCx + (p[0] - cx) * scale,
    targetCy + (p[1] - cy) * scale
  ]);
}

function platformLerpTriangleVerts(a, b, t) {
  return [
    [lerp(a[0][0], b[0][0], t), lerp(a[0][1], b[0][1], t)],
    [lerp(a[1][0], b[1][0], t), lerp(a[1][1], b[1][1], t)],
    [lerp(a[2][0], b[2][0], t), lerp(a[2][1], b[2][1], t)]
  ];
}

function platformGetLoadingMorphState(elapsed) {
  let count = platformAnimals.length;
  let segmentMs = PLATFORM_LOADING_HOLD_MS + PLATFORM_LOADING_MORPH_MS;
  let startIndex = platformGetLoadingStartIndex();
  let segment = floor(elapsed / segmentMs);
  let segmentT = elapsed % segmentMs;
  let fromIndex = (startIndex + segment) % count;
  let toIndex = (fromIndex + 1) % count;
  let morphT =
    segmentT < PLATFORM_LOADING_HOLD_MS
      ? 0
      : platformEaseOutCubic(
          (segmentT - PLATFORM_LOADING_HOLD_MS) / PLATFORM_LOADING_MORPH_MS
        );

  return { fromIndex, toIndex, morphT, segmentT };
}

function platformGetIntroGrungeFont() {
  return (
    posterRegistry.turtle.grungeFont ||
    posterRegistry.eagle.grungeFont ||
    posterRegistry.toad.grungeFont ||
    posterRegistry.hyena.grungeFont ||
    posterRegistry.deer.grungeFont
  );
}

function platformDrawLoadingTriangle(morph) {
  let fromPts = platformNormalizeTriangleVerts(
    platformGetLoadingTriangleRefPts(morph.fromIndex),
    platformW / 2,
    platformGetLoadingTriangleCy(),
    PLATFORM_LOADING_TRIANGLE_SIZE
  );
  let toPts = platformNormalizeTriangleVerts(
    platformGetLoadingTriangleRefPts(morph.toIndex),
    platformW / 2,
    platformGetLoadingTriangleCy(),
    PLATFORM_LOADING_TRIANGLE_SIZE
  );
  let pts = platformLerpTriangleVerts(fromPts, toPts, morph.morphT);
  let fromColor = color(platformAnimals[morph.fromIndex].color);
  let toColor = color(platformAnimals[morph.toIndex].color);
  let triColor = lerpColor(fromColor, toColor, morph.morphT);

  noStroke();
  fill(triColor);
  triangle(
    pts[0][0], pts[0][1],
    pts[1][0], pts[1][1],
    pts[2][0], pts[2][1]
  );
}

function posterRefreshChoiceBoxes(p) {
  let boxes = platformCreateChoiceBoxes(
    POSTER_LAYOUT.choiceW,
    POSTER_LAYOUT.choiceH,
    posterGetChoicePanelY(p),
    POSTER_LAYOUT.choiceCenterPull
  );
  p.leftBox = boxes.left;
  p.rightBox = boxes.right;
}

function posterEnsurePlayReady(p) {
  let cfg = p.cfg;
  if (
    !p.leftBox ||
    !p.rightBox ||
    p.pieceOffsets.length !== cfg.totalPieces
  ) {
    posterSetup(p.id);
  }
}

function posterPrepareForPlay(animalId) {
  if (!animalId || !posterRegistry[animalId]) {
    return false;
  }

  platformSharePreviewStill = false;
  posterReset(posterRegistry[animalId]);
  posterSetup(animalId);
  platformSessionAnimalId = animalId;
  platformSelectedStarted = true;
  platformSharePreviewStillCache.delete(platformSharePreviewCacheKey(animalId));
  return true;
}

function platformStartAnimalSession(animalId) {
  if (!animalId || !posterRegistry[animalId]) {
    return;
  }

  platformMode = animalId;
  platformLoadingTargetAnimal = null;
  platformLoadingStartTime = null;
  platformWithSuppressedUiClose(() => {
    platformCloseShare();
  });
  platformClearSharedPosterCaches();
  if (!posterPrepareForPlay(animalId)) {
    return;
  }

  let p = posterRegistry[animalId];
  p.disassembleBoost = 320;
  p.finalMotion = 0;
  if (!platformSkipNextSessionFade) {
    platformPosterFadeColor = PLATFORM_BG_COLOR;
    platformPosterFadeDuration = 850;
    platformPosterFadeStartTime = millis();
  }
  platformSkipNextSessionFade = false;
}

function platformDrawPosterHandoffFrame() {
  platformEnsureAnimalStarted();
  platformInvokeAnimal("draw");
  platformDrawPosterFadeOverlay();
}

function platformBeginAnimalDirect(animalId) {
  if (!animalId || !posterRegistry[animalId]) {
    platformReturnToIntro();
    return;
  }
  platformWithSuppressedUiClose(() => {
    platformCloseShare();
    platformCloseAnimalMenu();
  });
  platformStartAnimalSession(animalId);
}

function platformEnterAnimal(animalId) {
  if (!animalId || !posterRegistry[animalId]) {
    return;
  }
  platformWithSuppressedUiClose(() => {
    platformCloseShare();
    platformCloseAnimalMenu();
  });
  if (platformHasCompletedAnyPoster) {
    platformBeginAnimalDirect(animalId);
  } else {
    platformStartLoadingForAnimal(animalId);
  }
}

function platformBeginAnimalFromLoading() {
  let animalId = platformLoadingTargetAnimal;
  if (!animalId || !posterRegistry[animalId]) {
    platformReturnToIntro();
    return;
  }
  platformStartAnimalSession(animalId);
}

function platformDrawLoading() {
  if (platformLoadingStartTime === null) {
    platformLoadingStartTime = millis();
  }

  let elapsed = millis() - platformLoadingStartTime;

  if (elapsed >= PLATFORM_LOADING_TOTAL_MS) {
    platformBeginAnimalFromLoading();
    platformEnsureAnimalStarted();
    platformInvokeAnimal("draw");
    platformDrawPosterFadeOverlay();
    return;
  }

  platformDrawMainBackground();

  let morph = platformGetLoadingMorphState(elapsed);
  platformDrawLoadingTriangle(morph);

  let introFont = platformGetIntroGrungeFont();
  if (introFont) {
    textFont(introFont);
  }

  fill(PLATFORM_TEXT_RGB[0], PLATFORM_TEXT_RGB[1], PLATFORM_TEXT_RGB[2], 255);
  textStyle(NORMAL);

  let hintSize = platformText.loadingHint.size;
  let hintLeading = platformText.loadingHint.leading;
  let hintWordGap = platformText.loadingHint.wordGapScale;
  let hintMaxW = platformW - mx(34) * 2;
  textSize(hintSize);
  let hintLines = platformWrapTextLines(
    platformText.loadingHint.text,
    hintMaxW,
    hintWordGap
  );
  let hintBlockH = (hintLines.length - 1) * hintLeading + hintSize;
  let hintY = platformText.loadingHint.y;

  platformDrawWrappedCenterText(
    platformText.loadingHint.text,
    platformW / 2,
    hintY,
    hintMaxW,
    hintLeading,
    hintWordGap
  );

  platformDrawPosterFadeOverlay();
}

function platformStartLoadingForAnimal(animalId) {
  platformLoadingTargetAnimal = animalId;
  platformMode = "loading";
  platformLoadingStartTime = null;
}

function platformHandleIntroPress(x, y) {
  if (platformIntroTransitionActive) {
    return false;
  }

  // Expand triangles for easier taps on iPhone.
  let pad = ms(32);

  for (let i = 0; i < platformAnimals.length; i++) {
    let pts = platformGetAnimatedTrianglePoints(i);
    let cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
    let cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
    let grow = (p) => {
      let dx = p[0] - cx;
      let dy = p[1] - cy;
      let len = Math.hypot(dx, dy) || 1;
      return [p[0] + (dx / len) * pad, p[1] + (dy / len) * pad];
    };
    let g0 = grow(pts[0]);
    let g1 = grow(pts[1]);
    let g2 = grow(pts[2]);

    if (platformPointInTriangle(x, y, g0, g1, g2)) {
      // Play select FIRST in the gesture, then start zoom slightly later so
      // the sound attack and zoom feel locked together.
      platformPlayIntroSelectSound();
      platformIntroTransitionSnapshot = {
        pts: [
          [pts[0][0], pts[0][1]],
          [pts[1][0], pts[1][1]],
          [pts[2][0], pts[2][1]]
        ],
        cx,
        cy,
        startScale: platformIntroHover === i ? 1.035 : 1,
        zoomScale: platformGetIntroZoomScale(pts, cx, cy)
      };
      platformIntroTransitionActive = true;
      platformIntroTransitionIndex = i;
      platformIntroTransitionStart = millis() + platformIntroTransitionSoundLeadMs;
      return true;
    }
  }
  return false;
}

function platformEaseInOutSine(x) {
  x = constrain(x, 0, 1);
  return -(cos(PI * x) - 1) / 2;
}

function platformEaseOutCubic(x) {
  x = constrain(x, 0, 1);
  return 1 - pow(1 - x, 3);
}

function platformDrawPosterFadeOverlay() {
  if (platformPosterFadeStartTime === null) {
    return;
  }

  let elapsed = millis() - platformPosterFadeStartTime;
  let t = constrain(elapsed / platformPosterFadeDuration, 0, 1);
  let a = map(t, 0, 1, 255, 0);

  if (a <= 0) {
    platformPosterFadeStartTime = null;
    platformPosterFadeDuration = 320;
    return;
  }

  noStroke();
  let fadeC = color(platformPosterFadeColor || "#F0E8DC");
  fill(red(fadeC), green(fadeC), blue(fadeC), a);
  rect(0, 0, width, height);
}
function platformTriggerCorrectFeedback(animalId) {
  let p = posterRegistry[animalId];
  if (!p) return;
  // 1st correct → correct.wav, 2nd → correct2.wav, 3rd → great success only (complete).
  let step = p.clickCount;
  let finalStep = p.cfg?.finalClickCount || 3;
  if (step === 1) {
    platformPlaySfx("correct");
  } else if (step === 2 && step < finalStep) {
    platformPlaySfx("correct2");
  }
  p.pulse.positive = 35;
  p.pulse.wrongSide = "";
  p.pulse.wrongShake = 0;
  p.pulse.pieceShake = 0;
  p.pulse.pieceShakeKind = "";
  p.feedback.text = "";
  p.feedback.good = true;
  p.feedback.timer = 0;
}

function platformVibrateWrongAnswer() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate([35, 25, 35, 25, 35, 25, 35]);
  }
}

function platformUpdateFeedbackTimers(animalId) {
  let p = posterRegistry[animalId];
  if (!p) return;
  if (p.pulse.positive > 0) p.pulse.positive--;
  if (p.pulse.wrongShake > 0) p.pulse.wrongShake--;
  if (p.pulse.pieceShake > 0) p.pulse.pieceShake--;
}

function platformGetPieceShakeOffset(p) {
  if (
    !p?.pulse?.pieceShake ||
    p.pulse.pieceShake <= 0 ||
    p.pulse.pieceShakeKind !== "bad"
  ) {
    return { x: 0, y: 0, rot: 0 };
  }

  let t = p.pulse.pieceShake;
  let decay = map(t, 42, 0, 1, 0.2);

  return {
    x: sin(t * 1.12) * ms(10) * decay,
    y: cos(t * 0.94) * ms(7) * decay,
    rot: sin(t * 1.02) * 0.02 * decay
  };
}

function platformGetWrongShakeX(animalId, side) {
  let p = posterRegistry[animalId];
  if (!p || p.pulse.wrongShake <= 0 || p.pulse.wrongSide !== side) {
    return 0;
  }
  return sin(p.pulse.wrongShake * 0.85) * 2;
}

function platformPointInTriangle(px, py, a, b, c) {
  let area = abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]));
  let area1 = abs((a[0] - px) * (b[1] - py) - (b[0] - px) * (a[1] - py));
  let area2 = abs((b[0] - px) * (c[1] - py) - (c[0] - px) * (b[1] - py));
  let area3 = abs((c[0] - px) * (a[1] - py) - (a[0] - px) * (c[1] - py));
  return abs(area - (area1 + area2 + area3)) < 0.5;
}

function platformGetViewportSize() {
  if (typeof window === "undefined") {
    return { w: platformW, h: platformH };
  }

  let w = window.innerWidth;
  let h = window.innerHeight;

  if (window.visualViewport) {
    let vv = window.visualViewport;
    w = vv.width;
    h = vv.height;
  }

  return { w, h };
}

const PLATFORM_FEEDBACK_REF_Y = {
  turtle: 690,
  eagle: 690,
  deer: 700,
  toad: 690,
  hyena: 700
};

const PLATFORM_POSTER_Y_REFS = {
  turtle: { glowCy: 400, compTop: 96, compBottom: 698 },
  eagle: { compTop: 100, scatterTop: 208, headerFloorInit: 128, headerFloorAdjust: 200 },
  deer: { glowCy: 430, compTop: 96, compBottom: 698 },
  toad: { compTop: 96, compBottom: 698 },
  hyena: {}
};

function platformGetLayoutYTighten() {
  let vp = platformGetViewportSize();
  let scale = vp.w / platformW;
  let scaledCanvasH = platformH * scale;
  if (vp.h >= scaledCanvasH * 0.985) {
    return 1;
  }
  // Scale Y from the top — keeps header up and footer down without
  // collapsing everything toward the vertical center.
  return vp.h / scaledCanvasH;
}

function platformUpdateViewportFit() {
  let vp = platformGetViewportSize();
  // Uniform width-fill scale — no stretching, no side letterboxing.
  platformScreenScale = vp.w / platformW;
  platformScreenScaleX = platformScreenScale;
  platformScreenScaleY = platformScreenScale;
}

function platformLayoutY(refY) {
  return my(refY) * platformGetLayoutYTighten();
}

function platformGetQuestionUiKeepOutTop() {
  // Forbidden zone starts at the question title, not the choice row — otherwise
  // loose triangles can sit on "What would you choose?".
  return (
    platformText.questionTitle.y +
    POSTER_LAYOUT.questionTitleNudgeY -
    ms(14)
  );
}

function platformApplyPosterViewportLayouts() {
  let belowHeader = posterGetBelowHeaderNudgeY();
  POSTER_LAYOUT.looseDefaultTop = platformLayoutY(120) + belowHeader;
  POSTER_LAYOUT.looseDefaultBottom = platformLayoutY(720) + belowHeader;
  POSTER_LAYOUT.choiceKeepOutTop = platformGetQuestionUiKeepOutTop();
  POSTER_LAYOUT.eagleScatterTop = platformLayoutY(208) + belowHeader;
  POSTER_LAYOUT.eagleHeaderFloorInit = platformLayoutY(128) + belowHeader;
  POSTER_LAYOUT.eagleHeaderFloorAdjust = platformLayoutY(200) + belowHeader;

  for (let id in posterRegistry) {
    let p = posterRegistry[id];
    let refs = PLATFORM_POSTER_Y_REFS[id];
    if (!p || !refs) {
      continue;
    }

    if (p.cfg.glow && refs.glowCy != null) {
      p.cfg.glow.cy = platformLayoutY(refs.glowCy) + belowHeader;
    }

    let composition = p.cfg.loosePiece && p.cfg.loosePiece.composition;
    if (composition && refs.compTop != null) {
      composition.top = platformLayoutY(refs.compTop) + belowHeader;
      composition.bottom =
        refs.compBottom != null
          ? platformLayoutY(refs.compBottom) + belowHeader
          : platformGetQuestionUiKeepOutTop() - ms(24);
    }

    let keepOut = p.cfg.loosePiece && p.cfg.loosePiece.choiceKeepOut;
    if (keepOut) {
      keepOut.top = platformGetQuestionUiKeepOutTop();
      keepOut.bottom = platformH;
    }
  }
}

function platformApplyViewportLayout() {
  platformUpdateViewportFit();

  platformText.introTitle.y = platformLayoutY(110) + ms(20) + INTRO_SCREEN_NUDGE_Y;
  platformText.introHint.y = platformLayoutY(620) + ms(160) + INTRO_SCREEN_NUDGE_Y;
  platformText.loadingHint.y = platformLayoutY(560) - ms(120);
  platformApplyChoiceLayoutMetrics();
  POSTER_LAYOUT.headerLineY = platformLayoutY(60) + ms(20);
  POSTER_LAYOUT.headerTextY = platformLayoutY(34) + ms(5) + ms(20);
  // Keep the choice block where it already sat, and place the question
  // title directly above it.
  let questionBlockBottom =
    platformLayoutY(920) +
    POSTER_LAYOUT.questionPhaseNudgeY +
    platformGetSafariQuestionNudgeY() +
    posterGetBelowHeaderNudgeY();
  POSTER_LAYOUT.choiceY =
    questionBlockBottom - POSTER_LAYOUT.choiceH - ms(35);
  platformText.questionTitle.y =
    POSTER_LAYOUT.choiceY -
    platformText.questionTitle.leading -
    ms(14);
  POSTER_LAYOUT.answerTop = platformLayoutY(715) + posterGetBelowHeaderNudgeY();
  POSTER_LAYOUT.footerTop = platformLayoutY(882) + posterGetBelowHeaderNudgeY();
  POSTER_LAYOUT.finalTextCenterOffset = platformLayoutY(24);

  for (let id in PLATFORM_FEEDBACK_REF_Y) {
    let p = posterRegistry[id];
    if (p && p.cfg && p.cfg.feedback) {
      p.cfg.feedback.y =
        platformLayoutY(PLATFORM_FEEDBACK_REF_Y[id]) + posterGetBelowHeaderNudgeY();
    }
  }

  platformApplyPosterViewportLayouts();

  let tighten = platformGetLayoutYTighten();
  if (abs(tighten - platformLastLayoutTighten) > 0.001) {
    platformLastLayoutTighten = tighten;
    platformClearSharedPosterCaches();
  }

  platformFitCanvasToScreen();
}

function platformBindViewportListeners() {
  if (typeof window === "undefined") {
    return;
  }

  let update = () => {
    platformApplyViewportLayout();
    platformClearSharedPosterCaches();
    for (let id in posterRegistry) {
      let p = posterRegistry[id];
      if (p && (p.leftBox || p.rightBox)) {
        posterRefreshChoiceBoxes(p);
      }
    }
  };

  window.addEventListener("resize", update);
  window.addEventListener("orientationchange", update);

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", update);
    window.visualViewport.addEventListener("scroll", update);
  }
}

function platformFitCanvasToScreen() {
  let cnv = document.querySelector("canvas");
  if (!cnv) {
    return;
  }

  let cssW = platformW * platformScreenScale;
  let cssH = platformH * platformScreenScale;

  cnv.style.width = cssW + "px";
  cnv.style.height = cssH + "px";
  cnv.style.display = "block";
  cnv.style.position = "fixed";
  cnv.style.backgroundColor = "#ffffff";
  cnv.style.setProperty("background-color", "#ffffff", "important");
  cnv.style.setProperty("forced-color-adjust", "none", "important");
  cnv.style.setProperty("-webkit-forced-color-adjust", "none", "important");
  cnv.style.margin = "0";
  cnv.style.transform = "none";

  if (typeof window !== "undefined" && window.visualViewport) {
    let vv = window.visualViewport;
    cnv.style.left = vv.offsetLeft + (vv.width - cssW) / 2 + "px";
    // Center when the canvas fits; when taller than the visible area, pin to the
    // visual top so Chrome does not center-crop the header. Layout tuck handles
    // the footer on short viewports.
    if (cssH > vv.height + 0.5) {
      let chromeInset = max(
        0,
        window.innerHeight - vv.height - vv.offsetTop
      );
      cnv.style.top = vv.offsetTop + min(chromeInset, 10) + "px";
    } else {
      cnv.style.top = vv.offsetTop + (vv.height - cssH) / 2 + "px";
    }
  } else {
    cnv.style.left = "50%";
    cnv.style.top = "50%";
    cnv.style.transform = "translate(-50%, -50%)";
  }
}


// =====================================================
// SHARED LOOSE-PIECE PHYSICS
// Scatter, assemble, repel, and wrong-answer fall for all animals.
// =====================================================

const platformChoiceStages = [
  {
    left: { img: "plasticBag", label: "Plastic bag" },
    right: { img: "fabricBag", label: "Fabric bag" }
  },
  {
    left: { img: "plasticBottle", label: "Plastic bottle" },
    right: { img: "reusableBottle", label: "Reusable bottle" }
  },
  {
    left: { img: "plasticFork", label: "Disposable cutlery" },
    right: { img: "reusableFork", label: "Reusable cutlery" }
  }
];

function platformInvokeAnimal(method) {
  let handler = platformAnimalHandlers[platformMode];
  if (handler && handler[method]) {
    return handler[method]();
  }
}

function platformSmoothStep(edge0, edge1, x) {
  let t = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

const platformLooseTargetCache = {};
const platformLooseGroupBBoxCache = {};
const platformPelobatesTargetCache = {};
let platformLooseRepelFrameCache = null;
// Persistent connected-group union bboxes (assembled pose), keyed by cfg+group.
// Invalidated only when the viewport size changes.
let platformLooseConnectedUnionCache = {};
let platformLooseConnectedUnionCacheKey = "";
const platformLooseLayoutVersion = 97;
const PLATFORM_LOOSE_ROT_PAD = 24;
const PLATFORM_LOOSE_STROKE_PAD = 3;
// Reused across hot-path bbox queries to avoid GC hitch on Android Chrome.
const platformLooseBBoxScratch = { left: 0, right: 0, top: 0, bottom: 0 };
const platformLooseBBoxScratch2 = { left: 0, right: 0, top: 0, bottom: 0 };
const platformLoosePtScratchA = { x: 0, y: 0 };
const platformLoosePtScratchB = { x: 0, y: 0 };
const platformLoosePtScratchC = { x: 0, y: 0 };
const platformLoosePtScratchD = { x: 0, y: 0 };

function platformLooseAnchorToGeo(anchor) {
  return {
    minDx: anchor.dx,
    maxDx: anchor.dx,
    minDy: anchor.dy,
    maxDy: anchor.dy
  };
}

function platformLooseGetPlacementAnchor(opts, index) {
  if (opts.pieceAnchors && opts.pieceAnchors[index]) {
    return platformLooseAnchorToGeo(opts.pieceAnchors[index]);
  }

  return platformLooseGetGeoForIndex(opts, index);
}

function platformLooseLayoutPlacementGeo(opts, index) {
  if (opts.cfg) {
    let pieceGeo = platformLooseGetPieceGeo(opts.cfg, index);
    if (pieceGeo) {
      return pieceGeo;
    }
  }

  if (opts.placement === "bbox") {
    return platformLooseGetPlacementAnchor(opts, index);
  }

  return null;
}
const PLATFORM_LOOSE_FLOAT_AMP = 14;

// ------------------------------------------------------------------
// LOOSE PIECE SYSTEM
// Tune each poster via cfg.loosePiece — three independent stages:
//   1. layout   — where pieces start (spiral or zone fill)
//   2. bounds   — keep full triangle inside composition rect
//   3. motion   — wobble + assemble lerp (platformApplyLoosePieceTransform)
// ------------------------------------------------------------------

function platformLooseDefaultComposition() {
  return {
    left: mx(16),
    right: platformW - mx(16),
    top: platformLayoutY(120),
    bottom: platformLayoutY(720),
    pad: ms(4),
    edgePad: ms(12)
  };
}

function platformLooseResolveProfile(cfg) {
  let lp = cfg.loosePiece || {};

  return {
    pivot: lp.pivot || cfg.loosePivot || { x: 500, y: 500 },
    scatter: lp.scatter || cfg.looseScatter || { x: 0, y: 0 },
    composition:
      lp.composition ||
      cfg.looseScatterZone ||
      platformLooseDefaultComposition(),
    layout: {
      type: "spiral",
      spreadX: 340,
      spreadY: 230,
      centerY: -55,
      radiusMin: 0.42,
      radiusMax: 0.86,
      downwardPull: 0,
      angleOffset: 0,
      groupSpread: 0.1,
      groupBias: {},
      ...(lp.layout || cfg.looseLayout || {})
    },
    groupGeo: lp.groupGeo || cfg.looseGroupGeo || null,
    pieceGeo: lp.pieceGeo || null,
    pieceAnchors: lp.pieceAnchors || null,
    drawTransform: lp.drawTransform || null,
    floatAmp: lp.floatAmp ?? PLATFORM_LOOSE_FLOAT_AMP,
    rotationPad: lp.rotationPad ?? PLATFORM_LOOSE_ROT_PAD,
    assembleClearance: lp.assembleClearance ?? ms(18),
    useZonePush: lp.useZonePush ?? false,
    zonePushPad: lp.zonePushPad ?? 0,
    zonePushBlend: lp.zonePushBlend ?? 1,
    zonePushMax: lp.zonePushMax ?? 0,
    homeMaxDisp: lp.homeMaxDisp ?? 0,
    choiceKeepOut: lp.choiceKeepOut ?? null,
    looseRepelFollow: lp.looseRepelFollow ?? 0.12,
    looseRepelStepMax: lp.looseRepelStepMax ?? 0,
    zonePushStepMax: lp.zonePushStepMax ?? 0,
    zonePushRuntime: lp.zonePushRuntime ?? true,
    dampenWobbleNearBody: lp.dampenWobbleNearBody ?? true,
    hyenaStyleRepel: lp.hyenaStyleRepel ?? false,
    assembledScreenLift: lp.assembledScreenLift ?? 0,
    assembledHomeNudgeY: lp.assembledHomeNudgeY ?? 0
  };
}

function platformLooseClearHomeFromAllZones(cfg, offsetX, offsetY, index) {
  let zones = cfg.assembleZones;

  if (!zones || !platformLooseGetProfile(cfg).useZonePush) {
    return { x: offsetX, y: offsetY };
  }

  let fakeState = {
    cfg,
    tGroup: [1, 1, 1, 1]
  };
  let cleared = platformLoosePushFromAssembleZones(
    fakeState,
    -1,
    offsetX,
    offsetY,
    0,
    index
  );

  let kept = platformLoosePushFromChoiceKeepOut(cfg, cleared.x, cleared.y, index, 0);

  return platformLooseClampTargetAboveChoice(cfg, kept.x, kept.y, index, 0);
}

function platformLooseScreenPadToMesh(screenPad, cfg) {
  let dt = platformLooseGetDrawTransform(cfg);
  return screenPad / max(abs(dt.scaleX), abs(dt.scaleY), 0.001);
}

function platformGetLoosePositivePulseScale(p, pieceT) {
  if (!p.pulse || p.pulse.positive <= 0) {
    return 1;
  }

  if (pieceT >= platformAssembledDrawThreshold) {
    return 1;
  }

  return 1 + sin(map(p.pulse.positive, 35, 0, 0, PI)) * 0.025;
}

function platformLooseMeshCorners(cfg, offsetX, offsetY, index, rot = 0) {
  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let geo = platformLooseGetBoundsGeo(cfg, index);

  if (!geo) {
    return [{ x: pivot.x + offsetX, y: pivot.y + offsetY }];
  }

  let geoCorners = [
    [geo.minDx, geo.minDy],
    [geo.maxDx, geo.minDy],
    [geo.minDx, geo.maxDy],
    [geo.maxDx, geo.maxDy]
  ];
  let corners = [];

  for (let i = 0; i < geoCorners.length; i++) {
    let dx = geoCorners[i][0];
    let dy = geoCorners[i][1];
    let rx = dx * cos(rot) - dy * sin(rot);
    let ry = dx * sin(rot) + dy * cos(rot);
    corners.push({
      x: pivot.x + offsetX + rx,
      y: pivot.y + offsetY + ry
    });
  }

  return corners;
}

function platformLooseEllipsePenetration(px, py, zone, padMesh) {
  let influence = zone.influence ?? 1;
  let rx = zone.rx * influence + padMesh;
  let ry = zone.ry * influence + padMesh;
  let nx = (px - zone.cx) / rx;
  let ny = (py - zone.cy) / ry;
  let d2 = nx * nx + ny * ny;

  if (d2 >= 1) {
    return { dx: 0, dy: 0, depth: 0 };
  }

  let d = sqrt(max(d2, 0.000001));
  nx /= d;
  ny /= d;

  return {
    dx: zone.cx + nx * rx - px,
    dy: zone.cy + ny * ry - py,
    depth: 1 - d
  };
}

function platformLooseMeshPointEllipseClearance(px, py, zone, padMesh) {
  let influence = zone.influence ?? 1;
  let rx = zone.rx * influence + padMesh;
  let ry = zone.ry * influence + padMesh;
  let nx = (px - zone.cx) / rx;
  let ny = (py - zone.cy) / ry;
  let d = sqrt(nx * nx + ny * ny);

  if (d <= 1) {
    return 0;
  }

  return (d - 1) * min(rx, ry);
}

function platformLoosePushFromAssembleZones(p, pieceGroup, offsetX, offsetY, rot, index) {
  let cfg = p.cfg;
  let zones = cfg.assembleZones;

  if (!zones) {
    return { x: offsetX, y: offsetY };
  }

  let profile = platformLooseGetProfile(cfg);
  let padMesh = platformLooseScreenPadToMesh(
    profile.assembleClearance + profile.floatAmp * 1.1 + ms(3) + profile.zonePushPad,
    cfg
  );
  let pivot = profile.pivot;
  let ox = offsetX;
  let oy = offsetY;

  for (let iter = 0; iter < 8; iter++) {
    let bestDepth = 0;
    let bestDx = 0;
    let bestDy = 0;

    for (let g = 0; g < zones.length; g++) {
      if (g === pieceGroup) {
        continue;
      }

      let assemblerWeight = platformLooseAssemblerRepelWeight(p.tGroup[g]);

      if (assemblerWeight <= 0) {
        continue;
      }

      let zone = zones[g];
      let corners = platformLooseMeshCorners(cfg, ox, oy, index, rot);
      corners.push({ x: pivot.x + ox, y: pivot.y + oy });

      for (let ci = 0; ci < corners.length; ci++) {
        let pen = platformLooseEllipsePenetration(
          corners[ci].x,
          corners[ci].y,
          zone,
          padMesh
        );

        if (pen.depth > bestDepth) {
          bestDepth = pen.depth;
          bestDx = pen.dx;
          bestDy = pen.dy;
        }
      }
    }

    if (bestDepth <= 0.0001) {
      break;
    }

    ox += bestDx * 0.9;
    oy += bestDy * 0.9;
  }

  let blend = profile.zonePushBlend ?? 1;

  return {
    x: lerp(offsetX, ox, blend),
    y: lerp(offsetY, oy, blend)
  };
}

function platformLoosePieceOverlapsAssembleZones(
  p,
  pieceGroup,
  offsetX,
  offsetY,
  index,
  rot,
  cfg
) {
  let zones = cfg.assembleZones;

  if (!zones) {
    return false;
  }

  let profile = platformLooseGetProfile(cfg);
  let padMesh = platformLooseScreenPadToMesh(
    profile.assembleClearance + ms(2),
    cfg
  );
  let pivot = profile.pivot;
  let corners = platformLooseMeshCorners(cfg, offsetX, offsetY, index, rot);
  corners.push({ x: pivot.x + offsetX, y: pivot.y + offsetY });

  for (let g = 0; g < zones.length; g++) {
    if (g === pieceGroup) {
      continue;
    }

    if (platformLooseAssemblerRepelWeight(p.tGroup[g]) <= 0) {
      continue;
    }

    for (let ci = 0; ci < corners.length; ci++) {
      let pen = platformLooseEllipsePenetration(
        corners[ci].x,
        corners[ci].y,
        zones[g],
        padMesh
      );

      if (pen.depth > 0.002) {
        return true;
      }
    }
  }

  return false;
}

function platformLoosePushFromChoiceKeepOut(cfg, offsetX, offsetY, index, rot) {
  let profile = platformLooseGetProfile(cfg);
  let keepOut = profile.choiceKeepOut;

  if (!keepOut) {
    return { x: offsetX, y: offsetY };
  }

  let pivot = profile.pivot;
  let pad = keepOut.pad ?? ms(10);
  let forbid = {
    left: keepOut.left ?? mx(16),
    right: keepOut.right ?? platformW - mx(16),
    top: (keepOut.top ?? platformLayoutY(670)) + platformGetChoiceLayoutNudgeY(),
    bottom: keepOut.bottom ?? platformH
  };
  let ox = offsetX;
  let oy = offsetY;

  for (let iter = 0; iter < 6; iter++) {
    let looseBox = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot, true);
    let inflated = {
      left: forbid.left - pad,
      right: forbid.right + pad,
      top: forbid.top - pad,
      bottom: forbid.bottom + pad
    };

    if (!platformLooseBBoxOverlap(looseBox, inflated)) {
      break;
    }

    let sep = platformLooseSeparateBBox(looseBox, forbid, pad);

    if (sep.dx === 0 && sep.dy === 0) {
      break;
    }

    let screen = platformLooseMeshPointToScreen(pivot.x + ox, pivot.y + oy, cfg);
    let poster = platformScreenToAnimalRef(screen.x + sep.dx, screen.y + sep.dy);
    let mesh = platformLoosePosterRefToMesh(poster.x, poster.y, cfg);
    ox = mesh.x - pivot.x;
    oy = mesh.y - pivot.y;
  }

  return { x: ox, y: oy };
}

function platformLooseClampTargetAboveChoice(cfg, offsetX, offsetY, index, rot = 0) {
  let profile = platformLooseGetProfile(cfg);
  let keepOut = profile.choiceKeepOut;

  if (!keepOut) {
    return { x: offsetX, y: offsetY };
  }

  let pivot = profile.pivot;
  let ceilingScreenY =
    keepOut.top + platformGetChoiceLayoutNudgeY() - (keepOut.pad ?? ms(10)) - ms(6);
  let ox = offsetX;
  let oy = offsetY;

  for (let iter = 0; iter < 14; iter++) {
    let box = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot, true);

    if (box.bottom <= ceilingScreenY) {
      break;
    }

    let dyScreen = box.bottom - ceilingScreenY;
    let anchorScreen = platformLooseMeshPointToScreen(pivot.x + ox, pivot.y + oy, cfg);
    let liftedPoster = platformScreenToAnimalRef(
      anchorScreen.x,
      anchorScreen.y - dyScreen
    );
    let liftedMesh = platformLoosePosterRefToMesh(liftedPoster.x, liftedPoster.y, cfg);
    ox = liftedMesh.x - pivot.x;
    oy = liftedMesh.y - pivot.y;
  }

  return { x: ox, y: oy };
}

function platformLooseShiftTargetScreen(target, dxScreen, dyScreen, cfg) {
  let pivot = platformLooseGetProfile(cfg).pivot;
  let anchorScreen = platformLooseMeshPointToScreen(
    pivot.x + target.x,
    pivot.y + target.y,
    cfg
  );
  let shiftedPoster = platformScreenToAnimalRef(
    anchorScreen.x + dxScreen,
    anchorScreen.y + dyScreen
  );
  let shiftedMesh = platformLoosePosterRefToMesh(
    shiftedPoster.x,
    shiftedPoster.y,
    cfg
  );

  return {
    x: shiftedMesh.x - pivot.x,
    y: shiftedMesh.y - pivot.y
  };
}

function platformLooseGetPieceRot(cfg, index) {
  let p = posterRegistry[cfg.id];
  return p?.pieceOffsets?.[index]?.rot || 0;
}

function platformLooseFitTargetToScreenPoint(
  cfg,
  index,
  goalSx,
  goalSy,
  initial = { x: 0, y: 0 }
) {
  let guess = { x: initial.x, y: initial.y };
  let rot = platformLooseGetPieceRot(cfg, index);

  for (let iter = 0; iter < 20; iter++) {
    let box = platformLoosePieceScreenBBox(cfg, guess.x, guess.y, index, rot, true);
    let cx = (box.left + box.right) * 0.5;
    let cy = (box.top + box.bottom) * 0.5;
    let dx = goalSx - cx;
    let dy = goalSy - cy;

    if (abs(dx) < 0.35 && abs(dy) < 0.35) {
      break;
    }

    guess = platformLooseShiftTargetScreen(guess, dx, dy, cfg);
  }

  return guess;
}

function platformLooseNudgeTargetBBoxCenter(target, goalSx, goalSy, blend, cfg, index, rot = null) {
  if (rot === null) {
    rot = platformLooseGetPieceRot(cfg, index);
  }

  let box = platformLoosePieceScreenBBox(cfg, target.x, target.y, index, rot, true);
  let pieceCx = (box.left + box.right) * 0.5;
  let pieceCy = (box.top + box.bottom) * 0.5;

  return platformLooseShiftTargetScreen(
    target,
    (goalSx - pieceCx) * blend,
    (goalSy - pieceCy) * blend,
    cfg
  );
}

function platformLooseScatterUVForIndex(index, count, opts = {}) {
  const GOLDEN_ANGLE = PI * (3 - sqrt(5));
  let coreCount = min(opts.coreCount ?? 31, count);
  let angle = index * GOLDEN_ANGLE + (opts.angleOffset ?? 0.35);
  let radius;

  if (index < coreCount) {
    let t = (index + 0.5) / coreCount;
    radius =
      (opts.coreInner ?? 0.02) +
      pow(t, opts.corePow ?? 0.5) * (opts.coreOuter ?? 0.16);
  } else {
    let t = (index - coreCount + 0.5) / max(1, count - coreCount);
    radius =
      (opts.outerInner ?? 0.07) +
      pow(t, opts.outerPow ?? 0.44) * (opts.outerOuter ?? 0.38);
  }

  let centerU = opts.centerU ?? 0.5;
  let centerV = opts.centerV ?? 0.44;
  let radiusScaleX = opts.radiusScaleX ?? 1.02;
  let radiusScaleY = opts.radiusScaleY ?? 0.92;

  return {
    u: constrain(
      centerU + cos(angle) * radius * radiusScaleX,
      opts.uMin ?? 0.06,
      opts.uMax ?? 0.94
    ),
    v: constrain(
      centerV + sin(angle) * radius * radiusScaleY,
      opts.vMin ?? 0.10,
      opts.vMax ?? 0.78
    )
  };
}

function platformGetEagleScatterCeilingScreenY() {
  return (
    platformGetQuestionUiKeepOutTop() +
    platformGetChoiceLayoutNudgeY() -
    ms(16)
  );
}

function platformLooseCircularGoalScreen(index, count, cfg, layout = {}) {
  let zone = layout.zone || platformLooseGetProfile(cfg).composition;
  let pad = ms(8);
  let left = zone.left + pad;
  let right = zone.right - pad;
  let top = zone.top + pad;
  let bottom = zone.bottom - pad;

  if (cfg.id === "deer" || cfg.id === "turtle" || cfg.id === "toad") {
    top = zone.top + ms(4);
    bottom =
      min(zone.bottom - ms(4), POSTER_LAYOUT.choiceY - ms(28)) +
      platformGetChoiceLayoutNudgeY();
  } else if (cfg.id === "eagle") {
    top = zone.top - ms(4);
    bottom = platformGetEagleScatterCeilingScreenY() - ms(4);
  } else {
    bottom =
      min(bottom, POSTER_LAYOUT.choiceY - ms(72)) +
      platformGetChoiceLayoutNudgeY();
  }

  let uv = platformLooseScatterUVForIndex(index, count, layout);
  let shiftX = layout.screenShift?.x || 0;
  let shiftY = layout.screenShift?.y || 0;

  return {
    x: lerp(left, right, uv.u) + shiftX,
    y: lerp(top, bottom, uv.v) + shiftY
  };
}

function platformLooseSeparateScatterTargets(
  targets,
  cfg,
  gap = ms(22),
  maxIter = 48,
  pushStrength = 0.52
) {
  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;

    for (let a = 0; a < targets.length; a++) {
      for (let b = a + 1; b < targets.length; b++) {
        let rotA = platformLooseGetPieceRot(cfg, a);
        let rotB = platformLooseGetPieceRot(cfg, b);
        let boxA = platformLoosePieceScreenBBox(
          cfg,
          targets[a].x,
          targets[a].y,
          a,
          rotA,
          true
        );
        let cxA = (boxA.left + boxA.right) * 0.5;
        let cyA = (boxA.top + boxA.bottom) * 0.5;
        let rA = max(boxA.right - boxA.left, boxA.bottom - boxA.top) * 0.5;
        let boxB = platformLoosePieceScreenBBox(
          cfg,
          targets[b].x,
          targets[b].y,
          b,
          rotB,
          true
        );
        let cxB = (boxB.left + boxB.right) * 0.5;
        let cyB = (boxB.top + boxB.bottom) * 0.5;
        let rB = max(boxB.right - boxB.left, boxB.bottom - boxB.top) * 0.5;
        let dx = cxA - cxB;
        let dy = cyA - cyB;
        let dist = max(sqrt(dx * dx + dy * dy), 0.01);
        let need = rA + rB + gap;

        if (dist >= need) {
          continue;
        }

        let push = ((need - dist) / dist) * pushStrength;
        targets[a] = platformLooseShiftTargetScreen(
          targets[a],
          dx * push,
          dy * push,
          cfg
        );
        targets[b] = platformLooseShiftTargetScreen(
          targets[b],
          -dx * push,
          -dy * push,
          cfg
        );
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }
}

function platformLooseCircularAdjustLooseTargets(targets, cfg) {
  let layout = platformLooseGetProfile(cfg).layout;
  let count = targets.length;
  let scatterGap = layout.scatterGap ?? ms(22);
  let recallBlend = layout.goalRecallBlend ?? 0.85;

  for (let i = 0; i < count; i++) {
    let goal = platformLooseCircularGoalScreen(i, count, cfg, layout);
    targets[i] = platformLooseNudgeTargetBBoxCenter(
      targets[i],
      goal.x,
      goal.y,
      1,
      cfg,
      i
    );
  }

  platformLooseSeparateScatterTargets(targets, cfg, scatterGap, 48, 0.52);

  for (let i = 0; i < count; i++) {
    let goal = platformLooseCircularGoalScreen(i, count, cfg, layout);
    targets[i] = platformLooseNudgeTargetBBoxCenter(
      targets[i],
      goal.x,
      goal.y,
      recallBlend,
      cfg,
      i
    );
  }

  platformLooseSeparateScatterTargets(targets, cfg, scatterGap, 40, 0.52);

  for (let i = 0; i < count; i++) {
    let goal = platformLooseCircularGoalScreen(i, count, cfg, layout);
    targets[i] = platformLooseFitTargetToScreenPoint(
      cfg,
      i,
      goal.x,
      goal.y,
      targets[i]
    );
  }

  if (cfg.id === "eagle") {
    let ceilingScreenY = platformGetEagleScatterCeilingScreenY();
    let headerFloor = POSTER_LAYOUT.eagleHeaderFloorInit;

    for (let i = 0; i < targets.length; i++) {
      let rot = platformLooseGetPieceRot(cfg, i);
      let box = platformLoosePieceScreenBBox(
        cfg,
        targets[i].x,
        targets[i].y,
        i,
        rot,
        true
      );

      if (box.top < headerFloor) {
        targets[i] = platformLooseShiftTargetScreen(
          targets[i],
          0,
          headerFloor - box.top,
          cfg
        );
      }

      box = platformLoosePieceScreenBBox(cfg, targets[i].x, targets[i].y, i, rot, true);

      if (box.bottom > ceilingScreenY) {
        targets[i] = platformLooseShiftTargetScreen(
          targets[i],
          0,
          ceilingScreenY - box.bottom,
          cfg
        );
      }
    }
  }
}

function eagleClampTargetOnCanvas(target, cfg, index, rot = 0) {
  let inset = mx(10);
  let left = inset;
  let right = platformW - inset;
  let top = POSTER_LAYOUT.eagleHeaderFloorAdjust;
  let bottom = platformGetEagleScatterCeilingScreenY();
  let ox = target.x;
  let oy = target.y;

  for (let iter = 0; iter < 10; iter++) {
    let box = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot, true);
    let dx = 0;
    let dy = 0;

    if (box.left < left) {
      dx += left - box.left;
    }
    if (box.right > right) {
      dx -= box.right - right;
    }
    if (box.top < top) {
      dy += top - box.top;
    }
    if (box.bottom > bottom) {
      dy -= box.bottom - bottom;
    }

    if (abs(dx) < 0.05 && abs(dy) < 0.05) {
      break;
    }

    let shifted = platformLooseShiftTargetScreen({ x: ox, y: oy }, dx, dy, cfg);
    ox = shifted.x;
    oy = shifted.y;
  }

  return { x: ox, y: oy };
}

function eagleAssignScatterSlots(targets, cfg) {
  let left = mx(28);
  let right = platformW - mx(28);
  let top = POSTER_LAYOUT.eagleScatterTop;
  let bottom = platformGetEagleScatterCeilingScreenY() - ms(8);
  // Keep UV slots inward so pieces don't spawn past the screen edges.
  let slotUV = [
    [0.78, 0.06], [0.90, 0.08], [0.66, 0.10], [0.86, 0.16],
    [0.12, 0.24], [0.24, 0.34], [0.10, 0.46], [0.20, 0.56], [0.14, 0.64], [0.26, 0.70],
    [0.88, 0.30], [0.78, 0.42], [0.90, 0.52], [0.80, 0.62],
    [0.34, 0.72], [0.50, 0.78], [0.22, 0.80], [0.68, 0.76], [0.44, 0.66]
  ];

  for (let i = 0; i < targets.length; i++) {
    let uv = slotUV[i] || [0.5, 0.5];
    let goalCx = lerp(left, right, uv[0]);
    let goalCy = lerp(top, bottom, uv[1]);

    targets[i] = platformLooseNudgeTargetBBoxCenter(
      targets[i],
      goalCx,
      goalCy,
      1,
      cfg,
      i
    );
  }
}

function eagleSeparateLooseTargets(targets, cfg) {
  let gap = ms(28);

  for (let iter = 0; iter < 56; iter++) {
    let moved = false;

    for (let a = 0; a < targets.length; a++) {
      for (let b = a + 1; b < targets.length; b++) {
        let boxA = platformLoosePieceScreenBBox(cfg, targets[a].x, targets[a].y, a, 0, true);
        let cxA = (boxA.left + boxA.right) * 0.5;
        let cyA = (boxA.top + boxA.bottom) * 0.5;
        let rA = max(boxA.right - boxA.left, boxA.bottom - boxA.top) * 0.5;
        let boxB = platformLoosePieceScreenBBox(cfg, targets[b].x, targets[b].y, b, 0, true);
        let cxB = (boxB.left + boxB.right) * 0.5;
        let cyB = (boxB.top + boxB.bottom) * 0.5;
        let rB = max(boxB.right - boxB.left, boxB.bottom - boxB.top) * 0.5;
        let dx = cxA - cxB;
        let dy = cyA - cyB;
        let dist = max(sqrt(dx * dx + dy * dy), 0.01);
        let need = rA + rB + gap;

        if (dist >= need) {
          continue;
        }

        let push = ((need - dist) / dist) * 0.5;
        let sx = dx * push;
        let sy = dy * push;

        targets[a] = platformLooseShiftTargetScreen(targets[a], sx, sy, cfg);
        targets[b] = platformLooseShiftTargetScreen(targets[b], -sx, -sy, cfg);
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }
}

function platformLooseScenarioTGroupFromClick(p) {
  let cc = p.clickCount;

  return [
    cc >= 1 ? 1 : 0,
    cc >= 2 ? 1 : 0,
    cc >= 3 ? 1 : 0,
    cc >= 3 ? 1 : 0
  ];
}

function platformLooseComputeRepelCleared(
  p,
  pieceGroup,
  offsetX,
  offsetY,
  rot,
  index,
  pieceT
) {
  let profile = platformLooseGetProfile(p.cfg);
  let cleared = platformLoosePushFromChoiceKeepOut(
    p.cfg,
    offsetX,
    offsetY,
    index,
    rot
  );

  if (p.cfg.getPieceGroup) {
    cleared = platformLooseRepelFromConnectedPieces(
      p,
      pieceGroup,
      cleared.x,
      cleared.y,
      rot,
      index,
      pieceT
    );

    cleared = platformLooseClearLooseFromConnectedBBox(
      cleared.x,
      cleared.y,
      p,
      pieceGroup,
      index,
      rot
    );
  } else if (profile.useZonePush && p.cfg.assembleZones) {
    cleared = platformLooseResolveClearOffset(
      p,
      pieceGroup,
      cleared.x,
      cleared.y,
      pieceT,
      index,
      0
    );
  } else {
    cleared = platformLooseRepelFromAssembledGroups(
      p,
      pieceGroup,
      cleared.x,
      cleared.y,
      0,
      index,
      pieceT
    );
  }

  return cleared;
}

function platformLooseOverlapsConnectedGroups(p, offsetX, offsetY, index, rot, pieceGroup) {
  let cfg = p.cfg;

  for (let g = 0; g < 4; g++) {
    if (g === pieceGroup || platformLooseAssemblerRepelWeight(p.tGroup[g]) <= 0) {
      continue;
    }

    let connectedBox = platformLooseGetConnectedGroupUnionBBox(p, g);

    if (!connectedBox) {
      continue;
    }

    let looseBox = platformLoosePieceScreenBBox(cfg, offsetX, offsetY, index, rot, true);
    let sep = platformLooseSeparateBBox(looseBox, connectedBox, ms(4));

    if (sep.dx !== 0 || sep.dy !== 0) {
      return true;
    }
  }

  return false;
}

function platformLooseTickRepelBlend(p) {
  if (p.looseRepelBlendT > 0) {
    let step = p.disassembleBoost > 0 ? 0.01 : 0.38;
    p.looseRepelBlendT = max(0, p.looseRepelBlendT - step);
  }
}

function deerClampTargetsToComposition(targets, cfg) {
  let pivot = platformLooseGetProfile(cfg).pivot;
  let p = posterRegistry[cfg.id];

  for (let i = 0; i < targets.length; i++) {
    let rot = p?.pieceOffsets?.[i]?.rot || 0;
    targets[i] = platformLooseFitTargetOffset(
      cfg,
      pivot,
      targets[i].x,
      targets[i].y,
      i,
      rot
    );
  }
}

function deerAssignScatterSlots(targets, cfg) {
  let zone = platformLooseGetProfile(cfg).composition;
  let left = zone.left + ms(8);
  let right = zone.right - ms(8);
  let top = zone.top + ms(8);
  let bottom =
    min(zone.bottom - ms(8), POSTER_LAYOUT.choiceY - ms(72)) +
    platformGetChoiceLayoutNudgeY();

  let slotUV = [
    [0.84, 0.44], [0.76, 0.52], [0.86, 0.58], [0.72, 0.40], [0.82, 0.36],
    [0.70, 0.48], [0.86, 0.48], [0.74, 0.60], [0.80, 0.66],
    [0.82, 0.24], [0.72, 0.20], [0.86, 0.28], [0.68, 0.24], [0.78, 0.16],
    [0.64, 0.20], [0.84, 0.14], [0.70, 0.14], [0.76, 0.30], [0.66, 0.32],
    [0.82, 0.20], [0.74, 0.28], [0.80, 0.24],
    [0.24, 0.76], [0.30, 0.84], [0.80, 0.82], [0.74, 0.88], [0.22, 0.88], [0.84, 0.76],
    [0.26, 0.72], [0.78, 0.72], [0.32, 0.80], [0.72, 0.80], [0.28, 0.84], [0.82, 0.84],
    [0.30, 0.68], [0.76, 0.68], [0.34, 0.74], [0.70, 0.74], [0.26, 0.66], [0.80, 0.66]
  ];

  for (let i = 0; i < targets.length; i++) {
    let uv = slotUV[i] || [0.5, 0.5];
    let goalCx = lerp(left, right, uv[0]);
    let goalCy = lerp(top, bottom, uv[1]);

    targets[i] = platformLooseNudgeTargetBBoxCenter(
      targets[i],
      goalCx,
      goalCy,
      1,
      cfg,
      i
    );
  }
}

function deerSeparateLooseTargets(targets, cfg) {
  let gap = ms(34);

  for (let iter = 0; iter < 64; iter++) {
    let moved = false;

    for (let a = 0; a < targets.length; a++) {
      for (let b = a + 1; b < targets.length; b++) {
        let boxA = platformLoosePieceScreenBBox(cfg, targets[a].x, targets[a].y, a, 0, true);
        let cxA = (boxA.left + boxA.right) * 0.5;
        let cyA = (boxA.top + boxA.bottom) * 0.5;
        let rA = max(boxA.right - boxA.left, boxA.bottom - boxA.top) * 0.5;
        let boxB = platformLoosePieceScreenBBox(cfg, targets[b].x, targets[b].y, b, 0, true);
        let cxB = (boxB.left + boxB.right) * 0.5;
        let cyB = (boxB.top + boxB.bottom) * 0.5;
        let rB = max(boxB.right - boxB.left, boxB.bottom - boxB.top) * 0.5;
        let dx = cxA - cxB;
        let dy = cyA - cyB;
        let dist = max(sqrt(dx * dx + dy * dy), 0.01);
        let need = rA + rB + gap;

        if (dist >= need) {
          continue;
        }

        let push = ((need - dist) / dist) * 0.55;
        targets[a] = platformLooseShiftTargetScreen(
          targets[a],
          dx * push,
          dy * push,
          cfg
        );
        targets[b] = platformLooseShiftTargetScreen(
          targets[b],
          -dx * push,
          -dy * push,
          cfg
        );
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }
}

function deerKeepLooseTargetsClearOfHead(targets, cfg) {
  let p = posterRegistry.deer;

  if (!p) {
    return;
  }

  let saved = p.tGroup.slice();
  p.tGroup = [1, 0, 0, 0];
  let headBox = platformLooseGetConnectedGroupUnionBBox(p, 0);
  p.tGroup = saved;

  if (!headBox) {
    return;
  }

  let floorY = headBox.bottom + ms(28);
  let keepRightX = headBox.right + ms(36);

  for (let i = 0; i < targets.length; i++) {
    let g = cfg.getPieceGroup(i);

    if (g === 0) {
      continue;
    }

    let box = platformLoosePieceScreenBBox(cfg, targets[i].x, targets[i].y, i, 0, true);

    if (box.left < keepRightX) {
      targets[i] = platformLooseShiftTargetScreen(
        targets[i],
        keepRightX - box.left,
        0,
        cfg
      );
    }

    box = platformLoosePieceScreenBBox(cfg, targets[i].x, targets[i].y, i, 0, true);

    if (g === 1 && box.top < floorY) {
      targets[i] = platformLooseShiftTargetScreen(
        targets[i],
        0,
        floorY - box.top,
        cfg
      );
    }
  }
}

function platformLooseClearLooseFromConnectedBBox(
  offsetX,
  offsetY,
  p,
  pieceGroup,
  index,
  rot
) {
  let cfg = p.cfg;
  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let ox = offsetX;
  let oy = offsetY;
  let clearPasses = 2;
  let scratch = platformLooseBBoxScratch;

  for (let pass = 0; pass < clearPasses; pass++) {
    let moved = false;

    for (let g = 0; g < 4; g++) {
      if (
        g === pieceGroup ||
        platformLooseAssemblerRepelWeight(platformLooseGetRepelGroupT(p, g)) <= 0
      ) {
        continue;
      }

      let connectedBox = platformLooseGetConnectedGroupUnionBBox(p, g);

      if (!connectedBox) {
        continue;
      }

      let gap = profile.hyenaStyleRepel ? ms(22) : ms(16);

      if (cfg.id === "toad") {
        gap = ms(36);
      }
      platformLoosePieceScreenBBoxInto(cfg, ox, oy, index, rot, true, scratch);
      let sep = platformLooseSeparateBBox(scratch, connectedBox, gap);

      if (sep.dx === 0 && sep.dy === 0) {
        continue;
      }

      moved = true;
      let shifted = platformLooseApplyScreenSepToMesh(
        cfg,
        pivot,
        ox,
        oy,
        sep.dx,
        sep.dy
      );
      ox = shifted.x;
      oy = shifted.y;
    }

    if (!moved) {
      break;
    }
  }

  return { x: ox, y: oy };
}

function deerAdjustLooseTargets(targets, cfg) {
  let p = posterRegistry.deer;

  if (!p || !cfg.getPieceGroup) {
    return;
  }

  deerAssignScatterSlots(targets, cfg);

  let pivot = platformLooseGetProfile(cfg).pivot;
  let scenarios = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 1, 1, 0]
  ];

  for (let s = 0; s < scenarios.length; s++) {
    let saved = p.tGroup.slice();
    p.tGroup = scenarios[s];

    for (let pass = 0; pass < 4; pass++) {
      for (let i = 0; i < targets.length; i++) {
        let g = cfg.getPieceGroup(i);

        if (platformLooseAssemblerRepelWeight(p.tGroup[g]) > 0) {
          continue;
        }

        let rot = p.pieceOffsets[i]?.rot || 0;
        let cleared = platformLooseRepelFromConnectedPieces(
          p,
          g,
          targets[i].x,
          targets[i].y,
          rot,
          i,
          0
        );
        cleared = platformLooseRepelFromConnectedPieces(
          p,
          g,
          cleared.x,
          cleared.y,
          rot,
          i,
          0
        );
        cleared = platformLooseClearLooseFromConnectedBBox(
          cleared.x,
          cleared.y,
          p,
          g,
          i,
          rot
        );
        targets[i] = platformLooseFitTargetOffset(
          cfg,
          pivot,
          cleared.x,
          cleared.y,
          i,
          rot
        );
      }
    }

    deerKeepLooseTargetsClearOfHead(targets, cfg);
    p.tGroup = saved;
  }

  deerSeparateLooseTargets(targets, cfg);
  deerKeepLooseTargetsClearOfHead(targets, cfg);

  for (let pass = 0; pass < 3; pass++) {
    deerKeepLooseTargetsClearOfHead(targets, cfg);
  }

  deerClampTargetsToComposition(targets, cfg);
}

function toadAssignScatterSlots(targets, cfg, blend = 1) {
  let zone = platformLooseGetProfile(cfg).composition;
  let left = zone.left + ms(8);
  let right = zone.right - ms(8);
  let top = zone.top + ms(8);
  let bottom =
    min(zone.bottom - ms(8), POSTER_LAYOUT.choiceY - ms(72)) +
    platformGetChoiceLayoutNudgeY();
  let centerU = 0.5;
  let centerV = 0.41;
  let GOLDEN_ANGLE = PI * (3 - sqrt(5));
  let count = targets.length;
  let coreCount = min(13, count);

  for (let i = 0; i < count; i++) {
    let angle = i * GOLDEN_ANGLE + 0.35;
    let radius;

    if (i < coreCount) {
      let t = (i + 0.5) / coreCount;
      radius = 0.02 + pow(t, 0.5) * 0.13;
    } else {
      let t = (i - coreCount + 0.5) / max(1, count - coreCount);
      radius = 0.08 + pow(t, 0.44) * 0.26;
    }

    let u = constrain(centerU + cos(angle) * radius * 0.96, 0.10, 0.90);
    let v = constrain(centerV + sin(angle) * radius * 0.84, 0.14, 0.72);
    let goalCx = lerp(left, right, u);
    let goalCy = lerp(top, bottom, v);

    targets[i] = platformLooseNudgeTargetBBoxCenter(
      targets[i],
      goalCx,
      goalCy,
      blend,
      cfg,
      i
    );
  }
}

function toadSeparateLooseTargets(targets, cfg, gap = ms(24), maxIter = 36) {
  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;

    for (let a = 0; a < targets.length; a++) {
      for (let b = a + 1; b < targets.length; b++) {
        let boxA = platformLoosePieceScreenBBox(cfg, targets[a].x, targets[a].y, a, 0, true);
        let cxA = (boxA.left + boxA.right) * 0.5;
        let cyA = (boxA.top + boxA.bottom) * 0.5;
        let rA = max(boxA.right - boxA.left, boxA.bottom - boxA.top) * 0.5;
        let boxB = platformLoosePieceScreenBBox(cfg, targets[b].x, targets[b].y, b, 0, true);
        let cxB = (boxB.left + boxB.right) * 0.5;
        let cyB = (boxB.top + boxB.bottom) * 0.5;
        let rB = max(boxB.right - boxB.left, boxB.bottom - boxB.top) * 0.5;
        let dx = cxA - cxB;
        let dy = cyA - cyB;
        let dist = max(sqrt(dx * dx + dy * dy), 0.01);
        let need = rA + rB + gap;

        if (dist >= need) {
          continue;
        }

        let push = ((need - dist) / dist) * 0.55;
        targets[a] = platformLooseShiftTargetScreen(
          targets[a],
          dx * push,
          dy * push,
          cfg
        );
        targets[b] = platformLooseShiftTargetScreen(
          targets[b],
          -dx * push,
          -dy * push,
          cfg
        );
        moved = true;
      }
    }

    if (!moved) {
      break;
    }
  }
}

function platformWarmLooseRepelAfterConnect(p, blend = 0.62) {
  let cfg = p.cfg;

  if (!cfg?.getPieceGroup) {
    return;
  }

  let profile = platformLooseGetProfile(cfg);

  if (!profile.hyenaStyleRepel) {
    return;
  }

  let pivot = profile.pivot;
  let savedTGroup = p.tGroup.slice();
  p.tGroup = platformLooseScenarioTGroupFromClick(p);

  if (!p.looseRepelSmooth) {
    p.looseRepelSmooth = [];
  }

  for (let i = 0; i < cfg.totalPieces; i++) {
    let pieceGroup = cfg.getPieceGroup(i);

    if (platformLooseAssemblerRepelWeight(p.tGroup[pieceGroup]) > 0) {
      continue;
    }

    let off = p.pieceOffsets[i];

    if (!off) {
      continue;
    }

    let rot = off.rot || 0;
    let target = platformGetLooseTarget(i, cfg);
    target = {
      x: target.x + profile.scatter.x,
      y: target.y + profile.scatter.y
    };
    target = platformLooseFitTargetOffset(cfg, pivot, target.x, target.y, i, rot);
    let cleared = platformLooseApplyGroupedRepel(
      p,
      i,
      target.x,
      target.y,
      0,
      pieceGroup,
      rot
    );
    let desired = {
      x: cleared.x - target.x,
      y: cleared.y - target.y
    };
    let prev = p.looseRepelSmooth[i] || { x: 0, y: 0 };

    p.looseRepelSmooth[i] = {
      x: lerp(prev.x, desired.x, blend),
      y: lerp(prev.y, desired.y, blend)
    };
  }

  p.tGroup = savedTGroup;
}

function platformToadWarmLooseRepel(p) {
  if (!p?.cfg || p.cfg.id !== "toad") {
    return;
  }

  platformWarmLooseRepelAfterConnect(p);
}

function toadAdjustLooseTargets(targets, cfg) {
  let p = posterRegistry.toad;

  if (!p || !cfg.getPieceGroup) {
    return;
  }

  toadAssignScatterSlots(targets, cfg);
  toadSeparateLooseTargets(targets, cfg, ms(22), 30);
  toadAssignScatterSlots(targets, cfg, 0.85);
  deerClampTargetsToComposition(targets, cfg);
}

function eagleAdjustLooseTargets(targets, cfg) {
  let zone = platformLooseGetProfile(cfg).composition;

  if (!zone || !cfg.getPieceGroup) {
    return;
  }

  eagleAssignScatterSlots(targets, cfg);
  eagleSeparateLooseTargets(targets, cfg);
  eagleAssignScatterSlots(targets, cfg);

  for (let i = 0; i < targets.length; i++) {
    targets[i] = eagleClampTargetOnCanvas(targets[i], cfg, i, 0);
  }
}

function platformLooseCapPushDelta(desiredDelta, profile, cfg) {
  if (!profile.zonePushMax || profile.zonePushMax <= 0) {
    return desiredDelta;
  }

  let maxMesh = platformLooseScreenPadToMesh(profile.zonePushMax, cfg);
  let mag = sqrt(desiredDelta.x * desiredDelta.x + desiredDelta.y * desiredDelta.y);

  if (mag <= maxMesh) {
    return desiredDelta;
  }

  let scale = maxMesh / mag;

  return {
    x: desiredDelta.x * scale,
    y: desiredDelta.y * scale
  };
}

function platformLooseResolveClearOffset(
  p,
  pieceGroup,
  offsetX,
  offsetY,
  pieceT,
  index,
  rot = 0
) {
  let repelMix = platformLooseRepelMix(pieceT, p);

  if (repelMix <= 0.001) {
    return { x: offsetX, y: offsetY };
  }

  let profile = platformLooseGetProfile(p.cfg);
  let resolved = { x: offsetX, y: offsetY };

  if (profile.useZonePush && p.cfg.assembleZones) {
    let pushed = offsetX;
    let pushedY = offsetY;

    if (
      platformLoosePieceOverlapsAssembleZones(
        p,
        pieceGroup,
        offsetX,
        offsetY,
        index,
        0,
        p.cfg
      )
    ) {
      let cleared = platformLoosePushFromAssembleZones(
        p,
        pieceGroup,
        offsetX,
        offsetY,
        0,
        index
      );
      pushed = cleared.x;
      pushedY = cleared.y;
    }

    resolved = platformLoosePushFromChoiceKeepOut(
      p.cfg,
      pushed,
      pushedY,
      index,
      0
    );
  } else {
    resolved = platformLooseRepelFromAssembledGroups(
      p,
      pieceGroup,
      offsetX,
      offsetY,
      rot,
      index,
      pieceT
    );
  }

  return {
    x: lerp(offsetX, resolved.x, repelMix),
    y: lerp(offsetY, resolved.y, repelMix)
  };
}

function platformLoosePushAwayFromAssembledZones(
  p,
  offsetX,
  offsetY,
  index,
  pieceT,
  pieceGroup
) {
  let cfg = p.cfg;
  let zones = cfg.assembleZones;

  if (!zones) {
    return { x: offsetX, y: offsetY };
  }

  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let looseStrength = 1 - platformSmoothStep(0.08, 0.78, pieceT);

  if (looseStrength <= 0) {
    return { x: offsetX, y: offsetY };
  }

  let x = pivot.x + offsetX;
  let y = pivot.y + offsetY;

  for (let pass = 0; pass < 4; pass++) {
    for (let g = 0; g < zones.length; g++) {
      if (g === pieceGroup) {
        continue;
      }

      let assemblerWeight = platformLooseAssemblerRepelWeight(
        platformLooseGetRepelGroupT(p, g)
      );

      if (assemblerWeight <= 0) {
        continue;
      }

      let z = zones[g];
      let influence = z.influence ?? 1.72;
      let rx = z.rx * influence;
      let ry = z.ry * influence;
      let dx = x - z.cx;
      let dy = y - z.cy;

      if (abs(dx) < 0.001 && abs(dy) < 0.001) {
        dx = cos(index * 2.31 + g);
        dy = sin(index * 2.31 + g);
      }

      let nx = dx / rx;
      let ny = dy / ry;
      let distance = sqrt(nx * nx + ny * ny);

      if (distance < influence) {
        let angle = atan2(dy / ry, dx / rx);
        let targetX = z.cx + cos(angle) * rx * influence;
        let targetY = z.cy + sin(angle) * ry * influence;
        let zoneForce = p.cfg.id === "toad" ? 0.28 : 0.22;
        let force =
          (influence - distance) * assemblerWeight * looseStrength * zoneForce;
        force = constrain(force, 0, 0.32);
        x = lerp(x, targetX, force);
        y = lerp(y, targetY, force);
      }
    }
  }

  return { x: x - pivot.x, y: y - pivot.y };
}

function platformLooseApplyGroupedRepel(
  p,
  index,
  offsetX,
  offsetY,
  pieceT,
  pieceGroup,
  rot
) {
  let ox = offsetX;
  let oy = offsetY;
  let profile = platformLooseGetProfile(p.cfg);

  if (p.cfg.assembleZones) {
    let zoned = platformLoosePushAwayFromAssembledZones(
      p,
      ox,
      oy,
      index,
      pieceT,
      pieceGroup
    );
    ox = zoned.x;
    oy = zoned.y;
  }

  let cleared = platformLooseComputeRepelCleared(
    p,
    pieceGroup,
    ox,
    oy,
    rot,
    index,
    pieceT
  );

  if (profile.hyenaStyleRepel) {
    let connectedGroups = 0;

    for (let g = 0; g < 4; g++) {
      if (platformLooseAssemblerRepelWeight(platformLooseGetRepelGroupT(p, g)) > 0) {
        connectedGroups++;
      }
    }

    // Full separation passes on every platform. Under-converging here (Android
    // used to run 0 extra passes) left pieces unresolved on the bbox edge, so
    // each frame re-nudged them from a slightly different spot — visible jitter.
    let bboxPasses =
      p.cfg.id === "toad" ? min(6, 3 + connectedGroups) : 3;

    for (let pass = 0; pass < bboxPasses; pass++) {
      cleared = platformLooseClearLooseFromConnectedBBox(
        cleared.x,
        cleared.y,
        p,
        pieceGroup,
        index,
        rot
      );
    }
  }

  return cleared;
}

function platformLooseApplyPushDelta(
  p,
  index,
  offsetX,
  offsetY,
  pieceT,
  pieceGroup,
  rot = 0
) {
  let repelMix = platformLooseRepelMix(pieceT, p);

  if (repelMix <= 0.001) {
    return { x: offsetX, y: offsetY };
  }

  let profile = platformLooseGetProfile(p.cfg);

  // Repel is recomputed every frame for smooth motion. It used to be throttled
  // to every 3rd frame on Android (freezing the offset between), which read as
  // stutter; the O(n^2) union-bbox rebuild that made that necessary is now
  // cached, so per-frame compute is cheap.
  if (p.cfg.getPieceGroup) {
    let cleared = platformLooseApplyGroupedRepel(
      p,
      index,
      offsetX,
      offsetY,
      pieceT,
      pieceGroup,
      rot
    );
    let desiredDelta = {
      x: (cleared.x - offsetX) * repelMix,
      y: (cleared.y - offsetY) * repelMix
    };

    if (!profile.hyenaStyleRepel) {
      return {
        x: offsetX + desiredDelta.x,
        y: offsetY + desiredDelta.y
      };
    }

    if (!p.looseRepelSmooth) {
      p.looseRepelSmooth = [];
    }

    let prevDelta = p.looseRepelSmooth[index] || { x: 0, y: 0 };
    let follow = platformLooseRepelFollowRate(
      p,
      profile.looseRepelFollow ?? 0.22
    );

    let boostActive = p.cfg.id === "toad" && p.toadRepelBoost > 0;

    if (boostActive) {
      // Android: gentler catch-up so connect frames don't spike.
      follow = platformIsAndroidDevice() ? 0.28 : 0.55;
      p.toadRepelBoost--;
    }

    let smoothDelta = {
      x: lerp(prevDelta.x, desiredDelta.x, follow),
      y: lerp(prevDelta.y, desiredDelta.y, follow)
    };

    if (
      p.disassembleRepelWarmup <= 0 &&
      abs(desiredDelta.x - smoothDelta.x) < 1.2 &&
      abs(desiredDelta.y - smoothDelta.y) < 1.2
    ) {
      smoothDelta = desiredDelta;
    }

    if (profile.looseRepelStepMax > 0) {
      let stepCap = boostActive ? ms(28) : profile.looseRepelStepMax;
      let maxStep = platformLooseScreenPadToMesh(stepCap, p.cfg);
      let stepX = smoothDelta.x - prevDelta.x;
      let stepY = smoothDelta.y - prevDelta.y;
      let stepMag = sqrt(stepX * stepX + stepY * stepY);

      if (stepMag > maxStep) {
        let scale = maxStep / stepMag;
        smoothDelta = {
          x: prevDelta.x + stepX * scale,
          y: prevDelta.y + stepY * scale
        };
      }
    }

    p.looseRepelSmooth[index] = smoothDelta;

    return {
      x: offsetX + smoothDelta.x,
      y: offsetY + smoothDelta.y
    };
  }

  let cleared = platformLooseComputeRepelCleared(
    p,
    pieceGroup,
    offsetX,
    offsetY,
    rot,
    index,
    pieceT
  );

  let desiredDelta = {
    x: (cleared.x - offsetX) * repelMix,
    y: (cleared.y - offsetY) * repelMix
  };

  if (profile.homeMaxDisp > 0) {
    desiredDelta = platformLooseCapPushDelta(
      desiredDelta,
      { zonePushMax: profile.homeMaxDisp },
      p.cfg
    );
  }

  desiredDelta = platformLooseCapPushDelta(desiredDelta, profile, p.cfg);

  if (abs(desiredDelta.x) < 0.4 && abs(desiredDelta.y) < 0.4) {
    desiredDelta = { x: 0, y: 0 };
  }

  if (!p.looseRepelSmooth) {
    p.looseRepelSmooth = [];
  }

  let prevDelta = p.looseRepelSmooth[index] || { x: 0, y: 0 };
  let follow = platformLooseRepelFollowRate(p, profile.looseRepelFollow);
  let blendT = p.looseRepelBlendT || 0;
  let snapBlend =
    p.disassembleRepelWarmup > 0
      ? follow
      : blendT > 0
        ? min(1, 0.5 + (1 - blendT) * 0.5)
        : follow;
  let smoothDelta = {
    x: lerp(prevDelta.x, desiredDelta.x, snapBlend),
    y: lerp(prevDelta.y, desiredDelta.y, snapBlend)
  };

  if (p.disassembleRepelWarmup <= 0 && snapBlend >= 0.95) {
    smoothDelta = desiredDelta;
  }

  if (profile.zonePushStepMax > 0 && blendT <= 0) {
    let maxStep = platformLooseScreenPadToMesh(profile.zonePushStepMax, p.cfg);
    let stepX = smoothDelta.x - prevDelta.x;
    let stepY = smoothDelta.y - prevDelta.y;
    let stepMag = sqrt(stepX * stepX + stepY * stepY);

    if (stepMag > maxStep) {
      let scale = maxStep / stepMag;
      smoothDelta = {
        x: prevDelta.x + stepX * scale,
        y: prevDelta.y + stepY * scale
      };
    }
  }

  p.looseRepelSmooth[index] = smoothDelta;

  return {
    x: offsetX + smoothDelta.x,
    y: offsetY + smoothDelta.y
  };
}

function platformLooseGetProfile(cfg) {
  // Cache resolved profile — was allocating a new object on every piece/frame
  // and causing occasional GC hitch on Android during connect.
  let ver = platformLooseLayoutVersion;
  if (cfg && cfg._looseProfile && cfg._looseProfileVer === ver) {
    return cfg._looseProfile;
  }
  let profile = platformLooseResolveProfile(cfg);
  if (cfg) {
    cfg._looseProfile = profile;
    cfg._looseProfileVer = ver;
  }
  return profile;
}

function platformLooseGetPivot(cfg) {
  return platformLooseGetProfile(cfg).pivot;
}

function platformGetLooseTarget(index, cfg) {
  let profile = platformLooseGetProfile(cfg);
  let cacheKey =
    (cfg.id || "poster") +
    "_" +
    cfg.totalPieces +
    "_v" +
    platformLooseLayoutVersion;

  if (!platformLooseTargetCache[cacheKey]) {
    let layout = profile.layout;
    let layoutOpts = {
      ...layout,
      pivot: profile.pivot,
      getPieceGroup: cfg.getPieceGroup
    };

    if (layout.type === "zone" || layout.useScatterZone) {
      layoutOpts.zone = layout.zone || profile.composition;
    }

    layoutOpts.groupGeo = profile.groupGeo;
    layoutOpts.pieceAnchors = profile.pieceAnchors;
    layoutOpts.cfg = cfg;

    let built = platformLooseBuildLayout(cfg.totalPieces, layoutOpts);

    if (profile.useZonePush && cfg.assembleZones && layout.zoneMode !== "circular") {
      for (let i = 0; i < built.length; i++) {
        built[i] = platformLooseClearHomeFromAllZones(cfg, built[i].x, built[i].y, i);
      }
    }

    if (
      cfg.getPieceGroup &&
      cfg.id !== "toad" &&
      layout.zoneMode !== "circular"
    ) {
      built = platformLooseBakeScatterTargets(cfg, built);
    }

    if (layout.zoneMode === "circular") {
      platformLooseCircularAdjustLooseTargets(built, cfg);
    } else if (cfg.id === "eagle") {
      eagleAdjustLooseTargets(built, cfg);
    } else if (cfg.id === "deer") {
      deerAdjustLooseTargets(built, cfg);
    } else if (cfg.id === "toad") {
      toadAdjustLooseTargets(built, cfg);
    }

    platformLooseTargetCache[cacheKey] = built;
  }

  let targets = platformLooseTargetCache[cacheKey];

  if (index >= 0 && index < targets.length) {
    return targets[index];
  }

  return { x: 0, y: -360 };
}

function platformLooseGetDrawTransform(cfg) {
  let profile = platformLooseGetProfile(cfg);
  if (profile._cachedDrawXf) {
    return profile._cachedDrawXf;
  }

  let dt = profile.drawTransform;
  let baseScale = dt?.scale ?? 1;
  let cached = !dt
    ? { ox: 0, oy: 0, scale: 1, scaleX: 1, scaleY: 1, px: 500, py: 500 }
    : {
        ox: dt.originX ?? 0,
        oy: dt.originY ?? 0,
        scale: baseScale,
        scaleX: dt.scaleX ?? baseScale,
        scaleY: dt.scaleY ?? baseScale,
        px: dt.pivotX ?? 500,
        py: dt.pivotY ?? 500
      };
  profile._cachedDrawXf = cached;
  return cached;
}

function platformLooseMeshToPosterRef(ax, ay, cfg) {
  let dt = platformLooseGetDrawTransform(cfg);

  return {
    x: dt.ox + dt.scaleX * (ax - dt.px),
    y: dt.oy + dt.scaleY * (ay - dt.py)
  };
}

function platformLoosePosterRefToMesh(px, py, cfg) {
  let dt = platformLooseGetDrawTransform(cfg);

  return {
    x: dt.px + (px - dt.ox) / dt.scaleX,
    y: dt.py + (py - dt.oy) / dt.scaleY
  };
}

function platformLooseGetGeoForIndex(opts, index) {
  if (!opts.getPieceGroup || !opts.groupGeo) {
    return null;
  }

  return opts.groupGeo[opts.getPieceGroup(index)] || null;
}

// Place each piece so its mesh pivot (or bbox center) lands at the screen point.
function platformLooseTargetFromScreenPoint(sx, sy, pivot, geo, cfg = {}) {
  let posterRef = platformScreenToAnimalRef(sx, sy);
  let meshAt = platformLoosePosterRefToMesh(posterRef.x, posterRef.y, cfg);

  if (!geo) {
    return { x: meshAt.x - pivot.x, y: meshAt.y - pivot.y };
  }

  let cx = (geo.minDx + geo.maxDx) * 0.5;
  let cy = (geo.minDy + geo.maxDy) * 0.5;

  return {
    x: meshAt.x - cx - pivot.x,
    y: meshAt.y - cy - pivot.y
  };
}

// Stable scatter layout in animal-local space (relative to pivot).
function platformLooseBuildLayoutZone(count, zone, opts = {}) {
  const GOLDEN_ANGLE = PI * (3 - sqrt(5));
  let pivot = opts.pivot || { x: 500, y: 500 };
  let getGroup = opts.getPieceGroup;
  let groupBias = opts.groupBias || {};
  let groupSpread = opts.groupSpread ?? 0.1;
  let groupCounts = {};
  let groupIndex = {};
  let targets = [];

  for (let i = 0; i < count; i++) {
    let g = getGroup ? getGroup(i) : 0;
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  }

  for (let i = 0; i < count; i++) {
    let g = getGroup ? getGroup(i) : 0;
    let gi = groupIndex[g] || 0;
    groupIndex[g] = gi + 1;

    let bias = groupBias[g] || { u: 0.5, v: 0.5 };
    let angle = gi * GOLDEN_ANGLE + g * 2.1;
    let ring = sqrt((gi + 0.5) / groupCounts[g]);
    let uNorm = constrain(bias.u + cos(angle) * ring * groupSpread, 0.1, 0.9);
    let vNorm = constrain(bias.v + sin(angle) * ring * groupSpread, 0.1, 0.9);
    let sx = lerp(zone.left, zone.right, uNorm);
    let sy = lerp(zone.top, zone.bottom, vNorm);
    let geo = platformLooseLayoutPlacementGeo(opts, i);

    targets.push(
      platformLooseTargetFromScreenPoint(sx, sy, pivot, geo, opts.cfg || {})
    );
  }

  return targets;
}

// Hyena-style golden-angle ring inside the composition rect.
function platformLooseBuildLayoutZoneCircular(count, zone, opts = {}) {
  let layout = { ...opts, zone };
  let cfg = opts.cfg || {};
  let targets = [];

  for (let i = 0; i < count; i++) {
    let goal = platformLooseCircularGoalScreen(i, count, cfg, layout);
    targets.push(
      platformLooseFitTargetToScreenPoint(cfg, i, goal.x, goal.y)
    );
  }

  return targets;
}

// Even spread across the full composition rect.
function platformLooseBuildLayoutZoneEven(count, zone, opts = {}) {
  const GOLDEN_ANGLE = PI * (3 - sqrt(5));
  let pivot = opts.pivot || { x: 500, y: 500 };
  let inset = opts.zoneInset ?? 0.16;
  let shiftX = opts.screenShift?.x || 0;
  let shiftY = opts.screenShift?.y || 0;
  let targets = [];

  for (let i = 0; i < count; i++) {
    let t = (i + 0.5) / count;
    let angle = i * GOLDEN_ANGLE + (opts.angleOffset || 0);
    let radiusMax = opts.zoneRadiusMax ?? 0.97;
    let radius = lerp(0.2, radiusMax, sqrt(t));
    let uNorm = constrain(0.5 + cos(angle) * radius * (0.5 - inset), inset, 1 - inset);
    let vNorm = constrain(0.5 + sin(angle) * radius * (0.5 - inset), inset, 1 - inset);
    let sx = lerp(zone.left, zone.right, uNorm) + shiftX;
    let sy = lerp(zone.top, zone.bottom, vNorm) + shiftY;
    let geo = platformLooseLayoutPlacementGeo(opts, i);

    targets.push(
      platformLooseTargetFromScreenPoint(sx, sy, pivot, geo, opts.cfg || {})
    );
  }

  return targets;
}

// Grid spread — fills the composition evenly (best for 15 turtle pieces).
function platformLooseBuildLayoutZoneGrid(count, zone, opts = {}) {
  let pivot = opts.pivot || { x: 500, y: 500 };
  let cols = opts.gridCols ?? ceil(sqrt(count * 1.35));
  let rows = ceil(count / cols);
  let inset = opts.zoneInset ?? 0.08;
  let shiftX = opts.screenShift?.x || 0;
  let shiftY = opts.screenShift?.y || 0;
  let order = [];

  for (let i = 0; i < count; i++) {
    order.push(i);
  }

  if (opts.cfg?.loosePiece?.pieceGeo) {
    order.sort((a, b) => {
      let geoA = platformLooseGetPieceGeo(opts.cfg, a);
      let geoB = platformLooseGetPieceGeo(opts.cfg, b);
      if (!geoA || !geoB) {
        return 0;
      }
      return geoB.minDx - geoA.minDx;
    });
  } else if (opts.pieceAnchors) {
    order.sort((a, b) => {
      let adx = opts.pieceAnchors[a]?.dx ?? 0;
      let bdx = opts.pieceAnchors[b]?.dx ?? 0;
      let ady = opts.pieceAnchors[a]?.dy ?? 0;
      let bdy = opts.pieceAnchors[b]?.dy ?? 0;

      if (abs(adx - bdx) > 40) {
        return bdx - adx;
      }

      return bdy - ady;
    });
  }

  let targets = new Array(count);

  for (let slot = 0; slot < count; slot++) {
    let i = order[slot];
    let col = slot % cols;
    let row = floor(slot / cols);
    let uNorm = lerp(inset, 1 - inset, (col + 0.5) / cols);
    let vNorm = lerp(inset, 1 - inset, (row + 0.5) / rows);
    let gridBias = opts.pieceGridBias?.[i];
    if (gridBias) {
      if (gridBias.u !== undefined) {
        uNorm = gridBias.u;
      }
      if (gridBias.v !== undefined) {
        vNorm = gridBias.v;
      }
    }
    uNorm += sin(i * 1.85 + 0.4) * 0.014;
    vNorm += cos(i * 2.15 + 1.1) * 0.014;
    uNorm = constrain(uNorm, inset, 1 - inset);
    vNorm = constrain(vNorm, inset, 1 - inset);

    let sx = lerp(zone.left, zone.right, uNorm) + shiftX;
    let sy = lerp(zone.top, zone.bottom, vNorm) + shiftY;
    let geo = platformLooseLayoutPlacementGeo(opts, i);

    targets[i] = platformLooseTargetFromScreenPoint(
      sx,
      sy,
      pivot,
      geo,
      opts.cfg || {}
    );
  }

  return targets;
}

// Spread pieces inside per-group sub-rectangles (handles asymmetric mesh).
function platformLooseBuildLayoutGroupRanges(count, zone, opts = {}) {
  const GOLDEN_ANGLE = PI * (3 - sqrt(5));
  let pivot = opts.pivot || { x: 500, y: 500 };
  let getGroup = opts.getPieceGroup;
  let groupRanges = opts.groupRanges || {};
  let inset = opts.zoneInset ?? 0.14;
  let groupCounts = {};
  let groupIndex = {};
  let targets = [];

  for (let i = 0; i < count; i++) {
    let g = getGroup ? getGroup(i) : 0;
    groupCounts[g] = (groupCounts[g] || 0) + 1;
  }

  for (let i = 0; i < count; i++) {
    let g = getGroup ? getGroup(i) : 0;
    let gi = groupIndex[g] || 0;
    groupIndex[g] = gi + 1;

    let ranges = groupRanges[g] || {
      uMin: inset,
      uMax: 1 - inset,
      vMin: inset,
      vMax: 1 - inset
    };
    let angle = gi * GOLDEN_ANGLE + g * 1.6;
    let ring = sqrt((gi + 0.5) / groupCounts[g]);
    let ringSpread = opts.groupRingSpread ?? 0.44;
    let uNorm = lerp(
      ranges.uMin,
      ranges.uMax,
      constrain(0.5 + cos(angle) * ring * ringSpread, 0.04, 0.96)
    );
    let vNorm = lerp(
      ranges.vMin,
      ranges.vMax,
      constrain(0.5 + sin(angle) * ring * ringSpread, 0.04, 0.96)
    );
    let shiftX = opts.screenShift?.x || 0;
    let shiftY = opts.screenShift?.y || 0;
    let sx = lerp(zone.left, zone.right, uNorm) + shiftX;
    let sy = lerp(zone.top, zone.bottom, vNorm) + shiftY;
    let geo = platformLooseLayoutPlacementGeo(opts, i);

    targets.push(
      platformLooseTargetFromScreenPoint(sx, sy, pivot, geo, opts.cfg || {})
    );
  }

  return targets;
}

function platformLooseBuildLayoutSpiral(count, opts = {}) {
  const GOLDEN_ANGLE = PI * (3 - sqrt(5));
  const spreadX = opts.spreadX ?? 340;
  const spreadY = opts.spreadY ?? 230;
  const centerY = opts.centerY ?? -55;
  const radiusMin = opts.radiusMin ?? 0.42;
  const radiusMax = opts.radiusMax ?? 0.86;
  const downwardPull = opts.downwardPull ?? 0;
  let targets = [];

  for (let i = 0; i < count; i++) {
    let t = (i + 0.5) / count;
    let angle = i * GOLDEN_ANGLE + (opts.angleOffset || 0);
    let radius = lerp(radiusMin, radiusMax, sqrt(t));
    let x = cos(angle) * radius * spreadX;
    let y = sin(angle) * radius * spreadY + centerY + max(0, sin(angle)) * spreadY * downwardPull;
    targets.push({ x, y });
  }

  return targets;
}

function platformLooseBuildLayout(count, opts = {}) {
  if (opts.type === "zone" || opts.zone) {
    if (opts.zoneMode === "circular") {
      return platformLooseBuildLayoutZoneCircular(count, opts.zone, opts);
    }
    if (opts.zoneMode === "grid") {
      return platformLooseBuildLayoutZoneGrid(count, opts.zone, opts);
    }
    if (opts.zoneMode === "even") {
      return platformLooseBuildLayoutZoneEven(count, opts.zone, opts);
    }
    if (opts.zoneMode === "groupRanges") {
      return platformLooseBuildLayoutGroupRanges(count, opts.zone, opts);
    }
    return platformLooseBuildLayoutZone(count, opts.zone, opts);
  }

  return platformLooseBuildLayoutSpiral(count, opts);
}

function platformAnimalRefToScreen(ax, ay) {
  let s = platformW / ANIMAL_REF_W;
  let anchorY = platformLayoutY(ANIMAL_ANCHOR_Y) + ms(ANIMAL_SCREEN_OFFSET_Y);
  return {
    x: platformW / 2 + (ax - ANIMAL_REF_W / 2) * s,
    y: anchorY + (ay - ANIMAL_ANCHOR_Y) * s
  };
}

function platformScreenToAnimalRef(sx, sy) {
  let s = platformW / ANIMAL_REF_W;
  let anchorY = platformLayoutY(ANIMAL_ANCHOR_Y) + ms(ANIMAL_SCREEN_OFFSET_Y);
  return {
    x: (sx - platformW / 2) / s + ANIMAL_REF_W / 2,
    y: (sy - anchorY) / s + ANIMAL_ANCHOR_Y
  };
}

function platformLooseGetCompositionBounds(cfg = {}) {
  let profile = platformLooseGetProfile(cfg);
  let pad = profile.composition.pad ?? ms(6);
  let c = profile.composition;
  let nudge = platformGetChoiceLayoutNudgeY();

  return {
    left: c.left + pad,
    right: c.right - pad,
    top: c.top + pad + nudge,
    bottom: c.bottom - pad + nudge
  };
}

function platformLooseGetGroupGeo(cfg, index) {
  let groupGeo = platformLooseGetProfile(cfg).groupGeo;

  if (!groupGeo || !cfg.getPieceGroup) {
    return null;
  }

  return groupGeo[cfg.getPieceGroup(index)] || null;
}

function platformLooseGetPieceGeo(cfg, index) {
  let pieceGeo = platformLooseGetProfile(cfg).pieceGeo;

  if (!pieceGeo) {
    return null;
  }

  if (Array.isArray(pieceGeo)) {
    return pieceGeo[index] || null;
  }

  return pieceGeo[index] || null;
}

const PLATFORM_TOAD_FALLBACK_GEO = { minDx: -34, maxDx: 34, minDy: -34, maxDy: 34 };

function platformLooseGetBoundsGeo(cfg, index) {
  let geo = platformLooseGetPieceGeo(cfg, index) || platformLooseGetGroupGeo(cfg, index);

  if (!geo && cfg.id === "toad") {
    // Stable singleton so bbox corner-extent caching keys stay valid.
    return PLATFORM_TOAD_FALLBACK_GEO;
  }

  return geo;
}

function platformLooseBakeScatterTargets(cfg, targets) {
  let p = posterRegistry[cfg.id];

  if (!p || !cfg.getPieceGroup || !p.pieceOffsets?.length) {
    return targets;
  }

  let pivot = platformLooseGetProfile(cfg).pivot;
  let savedTGroup = p.tGroup.slice();
  p.tGroup = [1, 1, 1, 1];
  let baked = targets.map((target) => ({ x: target.x, y: target.y }));

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < baked.length; i++) {
      let rot = p.pieceOffsets[i]?.rot || 0;
      let cleared = platformLooseRepelFromConnectedPieces(
        p,
        cfg.getPieceGroup(i),
        baked[i].x,
        baked[i].y,
        rot,
        i,
        0
      );
      baked[i] = platformLooseFitTargetOffset(
        cfg,
        pivot,
        cleared.x,
        cleared.y,
        i,
        rot
      );
    }
  }

  p.tGroup = savedTGroup;
  return baked;
}

function platformLooseGetScatterTargetForPiece(p, index) {
  let cfg = p.cfg;
  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;

  let target = platformGetLooseTarget(index, cfg);
  target = {
    x: target.x + profile.scatter.x,
    y: target.y + profile.scatter.y
  };

  let rot = p.pieceOffsets?.[index]?.rot || 0;

  return platformLooseFitTargetOffset(cfg, pivot, target.x, target.y, index, rot);
}

function platformLooseGetConnectedPieceRepelOffset(p, index) {
  let cfg = p.cfg;

  if (!cfg.getPieceGroup) {
    return null;
  }

  let off = p.pieceOffsets[index];

  if (!off) {
    return null;
  }

  let group = cfg.getPieceGroup(index);
  let groupT = p.tGroup[group];

  if (platformLooseAssemblerRepelWeight(groupT) <= 0) {
    return null;
  }

  // Assembled pose only — repulsion must not chase scatter→home lerp every frame.
  return { x: 0, y: 0, rot: 0 };
}

function platformLooseApplyScreenSepToMesh(cfg, pivot, offsetX, offsetY, dxScreen, dyScreen) {
  let screen = platformLooseMeshPointToScreen(pivot.x + offsetX, pivot.y + offsetY, cfg);
  let poster = platformScreenToAnimalRef(screen.x + dxScreen, screen.y + dyScreen);
  let mesh = platformLoosePosterRefToMesh(poster.x, poster.y, cfg);

  return {
    x: mesh.x - pivot.x,
    y: mesh.y - pivot.y
  };
}

function platformLooseBeginRepelFrame(p) {
  let s = platformW / ANIMAL_REF_W;
  platformLooseRepelFrameCache = {
    screenS: s,
    screenAnchorY:
      platformLayoutY(ANIMAL_ANCHOR_Y) + ms(ANIMAL_SCREEN_OFFSET_Y)
  };

  // Connected-group union bboxes are assembled-pose boxes (offset 0,0), so they
  // only change when the viewport does — not per frame. Drop the persistent
  // cache when the size changes; otherwise reuse it across the whole animation.
  let sizeKey = platformW + "x" + platformH;
  if (platformLooseConnectedUnionCacheKey !== sizeKey) {
    platformLooseConnectedUnionCacheKey = sizeKey;
    platformLooseConnectedUnionCache = {};
  }
}

function platformLooseMeshPointToScreenInto(meshX, meshY, cfg, out) {
  let dt = platformLooseGetDrawTransform(cfg);
  let px = dt.ox + dt.scaleX * (meshX - dt.px);
  let py = dt.oy + dt.scaleY * (meshY - dt.py);
  let s = platformLooseRepelFrameCache?.screenS ?? platformW / ANIMAL_REF_W;
  let anchorY =
    platformLooseRepelFrameCache?.screenAnchorY ??
    platformLayoutY(ANIMAL_ANCHOR_Y) + ms(ANIMAL_SCREEN_OFFSET_Y);
  out.x = platformW / 2 + (px - ANIMAL_REF_W / 2) * s;
  out.y = anchorY + (py - ANIMAL_ANCHOR_Y) * s;
  return out;
}

function platformLooseBuildConnectedGroupUnionBBox(cfg, groupIndex) {
  let box = null;
  let scratch = platformLooseBBoxScratch;
  let asmPad = ms(8);

  for (let j = 0; j < cfg.totalPieces; j++) {
    if (cfg.getPieceGroup(j) !== groupIndex) {
      continue;
    }

    platformLoosePieceScreenBBoxInto(cfg, 0, 0, j, 0, false, scratch);
    let left = scratch.left - asmPad;
    let right = scratch.right + asmPad;
    let top = scratch.top - asmPad;
    let bottom = scratch.bottom + asmPad;

    if (!box) {
      box = { left, right, top, bottom };
    } else {
      box.left = min(box.left, left);
      box.right = max(box.right, right);
      box.top = min(box.top, top);
      box.bottom = max(box.bottom, bottom);
    }
  }

  return box;
}

function platformLooseGetConnectedGroupUnionBBox(p, groupIndex) {
  let cfg = p.cfg;
  let groupT = platformLooseGetRepelGroupT(p, groupIndex);

  if (platformLooseAssemblerRepelWeight(groupT) <= 0) {
    return null;
  }

  let key = (cfg.id || "poster") + "|" + groupIndex;
  let cached = platformLooseConnectedUnionCache[key];

  if (cached !== undefined) {
    return cached;
  }

  let box = platformLooseBuildConnectedGroupUnionBBox(cfg, groupIndex);
  platformLooseConnectedUnionCache[key] = box;
  return box;
}

function platformLooseRepelFromConnectedPieces(
  p,
  pieceGroup,
  offsetX,
  offsetY,
  rot,
  index,
  pieceT
) {
  let cfg = p.cfg;

  if (!cfg.getPieceGroup) {
    return { x: offsetX, y: offsetY };
  }

  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let looseStrength = 1 - platformSmoothStep(0.05, 0.90, pieceT);
  let repelStrength =
    looseStrength * (1 - platformSmoothStep(0.92, 1.0, pieceT));

  if (repelStrength <= 0) {
    return { x: offsetX, y: offsetY };
  }

  let ox = offsetX;
  let oy = offsetY;
  let maxIter = profile.hyenaStyleRepel
    ? platformIsAndroidDevice()
      ? 6
      : 10
    : platformIsAndroidDevice()
      ? 12
      : 32;

  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;

    for (let g = 0; g < 4; g++) {
      if (g === pieceGroup) {
        continue;
      }

      let groupT = platformLooseGetRepelGroupT(p, g);
      let assemblerWeight = platformLooseAssemblerRepelWeight(groupT);

      if (assemblerWeight <= 0) {
        continue;
      }

      let connectedBox = platformLooseGetConnectedGroupUnionBBox(p, g);

      if (!connectedBox) {
        continue;
      }

      let gap = platformLooseRepelGap(
        profile,
        repelStrength,
        groupT,
        cfg,
        pieceGroup,
        g
      );
      let looseBox = platformLoosePieceScreenBBoxInto(
        cfg,
        ox,
        oy,
        index,
        rot,
        true,
        platformLooseBBoxScratch2
      );
      let sep = platformLooseSeparateBBox(looseBox, connectedBox, gap);

      if (sep.dx === 0 && sep.dy === 0) {
        continue;
      }

      moved = true;
      let shifted = platformLooseApplyScreenSepToMesh(
        cfg,
        pivot,
        ox,
        oy,
        sep.dx,
        sep.dy
      );
      ox = shifted.x;
      oy = shifted.y;
    }

    if (!moved) {
      break;
    }
  }

  if (!profile.hyenaStyleRepel) {
    for (let j = 0; j < cfg.totalPieces; j++) {
      if (j === index || cfg.getPieceGroup(j) === pieceGroup) {
        continue;
      }

      let connectedGroup = cfg.getPieceGroup(j);

      if (
        platformLooseAssemblerRepelWeight(platformLooseGetRepelGroupT(p, connectedGroup)) <=
        0
      ) {
        continue;
      }

      let repelOff = platformLooseGetConnectedPieceRepelOffset(p, j);

      if (!repelOff) {
        continue;
      }

      let gap = platformLooseRepelGap(
        profile,
        repelStrength,
        platformLooseGetRepelGroupT(p, connectedGroup),
        cfg,
        pieceGroup,
        connectedGroup
      );
      let connectedBox = platformLoosePieceScreenBBox(
        cfg,
        repelOff.x,
        repelOff.y,
        j,
        repelOff.rot,
        false
      );
      let asmPad = ms(8);
      connectedBox = {
        left: connectedBox.left - asmPad,
        right: connectedBox.right + asmPad,
        top: connectedBox.top - asmPad,
        bottom: connectedBox.bottom + asmPad
      };
      let looseBox = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot, true);
      let sep = platformLooseSeparateBBox(looseBox, connectedBox, gap);

      if (sep.dx === 0 && sep.dy === 0) {
        continue;
      }

      let shifted = platformLooseApplyScreenSepToMesh(
        cfg,
        pivot,
        ox,
        oy,
        sep.dx,
        sep.dy
      );
      ox = shifted.x;
      oy = shifted.y;
    }
  }

  return { x: ox, y: oy };
}

function platformLooseMeshPointToScreen(meshX, meshY, cfg) {
  platformLooseMeshPointToScreenInto(
    meshX,
    meshY,
    cfg,
    platformLoosePtScratchA
  );
  return { x: platformLoosePtScratchA.x, y: platformLoosePtScratchA.y };
}

// Mesh-space rotated corner extents for a piece. rot is a piece's stable base
// rotation, so nonzero results are cached; rot===0 (union/assembled bboxes)
// resolves to the raw geo box with no trig.
const platformLooseExtScratch = {
  rot: 0,
  geo: null,
  minRx: 0,
  maxRx: 0,
  minRy: 0,
  maxRy: 0
};

function platformLooseGetCornerExtents(cfg, index, geo, rot) {
  if (rot === 0) {
    platformLooseExtScratch.minRx = geo.minDx;
    platformLooseExtScratch.maxRx = geo.maxDx;
    platformLooseExtScratch.minRy = geo.minDy;
    platformLooseExtScratch.maxRy = geo.maxDy;
    return platformLooseExtScratch;
  }

  let cache = cfg._looseCornerExt;
  if (!cache) {
    cache = cfg._looseCornerExt = [];
  }

  let e = cache[index];
  if (e && e.rot === rot && e.geo === geo) {
    return e;
  }

  let cosR = cos(rot);
  let sinR = sin(rot);
  let dxs = [geo.minDx, geo.maxDx, geo.minDx, geo.maxDx];
  let dys = [geo.minDy, geo.minDy, geo.maxDy, geo.maxDy];
  let minRx = Infinity;
  let maxRx = -Infinity;
  let minRy = Infinity;
  let maxRy = -Infinity;

  for (let i = 0; i < 4; i++) {
    let rx = dxs[i] * cosR - dys[i] * sinR;
    let ry = dxs[i] * sinR + dys[i] * cosR;
    if (rx < minRx) minRx = rx;
    if (rx > maxRx) maxRx = rx;
    if (ry < minRy) minRy = ry;
    if (ry > maxRy) maxRy = ry;
  }

  e = { rot, geo, minRx, maxRx, minRy, maxRy };
  cache[index] = e;
  return e;
}

function platformLoosePieceScreenBBoxInto(
  cfg,
  offsetX,
  offsetY,
  index,
  rot,
  useLoosePad,
  out
) {
  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let geo = platformLooseGetBoundsGeo(cfg, index);

  if (!geo) {
    platformLooseMeshPointToScreenInto(
      pivot.x + offsetX,
      pivot.y + offsetY,
      cfg,
      platformLoosePtScratchA
    );
    out.left = platformLoosePtScratchA.x;
    out.right = platformLoosePtScratchA.x;
    out.top = platformLoosePtScratchA.y;
    out.bottom = platformLoosePtScratchA.y;
    return out;
  }

  // Mesh->screen is separable-linear (screenX depends only on meshX, screenY on
  // meshY), so the rotated corner offsets are a constant per piece. Factor them
  // out: one base-point transform + a few multiplies instead of 4 full corner
  // transforms with sin/cos. Bit-identical result, far cheaper on the hot path.
  let ext = platformLooseGetCornerExtents(cfg, index, geo, rot);

  platformLooseMeshPointToScreenInto(
    pivot.x + offsetX,
    pivot.y + offsetY,
    cfg,
    platformLoosePtScratchA
  );
  let baseSX = platformLoosePtScratchA.x;
  let baseSY = platformLoosePtScratchA.y;

  let dt = platformLooseGetDrawTransform(cfg);
  let s = platformLooseRepelFrameCache
    ? platformLooseRepelFrameCache.screenS
    : platformW / ANIMAL_REF_W;
  let bX = dt.scaleX * s;
  let bY = dt.scaleY * s;

  let bMin = bX * ext.minRx;
  let bMax = bX * ext.maxRx;
  let left = baseSX + (bMin < bMax ? bMin : bMax);
  let right = baseSX + (bMin < bMax ? bMax : bMin);

  let dMin = bY * ext.minRy;
  let dMax = bY * ext.maxRy;
  let top = baseSY + (dMin < dMax ? dMin : dMax);
  let bottom = baseSY + (dMin < dMax ? dMax : dMin);

  let floatPad = profile.floatAmp * 0.65;
  let pad = useLoosePad
    ? floatPad + PLATFORM_LOOSE_STROKE_PAD + ms(4)
    : PLATFORM_LOOSE_STROKE_PAD;

  out.left = left - pad;
  out.right = right + pad;
  out.top = top - pad;
  out.bottom = bottom + pad;
  return out;
}

function platformLoosePieceScreenBBox(cfg, offsetX, offsetY, index, rot = 0, useLoosePad = true) {
  let box = platformLoosePieceScreenBBoxInto(
    cfg,
    offsetX,
    offsetY,
    index,
    rot,
    useLoosePad,
    platformLooseBBoxScratch
  );
  // Return a copy — callers may mutate / store the result.
  return {
    left: box.left,
    right: box.right,
    top: box.top,
    bottom: box.bottom
  };
}

function platformLooseUnionBBox(a, b) {
  if (!a) {
    return b;
  }
  if (!b) {
    return a;
  }

  return {
    left: min(a.left, b.left),
    right: max(a.right, b.right),
    top: min(a.top, b.top),
    bottom: max(a.bottom, b.bottom)
  };
}

function platformLooseGetAssembledGroupScreenBBox(cfg, groupIndex) {
  let key = (cfg.id || "poster") + "_g" + groupIndex;

  if (!platformLooseGroupBBoxCache[key]) {
    let box = null;

    for (let i = 0; i < cfg.totalPieces; i++) {
      if (!cfg.getPieceGroup || cfg.getPieceGroup(i) !== groupIndex) {
        continue;
      }

      let pieceBox = platformLoosePieceScreenBBox(cfg, 0, 0, i, 0, false);
      let asmPad = ms(5);

      pieceBox = {
        left: pieceBox.left - asmPad,
        right: pieceBox.right + asmPad,
        top: pieceBox.top - asmPad,
        bottom: pieceBox.bottom + asmPad
      };
      box = platformLooseUnionBBox(box, pieceBox);
    }

    platformLooseGroupBBoxCache[key] = box;
  }

  return platformLooseGroupBBoxCache[key];
}

function platformLooseBBoxOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function platformLooseAssemblerRepelWeight(tGroup) {
  return platformSmoothStep(0.04, 0.88, tGroup);
}

function platformLooseRepelMix(pieceT, p = null) {
  if (p?.disassembleBoost > 0) {
    return 0;
  }

  let base = 1 - platformSmoothStep(0.03, 0.2, pieceT);

  if (p?.disassembleRepelWarmup > 0) {
    let ramp = 1 - p.disassembleRepelWarmup / 75;
    return base * ramp * ramp;
  }

  return base;
}

function platformLooseGetRepelGroupT(p, groupIndex) {
  if (!p?.cfg || p.disassembleBoost > 0) {
    return p.tGroup[groupIndex];
  }

  if (p.cfg.id === "toad") {
    if (groupIndex === 0 && p.clickCount >= 1) {
      return 1;
    }

    if (groupIndex === 1 && p.clickCount >= 2) {
      return 1;
    }

    if (groupIndex >= 2 && p.clickCount >= 3) {
      return 1;
    }

    return p.tGroup[groupIndex];
  }

  return p.tGroup[groupIndex];
}

function platformLooseRepelGap(
  profile,
  repelStrength,
  tGroup,
  cfg = null,
  pieceGroup = -1,
  connectedGroup = -1
) {
  if (platformLooseAssemblerRepelWeight(tGroup) <= 0) {
    return 0;
  }

  let floatPad = profile.floatAmp * 1.35 + ms(10);
  let gap = (profile.assembleClearance + floatPad + ms(12)) * repelStrength;

  if (cfg?.id === "turtle" && pieceGroup === 2 && connectedGroup === 0) {
    gap += ms(22);
  }

  if (cfg?.id === "deer" && pieceGroup !== connectedGroup) {
    gap += ms(8);
  }

  if (cfg?.id === "toad") {
    gap += ms(16);
  }

  return gap;
}

function platformLooseSeparateBBoxPushOut(looseBox, assembledBox, minGap = 1) {
  if (!platformLooseBBoxOverlap(looseBox, assembledBox)) {
    return { dx: 0, dy: 0 };
  }

  let looseCx = (looseBox.left + looseBox.right) * 0.5;
  let looseCy = (looseBox.top + looseBox.bottom) * 0.5;
  let asmCx = (assembledBox.left + assembledBox.right) * 0.5;
  let asmCy = (assembledBox.top + assembledBox.bottom) * 0.5;
  let vx = looseCx - asmCx;
  let vy = looseCy - asmCy;
  let mag = sqrt(vx * vx + vy * vy);

  if (mag < 0.001) {
    return { dx: 0, dy: minGap + ms(4) };
  }

  vx /= mag;
  vy /= mag;

  let overlapX = min(
    looseBox.right - assembledBox.left,
    assembledBox.right - looseBox.left
  );
  let overlapY = min(
    looseBox.bottom - assembledBox.top,
    assembledBox.bottom - looseBox.top
  );
  let push = max(overlapX, overlapY, 0) + minGap;

  return { dx: vx * push, dy: vy * push };
}

function platformLooseSeparateBBox(looseBox, assembledBox, gap) {
  let bounds = {
    left: assembledBox.left - gap,
    right: assembledBox.right + gap,
    top: assembledBox.top - gap,
    bottom: assembledBox.bottom + gap
  };

  if (!platformLooseBBoxOverlap(looseBox, bounds)) {
    return { dx: 0, dy: 0 };
  }

  let contained =
    looseBox.left >= bounds.left &&
    looseBox.right <= bounds.right &&
    looseBox.top >= bounds.top &&
    looseBox.bottom <= bounds.bottom;

  if (contained) {
    let escapeLeft = looseBox.right - bounds.left;
    let escapeRight = bounds.right - looseBox.left;
    let escapeTop = looseBox.bottom - bounds.top;
    let escapeBottom = bounds.bottom - looseBox.top;
    let minEscape = min(escapeLeft, escapeRight, escapeTop, escapeBottom);

    if (minEscape === escapeLeft) {
      return { dx: -(escapeLeft + 1), dy: 0 };
    }
    if (minEscape === escapeRight) {
      return { dx: escapeRight + 1, dy: 0 };
    }
    if (minEscape === escapeTop) {
      return { dx: 0, dy: -(escapeTop + 1) };
    }
    return { dx: 0, dy: escapeBottom + 1 };
  }

  let penLeft = bounds.left - looseBox.left;
  let penRight = looseBox.right - bounds.right;
  let penTop = bounds.top - looseBox.top;
  let penBottom = looseBox.bottom - bounds.bottom;
  let penEps = 0.5;

  let dx = 0;
  let dy = 0;

  if (penLeft > penEps && penRight > penEps) {
    dx = penLeft < penRight ? penLeft : -penRight;
  } else if (penLeft > penEps) {
    dx = penLeft;
  } else if (penRight > penEps) {
    dx = -penRight;
  }

  if (penTop > penEps && penBottom > penEps) {
    dy = penTop < penBottom ? penTop : -penBottom;
  } else if (penTop > penEps) {
    dy = penTop;
  } else if (penBottom > penEps) {
    dy = -penBottom;
  }

  if (abs(dx) > penEps && abs(dy) > penEps) {
    if (abs(dx) < abs(dy)) {
      dy = 0;
    } else {
      dx = 0;
    }
  }

  if (abs(dx) <= penEps && abs(dy) <= penEps) {
    return platformLooseSeparateBBoxPushOut(looseBox, bounds, 1);
  }

  return { dx, dy };
}

function platformLooseRepelFromAssembledGroups(
  p,
  pieceGroup,
  offsetX,
  offsetY,
  rot,
  index,
  pieceT
) {
  let cfg = p.cfg;
  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let looseStrength = 1 - platformSmoothStep(0.05, 0.90, pieceT);
  let repelStrength =
    looseStrength * (1 - platformSmoothStep(0.92, 1.0, pieceT));

  if (repelStrength <= 0) {
    return { x: offsetX, y: offsetY };
  }

  let ox = offsetX;
  let oy = offsetY;

  for (let iter = 0; iter < 10; iter++) {
    let moved = false;

    for (let g = 0; g < 4; g++) {
      if (g === pieceGroup) {
        continue;
      }

      let assemblerWeight = platformLooseAssemblerRepelWeight(p.tGroup[g]);

      if (assemblerWeight <= 0) {
        continue;
      }

      let groupBox = platformLooseGetAssembledGroupScreenBBox(cfg, g);

      if (!groupBox) {
        continue;
      }

      let gap = platformLooseRepelGap(
        profile,
        repelStrength,
        p.tGroup[g],
        cfg,
        pieceGroup,
        g
      );
      let looseBox = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot);
      let sep = platformLooseSeparateBBox(looseBox, groupBox, gap);

      if (sep.dx === 0 && sep.dy === 0) {
        continue;
      }

      moved = true;
      let screen = platformLooseMeshPointToScreen(pivot.x + ox, pivot.y + oy, cfg);
      let poster = platformScreenToAnimalRef(screen.x + sep.dx, screen.y + sep.dy);
      let mesh = platformLoosePosterRefToMesh(poster.x, poster.y, cfg);
      ox = mesh.x - pivot.x;
      oy = mesh.y - pivot.y;
    }

    if (!moved) {
      break;
    }
  }

  return { x: ox, y: oy };
}

function platformLoosePointBBoxDistance(px, py, box) {
  let cx = constrain(px, box.left, box.right);
  let cy = constrain(py, box.top, box.bottom);

  if (px >= box.left && px <= box.right && py >= box.top && py <= box.bottom) {
    return 0;
  }

  return dist(px, py, cx, cy);
}

function platformLoosePieceFitsComposition(cfg, offsetX, offsetY, index, rot = 0) {
  let profile = platformLooseGetProfile(cfg);
  let bounds = platformLooseGetCompositionBounds(cfg);
  let pad = profile.composition.edgePad ?? ms(12);
  let box = platformLoosePieceScreenBBox(cfg, offsetX, offsetY, index, rot);

  return (
    box.left >= bounds.left + pad &&
    box.right <= bounds.right - pad &&
    box.top >= bounds.top + pad &&
    box.bottom <= bounds.bottom - pad
  );
}

function platformLooseFitTargetOffset(cfg, pivot, targetX, targetY, index, rot = 0) {
  if (platformLoosePieceFitsComposition(cfg, targetX, targetY, index, rot)) {
    return { x: targetX, y: targetY };
  }

  return platformLooseClampOffset(targetX, targetY, rot, 1, cfg, index);
}

function platformLooseClampOffset(offsetX, offsetY, rot, strength = 1, cfg = {}, index = 0) {
  if (strength <= 0) {
    return { x: offsetX, y: offsetY };
  }

  let pivot = platformLooseGetPivot(cfg);
  let ox = offsetX;
  let oy = offsetY;

  for (let iter = 0; iter < 12; iter++) {
    if (platformLoosePieceFitsComposition(cfg, ox, oy, index, rot)) {
      break;
    }

    let bounds = platformLooseGetCompositionBounds(cfg);
    let box = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot);
    let dx = 0;
    let dy = 0;
    let pad = platformLooseGetProfile(cfg).composition.edgePad ?? ms(12);

    if (box.left < bounds.left + pad) {
      dx += bounds.left + pad - box.left;
    }
    if (box.right > bounds.right - pad) {
      dx -= box.right - (bounds.right - pad);
    }
    if (box.top < bounds.top + pad) {
      dy += bounds.top + pad - box.top;
    }
    if (box.bottom > bounds.bottom - pad) {
      dy -= box.bottom - (bounds.bottom - pad);
    }

    if (dx === 0 && dy === 0) {
      break;
    }

    let screen = platformLooseMeshPointToScreen(pivot.x + ox, pivot.y + oy, cfg);
    let clampedPoster = platformScreenToAnimalRef(screen.x + dx, screen.y + dy);
    let clampedMesh = platformLoosePosterRefToMesh(clampedPoster.x, clampedPoster.y, cfg);
    ox = clampedMesh.x - pivot.x;
    oy = clampedMesh.y - pivot.y;
  }

  return {
    x: lerp(offsetX, ox, strength),
    y: lerp(offsetY, oy, strength)
  };
}

function platformGetLooseWobbleDampen(p, pieceGroup, absX, absY, pieceT, index = 0) {
  let repelMix = platformLooseRepelMix(pieceT, p);

  if (repelMix <= 0.001) {
    return 1;
  }

  let cfg = p.cfg;
  let profile = platformLooseGetProfile(cfg);
  let nearest = 999;

  if (profile.dampenWobbleNearBody === false) {
    return 1;
  }

  if (cfg.getPieceGroup) {
    let gap = profile.assembleClearance + profile.floatAmp * 0.65;
    let screen = platformLooseMeshPointToScreen(absX, absY, cfg);

    for (let g = 0; g < 4; g++) {
      if (g === pieceGroup) {
        continue;
      }

      if (platformLooseAssemblerRepelWeight(platformLooseGetRepelGroupT(p, g)) <= 0) {
        continue;
      }

      let groupBox = platformLooseGetConnectedGroupUnionBBox(p, g);

      if (!groupBox) {
        continue;
      }

      let inflated = {
        left: groupBox.left - gap,
        right: groupBox.right + gap,
        top: groupBox.top - gap,
        bottom: groupBox.bottom + gap
      };
      let d = platformLoosePointBBoxDistance(screen.x, screen.y, inflated);

      nearest = min(nearest, d);
    }
  } else if (profile.useZonePush && cfg.assembleZones) {
    let padMesh = platformLooseScreenPadToMesh(
      profile.assembleClearance + profile.floatAmp * 1.1 + ms(4),
      cfg
    );

    for (let g = 0; g < cfg.assembleZones.length; g++) {
      if (g === pieceGroup) {
        continue;
      }

      if (platformLooseAssemblerRepelWeight(platformLooseGetRepelGroupT(p, g)) <= 0) {
        continue;
      }

      let d = platformLooseMeshPointEllipseClearance(
        absX,
        absY,
        cfg.assembleZones[g],
        padMesh
      );
      nearest = min(nearest, d * platformLooseGetDrawTransform(cfg).scale);
    }
  } else {
    let gap = profile.assembleClearance;
    let screen = platformLooseMeshPointToScreen(absX, absY, cfg);

    for (let g = 0; g < 4; g++) {
      if (g === pieceGroup) {
        continue;
      }

      if (platformLooseAssemblerRepelWeight(platformLooseGetRepelGroupT(p, g)) <= 0) {
        continue;
      }

      let groupBox = platformLooseGetAssembledGroupScreenBBox(cfg, g);

      if (!groupBox) {
        continue;
      }

      let inflated = {
        left: groupBox.left - gap,
        right: groupBox.right + gap,
        top: groupBox.top - gap,
        bottom: groupBox.bottom + gap
      };
      let d = platformLoosePointBBoxDistance(screen.x, screen.y, inflated);

      nearest = min(nearest, d);
    }
  }

  let targetDampen =
    nearest === 999
      ? 1
      : constrain(map(nearest, 0, ms(32), 0.12, 1), 0.12, 1);

  if (!p.looseWobbleDampen) {
    p.looseWobbleDampen = [];
  }

  let prevDampen = p.looseWobbleDampen[index] ?? 1;
  let dampen = lerp(prevDampen, targetDampen, profile.looseRepelFollow);
  p.looseWobbleDampen[index] = dampen;

  return lerp(1, dampen, repelMix);
}

function platformApplyLoosePieceTransform(p, index, t) {
  let off = p.pieceOffsets[index];

  if (!off) {
    return;
  }

  // Fully home — skip scatter/repel math (identity matrix).
  if (
    t >= 0.995 &&
    !(p.disassembleBoost > 0) &&
    !(p.disassembleRepelWarmup > 0)
  ) {
    return;
  }

  let cfg = p.cfg;
  let profile = platformLooseGetProfile(cfg);
  let pieceGroup = cfg.getPieceGroup(index);
  let pivot = profile.pivot;

  // Stage 1 — layout: scatter target in animal space
  let target = platformGetLooseTarget(index, cfg);
  target = {
    x: target.x + profile.scatter.x,
    y: target.y + profile.scatter.y
  };

  // Stage 2 — bounds: slide target until triangle fits composition rect
  let baseRot = off.rot || 0;
  // Android gazelle/toad: scatter targets are pre-clamped; skip per-frame fit.
  if (!platformLooseAndroidHeavyAnimal(p)) {
    target = platformLooseFitTargetOffset(
      cfg,
      pivot,
      target.x,
      target.y,
      index,
      baseRot
    );
  }

  // Stage 3 — motion: float wobble, zone push, assemble lerp
  let wobble = off.wobble || 1;
  let wobbleDampen = platformGetLooseWobbleDampen(
    p,
    pieceGroup,
    pivot.x + target.x,
    pivot.y + target.y,
    t,
    index
  );
  if (profile.dampenWobbleNearBody === false) {
    wobbleDampen = 1;
  }
  let settling =
    p.disassembleBoost > 0 || p.disassembleRepelWarmup > 0;
  let looseBound = settling
    ? 1
    : 1 - platformSmoothStep(0.05, 0.92, t);
  let rotNearBody =
    profile.dampenWobbleNearBody !== false ? wobbleDampen : 1;
  let animFrame = platformSharePreviewStill ? platformShareFrozenFrame : frameCount;
  let spaceRot =
    (off.rot + sin(animFrame * 0.004 + off.phase) * 0.16 * wobbleDampen) *
    rotNearBody;
  let softFloatX =
    sin(animFrame * off.speedX + off.phase + index * 1.7) *
    profile.floatAmp *
    wobble *
    wobbleDampen;
  let softFloatY =
    cos(animFrame * off.speedY + off.phase + index * 1.3) *
    profile.floatAmp *
    wobble *
    wobbleDampen;

  let maxAssembly = max(p.tGroup[0], p.tGroup[1], p.tGroup[2], p.tGroup[3]);
  let floatHold = platformSmoothStep(0.02, 0.16, maxAssembly);

  if (wobbleDampen < 0.4 && p.cfg.id !== "toad") {
    softFloatX *= floatHold;
    softFloatY *= floatHold;
  }

  // Push applies to the stable home — float/rotation wobble is added after repulsion.
  let pushed = platformLooseApplyPushDelta(
    p,
    index,
    target.x,
    target.y,
    t,
    pieceGroup,
    off.rot
  );
  let spaceX = pushed.x + softFloatX;
  let spaceY = pushed.y + softFloatY;

  if (!profile.hyenaStyleRepel) {
    let clamped = platformLooseClampOffset(
      spaceX,
      spaceY,
      spaceRot,
      looseBound,
      cfg,
      index
    );
    spaceX = clamped.x;
    spaceY = clamped.y;
  }

  if (profile.choiceKeepOut && t < 0.92) {
    let aboveChoice = platformLooseClampTargetAboveChoice(
      cfg,
      spaceX,
      spaceY,
      index,
      spaceRot
    );
    spaceX = aboveChoice.x;
    spaceY = aboveChoice.y;
  }

  let assembleT = platformEaseInOutSine(t);
  let currentX = lerp(spaceX, 0, assembleT);
  let currentY = lerp(spaceY, 0, assembleT);
  let currentRot = lerp(spaceRot, 0, assembleT);
  let pulseScale = platformGetLoosePositivePulseScale(p, t);
  let assembleLiftY = 0;

  if (profile.assembledScreenLift > 0) {
    let dt = platformLooseGetDrawTransform(cfg);
    assembleLiftY =
      assembleT *
      platformScreenPxToAnimalRefY(profile.assembledScreenLift) /
      max(abs(dt.scaleY), 0.001);
  }

  let pieceFall = wrongFallGetPieceDrawOffset(p, index, cfg);

  translate(
    pivot.x + currentX + pieceFall.x,
    pivot.y + currentY - assembleLiftY + pieceFall.y
  );
  scale(pulseScale);
  rotate(currentRot + pieceFall.rot);
  translate(-pivot.x, -pivot.y);
}

function platformFoldPoint(p, a, b, factor) {
  let abX = b[0] - a[0];
  let abY = b[1] - a[1];
  let apX = p[0] - a[0];
  let apY = p[1] - a[1];
  let abLenSq = abX * abX + abY * abY;

  if (abLenSq === 0) {
    return [p[0], p[1]];
  }

  let dot = apX * abX + apY * abY;
  let t = dot / abLenSq;
  let pX = a[0] + t * abX;
  let pY = a[1] + t * abY;
  let pcX = p[0] - pX;
  let pcY = p[1] - pY;

  return [pX + pcX * factor, pY + pcY * factor];
}

function platformMovePoint(p, dx, dy) {
  return [p[0] + dx, p[1] + dy];
}

function platformRotatePointAround(p, pivot, ang) {
  return platformRotatePoint(p[0], p[1], pivot[0], pivot[1], ang);
}

function platformRotatePointKeys(pts, keys, pivot, ang) {
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    pts[key] = platformRotatePointAround(pts[key], pivot, ang);
  }
}

// Wing extend: quick lift, slow return to rest
function platformEagleWingExtendPhase(phase) {
  if (phase < 0.14) {
    return pow(phase / 0.14, 0.4);
  }
  if (phase < 0.92) {
    let t = (phase - 0.14) / 0.78;
    return 1 - pow(t, 2.5);
  }
  return 0;
}

function platformDrawTri(hexColor, p1, p2, p3, weight = 1.1) {
  if (platformSuppressAnimalPieceDraw) {
    return;
  }

  // Native path — same pixels as p5 triangle, less per-call overhead on Android.
  if (platformIsAndroidDevice()) {
    let ctx = drawingContext;
    ctx.fillStyle = hexColor;
    ctx.strokeStyle = hexColor;
    ctx.lineWidth = weight;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p3[0], p3[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  fill(hexColor);
  stroke(hexColor);
  strokeWeight(weight);
  strokeJoin(ROUND);
  triangle(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}

function platformDrawQuad(hexColor, p1, p2, p3, p4, weight = 1.1) {
  if (platformSuppressAnimalPieceDraw) {
    return;
  }

  fill(hexColor);
  stroke(hexColor);
  strokeWeight(weight);
  strokeJoin(ROUND);
  quad(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
}

function platformCreateChoiceBoxes(choiceW, choiceH, choiceY, centerPull = 0) {
  let margin = POSTER_LAYOUT.marginX;
  let leftCellX = margin;
  let leftCellW = platformW / 2 - margin;

  let rightCellX = platformW / 2;
  let rightCellW = platformW / 2 - margin;

  return {
    left: {
      x: leftCellX + (leftCellW - choiceW) / 2 + centerPull,
      y: choiceY,
      w: choiceW,
      h: choiceH
    },
    right: {
      x: rightCellX + (rightCellW - choiceW) / 2 - centerPull,
      y: choiceY,
      w: choiceW,
      h: choiceH
    }
  };
}

function platformLoadSharedPosterAssets() {
  return {
    grungeFont: loadFont("80-kb-Grunge.otf"),
    plasticBagImg: loadImage("PLASICBAG.png"),
    fabricBagImg: loadImage("BAG.png"),
    plasticBottleImg: loadImage("PLASTICBOTTLE.png"),
    reusableBottleImg: loadImage("BOTTLE.png"),
    plasticForkImg: loadImage("PLASTIFORK.png"),
    reusableForkImg: loadImage("FORK.png"),
    garbageBinImg: loadImage("garbage_bin.png"),
    garbageFloorImg: loadImage("garbage_floor.png"),
    cigaretteAshtrayImg: loadImage("cigarette_ashtray.png"),
    cigaretteOnlyImg: loadImage("cigarette_only.png"),
    sandwichBoxImg: loadImage("sandwich_box.png"),
    sandwichPlasticImg: loadImage("sandwich_plastic.png"),
    glassCupImg: loadImage("glass_cup.png"),
    plasticCupImg: loadImage("plastic_cup.png")
  };
}

function platformGetFinalRevealAlpha(clickCount, finalClickCount, startTime, introDuration, fadeDuration) {
  if (clickCount < finalClickCount || startTime === null) {
    return 0;
  }

  let finalElapsed = millis() - startTime;

  if (finalElapsed < introDuration) {
    return 0;
  }

  return constrain(
    map(finalElapsed, introDuration, introDuration + fadeDuration, 0, 255),
    0,
    255
  );
}

function platformTouchHitPad() {
  // Extra invisible padding around every tappable box (choices, dock, share,
  // back, animal menu). Visual size stays the same.
  return ms(28);
}

function platformPointInBox(x, y, box) {
  if (!box) {
    return false;
  }
  let pad = platformTouchHitPad();
  return (
    x > box.x - pad &&
    x < box.x + box.w + pad &&
    y > box.y - pad &&
    y < box.y + box.h + pad
  );
}

function platformWasBoxClicked(box) {
  return platformPointInBox(mouseX, mouseY, box);
}

function platformApplyGrungeFont(font) {
  if (font) {
    textFont(font);
  }
}

function platformMeasureChoiceLabelBlock(label, font, size, leading) {
  platformApplyGrungeFont(font);
  textSize(size);
  textLeading(leading);
  let lines = label.split("\n");
  if (lines.length <= 1) {
    return textAscent() + textDescent();
  }
  return (lines.length - 1) * leading + textAscent() + textDescent();
}

function platformGetChoiceImageDrawSize(img, maxSize) {
  if (!img || !img.width || !img.height) {
    return { w: maxSize, h: maxSize, scale: 1 };
  }

  let scale = min(maxSize / img.width, maxSize / img.height);
  return {
    w: img.width * scale,
    h: img.height * scale,
    scale
  };
}

const platformChoiceImageTweaks = {
  plasticBag: { maxSizeScale: 0.92 },
  fabricBag: { maxSizeScale: 0.92 },
  plasticBottle: { maxSizeScale: 1.05 },
  reusableBottle: { maxSizeScale: 1.05 },
  garbageBin: { maxSizeScale: 1 },
  sandwichPlastic: { maxSizeScale: 1 },
  glassCup: { maxSizeScale: 0.9 },
  plasticCup: { maxSizeScale: 0.9 },
  plasticFork: { maxSizeScale: 0.98 },
  reusableFork: { maxSizeScale: 0.98 }
};

function platformGetChoicePanelLayout(w, label, img, font, imgId = "") {
  let btnSize = POSTER_LAYOUT.choiceBtnSize;
  let tweaks = platformChoiceImageTweaks[imgId] || {};
  let imgSlotH = min(POSTER_LAYOUT.choiceImageSize, btnSize * 0.62);
  let drawSize = platformGetChoiceImageDrawSize(
    img,
    imgSlotH * (tweaks.maxSizeScale ?? 1)
  );
  let labelSize = platformText.choiceLabel.size;
  let labelGap = POSTER_LAYOUT.choiceLabelGap;
  let labelLeading = max(labelSize * 1.15, ms(16));
  let labelH = platformMeasureChoiceLabelBlock(
    label,
    font,
    labelSize,
    labelLeading
  );

  return {
    btnH: btnSize,
    imgX: w / 2,
    imgCenterY: btnSize / 2 + (tweaks.offsetY || 0),
    imgW: drawSize.w,
    imgH: drawSize.h,
    labelY: btnSize + labelGap,
    labelLeading,
    labelSize,
    totalH: btnSize + labelGap + labelH
  };
}

function platformDrawChoicePanel(config) {
  let {
    x,
    y,
    w,
    h,
    img,
    label,
    imgId,
    overlayImg,
    overlayBlendMode,
    leftBoxX,
    isTouchDevice,
    animalId,
    textColor,
    buttonColor,
    font
  } = config;

  let hover =
    !isTouchDevice &&
    mouseX > x &&
    mouseX < x + w &&
    mouseY > y &&
    mouseY < y + h;

  let side = abs(x - leftBoxX) < 1 ? "left" : "right";
  let wrongShakeX = platformGetWrongShakeX(animalId, side);
  let s = hover ? 1.04 : 1;
  let btnSize = POSTER_LAYOUT.choiceBtnSize;

  let layout = platformGetChoicePanelLayout(w, label, img, font, imgId);

  let glassCx = x + wrongShakeX + w / 2;
  let glassSize = btnSize * s;
  let glassBx = glassCx - glassSize / 2;
  let glassBy = y + (layout.btnH - glassSize) / 2;
  platformDrawChoiceButton(
    glassBx,
    glassBy,
    glassSize,
    glassSize,
    glassSize / 2,
    hover
  );

  push();
  translate(x + w / 2 + wrongShakeX, y + h / 2);
  scale(s);
  translate(-w / 2, -h / 2);

  imageMode(CENTER);
  if (img) {
    noTint();
    image(img, layout.imgX, layout.imgCenterY, layout.imgW, layout.imgH);
  }
  if (overlayImg) {
    push();
    noTint();
    blendMode(overlayBlendMode === "multiply" ? MULTIPLY : BLEND);
    image(overlayImg, layout.imgX, layout.imgCenterY, layout.imgW, layout.imgH);
    pop();
  }

  platformApplyGrungeFont(font);
  let labelColor = color(textColor);
  labelColor.setAlpha(platformText.choiceLabel.alpha);
  fill(labelColor);
  textSize(layout.labelSize);
  platformDrawTightWordText(
    label,
    w / 2,
    layout.labelY,
    layout.labelLeading,
    "center"
  );

  pop();
}

function platformDrawQuestionTitle(textColor) {
  fill(textColor);
  textSize(platformText.questionTitle.size);
  platformDrawTightWordText(
    platformText.questionTitle.text,
    platformText.questionTitle.x,
    platformText.questionTitle.y + POSTER_LAYOUT.questionTitleNudgeY,
    platformText.questionTitle.leading,
    "center"
  );
}

function platformGetWrongTryAgainY() {
  return platformText.questionTitle.y + POSTER_LAYOUT.questionTitleNudgeY;
}

function platformGetWrongTryAgainAlpha(p) {
  if (p.wrongRiseActive) {
    let t = wrongFallGetRiseT(p);
    return 255 * (1 - constrain(t / WRONG_TRY_AGAIN_FADE_OUT, 0, 1));
  }

  if (p.wrongWaitActive) {
    return 255;
  }

  if (p.wrongFallActive) {
    let total = wrongFallTotalFrames(p);
    let showAt = total * WRONG_TRY_AGAIN_FALL_START;
    if (p.wrongFallT < showAt) {
      return 0;
    }
    return 255 * constrain((p.wrongFallT - showAt) / 6, 0, 1);
  }

  return 0;
}

function platformDrawWrongTryAgain(p, textColor) {
  let alpha = platformGetWrongTryAgainAlpha(p);
  if (alpha <= 0) {
    return;
  }

  let ink = color(textColor);
  ink.setAlpha(alpha);
  fill(ink);
  noStroke();
  textSize(platformText.questionTitle.size);
  platformDrawTightWordText(
    platformText.tryAgain.text,
    platformText.questionTitle.x,
    platformGetWrongTryAgainY(),
    platformText.questionTitle.leading,
    "center"
  );
}

function platformGetQuestionStageCount(p) {
  let stages = p.cfg.choiceStages || platformChoiceStages;
  return stages.length;
}

function platformStartProgressFill(p, index) {
  p.progressFillActive = true;
  p.progressFillT = 0;
  p.progressFillIndex = index;
}

function platformTickProgressFill(p) {
  if (!p.progressFillActive) {
    return;
  }
  p.progressFillT++;
  if (p.progressFillT >= PROGRESS_FILL_FRAMES) {
    p.progressFillActive = false;
    p.progressFillT = PROGRESS_FILL_FRAMES;
    p.progressFillIndex = -1;
  }
}

function platformGetProgressPillFillAmt(p, index, currentIndex) {
  if (p.progressFillActive && index === p.progressFillIndex) {
    return platformEaseOutCubic(p.progressFillT / PROGRESS_FILL_FRAMES);
  }
  if (index <= currentIndex) {
    return 1;
  }
  return 0;
}

function platformDrawProgressPillContrastShadow(bx, by, bw, bh, strength = 1) {
  let ctx = drawingContext;
  let r = bh / 2;

  ctx.save();
  ctx.filter = `blur(${ms(5)}px)`;
  platformRoundRectPath(ctx, bx, by + ms(1.2), bw, bh, r);
  ctx.fillStyle = `rgba(132, 124, 114, ${0.11 * strength})`;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = `blur(${ms(2.5)}px)`;
  platformRoundRectPath(ctx, bx, by + ms(0.6), bw, bh, r);
  ctx.fillStyle = `rgba(132, 124, 114, ${0.08 * strength})`;
  ctx.fill();
  ctx.restore();
}

function platformStrokeProgressPillEdge(bx, by, bw, bh, alpha = 0.14) {
  let ctx = drawingContext;
  let r = bh / 2;
  ctx.save();
  platformRoundRectPath(ctx, bx + 0.5, by + 0.5, bw - 1, bh - 1, r - 0.5);
  ctx.strokeStyle = `rgba(148, 140, 130, ${alpha})`;
  ctx.lineWidth = ms(0.85);
  ctx.stroke();
  ctx.restore();
}

function platformDrawProgressPill(cx, y, pillW, pillH, pillR, fillAmt) {
  let bx = cx - pillW / 2;
  let by = y - pillH / 2;
  let [br, bg, bb] = PLATFORM_TEXT_RGB;

  platformDrawProgressPillContrastShadow(bx, by, pillW, pillH, 1);
  platformDrawLiquidGlassPillSurface(
    bx,
    by,
    pillW,
    pillH,
    255,
    255,
    255,
    1,
    false,
    1,
    "light"
  );
  platformStrokeProgressPillEdge(bx, by, pillW, pillH, 0.12);

  if (fillAmt <= 0) {
    return;
  }

  if (fillAmt >= 1) {
    platformDrawProgressPillContrastShadow(bx, by, pillW, pillH, 0.55);
    platformDrawLiquidGlassPillSurface(bx, by, pillW, pillH, br, bg, bb, 1, false);
    platformStrokeProgressPillEdge(bx, by, pillW, pillH, 0.16);
    return;
  }

  let ctx = drawingContext;
  let fw = max(pillH, pillW * fillAmt);
  ctx.save();
  platformRoundRectPath(ctx, bx, by, fw, pillH, pillR);
  ctx.clip();
  platformDrawProgressPillContrastShadow(bx, by, pillW, pillH, 0.55);
  platformDrawLiquidGlassPillSurface(bx, by, pillW, pillH, br, bg, bb, 1, false);
  platformStrokeProgressPillEdge(bx, by, pillW, pillH, 0.16);
  ctx.restore();
}

function platformGetHeaderProgressLayout(p) {
  let total = platformGetQuestionStageCount(p);
  let pillW = POSTER_LAYOUT.progressPillW;
  let pillH = POSTER_LAYOUT.progressPillH;
  let stepGap = POSTER_LAYOUT.progressStepGap;
  let lineY = posterGetHeaderLineY();
  let startX =
    platformW / 2 -
    (stepGap * (total - 1)) / 2 +
    POSTER_LAYOUT.progressHeaderNudgeX;
  let y =
    lineY +
    POSTER_LAYOUT.progressGapBelowHeaderLine +
    pillH / 2 +
    POSTER_LAYOUT.progressHeaderNudgeY;

  return { startX, y, pillW, pillH, pillR: POSTER_LAYOUT.progressPillRadius, stepGap, total };
}

function platformDrawQuestionProgress(p) {
  let cfg = p.cfg;
  let total = platformGetQuestionStageCount(p);
  if (total <= 0 || p.clickCount >= cfg.finalClickCount) {
    return;
  }

  let layout = platformGetHeaderProgressLayout(p);
  let currentIndex = constrain(p.clickCount, 0, total - 1);

  push();
  drawingContext.globalAlpha = 1;
  noStroke();

  for (let i = 0; i < total; i++) {
    let cx = layout.startX + i * layout.stepGap;
    let fillAmt = platformGetProgressPillFillAmt(p, i, currentIndex);
    platformDrawProgressPill(
      cx,
      layout.y,
      layout.pillW,
      layout.pillH,
      layout.pillR,
      fillAmt
    );
  }

  pop();
}

function platformWrapTextLines(str, maxWidth, wordGapScale = 1, gfx = null) {
  let measureText = (s) => (gfx ? gfx.textWidth(s) : textWidth(s));

  if (str.includes("\n")) {
    let allLines = [];

    for (let part of str.split("\n")) {
      let trimmed = part.trim();
      if (trimmed.length === 0) {
        continue;
      }
      allLines = allLines.concat(
        platformWrapTextLines(trimmed, maxWidth, wordGapScale, gfx)
      );
    }

    return allLines;
  }

  let words = str.split(/\s+/).filter((word) => word.length > 0);
  let lines = [];
  let lineWords = [];

  function lineWidth(wordList) {
    if (wordList.length === 0) {
      return 0;
    }

    let spaceW = measureText(" ") * wordGapScale;
    let w = 0;

    for (let i = 0; i < wordList.length; i++) {
      w += measureText(wordList[i]);
      if (i < wordList.length - 1) {
        w += spaceW;
      }
    }

    return w;
  }

  for (let i = 0; i < words.length; i++) {
    let testWords = lineWords.concat(words[i]);

    if (lineWidth(testWords) > maxWidth && lineWords.length > 0) {
      lines.push(lineWords.join(" "));
      lineWords = [words[i]];
    } else {
      lineWords = testWords;
    }
  }

  if (lineWords.length > 0) {
    lines.push(lineWords.join(" "));
  }

  while (lines.length >= 2) {
    let lastWords = lines[lines.length - 1].split(" ");
    if (lastWords.length > 1) {
      break;
    }

    let prevWords = lines[lines.length - 2].split(" ");
    if (prevWords.length < 2) {
      break;
    }

    let moved = prevWords.pop();
    lines[lines.length - 2] = prevWords.join(" ");
    lines[lines.length - 1] = moved + " " + lines[lines.length - 1];
  }

  return lines;
}

function platformDrawWrappedCenterText(
  str,
  centerX,
  y,
  maxWidth,
  leading,
  wordGapScale = 1,
  gfx = null
) {
  if (gfx) {
    gfx.textAlign(CENTER, TOP);
    let lines = platformWrapTextLines(str, maxWidth, wordGapScale, gfx);
    for (let i = 0; i < lines.length; i++) {
      gfx.text(lines[i], centerX, y + i * leading);
    }
    return lines.length;
  }

  textAlign(CENTER, TOP);
  let lines = platformWrapTextLines(str, maxWidth, wordGapScale);

  for (let i = 0; i < lines.length; i++) {
    let lineY = y + i * leading;

    if (wordGapScale === 1) {
      text(lines[i], centerX, lineY);
    } else {
      platformDrawTightWordText(lines[i], centerX, lineY, leading, "center", wordGapScale);
    }
  }

  return lines.length;
}

function platformDrawTightWordText(str, x, y, leading, align = "center", wordGapScale = 0.58) {
  let lines = str.split("\n");
  let spaceW = textWidth(" ") * wordGapScale;

  textAlign(LEFT, TOP);
  for (let li = 0; li < lines.length; li++) {
    let words = lines[li].split(" ").filter((word) => word.length > 0);
    if (words.length === 0) {
      continue;
    }

    let lineW = 0;
    for (let wi = 0; wi < words.length; wi++) {
      lineW += textWidth(words[wi]);
      if (wi < words.length - 1) {
        lineW += spaceW;
      }
    }

    let startX = align === "center" ? x - lineW / 2 : x;
    let lineY = y + li * leading;
    let cursorX = startX;

    for (let wi = 0; wi < words.length; wi++) {
      text(words[wi], cursorX, lineY);
      cursorX += textWidth(words[wi]);
      if (wi < words.length - 1) {
        cursorX += spaceW;
      }
    }
  }
}





// =====================================================
// POSTER LAYOUT, REGISTRY & SHARED RUNTIME
// Spacing tokens, per-animal configs, quiz draw/press pipeline.
// =====================================================

const POSTER_LAYOUT = {
  marginX: mx(34),
  headerLineY: my(60) + 20,
  headerTextX: mx(40),
  headerTextY: my(34) + ms(5) + 20,
  headerNudgeY: -30,
  headerLineNudgeY: ms(2),
  headerRowNudgeY: ms(20),
  posterBelowHeaderNudgeY: 2,
  backButtonSize: ms(78),
  backButtonGlyphSize: ms(78),
  backButtonLabelGap: ms(8),
  backButtonStrokeWeight: ms(1.65),
  headerBackNudgeX: ms(-14),
  headerNameNudgeX: ms(-12),
  headerNameNudgeY: ms(-8),
  finalFooterNudgeY: ms(-95),
  headerBackNudgeY: ms(-2),
  headerNameSize: ms(20),
  finalMessageNudgeY: -80,
  finalPosterNudgeY: ms(90),
  feedbackNudgeY: -25,
  choiceW: ms(147),
  choiceBtnSize: ms(147),
  choiceBtnH: ms(147),
  choiceH: ms(147) + ms(18) + ms(50),
  choiceLabelGap: ms(18),
  choiceY: my(920) - ms(162) - ms(35),
  answerTop: my(715),
  footerTop: my(882),
  finalTextCenterOffset: my(24),
  finalIntro: 4000,
  finalFade: 900,
  choiceImageSize: ms(83),
  choiceCornerRadius: ms(14),
  choiceGlassCornerRadius: ms(20),
  choiceCenterPull: ms(42),
  finalTitleYOffset: 2,
  finalContentYOffset: -10,
  finalBodyX: mx(345),
  finalBodyXOffset: -35,
  finalBodyXNudge: ms(8),
  finalBodyLeading: ms(24),
  finalBodyLineCount: 7,
  finalCtaGap: ms(26),
  finalActionBarW: ms(305),
  finalActionBarH: ms(82),
  finalActionBarRefH: ms(68),
  finalActionBarPadX: ms(14),
  finalActionDockH: ms(96) + ms(15),
  finalActionDockCornerR: ms(16),
  finalActionDockDipHalfWRatio: 0.22,
  finalActionDockDipDepth: ms(60),
  finalActionDockDipShoulder: 0.5,
  finalActionHomeXRatio: 0.21,
  finalActionShareXRatio: 0.79,
  finalActionHomeXNudge: -ms(16),
  finalActionShareXNudge: ms(16),
  finalActionWingIconNudgeY: -ms(35),
  finalActionMenuNotchYRatio: 0.34,
  finalActionMenuNotchNudgeY: -ms(16),
  finalActionIconScale: 0.70,
  finalActionWingIconScale: 0.84,
  finalActionWingIconUpNudge: -ms(8),
  finalActionDockDownNudge: ms(10),
  finalActionDockShapeDownNudge: ms(8),
  finalActionDockContentNudgeY: ms(6),
  finalActionIconNudgeY: ms(4),
  finalActionMenuIconNudgeX: 2,
  animalMenuArcSpan: (Math.PI * 2) / 3,
  animalMenuArcRadiusMin: ms(118),
  animalMenuCircleScale: 0.72,
  animalMenuCircleGap: ms(16),
  animalMenuTriSize: ms(15) * 1.95,
  animalMenuButtonStaggerMs: 40,
  shareIconR: ms(26),
  shareInstagramIconR: ms(24),
  shareIconSizeBonus: ms(2),
  shareInstagramIconBonusPx: 1,
  shareIconThicken: 2,
  shareIconTouchSize: ms(72),
  shareSheetHeightRatio: 0.65,
  shareSheetNudgeY: 30,
  shareSheetTopRadius: ms(40),
  shareSheetGrabW: ms(58),
  shareSheetGrabH: ms(5),
  shareSheetGrabTop: ms(10),
  shareSheetGrabNudgeY: 2,
  shareSheetContentNudgeY: 5,
  shareSheetGrabHitH: ms(48),
  sharePreviewHeightRatio: 0.38,
  shareTitleNudgeY: ms(12),
  shareBodyNudgeY: ms(8),
  sharePreviewBoxNudgeY: 0,
  sharePreviewAnimalNudgeY: -ms(68),
  shareIconsGapBelowPreview: ms(18),
  shareSheetIconsBarW: ms(340),
  shareSheetIconsPadX: ms(10),
  shareSheetIconR: ms(34),
  shareSheetIconDrawPad: ms(8),
  frameStrokeWeight: 0.9,
  questionPhaseNudgeY: 6,
  questionPhaseSafariNudgeY: 28,
  questionPlayNudgeY: 20,
  choicePanelNudgeY: -8,
  questionTitleNudgeY: ms(10),
  progressHeaderNudgeX: 0,
  progressHeaderNudgeY: 10,
  progressGapBelowHeaderLine: ms(18),
  progressGapBelowQuestion: ms(21),
  progressPillW: ms(38),
  progressPillH: ms(7),
  progressPillRadius: ms(3.5),
  progressStepGap: ms(64),
  progressUpcomingAlpha: 44,
  looseDefaultTop: my(120),
  looseDefaultBottom: my(720),
  choiceKeepOutTop: my(670),
  eagleScatterTop: my(208),
  eagleHeaderFloorInit: my(128),
  eagleHeaderFloorAdjust: my(200)
};

function platformGetFinalBodyTopY() {
  let bodyLeading = POSTER_LAYOUT.finalBodyLeading;
  let bodySize = ms(20);
  let bodyBlockH =
    (POSTER_LAYOUT.finalBodyLineCount - 1) * bodyLeading + bodySize;
  let textCenterY =
    (POSTER_LAYOUT.answerTop + POSTER_LAYOUT.footerTop) / 2 +
    POSTER_LAYOUT.finalTextCenterOffset;
  return textCenterY - bodyBlockH / 2;
}

function posterCreateState(id, cfg) {
  return {
    id,
    cfg: { ...cfg, id },
    clickCount: 0,
    grungeFont: null,
    images: {},
    pieceOffsets: [],
    tGroup: [0, 0, 0, 0],
    feedback: { text: "", timer: 0, good: false },
    pulse: { positive: 0, wrongSide: "", wrongShake: 0, pieceShake: 0, pieceShakeKind: "" },
    disassembleBoost: 0,
    disassembleRepelWarmup: 0,
    leftBox: null,
    rightBox: null,
    finalStart: null,
    finalActionBoxes: null,
    jumpReadyTime: null,
    touchDevice: false,
    finalMotion: 0,
    deer: {
      x: PLATFORM_DEER_FINAL_ORIGIN_X,
      y: PLATFORM_DEER_FINAL_ORIGIN_Y,
      scale: PLATFORM_DEER_ANIMAL_SCALE,
      drawX: PLATFORM_DEER_FINAL_ORIGIN_X,
      drawY: PLATFORM_DEER_FINAL_ORIGIN_Y
    },
    hyena: { x: 26, y: -8, scale: 0.6, drawX: 26, drawY: -8 },
    wrongFallT: 0,
    wrongFallActive: false,
    wrongWaitT: 0,
    wrongWaitActive: false,
    wrongRiseT: 0,
    wrongRiseActive: false,
    wrongFallEls: null,
    wrongFallPieces: null,
    progressFillActive: false,
    progressFillT: 0,
    progressFillIndex: -1
  };
}

const PLATFORM_TURTLE_PIECE_GEO = [
  { minDx: -225, maxDx: 30, minDy: -200, maxDy: -30 },
  { minDx: -95, maxDx: 180, minDy: -200, maxDy: 10 },
  { minDx: 30, maxDx: 220, minDy: -200, maxDy: 10 },
  { minDx: 180, maxDx: 380, minDy: -150, maxDy: 20 },
  { minDx: -195, maxDx: -55, minDy: -30, maxDy: 60 },
  { minDx: -95, maxDx: 180, minDy: -30, maxDy: 80 },
  { minDx: 140, maxDx: 290, minDy: 10, maxDy: 80 },
  { minDx: -390, maxDx: -275, minDy: -210, maxDy: -55 },
  { minDx: -320, maxDx: -225, minDy: -210, maxDy: -55 },
  { minDx: -275, maxDx: -195, minDy: -150, maxDy: -30 },
  { minDx: -225, maxDx: -95, minDy: -150, maxDy: -30 },
  { minDx: 140, maxDx: 330, minDy: 20, maxDy: 150 },
  { minDx: 290, maxDx: 400, minDy: 20, maxDy: 160 },
  { minDx: -195, maxDx: -55, minDy: -30, maxDy: 115 },
  { minDx: -180, maxDx: -40, minDy: 60, maxDy: 300 }
];

const PLATFORM_EAGLE_PIECE_GEO = [
  { minDx: 85, maxDx: 140, minDy: 210, maxDy: 325 },
  { minDx: 45, maxDx: 210, minDy: 150, maxDy: 410 },
  { minDx: -65, maxDx: 105, minDy: 410, maxDy: 445 },
  { minDx: 45, maxDx: 190, minDy: 410, maxDy: 450 },
  { minDx: 85, maxDx: 285, minDy: -115, maxDy: 10 },
  { minDx: 140, maxDx: 440, minDy: -45, maxDy: 340 },
  { minDx: 65, maxDx: 140, minDy: -115, maxDy: 110 },
  { minDx: 65, maxDx: 440, minDy: 110, maxDy: 340 },
  { minDx: 65, maxDx: 440, minDy: 10, maxDy: 340 },
  { minDx: 140, maxDx: 440, minDy: 10, maxDy: 340 },
  { minDx: -30, maxDx: 85, minDy: -115, maxDy: 110 },
  { minDx: -165, maxDx: 65, minDy: -110, maxDy: 110 },
  { minDx: -70, maxDx: 85, minDy: -185, maxDy: -40 },
  { minDx: -165, maxDx: -30, minDy: -185, maxDy: -40 },
  { minDx: -295, maxDx: -155, minDy: -365, maxDy: -310 },
  { minDx: -342, maxDx: -295, minDy: -322, maxDy: -198 },
  { minDx: -245, maxDx: -115, minDy: -365, maxDy: -200 },
  { minDx: -155, maxDx: -70, minDy: -365, maxDy: -185 },
  { minDx: -165, maxDx: -70, minDy: -200, maxDy: -110 }
];

const PLATFORM_DEER_PIECE_GEO = [
  { minDx: -150, maxDx: -105, minDy: -98, maxDy: -18 },
  { minDx: -150, maxDx: -105, minDy: -48, maxDy: 42 },
  { minDx: -125, maxDx: -90, minDy: -28, maxDy: 42 },
  { minDx: -125, maxDx: -75, minDy: -28, maxDy: 72 },
  { minDx: -90, maxDx: 205, minDy: -68, maxDy: 52 },
  { minDx: -90, maxDx: 75, minDy: -28, maxDy: 72 },
  { minDx: 75, maxDx: 265, minDy: -68, maxDy: 52 },
  { minDx: 205, maxDx: 265, minDy: -68, maxDy: 62 },
  { minDx: 75, maxDx: 265, minDy: 2, maxDy: 62 },
  { minDx: -297, maxDx: -233, minDy: -166, maxDy: -100 },
  { minDx: -163, maxDx: -90, minDy: -150, maxDy: -91 },
  { minDx: -253, maxDx: -208, minDy: -240, maxDy: -134 },
  { minDx: -253, maxDx: -233, minDy: -328, maxDy: -240 },
  { minDx: -253, maxDx: -208, minDy: -240, maxDy: -134 },
  { minDx: -175, maxDx: -113, minDy: -240, maxDy: -116 },
  { minDx: -140, maxDx: -113, minDy: -328, maxDy: -240 },
  { minDx: -175, maxDx: -113, minDy: -240, maxDy: -124 },
  { minDx: -285, maxDx: -175, minDy: -138, maxDy: -78 },
  { minDx: -285, maxDx: -175, minDy: -124, maxDy: -54 },
  { minDx: -233, maxDx: -123, minDy: -138, maxDy: -100 },
  { minDx: -175, maxDx: -123, minDy: -124, maxDy: -48 },
  { minDx: -269, maxDx: -155, minDy: -124, maxDy: -48 },
  { minDx: -75, maxDx: -29, minDy: 72, maxDy: 190 },
  { minDx: -113, maxDx: -41, minDy: 72, maxDy: 326 },
  { minDx: -29, maxDx: 7, minDy: 72, maxDy: 190 },
  { minDx: -31, maxDx: -14, minDy: 82, maxDy: 190 },
  { minDx: -31, maxDx: 3, minDy: 190, maxDy: 326 },
  { minDx: -75, maxDx: 7, minDy: 72, maxDy: 82 },
  { minDx: 235, maxDx: 291, minDy: 8, maxDy: 38 },
  { minDx: 205, maxDx: 245, minDy: 38, maxDy: 62 },
  { minDx: 171, maxDx: 230, minDy: 62, maxDy: 170 },
  { minDx: 145, maxDx: 230, minDy: 170, maxDy: 326 },
  { minDx: 205, maxDx: 230, minDy: 62, maxDy: 184 },
  { minDx: 205, maxDx: 265, minDy: 46, maxDy: 172 },
  { minDx: 251, maxDx: 281, minDy: 172, maxDy: 326 },
  { minDx: 245, maxDx: 265, minDy: 46, maxDy: 186 },
  { minDx: 75, maxDx: 230, minDy: 52, maxDy: 170 },
  { minDx: 205, maxDx: 265, minDy: -68, maxDy: 62 }
];

const PLATFORM_TOAD_PIECE_GEO = [
  { minDx: -265, maxDx: -112, minDy: -178, maxDy: -95 },
  { minDx: -218, maxDx: -70, minDy: -150, maxDy: -75 },
  { minDx: -265, maxDx: -70, minDy: -178, maxDy: -75 },
  { minDx: -112, maxDx: 50, minDy: -158, maxDy: -75 },
  { minDx: -70, maxDx: 90, minDy: -158, maxDy: -45 },
  { minDx: 50, maxDx: 210, minDy: -158, maxDy: -45 },
  { minDx: 188, maxDx: 320, minDy: -102, maxDy: 55 },
  { minDx: 90, maxDx: 210, minDy: -102, maxDy: 55 },
  { minDx: -408, maxDx: -218, minDy: -130, maxDy: -62 },
  { minDx: -408, maxDx: -218, minDy: -95, maxDy: 5 },
  { minDx: -348, maxDx: -214, minDy: -95, maxDy: 48 },
  { minDx: -360, maxDx: -218, minDy: -178, maxDy: -95 },
  { minDx: -218, maxDx: -70, minDy: -95, maxDy: 48 },
  { minDx: -214, maxDx: -70, minDy: -75, maxDy: 120 },
  { minDx: -214, maxDx: -80, minDy: 48, maxDy: 162 },
  { minDx: -80, maxDx: -45, minDy: -75, maxDy: 232 },
  { minDx: -70, maxDx: 58, minDy: -75, maxDy: 232 },
  { minDx: -70, maxDx: 90, minDy: -75, maxDy: 132 },
  { minDx: -45, maxDx: 120, minDy: 132, maxDy: 232 },
  { minDx: 58, maxDx: 188, minDy: -45, maxDy: 132 },
  { minDx: 188, maxDx: 355, minDy: 5, maxDy: 100 },
  { minDx: 188, maxDx: 355, minDy: 55, maxDy: 180 },
  { minDx: 58, maxDx: 305, minDy: 55, maxDy: 180 },
  { minDx: 58, maxDx: 305, minDy: 132, maxDy: 228 },
  { minDx: 58, maxDx: 230, minDy: 112, maxDy: 142 },
  { minDx: 58, maxDx: 188, minDy: 55, maxDy: 132 },
  { minDx: 170, maxDx: 280, minDy: 112, maxDy: 210 },
  { minDx: 150, maxDx: 315, minDy: 210, maxDy: 282 },
  { minDx: -320, maxDx: -195, minDy: 120, maxDy: 205 },
  { minDx: -320, maxDx: -230, minDy: 120, maxDy: 208 },
  { minDx: -195, maxDx: -80, minDy: 120, maxDy: 186 },
  { minDx: -95, maxDx: -45, minDy: 120, maxDy: 232 },
  { minDx: -170, maxDx: 0, minDy: 186, maxDy: 262 }
];

const posterRegistry = {
  turtle: posterCreateState("turtle", {
    finalClickCount: 3,
    textColor: PLATFORM_TEXT_COLOR,
    choiceButtonColor: "#a3b57b",
    choiceImageColor: "#424F34",
    choiceImageDesaturate: 0.42,
    bgTop: "#EEF3DD",
    bgBottom: "#C6D7A7",
    glow: { r: 245, g: 238, b: 204, cy: my(400), maxR: mx(540), step: 18, maxA: 28, ws: 1.08, hs: 0.76 },
    headerTitle: "Green Sea Turtle",
    headerLeading: ms(18),
    finalFooter: { text: "Only 15 Green Sea Turtle\nnests in Israel" },
    finalBody: {
      text: "Smart everyday choices can\nhelp protect Green Sea\nTurtles. Reducing plastic,\nchoosing reusable products\nand keeping beaches clean\ncan help Green Sea Turtles\nsurvive in nature."
    },
    feedback: { good: PLATFORM_TEXT_RGB, bad: PLATFORM_TEXT_RGB, y: my(690), rgb: false },
    pipeline: ["bg", "animal", "finalTimer", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: true,
    nextClickCount(stage) { return stage + 1; },
    randomSeed: 100,
    totalPieces: 15,
    pieceRandom: { x: [-330, 330], y: [-330, 330], speed: [0.004, 0.011], wobble: true },
    tGroupLerp: 0.035,
    triWeight: 1.1,
    getPieceGroup(index) {
      if (index < 4) return 0;
      if (index < 7) return 1;
      if (index < 13) return 2;
      return 3;
    },
    assembleZones: [
      { cx: 580, cy: 390, rx: 248, ry: 178, influence: 1.02 },
      { cx: 540, cy: 535, rx: 224, ry: 145, influence: 1.02 },
      { cx: 210, cy: 385, rx: 200, ry: 178, influence: 1.02 },
      { cx: 385, cy: 625, rx: 168, ry: 156, influence: 1.02 }
    ],
    loosePiece: {
      pivot: { x: 500, y: 500 },
      scatter: { x: 0, y: 0 },
      hyenaStyleRepel: true,
      assembleClearance: ms(20),
      drawTransform: {
        originX: ANIMAL_REF_W / 2 - 5,
        originY: 400,
        scale: 0.62,
        pivotX: 500,
        pivotY: 500
      },
      composition: {
        left: mx(20),
        right: platformW - mx(20),
        top: my(96),
        bottom: my(698),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "circular",
        centerU: 0.5,
        centerV: 0.44,
        coreCount: 6,
        coreInner: 0.02,
        coreOuter: 0.16,
        corePow: 0.5,
        outerInner: 0.07,
        outerOuter: 0.38,
        outerPow: 0.44,
        radiusScaleX: 1.08,
        radiusScaleY: 1.42,
        uMin: 0.06,
        uMax: 0.94,
        vMin: 0.08,
        vMax: 0.84,
        screenShift: { x: 0, y: 0 },
        placement: "bbox"
      },
      floatAmp: 5,
      homeMaxDisp: ms(22),
      looseRepelFollow: 0.22,
      pieceGeo: PLATFORM_TURTLE_PIECE_GEO
    },
    choiceStages: [
      {
        left: { img: "plasticBag", label: "Plastic bag" },
        right: { img: "fabricBag", label: "Fabric bag" }
      },
      {
        left: { img: "reusableBottle", label: "Reusable bottle" },
        right: { img: "plasticBottle", label: "Plastic bottle" },
        correctSide: "left"
      },
      {
        left: { img: "cigaretteOnly", label: "On the floor" },
        right: { img: "cigaretteAshtray", label: "In the ashtray" }
      }
    ],
    drawAnimal: drawTurtleAnimal,
    applyPiece: applyTurtlePieceTransform
  }),
  eagle: posterCreateState("eagle", {
    finalClickCount: 3,
    textColor: PLATFORM_TEXT_COLOR,
    choiceButtonColor: "#c7aa89",
    choiceImageColor: "#3F3128",
    choiceImageDesaturate: 0.28,
    textRgb: PLATFORM_TEXT_RGB,
    bgTop: "#ECE9E1",
    bgBottom: "#DDBA90",
    glow: { r: 243, g: 230, b: 212, cy: my(390), maxR: mx(520), step: 18, maxA: 23, ws: 1.02, hs: 0.74 },
    headerTitle: "Eurasian Griffon Vulture",
    headerLeading: ms(64),
    finalFooter: { text: "About 180 Griffon\nVultures left in Israel" },
    finalBody: {
      text: "Smart everyday choices\ncan help protect Griffon\nVultures. Reducing waste\nand keeping nature clean\ncan help Griffon Vultures\nsurvive across the\nIsraeli skies."
    },
    feedback: { rgb: true, y: my(690) },
    pipeline: ["bg", "animal", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: false,
    nextClickCount(stage) {
      return stage + 1;
    },
    randomSeed: 100,
    totalPieces: 19,
    pieceRandom: {
      x: [-280, 280],
      y: [-280, 280],
      speed: [0.004, 0.01],
      wobble: true,
      rot: [-0.45, 0.45]
    },
    tGroupLerp: 0.035,
    triWeight: 0.95,
    getPieceGroup(index) {
      if (index < 4) return 3;
      if (index < 10) return 0;
      if (index < 14) return 1;
      return 2;
    },
    assembleZones: [
      { cx: 282, cy: 245, rx: 142, ry: 148, influence: 1.02 },
      { cx: 470, cy: 440, rx: 150, ry: 140, influence: 1.02 },
      { cx: 520, cy: 520, rx: 220, ry: 200, influence: 1.02 },
      { cx: 565, cy: 880, rx: 175, ry: 130, influence: 1.02 }
    ],
    loosePiece: {
      pivot: { x: 500, y: 500 },
      scatter: { x: 0, y: 0 },
      hyenaStyleRepel: true,
      assembleClearance: ms(20),
      // Same circular scatter as turtle/deer/toad; eagle ceiling still
      // enforced in platformLooseCircularAdjustLooseTargets.
      drawTransform: {
        originX: ANIMAL_REF_W / 2 - 42,
        originY: PLATFORM_EAGLE_FINAL_ORIGIN_Y,
        scale: PLATFORM_EAGLE_ANIMAL_SCALE,
        pivotX: 500,
        pivotY: 500
      },
      composition: {
        left: mx(20),
        right: platformW - mx(20),
        top: my(96),
        bottom: my(698),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "circular",
        centerU: 0.5,
        centerV: 0.44,
        coreCount: 8,
        coreInner: 0.02,
        coreOuter: 0.16,
        corePow: 0.5,
        outerInner: 0.07,
        outerOuter: 0.38,
        outerPow: 0.44,
        radiusScaleX: 1.08,
        radiusScaleY: 1.42,
        uMin: 0.06,
        uMax: 0.94,
        vMin: 0.08,
        vMax: 0.84,
        screenShift: { x: 0, y: 0 },
        placement: "bbox"
      },
      floatAmp: 5,
      homeMaxDisp: ms(22),
      looseRepelFollow: 0.22,
      pieceGeo: PLATFORM_EAGLE_PIECE_GEO
    },
    choiceStages: [
      {
        left: { img: "glassCup", label: "Glass cup" },
        right: { img: "plasticCup", label: "Plastic cup" },
        correctSide: "left"
      },
      {
        left: { img: "sandwichBox", label: "Sandwich box" },
        right: { img: "sandwichPlastic", label: "Plastic packaging" },
        correctSide: "left"
      },
      {
        left: { img: "plasticFork", label: "Disposable cutlery" },
        right: { img: "reusableFork", label: "Reusable cutlery" }
      }
    ],
    drawAnimal: drawEagleAnimal,
    applyPiece: applyEaglePieceTransform
  }),
  deer: posterCreateState("deer", {
    finalClickCount: 3,
    textColor: PLATFORM_TEXT_COLOR,
    choiceButtonColor: "#ddb991",
    choiceImageColor: PLATFORM_TEXT_COLOR,
    bgTop: "#F4D4B8",
    bgBottom: "#DFA173",
    glow: { r: 255, g: 232, b: 198, cy: my(430), maxR: mx(520), step: 18, maxA: 24, ws: 1.02, hs: 0.74 },
    headerTitle: "Acacia Gazelle",
    headerLeading: ms(64),
    finalFooter: { text: "46 Acacia Gazelles\nleft in Israel" },
    finalBody: {
      text: "Smart everyday choices can\nhelp protect Acacia Gazelles.\nReducing waste, choosing\nresponsible products, and\nkeeping nature clean can\nhelp Acacia Gazelles survive."
    },
    textRgb: PLATFORM_TEXT_RGB,
    feedback: { rgb: true, y: my(700) },
    pipeline: ["bg", "animal", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: true,
    nextClickCount(stage) { return stage + 1; },
    randomSeed: 12,
    totalPieces: 38,
    pieceRandom: { x: [-320, 320], y: [-360, 360], speed: [0.004, 0.011], wobble: true },
    tGroupLerp: 0.035,
    triWeight: 1.1,
    getPieceGroup(index) {
      if (index < 9) return 1;
      if (index < 22) return 0;
      if (index < 28) return 2;
      return 3;
    },
    assembleZones: [
      { cx: 148, cy: 302, rx: 172, ry: 192, influence: 1.02 },
      { cx: 398, cy: 476, rx: 242, ry: 172, influence: 1.02 },
      { cx: 308, cy: 712, rx: 152, ry: 192, influence: 1.02 },
      { cx: 558, cy: 668, rx: 202, ry: 228, influence: 1.02 }
    ],
    loosePiece: {
      pivot: { x: 345, y: 498 },
      scatter: { x: 0, y: 0 },
      drawTransform: {
        originX: PLATFORM_DEER_FINAL_ORIGIN_X,
        originY: PLATFORM_DEER_FINAL_ORIGIN_Y,
        scale: PLATFORM_DEER_ANIMAL_SCALE,
        pivotX: 0,
        pivotY: 0
      },
      composition: {
        left: mx(20),
        right: platformW - mx(20),
        top: my(96),
        bottom: my(698),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "circular",
        centerU: 0.5,
        centerV: 0.44,
        coreCount: 15,
        coreInner: 0.02,
        coreOuter: 0.16,
        corePow: 0.5,
        outerInner: 0.07,
        outerOuter: 0.38,
        outerPow: 0.44,
        radiusScaleX: 1.08,
        radiusScaleY: 1.42,
        uMin: 0.06,
        uMax: 0.94,
        vMin: 0.08,
        vMax: 0.84,
        screenShift: { x: 0, y: 0 },
        placement: "bbox"
      },
      hyenaStyleRepel: true,
      assembleClearance: ms(26),
      floatAmp: 4,
      looseRepelFollow: 0.22,
      pieceGeo: PLATFORM_DEER_PIECE_GEO
    },
    choiceStages: [
      {
        left: { img: "garbageBin", label: "Throw in the bin" },
        right: { img: "garbageFloor", label: "On the floor" },
        correctSide: "left"
      },
      {
        left: { img: "cigaretteOnly", label: "On the floor" },
        right: { img: "cigaretteAshtray", label: "In the ashtray" }
      },
      {
        left: { img: "glassCup", label: "Glass cup" },
        right: { img: "plasticCup", label: "Plastic cup" },
        correctSide: "left"
      }
    ],
    drawAnimal: drawDeerAnimal
  }),
  toad: posterCreateState("toad", {
    finalClickCount: 3,
    textColor: PLATFORM_TEXT_COLOR,
    textRgb: PLATFORM_TEXT_RGB,
    choiceButtonColor: "#c1b783",
    choiceImageColor: "#3F4636",
    headerTitle: "Pelobates Syriacus",
    headerLeading: ms(18),
    finalFooter: { text: "Only a few populations\nremain in Israel" },
    finalBody: {
      text: "Pelobates Syriacus depends\non seasonal ponds and clean\nwetlands to survive. Reducing\npollution and making better\nchoices can help them survive\nin their natural habitat."
    },
    feedback: { rgb: true, y: my(690) },
    pipeline: ["bg", "animal", "finalTimer", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: true,
    nextClickCount(stage) { return stage + 1; },
    isFullyAssembled(p) {
      return (
        p.clickCount >= 3 &&
        p.tGroup[0] > 0.96 &&
        p.tGroup[1] > 0.96 &&
        p.tGroup[2] > 0.96 &&
        p.tGroup[3] > 0.96
      );
    },
    randomSeed: 140,
    totalPieces: 33,
    pieceRandom: { x: [-350, 350], y: [-330, 330], speed: [0.004, 0.011], wobble: true },
    getPieceGroup(index) {
      if (index < 8) return 0;
      if (index < 20) return 1;
      if (index < 29) return 2;
      return 3;
    },
    assembleZones: [
      { cx: 528, cy: 420, rx: 250, ry: 150, influence: 1.05 },
      { cx: 268, cy: 445, rx: 190, ry: 185, influence: 1.05 },
      { cx: 620, cy: 640, rx: 210, ry: 175, influence: 1.02 },
      { cx: 280, cy: 680, rx: 185, ry: 165, influence: 1.02 }
    ],
    loosePiece: {
      pivot: { x: 500, y: 500 },
      scatter: { x: 0, y: 0 },
      pieceGeo: PLATFORM_TOAD_PIECE_GEO,
      hyenaStyleRepel: true,
      assembleClearance: ms(34),
      floatAmp: 8,
      looseRepelFollow: 0.2,
      looseRepelStepMax: ms(16),
      drawTransform: {
        originX: ANIMAL_REF_W / 2 - 5,
        originY: 432,
        scale: 0.62,
        scaleX: -0.62,
        scaleY: 0.62,
        pivotX: 500,
        pivotY: 500
      },
      composition: {
        left: mx(20),
        right: platformW - mx(20),
        top: my(96),
        bottom: my(698),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "circular",
        centerU: 0.5,
        centerV: 0.44,
        coreCount: 13,
        coreInner: 0.02,
        coreOuter: 0.16,
        corePow: 0.5,
        outerInner: 0.07,
        outerOuter: 0.38,
        outerPow: 0.44,
        radiusScaleX: 1.08,
        radiusScaleY: 1.42,
        uMin: 0.06,
        uMax: 0.94,
        vMin: 0.08,
        vMax: 0.84,
        screenShift: { x: 0, y: 0 },
        placement: "bbox"
      }
    },
    choiceStages: [
      {
        left: { img: "reusableBottle", label: "Reusable bottle" },
        right: { img: "plasticBottle", label: "Plastic bottle" },
        correctSide: "left"
      },
      {
        left: { img: "plasticFork", label: "Disposable cutlery" },
        right: { img: "reusableFork", label: "Reusable cutlery" }
      },
      {
        left: { img: "plasticBag", label: "Plastic bag" },
        right: { img: "fabricBag", label: "Fabric bag" }
      }
    ],
    drawAnimal: drawPelobatesAnimal
  }),
  hyena: posterCreateState("hyena", {
    finalClickCount: 3,
    textColor: PLATFORM_TEXT_COLOR,
    textRgb: PLATFORM_TEXT_RGB,
    choiceButtonColor: "#b4895d",
    choiceImageColor: "#433A31",
    headerTitle: "Striped Hyena",
    headerLeading: ms(64),
    finalFooter: { text: "About 1,000 Striped\nHyenas left in Israel" },
    finalBody: {
      text: "Smart everyday choices can\nhelp protect Striped Hyenas.\nReducing waste and keeping\nnature clean can prevent\nharm to wildlife and help\nStriped Hyenas survive."
    },
    feedback: { rgb: true, y: my(700) },
    pipeline: ["bg", "animal", "finalTimer", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: true,
    nextClickCount(stage) { return stage + 1; },
    randomSeed: 42,
    totalPieces: 80,
    pieceRandom: { x: [-320, 320], y: [-360, 360], speed: [0.004, 0.011], wobble: true },
    tGroupLerp: 0.04,
    getPieceGroup(index) {
      if (index < 32) return 1;
      if (index < 48) return 0;
      if (index < 59) return 2;
      return 3;
    },
    loosePiece: {
      assembleClearance: ms(14),
      looseRepelFollow: 0.14
    },
    choiceStages: [
      {
        left: { img: "plasticBag", label: "Plastic bag" },
        right: { img: "fabricBag", label: "Fabric bag" }
      },
      {
        left: { img: "sandwichBox", label: "Sandwich box" },
        right: { img: "sandwichPlastic", label: "Plastic packaging" },
        correctSide: "left"
      },
      {
        left: { img: "garbageBin", label: "Throw in the bin" },
        right: { img: "garbageFloor", label: "On the floor" },
        correctSide: "left"
      }
    ],
    drawAnimal: drawHyenaAnimal
  })
};

function platformClearSharedPosterCaches() {
  hyenaLooseTargetCache = null;
  hyenaLooseTargetCacheH = 0;
  hyenaLooseTargetCacheVersion = 0;

  for (let key in platformPelobatesTargetCache) {
    delete platformPelobatesTargetCache[key];
  }
  for (let key in platformLooseTargetCache) {
    delete platformLooseTargetCache[key];
  }
  for (let key in platformLooseGroupBBoxCache) {
    delete platformLooseGroupBBoxCache[key];
  }
  platformLooseConnectedUnionCache = {};
  platformLooseConnectedUnionCacheKey = "";
  for (let id in posterRegistry) {
    let cfg = posterRegistry[id] && posterRegistry[id].cfg;
    if (cfg) {
      cfg._looseProfile = null;
      cfg._looseProfileVer = -1;
      cfg._looseCornerExt = null;
    }
  }
}

function platformPosterTGroupTarget(p, groupIndex) {
  let cc = p.clickCount;

  if (groupIndex <= 1) {
    return cc >= groupIndex + 1 ? 1 : 0;
  }

  return cc >= 3 ? 1 : 0;
}

function platformLerpPosterTGroup(p, groupIndex, normalRate) {
  if (platformSharePreviewStill) {
    p.tGroup[groupIndex] = 1;
    return;
  }

  let rate = normalRate;

  if (p.disassembleBoost > 0) {
    rate = normalRate * 0.62;
  }

  let target = platformPosterTGroupTarget(p, groupIndex);
  p.tGroup[groupIndex] = lerp(p.tGroup[groupIndex], target, rate);
}

function platformLooseRepelFollowRate(p, baseFollow) {
  if (p.disassembleRepelWarmup > 0) {
    return min(baseFollow, 0.05);
  }

  return baseFollow;
}

function platformDecayDisassembleRepelState(p) {
  if (p.disassembleBoost > 0 && p.looseRepelSmooth) {
    for (let i = 0; i < p.looseRepelSmooth.length; i++) {
      let d = p.looseRepelSmooth[i] || { x: 0, y: 0 };
      p.looseRepelSmooth[i] = {
        x: lerp(d.x, 0, 0.22),
        y: lerp(d.y, 0, 0.22)
      };
    }
  }

  if (p.disassembleRepelWarmup > 0) {
    p.disassembleRepelWarmup--;
  }
}

function platformPosterFinishDisassemble(p) {
  p.looseRepelCacheGen = -1;
  p.disassembleRepelWarmup = 75;
  p.looseRepelBlendT = 0;
}

function platformTickPosterDisassemble(p) {
  if (p.disassembleBoost <= 0) {
    return;
  }

  let maxT = max(p.tGroup[0], p.tGroup[1], p.tGroup[2], p.tGroup[3]);

  if (maxT < 0.025) {
    p.disassembleBoost = 0;
    platformPosterFinishDisassemble(p);
    return;
  }

  p.disassembleBoost--;
}

function posterRestartFromWrongAnswer(p) {
  if (p.clickCount <= 0) {
    return;
  }

  p.clickCount = 0;
  p.progressFillActive = false;
  p.progressFillT = 0;
  p.progressFillIndex = -1;
  p.disassembleBoost = 320;
  p.disassembleRepelWarmup = 0;
  p.looseRepelBlendT = 0;
  p.looseWobbleDampen = null;
  p.toadRepelBoost = 0;
  p.finalStart = null;
  p.jumpReadyTime = null;
  p.jumpDelayMs = 0;
  p.toadFirstJumpDone = false;
  p.audioFinalRevealPlayed = false;
}

function posterReset(p) {
  p.clickCount = 0;
  p.tGroup = [0, 0, 0, 0];
  p.looseRepelSmooth = null;
  p.looseWobbleDampen = null;
  p.looseRepelCache = null;
  p.looseRepelCacheGen = -1;
  p.looseRepelBlendT = 0;
  p.toadRepelBoost = 0;
  p.feedback = { text: "", timer: 0, good: false };
  p.pulse = { positive: 0, wrongSide: "", wrongShake: 0, pieceShake: 0, pieceShakeKind: "" };
  p.disassembleBoost = 0;
  p.disassembleRepelWarmup = 0;
  p.finalStart = null;
  p.finalActionBoxes = null;
  p.jumpReadyTime = null;
  p.jumpDelayMs = 0;
  p.toadFirstJumpDone = false;
  p.audioFinalRevealPlayed = false;
  p.finalMotion = 0;
  p.deer = {
    x: PLATFORM_DEER_FINAL_ORIGIN_X,
    y: PLATFORM_DEER_FINAL_ORIGIN_Y,
    scale: PLATFORM_DEER_ANIMAL_SCALE,
    drawX: PLATFORM_DEER_FINAL_ORIGIN_X,
    drawY: PLATFORM_DEER_FINAL_ORIGIN_Y
  };
  p.hyena = { x: 26, y: -8, scale: 0.6, drawX: 26, drawY: -8 };
  p.wrongFallT = 0;
  p.wrongFallActive = false;
  p.wrongWaitT = 0;
  p.wrongWaitActive = false;
  p.wrongRiseT = 0;
  p.wrongRiseActive = false;
  p.wrongFallEls = null;
  p.wrongFallPieces = null;
  p.progressFillActive = false;
  p.progressFillT = 0;
  p.progressFillIndex = -1;
  p.pieceOffsets = [];
  p.leftBox = null;
  p.rightBox = null;
}

function posterResetAll() {
  posterReset(posterRegistry.turtle);
  posterReset(posterRegistry.eagle);
  posterReset(posterRegistry.toad);
  posterReset(posterRegistry.hyena);
  posterReset(posterRegistry.deer);
  platformClearSharedPosterCaches();
}

function posterPreloadAll() {
  let assets = platformLoadSharedPosterAssets();

  for (let id in posterRegistry) {
    posterPreload(id, assets);
  }
}

function posterPreload(id, assets) {
  let p = posterRegistry[id];
  assets = assets || platformLoadSharedPosterAssets();
  p.grungeFont = assets.grungeFont;
  p.images = {
    plasticBag: assets.plasticBagImg,
    fabricBag: assets.fabricBagImg,
    plasticBottle: assets.plasticBottleImg,
    reusableBottle: assets.reusableBottleImg,
    plasticFork: assets.plasticForkImg,
    reusableFork: assets.reusableForkImg,
    garbageBin: assets.garbageBinImg,
    garbageFloor: assets.garbageFloorImg,
    cigaretteAshtray: assets.cigaretteAshtrayImg,
    cigaretteOnly: assets.cigaretteOnlyImg,
    sandwichBox: assets.sandwichBoxImg,
    sandwichPlastic: assets.sandwichPlasticImg,
    glassCup: assets.glassCupImg,
    plasticCup: assets.plasticCupImg
  };
}

function posterSetup(id) {
  let p = posterRegistry[id];
  let cfg = p.cfg;
  platformApplyCanvasSize();
  platformSyncActiveQuestionNudge(p);
  platformApplyGrungeFont(p.grungeFont);
  posterRefreshChoiceBoxes(p);
  randomSeed(cfg.randomSeed);
  p.looseRepelSmooth = null;
  p.looseWobbleDampen = null;
  p.pieceOffsets = [];
  for (let i = 0; i < cfg.totalPieces; i++) {
    let r = cfg.pieceRandom;
    let entry = {
      x: random(r.x[0], r.x[1]),
      y: random(r.y[0], r.y[1]),
      rot: r.rot ? random(r.rot[0], r.rot[1]) : random(-TWO_PI, TWO_PI),
      speedX: random(r.speed[0], r.speed[1]),
      speedY: random(r.speed[0], r.speed[1]),
      phase: random(TWO_PI)
    };
    if (r.wobble) entry.wobble = random(0.7, 1.25);
    p.pieceOffsets.push(entry);
  }
}

function posterGetFinalAlpha(p) {
  return platformGetFinalRevealAlpha(
    p.clickCount,
    p.cfg.finalClickCount,
    p.finalStart,
    POSTER_LAYOUT.finalIntro,
    POSTER_LAYOUT.finalFade
  );
}

function posterUpdateFinalTimer(p) {
  let cfg = p.cfg;
  if (p.clickCount < cfg.finalClickCount) {
    p.finalStart = null;
    return;
  }
  if (cfg.requiresFullAssemblyForFinal && cfg.isFullyAssembled && !cfg.isFullyAssembled(p)) {
    p.finalStart = null;
    return;
  }
  if (p.finalStart === null) {
    p.finalStart = millis();
    if (p.id !== "toad") {
      platformNotifyFinalReveal(p);
    }
  }
  // Toad great-success SFX when pieces lock (text already started on 3rd click).
  if (p.id === "toad" && cfg.isFullyAssembled && cfg.isFullyAssembled(p)) {
    platformNotifyFinalReveal(p);
  }
}

function posterDrawBackground(p) {
  platformDrawMainBackground();
}

function platformHandlePosterBackPress() {
  if (platformMode === "intro" || platformMode === "loading" || platformShareOpen) {
    return false;
  }

  let p = posterRegistry[platformMode];
  if (!p || !p.backButtonBox) {
    return false;
  }

  if (platformWasBoxClicked(p.backButtonBox)) {
    platformPlayUiOpenSfx();
    platformReturnToIntro();
    return true;
  }

  return false;
}

function posterGetBelowHeaderNudgeY() {
  return POSTER_LAYOUT.posterBelowHeaderNudgeY;
}

function posterGetQuestionPlayNudgeY(p) {
  if (!p || !p.cfg || p.clickCount >= p.cfg.finalClickCount) {
    return 0;
  }
  return POSTER_LAYOUT.questionPlayNudgeY;
}

function posterGetChoicePanelY(p) {
  return (
    POSTER_LAYOUT.choiceY +
    posterGetQuestionPlayNudgeY(p) +
    POSTER_LAYOUT.choicePanelNudgeY
  );
}

function platformGetChoiceLayoutNudgeY() {
  return platformActivePosterQuestionNudgeY + POSTER_LAYOUT.choicePanelNudgeY;
}

function platformSyncActiveQuestionNudge(p) {
  platformActivePosterQuestionNudgeY = posterGetQuestionPlayNudgeY(p);
}

function posterGetHeaderLineY() {
  return (
    POSTER_LAYOUT.headerLineY +
    POSTER_LAYOUT.headerNudgeY +
    POSTER_LAYOUT.headerLineNudgeY +
    POSTER_LAYOUT.headerRowNudgeY +
    posterGetBelowHeaderNudgeY()
  );
}

function posterGetHeaderLayout() {
  let nameY =
    POSTER_LAYOUT.headerTextY +
    POSTER_LAYOUT.headerNudgeY +
    POSTER_LAYOUT.headerNameNudgeY +
    POSTER_LAYOUT.headerRowNudgeY;
  let nameSize = POSTER_LAYOUT.headerNameSize;
  let backSize = POSTER_LAYOUT.backButtonSize;
  let contentX = POSTER_LAYOUT.headerTextX + POSTER_LAYOUT.headerBackNudgeX;
  let backBox = {
    x: contentX,
    y: nameY + nameSize / 2 - backSize / 2 + POSTER_LAYOUT.headerBackNudgeY,
    w: backSize,
    h: backSize
  };

  return {
    backBox,
    nameX:
      backBox.x +
      backBox.w +
      POSTER_LAYOUT.backButtonLabelGap +
      POSTER_LAYOUT.headerNameNudgeX,
    nameY,
    nameSize,
    backSize
  };
}

function posterDrawBackButton(p, box, textColor) {
  let hover =
    !p.touchDevice &&
    mouseX > box.x &&
    mouseX < box.x + box.w &&
    mouseY > box.y &&
    mouseY < box.y + box.h;
  let c = color(textColor);
  c.setAlpha(hover ? 220 : 255);
  noFill();
  stroke(c);
  strokeWeight(POSTER_LAYOUT.backButtonStrokeWeight);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  let glyph = POSTER_LAYOUT.backButtonGlyphSize;
  let cx = box.x + box.w * 0.5;
  let cy = box.y + box.h / 2;
  let armLen = glyph * 0.18;
  let spreadY = glyph * 0.17;
  let tipX = cx - armLen;

  line(cx, cy - spreadY, tipX, cy);
  line(tipX, cy, cx, cy + spreadY);
}

function posterDrawFrame(p) {
  let cfg = p.cfg;
  let lineY = posterGetHeaderLineY();
  strokeWeight(POSTER_LAYOUT.frameStrokeWeight);
  noFill();
  stroke(cfg.textColor);
  line(POSTER_LAYOUT.marginX, lineY, platformW - POSTER_LAYOUT.marginX, lineY);

  if (p.clickCount < cfg.finalClickCount) {
    let fProg = wrongFallGetElemTransform(p, "progress");
    push();
    translate(fProg.x, fProg.y);
    platformDrawQuestionProgress(p);
    pop();
  }
}

function posterDrawHeader(p) {
  let cfg = p.cfg;
  let layout = posterGetHeaderLayout();
  p.backButtonBox = layout.backBox;

  posterDrawBackButton(p, layout.backBox, cfg.textColor);

  noStroke();
  fill(cfg.textColor);
  platformApplyGrungeFont(p.grungeFont);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  textSize(layout.nameSize);
  textLeading(cfg.headerLeading);
  text(cfg.headerTitle, layout.nameX, layout.nameY);
}

function posterDrawQuestionUI(p) {
  let cfg = p.cfg;
  noStroke();
  platformApplyGrungeFont(p.grungeFont);
  textStyle(NORMAL);

  if (p.clickCount >= cfg.finalClickCount) {
    let alpha = posterGetFinalAlpha(p);
    if (alpha > 0) {
      posterDrawFinalMessage(p, alpha);
    }
    return;
  }

  let questionNudge = posterGetQuestionPlayNudgeY(p);
  push();
  translate(0, questionNudge);

  // Question title — its own fall
  let fQ = wrongFallGetElemTransform(p, "question");
  push();
  translate(fQ.x, fQ.y);
  rotate(fQ.rot);
  platformDrawQuestionTitle(cfg.textColor);
  pop();

  platformDrawWrongTryAgain(p, cfg.textColor);

  // Choices — left and right each fall independently
  let stages = cfg.choiceStages || platformChoiceStages;
  if (p.clickCount < stages.length && p.leftBox && p.rightBox) {
    let stage = stages[p.clickCount];

    let fL = wrongFallGetElemTransform(p, "choiceL");
    push();
    translate(fL.x, fL.y);
    rotate(fL.rot);
    posterDrawChoicePanel(p, p.leftBox.x, p.leftBox.y, p.leftBox.w, p.leftBox.h,
      p.images[stage.left.img], stage.left.label, stage.left.img, stage.left);
    pop();

    let fR = wrongFallGetElemTransform(p, "choiceR");
    push();
    translate(fR.x, fR.y);
    rotate(fR.rot);
    posterDrawChoicePanel(p, p.rightBox.x, p.rightBox.y, p.rightBox.w, p.rightBox.h,
      p.images[stage.right.img], stage.right.label, stage.right.img, stage.right);
    pop();
  }

  pop();
}

function posterDrawChoicePanel(p, x, y, w, h, img, label, imgId, choice = {}) {
  platformDrawChoicePanel({
    x, y, w, h, img, label, imgId,
    overlayImg: choice.overlayImg ? p.images[choice.overlayImg] : null,
    overlayBlendMode: choice.overlayBlendMode,
    leftBoxX: p.leftBox.x,
    isTouchDevice: p.touchDevice,
    animalId: p.id,
    textColor: p.cfg.textColor,
    buttonColor: p.cfg.choiceButtonColor,
    font: p.grungeFont
  });
}

function posterDrawFinalMessage(p, alphaOverride = null) {
  let cfg = p.cfg;
  if (p.finalStart === null && p.clickCount >= cfg.finalClickCount) {
    if (!cfg.requiresFullAssemblyForFinal || !cfg.isFullyAssembled || cfg.isFullyAssembled(p)) {
      p.finalStart = millis();
    }
  }
  let alpha = alphaOverride === null ? posterGetFinalAlpha(p) : alphaOverride;
  if (alpha <= 0) return;

  let c = color(cfg.textColor);
  c.setAlpha(alpha);
  fill(c);
  platformApplyGrungeFont(p.grungeFont);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  noStroke();
  let leftCellX = POSTER_LAYOUT.marginX;

  let bodySize = ms(20);
  let bodyLeading = platformGetFinalBodyLeading(cfg);
  textSize(bodySize);
  textLeading(bodyLeading);
  let bodyLineCount = cfg.finalBody.text.split("\n").length;
  let bodyBlockH = (bodyLineCount - 1) * bodyLeading + bodySize;
  let bodyY =
    platformGetFinalBodyTopY() +
    POSTER_LAYOUT.finalContentYOffset +
    POSTER_LAYOUT.finalMessageNudgeY +
    POSTER_LAYOUT.finalPosterNudgeY;
  let bodyX =
    POSTER_LAYOUT.finalBodyX +
    POSTER_LAYOUT.finalBodyXOffset +
    POSTER_LAYOUT.finalBodyXNudge +
    (cfg.finalBody.xOffset ?? 0);

  textSize(platformText.finalTitle.size);
  textLeading(platformText.finalTitle.leading);
  let titleLineCount = platformText.finalTitle.lines.length;
  let titleBlockH =
    (titleLineCount - 1) * platformText.finalTitle.leading + platformText.finalTitle.size;
  let titleY =
    bodyY + (bodyBlockH - titleBlockH) / 2 + POSTER_LAYOUT.finalTitleYOffset;
  let finalTitleX = leftCellX + 25;

  textAlign(LEFT, TOP);
  for (let i = 0; i < titleLineCount; i++) {
    text(
      platformText.finalTitle.lines[i],
      finalTitleX,
      titleY + i * platformText.finalTitle.leading
    );
  }

  textSize(bodySize);
  textLeading(bodyLeading);
  textAlign(LEFT, TOP);
  text(cfg.finalBody.text, bodyX, bodyY);
}

function posterDrawFeedback(p) {
  if (p.feedback.timer <= 0 || p.feedback.text === "") return;
  p.feedback.timer--;
  let alpha = constrain(map(p.feedback.timer, 0, 80, 0, 255), 0, 255);
  noStroke();
  let fb = p.cfg.feedback;
  if (fb.rgb) {
    fill(p.cfg.textRgb[0], p.cfg.textRgb[1], p.cfg.textRgb[2], alpha);
  } else {
    let rgb = p.feedback.good ? fb.good : fb.bad;
    fill(rgb[0], rgb[1], rgb[2], alpha);
  }
  platformApplyGrungeFont(p.grungeFont);
  textAlign(CENTER, CENTER);
  textSize(ms(20));
  textStyle(NORMAL);
  text(p.feedback.text, platformW / 2, fb.y + 40 + POSTER_LAYOUT.feedbackNudgeY);
}

function posterDrawFooter(p) {
  let cfg = p.cfg;
  if (p.clickCount < cfg.finalClickCount) return;

  noStroke();
  platformApplyGrungeFont(p.grungeFont);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);

  let alpha = posterGetFinalAlpha(p);
  if (alpha <= 0) return;
  if (cfg.textRgb) {
    fill(cfg.textRgb[0], cfg.textRgb[1], cfg.textRgb[2], alpha);
  } else {
    let c = color(cfg.textColor);
    c.setAlpha(alpha);
    fill(c);
  }
  textSize(platformText.preFinalFooter.size);
  textLeading(platformText.finalFooter.leading);
  platformDrawTightWordText(
    cfg.finalFooter.text,
    platformText.questionTitle.x,
    platformText.introTitle.y +
    POSTER_LAYOUT.finalFooterNudgeY +
    posterGetBelowHeaderNudgeY(),
    platformText.finalFooter.leading
  );
}

function wrongFallTotalFrames(p) {
  let max = 0;
  if (p.wrongFallEls) {
    for (let k in p.wrongFallEls) {
      let el = p.wrongFallEls[k];
      max = Math.max(max, el.delayF + el.fallF);
    }
  }
  if (p.wrongFallPieces) {
    for (let el of p.wrongFallPieces) {
      max = Math.max(max, el.delayF + el.fallF);
    }
  }
  return max + 6;
}

function posterTickWrongAnimation(p) {
  if (p.wrongFallActive) {
    p.wrongFallT++;
    let total = wrongFallTotalFrames(p);
    if (p.wrongFallT >= total) {
      p.wrongFallActive = false;
      p.wrongFallT = total; // keep at max so elements stay off-screen during wait
      posterRestartFromWrongAnswer(p);
      p.wrongWaitActive = true;
      p.wrongWaitT = 0;
    }
  }
  if (p.wrongWaitActive) {
    p.wrongWaitT++;
    if (p.wrongWaitT >= WRONG_WAIT_FRAMES) {
      p.wrongWaitActive = false;
      p.wrongWaitT = 0;
      p.wrongRiseActive = true;
      p.wrongRiseT = 0;
    }
  }
  if (p.wrongRiseActive) {
    p.wrongRiseT++;
    if (p.wrongRiseT >= WRONG_RISE_FRAMES) {
      p.wrongRiseActive = false;
      p.wrongRiseT = 0;
    }
  }
}

function posterDraw(id) {
  let p = posterRegistry[id];
  let cfg = p.cfg;
  platformSyncActiveQuestionNudge(p);
  posterEnsurePlayReady(p);
  posterTickWrongAnimation(p);
  platformTickProgressFill(p);
  platformLooseBeginRepelFrame(p);
  platformLooseTickRepelBlend(p);
  platformTickPosterDisassemble(p);
  platformDecayDisassembleRepelState(p);
  for (let step of cfg.pipeline) {
    if (step === "clear") background(cfg.clearColor);
    else if (step === "bg") posterDrawBackground(p);
    else if (step === "header") posterDrawHeader(p);
    else if (step === "animal") posterDrawAnimalMobile(p);
    else if (step === "finalTimer") posterUpdateFinalTimer(p);
    else if (step === "question") posterDrawQuestionUI(p);
    else if (step === "footer") posterDrawFooter(p);
    else if (step === "feedback") posterDrawFeedback(p);
    else if (step === "frame") posterDrawFrame(p);
  }
  platformUpdateFeedbackTimers(id);
  if (p.clickCount >= cfg.finalClickCount) {
    platformTryBakeSharePreviewStill(p);
  }
}

function posterHandleChoicePress(id) {
  let p = posterRegistry[id];
  let cfg = p.cfg;
  if (p.wrongFallActive || p.wrongWaitActive || p.wrongRiseActive) return;
  if (p.progressFillActive) return;
  if (p.clickCount >= cfg.finalClickCount) return;

  let clickedLeft = platformWasBoxClicked(p.leftBox);
  let clickedRight = platformWasBoxClicked(p.rightBox);
  let stages = cfg.choiceStages || platformChoiceStages;
  let stage = p.clickCount;
  if (stage >= stages.length) return;

  let correctSide = stages[stage].correctSide || "right";
  let clickedCorrect =
    (correctSide === "right" && clickedRight) ||
    (correctSide === "left" && clickedLeft);
  let clickedWrong =
    (correctSide === "right" && clickedLeft) ||
    (correctSide === "left" && clickedRight);

  if (clickedCorrect) {
    let newCount = cfg.nextClickCount(stage);
    p.clickCount = newCount;
    // Fire answer SFX before heavy assemble/repel work so iPhone stays in sync.
    platformTriggerCorrectFeedback(id);
    platformStartProgressFill(p, newCount);

    if (id === "toad") {
      // Android: skip the heavy warm-all-pieces spike; lighter boost is enough.
      if (platformIsAndroidDevice()) {
        p.toadRepelBoost = 36;
      } else {
        p.toadRepelBoost = 160;
        platformToadWarmLooseRepel(p);
      }
    } else if (!platformLooseGetProfile(cfg).hyenaStyleRepel) {
      p.looseRepelSmooth = null;
    }

    p.looseRepelCacheGen = -1;
    p.looseRepelBlendT = 0;
    if (cfg.resetFinalOnCorrect && stage < cfg.finalClickCount - 1) {
      p.finalStart = null;
    }
    if (p.clickCount >= cfg.finalClickCount) {
      platformHasCompletedAnyPoster = true;
      if (!cfg.requiresFullAssemblyForFinal) {
        p.finalStart = millis();
        // Toad lock-in SFX waits for visual assembly; text timer starts now like others.
        if (id !== "toad") {
          platformNotifyFinalReveal(p);
        }
      }
    }
  } else if (clickedWrong) {
    if (!p.wrongFallActive && !p.wrongWaitActive && !p.wrongRiseActive) {
      platformPlaySfx("wrong");
      p.wrongFallActive = true;
      p.wrongFallT = 0;
      p.wrongWaitActive = false;
      p.wrongRiseActive = false;
      platformVibrateWrongAnswer();
      p.wrongFallEls = wrongFallBuildUIElements();
      p.wrongFallPieces = wrongFallBuildPieces(p.cfg.totalPieces || 15);
    }
  }
}

function posterMousePressed(id) {
  if (posterHandleNavigationPress(id)) {
    return;
  }
  posterHandleChoicePress(id);
}

function posterHandleNavigationPress(id) {
  let p = posterRegistry[id];
  if (p?.backButtonBox && platformWasBoxClicked(p.backButtonBox)) {
    platformPlayUiOpenSfx();
    platformReturnToIntro();
    return true;
  }
  return false;
}

function posterTouchStarted(id) {
  posterRegistry[id].touchDevice = true;
  if (posterHandleNavigationPress(id)) {
    return false;
  }
  posterHandleChoicePress(id);
  return false;
}

function posterWindowResized(id) {
  platformApplyViewportLayout();
  let p = posterRegistry[id];
  if (p) {
    posterRefreshChoiceBoxes(p);
  }
}

function platformMakeAnimalHandlers(id) {
  return {
    finalClickCount: 3,
    draw: () => posterDraw(id),
    setup: () => posterSetup(id),
    mousePressed: () => posterMousePressed(id),
    touchStarted: () => posterTouchStarted(id),
    windowResized: () => posterWindowResized(id)
  };
}

const platformAnimalHandlers = Object.fromEntries(
  ["turtle", "eagle", "deer", "toad", "hyena"].map((id) => [
    id,
    platformMakeAnimalHandlers(id)
  ])
);

// =====================================================
// ANIMAL ART — unique geometry / motion per species
// Turtle, eagle, deer, toad, hyena draw + piece transforms.
// =====================================================

function drawTurtleAnimal() {
  const p = posterRegistry.turtle;

  platformLerpPosterTGroup(p, 0, 0.035); // shell
  platformLerpPosterTGroup(p, 1, 0.035); // belly
  platformLerpPosterTGroup(p, 2, 0.035); // head / back fin
  platformLerpPosterTGroup(p, 3, 0.035); // front fin

  let turtleIsFullyAssembled =
    p.clickCount >= 3 &&
    p.tGroup[0] > 0.96 &&
    p.tGroup[1] > 0.96 &&
    p.tGroup[2] > 0.96 &&
    p.tGroup[3] > 0.96;

  let finalAlive = turtleIsFullyAssembled;

  p.finalMotion = lerp(p.finalMotion, finalAlive ? 1 : 0, 0.035);

  let animFrame = platformShareAnimFrame();
  let swim = animFrame * 0.045;
  let movement = platformSharePreviewStill ? 0 : p.finalMotion;
  let turtleTurtleX = ANIMAL_REF_W / 2 - 5;
  let turtleTurtleY = 400;
  let turtleTurtleScale = p.cfg.loosePiece.drawTransform.scale;
  let turtleTurtleRot = 0.02;

  // stronger swimming movement
  let floatX =
    sin(swim * 0.72) * 18 * movement +
    sin(swim * 1.45) * 4 * movement;

  let floatY =
    sin(swim * 1.05) * 80 * movement +
    sin(swim * 2.1 + PI * 0.4) * 16 * movement;

  let bodyTilt =
    sin(swim * 0.9) * 0.09 * movement +
    sin(swim * 1.8) * 0.025 * movement;

  let softScale =
    1 + sin(swim * 0.85) * 0.025 * movement;

  push();

  translate(turtleTurtleX + floatX, turtleTurtleY + floatY);
  rotate(turtleTurtleRot + bodyTilt);
  scale(turtleTurtleScale * softScale);
  translate(-500, -500);

  let pts = {
    // head
    noseTop: [120, 295],
    noseBot: [110, 365],
    headTop: [180, 290],

    // neck
    neckBaseTop: [275, 350],
    neckBaseBot: [225, 445],
    neckMidBase: [305, 470],

    // shell
    shellFrontBot: [405, 470],
    shellPeak: [530, 300],
    shellBackTop: [720, 350],
    shellMidBot: [680, 510],
    shellTailTip: [880, 520],

    // belly
    bellyBotFront: [445, 560],
    bellyBotBack: [640, 580],
    bellyBackTip: [790, 520],

    // front fin
    flipFrontMid: [320, 615],
    flipFrontTip: [460, 800],

    // back fin
    flipBackTip: [830, 650],
    flipBackMid: [900, 660]
  };

  if (movement > 0) {
    // head movement — eased in with finalMotion so pose matches the static assembly
    let headFold = lerp(
      1,
      map(sin(swim * 0.7), -1, 1, 0.92, 1.06),
      movement
    );

    pts.headTop = platformFoldPoint(pts.headTop, pts.neckBaseTop, pts.neckBaseBot, headFold);
    pts.noseTop = platformFoldPoint(pts.noseTop, pts.neckBaseTop, pts.neckBaseBot, headFold);
    pts.noseBot = platformFoldPoint(pts.noseBot, pts.neckBaseTop, pts.neckBaseBot, headFold);

    let headMoveX = sin(swim * 0.8) * 7 * movement;
    let headMoveY = cos(swim * 0.9) * 4 * movement;

    pts.noseTop = platformMovePoint(pts.noseTop, headMoveX, headMoveY);
    pts.noseBot = platformMovePoint(pts.noseBot, headMoveX, headMoveY);
    pts.headTop = platformMovePoint(pts.headTop, headMoveX * 0.7, headMoveY * 0.7);

    // stronger front fin swimming motion
    let frontFold = lerp(
      1,
      map(sin(swim * 2.25 + 0.5), -1, 1, 0.46, 1.28),
      movement
    );
    pts.flipFrontTip = platformFoldPoint(
      pts.flipFrontTip,
      pts.flipFrontMid,
      pts.bellyBotFront,
      frontFold
    );

    // stronger back fin swimming motion
    let backFold = lerp(
      1,
      map(sin(swim * 1.85 + PI), -1, 1, 0.62, 1.22),
      movement
    );

    pts.flipBackTip = platformFoldPoint(
      pts.flipBackTip,
      pts.bellyBotBack,
      pts.bellyBackTip,
      backFold
    );

    pts.flipBackMid = platformFoldPoint(
      pts.flipBackMid,
      pts.bellyBackTip,
      pts.shellTailTip,
      backFold
    );

    // shell breathing / subtle internal movement
    let shellBreath = lerp(
      1,
      map(sin(swim * 0.45), -1, 1, 0.985, 1.018),
      movement
    );
    pts.shellPeak = platformFoldPoint(pts.shellPeak, pts.shellFrontBot, pts.shellBackTop, shellBreath);

    pts.shellBackTop = platformMovePoint(
      pts.shellBackTop,
      sin(swim * 0.5) * 4 * movement,
      cos(swim * 0.4) * 3 * movement
    );

    pts.shellTailTip = platformMovePoint(
      pts.shellTailTip,
      sin(swim * 0.6) * 8 * movement,
      cos(swim * 0.5) * 4 * movement
    );
  }

  let pId = 0;

  // group 1 — shell
  push();
  applyTurtlePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#7C905D", pts.neckBaseTop, pts.shellPeak, pts.shellFrontBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#576D46", pts.shellFrontBot, pts.shellPeak, pts.shellMidBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#647B4E", pts.shellPeak, pts.shellBackTop, pts.shellMidBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#566C44", pts.shellBackTop, pts.shellTailTip, pts.shellMidBot);
  pop();

  // group 2 — belly
  push();
  applyTurtlePieceTransform(pId++, p.tGroup[1]);
  platformDrawTri("#C0CE97", pts.neckMidBase, pts.shellFrontBot, pts.bellyBotFront);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[1]);
  platformDrawQuad("#D1DEAE", pts.shellFrontBot, pts.shellMidBot, pts.bellyBotBack, pts.bellyBotFront);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[1]);
  platformDrawTri("#A2B57B", pts.shellMidBot, pts.bellyBackTip, pts.bellyBotBack);
  pop();

  // group 3 — head, neck, back fin
  push();
  applyTurtlePieceTransform(pId++, p.tGroup[2]);
  platformDrawQuad("#A5B47B", pts.noseTop, pts.headTop, pts.neckBaseBot, pts.noseBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#819560", pts.headTop, pts.neckBaseTop, pts.neckBaseBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#96A974", pts.neckBaseTop, pts.neckMidBase, pts.neckBaseBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#3D4F2B", pts.neckBaseTop, pts.neckMidBase, pts.shellFrontBot);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#94A772", pts.bellyBotBack, pts.bellyBackTip, pts.flipBackTip);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#758A59", pts.bellyBackTip, pts.shellTailTip, pts.flipBackMid);
  pop();

  // group 4 — front fin
  push();
  applyTurtlePieceTransform(pId++, p.tGroup[3]);
  platformDrawTri("#62774D", pts.neckMidBase, pts.flipFrontMid, pts.bellyBotFront);
  pop();

  push();
  applyTurtlePieceTransform(pId++, p.tGroup[3]);
  platformDrawTri("#839962", pts.flipFrontMid, pts.bellyBotFront, pts.flipFrontTip);
  pop();

  pop();
}

function applyTurtlePieceTransform(index, t) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return;
  }

  platformApplyLoosePieceTransform(posterRegistry.turtle, index, t);
}

function drawEagleAnimal() {
  const p = posterRegistry.eagle;

  push();

  let vultureX;
  let vultureY;
  let vultureScale;
  let vultureRot;
  let floatIntensity;

  let eagleFullyAssembled =
    p.clickCount >= p.cfg.finalClickCount &&
    p.tGroup[0] > 0.96 &&
    p.tGroup[1] > 0.96 &&
    p.tGroup[2] > 0.96 &&
    p.tGroup[3] > 0.96;

  let finalAlive = eagleFullyAssembled;

  // Eases perch animation in once fully assembled — feet stay grounded
  p.finalMotion = lerp(p.finalMotion, finalAlive ? 1 : 0, 0.035);

  vultureX = ANIMAL_REF_W / 2 - 42;
  vultureY = PLATFORM_EAGLE_FINAL_ORIGIN_Y;
  vultureScale = PLATFORM_EAGLE_ANIMAL_SCALE;
  vultureRot = 0;
  // Keep loose scatter pieces stable during assembly — perch motion only when fully built.
  floatIntensity = platformSharePreviewStill
    ? 0
    : eagleFullyAssembled
      ? 1 - p.finalMotion
      : 0;

  translate(vultureX, vultureY);

  let animFrame = platformShareAnimFrame();
  let floatY = sin(animFrame * 0.02) * 10 * floatIntensity;
  let floatX = cos(animFrame * 0.015) * 7 * floatIntensity;
  let bodyTilt = sin(animFrame * 0.01) * 0.035 * floatIntensity;

  translate(floatX, floatY);
  rotate(vultureRot + bodyTilt);

  scale(vultureScale);
  translate(-500, -500);

  let pts = {
    // beak + head
    beakTip: [158, 232],
    beakTop: [205, 178],
    beakMid: [255, 190],
    beakBot: [168, 302],
    headTop: [345, 135],
    headBack: [420, 190],
    faceFront: [385, 300],
    throat: [335, 390],

    // neck
    neckTop: [430, 315],
    neckBaseFront: [470, 460],
    neckBaseBack: [555, 425],
    chest: [500, 555],

    // body + wing
    shoulder: [585, 385],
    backTop: [785, 455],
    backEnd: [850, 560],
    wingTip: [940, 840],
    tailTip: [900, 680],
    bellyBack: [710, 650],
    bellyFront: [565, 610],
    bodyLow: [640, 735],

    // leg + foot
    legTop: [635, 710],
    knee: [585, 825],
    ankle: [545, 910],
    footBack: [435, 945],
    toe1: [525, 920],
    toe2: [605, 945],
    toe3: [690, 950],

    // inner wing folds
    wingCenter: [640, 510],
    wingFold: [760, 620],
    wingDarkFold: [590, 640],
    wingLower: [750, 780]
  };

  if (finalAlive) {
    let life = platformSharePreviewStill ? 0 : p.finalMotion;

    const headTiltKeys = [
      "beakTip", "beakTop", "beakMid", "beakBot", "headTop", "headBack", "faceFront",
      "neckTop", "throat"
    ];
    const wingKeys = ["wingCenter", "wingFold", "wingTip", "wingLower", "wingDarkFold"];
    const hoverKeys = [
      "beakTip", "beakTop", "beakMid", "beakBot", "headTop", "headBack", "faceFront", "throat",
      "neckTop", "neckBaseFront", "neckBaseBack", "chest", "shoulder", "backTop", "backEnd",
      "tailTip", "bellyBack", "bellyFront", "bodyLow", "wingCenter", "wingFold", "wingTip",
      "wingLower", "wingDarkFold"
    ];

    // 3 — Body hover: hip joint + vertical lift (legs fixed)
    let hoverPhase = sin(animFrame * 0.022 + 1.1) * life;
    platformRotatePointKeys(pts, hoverKeys, pts.legTop, hoverPhase * 0.1);
    for (let i = 0; i < hoverKeys.length; i++) {
      pts[hoverKeys[i]] = platformMovePoint(pts[hoverKeys[i]], 0, hoverPhase * 20);
    }

    // 1 — Head tilt: neck joint
    let headTiltAng = sin(animFrame * 0.03) * 0.09 * life;
    platformRotatePointKeys(pts, headTiltKeys, pts.neckBaseFront, headTiltAng);

    // 2 — Wings: shoulder joint, extend up then slowly return
    let wingPhase = (animFrame * 0.0072 + 0.25) % 1;
    let wingExtend = platformEagleWingExtendPhase(wingPhase) * life;
    platformRotatePointKeys(pts, wingKeys, pts.shoulder, -wingExtend * 0.24 * life);
  } else {
    // subtle folded-paper movement while pieces are still assembling
    let headFold = map(sin(animFrame * 0.008), -1, 1, 0.92, 1.04);
    pts.beakTip = platformFoldPoint(pts.beakTip, pts.headTop, pts.throat, headFold);
    pts.beakTop = platformFoldPoint(pts.beakTop, pts.headTop, pts.throat, headFold);
    pts.beakBot = platformFoldPoint(pts.beakBot, pts.headTop, pts.throat, headFold);

    let wingFoldMove = map(sin(animFrame * 0.012), -1, 1, 0.86, 1.14);
    pts.wingTip = platformFoldPoint(pts.wingTip, pts.backTop, pts.bodyLow, wingFoldMove);
    pts.tailTip = platformFoldPoint(pts.tailTip, pts.backEnd, pts.bellyBack, wingFoldMove);

    let legFold = map(sin(animFrame * 0.018 + 0.4), -1, 1, 0.94, 1.08);
    pts.ankle = platformFoldPoint(pts.ankle, pts.legTop, pts.knee, legFold);
    pts.footBack = platformFoldPoint(pts.footBack, pts.knee, pts.ankle, legFold);
    pts.toe2 = platformFoldPoint(pts.toe2, pts.knee, pts.ankle, legFold);
    pts.toe3 = platformFoldPoint(pts.toe3, pts.knee, pts.ankle, legFold);
  }

  platformLerpPosterTGroup(p, 0, 0.035);
  platformLerpPosterTGroup(p, 1, 0.035);
  platformLerpPosterTGroup(p, 2, 0.035);
  platformLerpPosterTGroup(p, 3, 0.035);

  let pId = 0;

  // group 4 — leg, foot, final tail depth
  push();
  applyEaglePieceTransform(pId++, p.tGroup[3]);
  platformDrawTri("#6B563F", pts.bodyLow, pts.legTop, pts.knee, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[3]);
  platformDrawQuad("#4F4233", pts.legTop, pts.knee, pts.ankle, pts.bellyBack, 1.5);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[3]);
  platformDrawTri("#4A3D31", pts.footBack, pts.ankle, pts.toe2, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[3]);
  platformDrawTri("#5C4B38", pts.ankle, pts.toe2, pts.toe3, 0.95);
  pop();

  // group 1 — main body / wing
  push();
  applyEaglePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#5A4637", pts.shoulder, pts.backTop, pts.wingCenter, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#4A382D", pts.wingCenter, pts.backTop, pts.wingTip, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#6F543E", pts.shoulder, pts.wingCenter, pts.bellyFront, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#3F3128", pts.bellyFront, pts.wingLower, pts.wingTip, 0.95);
  pop();

  // rear wing polygon
  push();
  applyEaglePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#6F543E", pts.bellyFront, pts.wingCenter, pts.wingTip, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[0]);
  platformDrawTri("#7B5E45", pts.wingCenter, pts.wingFold, pts.wingTip, 0.95);
  pop();

  // group 2 — chest + neck base
  push();
  applyEaglePieceTransform(pId++, p.tGroup[1]);
  platformDrawTri("#A77E58", pts.neckBaseFront, pts.shoulder, pts.bellyFront, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[1]);
  platformDrawTri("#C1A181", pts.throat, pts.neckBaseFront, pts.bellyFront, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[1]);
  platformDrawTri("#D9C4A8", pts.neckTop, pts.shoulder, pts.neckBaseFront, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[1]);
  platformDrawTri("#C7AA89", pts.neckBaseFront, pts.neckTop, pts.throat, 0.95);
  pop();

  // group 3 — head, beak, upper neck
  push();
  applyEaglePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#CBB092", pts.beakTop, pts.headTop, pts.beakMid, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#9A7757", pts.beakTip, pts.beakTop, pts.beakBot, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#E3D2BA", pts.beakMid, pts.headTop, pts.faceFront, 0.95);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[2]);
  platformDrawQuad("#C7AA89", pts.headTop, pts.headBack, pts.neckTop, pts.faceFront, 1.5);
  pop();

  push();
  applyEaglePieceTransform(pId++, p.tGroup[2]);
  platformDrawTri("#A78362", pts.faceFront, pts.neckTop, pts.throat, 0.95);
  pop();

  pop();
}

function applyEaglePieceTransform(index, t) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return;
  }

  platformApplyLoosePieceTransform(posterRegistry.eagle, index, t);
}

function drawDeerAnimal() {
  const p = posterRegistry.deer;

  platformLerpPosterTGroup(p, 0, 0.035);
  platformLerpPosterTGroup(p, 1, 0.035);
  platformLerpPosterTGroup(p, 2, 0.035);
  platformLerpPosterTGroup(p, 3, 0.035);

  let deerIsFullyAssembled =
    p.clickCount >= 3 &&
    p.tGroup[0] > 0.96 &&
    p.tGroup[1] > 0.96 &&
    p.tGroup[2] > 0.96 &&
    p.tGroup[3] > 0.96;

  let finalAlive = deerIsFullyAssembled;

  p.finalMotion = lerp(p.finalMotion, finalAlive ? 1 : 0, 0.035);

  // =====================================================
  // LIVELY NATURAL GAZELLE / DEER MOTION
  // Continuous bound/gallop:
  // rear legs push -> body rises -> front legs reach -> soft landing.
  // More alive than floating, less robotic than a separate jump.
  // =====================================================

  let movement = platformSharePreviewStill ? 0 : p.finalMotion;

  // Main rhythm. Adjust only this number if you want it slower/faster.
  let gait = platformSharePreviewStill ? 0 : platformShareAnimFrame() * 0.052;

  // Smooth bounding energy. This creates a continuous rise/fall, not a hard jump.
  let bound = (1 - cos(gait)) / 2;
  let airborne = platformSmoothStep(0.18, 0.92, bound) * movement;

  // A purposeful movement through the poster space.
  let travelX =
    sin(gait * 0.52) * 12.0 * movement +
    sin(gait * 1.0 + 0.35) * 2.2 * movement;

  // Clear vertical life, but still controlled inside the layout.
  let bodyLift =
    airborne * 17.0 -
    sin(gait * 2.0 + 0.4) * 1.5 * movement;

  let bodyX = travelX;
  let bodyY = -bodyLift;

  // Body tilt follows the push and landing.
  let bodyTilt =
    sin(gait - 0.45) * 0.030 * movement +
    sin(gait * 2.0) * 0.006 * movement;

  p.deer.x = PLATFORM_DEER_FINAL_ORIGIN_X;
  p.deer.y = PLATFORM_DEER_FINAL_ORIGIN_Y;
  p.deer.scale = PLATFORM_DEER_ANIMAL_SCALE;

  p.deer.drawX = p.deer.x + bodyX;
  p.deer.drawY = p.deer.y + bodyY;

  push();
  translate(p.deer.drawX, p.deer.drawY);
  rotate(bodyTilt);
  scale(p.deer.scale);

  let pts = {
    // neck / body
    neckTop: [225, 400],
    neckMid: [195, 450],
    neckBase: [240, 480],
    chest: [220, 540],
    shoulder: [270, 570],
    shoulderFront: [316, 580],
    shoulderBack: [352, 570],
    bellyLine: [420, 550],
    backTop: [550, 430],
    rump: [610, 500],
    hipLower: [550, 560],
    hipFront: [516, 560],
    hipBack: [590, 544],

    // head
    leftEarTip: [48, 332],
    leftEarBase: [112, 360],
    leftEarLow: [85, 398],
    rightEarTip: [255, 348],
    rightEarBase: [182, 375],
    rightEarLow: [210, 407],
    leftHornBaseA: [112, 360],
    leftHornBaseB: [137, 364],
    leftHornKnee: [92, 258],
    leftHornTip: [112, 170],
    leftHornInner: [112, 258],

    rightHornBaseA: [170, 374],
    rightHornBaseB: [198, 382],
    rightHornKnee: [232, 258],
    rightHornTip: [205, 170],
    rightHornInner: [214, 258],

    headFront: [112, 360],
    headCenter: [170, 374],
    noseTip: [60, 420],
    jawBottom: [76, 444],
    headBack: [222, 398],
    jawAngle: [190, 450],

    // front legs
    frontNearKnee: [304, 688],
    frontNearHoof: [232, 824],
    frontFarKneeA: [331, 688],
    frontFarKneeB: [314, 688],
    frontFarHoof: [348, 824],

    // back legs
    backNearKneeA: [575, 668],
    backNearKneeB: [560, 682],
    backNearHoof: [490, 824],

    backFarKneeA: [610, 670],
    backFarKneeB: [596, 684],
    backFarHoof: [626, 824],

    tailBaseTop: [600, 506],
    tailBaseLow: [580, 536],
    tailTip: [636, 522]
  };

  if (finalAlive) {
    // Phase-shifted legs: every leg participates in the same gait cycle,
    // but not at the exact same time. This prevents robotic symmetry.
    let frontNearPhase = sin(gait + 0.45);
    let frontFarPhase = sin(gait + PI * 0.88);
    let backNearPhase = sin(gait + PI + 0.18);
    let backFarPhase = sin(gait + PI * 1.14);

    let frontNearLift = platformSmoothStep(0.0, 1.0, max(0, frontNearPhase));
    let frontFarLift = platformSmoothStep(0.0, 1.0, max(0, frontFarPhase));
    let backNearLift = platformSmoothStep(0.0, 1.0, max(0, backNearPhase));
    let backFarLift = platformSmoothStep(0.0, 1.0, max(0, backFarPhase));

    // Rear push gives the jump direction. It is continuous, not switched on/off.
    let rearPush = platformSmoothStep(0.10, 0.95, (sin(gait + PI * 0.70) + 1) / 2) * movement;

    // Head counterbalances the body. When the body rises, the head softens the motion.
    let headMoveX =
      sin(gait * 0.92 + 0.6) * 4.0 * movement -
      rearPush * 1.8;

    let headMoveY =
      sin(gait * 1.05 + PI) * 2.5 * movement +
      bodyLift * 0.18;

    let headKeys = [
      "leftEarTip", "leftEarBase", "leftEarLow",
      "rightEarTip", "rightEarBase", "rightEarLow",
      "leftHornBaseA", "leftHornBaseB", "leftHornKnee", "leftHornTip", "leftHornInner",
      "rightHornBaseA", "rightHornBaseB", "rightHornKnee", "rightHornTip", "rightHornInner",
      "headFront", "headCenter", "noseTip", "jawBottom", "headBack", "jawAngle"
    ];

    for (let i = 0; i < headKeys.length; i++) {
      pts[headKeys[i]] = platformMovePoint(pts[headKeys[i]], headMoveX, headMoveY);
    }

    // Ears and horns move only a little. Too much movement here looks rubbery.
    let earFoldA = map(sin(gait * 1.35 + 0.8), -1, 1, 0.92, 1.08);
    let earFoldB = map(sin(gait * 1.18 + 2.1), -1, 1, 0.93, 1.07);

    pts.leftEarTip = platformFoldPoint(pts.leftEarTip, pts.leftEarBase, pts.leftEarLow, earFoldA);
    pts.rightEarTip = platformFoldPoint(pts.rightEarTip, pts.rightEarBase, pts.rightEarLow, earFoldB);

    let hornFold = map(sin(gait * 0.82 + 0.3), -1, 1, 0.992, 1.012);

    pts.leftHornTip = platformFoldPoint(pts.leftHornTip, pts.leftHornBaseA, pts.leftHornKnee, hornFold);
    pts.rightHornTip = platformFoldPoint(pts.rightHornTip, pts.rightHornBaseA, pts.rightHornKnee, hornFold);

    // =====================================================
    // LEGS
    // Back legs drive the jump; front legs reach and absorb the landing.
    // Bigger and more lively than the floating version, but still continuous.
    // =====================================================

    // Front near leg — reaches forward during landing.
    pts.frontNearKnee = platformMovePoint(
      pts.frontNearKnee,
      frontNearPhase * 11.0 + airborne * 3.5,
      -frontNearLift * 11.5 + airborne * 1.5
    );
    pts.frontNearHoof = platformMovePoint(
      pts.frontNearHoof,
      frontNearPhase * 24.0 + airborne * 7.0,
      -frontNearLift * 19.0 + airborne * 2.2
    );

    // Front far leg — delayed, so the front legs do not move as one rigid object.
    pts.frontFarKneeA = platformMovePoint(
      pts.frontFarKneeA,
      frontFarPhase * 9.0 + airborne * 2.0,
      -frontFarLift * 9.0 + airborne * 1.0
    );
    pts.frontFarKneeB = platformMovePoint(
      pts.frontFarKneeB,
      frontFarPhase * 9.0 + airborne * 2.0,
      -frontFarLift * 9.0 + airborne * 1.0
    );
    pts.frontFarHoof = platformMovePoint(
      pts.frontFarHoof,
      frontFarPhase * 20.0 + airborne * 4.8,
      -frontFarLift * 15.5 + airborne * 1.5
    );
        // Back near leg — the strongest pushing leg.
    pts.backNearKneeA = platformMovePoint(
      pts.backNearKneeA,
      backNearPhase * 12.5 - rearPush * 6.5,
      -backNearLift * 9.0 + rearPush * 2.8
    );
    pts.backNearKneeB = platformMovePoint(
      pts.backNearKneeB,
      backNearPhase * 12.5 - rearPush * 6.5,
      -backNearLift * 9.0 + rearPush * 2.8
    );
    pts.backNearHoof = platformMovePoint(
      pts.backNearHoof,
      backNearPhase * 27.0 - rearPush * 13.0,
      -backNearLift * 16.5 + rearPush * 4.2
    );

    // Back far leg — close to the same push, but not identical.
    pts.backFarKneeA = platformMovePoint(
      pts.backFarKneeA,
      backFarPhase * 10.5 - rearPush * 5.0,
      -backFarLift * 8.0 + rearPush * 2.0
    );
    pts.backFarKneeB = platformMovePoint(
      pts.backFarKneeB,
      backFarPhase * 10.5 - rearPush * 5.0,
      -backFarLift * 8.0 + rearPush * 2.0
    );
    pts.backFarHoof = platformMovePoint(
      pts.backFarHoof,
      backFarPhase * 23.0 - rearPush * 10.0,
      -backFarLift * 14.5 + rearPush * 3.2
    );

    // Tail reacts to the bound.
    let tailFold = map(sin(gait * 1.25 + 1.2), -1, 1, 0.82, 1.18);
    pts.tailTip = platformFoldPoint(pts.tailTip, pts.tailBaseTop, pts.tailBaseLow, tailFold);
  }

  let pId = 0;

  // body — group 2
  drawDeerPieceTri("#C99661", pts.neckTop, pts.neckMid, pts.neckBase, pId++, p.tGroup[1]);
  drawDeerPieceTri("#A97D4C", pts.neckMid, pts.neckBase, pts.chest, pId++, p.tGroup[1]);
  drawDeerPieceTri("#B98B58", pts.neckBase, [255, 470], pts.chest, pId++, p.tGroup[1]);
  drawDeerPieceTri("#BE8E58", pts.chest, [255, 470], pts.shoulder, pId++, p.tGroup[1]);
  drawDeerPieceTri("#C99B63", [255, 470], pts.backTop, pts.bellyLine, pId++, p.tGroup[1]);
  drawDeerPieceTri("#E0B883", [255, 470], pts.bellyLine, pts.shoulder, pId++, p.tGroup[1]);
  drawDeerPieceTri("#C99B63", pts.backTop, pts.rump, pts.bellyLine, pId++, p.tGroup[1]);
  drawDeerPieceTri("#D8AC75", pts.backTop, pts.rump, pts.hipLower, pId++, p.tGroup[1]);
  drawDeerPieceTri("#DDB991", pts.bellyLine, pts.rump, pts.hipLower, pId++, p.tGroup[1]);

  // head, ears, horns — group 1
  drawDeerPieceTri("#D4A36E", pts.leftEarTip, pts.leftEarBase, pts.leftEarLow, pId++, p.tGroup[0]);
  drawDeerPieceTri("#D8AA74", pts.rightEarTip, pts.rightEarBase, pts.rightEarLow, pId++, p.tGroup[0]);

  // left horn
  drawDeerPieceTri("#6D5D45", pts.leftHornBaseA, pts.leftHornBaseB, pts.leftHornKnee, pId++, p.tGroup[0]);
  drawDeerPieceTri("#4B453D", pts.leftHornKnee, pts.leftHornTip, pts.leftHornInner, pId++, p.tGroup[0]);
  drawDeerPieceTri("#5B5145", pts.leftHornBaseB, pts.leftHornKnee, pts.leftHornInner, pId++, p.tGroup[0]);

  // right horn
  drawDeerPieceTri("#6B5B43", pts.rightHornBaseA, pts.rightHornBaseB, pts.rightHornKnee, pId++, p.tGroup[0]);
  drawDeerPieceTri("#4B453D", pts.rightHornKnee, pts.rightHornTip, pts.rightHornInner, pId++, p.tGroup[0]);
  drawDeerPieceTri("#5B5145", pts.rightHornBaseA, pts.rightHornKnee, pts.rightHornInner, pId++, p.tGroup[0]);

  // head
  drawDeerPieceTri("#B98C58", pts.headFront, pts.headCenter, pts.noseTip, pId++, p.tGroup[0]);
  drawDeerPieceTri("#D4A36E", pts.noseTip, pts.headCenter, pts.jawBottom, pId++, p.tGroup[0]);
  drawDeerPieceTri("#C59661", pts.headFront, pts.headCenter, pts.headBack, pId++, p.tGroup[0]);
  drawDeerPieceTri("#D4A36E", pts.headCenter, pts.headBack, pts.jawAngle, pId++, p.tGroup[0]);
  drawDeerPieceTri("#D9B387", pts.headCenter, pts.jawAngle, pts.jawBottom, pId++, p.tGroup[0]);

  // front legs — group 3
  drawDeerPieceTri("#C99A65", pts.shoulder, pts.shoulderFront, pts.frontNearKnee, pId++, p.tGroup[2]);
  drawDeerPieceTri("#B7854F", pts.shoulder, pts.frontNearKnee, pts.frontNearHoof, pId++, p.tGroup[2]);
  drawDeerPieceTri("#D9AC73", pts.shoulderFront, pts.shoulderBack, pts.frontFarKneeA, pId++, p.tGroup[2]);
  drawDeerPieceTri("#D4A36E", pts.shoulderFront, pts.frontFarKneeA, pts.frontFarKneeB, pId++, p.tGroup[2]);
  drawDeerPieceTri("#B7854F", pts.frontFarKneeA, pts.frontFarKneeB, pts.frontFarHoof, pId++, p.tGroup[2]);
  drawDeerPieceTri("#D3A067", pts.shoulder, pts.shoulderFront, pts.shoulderBack, pId++, p.tGroup[2]);

  // tail — group 4
  drawDeerPieceTri("#4E463D", pts.tailBaseTop, pts.tailBaseLow, pts.tailTip, pId++, p.tGroup[3]);

  // tail connector
  drawDeerPieceTri("#5B5145", pts.tailBaseLow, pts.hipBack, pts.hipLower, pId++, p.tGroup[3]);

  // near back leg
  drawDeerPieceTri("#DCC0A2", pts.hipFront, pts.hipLower, pts.backNearKneeA, pId++, p.tGroup[3]);
  drawDeerPieceTri("#C8945C", pts.backNearKneeA, pts.backNearHoof, pts.backNearKneeB, pId++, p.tGroup[3]);
  drawDeerPieceTri("#B88957", pts.hipLower, pts.backNearKneeA, pts.backNearKneeB, pId++, p.tGroup[3]);

  // far back leg
  drawDeerPieceTri("#6C573D", pts.hipLower, pts.hipBack, pts.backFarKneeA, pId++, p.tGroup[3]);
  drawDeerPieceTri("#B9854D", pts.backFarKneeA, pts.backFarHoof, pts.backFarKneeB, pId++, p.tGroup[3]);
  drawDeerPieceTri("#7A6549", pts.hipBack, pts.backFarKneeA, pts.backFarKneeB, pId++, p.tGroup[3]);

  // body connection
  drawDeerPieceTri("#D2A774", pts.hipLower, pts.backNearKneeA, pts.bellyLine, pId++, p.tGroup[3]);
  drawDeerPieceTri("#D8AC75", pts.backTop, pts.rump, pts.hipLower, pId++, p.tGroup[3]);

  pop();
}

function applyDeerPieceTransform(index, t) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return false;
  }

  platformApplyLoosePieceTransform(posterRegistry.deer, index, t);
  return true;
}

function drawDeerPieceTri(hexColor, p1, p2, p3, index, t) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return;
  }

  push();
  platformApplyLoosePieceTransform(posterRegistry.deer, index, t);
  platformDrawTri(hexColor, p1, p2, p3);
  pop();
}

const PELOBATES_JUMP_DELAY = 420;
const PELOBATES_FIRST_JUMP_DELAY = 0;

function pelobatesMovePoint(p, dx, dy) {
  return [p[0] + dx, p[1] + dy];
}

function getPelobatesLoosePieceTarget(index) {
  let targets = [
    { x: -130, y: -160 },
    { x: -15, y: -80 },
    { x: -60, y: -110 },
    { x: 35, y: -175 },
    { x: 120, y: -140 },
    { x: 220, y: -100 },
    { x: 320, y: -20 },
    { x: 150, y: -20 },
    { x: -400, y: -170 },
    { x: -445, y: -60 },
    { x: -400, y: 55 },
    { x: -320, y: -115 },
    { x: -225, y: -5 },
    { x: -135, y: 70 },
    { x: -80, y: 150 },
    { x: 10, y: 120 },
    { x: 80, y: 155 },
    { x: 170, y: 190 },
    { x: 80, y: 60 },
    { x: 190, y: 80 },
    { x: 310, y: 30 },
    { x: 385, y: 90 },
    { x: 295, y: 180 },
    { x: 165, y: 245 },
    { x: 280, y: 280 },
    { x: 210, y: 120 },
    { x: 350, y: 320 },
    { x: 215, y: 385 },
    { x: -320, y: 260 },
    { x: -245, y: 365 },
    { x: -90, y: 300 },
    { x: 0, y: 365 },
    { x: -20, y: 450 }
  ];

  if (index >= 0 && index < targets.length) {
    return targets[index];
  }

  return { x: 0, y: -360 };
}

function applyPelobatesPieceTransform(p, index, t) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return false;
  }

  platformApplyLoosePieceTransform(p, index, t);
  return true;
}

function drawPelobatesPieceTri(hexColor, p1, p2, p3, index, t) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return;
  }

  push();
  platformApplyLoosePieceTransform(posterRegistry.toad, index, t);
  platformDrawTri(hexColor, p1, p2, p3, 1.8);
  pop();
}

function drawPelobatesAnimal() {
  const p = posterRegistry.toad;

  platformLerpPosterTGroup(p, 0, 0.035);
  platformLerpPosterTGroup(p, 1, 0.035);
  platformLerpPosterTGroup(p, 2, 0.035);
  platformLerpPosterTGroup(p, 3, 0.035);

  let fullyAssembled = p.cfg.isFullyAssembled(p);

  p.finalMotion = lerp(p.finalMotion, fullyAssembled ? 1 : 0, 0.035);

  if (fullyAssembled) {
    if (p.jumpReadyTime === null) {
      p.jumpReadyTime = millis();
      // First full assembly: start jump immediately like other animals' settle.
      // Later cycles keep the longer pre-jump pause.
      p.jumpDelayMs = p.toadFirstJumpDone
        ? PELOBATES_JUMP_DELAY
        : PELOBATES_FIRST_JUMP_DELAY;
    }
  } else {
    p.jumpReadyTime = null;
  }

  let jumpDelay =
    p.jumpDelayMs == null ? PELOBATES_JUMP_DELAY : p.jumpDelayMs;

  let jumpActive =
    !platformSharePreviewStill &&
    fullyAssembled &&
    p.jumpReadyTime !== null &&
    millis() - p.jumpReadyTime >= jumpDelay;

  let animalX = ANIMAL_REF_W / 2 - 5;
  let animalY = 432;
  let animalScale = 0.62;
  let animalRot = -0.01;
  let jumpY = 0;
  let squashX = 1;
  let squashY = 1;
  let bodyTilt = 0;
  let crouchAmt = 0;
  let pushAmt = 0;
  let hangAmt = 0;
  let landAmt = 0;
  let settleAmt = 0;

  if (jumpActive) {
    if (!p.toadFirstJumpDone) {
      p.toadFirstJumpDone = true;
    }
    let cycleDuration = 2150;
    let elapsed = millis() - p.jumpReadyTime - jumpDelay;
    let phase = (elapsed % cycleDuration) / cycleDuration;

    if (phase < 0.24) {
      let t = platformEaseInOutSine(phase / 0.24);
      crouchAmt = t;
      jumpY = 16 * t;
      squashX = 1 + 0.09 * t;
      squashY = 1 - 0.12 * t;
      bodyTilt = 0.012 * t;
    } else if (phase < 0.72) {
      let u = constrain((phase - 0.25) / 0.47, 0, 1);
      let arc = sin(u * PI);
      jumpY = 13 - 250 * arc;
      pushAmt = max(0, 1 - u * 2.45);
      hangAmt = constrain(1 - abs(u - 0.5) * 2.6, 0, 1);
      squashX = 1 - 0.02 * arc;
      squashY = 1 + 0.045 * arc;
      bodyTilt = -0.028 * arc;
    } else if (phase < 0.86) {
      let t = constrain((phase - 0.72) / 0.14, 0, 1);
      let impact = sin(t * PI);
      crouchAmt = 0.22 * impact;
      landAmt = impact;
      jumpY = 12 * impact;
      squashX = 1 + 0.08 * impact;
      squashY = 1 - 0.10 * impact;
      bodyTilt = 0.01 * impact;
    } else {
      let t = constrain((phase - 0.86) / 0.14, 0, 1);
      let settle = (1 - t) * (1 - t);
      crouchAmt = 0.045 * settle;
      settleAmt = settle;
      jumpY = 1.8 * settle;
      squashX = 1 + 0.006 * settle;
      squashY = 1 - 0.006 * settle;
      bodyTilt = -0.002 * settle;
    }

    let motion = p.finalMotion;
    jumpY *= motion;
    bodyTilt *= motion;
    squashX = 1 + (squashX - 1) * motion;
    squashY = 1 + (squashY - 1) * motion;
    crouchAmt *= motion;
    pushAmt *= motion;
    hangAmt *= motion;
    landAmt *= motion;
    settleAmt *= motion;
  }

  push();
  translate(animalX, animalY + jumpY);
  rotate(animalRot + bodyTilt);
  scale(-animalScale * squashX, animalScale * squashY);
  translate(-500, -500);

  let pts = {
    noseTip: [92, 438],
    snoutTop: [140, 370],
    snoutLow: [152, 505],
    headTop: [235, 322],
    headMid: [282, 405],
    headLow: [286, 548],
    shoulderTop: [388, 350],
    backTopA: [550, 342],
    backTopB: [710, 398],
    rumpTop: [820, 505],
    rumpMid: [855, 600],
    rumpLow: [805, 680],
    bellyRear: [620, 728],
    bellyMid: [455, 732],
    bellyFront: [305, 662],
    frontKneeA: [248, 620],
    frontToeA: [180, 705],
    frontToeB: [270, 708],
    midKnee: [405, 686],
    midToeA: [330, 758],
    midToeB: [500, 762],
    backHip: [670, 612],
    backThigh: [730, 642],
    backKnee: [780, 710],
    backAnkle: [745, 758],
    backToeA: [650, 782],
    backToeB: [815, 775],
    c1: [430, 425],
    c2: [590, 455],
    c3: [688, 555],
    c4: [558, 632],
    c5: [420, 620]
  };

  if (jumpActive) {
    let headMoveX = sin(millis() * 0.0045) * 1.1;
    let headMoveY = cos(millis() * 0.0038) * 0.9 - hangAmt * 1.1;

    pts.noseTip = pelobatesMovePoint(pts.noseTip, headMoveX, headMoveY);
    pts.snoutTop = pelobatesMovePoint(pts.snoutTop, headMoveX * 0.65, headMoveY * 0.65);
    pts.snoutLow = pelobatesMovePoint(pts.snoutLow, headMoveX * 0.45, headMoveY * 0.45);
    pts.c1 = pelobatesMovePoint(pts.c1, 0, 5 * crouchAmt - 5 * pushAmt + 3 * landAmt - 1.5 * hangAmt);
    pts.c2 = pelobatesMovePoint(pts.c2, 0, 6 * crouchAmt - 6 * pushAmt + 3 * landAmt - 2 * hangAmt);
    pts.c3 = pelobatesMovePoint(pts.c3, 0, 6 * crouchAmt - 6 * pushAmt + 3 * landAmt - 2 * hangAmt);
    pts.c4 = pelobatesMovePoint(pts.c4, 0, 5 * crouchAmt - 5 * pushAmt + 3 * landAmt - 1.5 * hangAmt);
    pts.c5 = pelobatesMovePoint(pts.c5, 0, 5 * crouchAmt - 4 * pushAmt + 3 * landAmt - 1.5 * hangAmt);
    pts.backTopA = pelobatesMovePoint(pts.backTopA, 0, 4 * crouchAmt - 4 * pushAmt - 1.5 * hangAmt);
    pts.backTopB = pelobatesMovePoint(pts.backTopB, 0, 4 * crouchAmt - 4 * pushAmt - 1.5 * hangAmt);
    pts.rumpTop = pelobatesMovePoint(pts.rumpTop, 0, 3 * crouchAmt - 4 * pushAmt - 1.5 * hangAmt);
    pts.bellyFront = pelobatesMovePoint(pts.bellyFront, 0, 5 * crouchAmt - 3 * pushAmt + 2.5 * landAmt);
    pts.bellyMid = pelobatesMovePoint(pts.bellyMid, 0, 5 * crouchAmt - 3 * pushAmt + 2.5 * landAmt);
    pts.bellyRear = pelobatesMovePoint(pts.bellyRear, 0, 4 * crouchAmt - 3 * pushAmt + 2.5 * landAmt);
    pts.frontKneeA = pelobatesMovePoint(pts.frontKneeA, 1.2 * pushAmt, 7 * crouchAmt - 4 * landAmt + 1.5 * settleAmt);
    pts.frontToeA = pelobatesMovePoint(pts.frontToeA, -3 * pushAmt, -8 * crouchAmt + 5 * pushAmt + 6 * landAmt);
    pts.frontToeB = pelobatesMovePoint(pts.frontToeB, 2 * pushAmt, -8 * crouchAmt + 5 * pushAmt + 6 * landAmt);
    pts.midKnee = pelobatesMovePoint(pts.midKnee, 3 * pushAmt, 6 * crouchAmt - 4 * landAmt + 1.5 * settleAmt);
    pts.midToeA = pelobatesMovePoint(pts.midToeA, -5 * pushAmt, -8 * crouchAmt + 5 * pushAmt + 6 * landAmt);
    pts.midToeB = pelobatesMovePoint(pts.midToeB, 5 * pushAmt, -8 * crouchAmt + 5 * pushAmt + 6 * landAmt);
    pts.backHip = pelobatesMovePoint(pts.backHip, 2 * pushAmt, 7 * crouchAmt - 5 * pushAmt + 3 * landAmt);
    pts.backThigh = pelobatesMovePoint(pts.backThigh, 6 * pushAmt, 12 * crouchAmt - 8 * pushAmt + 4 * landAmt);
    pts.backKnee = pelobatesMovePoint(pts.backKnee, 13 * pushAmt, 18 * crouchAmt - 20 * pushAmt + 7 * landAmt - 3 * hangAmt);
    pts.backAnkle = pelobatesMovePoint(pts.backAnkle, 15 * pushAmt, 10 * crouchAmt - 22 * pushAmt + 8 * landAmt - 4 * hangAmt);
    pts.backToeA = pelobatesMovePoint(pts.backToeA, -10 * pushAmt, 7 * crouchAmt - 12 * pushAmt + 9 * landAmt);
    pts.backToeB = pelobatesMovePoint(pts.backToeB, 14 * pushAmt, 6 * crouchAmt - 10 * pushAmt + 8 * landAmt);
  }

  let pId = 0;
  let C1 = "#6F725F";
  let C2 = "#4F5A43";
  let C3 = "#7E8068";
  let C4 = "#3F4636";
  let C5 = "#8B875F";
  let C6 = "#9C9771";
  let C7 = "#B1A875";
  let C8 = "#C0B783";

  drawPelobatesPieceTri(C3, pts.headTop, pts.shoulderTop, pts.headMid, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C7, pts.headMid, pts.shoulderTop, pts.c1, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C2, pts.headMid, pts.headTop, pts.c1, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C1, pts.shoulderTop, pts.backTopA, pts.c1, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C4, pts.backTopA, pts.c1, pts.c2, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C2, pts.backTopA, pts.backTopB, pts.c2, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C1, pts.backTopB, pts.rumpTop, pts.c3, pId++, p.tGroup[0]);
  drawPelobatesPieceTri(C3, pts.c2, pts.backTopB, pts.c3, pId++, p.tGroup[0]);

  drawPelobatesPieceTri(C6, pts.noseTip, pts.snoutTop, pts.headMid, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C7, pts.noseTip, pts.headMid, pts.snoutLow, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C8, pts.snoutLow, pts.headMid, pts.headLow, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C5, pts.snoutTop, pts.headTop, pts.headMid, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C6, pts.headMid, pts.c1, pts.headLow, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C7, pts.headLow, pts.c1, pts.c5, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C8, pts.headLow, pts.c5, pts.bellyFront, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C7, pts.c1, pts.bellyMid, pts.c5, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C6, pts.c1, pts.c4, pts.bellyMid, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C5, pts.c1, pts.c2, pts.c4, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C8, pts.c4, pts.bellyRear, pts.bellyMid, pId++, p.tGroup[1]);
  drawPelobatesPieceTri(C6, pts.c2, pts.c3, pts.c4, pId++, p.tGroup[1]);

  drawPelobatesPieceTri(C3, pts.c3, pts.rumpTop, pts.rumpMid, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C2, pts.c3, pts.rumpMid, pts.rumpLow, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C4, pts.c3, pts.c4, pts.rumpLow, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C5, pts.c4, pts.rumpLow, pts.bellyRear, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C6, pts.c4, pts.backHip, pts.backThigh, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C3, pts.c3, pts.backHip, pts.c4, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C7, pts.backHip, pts.backThigh, pts.backKnee, pId++, p.tGroup[2]);
  drawPelobatesPieceTri(C5, pts.backKnee, pts.backToeA, pts.backToeB, pId++, p.tGroup[2]);

  drawPelobatesPieceTri(C5, pts.bellyFront, pts.frontKneeA, pts.frontToeA, pId++, p.tGroup[3]);
  drawPelobatesPieceTri(C6, pts.frontKneeA, pts.frontToeB, pts.frontToeA, pId++, p.tGroup[3]);
  drawPelobatesPieceTri(C6, pts.c5, pts.bellyFront, pts.midKnee, pId++, p.tGroup[3]);
  drawPelobatesPieceTri(C7, pts.c5, pts.midKnee, pts.bellyMid, pId++, p.tGroup[3]);
  drawPelobatesPieceTri(C8, pts.midKnee, pts.midToeA, pts.midToeB, pId++, p.tGroup[3]);

  pop();
}

function hyenaMovePoint(p, dx, dy) {
  return [p[0] + dx, p[1] + dy];
}

function hyenaFoldPoint(p, a, b, factor) {
  let abX = b[0] - a[0];
  let abY = b[1] - a[1];
  let apX = p[0] - a[0];
  let apY = p[1] - a[1];
  let abLenSq = abX * abX + abY * abY;
  if (abLenSq === 0) {
    return [p[0], p[1]];
  }
  let dot = apX * abX + apY * abY;
  let t = dot / abLenSq;
  let pX = a[0] + t * abX;
  let pY = a[1] + t * abY;
  let pcX = p[0] - pX;
  let pcY = p[1] - pY;
  return [pX + pcX * factor, pY + pcY * factor];
}

function hyenaFract(x) {
  return x - floor(x);
}

function hyenaWalkStep(gait, offset, stride, liftHeight) {
  let p = hyenaFract(gait / TWO_PI + offset);
  let contactPart = 0.60;
  let contact = p < contactPart;
  let footX;
  let footY;
  let kneeX;
  let kneeY;
  let ankleX;
  let ankleY;

  if (contact) {
    let t = p / contactPart;
    let e = platformEaseInOutSine(t);
    footX = lerp(stride, -stride, e);
    footY = sin(e * PI) * 1.2;
    kneeX = footX * 0.42;
    kneeY = abs(sin(e * PI)) * 2.6;
    ankleX = footX * 0.78;
    ankleY = abs(sin(e * PI)) * 1.6;
  } else {
    let t = (p - contactPart) / (1 - contactPart);
    let e = platformEaseInOutSine(t);
    footX = lerp(-stride, stride, e);
    footY = -sin(t * PI) * liftHeight;
    kneeX = lerp(-stride * 0.35, stride * 0.50, e);
    kneeY = -sin(t * PI) * liftHeight * 0.55;
    ankleX = lerp(-stride * 0.65, stride * 0.82, e);
    ankleY = -sin(t * PI) * liftHeight * 0.82;
  }

  return {
    footX: footX,
    footY: footY,
    kneeX: kneeX,
    kneeY: kneeY,
    ankleX: ankleX,
    ankleY: ankleY,
    contact: contact
  };
}

let hyenaLooseTargetCache = null;
let hyenaLooseTargetCacheH = 0;
let hyenaLooseTargetCacheVersion = 0;
const HYENA_LOOSE_PIECES = 80;
const HYENA_LOOSE_LAYOUT_VERSION = 13;
const HYENA_SCATTER_OFFSET_Y = 16;
// Lift loose/scattered triangles only — assembled connections & final pose stay put.
const HYENA_SCATTER_NUDGE_Y = -42;
const HYENA_SCATTER_EXPAND_Y = 28;
const HYENA_SCATTER_EXPAND_X = 10;
const HYENA_CIRCULAR_LAYOUT = {
  centerU: 0.5,
  centerV: 0.34,
  coreCount: 32,
  coreInner: 0.02,
  coreOuter: 0.16,
  corePow: 0.5,
  outerInner: 0.07,
  outerOuter: 0.38,
  outerPow: 0.44,
  radiusScaleX: 1.08,
  radiusScaleY: 1.42,
  uMin: 0.06,
  uMax: 0.94,
  vMin: 0.08,
  vMax: 0.84,
  screenShift: { x: 0, y: 0 }
};

function hyenaGetScatterBounds() {
  let topScreen =
    platformText.introTitle.y +
    ms(52) +
    ms(HYENA_SCATTER_OFFSET_Y) +
    ms(HYENA_SCATTER_NUDGE_Y) -
    ms(HYENA_SCATTER_EXPAND_Y) +
    posterGetBelowHeaderNudgeY();
  let bottomScreen =
    POSTER_LAYOUT.choiceY -
    ms(22) +
    ms(HYENA_SCATTER_OFFSET_Y) +
    ms(HYENA_SCATTER_NUDGE_Y) +
    ms(HYENA_SCATTER_EXPAND_Y) +
    platformGetChoiceLayoutNudgeY();
  let sidePad = max(4, 16 - HYENA_SCATTER_EXPAND_X);

  return {
    left: platformScreenToAnimalRef(mx(sidePad), platformH / 2).x,
    right: platformScreenToAnimalRef(platformW - mx(sidePad), platformH / 2).x,
    top: platformScreenToAnimalRef(platformW / 2, topScreen).y,
    bottom: platformScreenToAnimalRef(platformW / 2, bottomScreen).y
  };
}

function hyenaScatterUVForIndex(index, count) {
  return platformLooseScatterUVForIndex(index, count, HYENA_CIRCULAR_LAYOUT);
}

function hyenaRefFromScatterUV(u, v, bounds) {
  return {
    x: lerp(bounds.left, bounds.right, u),
    y: lerp(bounds.top, bounds.bottom, v)
  };
}

function hyenaClampTargetsToBounds(targets, bounds) {
  for (let i = 0; i < targets.length; i++) {
    targets[i].x = constrain(targets[i].x, bounds.left, bounds.right);
    targets[i].y = constrain(targets[i].y, bounds.top, bounds.bottom);
  }
}

function hyenaSeparateLooseTargets(targets, bounds, gap = 20, maxIter = 48) {
  let pieceR = 18;

  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;

    for (let a = 0; a < targets.length; a++) {
      for (let b = a + 1; b < targets.length; b++) {
        let dx = targets[a].x - targets[b].x;
        let dy = targets[a].y - targets[b].y;
        let dist = max(sqrt(dx * dx + dy * dy), 0.01);
        let need = pieceR * 2 + gap;

        if (dist >= need) {
          continue;
        }

        let push = ((need - dist) / dist) * 0.52;
        targets[a].x += dx * push;
        targets[a].y += dy * push;
        targets[b].x -= dx * push;
        targets[b].y -= dy * push;
        moved = true;
      }
    }

    if (!moved) {
      break;
    }

    hyenaClampTargetsToBounds(targets, bounds);
  }
}

function hyenaBuildAllLooseTargets() {
  let bounds = hyenaGetScatterBounds();
  let targets = [];

  for (let i = 0; i < HYENA_LOOSE_PIECES; i++) {
    let uv = hyenaScatterUVForIndex(i, HYENA_LOOSE_PIECES);
    targets.push(hyenaRefFromScatterUV(uv.u, uv.v, bounds));
  }

  hyenaSeparateLooseTargets(targets, bounds);

  for (let i = 0; i < HYENA_LOOSE_PIECES; i++) {
    let uv = hyenaScatterUVForIndex(i, HYENA_LOOSE_PIECES);
    let goal = hyenaRefFromScatterUV(uv.u, uv.v, bounds);
    targets[i].x = lerp(targets[i].x, goal.x, 0.85);
    targets[i].y = lerp(targets[i].y, goal.y, 0.85);
  }

  hyenaSeparateLooseTargets(targets, bounds, 22, 40);
  hyenaClampTargetsToBounds(targets, bounds);
  return targets;
}

function getHyenaLoosePieceTarget(index) {
  if (
    !hyenaLooseTargetCache ||
    hyenaLooseTargetCacheH !== platformH ||
    hyenaLooseTargetCacheVersion !== HYENA_LOOSE_LAYOUT_VERSION
  ) {
    hyenaLooseTargetCacheH = platformH;
    hyenaLooseTargetCacheVersion = HYENA_LOOSE_LAYOUT_VERSION;
    hyenaLooseTargetCache = hyenaBuildAllLooseTargets();
  }

  if (index >= 0 && index < hyenaLooseTargetCache.length) {
    return hyenaLooseTargetCache[index];
  }

  return { x: ANIMAL_REF_W / 2, y: 360 };
}

function getHyenaAssembledAvoidZones(p) {
  let zones = [];
  let headStrength = platformSmoothStep(0.02, 0.58, p.tGroup[0]);
  let bodyStrength = platformSmoothStep(0.02, 0.62, p.tGroup[1]);
  let frontLegStrength = platformSmoothStep(0.02, 0.62, p.tGroup[2]);
  let backLegStrength = platformSmoothStep(0.02, 0.62, p.tGroup[3]);

  if (headStrength > 0) {
    zones.push({
      cx: p.hyena.drawX + 770 * p.hyena.scale,
      cy: p.hyena.drawY + 420 * p.hyena.scale,
      rx: 165,
      ry: 135,
      strength: headStrength * 1.45,
      influence: 1.72,
      force: 0.30,
      maxForce: 0.34
    });
  }

  if (bodyStrength > 0) {
    zones.push({
      cx: p.hyena.drawX + 400 * p.hyena.scale,
      cy: p.hyena.drawY + 455 * p.hyena.scale,
      rx: 280,
      ry: 170,
      strength: bodyStrength,
      influence: 1.78,
      force: 0.22,
      maxForce: 0.30
    });
  }

  if (frontLegStrength > 0) {
    zones.push({
      cx: p.hyena.drawX + 565 * p.hyena.scale,
      cy: p.hyena.drawY + 710 * p.hyena.scale,
      rx: 165,
      ry: 205,
      strength: frontLegStrength,
      influence: 1.70,
      force: 0.22,
      maxForce: 0.30
    });
  }

  if (backLegStrength > 0) {
    zones.push({
      cx: p.hyena.drawX + 245 * p.hyena.scale,
      cy: p.hyena.drawY + 710 * p.hyena.scale,
      rx: 215,
      ry: 215,
      strength: backLegStrength,
      influence: 1.70,
      force: 0.22,
      maxForce: 0.30
    });
  }

  return zones;
}

function hyenaPushAwayFromAssembledZones(target, index, t) {
  const p = posterRegistry.hyena;
  let zones = getHyenaAssembledAvoidZones(p);
  let x = target.x;
  let y = target.y;

  if (p.disassembleBoost > 0 || p.disassembleRepelWarmup > 0) {
    return target;
  }

  let looseStrength = 1 - platformSmoothStep(0.10, 0.78, t);

  if (looseStrength <= 0) {
    return target;
  }

  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < zones.length; i++) {
      let z = zones[i];
      let dx = x - z.cx;
      let dy = y - z.cy;

      if (abs(dx) < 0.001 && abs(dy) < 0.001) {
        dx = cos(index * 2.31);
        dy = sin(index * 2.31);
      }

      let nx = dx / z.rx;
      let ny = dy / z.ry;
      let distance = sqrt(nx * nx + ny * ny);

      if (distance < z.influence) {
        let angle = atan2(dy / z.ry, dx / z.rx);
        let targetX = z.cx + cos(angle) * z.rx * z.influence;
        let targetY = z.cy + sin(angle) * z.ry * z.influence;
        let force = (z.influence - distance) * z.strength * looseStrength * z.force;
        force = constrain(force, 0, z.maxForce);
        x = lerp(x, targetX, force);
        y = lerp(y, targetY, force);
      }
    }
  }

  let bounds = hyenaGetScatterBounds();
  x = constrain(x, bounds.left, bounds.right);
  y = constrain(y, bounds.top, bounds.bottom);
  return { x: x, y: y };
}

function applyHyenaPieceTransform(p, index, t, cx, cy) {
  if (!platformPrepareAnimalPieceDraw(t)) {
    return;
  }

  let off = p.pieceOffsets[index];
  if (!off) {
    return;
  }

  let target = getHyenaLoosePieceTarget(index);
  target = hyenaPushAwayFromAssembledZones(target, index, t);

  let hyenaFloatAmp = 5;
  let softFloatX =
    sin(frameCount * off.speedX + off.phase + index * 1.7) *
    hyenaFloatAmp *
    (off.wobble || 1);
  let softFloatY =
    cos(frameCount * off.speedY + off.phase + index * 1.3) *
    hyenaFloatAmp *
    (off.wobble || 1);
  let targetLocalX = (target.x - p.hyena.drawX) / p.hyena.scale;
  let targetLocalY = (target.y - p.hyena.drawY) / p.hyena.scale;
  let scatteredX = targetLocalX - cx + softFloatX / p.hyena.scale;
  let scatteredY = targetLocalY - cy + softFloatY / p.hyena.scale;
  let scatteredRot = off.rot + sin(frameCount * 0.004 + off.phase) * 0.16;
  let currentX = lerp(scatteredX, 0, t);
  let currentY = lerp(scatteredY, 0, t);
  let currentRot = lerp(scatteredRot, 0, t);
  let pulseScale = platformGetLoosePositivePulseScale(p, t);
  let pieceFall = wrongFallGetPieceDrawOffset(p, index, p.cfg);

  translate(cx + currentX + pieceFall.x, cy + currentY + pieceFall.y);
  scale(pulseScale);
  rotate(currentRot + pieceFall.rot);
  translate(-cx, -cy);
}

function drawHyenaPieceTri(hexColor, p1, p2, p3, index, t) {
  push();
  let cx = (p1[0] + p2[0] + p3[0]) / 3;
  let cy = (p1[1] + p2[1] + p3[1]) / 3;
  applyHyenaPieceTransform(posterRegistry.hyena, index, t, cx, cy);
  platformDrawTri(hexColor, p1, p2, p3, 1.8);
  pop();
}

function drawHyenaAnimal() {
  const p = posterRegistry.hyena;

  platformLerpPosterTGroup(p, 0, 0.04);
  platformLerpPosterTGroup(p, 1, 0.04);
  platformLerpPosterTGroup(p, 2, 0.04);
  platformLerpPosterTGroup(p, 3, 0.04);

  let hyenaIsFullyAssembled =
    p.clickCount >= 3 &&
    p.tGroup[0] > 0.96 &&
    p.tGroup[1] > 0.96 &&
    p.tGroup[2] > 0.96 &&
    p.tGroup[3] > 0.96;

  p.finalMotion = lerp(p.finalMotion, hyenaIsFullyAssembled ? 1 : 0, 0.035);

  let movement = platformSharePreviewStill ? 0 : p.finalMotion;
  let gait = platformSharePreviewStill ? 0 : platformShareAnimFrame() * 0.043;
  let bodyX = sin(gait * 0.50) * 8.5 * movement;
  let bodyY = abs(sin(gait * 1.0)) * 5.0 * movement;
  let bodyTilt = sin(gait * 0.72) * 0.022 * movement;

  p.hyena.x = 26;
  p.hyena.y = -8 + platformScreenPxToAnimalRefY(DEER_HYENA_EXTRA_SCREEN_OFFSET_Y);
  p.hyena.scale = 0.6;
  p.hyena.drawX = p.hyena.x + bodyX;
  p.hyena.drawY = p.hyena.y + bodyY;

  push();
  translate(p.hyena.drawX, p.hyena.drawY);
  rotate(bodyTilt);
  scale(p.hyena.scale);

  let pts = {
    tailBaseTop: [128, 420],
    tailBaseLow: [118, 548],
    tailMid: [78, 622],
    tailTip: [34, 692],
    rumpTop: [158, 398],
    rumpUpper: [202, 356],
    rumpLow: [132, 548],
    backA: [244, 338],
    backB: [352, 324],
    backC: [470, 306],
    shoulderTop: [592, 326],
    sideRear: [226, 470],
    sideMid: [372, 470],
    sideFront: [560, 462],
    bellyRear: [292, 566],
    bellyMid: [454, 558],
    chestLow: [594, 530],
    neckTop: [674, 334],
    neckLow: [622, 506],
    headBack: [744, 364],
    headTop: [818, 378],
    snoutTop: [912, 414],
    noseTip: [966, 470],
    noseLow: [928, 520],
    jaw: [820, 505],
    cheek: [744, 434],
    mouthCorner: [866, 500],
    earNearTip: [792, 280],
    earNearBaseA: [754, 370],
    earNearBaseB: [804, 404],
    earFarTip: [846, 314],
    earFarBaseA: [808, 388],
    earFarBaseB: [848, 412],
    backRearUpperA: [128, 536],
    backRearUpperB: [224, 552],
    backRearKnee: [158, 690],
    backRearAnkle: [96, 818],
    backRearHoof: [48, 884],
    backRearFootWide: [112, 890],
    backMidUpperA: [306, 560],
    backMidUpperB: [394, 556],
    backMidKnee: [350, 720],
    backMidAnkle: [400, 846],
    backMidHoof: [450, 888],
    backMidFootWide: [394, 888],
    frontSupportUpperA: [502, 544],
    frontSupportUpperB: [572, 526],
    frontSupportKnee: [535, 692],
    frontSupportAnkle: [532, 832],
    frontSupportHoof: [572, 886],
    frontSupportFootWide: [512, 888],
    frontLiftUpperA: [572, 520],
    frontLiftUpperB: [638, 506],
    frontLiftKnee: [654, 650],
    frontLiftAnkle: [626, 790],
    frontLiftHoof: [604, 874],
    frontLiftFootWide: [666, 874]
  };

  if (hyenaIsFullyAssembled) {
    let backRearStep = hyenaWalkStep(gait, 0.00, 29.0, 34.0);
    let frontSupportStep = hyenaWalkStep(gait, 0.48, 25.0, 29.0);
    let backMidStep = hyenaWalkStep(gait, 0.24, 23.0, 26.0);
    let frontLiftStep = hyenaWalkStep(gait, 0.74, 31.0, 39.0);
    let headLeadX = sin(gait * 0.92 + 0.5) * 10.5 * movement;
    let headBobY = sin(gait * 1.05 + PI) * 4.5 * movement;
    let headSide = sin(gait * 1.45) * 9.5 * movement;
    let headKeys = [
      "neckTop",
      "neckLow",
      "headBack",
      "headTop",
      "snoutTop",
      "noseTip",
      "noseLow",
      "jaw",
      "cheek",
      "mouthCorner",
      "earNearTip",
      "earNearBaseA",
      "earNearBaseB",
      "earFarTip",
      "earFarBaseA",
      "earFarBaseB"
    ];

    for (let i = 0; i < headKeys.length; i++) {
      pts[headKeys[i]] = hyenaMovePoint(pts[headKeys[i]], headLeadX, headBobY);
    }

    pts.snoutTop = hyenaMovePoint(pts.snoutTop, headSide * 0.95, 0);
    pts.noseTip = hyenaMovePoint(pts.noseTip, headSide * 1.35, 0);
    pts.noseLow = hyenaMovePoint(pts.noseLow, headSide * 1.2, 0);
    pts.mouthCorner = hyenaMovePoint(pts.mouthCorner, headSide * 1.0, 0);
    pts.jaw = hyenaMovePoint(pts.jaw, headSide * 0.9, 0);
    pts.cheek = hyenaMovePoint(pts.cheek, headSide * 0.55, 0);
    pts.headTop = hyenaMovePoint(pts.headTop, headSide * 0.45, 0);
    pts.headBack = hyenaMovePoint(pts.headBack, headSide * 0.30, 0);
    pts.earNearTip = hyenaMovePoint(pts.earNearTip, headSide * 0.85, -abs(headSide) * 0.16);
    pts.earFarTip = hyenaMovePoint(pts.earFarTip, headSide * 0.55, abs(headSide) * 0.10);

    let earFoldA = map(sin(gait * 1.35 + 0.6), -1, 1, 0.94, 1.065);
    let earFoldB = map(sin(gait * 1.18 + 1.9), -1, 1, 0.955, 1.05);
    pts.earNearTip = hyenaFoldPoint(pts.earNearTip, pts.earNearBaseA, pts.earNearBaseB, earFoldA);
    pts.earFarTip = hyenaFoldPoint(pts.earFarTip, pts.earFarBaseA, pts.earFarBaseB, earFoldB);

    let shoulderPulse = sin(gait + 0.35) * movement;
    let rumpPulse = sin(gait + PI) * movement;
    pts.shoulderTop = hyenaMovePoint(pts.shoulderTop, shoulderPulse * 4.5, abs(shoulderPulse) * 2.2);
    pts.sideFront = hyenaMovePoint(pts.sideFront, shoulderPulse * 3.2, abs(shoulderPulse) * 1.6);
    pts.chestLow = hyenaMovePoint(pts.chestLow, shoulderPulse * 2.4, abs(shoulderPulse) * 1.4);
    pts.neckTop = hyenaMovePoint(pts.neckTop, shoulderPulse * 2.0, abs(shoulderPulse) * 0.9);
    pts.neckLow = hyenaMovePoint(pts.neckLow, shoulderPulse * 1.8, abs(shoulderPulse) * 1.0);
    pts.rumpTop = hyenaMovePoint(pts.rumpTop, rumpPulse * 3.8, abs(rumpPulse) * 1.7);
    pts.rumpUpper = hyenaMovePoint(pts.rumpUpper, rumpPulse * 3.8, abs(rumpPulse) * 1.7);
    pts.sideRear = hyenaMovePoint(pts.sideRear, rumpPulse * 2.8, abs(rumpPulse) * 1.35);
    pts.rumpLow = hyenaMovePoint(pts.rumpLow, rumpPulse * 2.0, abs(rumpPulse) * 1.0);

    pts.backRearKnee = hyenaMovePoint(pts.backRearKnee, backRearStep.kneeX, backRearStep.kneeY);
    pts.backRearAnkle = hyenaMovePoint(pts.backRearAnkle, backRearStep.ankleX, backRearStep.ankleY);
    pts.backRearHoof = hyenaMovePoint(pts.backRearHoof, backRearStep.footX, backRearStep.footY);
    pts.backRearFootWide = hyenaMovePoint(pts.backRearFootWide, backRearStep.footX, backRearStep.footY);
    pts.backMidKnee = hyenaMovePoint(pts.backMidKnee, backMidStep.kneeX, backMidStep.kneeY);
    pts.backMidAnkle = hyenaMovePoint(pts.backMidAnkle, backMidStep.ankleX, backMidStep.ankleY);
    pts.backMidHoof = hyenaMovePoint(pts.backMidHoof, backMidStep.footX, backMidStep.footY);
    pts.backMidFootWide = hyenaMovePoint(pts.backMidFootWide, backMidStep.footX, backMidStep.footY);
    pts.frontSupportKnee = hyenaMovePoint(pts.frontSupportKnee, frontSupportStep.kneeX, frontSupportStep.kneeY);
    pts.frontSupportAnkle = hyenaMovePoint(pts.frontSupportAnkle, frontSupportStep.ankleX, frontSupportStep.ankleY);
    pts.frontSupportHoof = hyenaMovePoint(pts.frontSupportHoof, frontSupportStep.footX, frontSupportStep.footY);
    pts.frontSupportFootWide = hyenaMovePoint(pts.frontSupportFootWide, frontSupportStep.footX, frontSupportStep.footY);
    pts.frontLiftKnee = hyenaMovePoint(pts.frontLiftKnee, frontLiftStep.kneeX * 1.08, frontLiftStep.kneeY * 1.08);
    pts.frontLiftAnkle = hyenaMovePoint(pts.frontLiftAnkle, frontLiftStep.ankleX * 1.10, frontLiftStep.ankleY * 1.10);
    pts.frontLiftHoof = hyenaMovePoint(pts.frontLiftHoof, frontLiftStep.footX * 1.12, frontLiftStep.footY * 1.12);
    pts.frontLiftFootWide = hyenaMovePoint(pts.frontLiftFootWide, frontLiftStep.footX * 1.12, frontLiftStep.footY * 1.12);

    let tailSwing = sin(gait * 0.82 + 1.25) * movement;
    let tailLag = sin(gait * 0.82 + 0.65) * movement;
    pts.tailBaseTop = hyenaMovePoint(pts.tailBaseTop, tailSwing * 2.8 + rumpPulse * 0.9, -abs(tailSwing) * 0.75);
    pts.tailBaseLow = hyenaMovePoint(pts.tailBaseLow, tailSwing * 2.4 + rumpPulse * 0.75, abs(tailSwing) * 0.75);
    pts.tailMid = hyenaMovePoint(pts.tailMid, tailLag * 11.0, sin(gait * 1.05 + 0.8) * 5.0 * movement);
    pts.tailTip = hyenaMovePoint(pts.tailTip, tailLag * 22.0, sin(gait * 1.12 + 1.4) * 11.0 * movement);
    let tailFold = map(sin(gait * 0.90 + 1.7), -1, 1, 0.90, 1.12);
    pts.tailTip = hyenaFoldPoint(pts.tailTip, pts.tailBaseTop, pts.tailBaseLow, tailFold);
  }

  let pId = 0;
  let topA = [252, 340];
  let topB = [352, 320];
  let topC = [468, 304];
  let topD = [565, 330];
  let midA = [286, 504];
  let midB = [392, 498];
  let midC = [470, 494];
  let midD = [536, 462];

  drawHyenaPieceTri("#976233", pts.tailBaseTop, pts.rumpTop, pts.rumpLow, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#A56D3A", pts.tailBaseTop, pts.tailBaseLow, pts.rumpLow, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#A7703B", pts.rumpTop, pts.rumpUpper, pts.sideRear, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#B47B45", pts.rumpTop, pts.sideRear, pts.rumpLow, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#BC8755", pts.rumpUpper, topA, pts.sideRear, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#8F5C2F", topA, pts.sideRear, midA, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#9E6735", pts.sideRear, pts.rumpLow, pts.bellyRear, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#B17945", pts.sideRear, midA, pts.bellyRear, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#9B6635", topA, topB, midA, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#B2763E", topB, midA, midB, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#8C582D", topB, topC, midB, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#A96F39", topC, midB, midC, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#B47A44", topC, topD, midC, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#BF8651", topD, pts.shoulderTop, midD, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#9F6937", topD, midC, midD, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#A66C38", midA, midB, pts.sideMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#8E5B30", midA, pts.sideRear, pts.bellyRear, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#9B6535", midA, pts.bellyRear, pts.sideMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#9A6333", midB, pts.sideMid, pts.bellyMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#A96D38", pts.sideMid, pts.bellyRear, pts.bellyMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#B0743E", midB, midC, pts.bellyMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#996536", midC, midD, pts.bellyMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#AD7340", midD, pts.sideFront, pts.bellyMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#A56C39", pts.shoulderTop, midD, pts.sideFront, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#8B592D", midD, pts.sideFront, pts.chestLow, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#B17946", midD, pts.bellyMid, pts.chestLow, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#9A6333", pts.sideFront, pts.chestLow, pts.bellyMid, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#4A4035", [206, 374], topA, midA, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#52473B", [306, 328], topB, midB, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#433A31", [436, 308], topC, midC, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#574A3A", [542, 326], topD, midD, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#5F503E", [250, 500], pts.sideMid, pts.bellyRear, pId++, p.tGroup[1]);
  drawHyenaPieceTri("#584A3A", [500, 462], pts.chestLow, pts.bellyMid, pId++, p.tGroup[1]);

  drawHyenaPieceTri("#AF7642", pts.shoulderTop, pts.neckTop, pts.sideFront, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#9E6838", pts.neckTop, pts.headBack, pts.cheek, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#A9723E", pts.neckTop, pts.cheek, pts.neckLow, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#B47B47", pts.headBack, pts.headTop, pts.cheek, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#A86E39", pts.headTop, pts.snoutTop, pts.cheek, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#8D5C31", pts.cheek, pts.neckLow, pts.jaw, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#9F6936", pts.snoutTop, pts.cheek, pts.jaw, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#84522A", pts.snoutTop, pts.noseTip, pts.jaw, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#5A4B3C", pts.snoutTop, pts.noseTip, pts.noseLow, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#40372F", pts.noseTip, pts.noseLow, pts.mouthCorner, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#936031", pts.snoutTop, pts.mouthCorner, pts.jaw, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#5A4C3E", pts.earNearTip, pts.earNearBaseA, pts.earNearBaseB, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#6A5A49", pts.earFarTip, pts.earFarBaseA, pts.earFarBaseB, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#4C4035", pts.neckLow, pts.cheek, pts.chestLow, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#8B592D", pts.sideFront, pts.cheek, pts.chestLow, pId++, p.tGroup[0]);
  drawHyenaPieceTri("#A56E3C", pts.sideFront, pts.neckTop, pts.neckLow, pId++, p.tGroup[0]);

  drawHyenaPieceTri("#8D6034", pts.chestLow, pts.frontSupportUpperA, pts.frontSupportUpperB, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#996738", pts.frontSupportUpperA, pts.frontSupportUpperB, pts.frontSupportKnee, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#A87543", pts.frontSupportUpperA, pts.frontSupportKnee, pts.frontSupportAnkle, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#916133", pts.frontSupportUpperB, pts.frontSupportKnee, pts.frontSupportAnkle, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#9E6A39", pts.frontSupportKnee, pts.frontSupportAnkle, pts.frontSupportHoof, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#4E4338", pts.frontSupportAnkle, pts.frontSupportHoof, pts.frontSupportFootWide, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#564A3D", pts.frontSupportUpperB, pts.frontSupportKnee, pts.frontSupportAnkle, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#976435", pts.frontLiftUpperA, pts.frontLiftUpperB, pts.frontLiftKnee, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#A16C3C", pts.frontLiftUpperA, pts.frontLiftKnee, pts.frontLiftAnkle, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#8C5E32", pts.frontLiftUpperB, pts.frontLiftKnee, pts.frontLiftAnkle, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#7D532D", pts.frontLiftKnee, pts.frontLiftAnkle, pts.frontLiftHoof, pId++, p.tGroup[2]);
  drawHyenaPieceTri("#4A4035", pts.frontLiftAnkle, pts.frontLiftHoof, pts.frontLiftFootWide, pId++, p.tGroup[2]);

  drawHyenaPieceTri("#6A553F", pts.tailBaseTop, pts.tailBaseLow, pts.tailMid, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#4D4338", pts.tailBaseLow, pts.tailMid, pts.tailTip, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#5C4C3A", pts.rumpTop, pts.tailBaseTop, pts.tailBaseLow, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#AF7A47", pts.rumpLow, pts.backRearUpperA, pts.backRearUpperB, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#A8723F", pts.sideRear, pts.rumpLow, pts.backRearUpperB, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#956235", pts.sideRear, pts.backRearUpperA, pts.backRearUpperB, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#A97A4B", pts.backRearUpperA, pts.backRearUpperB, pts.backRearKnee, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#9A6C3D", pts.backRearUpperA, pts.backRearKnee, pts.backRearAnkle, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#8C6036", pts.backRearUpperB, pts.backRearKnee, pts.backRearAnkle, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#9B6F42", pts.backRearKnee, pts.backRearAnkle, pts.backRearHoof, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#51453A", pts.backRearAnkle, pts.backRearHoof, pts.backRearFootWide, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#564A3D", pts.backRearUpperA, pts.backRearKnee, pts.backRearAnkle, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#8F6338", pts.backMidUpperA, pts.backMidUpperB, pts.backMidKnee, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#9B6B3C", pts.backMidUpperA, pts.backMidKnee, pts.backMidAnkle, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#83592F", pts.backMidUpperB, pts.backMidKnee, pts.backMidAnkle, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#76502B", pts.backMidKnee, pts.backMidAnkle, pts.backMidHoof, pId++, p.tGroup[3]);
  drawHyenaPieceTri("#4C4338", pts.backMidAnkle, pts.backMidHoof, pts.backMidFootWide, pId++, p.tGroup[3]);

  pop();
}
