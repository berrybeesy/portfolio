// 프로젝트 데이터 — 썸네일(thumb)은 실제 이미지(png/jpg/webp)로 교체하면 됩니다.
window.PROJECTS = [
  {
    id: 'moment',
    title: 'Moment',
    role: 'UX/UI Designer',
    year: '2025',
    category: 'UXUI',
    tags: 'AI · Video Learning',
    thumb: 'assets/projects/moment/thumb.webp',
    shape: 1, // 0: 위아래 두 덩어리 · 1: 구름 · 2: 넓은 두 타원
    link: '#',
  },
  {
    id: 'naverwhale',
    title: 'NaverWhale Redesign',
    role: 'UX Research · Prototype',
    year: '2024',
    category: 'UX Research',
    tags: 'Product · Web',
    thumb: 'assets/thumbs/whale.svg',
    shape: 2,
    link: '#',
  },
  {
    id: 'adobe',
    title: 'Adobe Student Ambassador @ UofU',
    role: 'Student Leader',
    year: '2026',
    category: 'Student Leader',
    tags: 'Organization',
    thumb: 'assets/projects/adobe/join.webp',
    shape: 0,
    link: '#',
  },
];

// WORKS 리스트 (호버하면 사각형 썸네일)
window.WORKS = [
  { id: 'moment', title: 'MOMENT', tag: 'UXUI', thumb: 'assets/projects/moment/03.webp', link: '#' },
  { id: 'naverwhale', title: 'NAVERWHALE', tag: 'UXUI', thumb: 'assets/thumbs/whale.svg', link: '#' },
  { id: 'adobe', title: 'ADOBE AMBASSADOR', tag: 'blog', thumb: 'assets/projects/adobe/join.webp', link: '#' },
];

