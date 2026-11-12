(() => {
  'use strict';

  const PROJECTS = window.PROJECTS || [];
  const N = PROJECTS.length;
  const TAU = Math.PI * 2;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (s, r = document) => r.querySelector(s);
  const hero = $('.hero');
  const flow = $('.flow');
  const stage = $('.stage');
  const track = $('.carousel');
  const nameEl = $('.name');
  const nameText = $('.name__text');
  const nameProbe = $('.name__probe');
  const nameSub = $('.name-sub');
  const barSlot = $('.hero-bar__slot');
  const barProbe = $('.bar-probe');
  const barFade = [...document.querySelectorAll('.hero-bar__sep, .hero-bar__role, .hero-bar__right, .scroll-hint')];
  const menuBtn = $('.menu-btn');

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smooth = (t) => t * t * (3 - 2 * t);
  const mod = (n, m) => ((n % m) + m) % m;
  const damp = (k, dt) => 1 - Math.pow(1 - k, dt * 60); // 프레임레이트 독립 lerp 계수
  const f1 = (v) => v.toFixed(1);

  const INK = [0x11, 0x11, 0x11];
  const BLUE = [0x30, 0x6e, 0xff];
  const mixStroke = (t) => {
    const a = lerp(0.7, 1, t);
    return `rgba(${INK.map((c, i) => Math.round(lerp(c, BLUE[i], t))).join(',')},${a.toFixed(3)})`;
  };
  const mixColor = (t) =>
    `rgb(${INK.map((c, i) => Math.round(lerp(c, BLUE[i], t))).join(',')})`;

  /* ------------------------------------------------------------------ */
  /*  Shape — 타원 여러 개를 겹친 돌/구름 실루엣(고정) +                     */
  /*  A24 레퍼런스 같은 능선 외곽선(잔잔하게 계속 흐름).                      */
  /*  호버하면 푸터처럼 커서 쪽 가장자리가 커서를 따라 끌려나옴.               */
  /* ------------------------------------------------------------------ */
  // 단위 U. x,y = 카드 중심 기준 위치, rx/ry = 반지름, rot = 회전(rad)
  const SHAPES = [
    [ // 0. 위아래 두 덩어리 + 양옆 홈 (Join Our Executive Board)
      { x: 0.00, y: -0.20, rx: 0.60, ry: 0.33, rot: 0 },
      { x: 0.01, y: 0.24, rx: 0.58, ry: 0.29, rot: 0.14 },
    ],
    [ // 1. 구름 (원 세 개)
      { x: -0.22, y: -0.04, rx: 0.42, ry: 0.45, rot: 0 },
      { x: 0.24, y: 0.07, rx: 0.48, ry: 0.48, rot: 0 },
      { x: 0.02, y: 0.30, rx: 0.32, ry: 0.22, rot: 0 },
    ],
    [ // 2. 넓게 위아래로 겹친 두 타원
      { x: 0.00, y: -0.13, rx: 0.82, ry: 0.36, rot: 0 },
      { x: 0.00, y: 0.15, rx: 0.80, ry: 0.36, rot: 0 },
    ],
  ];

  // 중심에서 방향 (dx,dy)로 쏜 광선이 회전 타원 밖으로 나가는 거리
  function rayExit(dx, dy, e) {
    const c = Math.cos(-e.rot), s = Math.sin(-e.rot);
    const px0 = -e.cx, py0 = -e.cy;
    const px = (px0 * c - py0 * s) / e.rx, py = (px0 * s + py0 * c) / e.ry;
    const qx = (dx * c - dy * s) / e.rx, qy = (dx * s + dy * c) / e.ry;
    const A = qx * qx + qy * qy, B = 2 * (px * qx + py * qy), C = px * px + py * py - 1;
    const disc = B * B - 4 * A * C;
    if (disc < 0) return 0;
    return Math.max(0, (-B + Math.sqrt(disc)) / (2 * A));
  }

  // 시드 고정 난수
  function rng(seed) {
    let x = Math.floor(seed * 1e6) || 1;
    return () => ((x = (x * 16807) % 2147483647) / 2147483647);
  }
  // 능선 굴곡 (작은 진폭, 높은 주파수 위주) — 실루엣은 유지하고 가장자리만 울퉁불퉁하게
  function makeWaves(seed) {
    const r = rng(seed);
    const waves = [];
    for (let k = 4; k <= 19; k++) {
      waves.push({
        k,
        amp: (0.4 + r() * 0.6) * 0.05 / Math.pow(k, 0.85),
        ph: r() * TAU,
        sp: (r() < 0.5 ? -1 : 1) * (0.45 + r() * 0.7),
      });
    }
    return waves;
  }
  function edge(waves, a, t) {
    let v = 0;
    for (const w of waves) v += w.amp * Math.sin(w.k * a + w.ph + t * w.sp);
    return 1 + v;
  }

  // 닫힌 Catmull-Rom → cubic bezier
  function closedCurve(pts) {
    const n = pts.length;
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[mod(i - 1, n)], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ` +
        `${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return d + 'Z';
  }

  const NPTS = 120;
  // 카드의 외곽 반지름 테이블(px): 타원 합집합 실루엣 × 능선 굴곡 + 호버 시 커서 쪽으로 끌림
  function shapeTable(c, t, h, out) {
    const lobes = c.shape;
    // 호버 안 해도 덩어리들이 제자리에서 천천히 숨쉬듯 움직임
    lobes.forEach((l, j) => {
      const ph = c.seed * 3 + j * 2.1;
      const br = 1 + 0.045 * Math.sin(t * 0.9 + ph);
      l._e = l._e || {};
      l._e.cx = (l.x + 0.025 * Math.sin(t * 0.7 + ph * 1.3)) * U * c.sx;   // c.sx: 가로로 늘림
      l._e.cy = (l.y + 0.025 * Math.cos(t * 0.6 + ph)) * U;
      l._e.rx = l.rx * U * br * c.sx;
      l._e.ry = l.ry * U * (2 - br * 0.5 - 0.5);
      l._e.rot = l.rot;
    });
    for (let k = 0; k < NPTS; k++) {
      const a = (k / NPTS) * TAU, dx = Math.cos(a), dy = Math.sin(a);
      let base = 0;
      for (const l of lobes) {
        base = Math.max(base, rayExit(dx, dy, l._e));
      }
      c.tmp[k] = base;
    }
    for (let k = 0; k < NPTS; k++) {
      // 홈이 너무 날카롭지 않게 살짝만 부드럽게
      const base = (c.tmp[mod(k - 1, NPTS)] + c.tmp[k] * 2 + c.tmp[(k + 1) % NPTS]) / 4;
      const a = (k / NPTS) * TAU;
      let r = base * edge(c.waves, a, t);
      if (h > 0.002) {
        // 푸터처럼: 커서 방향 가장자리가 커서 쪽으로 끌려옴
        let da = Math.abs(mod(a - c.mAng, TAU));
        da = Math.min(da, TAU - da);
        const g = Math.exp(-(da * da) / (2 * 0.3 * 0.3));
        const lift = clamp((c.mDist - r) * 0.6, U * 0.035, U * 0.3);
        r += h * g * lift;
      }
      out[k] = r;
    }
  }
  function tablePath(tab, cx, cy) {
    const pts = [];
    for (let k = 0; k < NPTS; k++) {
      const a = (k / NPTS) * TAU;
      pts.push([cx + Math.cos(a) * tab[k], cy + Math.sin(a) * tab[k]]);
    }
    return closedCurve(pts);
  }

  // 호버 시 파란 선 — 모양을 따라 한 바퀴 남짓, 제자리에서 살짝 왔다갔다
  function linePath(tab, cx, cy, rx, ry, t, seed, turns, draw, offset, grow) {
    const total = turns * TAU * draw;
    if (total < 0.02) return '';
    const a0 = seed * 2.3 + Math.sin(t * 0.8 + seed) * 0.25;
    const steps = Math.ceil(total / 0.045);
    let d = '';
    for (let k = 0; k <= steps; k++) {
      const u = (k / steps) * total;
      const a = a0 + u;
      const fk = mod(a / TAU, 1) * NPTS, k0 = Math.floor(fk);
      const base = lerp(tab[k0 % NPTS], tab[(k0 + 1) % NPTS], fk - k0);
      const n = (0.03 * Math.sin(3 * a + t * 1.2 + seed) + 0.018 * Math.sin(6 * a - t * 1.5 + seed * 1.7)) * U * 0.5;
      const r = base * (offset + grow * (u / (turns * TAU))) + n;
      d += `${k ? 'L' : 'M'}${f1(cx + Math.cos(a) * rx * r)} ${f1(cy + Math.sin(a) * ry * r)}`;
    }
    return d;
  }

  /* ------------------------------------------------------------------ */
  /*  Build cards                                                        */
  /* ------------------------------------------------------------------ */

  const hoverables = [];
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    for (const c of hoverables) {
      if (!c.hoverT) continue;
      const r = c.el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        c.hoverT = 0; c.el.classList.remove('is-hover');
      } else {
        c.mx = (e.clientX - r.left) * (cardW / r.width);
        c.my = (e.clientY - r.top) * (cardH / r.height);
      }
    }
  });
  const cards = PROJECTS.map((p, i) => {
    const el = document.createElement('a');
    el.className = 'card';
    el.href = p.link || '#';
    el.setAttribute('role', 'listitem');
    el.setAttribute('aria-label', `${p.title} (${p.year})`);
    el.draggable = false;
    el.innerHTML = `
      <div class="card-crop"><div class="card-media"><img src="${p.thumb}" alt="" draggable="false" decoding="async"></div></div>
      <svg class="card-lines" aria-hidden="true"><path class="l1"/><path class="l2"/></svg>`;
    track.appendChild(el);

    const c = {
      i, el,
      crop: el.querySelector('.card-crop'),
      media: el.querySelector('.card-media'),
      img: el.querySelector('.card-media img'),
      sx: 1,
      l1: el.querySelector('.l1'),
      l2: el.querySelector('.l2'),
      seed: i * 1.913 + 0.7,
      shape: SHAPES[(p.shape ?? i) % SHAPES.length],
      waves: makeWaves(i * 0.618 + 0.37),
      tmp: new Float32Array(NPTS),
      mAng: 0, mDist: 0,
      hover: 0, hoverT: 0,
      // 마우스 위치 (카드 로컬 px)
      mx: 0, my: 0, smx: 0, smy: 0,
      tab: new Float32Array(NPTS),
    };
    hoverables.push(c);

    const setMouse = (e) => {
      const r = el.getBoundingClientRect();
      c.mx = (e.clientX - r.left) * (cardW / r.width);
      c.my = (e.clientY - r.top) * (cardH / r.height);
    };
    c.media.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      setMouse(e);
      if (!c.hoverT) { c.smx = c.mx; c.smy = c.my; }
      c.hoverT = 1;
      el.classList.add('is-hover');
    });
    c.media.addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') setMouse(e); });
    // 떠날 때는 카드 박스를 벗어나야 해제 (모양 밖으로 나가도 가장자리가 커서를 따라옴)
    el.addEventListener('focus', () => {
      c.mx = c.smx = cardW / 2; c.my = c.smy = cardH / 2;
      c.hoverT = 1; el.classList.add('is-hover'); goTo(i);
    });
    el.addEventListener('blur', () => { c.hoverT = 0; el.classList.remove('is-hover'); });
    el.addEventListener('dragstart', (e) => e.preventDefault());
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (drag.moved) return;
      if (Math.abs(relOf(i, targetOffset())) > 0.5) goTo(i);
      else openProject(i);
    });
    return c;
  });

  function openProject(i) {
    // 상세 페이지가 있으면 썸네일 자리에서 검정 화면으로 전환되며 열림
    const p = PROJECTS[i];
    if (p.id && window.ProjectView) { window.ProjectView.open(p.id, cards[i].media); return; }
    if (p.link && p.link !== '#') window.location.href = p.link;
  }

  /* ------------------------------------------------------------------ */
  /*  Info panel text swap                                               */
  /* ------------------------------------------------------------------ */

  // 프로젝트 정보: 애니메이션 없이 바로 바뀜
  const fields = [...document.querySelectorAll('.heading [data-field]')];
  function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
  }
  // 프로젝트가 바뀌면 제목 영역이 부드럽게 사라졌다가(ease-in) 살짝 튕기듯(쫀득) 다시 나타남
  const heading = $('.heading');
  const hLines = [...heading.querySelectorAll('.hl')];
  const hVals = [...heading.querySelectorAll('.hv, .hk')];   // 제목·값·라벨(Year/Role/Category) 모두 같이 빠졌다 올라옴
  let headTimer = 0, headInit = false;
  // 전환(캐러셀처럼 오른쪽→왼쪽): 선·글자가 오른쪽부터 왼쪽으로 지워짐 → 새 내용이 오른쪽에서 들어오며 다시 그려짐
  function updateInfo(i) {
    const p = PROJECTS[i];
    if (!p) return;
    const apply = () => fields.forEach((el) => setText(el, p[el.dataset.field] || ''));
    clearTimeout(headTimer);
    heading.getAnimations({ subtree: true }).forEach((an) => an.cancel());
    if (!headInit || reduceMotion || !heading.animate) { headInit = true; apply(); return; }
    const easeIn = 'cubic-bezier(.55, 0, .85, .35)';
    hLines.forEach((l, k) => l.animate(
      [{ transform: 'scaleX(1)', transformOrigin: 'left center' }, { transform: 'scaleX(0)', transformOrigin: 'left center' }],
      { duration: 260, delay: k * 35, easing: easeIn, fill: 'forwards' }));
    hVals.forEach((v, k) => v.animate(
      [{ transform: 'translateX(0)', clipPath: 'inset(-10% 0 -10% 0)', opacity: 1 },
       { transform: 'translateX(-18px)', clipPath: 'inset(-10% 100% -10% 0)', opacity: 0.4 }],
      { duration: 260, delay: k * 30, easing: easeIn, fill: 'forwards' }));
    headTimer = setTimeout(() => {
      apply();
      hLines.forEach((l, k) => l.animate(
        [{ transform: 'scaleX(0)', transformOrigin: 'right center' }, { transform: 'scaleX(1)', transformOrigin: 'right center' }],
        { duration: 620, delay: k * 60, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'both' }));
      hVals.forEach((v, k) => v.animate(
        [{ transform: 'translateX(28px)', clipPath: 'inset(-10% 0 -10% 100%)', opacity: 0.4 },
         { transform: 'translateX(0)', clipPath: 'inset(-10% 0 -10% 0)', opacity: 1 }],
        { duration: 650, delay: k * 50, easing: 'cubic-bezier(.34, 1.3, .5, 1)', fill: 'both' }));
    }, 380);
    cards.forEach((c) => c.el.setAttribute('aria-current', c.i === i ? 'true' : 'false'));
  }

  /* ------------------------------------------------------------------ */
  /*  Layout                                                             */
  /* ------------------------------------------------------------------ */

  let W = 0, H = 0, U = 0, cardW = 0, cardH = 0, spacing = 0, centerY = 0, SEG = 0;
  let nameFs = 0, nameW = 0, nameBase = 0, nameCap = 0, baseRatio = 0.8, gPx = 32;
  let subWritten = false;
  let subFs = 0, margin = 100, s0 = 0.1, startX = 0, startBase = 0;
  const measureCtx = document.createElement('canvas').getContext('2d');

  function layout() {
    W = stage.clientWidth || window.innerWidth || 1;
    H = stage.clientHeight || window.innerHeight || 1;
    const mobile = W < 720;

    // 모양 기준 크기 U, 카드 박스는 호버로 커질 여유를 두고 크게
    U = mobile ? Math.min(W * 0.6, H * 0.33) : Math.min(W * 0.42, H * 0.57);
    // 모양을 가로로 넓게: 모든 모양의 절반 폭을 HALF 로 맞춤 (화면 폭의 약 72%)
    const HALF = mobile ? W * 0.47 : Math.min(W * 0.36, H * 1.2);
    cardW = HALF * 2.3;
    cardH = U * 1.7;
    spacing = W * 0.5 + HALF * 1.2;   // 가운데 하나만 보이고 양옆은 화면 밖 (넘길 때 밖에서 들어옴)
    centerY = mobile ? H * 0.5 : H * 0.53;
    const imgH = U * 0.86;            // 사진은 모양 높이에 맞춰 비율 그대로, 남는 곳은 검정
    cards.forEach((c) => {
      const baseHalf = Math.max(...c.shape.map((l) => Math.abs(l.x) + l.rx));
      c.sx = Math.max(1, HALF / (baseHalf * U));
      c.el.style.width = cardW + 'px';
      c.el.style.height = cardH + 'px';
      c.img.style.top = ((cardH - imgH) / 2) + 'px';
      c.img.style.height = imgH + 'px';
    });

    SEG = 1; // (세로 스크롤은 페이지 스크롤 — 캐러셀은 가로 스와이프/드래그/키)

    // 이름: 최종 크기(좌우 여백 margin)로 렌더하고, 시작할 땐 하단 바 크기로 축소해서 둠
    gPx = Math.min(44, Math.max(16, W * 0.022));
    margin = W >= 1024 ? 100 : W >= 720 ? 48 : gPx;
    nameEl.style.fontSize = '100px';
    const w100 = nameText.offsetWidth;          // transform 영향 없는 레이아웃 폭
    nameFs = ((W - margin * 2) / w100) * 100;
    nameEl.style.fontSize = nameFs + 'px';
    nameW = nameText.offsetWidth;
    nameBase = nameProbe.offsetTop;           // 요소 top → baseline
    baseRatio = nameBase / nameFs;
    measureCtx.font = `500 ${nameFs}px Pretendard`;
    nameCap = measureCtx.measureText('TERESA PARK').actualBoundingBoxAscent || nameFs * 0.75;
    nameEl.style.transformOrigin = '0 0';

    // 시작 위치 = 하단 바의 "Teresa Park" 자리 (flow 기준 좌표)
    const fr = flow.getBoundingClientRect();
    const sr = barSlot.getBoundingClientRect();
    s0 = parseFloat(getComputedStyle(barSlot).fontSize) / nameFs;
    startX = sr.left - fr.left;
    startBase = barProbe.getBoundingClientRect().top - fr.top;

    subFs = parseFloat(getComputedStyle(nameSub).fontSize);
  }

  /* ------------------------------------------------------------------ */
  /*  Input: scroll, wheel(가로), drag, keys                              */
  /* ------------------------------------------------------------------ */

  let scrollOff = 0;      // 세로 스크롤로 인한 캐러셀 오프셋
  let manual = 0;         // 가로 스와이프/드래그로 인한 오프셋
  let offset = 0;         // 실제 렌더 오프셋(스무딩)
  let snapTimer = 0;
  let lastInteract = 0;   // 사용자가 직접 캐러셀을 움직인 시각

  const targetOffset = () => scrollOff + manual;
  const relOf = (i, off) => {
    let r = mod(i - off, N);
    if (r > N / 2) r -= N;
    return r;
  };
  function snap() { manual = Math.round(scrollOff + manual) - scrollOff; }
  function goTo(i) {
    manual += Math.round(relOf(i, targetOffset()));
    snap();
  }
  function heroActive() {
    return hero.getBoundingClientRect().bottom > H * 0.5;
  }

  window.addEventListener('wheel', (e) => {
    // 트랙패드 좌우 스와이프 → 캐러셀
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0.5) {
      if (hero.getBoundingClientRect().bottom < H * 0.3) return;
      e.preventDefault();
      manual += e.deltaX / (W * 0.45);
      lastInteract = performance.now();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 140);
    }
  }, { passive: false });

  const drag = { on: false, x: 0, y: 0, last: 0, moved: false, id: null, start: 0, t0: 0 };
  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag.on = true; drag.moved = false; drag.id = e.pointerId;
    drag.x = drag.last = e.clientX; drag.y = e.clientY;
    drag.start = manual; drag.t0 = performance.now();
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag.on || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        drag.moved = true;
        lastInteract = performance.now();
        document.body.style.cursor = 'grabbing';
      } else if (Math.abs(dy) > 8) { drag.on = false; return; }
    }
    if (drag.moved) {
      manual -= (e.clientX - drag.last) / spacing;
      drag.last = e.clientX;
    }
  });
  const endDrag = () => {
    if (!drag.on) return;
    drag.on = false;
    document.body.style.cursor = '';
    if (drag.moved) {
      // 짧게 밀어도(약 40px 이상 또는 빠르게 튕기면) 한 칸 넘어감 — 휴대폰 스와이프용
      const dxPx = (drag.start - manual) * spacing;
      const fast = Math.abs(dxPx) / Math.max(1, performance.now() - drag.t0) > 0.35;
      if (Math.abs(dxPx) > 40 || (fast && Math.abs(dxPx) > 12)) {
        const base = Math.round(scrollOff + drag.start) - scrollOff;
        manual = base + (dxPx > 0 ? -1 : 1);
      } else snap();
      lastInteract = performance.now();
      setTimeout(() => { drag.moved = false; }, 0);
    }
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  window.addEventListener('keydown', (e) => {
    if (!heroActive()) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') lastInteract = performance.now();
    if (e.key === 'ArrowRight') { manual += 1; snap(); }
    if (e.key === 'ArrowLeft') { manual -= 1; snap(); }
  });

  // 메뉴 열기/닫기는 js/menu.js

  /* ------------------------------------------------------------------ */
  /*  Render loop                                                        */
  /* ------------------------------------------------------------------ */

  let active = -1;
  let last = performance.now();

  function renderCard(c, t, dt) {
    const rel = relOf(c.i, offset);
    const ar = Math.abs(rel);

    c.hover = lerp(c.hover, c.hoverT, damp(c.hoverT ? 0.08 : 0.06, dt));
    if (c.hover < 0.0005) c.hover = 0;
    const h = c.hover;
    c.smx = lerp(c.smx, c.mx, damp(0.12, dt));
    c.smy = lerp(c.smy, c.my, damp(0.12, dt));

    const x = W / 2 + rel * spacing - cardW / 2;
    const y = centerY - cardH / 2 + ar * H * 0.015;
    const s = lerp(1, 0.9, Math.min(ar, 1)) * (1 + h * 0.006);

    const visible = ar < N / 2 - 0.01 && x + cardW > -cardW * 0.2 && x < W + cardW * 0.2;
    c.el.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible) return;
    c.el.style.transform = `translate3d(${f1(x)}px, ${f1(y)}px, 0) scale(${s.toFixed(4)})`;
    c.el.style.zIndex = String(100 - Math.round(ar * 10));

    // --- 모양: 고정 실루엣 + 잔잔히 흐르는 능선 외곽선, 호버 시 커서 쪽으로 끌림
    const cx = cardW / 2, cy = cardH / 2;
    if (h > 0.002) {
      const dx = c.smx - cx, dy = c.smy - cy;
      c.mAng = Math.atan2(dy, dx);
      c.mDist = Math.hypot(dx, dy);
    }
    shapeTable(c, t + c.seed * 10, h, c.tab);
    c.media.style.clipPath = `path('${tablePath(c.tab, cx, cy)}')`;

    // --- 호버: 파란 선 2줄이 그려지고 제자리에서 살짝 왔다갔다
    if (h > 0.002) {
      const d1 = easeInOut(clamp(h / 0.85));
      const d2 = easeInOut(clamp((h - 0.15) / 0.85));
      c.l1.setAttribute('d', linePath(c.tab, cx, cy, 1, 1, t, c.seed, 1.08, d1, 1.07, 0.03));
      c.l2.setAttribute('d', linePath(c.tab, cx, cy, 1, 1, t * 1.13 + 3, c.seed + 2.4, 1.05, d2, 1.13, -0.03));
      c.linesOn = true;
    } else if (c.linesOn) {
      c.l1.setAttribute('d', '');
      c.l2.setAttribute('d', '');
      c.linesOn = false;
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);   // 한 프레임에서 에러가 나도 루프는 계속
    if (!SEG || W < 2 || H < 2) { layout(); if (!SEG || W < 2 || H < 2) return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = reduceMotion ? now / 5000 : now / 1000;

    // --- 스크롤 진행도: 인트로(0) → 이름 섹션 가운데(1)
    const scrolled = -flow.getBoundingClientRect().top;
    const nameP = smooth(clamp(scrolled / H));

    if (!Number.isFinite(manual)) manual = 0;
    offset = lerp(offset, targetOffset(), damp(0.085, dt));
    if (!Number.isFinite(offset)) offset = targetOffset();

    const idx = mod(Math.round(targetOffset()), N);   // 넘어가기 시작하는 순간 제목도 바뀜
    if (idx !== active) { active = idx; updateInfo(idx); }

    for (const c of cards) renderCard(c, t, dt);

    // --- name: 하단 왼쪽 "Teresa Park"(획만) → 스크롤하면 그 자리에서 커지며 가운데로,
    //     왼쪽→오른쪽으로 파랗게 채워짐
    const blockH = nameCap + subFs * 1.9;
    const baseEnd = H + (H - blockH) / 2 + nameCap;       // 이름 섹션(두 번째 화면) 가운데
    const sc = lerp(s0, 1, nameP);
    const x = lerp(startX, (W - nameW) / 2, nameP);
    const base = lerp(startBase, baseEnd, nameP);
    nameEl.style.transform = `translate3d(${f1(x)}px, ${f1(base - nameBase * sc)}px, 0) scale(${sc.toFixed(4)})`;
    nameEl.style.webkitTextStrokeWidth = (0.75 / sc).toFixed(2) + 'px';   // 화면상 선 굵기 일정
    nameEl.style.webkitTextStrokeColor = `rgba(17,17,17,${lerp(0.7, 1, nameP).toFixed(3)})`;
    const fp = clamp((nameP - 0.12) / 0.78);
    nameEl.style.backgroundPosition = `${((1 - fp) * 100).toFixed(2)}% 0`;

    const fade = (1 - clamp(nameP * 3)).toFixed(3);
    for (const el of barFade) el.style.opacity = fade;

    nameSub.style.transform = `translate3d(-50%, ${f1(baseEnd + subFs * 1.9 - subFs * baseRatio - subFs * 0.1)}px, 0)`;
    // 이름이 제자리에 도착하면 부제 위로 검정이 손글씨처럼 왼쪽→오른쪽으로 한 번 지나감
    if (nameP > 0.97 && !subWritten) {
      subWritten = true;
      if (!reduceMotion && nameSub.animate) {
        nameSub.animate(
          [
            { backgroundPosition: '100% 0', easing: 'cubic-bezier(.45, 0, .25, 1)' },
            { backgroundPosition: '50% 0', offset: 0.5 },
            { backgroundPosition: '50% 0', offset: 0.62, easing: 'cubic-bezier(.55, 0, .6, 1)' },
            { backgroundPosition: '0% 0' },
          ],
          { duration: 2200, delay: 150 }
        );
      }
    } else if (nameP < 0.5) subWritten = false;
    nameSub.style.opacity = clamp((nameP - 0.7) / 0.3).toFixed(3);
  }

  /* ------------------------------------------------------------------ */
  /*  Init                                                               */
  /* ------------------------------------------------------------------ */

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(layout);
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => layout()).observe(stage);

  layout();
  updateInfo(0);
  active = 0;
  requestAnimationFrame(frame);
  if (document.fonts) {
    document.fonts.ready.then(layout);
    document.fonts.load('800 100px Pretendard').then(layout).catch(() => {});
    document.fonts.load('400 40px Pretendard').then(layout).catch(() => {});
    document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', layout);
  }

  /* 자동 캐러셀: 3초마다 다음 프로젝트.
     호버·드래그 중이거나 방금 직접 넘겼으면 쉼 */
  function autoNext() {
    if (reduceMotion || document.hidden || drag.on) return;
    if (cards.some((c) => c.hoverT)) return;
    if (performance.now() - lastInteract < 4000) return;
    if (hero.getBoundingClientRect().bottom < H * 0.4) return;
    manual += 1; snap();
  }
  // 캐러셀은 3초마다 (화살표 애니메이션 2.5s와는 별개)
  setInterval(autoNext, 3000);
})();
