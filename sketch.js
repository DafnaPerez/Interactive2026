// =====================================================
// WILDLIFE TRIANGLE PLATFORM — ONE P5 SKETCH
// Native mobile portrait layout (390×844)
// =====================================================

let platformMode = "intro"; // intro | turtle | eagle | deer | toad | hyena
let platformSelectedStarted = false;
let platformIntroHover = -1;
let platformCanvasReady = false;
let platformIntroTransitionActive = false;
let platformIntroTransitionIndex = -1;
let platformIntroTransitionStart = 0;
let platformIntroTransitionDuration = 400;
let platformIntroTransitionSnapshot = null;

let platformPosterFadeStartTime = null;
let platformPosterFadeDuration = 320;
let platformPosterFadeColor = null;

// Original poster art/layout reference (650×975)
const REF_W = 650;
const REF_H = 975;

// Standard phone portrait canvas
const platformW = 390;
const platformH = 844;
let platformScreenScale = 1;

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
const PLATFORM_TEXT_COLOR = "#4E4138";
const PLATFORM_TEXT_RGB = [78, 65, 56];

const ANIMAL_REF_W = REF_W;
const ANIMAL_ANCHOR_Y = 400;
const ANIMAL_SCREEN_OFFSET_Y = 50;
const DEER_HYENA_EXTRA_SCREEN_OFFSET_Y = 20;
const INTRO_TRIANGLES_OFFSET_Y = -50;

function platformScreenPxToAnimalRefY(screenPx) {
  return screenPx * ANIMAL_REF_W / platformW;
}

let platformTriangleDrawPass = 0;
let platformSuppressAnimalPieceDraw = false;
const platformAssembledDrawThreshold = 0.82;

function platformPrepareAnimalPieceDraw(t) {
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
    my(ANIMAL_ANCHOR_Y) + ANIMAL_SCREEN_OFFSET_Y + shake.y
  );
  rotate(shake.rot);
  scale(s);
  translate(-ANIMAL_REF_W / 2, -ANIMAL_ANCHOR_Y);

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
    size: ms(17),
    alpha: 180
  },

  questionTitle: {
    text: "What would you choose?",
    x: platformW / 2,
    y: my(920),
    size: ms(24),
    leading: ms(28)
  },

  choiceLabel: {
    size: ms(14),
    alpha: 180,
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
  posterPreloadAll();
}

function platformApplyCanvasSize() {
  pixelDensity(displayDensity());
  resizeCanvas(platformW, platformH);
  platformApplyViewportLayout();
}

function platformApplyStartupQuery() {
  if (typeof window === "undefined" || !window.location) {
    return;
  }

  let animal = new URLSearchParams(window.location.search).get("animal");

  if (animal && posterRegistry[animal]) {
    platformMode = animal;
    platformSelectedStarted = false;
    platformIntroTransitionActive = false;
    platformIntroTransitionIndex = -1;
    platformIntroTransitionSnapshot = null;
    platformPosterFadeStartTime = null;
    platformPosterFadeColor = null;
  }
}

function setup() {
  pixelDensity(displayDensity());
  let cnv = createCanvas(platformW, platformH);
  let mainEl = document.querySelector("main");

  if (mainEl) {
    cnv.parent(mainEl);
  }

  platformCanvasReady = true;
  platformBindViewportListeners();
  platformApplyViewportLayout();
  platformApplyStartupQuery();
}

function draw() {
  if (platformMode === "intro") {
    platformDrawIntro();

    if (platformMode !== "intro") {
      platformEnsureAnimalStarted();
      platformInvokeAnimal("draw");
      platformDrawPosterFadeOverlay();
    }

    return;
  }

  platformEnsureAnimalStarted();
  platformInvokeAnimal("draw");
  platformDrawPosterFadeOverlay();
}

function mousePressed() {
  if (platformMode === "intro") {
    platformHandleIntroPress(mouseX, mouseY);
    return;
  }

  if (platformIsCurrentPosterFinal()) {
    platformHandleFinalCtaPress();
    return;
  }

  platformInvokeAnimal("mousePressed");
}

function touchStarted() {
  if (platformMode === "intro") {
    platformHandleIntroPress(mouseX, mouseY);
    return false;
  }

  if (platformIsCurrentPosterFinal()) {
    platformHandleFinalCtaPress();
    return false;
  }

  return platformInvokeAnimal("touchStarted") ?? false;
}

function windowResized() {
  platformApplyViewportLayout();

  if (platformMode !== "intro") {
    platformInvokeAnimal("windowResized");
  }
}

function keyPressed() {
  // Press ESC to return to the opening screen while testing.
  if (keyCode === ESCAPE) {
    platformReturnToIntro();
  }
}
function platformIsCurrentPosterFinal() {
  let p = posterRegistry[platformMode];
  return p && p.clickCount >= p.cfg.finalClickCount;
}

function platformGetFinalCtaLayout(p) {
  let cfg = p.cfg;
  let bodySize = ms(17);
  let bodyLeading = ms(20);
  let bodyY = platformGetFinalBodyTopY() + POSTER_LAYOUT.finalContentYOffset + POSTER_LAYOUT.finalMessageNudgeY;
  let bodyLineCount = cfg.finalBody.text.split("\n").length;
  let actualBodyBlockH = (bodyLineCount - 1) * bodyLeading + bodySize;
  let referenceBodyBlockH =
    (POSTER_LAYOUT.finalBodyLineCount - 1) * bodyLeading + bodySize;
  let titleLineCount = platformText.finalTitle.lines.length;
  let titleBlockH =
    (titleLineCount - 1) * platformText.finalTitle.leading + platformText.finalTitle.size;
  let titleY =
    bodyY + (referenceBodyBlockH - titleBlockH) / 2 + POSTER_LAYOUT.finalTitleYOffset;
  let contentBottom = max(titleY + titleBlockH, bodyY + actualBodyBlockH);
  let ctaW = platformW - POSTER_LAYOUT.marginX * 2;

  return {
    x: POSTER_LAYOUT.marginX,
    y: contentBottom + POSTER_LAYOUT.finalCtaGap,
    w: ctaW,
    h: POSTER_LAYOUT.finalCtaH
  };
}

