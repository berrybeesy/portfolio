// 로딩 화면: 0→100% (최소 약 1.4초, 페이지가 늦게 뜨면 최대 4초까지 기다림)
// 같은 탭에서 다시 들어오면(새로고침 제외) 건너뜀
(() => {
  'use strict';
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  if (!loader) return;
  let seen = false;
  try { seen = sessionStorage.getItem('tp-loaded') === '1'; } catch (e) { /* 저장 못 해도 동작 */ }
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const reload = nav && nav.type === 'reload';
  if (seen && !reload) { root.classList.add('no-loader'); return; }

  root.classList.add('is-loading');
  const count = loader.querySelector('.loader__count');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN = reduce ? 300 : 1400, MAX = 4000;
  const t0 = performance.now();
  let ready = document.readyState === 'complete';
  window.addEventListener('load', () => { ready = true; });
  let shown = 0;

  const ease = (x) => 1 - Math.pow(1 - x, 2.2);
  function tick(now) {
    const el = now - t0;
    // 시간에 따라 0→100 (최소 MIN). 페이지가 아직 준비 안 됐으면 90%에서 기다림
    const timeP = ease(Math.min(1, el / MIN)) * 100;
    const cap = ready || el > MAX ? 100 : 90;
    shown = Math.min(timeP, cap, shown + 2.5 > cap ? cap : 100);
    const v = Math.floor(shown);
    count.textContent = v;
    loader.style.setProperty('--p', shown.toFixed(1) + '%');
    if (v >= 100) return finish();
    requestAnimationFrame(tick);
  }
  function finish() {
    try { sessionStorage.setItem('tp-loaded', '1'); } catch (e) { /* */ }
    setTimeout(() => {
      root.classList.add('is-loaded');
      root.classList.remove('is-loading');
      window.dispatchEvent(new Event('loaderdone'));
      setTimeout(() => { root.classList.add('no-loader'); }, 1100);
    }, 200);
  }
  requestAnimationFrame(tick);
})();
