# Teresa Park — Portfolio

빌드 없이 돌아가는 정적 사이트 (HTML / CSS / Vanilla JS). Vercel에 그대로 배포됩니다.

## 로컬에서 보기

```bash
python3 -m http.server 8080
```

브라우저에서 http://localhost:8080

## 구조

- `index.html` — 페이지 전체 마크업
- `css/style.css` — 스타일 (토큰: `--ink #111`, `--blue #306EFF`)
- `js/projects.js` — 프로젝트 데이터: 히어로 캐러셀(`PROJECTS`), Works 목록(`WORKS`), 상세 페이지(`PROJECT_DETAILS`)
- `js/main.js` — 히어로 캐러셀, 액체 모양 썸네일, 스크롤 이름 애니메이션
- `js/sections.js` — About 채우기, Works 호버, 푸터 물결 + 이름 물리 효과
- `js/project.js` — 프로젝트 상세 화면 전환
- `js/menu.js` · `js/i18n.js` — 메뉴, 언어(English / 한국어 / 日本語)
- `js/cursor.js` · `js/smooth.js` — 액체 커서, Lenis 부드러운 스크롤
- `assets/` — 폰트(Pretendard), 이미지, 라이브러리(Matter.js, Lenis — MIT)