function platformRoundRectPath(ctx, x, y, w, h, radius) {
  let r = min(radius, w / 2, h / 2);
  ctx.beginPath();
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

function platformDrawLiquidGlassButton(
  w,
  h,
  cornerR,
  accentColor,
  alpha = 255,
  hover = false,
  inkColor = null
) {
  let a = alpha / 255;
  let ctx = drawingContext;
  let accent = color(accentColor || "#8A8A8A");
  let ink = color(inkColor || accentColor || "#4A4A4A");
  let ar = red(accent);
  let ag = green(accent);
  let ab = blue(accent);
  let ir = red(ink);
  let ig = green(ink);
  let ib = blue(ink);
  let strokeA = hover ? 0.68 : 0.48;
  let x = 0.75;
  let y = 0.75;
  let rw = w - 1.5;
  let rh = h - 1.5;

  ctx.save();
  platformRoundRectPath(ctx, 0, 0, w, h, cornerR);
  let fillGrad = ctx.createLinearGradient(0, 0, 0, h);
  fillGrad.addColorStop(
    0,
    `rgba(${hover ? 252 : 250}, ${hover ? 246 : 244}, ${hover ? 238 : 235}, ${0.25 * a})`
  );
  fillGrad.addColorStop(
    1,
    `rgba(${hover ? 248 : 246}, ${hover ? 242 : 240}, ${hover ? 234 : 231}, ${0.25 * a})`
  );
  ctx.fillStyle = fillGrad;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = `rgba(${ir}, ${ig}, ${ib}, ${(hover ? 0.14 : 0.09) * a})`;
  ctx.shadowBlur = ms(hover ? 14 : 10);
  ctx.shadowOffsetY = ms(hover ? 4 : 3);
  ctx.shadowOffsetX = 0;
  platformRoundRectPath(ctx, x, y, rw, rh, cornerR);
  let rim = ctx.createLinearGradient(0, 0, w, h);
  rim.addColorStop(
    0,
    `rgba(${min(255, ar + 10)}, ${min(255, ag + 10)}, ${min(255, ab + 10)}, ${strokeA * 0.68 * a})`
  );
  rim.addColorStop(0.55, `rgba(${ar}, ${ag}, ${ab}, ${strokeA * 0.74 * a})`);
  rim.addColorStop(1, `rgba(${ir}, ${ig}, ${ib}, ${strokeA * 0.78 * a})`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = hover ? ms(1.7) : ms(1.25);
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

function platformDrawFinalCta(p, alpha) {
  let cfg = p.cfg;
  let box = platformGetFinalCtaLayout(p);
  p.finalCtaBox = box;

  let hover =
    !p.touchDevice &&
    mouseX > box.x &&
    mouseX < box.x + box.w &&
    mouseY > box.y &&
    mouseY < box.y + box.h;
  let s = hover ? 1.02 : 1;
  let cornerR = POSTER_LAYOUT.choiceCornerRadius;

  push();
  translate(box.x + box.w / 2, box.y + box.h / 2);
  scale(s);
  translate(-box.w / 2, -box.h / 2);

  platformDrawLiquidGlassButton(
    box.w,
    box.h,
    cornerR,
    cfg.choiceButtonColor,
    alpha,
    hover,
    cfg.textColor
  );

  platformApplyGrungeFont(p.grungeFont);
  let labelColor = color(cfg.textColor);
  labelColor.setAlpha(alpha);
  fill(labelColor);
  textAlign(CENTER, CENTER);
  textSize(platformText.finalCta.size);
  text(platformText.finalCta.text, box.w / 2, box.h / 2);

  pop();
}

function platformHandleFinalCtaPress() {
  let p = posterRegistry[platformMode];
  if (!p || !p.finalCtaBox) {
    return;
  }

  if (platformWasBoxClicked(p.finalCtaBox)) {
    platformReturnToIntro();
  }
}

function platformReturnToIntro() {
  platformMode = "intro";
  platformSelectedStarted = false;
  platformIntroTransitionActive = false;
  platformIntroTransitionIndex = -1;
  platformIntroTransitionSnapshot = null;
  platformPosterFadeStartTime = null;
  platformPosterFadeColor = null;
  posterResetAll();
  platformApplyCanvasSize();
}

function platformEnsureAnimalStarted() {
  if (platformSelectedStarted) return;

  platformSelectedStarted = true;
  platformInvokeAnimal("setup");
}
function platformRotatePoint(px, py, cx, cy, ang) {
  let dx = px - cx;
  let dy = py - cy;

  let rx = dx * cos(ang) - dy * sin(ang);
  let ry = dx * sin(ang) + dy * cos(ang);

  return [cx + rx, cy + ry];
}

function platformGetAnimatedTrianglePoints(index) {
  let animal = platformAnimals[index];
  let p0 = animal.pts[0];
  let p1 = animal.pts[1];
  let p2 = animal.pts[2];

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
    [mx(rp0[0] + floatX), platformTuckRefY(rp0[1] + floatY) + INTRO_TRIANGLES_OFFSET_Y],
    [mx(rp1[0] + floatX), platformTuckRefY(rp1[1] + floatY) + INTRO_TRIANGLES_OFFSET_Y],
    [mx(rp2[0] + floatX), platformTuckRefY(rp2[1] + floatY) + INTRO_TRIANGLES_OFFSET_Y]
  ];
}

function platformDrawMainBackground() {
  noStroke();
  rectMode(CORNER);
  ellipseMode(CENTER);

  for (let y = 0; y < platformH; y++) {
    let t = map(y, 0, platformH, 0, 1);
    let c = lerpColor(color(PLATFORM_BG_COLOR), color("#EDE1D1"), t);
    fill(c);
    rect(0, y, platformW, 1);
  }

  for (let r = mx(520); r > 0; r -= mx(20)) {
    let a = map(r, 520, 0, 0, 18);
    fill(255, 248, 236, a);
    ellipse(platformW / 2, my(470), mx(r) * 1.05, my(r) * 0.82);
  }
}

function platformDrawIntro() {
  platformDrawMainBackground();

  // title
  fill(PLATFORM_TEXT_COLOR);
  noStroke();

  let introFont =
    posterRegistry.turtle.grungeFont ||
    posterRegistry.eagle.grungeFont ||
    posterRegistry.toad.grungeFont ||
    posterRegistry.hyena.grungeFont ||
    posterRegistry.deer.grungeFont;

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
    if (platformIntroTransitionActive && i === platformIntroTransitionIndex) {
      continue;
    }

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

  if (platformIntroTransitionActive && platformIntroTransitionSnapshot) {
    let elapsed = millis() - platformIntroTransitionStart;
    let t = constrain(elapsed / platformIntroTransitionDuration, 0, 1);
    let e = platformEaseOutCubic(t);

    let animal = platformAnimals[platformIntroTransitionIndex];
    let snap = platformIntroTransitionSnapshot;
    let pts = snap.pts;
    let cx = snap.cx;
    let cy = snap.cy;
    let zoomScale = lerp(snap.startScale, snap.zoomScale, e);

    let bgMix = constrain(map(e, 0.5, 0.9, 0, 1), 0, 1);

    if (bgMix > 0) {
      noStroke();
      fill(lerpColor(color("#F0E8DC"), color(animal.color), bgMix));
      rect(0, 0, platformW, platformH);
    }

    push();
    translate(cx, cy);
    scale(zoomScale);
    translate(-cx, -cy);

    noStroke();
    fill(animal.color);

    triangle(
      pts[0][0], pts[0][1],
      pts[1][0], pts[1][1],
      pts[2][0], pts[2][1]
    );

    pop();

    if (t >= 1) {
      platformMode = animal.id;
      platformSelectedStarted = false;
      posterReset(posterRegistry[animal.id]);

      platformIntroTransitionActive = false;
      platformIntroTransitionIndex = -1;
      platformIntroTransitionSnapshot = null;

      platformPosterFadeColor = animal.color;
      platformPosterFadeStartTime = millis();
    }
  }
}

function platformHandleIntroPress(x, y) {
  if (platformIntroTransitionActive) {
    return;
  }

  for (let i = 0; i < platformAnimals.length; i++) {
    let pts = platformGetAnimatedTrianglePoints(i);

    if (platformPointInTriangle(x, y, pts[0], pts[1], pts[2])) {
      let cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
      let cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;

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
      platformIntroTransitionStart = millis();
      return;
    }
  }
}

function platformEaseInOutSine(x) {
  x = constrain(x, 0, 1);
  return -(cos(PI * x) - 1) / 2;
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
    return;
  }

  noStroke();
  let fadeC = color(platformPosterFadeColor || "#F0E8DC");
  fill(red(fadeC), green(fadeC), blue(fadeC), a);
  rect(0, 0, width, height);
}
function platformDrawBlockTitle(lines, x, y, size, leading, fontObj, fillValue) {
  if (fontObj) {
    textFont(fontObj);
  }

  textSize(size);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);

  let maxW = 0;

  for (let i = 0; i < lines.length; i++) {
    maxW = max(maxW, textWidth(lines[i]));
  }

  noStroke();
  fill(fillValue);

  for (let i = 0; i < lines.length; i++) {
    let lineW = textWidth(lines[i]);
    let sx = lineW === 0 ? 1 : maxW / lineW;

    push();
    translate(x, y + i * leading);
    scale(sx, 1);
    text(lines[i], 0, 0);
    pop();
  }
}

function platformTriggerCorrectFeedback(animalId) {
  let p = posterRegistry[animalId];
  if (!p) return;
  p.pulse.positive = 35;
  p.pulse.wrongSide = "";
  p.pulse.wrongShake = 0;
  p.pulse.pieceShake = 0;
  p.pulse.pieceShakeKind = "";
  p.feedback.text = "";
  p.feedback.good = true;
  p.feedback.timer = 0;
}

function platformTriggerWrongFeedback(animalId, side) {
  let p = posterRegistry[animalId];
  if (!p) return;
  p.pulse.positive = 0;
  p.pulse.wrongSide = side;
  p.pulse.wrongShake = 16;
  p.pulse.pieceShake = 42;
  p.pulse.pieceShakeKind = "bad";
  p.feedback.text = "Try again";
  p.feedback.good = false;
  p.feedback.timer = 80;
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

  return { w: window.innerWidth, h: window.innerHeight };
}

