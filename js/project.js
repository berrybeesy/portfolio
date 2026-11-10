// 프로젝트 상세: 새 탭 대신 같은 자리에서 #111 검정 화면이 누른 곳(제목·썸네일)에서 커지며 열림
(() => {
  'use strict';
  const pv = document.getElementById('pv');
  const D = window.PROJECT_DETAILS || {};
  if (!pv) return;
  const scroller = pv.querySelector('.pv__scroll');
  const btn = document.querySelector('.menu-btn');
  const order = (window.WORKS || []).map((w) => w.id).filter((id) => D[id]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = null, source = null, openState = false, shownTimer = 0;

  function fill(id) {
    const d = D[id];
    current = id;
    pv.querySelectorAll('[data-pv]').forEach((el) => { el.textContent = d[el.dataset.pv] || ''; });
    const about = pv.querySelector('[data-pv-about]');
    about.textContent = '';
    (d.about || []).forEach((t) => {
      const p = document.createElement('p');
      p.textContent = t;
      about.appendChild(p);
    });
    // 역할 타임라인
    const roles = pv.querySelector('[data-pv-roles]');
    roles.textContent = '';
    roles.hidden = !d.roles;
    (d.roles || []).forEach((r) => {
      const li = document.createElement('li');
      const h = document.createElement('div'); h.className = 'pv__role-head';
      const t = document.createElement('strong'); t.textContent = r.title; h.appendChild(t);
      if (r.badge) { const b = document.createElement('span'); b.className = 'pv__role-badge'; b.textContent = r.badge; h.appendChild(b); }
      li.appendChild(h);
      const per = document.createElement('p'); per.className = 'pv__role-period'; per.textContent = r.period; li.appendChild(per);
      if (r.points && r.points.length) {
        const ul = document.createElement('ul');
        r.points.forEach((x) => { const pi = document.createElement('li'); pi.textContent = x; ul.appendChild(pi); });
        li.appendChild(ul);
      }
      roles.appendChild(li);
    });
    pv.querySelector('.pv__hero').classList.toggle('is-portrait', !!d.portrait);
    // 시리즈(같은 캠페인 포스터 가로 배열)
    const series = pv.querySelector('[data-pv-series]');
    series.textContent = '';
    series.hidden = !d.series;
    if (d.series) {
      const head = document.createElement('div'); head.className = 'pv__series-head';
      const st = document.createElement('h3'); st.textContent = d.series.title; head.appendChild(st);
      if (d.series.link) {
        const a = document.createElement('a'); a.href = d.series.link; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = d.series.linkLabel + ' ↗'; head.appendChild(a);
      }
      series.appendChild(head);
      const row = document.createElement('div'); row.className = 'pv__series-row';
      d.series.items.forEach((it) => {
        const f = document.createElement('figure');
        const im = document.createElement('img'); im.src = it.src; im.alt = it.label; im.width = 1600; im.height = 2000; im.decoding = 'async';
        const fc = document.createElement('figcaption'); fc.textContent = it.label;
        f.appendChild(im); f.appendChild(fc); row.appendChild(f);
      });
      series.appendChild(row);
    }
    const sb = pv.querySelector('[data-pv-soonbig]');
    sb.hidden = !d.soonBig;
    sb.textContent = d.soonBig || '';
    const img = pv.querySelector('[data-pv-img]');
    img.src = d.image || '';
    img.alt = d.title || '';
    // 케이스 스터디 이미지: Figma에서 내보낸 이미지를 위에서부터 순서대로 꽉 차게 쌓음
    const gallery = pv.querySelector('[data-pv-gallery]');
    gallery.textContent = '';
    (d.gallery || []).forEach((g) => {
      const im = document.createElement('img');
      const src = typeof g === 'string' ? g : g.src;
      if (g.w && g.h) { im.width = g.w; im.height = g.h; }
      im.src = src; im.alt = ''; im.decoding = 'async';   // lazy 없이 바로 불러옴 (미리보기 창 안에서도 확실히 보이게)
      gallery.appendChild(im);
    });
    pv.querySelector('.pv__soon').hidden = !!(d.gallery && d.gallery.length) || !!d.soonBig;
    const cr = pv.querySelector('[data-pv-credits]');
    cr.textContent = '';
    cr.hidden = !d.credits;
    if (d.credits) {
      const t = document.createElement('p'); t.className = 'pv__credits-title'; t.textContent = d.credits.title; cr.appendChild(t);
      const l = document.createElement('p'); l.className = 'pv__credits-label'; l.textContent = d.credits.label; cr.appendChild(l);
      const ul = document.createElement('ul');
      d.credits.people.forEach((x) => { const li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
      cr.appendChild(ul);
    }
    const next = D[order[(order.indexOf(id) + 1) % order.length]];
    pv.querySelector('[data-pv="nextTitle"]').textContent = next ? next.title : '';
    pv.setAttribute('aria-label', d.title || 'Project');
  }

  // 시작 모양 = 누른 요소의 사각형 (없으면 메뉴 버튼 동그라미)
  function setClipFrom(el) {
    const target = el && el.isConnected ? el : btn;
    let r = target.getBoundingClientRect();
    const onScreen = r.bottom > 0 && r.top < innerHeight && r.width > 0;
    if (!onScreen) r = btn.getBoundingClientRect();
    const round = target === btn || !onScreen ? r.width / 2 : 6;
    pv.style.setProperty('--t', `${r.top}px`);
    pv.style.setProperty('--l', `${r.left}px`);
    pv.style.setProperty('--r', `${innerWidth - r.right}px`);
    pv.style.setProperty('--b', `${innerHeight - r.bottom}px`);
    pv.style.setProperty('--rad', `${round}px`);
  }

  function lock(v) {
    document.documentElement.classList.toggle('menu-open', v);
    if (window.lenis) { if (v) window.lenis.stop(); else window.lenis.start(); }
  }

  function open(id, fromEl) {
    if (!D[id]) return;
    fill(id);
    source = fromEl || null;
    clearTimeout(shownTimer);
    pv.classList.remove('is-shown');
    scroller.scrollTop = 0;
    // 시작 모양(누른 자리)은 애니메이션 없이 바로 적용
    pv.style.transition = 'none';
    setClipFrom(source);
    void pv.offsetWidth;
    pv.style.transition = '';
    pv.setAttribute('aria-hidden', 'false');
    pv.inert = false;
    openState = true;
    lock(true);
    btn.classList.add('is-x');
    btn.setAttribute('aria-label', 'Close project');
    // 시작 모양이 먼저 적용된 다음 프레임에 펼치기
    requestAnimationFrame(() => requestAnimationFrame(() => pv.classList.add('is-open')));
    shownTimer = setTimeout(() => pv.classList.add('is-shown'), reduce ? 0 : 520);
  }

  function close() {
    if (!openState) return;
    openState = false;
    clearTimeout(shownTimer);
    pv.classList.remove('is-shown');
    setClipFrom(source);           // 들어왔던 자리로 다시 접힘
    pv.classList.remove('is-open');
    pv.setAttribute('aria-hidden', 'true');
    pv.inert = true;
    btn.classList.remove('is-x');
    btn.setAttribute('aria-label', 'Open menu');
    setTimeout(() => lock(false), 300);
  }

  // 다음 프로젝트: 화면 안에서 내용만 바꿔서 다시 올라오게
  pv.querySelector('.pv__next').addEventListener('click', () => {
    const nextId = order[(order.indexOf(current) + 1) % order.length];
    pv.classList.remove('is-shown');
    setTimeout(() => {
      fill(nextId);
      scroller.scrollTo({ top: 0 });
      pv.classList.add('is-shown');
    }, 350);
  });

  pv.inert = true;
  window.ProjectView = { open, close, isOpen: () => openState };
})();
