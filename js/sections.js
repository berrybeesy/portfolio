(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const TAU = Math.PI * 2;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /*  ABOUT — 스크롤하면 글자가 파란색으로 채워짐                          */
  /* ------------------------------------------------------------------ */
  const lead = $('.about__lead');
  const aboutSec = $('.about');
  let chars = [];
  // 글자 단위로 쪼갬. 일본어처럼 띄어쓰기가 없는 언어는 글자마다 줄바꿈 가능하게.
  function splitLead(text) {
    if (!lead) return;
    text = text.trim();
    const noSpaces = !/\s/.test(text.slice(0, 40));
    let words;
    if (noSpaces) {
      // 글자마다 나누되, 。、！？」 같은 문장부호는 앞 글자에 붙여서 줄 맨 앞에 오지 않게
      words = [];
      for (const ch of text) {
        if (words.length && /[。、，．！？」』）・ー]/.test(ch)) words[words.length - 1] += ch;
        else words.push(ch);
      }
    } else words = text.split(/\s+/);
    lead.textContent = '';
    lead.setAttribute('aria-label', text);
    chars = [];
    words.forEach((word, wi) => {
      const w = document.createElement('span');
      w.className = 'w';
      w.setAttribute('aria-hidden', 'true');
      for (const ch of word) {
        const c = document.createElement('span');
        c.className = 'ch';
        c.textContent = ch;
        w.appendChild(c);
        chars.push(c);
      }
      lead.appendChild(w);
      if (!noSpaces && wi < words.length - 1) lead.appendChild(document.createTextNode(' '));
    });
    filled = 0;
  }
  splitLead(lead ? lead.textContent : '');
  window.addEventListener('langchange', (e) => {
    const v = e.detail.dict[lead && lead.dataset.i18nLead];
    if (v && lead.getAttribute('aria-label') !== v) splitLead(v);
  });
  var filled = 0;
  function updateAbout(H) {
    if (!lead) return;
    const r = lead.getBoundingClientRect();
    // 문단 위가 화면 85% 지점에 올 때 시작 → 아래가 화면 45% 지점에 올 때 다 채워짐
    // 문단 위가 화면 85% 지점에 오면 시작 → About 섹션이 화면 가운데에 맞춰졌을 때 다 채워짐
    const sr = aboutSec.getBoundingClientRect();
    const toCenter = (sr.top + sr.height / 2) - H / 2;   // 0이 되면 섹션이 가운데
    const start = H * 0.85;
    const run = (start - r.top) + toCenter;
    const p = toCenter <= 0 ? 1 : clamp((start - r.top) / Math.max(1, run));
    const n = Math.round(p * chars.length);
    if (n === filled) return;
    if (n > filled) for (let i = filled; i < n; i++) chars[i].classList.add('on');
    else for (let i = n; i < filled; i++) chars[i].classList.remove('on');
    filled = n;
  }

  /* Schedule a Call: 들어오는 복제 글자 = 현재 언어 글자 */
  const ctaRoll = $('.cta-roll');
  const syncCta = () => { if (ctaRoll) ctaRoll.dataset.text = ctaRoll.textContent.trim(); };
  syncCta();
  window.addEventListener('langchange', () => setTimeout(syncCta, 0));

  /* KEYWORD 태그: 클릭하면 파란색 ↔ 다시 클릭하면 검정 (여러 개 선택 가능) */
  document.querySelectorAll('.pills li').forEach((li) => {
    li.setAttribute('role', 'button');
    li.tabIndex = 0;
    li.setAttribute('aria-pressed', li.classList.contains('is-accent') ? 'true' : 'false');
    const toggle = () => {
      const on = li.classList.toggle('is-accent');
      li.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    li.addEventListener('click', toggle);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ------------------------------------------------------------------ */
  /*  WORKS — 호버하면 사각형 썸네일이 커서를 따라다님                     */
  /* ------------------------------------------------------------------ */
  const WORKS = window.WORKS || [];
  const works = $('.works');
  const list = $('.works__list');
  const thumb = $('.works__thumb');
  const thumbInner = $('.works__thumb-inner');
  $('.works__count').textContent = `(${WORKS.length})`;

  WORKS.forEach((w) => {
    const li = document.createElement('li');
    li.className = 'work';
    li.innerHTML = `
      <a href="${w.link || '#'}">
        <span class="work__title">${w.title}<sup class="work__tag">(${w.tag})</sup></span>
        <span class="arrow-btn"><svg viewBox="0 0 24 24"><path d="M1 12h22M15 4l8 8-8 8"/></svg></span>
      </a>`;
    const a = li.querySelector('a');
    a.addEventListener('pointerenter', () => {
      thumbInner.style.backgroundImage = `url("${w.thumb}")`;
      thumb.classList.add('is-on');
    });
    a.addEventListener('focus', () => {
      thumbInner.style.backgroundImage = `url("${w.thumb}")`;
      const wr = works.getBoundingClientRect(), r = a.getBoundingClientRect();
      tx = r.left + r.width * 0.55 - wr.left; ty = r.top + r.height / 2 - wr.top;
      thumb.classList.add('is-on');
    });
    a.addEventListener('blur', () => thumb.classList.remove('is-on'));
    a.addEventListener('click', (e) => {
      // 상세 페이지가 있으면 제목 자리에서 검정 화면으로 전환되며 열림
      if (w.id && window.ProjectView) {
        e.preventDefault();
        thumb.classList.remove('is-on');
        window.ProjectView.open(w.id, a.querySelector('.work__title'));
      } else if (a.getAttribute('href') === '#') e.preventDefault();
    });
    list.appendChild(li);
  });
  list.addEventListener('pointerleave', () => thumb.classList.remove('is-on'));

  let tx = 0, ty = 0, x = 0, y = 0, vx = 0;
  works.addEventListener('pointermove', (e) => {
    const wr = works.getBoundingClientRect();
    tx = e.clientX - wr.left;
    ty = e.clientY - wr.top;
  });
  function updateThumb() {
    const px = x;
    x = lerp(x, tx, 0.14);
    y = lerp(y, ty, 0.14);
    vx = lerp(vx, x - px, 0.2);
    const w = thumb.offsetWidth, h = thumb.offsetHeight;
    const rot = clamp(vx * 0.25, -6, 6);
    thumb.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
  }

  /* ------------------------------------------------------------------ */
  /*  FOOTER — 위쪽 가장자리가 능선처럼 계속 흘러감                        */
  /* ------------------------------------------------------------------ */
  const edge = $('.footer__edge');
  const edgePath = edge.querySelector('path');
  // 큰 언덕 + 작은 굴곡 (A24 레퍼런스 느낌)
  const waves = [
    { k: 1.0, amp: 0.30, sp: 0.10, ph: 0.4 },
    { k: 1.7, amp: 0.20, sp: -0.14, ph: 2.1 },
    { k: 3.1, amp: 0.11, sp: 0.22, ph: 4.0 },
    { k: 5.3, amp: 0.08, sp: -0.30, ph: 1.3 },
    { k: 8.9, amp: 0.05, sp: 0.42, ph: 5.2 },
    { k: 14.0, amp: 0.028, sp: -0.55, ph: 0.7 },
    { k: 22.0, amp: 0.012, sp: 0.7, ph: 3.3 },
  ];
  // 마우스가 푸터 위에 있으면 그 부분 능선이 커서 쪽으로 살짝 끌려옴
  const footer = $('.footer');
  const fm = { x: 0, y: 0, sx: 0, sy: 0, on: 0, onT: 0 };
  footer.addEventListener('pointermove', (e) => {
    const r = edge.getBoundingClientRect();
    fm.x = e.clientX - r.left; fm.y = e.clientY - r.top;
    if (!fm.onT) { fm.sx = fm.x; fm.sy = fm.y; }
    fm.onT = 1;
  });
  footer.addEventListener('pointerleave', () => { fm.onT = 0; });

  function ridgePath(w, h, t) {
    const n = 120, pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      let v = 0;
      for (const wv of waves) v += wv.amp * Math.sin(u * wv.k * TAU * 0.5 + wv.ph + t * wv.sp);
      // v: 대략 -0.75..0.75 → 가장자리 높이
      let y = h * clamp(0.55 - v * 0.85 + (u - 0.5) * tiltNow, 0.03, 0.99);   // 높낮이 + 살짝 기울기
      if (fm.on > 0.001) {
        const dx = u * w - fm.sx, sig = Math.max(120, w * 0.09);
        const g = Math.exp(-(dx * dx) / (2 * sig * sig));
        // 커서가 능선 위(회색)에 있으면 커서 쪽으로 올라오고, 파란 영역 안이면 살짝 부풀어 오름
        const lift = Math.max(h * 0.18, (y - fm.sy) * 0.75);
        y -= g * fm.on * clamp(lift, 0, h * 0.5);
      }
      pts.push([u * w, clamp(y, 2, h)]);
    }
    const f = (q) => q.toFixed(1);
    let d = `M0 ${h} L${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d + ` L${w} ${h} Z`;
  }
  let tiltNow = 0;
  function updateFooter(H, t) {
    const r = edge.getBoundingClientRect();
    document.documentElement.classList.toggle('at-footer', footer.getBoundingClientRect().top < H * 0.6);
    if (r.bottom < 0 || r.top > H) return;          // 화면 밖이면 계산 안 함
    const w = r.width, h = r.height;
    fm.on = lerp(fm.on, fm.onT, 0.08);
    fm.sx = lerp(fm.sx, fm.x, 0.12);
    fm.sy = lerp(fm.sy, fm.y, 0.12);
    // 물결처럼 천천히 좌우로 기울었다가, 마우스가 있으면 마우스 쪽이 올라가게 기욺
    const tiltT = 0.28 * Math.sin(t * 0.35) - fm.on * (fm.sx / w - 0.5) * 0.6;
    tiltNow = lerp(tiltNow, tiltT, 0.06);
    edge.setAttribute('viewBox', `0 0 ${w.toFixed(0)} ${h.toFixed(0)}`);
    edgePath.setAttribute('d', ridgePath(w, h, t));
  }

  /* ------------------------------------------------------------------ */
  /*  FOOTER NAME — 누르면 글자가 하나하나 깨져서 물리 법칙대로 떨어지고,   */
  /*  마우스로 잡아 던지며 가지고 놀 수 있음 (Matter.js)                    */
  /* ------------------------------------------------------------------ */
  const fName = $('.footer__name');
  const fBody = $('.footer__body');
  const nameStr = fName.textContent.trim();
  fName.textContent = '';
  fName.setAttribute('aria-label', nameStr);
  const letterEls = [...nameStr].map((ch) => {
    const sp = document.createElement('span');
    sp.className = 'fl';
    sp.setAttribute('aria-hidden', 'true');
    sp.textContent = ch;
    fName.appendChild(sp);
    return sp;
  });
  let phys = null;
  function loadMatter() {
    if (window.Matter) return Promise.resolve();
    return new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = 'assets/vendor/matter.min.js';
      sc.onload = res; sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }
  async function breakName() {
    if (phys) return;
    phys = { starting: true };
    try { await loadMatter(); } catch (e) { phys = null; return; }
    const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = window.Matter;
    const fr = footer.getBoundingClientRect();
    const cs = getComputedStyle(fName);
    const fs = parseFloat(cs.fontSize);
    const layer = document.createElement('div');
    layer.className = 'footer__phys';
    layer.style.font = cs.font;
    layer.style.letterSpacing = cs.letterSpacing;
    layer.style.lineHeight = cs.lineHeight;
    footer.appendChild(layer);

    const engine = Engine.create();
    engine.gravity.y = 1.1;
    const items = [];
    letterEls.forEach((sp) => {
      if (!sp.textContent.trim()) return;
      const r = sp.getBoundingClientRect();
      const w = r.width, hh = r.height;
      const cx = r.left - fr.left + w / 2, cy = r.top - fr.top + hh / 2;
      const body = Bodies.rectangle(cx, cy, w * 0.9, fs * 0.72, {
        restitution: 0.35, friction: 0.25, frictionAir: 0.01,
        chamfer: { radius: Math.min(w, fs * 0.72) * 0.1 },
      });
      // 깨지는 순간 살짝 튀어오르며 흩어짐
      Body.setVelocity(body, { x: (Math.random() - 0.5) * 10, y: -(4 + Math.random() * 9) });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
      const el = document.createElement('span');
      el.className = 'fl';
      el.textContent = sp.textContent;
      el.style.width = w + 'px';
      el.style.height = hh + 'px';
      layer.appendChild(el);
      items.push({ body, el, w, hh });
      Composite.add(engine.world, body);
    });
    fName.style.visibility = 'hidden';

    // 벽: 파란 영역 안에서만 (위: 푸터 본문 시작선, 아래/좌/우: 푸터 경계)
    const T = 400;
    const walls = {
      ground: Bodies.rectangle(0, 0, 10, T, { isStatic: true }),
      ceil: Bodies.rectangle(0, 0, 10, T, { isStatic: true }),
      left: Bodies.rectangle(0, 0, T, 10, { isStatic: true }),
      right: Bodies.rectangle(0, 0, T, 10, { isStatic: true }),
    };
    function placeWalls() {
      const f = footer.getBoundingClientRect();
      const top = fBody.getBoundingClientRect().top - f.top - f.height * 0.05;
      const W2 = f.width, H2 = f.height;
      Body.setPosition(walls.ground, { x: W2 / 2, y: H2 + T / 2 });
      Body.setPosition(walls.ceil, { x: W2 / 2, y: top - T / 2 });
      Body.setPosition(walls.left, { x: -T / 2, y: H2 / 2 });
      Body.setPosition(walls.right, { x: W2 + T / 2, y: H2 / 2 });
      Body.setVertices(walls.ground, Matter.Vertices.fromPath(`0 0 ${W2 + 2 * T} 0 ${W2 + 2 * T} ${T} 0 ${T}`));
      Body.setPosition(walls.ground, { x: W2 / 2, y: H2 + T / 2 });
      Body.setVertices(walls.ceil, Matter.Vertices.fromPath(`0 0 ${W2 + 2 * T} 0 ${W2 + 2 * T} ${T} 0 ${T}`));
      Body.setPosition(walls.ceil, { x: W2 / 2, y: top - T / 2 });
      Body.setVertices(walls.left, Matter.Vertices.fromPath(`0 0 ${T} 0 ${T} ${H2 + 2 * T} 0 ${H2 + 2 * T}`));
      Body.setPosition(walls.left, { x: -T / 2, y: H2 / 2 });
      Body.setVertices(walls.right, Matter.Vertices.fromPath(`0 0 ${T} 0 ${T} ${H2 + 2 * T} 0 ${H2 + 2 * T}`));
      Body.setPosition(walls.right, { x: W2 + T / 2, y: H2 / 2 });
    }
    Composite.add(engine.world, Object.values(walls));
    placeWalls();
    window.addEventListener('resize', placeWalls);

    // 마우스로 잡고 던지기
    const mouse = Mouse.create(footer);
    ['wheel', 'mousewheel', 'DOMMouseScroll'].forEach((ev) => footer.removeEventListener(ev, mouse.mousewheel));
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.1, render: { visible: false } } });
    Composite.add(engine.world, mc);
    Events.on(mc, 'startdrag', () => layer.classList.add('is-dragging'));
    Events.on(mc, 'enddrag', () => layer.classList.remove('is-dragging'));

    phys = { engine, items };
  }
  fName.addEventListener('click', breakName);
  function updatePhys() {
    if (!phys || !phys.engine) return;
    const r = footer.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    window.Matter.Engine.update(phys.engine, 1000 / 60);
    for (const it of phys.items) {
      const { x, y } = it.body.position;
      it.el.style.transform = `translate3d(${(x - it.w / 2).toFixed(1)}px, ${(y - it.hh / 2).toFixed(1)}px, 0) rotate(${it.body.angle.toFixed(3)}rad)`;
    }
  }

  /* ------------------------------------------------------------------ */
  function frame(now) {
    requestAnimationFrame(frame);
    const H = window.innerHeight || 1;
    const t = reduceMotion ? now / 6000 : now / 1000;
    updateAbout(H);
    updateThumb();
    updateFooter(H, t);
    updatePhys();
  }
  requestAnimationFrame(frame);
})();
