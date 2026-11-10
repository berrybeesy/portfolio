// Lenis 부드러운 스크롤 — 모든 섹션에 같은 관성/감속이 적용됨
// (스크롤 연동 애니메이션들은 실제 스크롤 위치를 읽기 때문에 그대로 같이 부드러워짐)
(() => {
  'use strict';
  if (!window.Lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new window.Lenis({
    duration: 1.2,                                            // 멈추기까지 걸리는 시간(초)
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // 끝에서 천천히 멈춤
    smoothWheel: true,
    wheelMultiplier: 0.9,
    gestureOrientation: 'vertical',                           // 가로 스와이프는 캐러셀이 받음
  });
  window.lenis = lenis;
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