const PLATFORM_LAYOUT_Y_ANCHOR = REF_H * 0.52;
const PLATFORM_LAYOUT_Y_TIGHTEN_MIN = 0.84;
const PLATFORM_FEEDBACK_REF_Y = {
  turtle: 690,
  eagle: 690,
  deer: 700,
  toad: 690,
  hyena: 700
};

function platformGetLayoutYTighten() {
  let vp = platformGetViewportSize();
  let scaleW = vp.w / platformW;
  let scaleH = vp.h / platformH;
  if (scaleH >= scaleW * 0.98) {
    return 1;
  }
  return constrain(scaleH / scaleW, PLATFORM_LAYOUT_Y_TIGHTEN_MIN, 1);
}

function platformTuckRefY(refY) {
  let tighten = platformGetLayoutYTighten();
  if (tighten >= 0.999) {
    return my(refY);
  }
  let tuckedRef =
    PLATFORM_LAYOUT_Y_ANCHOR + (refY - PLATFORM_LAYOUT_Y_ANCHOR) * tighten;
  return my(tuckedRef);
}

function platformUpdateViewportFit() {
  let vp = platformGetViewportSize();
  platformScreenScale = max(vp.w / platformW, vp.h / platformH);
}

function platformApplyViewportLayout() {
  platformUpdateViewportFit();

  platformText.introTitle.y = platformTuckRefY(110) + 20;
  platformText.introHint.y = platformTuckRefY(620) + 160;
  platformText.questionTitle.y = platformTuckRefY(920) + POSTER_LAYOUT.questionPhaseNudgeY;
  POSTER_LAYOUT.headerLineY = platformTuckRefY(60) + 20;
  POSTER_LAYOUT.headerTextY = platformTuckRefY(34) + ms(5) + 20;
  POSTER_LAYOUT.choiceY =
    platformText.questionTitle.y - ms(168) - ms(45);

  for (let id in PLATFORM_FEEDBACK_REF_Y) {
    let p = posterRegistry[id];
    if (p && p.cfg && p.cfg.feedback) {
      p.cfg.feedback.y = platformTuckRefY(PLATFORM_FEEDBACK_REF_Y[id]);
    }
  }

  platformFitCanvasToScreen();
}