// 프로젝트 상세 페이지 내용 (프로젝트를 누르면 같은 자리에서 검정 화면으로 전환되며 열림)
// 위쪽 검정 인트로(Year · Device · Timeline · Collaboration · 제목)는 모든 프로젝트 공통 구조.
// [임시] 표시가 있는 내용은 실제 내용으로 바꿔주세요.
window.PROJECT_DETAILS = {
  moment: {
    title: 'Moment',
    year: '2025',
    device: 'Desktop, iPad',
    timeline: 'Feb - Mar | 1 month',
    collaboration: '2 other developers',
    aboutTitle: 'About Moment',
    about: [
      'Moment is an AI-powered interactive video learning app that transforms YouTube into an active, in-context learning experience. Users can ask questions at specific timestamps, receive instant AI explanations, and attach notes without leaving the video. Moment reduces context switching and helps users stay focused, explore deeper, and learn more efficiently—one moment at a time.',
      'Momentは、YouTubeの視聴を能動的で文脈中心の学習体験へと変えるAIベースのインタラクティブ動画学習アプリです。ユーザーは動画を離れることなく、特定のタイムスタンプで質問し、即座にAIの説明を受け取り、その瞬間にノートを残すことができます。Momentはコンテキスト切り替えを減らし、ユーザーが集中を維持しながら、より深く、効率的に学習できるよう支援します ― 一つひとつの瞬間ごとに。',
      'Moment는 YouTube 시청을 능동적이고 맥락 중심의 학습 경험으로 바꾸는 AI 기반 인터랙티브 영상 학습 앱입니다. 사용자는 영상을 벗어나지 않고, 특정 타임스탬프에서 질문하고 즉시 AI 설명을 받으며, 해당 순간에 노트를 남길 수 있습니다. Moment는 컨텍스트 전환을 줄이고, 사용자가 집중을 유지한 채 더 깊이 탐색하고 효율적으로 학습할 수 있도록 돕습니다 — 한 순간씩.',
    ],
    note: 'Google Gemini Hackathon · 1 month · Team of 3',
    image: 'assets/projects/moment/hero.webp',
    captionL: 'Context-Linked AI Workspace',
    captionR: 'UX/UI',
    // 케이스 스터디 이미지 (Figma 'portfolio_website' 프레임에서 내보냄, 위에서부터 순서대로)
    // [파일, 가로, 세로] — 크기를 미리 알려줘야 로딩 전에도 자리가 잡혀서 스크롤이 튀지 않음
    gallery: [
      ['01', 2880, 1350], ['02', 2880, 992], ['03', 2880, 1590], ['04', 2880, 1898], ['05', 2880, 884],
      ['06', 2880, 3684], ['07', 2880, 1054], ['08', 2880, 2892], ['09', 2880, 5600], ['10', 2880, 2095],
    ].map(([n, w, h]) => ({ src: `assets/projects/moment/${n}.webp`, w, h })),
    // 마지막 크레딧 (Figma 마지막 섹션을 글자로 다시 만듦)
    credits: {
      title: 'Google Gemini3 Hackathon',
      label: 'C A S T',
      people: ['UX / UI Designer Teresa Park', 'Backend Developer Hajin Jeon', 'Frontend Developer Tommy Chu'],
    },
  },
  naverwhale: {
    title: 'NaverWhale',
    year: '2024',
    device: 'Desktop, Tablet',
    timeline: 'Feb - Mar 2024',
    collaboration: 'NaverWhale (Client)',
    aboutTitle: 'About NaverWhale Redesign',
    about: [
      'Conducted user interviews and usability tests to uncover usability issues in Whale Browser’s wallpaper customization.',
      'Proposed a simplified 3-step theme flow based on research findings to reduce friction.',
    ],
    note: 'Incheon, South Korea · UX Research 50% · Prototype 30% · UX Design 20%',
    image: 'assets/thumbs/whale.svg',
    captionL: 'Redesigning Customization Experience',
    captionR: 'UX/UI',
  },
  adobe: {
    title: 'Adobe Ambassador',
    year: '2025',
    device: 'Instagram, Campus',
    timeline: 'Jan 2025 - Present',
    collaboration: 'Adobe Student Ambassadors',
    aboutTitle: 'About Adobe Student Ambassador',
    about: ['As an Adobe Student Ambassador at the University of Utah, I bring Adobe Express and Creative Cloud to students through workshops, campus events and social content — and now lead the club as President.'],
    // 역할 타임라인 (LinkedIn 기준)
    roles: [
      { title: 'Student Ambassador President', period: 'May 2026 - Present', badge: 'Present', points: [] },
      { title: 'Student Ambassador Vice President', period: 'Jan 2026 - May 2026', points: [
        'Launched the club’s official Instagram account, building its content strategy and visual identity from the ground up.',
        'Planned and led 3 workshops introducing students to Adobe Express and Creative Cloud tools.',
        'Managed social media campaigns and promotional content to grow event attendance and campus awareness.',
      ] },
      { title: 'Adobe Student Ambassador', period: 'Jan 2025 - Jan 2026', points: [
        'Promoted Adobe Express and Creative Cloud tools to students through campus outreach and tabling events.',
        'Supported Adobe workshops by assisting with setup, hands-on guidance, and student questions.',
        'Designed promotional graphics and event content using Adobe Express to boost student participation.',
        'Collaborated with fellow ambassadors via Microsoft Teams to prepare event logistics and creative deliverables.',
      ] },
    ],
    note: 'University of Utah · Salt Lake City, UT',
    image: 'assets/projects/adobe/join.webp',
    portrait: true,                      // 세로(4:5) 포스터 → 가운데 좁게
    captionL: 'Executive Board Recruitment Campaign',
    captionR: 'Instagram · Graphic Design',
    // 같은 캠페인의 역할 포스터 (가로 3장)
    series: {
      title: 'Open Positions',
      link: 'https://www.instagram.com/adobe.uofu/',
      linkLabel: '@adobe.uofu',
      items: [
        { src: 'assets/projects/adobe/creative-design.webp', label: 'Creative Director (Design)' },
        { src: 'assets/projects/adobe/creative-video.webp', label: 'Creative Director (Video)' },
        { src: 'assets/projects/adobe/community.webp', label: 'Community Director' },
      ],
    },
    soonBig: 'Coming Soon',  // 크게 표시
  },
};
