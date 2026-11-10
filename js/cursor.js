// 액체(goo) 커서: 작은 점은 마우스를 바로 따라가고, 큰 방울들이 늦게 따라오며 서로 붙었다 떨어짐
(() => {
  'use strict';
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'cursor');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `
    <defs>
      <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
        <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo"/>
        <!-- 액체 모양은 그대로, 안쪽을 비우고 외곽선만 남김 -->
        <feMorphology in="goo" operator="erode" radius="1.1" result="inner"/>
        <feComposite in="goo" in2="inner" operator="out" result="ring"/>
        <feFlood flood-color="#111111" result="ink"/>
        <feComposite in="ink" in2="ring" operator="in"/>
      </filter>
    </defs>
    <g filter="url(#goo)"></g>`;
  document.body.appendChild(svg);
  const g = svg.querySelector('g');
  const flood = svg.querySelector('feFlood');
  let light = false;

  // [반지름, 따라오는 속도] — 앞은 작은 점(즉시), 뒤로 갈수록 크고 느림
  const SPEC = [[4.5, 1], [14, 0.2], [11, 0.14], [8, 0.1], [5.5, 0.075]];
  const blobs = SPEC.map(([r, k]) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', r);
    c.setAttribute('fill', '#fff');
    g.appendChild(c);
    return { c, r, k, x: -100, y: -100, s: 1 };
  });

  let mx = -100, my = -100, seen = false, hover = 0, hoverT = 0, press = 1, pressT = 1;
  const INTERACTIVE = 'a, button, [role="button"], .card-media, .pills li, .footer__name, .footer__phys .fl, .menu__item, [data-lang]';

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    if (!seen) { seen = true; blobs.forEach((b) => { b.x = mx; b.y = my; }); svg.classList.add('is-on'); }
    hoverT = e.target.closest && e.target.closest(INTERACTIVE) ? 1 : 0;
    // Works 목록 위에서는 사각형 썸네일이 커서 역할을 하므로 액체 커서는 숨김
    svg.classList.toggle('is-hidden', !!(e.target.closest && e.target.closest('.works__list')));
    // 어두운 곳(상세 페이지 검정 인트로, 파란 푸터) 위에서는 흰 선으로
    const dark = !!(e.target.closest && e.target.closest('.pv__intro, .pv__credits, .pv__next, .footer, .menu-btn.is-x'));
    if (dark !== light) { light = dark; flood.setAttribute('flood-color', dark ? '#ffffff' : '#111111'); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => svg.classList.remove('is-on'));
  document.addEventListener('pointerenter', () => { if (seen) svg.classList.add('is-on'); });
  window.addEventListener('pointerdown', () => { pressT = 0.75; });
  window.addEventListener('pointerup', () => { pressT = 1; });

  document.documentElement.classList.add('has-cursor');

  function frame() {
    requestAnimationFrame(frame);
    hover += (hoverT - hover) * 0.15;
    press += (pressT - press) * 0.3;
    blobs.forEach((b, i) => {
      b.x += (mx - b.x) * b.k;
      b.y += (my - b.y) * b.k;
      // 링크·버튼 위에서는 큰 방울이 부풀고, 누르면 살짝 눌림
      const grow = i === 1 ? 1 + hover * 0.9 : 1 + hover * 0.25;
      b.c.setAttribute('cx', b.x.toFixed(1));
      b.c.setAttribute('cy', b.y.toFixed(1));
      b.c.setAttribute('r', (b.r * grow * press).toFixed(2));
    });
  }
  requestAnimationFrame(frame);
})();