function platformBindViewportListeners() {
  if (typeof window === "undefined") {
    return;
  }

  let update = () => {
    platformApplyViewportLayout();
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
  cnv.style.position = "absolute";
  cnv.style.left = "50%";
  cnv.style.top = "50%";
  cnv.style.transform = "translate(-50%, -50%)";
  cnv.style.margin = "0";
}


// =====================================================
// SHARED POSTER UTILITIES
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
const platformChoiceImageVisualOffsetCache = new WeakMap();
const platformLooseLayoutVersion = 72;
const PLATFORM_LOOSE_ROT_PAD = 24;
const PLATFORM_LOOSE_STROKE_PAD = 3;

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
    top: my(120),
    bottom: my(720),
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
    hyenaStyleRepel: lp.hyenaStyleRepel ?? false
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

  if (cfg.id === "eagle") {
    return kept;
  }

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
    top: keepOut.top ?? my(670),
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
  let ceilingScreenY = keepOut.top - (keepOut.pad ?? ms(10)) - ms(6);
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

function platformLooseShiftTargetScreenY(target, dyScreen, cfg) {
  return platformLooseShiftTargetScreen(target, 0, dyScreen, cfg);
}

function platformLooseNudgeTargetBBoxCenter(target, goalSx, goalSy, blend, cfg, index) {
  let box = platformLoosePieceScreenBBox(cfg, target.x, target.y, index, 0, true);
  let pieceCx = (box.left + box.right) * 0.5;
  let pieceCy = (box.top + box.bottom) * 0.5;

  return platformLooseShiftTargetScreen(
    target,
    (goalSx - pieceCx) * blend,
    (goalSy - pieceCy) * blend,
    cfg
  );
}

function eagleAssignScatterSlots(targets, cfg) {
  let left = mx(12);
  let right = platformW - mx(12);
  let top = my(208);
  let bottom = POSTER_LAYOUT.choiceY - ms(54);
  let slotUV = [
    [0.82, 0.04], [0.96, 0.03], [0.70, 0.07], [0.90, 0.13],
    [0.06, 0.22], [0.20, 0.34], [0.03, 0.46], [0.14, 0.56], [0.05, 0.66], [0.18, 0.76],
    [0.96, 0.30], [0.84, 0.42], [0.97, 0.52], [0.88, 0.64],
    [0.28, 0.82], [0.48, 0.94], [0.16, 0.96], [0.74, 0.92], [0.40, 0.70]
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
  let gap = ms(40);

  for (let iter = 0; iter < 72; iter++) {
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

        let push = ((need - dist) / dist) * 0.58;
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
  let id = p.cfg.id;

  if (id === "eagle") {
    return [
      cc >= 1 ? 1 : 0,
      cc >= 2 ? 1 : 0,
      cc >= 3 ? 1 : 0,
      cc >= 4 ? 1 : 0
    ];
  }

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

function platformLooseRefreshRepelCache(p) {
  let cfg = p.cfg;

  if (!cfg.getPieceGroup) {
    return;
  }

  if (p.looseRepelCacheGen === p.clickCount && p.looseRepelCache) {
    return;
  }

  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let saved = p.tGroup.slice();
  p.tGroup = platformLooseScenarioTGroupFromClick(p);
  p.looseRepelCache = [];

  for (let i = 0; i < cfg.totalPieces; i++) {
    let group = cfg.getPieceGroup(i);

    if (platformLooseAssemblerRepelWeight(p.tGroup[group]) > 0) {
      p.looseRepelCache[i] = { x: 0, y: 0 };
      continue;
    }

    let off = p.pieceOffsets[i];
    let rot = off?.rot || 0;
    let target = platformLooseGetScatterTargetForPiece(p, i);
    target = platformLooseFitTargetOffset(cfg, pivot, target.x, target.y, i, rot);
    let cleared = platformLooseComputeRepelCleared(
      p,
      group,
      target.x,
      target.y,
      rot,
      i,
      0
    );
    cleared = platformLooseFitTargetOffset(
      cfg,
      pivot,
      cleared.x,
      cleared.y,
      i,
      rot
    );
    let afterClear = platformLooseClearLooseFromConnectedBBox(
      cleared.x,
      cleared.y,
      p,
      group,
      i,
      rot
    );

    if (
      platformLooseOverlapsConnectedGroups(p, cleared.x, cleared.y, i, rot, group) &&
      !platformLooseOverlapsConnectedGroups(
        p,
        afterClear.x,
        afterClear.y,
        i,
        rot,
        group
      )
    ) {
      cleared = afterClear;
    }

    p.looseRepelCache[i] = {
      x: cleared.x - target.x,
      y: cleared.y - target.y
    };
  }

  p.tGroup = saved;
  p.looseRepelCacheGen = p.clickCount;
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
  let bottom = min(zone.bottom - ms(8), POSTER_LAYOUT.choiceY - ms(72));

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

  for (let pass = 0; pass < 4; pass++) {
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

      let gap = platformLooseGetProfile(cfg).hyenaStyleRepel ? ms(22) : ms(16);

      if (cfg.id === "toad") {
        gap = ms(36);
      }
      let looseBox = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot, true);
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
  let bottom = min(zone.bottom - ms(8), POSTER_LAYOUT.choiceY - ms(72));
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

function toadKeepLooseTargetsClearOfConnected(targets, cfg) {
  let p = posterRegistry.toad;

  if (!p) {
    return;
  }

  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let gap = ms(32);

  for (let i = 0; i < targets.length; i++) {
    let pieceGroup = cfg.getPieceGroup(i);

    if (platformLooseAssemblerRepelWeight(p.tGroup[pieceGroup]) > 0) {
      continue;
    }

    let rot = p.pieceOffsets[i]?.rot || 0;
    let ox = targets[i].x;
    let oy = targets[i].y;

    for (let step = 0; step < 14; step++) {
      let moved = false;

      for (let g = 0; g < 4; g++) {
        if (g === pieceGroup || platformLooseAssemblerRepelWeight(p.tGroup[g]) <= 0) {
          continue;
        }

        let connectedBox = platformLooseGetConnectedGroupUnionBBox(p, g);

        if (!connectedBox) {
          continue;
        }

        let looseBox = platformLoosePieceScreenBBox(cfg, ox, oy, i, rot, true);
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
        moved = true;
      }

      if (!moved) {
        break;
      }
    }

    targets[i] = { x: ox, y: oy };
  }
}

function platformToadWarmLooseRepel(p) {
  let cfg = p.cfg;

  if (!cfg || cfg.id !== "toad" || !cfg.getPieceGroup) {
    return;
  }

  let profile = platformLooseGetProfile(cfg);

  if (!profile.hyenaStyleRepel) {
    return;
  }

  let pivot = profile.pivot;
  let savedTGroup = p.tGroup.slice();
  let projected = [0, 0, 0, 0];

  if (p.clickCount >= 1) {
    projected[0] = 1;
  }
  if (p.clickCount >= 2) {
    projected[1] = 1;
  }
  if (p.clickCount >= 3) {
    projected[2] = 1;
    projected[3] = 1;
  }

  p.tGroup = projected;

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
      x: lerp(prev.x, desired.x, 0.62),
      y: lerp(prev.y, desired.y, 0.62)
    };
  }

  p.tGroup = savedTGroup;
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
  let zone = platformLooseGetProfile(cfg).layout.zone;

  if (!zone || !cfg.getPieceGroup) {
    return;
  }

  eagleAssignScatterSlots(targets, cfg);
  eagleSeparateLooseTargets(targets, cfg);

  let keepOut = platformLooseGetProfile(cfg).choiceKeepOut;
  let ceilingScreenY =
    keepOut ? keepOut.top - (keepOut.pad ?? ms(10)) - ms(6) : platformH;
  let headerFloor = my(200);

  for (let i = 0; i < targets.length; i++) {
    let box = platformLoosePieceScreenBBox(cfg, targets[i].x, targets[i].y, i, 0, true);

    if (box.top < headerFloor) {
      targets[i] = platformLooseShiftTargetScreen(
        targets[i],
        0,
        headerFloor - box.top,
        cfg
      );
    }

    box = platformLoosePieceScreenBBox(cfg, targets[i].x, targets[i].y, i, 0, true);

    if (box.bottom > ceilingScreenY) {
      targets[i] = platformLooseClampTargetAboveChoice(
        cfg,
        targets[i].x,
        targets[i].y,
        i,
        0
      );
    }
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
  cleared = platformLooseComputeRepelCleared(
    p,
    pieceGroup,
    cleared.x,
    cleared.y,
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

    let bboxPasses = p.cfg.id === "toad" ? min(14, 8 + connectedGroups * 2) : 4;

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
      follow = 0.55;
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
  return platformLooseResolveProfile(cfg);
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

    if (profile.useZonePush && cfg.assembleZones) {
      for (let i = 0; i < built.length; i++) {
        built[i] = platformLooseClearHomeFromAllZones(cfg, built[i].x, built[i].y, i);
      }
    }

    if (cfg.getPieceGroup && cfg.id !== "toad") {
      built = platformLooseBakeScatterTargets(cfg, built);
    }

    if (cfg.id === "eagle") {
      eagleAdjustLooseTargets(built, cfg);
    }

    if (cfg.id === "deer") {
      deerAdjustLooseTargets(built, cfg);
    }

    if (cfg.id === "toad") {
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
  let dt = platformLooseGetProfile(cfg).drawTransform;
  let baseScale = dt?.scale ?? 1;

  if (!dt) {
    return { ox: 0, oy: 0, scale: 1, scaleX: 1, scaleY: 1, px: 500, py: 500 };
  }

  return {
    ox: dt.originX ?? 0,
    oy: dt.originY ?? 0,
    scale: baseScale,
    scaleX: dt.scaleX ?? baseScale,
    scaleY: dt.scaleY ?? baseScale,
    px: dt.pivotX ?? 500,
    py: dt.pivotY ?? 500
  };
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
  return {
    x: platformW / 2 + (ax - ANIMAL_REF_W / 2) * s,
    y: my(ANIMAL_ANCHOR_Y) + ANIMAL_SCREEN_OFFSET_Y + (ay - ANIMAL_ANCHOR_Y) * s
  };
}

function platformScreenToAnimalRef(sx, sy) {
  let s = platformW / ANIMAL_REF_W;
  return {
    x: (sx - platformW / 2) / s + ANIMAL_REF_W / 2,
    y: (sy - my(ANIMAL_ANCHOR_Y) - ANIMAL_SCREEN_OFFSET_Y) / s + ANIMAL_ANCHOR_Y
  };
}

function platformLooseGetCompositionBounds(cfg = {}) {
  let profile = platformLooseGetProfile(cfg);
  let pad = profile.composition.pad ?? ms(6);
  let c = profile.composition;

  return {
    left: c.left + pad,
    right: c.right - pad,
    top: c.top + pad,
    bottom: c.bottom - pad
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

function platformLooseGetBoundsGeo(cfg, index) {
  let geo = platformLooseGetPieceGeo(cfg, index) || platformLooseGetGroupGeo(cfg, index);

  if (!geo && cfg.id === "toad") {
    return { minDx: -34, maxDx: 34, minDy: -34, maxDy: 34 };
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

function platformLooseGetToadScatterTargets() {
  let cacheKey = "toad_v" + platformLooseLayoutVersion;

  if (!platformPelobatesTargetCache[cacheKey]) {
    let cfg = posterRegistry.toad.cfg;
    let built = [];

    for (let i = 0; i < cfg.totalPieces; i++) {
      built.push(getPelobatesLoosePieceTarget(i));
    }

    toadAdjustLooseTargets(built, cfg);
    platformPelobatesTargetCache[cacheKey] = built;
  }

  return platformPelobatesTargetCache[cacheKey];
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

function platformLooseGetConnectedGroupUnionBBox(p, groupIndex) {
  let cfg = p.cfg;
  let groupT = platformLooseGetRepelGroupT(p, groupIndex);

  if (platformLooseAssemblerRepelWeight(groupT) <= 0) {
    return null;
  }

  let box = null;

  for (let j = 0; j < cfg.totalPieces; j++) {
    if (cfg.getPieceGroup(j) !== groupIndex) {
      continue;
    }

    let repelOff = platformLooseGetConnectedPieceRepelOffset(p, j);

    if (!repelOff) {
      continue;
    }

    let pieceBox = platformLoosePieceScreenBBox(
      cfg,
      repelOff.x,
      repelOff.y,
      j,
      repelOff.rot,
      false
    );
    let asmPad = ms(8);
    pieceBox = {
      left: pieceBox.left - asmPad,
      right: pieceBox.right + asmPad,
      top: pieceBox.top - asmPad,
      bottom: pieceBox.bottom + asmPad
    };
    box = platformLooseUnionBBox(box, pieceBox);
  }

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

  for (let iter = 0; iter < 32; iter++) {
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
      let looseBox = platformLoosePieceScreenBBox(cfg, ox, oy, index, rot, true);
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

  return { x: ox, y: oy };
}

function platformLooseMeshPointToScreen(meshX, meshY, cfg) {
  let posterPt = platformLooseMeshToPosterRef(meshX, meshY, cfg);
  return platformAnimalRefToScreen(posterPt.x, posterPt.y);
}

function platformLoosePieceScreenBBox(cfg, offsetX, offsetY, index, rot = 0, useLoosePad = true) {
  let profile = platformLooseGetProfile(cfg);
  let pivot = profile.pivot;
  let geo = platformLooseGetBoundsGeo(cfg, index);

  if (!geo) {
    let p = platformLooseMeshPointToScreen(pivot.x + offsetX, pivot.y + offsetY, cfg);
    return { left: p.x, right: p.x, top: p.y, bottom: p.y };
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
    corners.push(
      platformLooseMeshPointToScreen(pivot.x + offsetX + rx, pivot.y + offsetY + ry, cfg)
    );
  }

  let left = corners[0].x;
  let right = corners[0].x;
  let top = corners[0].y;
  let bottom = corners[0].y;

  for (let i = 1; i < corners.length; i++) {
    left = min(left, corners[i].x);
    right = max(right, corners[i].x);
    top = min(top, corners[i].y);
    bottom = max(bottom, corners[i].y);
  }

  let floatPad = profile.floatAmp * 0.65;
  let pad = useLoosePad
    ? floatPad + PLATFORM_LOOSE_STROKE_PAD + ms(4)
    : PLATFORM_LOOSE_STROKE_PAD;

  return {
    left: left - pad,
    right: right + pad,
    top: top - pad,
    bottom: bottom + pad
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
  if (!p?.cfg || p.cfg.id !== "toad" || p.disassembleBoost > 0) {
    return p.tGroup[groupIndex];
  }

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

function platformLooseClampAbsPosition(absX, absY, strength = 1, cfg = {}, index = 0, rot = 0) {
  let pivot = platformLooseGetPivot(cfg);
  let clamped = platformLooseClampOffset(
    absX - pivot.x,
    absY - pivot.y,
    rot,
    strength,
    cfg,
    index
  );

  return {
    x: pivot.x + clamped.x,
    y: pivot.y + clamped.y
  };
}

function platformKeepLoosePiecesClear(
  p,
  pieceGroup,
  offsetX,
  offsetY,
  pieceT,
  index = 0,
  rot = 0
) {
  let pushed = platformLooseApplyPushDelta(
    p,
    index,
    offsetX,
    offsetY,
    pieceT,
    pieceGroup
  );

  return platformLooseClampOffset(
    pushed.x,
    pushed.y,
    rot,
    1,
    p.cfg,
    index
  );
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

    for (let j = 0; j < cfg.totalPieces; j++) {
      if (cfg.getPieceGroup(j) === pieceGroup) {
        continue;
      }

      let repelOff = platformLooseGetConnectedPieceRepelOffset(p, j);

      if (!repelOff) {
        continue;
      }

      let pieceBox = platformLoosePieceScreenBBox(
        cfg,
        repelOff.x,
        repelOff.y,
        j,
        repelOff.rot,
        true
      );
      let inflated = {
        left: pieceBox.left - gap,
        right: pieceBox.right + gap,
        top: pieceBox.top - gap,
        bottom: pieceBox.bottom + gap
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
  target = platformLooseFitTargetOffset(cfg, pivot, target.x, target.y, index, baseRot);

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
  let spaceRot =
    (off.rot + sin(frameCount * 0.004 + off.phase) * 0.16 * wobbleDampen) *
    rotNearBody;
  let softFloatX =
    sin(frameCount * off.speedX + off.phase + index * 1.7) *
    profile.floatAmp *
    wobble *
    wobbleDampen;
  let softFloatY =
    cos(frameCount * off.speedY + off.phase + index * 1.3) *
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

  translate(pivot.x + currentX, pivot.y + currentY);
  scale(pulseScale);
  rotate(currentRot);
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

function platformDrawVerticalGradient(bgTop, bgBottom) {
  noStroke();
  rectMode(CORNER);

  for (let y = 0; y < platformH; y++) {
    let t = map(y, 0, platformH, 0, 1);
    let c = lerpColor(color(bgTop), color(bgBottom), t);
    fill(c);
    rect(0, y, platformW, 1);
  }
}

function platformDrawRadialGlow(r, g, b, centerX, centerY, maxRadius, step, maxAlpha, widthScale, heightScale) {
  for (let radius = maxRadius; radius > 0; radius -= step) {
    let a = map(radius, maxRadius, 0, 0, maxAlpha);
    fill(r, g, b, a);
    ellipse(centerX, centerY, radius * widthScale, radius * heightScale);
  }
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

function platformWasBoxClicked(box) {
  return (
    mouseX > box.x &&
    mouseX < box.x + box.w &&
    mouseY > box.y &&
    mouseY < box.y + box.h
  );
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

function platformGetChoiceImageVisualOffset(img) {
  if (!img || !img.canvas) {
    return { x: 0, y: 0 };
  }

  if (platformChoiceImageVisualOffsetCache.has(img)) {
    return platformChoiceImageVisualOffsetCache.get(img);
  }

  let c = img.canvas;
  let ctx = c.getContext("2d");
  let d = ctx.getImageData(0, 0, c.width, c.height).data;
  let sx = 0;
  let sy = 0;
  let m = 0;

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      let i = (y * c.width + x) * 4;
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
      let a = d[i + 3];
      if (a < 40) {
        continue;
      }

      let lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let weight = (a / 255) * pow(lum / 255, 1.35);
      if (weight < 0.02) {
        continue;
      }

      sx += x * weight;
      sy += y * weight;
      m += weight;
    }
  }

  let offset =
    m > 0
      ? { x: sx / m - c.width / 2, y: sy / m - c.height / 2 }
      : { x: 0, y: 0 };
  platformChoiceImageVisualOffsetCache.set(img, offset);
  return offset;
}

const platformChoiceImageTweaks = {
  fabricBag: { offsetY: 3 },
  garbageBin: { maxSizeScale: 0.85 },
  sandwichPlastic: { maxSizeScale: 0.85, offsetY: -2 },
  glassCup: { maxSizeScale: 0.85 },
  plasticCup: { maxSizeScale: 0.85 },
  plasticFork: { maxSizeScale: 0.82, offsetY: -5 },
  reusableFork: { maxSizeScale: 0.82, offsetY: -5 }
};

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

function platformGetChoicePanelLayout(w, h, label, img, font, imgId = "") {
  let tweaks = platformChoiceImageTweaks[imgId] || {};
  let imgSlotH = POSTER_LAYOUT.choiceImageSize;
  let drawSize = platformGetChoiceImageDrawSize(
    img,
    imgSlotH * (tweaks.maxSizeScale ?? 1)
  );
  let labelSize = platformText.choiceLabel.size;
  let labelGap = platformText.choiceLabel.yOffset;
  let labelLeading = max(labelSize * 1.15, ms(16));
  let labelH = platformMeasureChoiceLabelBlock(
    "Disposable cutlery",
    font,
    labelSize,
    labelLeading
  );
  let visualOff = platformGetChoiceImageVisualOffset(img);
  let imgVisualShiftY = visualOff.y * drawSize.scale;
  let contentH = imgSlotH + labelGap + labelH;
  let contentTop = (h - contentH) / 2;

  return {
    imgX: w / 2 - visualOff.x * drawSize.scale,
    imgCenterY:
      contentTop + imgSlotH / 2 - imgVisualShiftY + (tweaks.offsetY || 0),
    imgW: drawSize.w,
    imgH: drawSize.h,
    labelY: contentTop + imgSlotH + labelGap,
    labelLeading,
    labelSize
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
  let cornerR = POSTER_LAYOUT.choiceCornerRadius;

  push();
  translate(x + w / 2 + wrongShakeX, y + h / 2);
  scale(s);
  translate(-w / 2, -h / 2);

  platformDrawLiquidGlassButton(w, h, cornerR, buttonColor, 255, hover, textColor);

  let layout = platformGetChoicePanelLayout(w, h, label, img, font, imgId);

  imageMode(CENTER);
  if (img) {
    image(img, layout.imgX, layout.imgCenterY, layout.imgW, layout.imgH);
  }
  if (overlayImg) {
    push();
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

function platformDrawStageChoices(clickCount, leftBox, rightBox, images, drawPanel, stages = platformChoiceStages) {
  if (clickCount >= stages.length) {
    return;
  }

  let stage = stages[clickCount];

  drawPanel(
    leftBox.x,
    leftBox.y,
    leftBox.w,
    leftBox.h,
    images[stage.left.img],
    stage.left.label,
    stage.left.img,
    stage.left
  );

  drawPanel(
    rightBox.x,
    rightBox.y,
    rightBox.w,
    rightBox.h,
    images[stage.right.img],
    stage.right.label,
    stage.right.img,
    stage.right
  );
}

function platformDrawQuestionTitle(textColor) {
  fill(textColor);
  textSize(platformText.questionTitle.size);
  platformDrawTightWordText(
    platformText.questionTitle.text,
    platformText.questionTitle.x,
    platformText.questionTitle.y,
    platformText.questionTitle.leading,
    "center"
  );
}

function platformGetQuestionStageCount(p) {
  let stages = p.cfg.choiceStages || platformChoiceStages;
  return stages.length;
}

function platformGetProgressBaseY() {
  return (
    platformText.questionTitle.y +
    platformText.questionTitle.leading +
    POSTER_LAYOUT.progressGapBelowQuestion
  );
}

function platformDrawQuestionProgress(p) {
  let cfg = p.cfg;
  let total = platformGetQuestionStageCount(p);
  if (total <= 0 || p.clickCount >= cfg.finalClickCount) {
    return;
  }

  let dotR = POSTER_LAYOUT.progressDotR;
  let dotD = dotR * 2;
  let dashW = POSTER_LAYOUT.progressDashW;
  let dashH = dotD;
  let gap = POSTER_LAYOUT.progressItemGap;
  let y = platformGetProgressBaseY();
  let markerY = y + dotD / 2;
  let baseColor = color(cfg.textColor);
  let currentIndex = constrain(p.clickCount, 0, total - 1);

  let sizes = [];
  for (let i = 0; i < total; i++) {
    sizes.push(i === currentIndex ? dashW : dotD);
  }

  let trackW = sizes.reduce((sum, size) => sum + size, 0) + gap * max(0, total - 1);
  let cursorX = platformW / 2 - trackW / 2;

  push();
  noStroke();
  rectMode(CENTER);
  ellipseMode(CENTER);

  for (let i = 0; i < total; i++) {
    let cx = cursorX + sizes[i] / 2;

    if (i === currentIndex) {
      let dashColor = color(baseColor);
      dashColor.setAlpha(255);
      fill(dashColor);
      rect(cx, markerY, dashW, dashH, dashH / 2);
    } else {
      let dotColor = color(baseColor);
      dotColor.setAlpha(POSTER_LAYOUT.progressDotAlpha);
      fill(dotColor);
      ellipse(cx, markerY, dotD, dotD);
    }

    cursorX += sizes[i] + gap;
  }

  pop();
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
// POSTER REGISTRY + GENERIC POSTER ENGINE
// =====================================================

const POSTER_LAYOUT = {
  marginX: mx(34),
  headerLineY: my(60) + 20,
  headerTextX: mx(40),
  headerTextY: my(34) + ms(5) + 20,
  headerNudgeY: -30,
  finalFooterNudgeY: 0,
  finalMessageNudgeY: -60,
  feedbackNudgeY: -25,
  choiceW: ms(168),
  choiceH: ms(168),
  choiceY: platformText.questionTitle.y - ms(168) - ms(45),
  answerTop: my(715),
  footerTop: my(882),
  finalTextCenterOffset: my(24),
  finalIntro: 4000,
  finalFade: 900,
  choiceImageSize: ms(92),
  choiceCornerRadius: ms(14),
  choiceCenterPull: ms(22),
  finalTitleYOffset: 2,
  finalContentYOffset: -10,
  finalBodyX: mx(345),
  finalBodyXOffset: -35,
  finalBodyLineCount: 7,
  finalCtaGap: ms(26),
  finalCtaH: ms(56),
  frameStrokeWeight: 0.9,
  questionPhaseNudgeY: -10,
  progressGapBelowQuestion: ms(12),
  progressDashW: ms(10),
  progressDotR: ms(3),
  progressItemGap: ms(12),
  progressDotAlpha: 72
};

function platformGetFinalBodyTopY() {
  let bodyLeading = ms(20);
  let bodySize = ms(17);
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
    finalCtaBox: null,
    jumpReadyTime: null,
    touchDevice: false,
    finalMotion: 0,
    deer: { x: 30, y: -80, scale: 0.92, drawX: 30, drawY: -80 },
    hyena: { x: 26, y: -8, scale: 0.6, drawX: 26, drawY: -8 }
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
    bgTop: "#EEF3DD",
    bgBottom: "#C6D7A7",
    glow: { r: 245, g: 238, b: 204, cy: my(400), maxR: mx(540), step: 18, maxA: 28, ws: 1.08, hs: 0.76 },
    headerTitle: "Green Sea Turtle",
    headerLeading: ms(18),
    finalFooter: { text: "Only 15 Green Sea Turtle\nnests in Israel" },
    finalBody: {
      text: "Smart everyday choices can help\nprotect sea turtles. Reducing\nplastic, choosing reusable\nproducts, and keeping beaches\nclean can prevent pollution from\nreaching the ocean and helping\nsea turtles survive in nature."
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
        top: my(128),
        bottom: my(712),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "grid",
        gridCols: 3,
        zoneInset: 0.18,
        screenShift: { x: 0, y: 12 },
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
    finalClickCount: 4,
    textColor: PLATFORM_TEXT_COLOR,
    choiceButtonColor: "#c7aa89",
    textRgb: PLATFORM_TEXT_RGB,
    bgTop: "#ECE9E1",
    bgBottom: "#DDBA90",
    glow: { r: 243, g: 230, b: 212, cy: my(390), maxR: mx(520), step: 18, maxA: 23, ws: 1.02, hs: 0.74 },
    headerTitle: "Eurasian Griffon Vulture",
    headerLeading: ms(64),
    finalFooter: { text: "About 180 Griffon\nVultures left in Israel" },
    finalBody: {
      text: "Smart everyday choices can help\nprotect vultures. Reducing waste,\nchoosing responsible products,\nand keeping nature clean can\nprevent harm to wildlife, protect\nfood chains, and help vulture\nsurvive across the Israeli skies."
    },
    feedback: { rgb: true, y: my(690) },
    pipeline: ["bg", "animal", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: false,
    nextClickCount(stage) { return stage === 2 ? 4 : stage + 1; },
    randomSeed: 100,
    totalPieces: 19,
    pieceRandom: {
      x: [-280, 280],
      y: [-280, 280],
      speed: [0.004, 0.01],
      wobble: false,
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
      { cx: 520, cy: 520, rx: 220, ry: 200, influence: 1.02 },
      { cx: 470, cy: 440, rx: 150, ry: 140, influence: 1.02 },
      { cx: 282, cy: 245, rx: 142, ry: 148, influence: 1.02 },
      { cx: 565, cy: 880, rx: 175, ry: 130, influence: 1.02 }
    ],
    loosePiece: {
      pivot: { x: 500, y: 500 },
      scatter: { x: 0, y: 0 },
      hyenaStyleRepel: true,
      useZonePush: true,
      zonePushRuntime: true,
      dampenWobbleNearBody: true,
      zonePushPad: ms(4),
      zonePushBlend: 1,
      assembleClearance: ms(14),
      looseRepelFollow: 0.22,
      choiceKeepOut: {
        left: mx(24),
        right: platformW - mx(24),
        top: POSTER_LAYOUT.choiceY,
        bottom: platformH,
        pad: ms(68)
      },
      drawTransform: {
        originX: ANIMAL_REF_W / 2 - 42,
        originY: 405,
        scale: 0.69,
        pivotX: 500,
        pivotY: 500
      },
      composition: {
        left: mx(28),
        right: platformW - mx(28),
        top: my(130),
        bottom: my(565),
        pad: ms(4),
        edgePad: ms(10)
      },
      layout: {
        type: "zone",
        zoneMode: "groupRanges",
        zoneInset: 0.03,
        groupRingSpread: 0.72,
        zone: {
          left: mx(14),
          right: platformW - mx(14),
          top: my(138),
          bottom: my(565)
        },
        groupRanges: {
          0: { uMin: 0.02, uMax: 0.44, vMin: 0.36, vMax: 0.82 },
          1: { uMin: 0.56, uMax: 0.98, vMin: 0.36, vMax: 0.82 },
          2: { uMin: 0.06, uMax: 0.94, vMin: 0.58, vMax: 0.98 },
          3: { uMin: 0.02, uMax: 0.98, vMin: 0.04, vMax: 0.26 }
        },
        screenShift: { x: 0, y: 0 },
        placement: "bbox"
      },
      floatAmp: 5,
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
    bgTop: "#F4D4B8",
    bgBottom: "#DFA173",
    glow: { r: 255, g: 232, b: 198, cy: my(430), maxR: mx(520), step: 18, maxA: 24, ws: 1.02, hs: 0.74 },
    headerTitle: "Acacia Gazelle",
    headerLeading: ms(64),
    finalFooter: { text: "46 Acacia Gazelles\nleft in Israel" },
    finalBody: {
      text: "Smart everyday choices can help\nprotect acacia gazelles. Reducing\nwaste, choosing responsible\nproducts, and keeping nature clean\ncan prevent harm to wildlife,\npreserve fragile habitats, and\nhelp acacia gazelles survive."
    },
    textRgb: PLATFORM_TEXT_RGB,
    feedback: { rgb: true, y: my(700) },
    pipeline: ["bg", "header", "animal", "question", "footer", "feedback", "frame"],
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
        originX: 30,
        originY: -80,
        scale: 0.92,
        pivotX: 0,
        pivotY: 0
      },
      composition: {
        left: mx(20),
        right: platformW - mx(20),
        top: my(128),
        bottom: my(712),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "groupRanges",
        zoneInset: 0.1,
        groupRingSpread: 0.52,
        screenShift: { x: 0, y: 10 },
        placement: "bbox",
        groupRanges: {
          0: { uMin: 0.56, uMax: 0.98, vMin: 0.28, vMax: 0.62 },
          1: { uMin: 0.50, uMax: 0.98, vMin: 0.44, vMax: 0.78 },
          2: { uMin: 0.06, uMax: 0.90, vMin: 0.62, vMax: 0.96 },
          3: { uMin: 0.20, uMax: 0.96, vMin: 0.66, vMax: 0.98 }
        }
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
    headerTitle: "Pelobates syriacus",
    headerLeading: ms(18),
    finalFooter: { text: "Only a few populations\nremain in Israel" },
    finalBody: {
      text: "Pelobates syriacus depends on\nseasonal ponds and clean wetlands\nto survive. Protecting fragile\nwetlands, reducing pollution, and\nmaking better everyday choices\ncan help this rare amphibian live\nsafely in its natural habitat."
    },
    feedback: { rgb: true, y: my(690) },
    pipeline: ["bg", "animal", "finalTimer", "question", "footer", "feedback", "frame", "header"],
    resetFinalOnCorrect: true,
    requiresFullAssemblyForFinal: true,
    nextClickCount(stage) { return stage + 1; },
    isFullyAssembled(p) {
      return (
        p.clickCount >= 3 &&
        p.tGroup[0] > 0.995 &&
        p.tGroup[1] > 0.995 &&
        p.tGroup[2] > 0.995 &&
        p.tGroup[3] > 0.995
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
        top: my(128),
        bottom: my(712),
        pad: ms(4),
        edgePad: ms(16)
      },
      layout: {
        type: "zone",
        zoneMode: "groupRanges",
        zoneInset: 0.18,
        groupRingSpread: 0.34,
        screenShift: { x: 0, y: 8 },
        placement: "bbox",
        groupRanges: {
          0: { uMin: 0.24, uMax: 0.76, vMin: 0.16, vMax: 0.46 },
          1: { uMin: 0.22, uMax: 0.78, vMin: 0.22, vMax: 0.52 },
          2: { uMin: 0.26, uMax: 0.74, vMin: 0.34, vMax: 0.64 },
          3: { uMin: 0.28, uMax: 0.72, vMin: 0.44, vMax: 0.72 }
        }
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
    headerTitle: "Striped Hyena",
    headerLeading: ms(64),
    finalFooter: { text: "About 1,000 Striped\nHyenas left in Israel" },
    finalBody: {
      text: "Smart everyday choices can help\nprotect striped hyenas. Reducing\nwaste, choosing responsible\nproducts, and keeping nature\nclean can prevent harm to wildlife\nand help striped hyenas survive\nacross their natural habitats."
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
}

function platformPosterTGroupTarget(p, groupIndex) {
  let cc = p.clickCount;

  if (p.cfg.id === "eagle") {
    return cc >= [1, 2, 3, 4][groupIndex] ? 1 : 0;
  }

  if (groupIndex <= 1) {
    return cc >= groupIndex + 1 ? 1 : 0;
  }

  return cc >= 3 ? 1 : 0;
}

function platformLerpPosterTGroup(p, groupIndex, normalRate) {
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
  p.disassembleBoost = 320;
  p.disassembleRepelWarmup = 0;
  p.looseRepelBlendT = 0;
  p.looseWobbleDampen = null;
  p.toadRepelBoost = 0;
  p.finalStart = null;
  p.jumpReadyTime = null;
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
  p.finalCtaBox = null;
  p.jumpReadyTime = null;
  p.finalMotion = 0;
  p.deer = { x: 30, y: -80, scale: 0.92, drawX: 30, drawY: -80 };
  p.hyena = { x: 26, y: -8, scale: 0.6, drawX: 26, drawY: -8 };
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
  platformApplyGrungeFont(p.grungeFont);
  let boxes = platformCreateChoiceBoxes(
    POSTER_LAYOUT.choiceW,
    POSTER_LAYOUT.choiceH,
    POSTER_LAYOUT.choiceY,
    POSTER_LAYOUT.choiceCenterPull
  );
  p.leftBox = boxes.left;
  p.rightBox = boxes.right;
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
  }
}

function posterDrawBackground(p) {
  platformDrawMainBackground();
}

function posterDrawFrame(p) {
  let cfg = p.cfg;
  strokeWeight(POSTER_LAYOUT.frameStrokeWeight);
  noFill();
  stroke(cfg.textColor);
  line(
    POSTER_LAYOUT.marginX,
    POSTER_LAYOUT.headerLineY + POSTER_LAYOUT.headerNudgeY,
    platformW - POSTER_LAYOUT.marginX,
    POSTER_LAYOUT.headerLineY + POSTER_LAYOUT.headerNudgeY
  );
}

function posterDrawHeader(p) {
  let cfg = p.cfg;
  noStroke();
  fill(cfg.textColor);
  platformApplyGrungeFont(p.grungeFont);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  textSize(ms(17));
  textLeading(cfg.headerLeading);
  text(cfg.headerTitle, POSTER_LAYOUT.headerTextX, POSTER_LAYOUT.headerTextY + POSTER_LAYOUT.headerNudgeY);
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

  platformDrawQuestionTitle(cfg.textColor);
  platformDrawQuestionProgress(p);
  platformDrawStageChoices(
    p.clickCount,
    p.leftBox,
    p.rightBox,
    p.images,
    (x, y, w, h, img, label, imgId, choice) =>
      posterDrawChoicePanel(p, x, y, w, h, img, label, imgId, choice),
    cfg.choiceStages || platformChoiceStages
  );
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

  let bodySize = ms(17);
  let bodyLeading = ms(20);
  textSize(bodySize);
  textLeading(bodyLeading);
  let bodyBlockH =
    (POSTER_LAYOUT.finalBodyLineCount - 1) * bodyLeading + bodySize;
  let bodyY = platformGetFinalBodyTopY() + POSTER_LAYOUT.finalContentYOffset + POSTER_LAYOUT.finalMessageNudgeY;
  let bodyX = POSTER_LAYOUT.finalBodyX + POSTER_LAYOUT.finalBodyXOffset;

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
  platformDrawFinalCta(p, alpha);
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
    platformText.introTitle.y + POSTER_LAYOUT.finalFooterNudgeY,
    platformText.finalFooter.leading
  );
}

function posterDraw(id) {
  let p = posterRegistry[id];
  let cfg = p.cfg;
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
}

function posterHandleChoicePress(id) {
  let p = posterRegistry[id];
  let cfg = p.cfg;
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
    p.clickCount = cfg.nextClickCount(stage);

    if (id === "toad") {
      p.toadRepelBoost = 160;
      platformToadWarmLooseRepel(p);
    } else if (!platformLooseGetProfile(cfg).hyenaStyleRepel) {
      p.looseRepelSmooth = null;
    }

    p.looseRepelCacheGen = -1;
    p.looseRepelBlendT = 0;
    if (cfg.resetFinalOnCorrect && stage < cfg.finalClickCount - 1) {
      p.finalStart = null;
    }
    if (p.clickCount >= cfg.finalClickCount && !cfg.requiresFullAssemblyForFinal) {
      p.finalStart = millis();
    }
    platformTriggerCorrectFeedback(id);
  } else if (clickedWrong) {
    posterRestartFromWrongAnswer(p);
    platformTriggerWrongFeedback(id, correctSide === "left" ? "right" : "left");
  }
}

function posterMousePressed(id) {
  posterHandleChoicePress(id);
}

function posterTouchStarted(id) {
  posterRegistry[id].touchDevice = true;
  posterHandleChoicePress(id);
  return false;
}

function posterWindowResized(id) {
  platformApplyViewportLayout();
}

const platformAnimalHandlers = {
  turtle: {
    finalClickCount: 3,
    draw: () => posterDraw("turtle"),
    setup: () => posterSetup("turtle"),
    mousePressed: () => posterMousePressed("turtle"),
    touchStarted: () => posterTouchStarted("turtle"),
    windowResized: () => posterWindowResized("turtle")
  },
  eagle: {
    finalClickCount: 4,
    draw: () => posterDraw("eagle"),
    setup: () => posterSetup("eagle"),
    mousePressed: () => posterMousePressed("eagle"),
    touchStarted: () => posterTouchStarted("eagle"),
    windowResized: () => posterWindowResized("eagle")
  },
  deer: {
    finalClickCount: 3,
    draw: () => posterDraw("deer"),
    setup: () => posterSetup("deer"),
    mousePressed: () => posterMousePressed("deer"),
    touchStarted: () => posterTouchStarted("deer"),
    windowResized: () => posterWindowResized("deer")
  },
  toad: {
    finalClickCount: 3,
    draw: () => posterDraw("toad"),
    setup: () => posterSetup("toad"),
    mousePressed: () => posterMousePressed("toad"),
    touchStarted: () => posterTouchStarted("toad"),
    windowResized: () => posterWindowResized("toad")
  },
  hyena: {
    finalClickCount: 3,
    draw: () => posterDraw("hyena"),
    setup: () => posterSetup("hyena"),
    mousePressed: () => posterMousePressed("hyena"),
    touchStarted: () => posterTouchStarted("hyena"),
    windowResized: () => posterWindowResized("hyena")
  }
};

// =====================================================
// ANIMAL ART — unique geometry / motion per species
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

  let swim = frameCount * 0.045;
  let movement = p.finalMotion;
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
    p.clickCount >= 4 &&
    p.tGroup[0] > 0.96 &&
    p.tGroup[1] > 0.96 &&
    p.tGroup[2] > 0.96 &&
    p.tGroup[3] > 0.96;

  let finalAlive = eagleFullyAssembled;

  // Eases perch animation in once fully assembled — feet stay grounded
  p.finalMotion = lerp(p.finalMotion, finalAlive ? 1 : 0, 0.035);

  vultureX = ANIMAL_REF_W / 2 - 42;
  vultureY = 405;
  vultureScale = 0.69;
  vultureRot = 0;
  // Keep loose scatter pieces stable during assembly — perch motion only when fully built.
  floatIntensity = eagleFullyAssembled ? 1 - p.finalMotion : 0;

  translate(vultureX, vultureY);

  let floatY = sin(frameCount * 0.02) * 10 * floatIntensity;
  let floatX = cos(frameCount * 0.015) * 7 * floatIntensity;
  let bodyTilt = sin(frameCount * 0.01) * 0.035 * floatIntensity;

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
    let life = p.finalMotion;

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
    let hoverPhase = sin(frameCount * 0.022 + 1.1) * life;
    platformRotatePointKeys(pts, hoverKeys, pts.legTop, hoverPhase * 0.1);
    for (let i = 0; i < hoverKeys.length; i++) {
      pts[hoverKeys[i]] = platformMovePoint(pts[hoverKeys[i]], 0, hoverPhase * 20);
    }

    // 1 — Head tilt: neck joint
    let headTiltAng = sin(frameCount * 0.03) * 0.09 * life;
    platformRotatePointKeys(pts, headTiltKeys, pts.neckBaseFront, headTiltAng);

    // 2 — Wings: shoulder joint, extend up then slowly return
    let wingPhase = (frameCount * 0.0072 + 0.25) % 1;
    let wingExtend = platformEagleWingExtendPhase(wingPhase) * life;
    platformRotatePointKeys(pts, wingKeys, pts.shoulder, -wingExtend * 0.24 * life);
  } else {
    // subtle folded-paper movement while pieces are still assembling
    let headFold = map(sin(frameCount * 0.008), -1, 1, 0.92, 1.04);
    pts.beakTip = platformFoldPoint(pts.beakTip, pts.headTop, pts.throat, headFold);
    pts.beakTop = platformFoldPoint(pts.beakTop, pts.headTop, pts.throat, headFold);
    pts.beakBot = platformFoldPoint(pts.beakBot, pts.headTop, pts.throat, headFold);

    let wingFoldMove = map(sin(frameCount * 0.012), -1, 1, 0.86, 1.14);
    pts.wingTip = platformFoldPoint(pts.wingTip, pts.backTop, pts.bodyLow, wingFoldMove);
    pts.tailTip = platformFoldPoint(pts.tailTip, pts.backEnd, pts.bellyBack, wingFoldMove);

    let legFold = map(sin(frameCount * 0.018 + 0.4), -1, 1, 0.94, 1.08);
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

  let movement = p.finalMotion;

  // Main rhythm. Adjust only this number if you want it slower/faster.
  let gait = frameCount * 0.052;

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

  p.deer.x = 30;
  p.deer.y = -80 + platformScreenPxToAnimalRefY(DEER_HYENA_EXTRA_SCREEN_OFFSET_Y);
  p.deer.scale = 0.92;

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
    return;
  }

  platformApplyLoosePieceTransform(posterRegistry.deer, index, t);
}

function drawDeerPieceTri(hexColor, p1, p2, p3, index, t) {
  push();
  applyDeerPieceTransform(index, t);
  platformDrawTri(hexColor, p1, p2, p3);
  pop();
}

const PELOBATES_JUMP_DELAY = 420;

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
    return;
  }

  platformApplyLoosePieceTransform(p, index, t);
}

function drawPelobatesPieceTri(hexColor, p1, p2, p3, index, t) {
  push();
  applyPelobatesPieceTransform(posterRegistry.toad, index, t);
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
    }
  } else {
    p.jumpReadyTime = null;
  }

  let jumpActive =
    fullyAssembled &&
    p.jumpReadyTime !== null &&
    millis() - p.jumpReadyTime >= PELOBATES_JUMP_DELAY;

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
    let cycleDuration = 2150;
    let elapsed = millis() - p.jumpReadyTime - PELOBATES_JUMP_DELAY;
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
const HYENA_LOOSE_LAYOUT_VERSION = 6;
const HYENA_SCATTER_OFFSET_Y = 50;
const HYENA_SCATTER_EXPAND_Y = 28;
const HYENA_SCATTER_EXPAND_X = 10;

function hyenaGetScatterBounds() {
  let topScreen =
    platformText.introTitle.y +
    ms(52) +
    ms(HYENA_SCATTER_OFFSET_Y) -
    ms(HYENA_SCATTER_EXPAND_Y);
  let bottomScreen =
    POSTER_LAYOUT.choiceY -
    ms(22) +
    ms(HYENA_SCATTER_OFFSET_Y) +
    ms(HYENA_SCATTER_EXPAND_Y);
  let sidePad = max(4, 16 - HYENA_SCATTER_EXPAND_X);

  return {
    left: platformScreenToAnimalRef(mx(sidePad), platformH / 2).x,
    right: platformScreenToAnimalRef(platformW - mx(sidePad), platformH / 2).x,
    top: platformScreenToAnimalRef(platformW / 2, topScreen).y,
    bottom: platformScreenToAnimalRef(platformW / 2, bottomScreen).y
  };
}

function hyenaScatterUVForIndex(index, count) {
  let GOLDEN_ANGLE = PI * (3 - sqrt(5));
  let coreCount = min(31, count);
  let angle = index * GOLDEN_ANGLE + 0.35;
  let radius;

  if (index < coreCount) {
    let t = (index + 0.5) / coreCount;
    radius = 0.02 + pow(t, 0.5) * 0.16;
  } else {
    let t = (index - coreCount + 0.5) / max(1, count - coreCount);
    radius = 0.07 + pow(t, 0.44) * 0.38;
  }

  return {
    u: constrain(0.5 + cos(angle) * radius * 1.02, 0.06, 0.94),
    v: constrain(0.44 + sin(angle) * radius * 0.92, 0.10, 0.78)
  };
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

  translate(cx + currentX, cy + currentY);
  scale(pulseScale);
  rotate(currentRot);
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

  let movement = p.finalMotion;
  let gait = frameCount * 0.043;
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
