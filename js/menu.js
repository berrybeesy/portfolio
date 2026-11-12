// 오른쪽 위 메뉴: 버튼 위치에서 원이 퍼지며 화면을 꽉 채우고 열림
(() => {
  'use strict';

  const btn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return;
  const items = [...menu.querySelectorAll('.menu__item')];
  const panels = [...menu.querySelectorAll('.menu__panel')];
  const projectPanel = menu.querySelector('.menu__panel--project');

  // PROJECT 패널: Works 목록과 같은 프로젝트
  (window.WORKS || []).forEach((w) => {
    const a = document.createElement('a');
    a.href = w.link && w.link !== '#' ? w.link : '#works';
    a.textContent = w.title;
    a.addEventListener('click', (e) => {
      if (w.id && window.ProjectView) {
        e.preventDefault();
        window.ProjectView.open(w.id, a);          // 메뉴 위로 그 글자 자리에서 열림
        setTimeout(() => setOpen(false, true), 900); // 다 덮인 뒤 메뉴는 조용히 닫기
      } else if (a.getAttribute('href') === '#works') { e.preventDefault(); goTo('#works'); }
    });
    projectPanel.appendChild(a);
  });

  let open = false;
  function setOrigin() {
    const r = btn.getBoundingClientRect();
    menu.style.setProperty('--cx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--cy', `${r.top + r.height / 2}px`);
  }
  function select(name) {
    items.forEach((it) => it.classList.toggle('is-active', it.dataset.panel === name));
    panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === name));
  }
  function setOpen(v, keepLock) {
    open = v;
    setOrigin();
    menu.classList.toggle('is-open', v);
    menu.setAttribute('aria-hidden', v ? 'false' : 'true');
    menu.inert = !v;
    btn.setAttribute('aria-expanded', String(v));
    btn.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
    if (!keepLock) {
      document.documentElement.classList.toggle('menu-open', v);
      if (window.lenis) { if (v) window.lenis.stop(); else window.lenis.start(); }
    }
    if (v) {
      select(null);
      setTimeout(() => items[0] && items[0].focus({ preventScroll: true }), 350);
    }
  }
  function goTo(hash) {
    setOpen(false);
    const el = document.querySelector(hash);
    if (!el) return;
    setTimeout(() => {
      if (window.lenis) window.lenis.scrollTo(el, { duration: 1.6 });
      else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 450);
  }

  menu.inert = true;
  btn.addEventListener('click', () => {
    // 프로젝트 상세가 열려 있으면 버튼은 닫기(X) 역할
    if (window.ProjectView && window.ProjectView.isOpen()) { window.ProjectView.close(); return; }
    setOpen(!open);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (window.ProjectView && window.ProjectView.isOpen()) { window.ProjectView.close(); btn.focus(); return; }
    if (open) { setOpen(false); btn.focus(); }
  });
  window.addEventListener('resize', () => { if (open) setOrigin(); });

  items.forEach((it) => {
    const name = it.dataset.panel;
    // 마우스를 올리면 선택(파란색) + 오른쪽 내용, 누르면: ABOUT은 About 섹션으로 이동
    it.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') select(name); });
    it.addEventListener('focus', () => select(name));
    it.addEventListener('click', () => {
      if (name === 'about') goTo('#about');
      else if (name === 'resume') window.open('assets/Teresa_Park_Resume.pdf', '_blank', 'noopener');
      else select(name);
    });
  });

  menu.querySelectorAll('[data-lang]').forEach((b) => {
    b.addEventListener('click', () => window.I18N && window.I18N.set(b.dataset.lang));
  });
})();
