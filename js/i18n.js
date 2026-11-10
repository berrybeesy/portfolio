// 언어 전환 (English / 한국어 / 日本語)
// 레이아웃·인터랙션은 그대로, 글자만 바뀜. 이름(Teresa Park)과 프로젝트 제목은 바뀌지 않음.
(() => {
  'use strict';

  const DICT = {
    en: {
      year: 'Year', role: 'Role', category: 'Category',
      barRole: 'Product Designer', barRight: 'I Design & Code',
      sub1: 'Product Designer', sub2: 'Design Engineer',
      secAbout: 'ABOUT', secWorks: 'WORKS', secContact: 'CONTACT',
      lead: "Hi! I'm Teresa, a curious designer who brings ideas to life through design and code. I focus on defining the right problems, understanding user needs, and finding solutions driven by data through data insights.",
      keyword: 'KEYWORD', roleK: 'ROLE', roleV: 'PRODUCT DESIGNER, DESIGN ENGINEER',
      pill0: 'product design', pill1: 'user research', pill2: 'usability testing', pill3: 'interaction design',
      pill4: 'prototyping', pill5: 'design systems', pill6: 'AI-assisted workflow', pill7: 'cross-functional collaboration',
      basedMeta: 'Based in Salt Lake City, UT, USA', avail: 'Available, {MON} {Y}',
      contactLead: "Let's Build Something<br>Meaningful Together", schedule: 'Schedule a Call', scheduleShort: 'Schedule',
      fBased: 'Based in', fCity: 'Salt Lake City, UT', fConnect: 'Connect', email: 'Email', resume: 'Resume',
      mAbout: 'ABOUT', mProject: 'PROJECT', mContact: 'CONTACT', mLanguage: 'LANGUAGE',
      pvYear: 'Year', pvDevice: 'Device', pvTimeline: 'Timeline', pvCollab: 'Collaboration', pvSoon: 'Full case study coming soon.', pvNext: 'Next Project',
    },
    ko: {
      year: '연도', role: '역할', category: '분야',
      barRole: '프로덕트 디자이너', barRight: '디자인 & 코드',
      sub1: '프로덕트 디자이너', sub2: '디자인 엔지니어',
      secAbout: '소개', secWorks: '작업', secContact: '연락처',
      lead: '안녕하세요! 디자인과 코드로 아이디어를 현실로 만드는 호기심 많은 디자이너 테레사입니다. 올바른 문제를 정의하고, 사용자의 니즈를 이해하며, 데이터 인사이트를 바탕으로 해결책을 찾는 데 집중합니다.',
      keyword: '키워드', roleK: '역할', roleV: '프로덕트 디자이너, 디자인 엔지니어',
      pill0: '프로덕트 디자인', pill1: '사용자 리서치', pill2: '사용성 테스트', pill3: '인터랙션 디자인',
      pill4: '프로토타이핑', pill5: '디자인 시스템', pill6: 'AI 활용 워크플로우', pill7: '크로스펑셔널 협업',
      basedMeta: '미국 유타주 솔트레이크시티 거주', avail: '{Y}년 {M}월부터 가능',
      contactLead: '함께 의미 있는 것을<br>만들어요', schedule: '미팅 예약하기', scheduleShort: '미팅 예약',
      fBased: '거주지', fCity: '유타주 솔트레이크시티', fConnect: '연결', email: '이메일', resume: '이력서',
      mAbout: '소개', mProject: '프로젝트', mContact: '연락처', mLanguage: '언어',
      pvYear: '연도', pvDevice: '기기', pvTimeline: '기간', pvCollab: '협업', pvSoon: '전체 케이스 스터디는 곧 공개됩니다.', pvNext: '다음 프로젝트',
    },
    ja: {
      year: '年', role: '役割', category: '分野',
      barRole: 'プロダクトデザイナー', barRight: 'デザイン & コード',
      sub1: 'プロダクトデザイナー', sub2: 'デザインエンジニア',
      secAbout: 'プロフィール', secWorks: '作品', secContact: 'お問い合わせ',
      lead: 'こんにちは！テレサです。デザインとコードでアイデアを形にする、好奇心旺盛なデザイナーです。正しい課題を定義し、ユーザーのニーズを理解し、データインサイトに基づいた解決策を見つけることを大切にしています。',
      keyword: 'キーワード', roleK: '役割', roleV: 'プロダクトデザイナー、デザインエンジニア',
      pill0: 'プロダクトデザイン', pill1: 'ユーザーリサーチ', pill2: 'ユーザビリティテスト', pill3: 'インタラクションデザイン',
      pill4: 'プロトタイピング', pill5: 'デザインシステム', pill6: 'AI活用ワークフロー', pill7: '部門横断コラボレーション',
      basedMeta: '米国ユタ州ソルトレイクシティ在住', avail: '{Y}年{M}月より対応可能',
      contactLead: '一緒に意味のあるものを<br>つくりましょう', schedule: '打ち合わせを予約', scheduleShort: '予約',
      fBased: '拠点', fCity: 'ユタ州ソルトレイクシティ', fConnect: 'つながる', email: 'メール', resume: '履歴書',
      mAbout: 'プロフィール', mProject: 'プロジェクト', mContact: 'お問い合わせ', mLanguage: '言語',
      pvYear: '年', pvDevice: 'デバイス', pvTimeline: '期間', pvCollab: 'コラボレーション', pvSoon: 'ケーススタディは近日公開予定です。', pvNext: '次のプロジェクト',
    },
  };

  const LANGS = Object.keys(DICT);
  let current = 'en';

  function apply(lang) {
    if (!DICT[lang]) lang = 'en';
    current = lang;
    const d = DICT[lang];
    document.documentElement.lang = lang;
    // {Y} {M} {MON} = 지금 날짜 (예: NOV 2026 → 12월이 되면 자동으로 DEC 2026)
    const now = new Date();
    const MONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const fill = (v) => v.replace('{Y}', now.getFullYear()).replace('{MON}', MONS[now.getMonth()]).replace('{M}', now.getMonth() + 1);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const raw = d[el.dataset.i18n];
      const v = raw == null ? raw : fill(raw);
      if (v != null && el.textContent !== v) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const v = d[el.dataset.i18nHtml];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });
    try { localStorage.setItem('tp-lang', lang); } catch (e) { /* 저장 못 해도 동작 */ }
    // About 문단처럼 글자를 쪼개서 쓰는 곳은 이 이벤트로 다시 만듦
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang, dict: d } }));
  }

  window.I18N = {
    get lang() { return current; },
    t: (key) => (DICT[current] && DICT[current][key]) || DICT.en[key] || '',
    set: apply,
    langs: LANGS,
  };

  let saved = 'en';
  try { saved = localStorage.getItem('tp-lang') || 'en'; } catch (e) { /* 기본 영어 */ }
  // 나머지 스크립트가 준비된 뒤 적용
  document.addEventListener('DOMContentLoaded', () => apply(saved));
})();
