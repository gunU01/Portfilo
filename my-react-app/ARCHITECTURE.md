# 아키텍처

문구와 수치는 `data/` 에만 있고, 화면 코드는 그것을 그리기만 합니다. 이 규칙이 구조 전체를 정합니다.

## 계층과 의존 방향

```
main.jsx ─ App.jsx (라우팅)
              │
            pages ───────────────┐
              │                  │
          components ──┬─ components/desk   (책상 SVG 조각, DeskScene 만 가져감)
              │         │
              ▼         ▼
      lib (훅·함수)    data (문구·수치)      styles (CSS, JS 와 별개)
```

화살표 방향으로만 가져올 수 있습니다. 거꾸로 가져오면 `npm run arch` 가 실패합니다.

| 계층 | 하는 일 | 가져올 수 있는 곳 | 가져올 수 없는 곳 |
| --- | --- | --- | --- |
| `data/` | 사이트에 나오는 모든 문구, 수치, 이미지 연결. 순수 데이터 | `data/`, `assets/` | React, `lib`, `components`, `pages` |
| `lib/` | 훅(`useHashRoute`, `useScrollSpy` …)과 작은 함수. 화면 모양을 모름 | `lib/`, `react` | `data`, `components`, `pages` |
| `components/` | 여러 페이지가 함께 쓰는 화면 조각. 내용은 props 나 `data` 에서 받음 | `components/`, `data`, `lib`, `assets` | `pages` |
| `components/desk/` | 책상 일러스트를 이루는 SVG 조각. 장면 밖에서는 쓰지 않음 | `components`, `data`, `lib` | `pages`. 이 폴더는 `DeskScene.jsx` 만 가져올 수 있음 |
| `pages/` | 라우트 하나에 해당하는 화면. 조립만 함 | `components`, `data`, `lib` | 다른 `pages` (페이지끼리는 독립) |
| `App.jsx`, `main.jsx` | 라우팅, 문서 제목, 전역 훅 연결 | 전부 | |
| `styles/` | CSS. `index.css` 가 순서대로 불러옴 | `assets`(글꼴) | |

그 밖에 지키는 것: 순환 의존 금지, `main.jsx` 에서 이어지지 않는 모듈 금지(쓰지 않는 코드), `react`/`react-dom` 외 패키지 금지. 규칙은 `harness/architecture.config.mjs` 한 곳에 있고, 이 문서의 표와 같은 내용입니다. 계층을 바꿀 때는 둘을 같이 고치세요.

## 데이터 흐름

- `profile.js`(이름, 소개, 연락처), `awards.js`, `contests.js` 는 홈, 소개 페이지, 푸터가 그대로 읽습니다.
- `skills.js` 의 묶음은 `view` 로 보여 주는 방식을 정합니다. `'process'` 는 순서대로 이어 붙인 흐름도(항목 순서가 곧 순서), `'stack'` 은 도구 칩입니다. 그리는 쪽은 `components/SkillMap.jsx`.
- `eolma.js`, `haemi.js`, `sosang.js`, `toss.js`, `tossux.js` 는 케이스 한 편씩이고, `cases.js` 가 노출 순서를 정합니다. 케이스 본문은 `sections[].blocks[]` 로 구성되고 `components/Blocks.jsx` 가 블록 타입별로 그립니다. 목차와 섹션을 그리는 본문 틀(`components/DocBody.jsx`)은 케이스와 블로그 글(`blog.js`, 같은 블록 형식)이 함께 씁니다.
- `desk.js` 는 새 내용을 만들지 않고 위 데이터를 모아 책상의 물건 7개(`spots`)로 보여 줍니다. 물건의 이름표, 접근성 라벨, 패널 제목은 `spots[].title` 하나를 같이 씁니다.

## 라우팅

해시 라우팅(`#/`, `#/project`, `#/about`, `#/desk`, `#/work/<slug>`, `#/blog/<slug>`, `?s=<섹션 id>`)이라 정적 호스팅에서 새로고침해도 깨지지 않습니다. `App.jsx` 의 `PAGES` 표가 경로 → 페이지, 제목, 푸터 표시 여부를 정하고, `/work/<slug>` 는 `cases` 에서 찾아 `Case` 로, `/blog/<slug>` 는 `blog-meta.js` 의 `postIndex` 에서 찾아 `Post`(본문은 `data/blog.js`)로 그립니다. 블로그 목록은 Project 페이지 아래(`#blog`)에 있습니다. 알 수 없는 경로는 홈입니다. 홈만 처음에 받고 나머지 페이지(Project, About, Case, Post, Desk)는 `React.lazy` 로 그 경로에 들어갈 때 받으며, 받는 동안에는 빈 자리표시(`.page-wait`)가 자리를 잡고 푸터는 숨겨 둡니다(푸터가 밀려 내려오는 이동을 막기 위해). 경로가 바뀔 때는 `startTransition`(`useHashRoute`)으로 알려서, 다음 페이지 코드를 받는 동안 지금 화면이 그대로 남습니다. 한가할 때 가벼운 페이지 코드를 미리 받고, 책상은 메뉴에 마우스를 올리면 받습니다. 주소는 정리됩니다: 끝의 `/` 는 지우고, 없는 경로는 홈으로(없는 케이스는 목록으로) `location.replace` 로 옮겨 기록을 남기지 않습니다. 화면을 옮기면 맨 위(또는 `?s=` 구간)에서 바로 시작하고 뒤로·앞으로 가기는 떠난 스크롤 위치로 돌아갑니다(`useRouteScroll`). 모든 페이지가 쓰는 글꼴 파일은 `vite.config.js` 의 `preloadFont` 가 HTML 에 미리 받기(`preload`)로 넣습니다.

## 스타일

- `styles/index.css` 의 `@import` 순서가 곧 우선순위입니다. 뒤 파일이 앞 규칙을 덮어쓸 수 있으니 순서를 바꾸지 마세요(`base → nav → hero → about → case → responsive → print → desk → components → layout → pages → skills → effects → ink`).
- 좁은 화면 규칙은 두 곳으로 나눕니다. 여러 페이지가 함께 쓰는 것(여백, 숫자 카드, 줄바꿈)은 `responsive.css`, 한 페이지에만 해당하는 것은 그 페이지 스타일 파일 맨 아래(케이스는 `case.css`, 프로젝트 목록은 `pages.css`)에 둡니다. 그래야 기본 규칙과 같은 파일에서 순서로 덮어쓸 수 있어 선택자를 억지로 길게 쓸 일이 없습니다.
- 색, 간격 같은 값은 `base.css` 의 `:root` 변수에 있습니다. 색 원칙: 기본은 검정(`--ink`), 흰색(`--bg`), 파랑(`--accent`)이고, 보조 글자와 면은 색기 없는 연회색으로 죽인 톤(`--muted`, `--faint`, `--surface`, `--sunken`, `--line`)을 씁니다. 포인트와 본문 강조는 케이스마다 다른 색(아래 `data-accent`)입니다. 푸른 기가 도는 회색, 베이지, 그라데이션은 쓰지 않습니다(위쪽 스크롤 진행 막대만 예외). 새 색을 넣을 때는 흰색이나 `--surface` 위에서 대비 4.5 이상인지 `npm run e2e -- --only a11y` 로 확인하세요.
- `font.css` 는 `scripts/subset-font.py` 가 만듭니다(직접 고치지 않음).
- 호버 번짐: 요소에 `ink` 클래스를 붙이면 됩니다. 중심 위치는 `lib/useInkHover.js` 가, 모양은 `styles/ink.css` 가 맡습니다.
- 사이트의 나머지 움직임은 `styles/effects.css` 한 파일에 모았고, 모션 줄이기 설정에서 그 파일 맨 아래가 한꺼번에 끕니다. 값을 정하는 일은 `lib/` 의 훅이 하고 CSS 는 값만 읽습니다: 마우스 위치 `--px/--py`(`usePointerVars`), 요소 안 마우스 위치 `--fx/--fy`(`useFollow`, `.follow` 요소: 카드 기울기, `.magnet` 버튼), 스크롤 `--scroll`(`useScrollProgress`, 문서 전체가 아니라 진행 막대 `.progress` 에만 씀), 활동 기록과 대회 참가의 진행선 `--fill`과 항목 상태 `is-passed`/`is-current`(`useTimelineProgress`). 스크롤에 맞춰 값을 갱신하는 훅은 `onScrollFrame` 으로 프레임당 한 번만 계산합니다. 케이스 페이지에는 막대 도식이 화면에 들어오면 차오르는 효과(`useGrow` 가 `.chart` 에 `is-in` 을 붙임), 접힌 항목(`details`)이 부드럽게 열리는 효과(CSS `::details-content`, 지원하지 않는 브라우저는 바로 열림), 맨 아래의 다음 프로젝트 카드(`CaseNext`), 어느 페이지에서나 내려가면 나타나는 맨 위로 버튼(`BackToTop`, 책상 제외)이 있고, 오늘한입의 표지는 로고(`cover.kind: 'logo'`, 체크가 그려지고 마우스를 올리면 한 입 더 베어 묾)입니다.
- 케이스마다 포인트 색이 다릅니다(해미 주황, 오늘한입 연두, 나머지 파랑). 케이스 데이터의 `accent` 값을 `useAccent` 가 `<html data-accent>` 로 옮기고, `styles/base.css` 의 `[data-accent]` 규칙이 `--accent` 계열 변수를 덮어씁니다. 프로젝트 카드는 같은 속성을 자기 요소에 달아 카드 안에서만 그 색이 됩니다.

## 책상 장면

`pages/Desk.jsx` 가 상태(`active`, `openId`)를 갖고, `DeskScene` 이 조각들을 레이어(`back`, `mid`, `front`) 순서로 조립합니다. 조각 안의 핫스팟(`Hotspot`)은 context(`deskContext.js`)로 `active`, `setActive`, `onOpen` 을 받으므로 props 를 내려보낼 필요가 없습니다. 마우스를 따라 층이 움직이는 효과는 `lib/useParallax.js` 입니다. 물건마다의 반응(서랍이 열림, 연필이 움직임, 고양이가 웃으며 하트를 날림 등)은 JS 없이 `desk.css` 가 `.hs.is-on`(호버나 포커스) 상태를 보고 처리하고, 고양이 눈동자는 `useParallax` 가 정하는 `--px`/`--py` 를 그대로 씁니다. 모든 장면 애니메이션은 모션 줄이기 설정에서 멈춥니다. 그림체는 `desk/outline.js` 의 갈색 윤곽선으로 통일합니다.

## 자주 하는 변경

| 하고 싶은 일 | 고칠 곳 |
| --- | --- |
| 소개, 연락처, 타임라인 문구 | `data/profile.js` |
| 새 케이스 추가 | `data/<slug>.js` 를 만들고 `data/cases.js` 에 등록하며, 주소와 이름, 포인트 색은 `data/case-meta.js`(홈이 바로 쓰는 가벼운 정보, 본문과 분리)에 적습니다. 책상의 기획물 목록에도 넣으려면 `data/desk.js` |
| 새 페이지 | `pages/<Name>.jsx` 를 만들고 `App.jsx` 의 `PAGES` 에 추가 |
| 책상에 물건 추가 | `data/desk.js` 의 `spots` + `desk/Tags.jsx` 의 `POSITIONS` + `desk/` 에 SVG 조각 + `DeskScene.jsx` 에 배치 |
| 새 호버 번짐 대상 | 요소에 `ink` 클래스 (색은 `ink.css` 의 `--paint`) |
| 링크 미리보기 문구 | `index.html` 의 `<title>` 과 `description`, `og:*` (JS 가 아니라 이 파일만 읽힙니다) |

## 검증 하네스

`npm run verify` 한 번이 아래를 차례로 돌립니다. 하나라도 실패하면 멈춥니다.

| 명령 | 지키는 것 |
| --- | --- |
| `npm run lint` | 문법, 훅 규칙, 쓰지 않는 변수 |
| `npm run arch` | 위 계층 규칙, 순환, 쓰지 않는 모듈 (쓰지 않는 이미지는 경고) |
| `npm run build` | 빌드가 되는지 |
| `npm run e2e` | 빌드 결과를 실제 브라우저로 열어 확인 (아래) |

`e2e` 는 `harness/checks/` 의 검사를 돌립니다. 검사 파일을 하나 더 넣으면 자동으로 포함됩니다.

| 검사 | 확인하는 것 |
| --- | --- |
| `routes` | 모든 라우트(케이스는 목록에서 자동 발견)가 PC·모바일에서 오류 없이 열리고, 제목과 푸터가 맞고, 가로로 넘치지 않고, 글꼴이 로드됨 |
| `links` | 사이트의 모든 내부 링크(책상 패널 안 포함)가 실제 페이지와 `?s=` 섹션으로 이어짐. 바깥 링크는 새 탭 + `rel=noreferrer` |
| `desk` | 물건 7개를 키보드와 마우스로 열고 닫음, 포커스 이동, 이름표, 시차 효과, 모바일 가운데 스크롤 |
| `navigation` | 메뉴 강조, 프로젝트 탭 필터, 케이스 목차와 소개 페이지 목차 이동 |
| `skills` | 기술 도식의 마디와 칩 선택, 방향키 이동, 모바일에서 설명이 항상 펼쳐짐 |
| `ink` | 호버 번짐(들어온 자리, 나간 자리, 도중에 나갈 때), 모션 줄이기 |
| `a11y` | 글자와 배경의 대비(일반 4.5, 큰 글씨 3), 이미지 대체 텍스트, 버튼 이름. 대비를 일부러 낮춘 곳은 `checks/a11y.mjs` 의 `EXEMPT` 에 이유와 함께 적음 |
| `effects` | 페이지 전환, 스크롤 진행 막대, 메뉴 알약(글꼴 로드 뒤에도 맞음), 첫 화면 글자, 카드 기울기, 버튼 끌림, 모션 줄이기에서 꺼짐 |
| `interactions` | 오늘한입 로고 표지, 막대 도식이 화면에 들어오면 차오름, 접힌 항목이 부드럽게 열림, 다음 프로젝트 카드(목록 순서, 마지막은 처음으로), 맨 위로 버튼(책상 제외) |
| `timeline` | 활동 기록과 대회 참가 두 목록의 진행선이 읽는 위치를 따라 이어서 차오르고, 점과 항목 상태(지나감, 현재, 회색)가 선을 따라감 |
| `footer` | 복사 아이콘이 이메일과 전화번호를 복사하고, 폭 320~390px 에서 값 글자나 화살표와 겹치지 않음 |
| `seo` | `index.html` 의 제목, 설명, `og:*` 가 맞고 길이가 적당함, 외부 CDN 없음 |

검사들이 같이 쓰는 도구는 `harness/lib/` 에 있습니다(`site.mjs`: 케이스·책상 물건 자동 발견과 사이트 이름 읽기, `browser.mjs`: 브라우저 열기, `server.mjs`: 미리보기 서버, `args.mjs`). 기대하는 제목처럼 사이트 문구에 걸린 값은 검사 안에 적지 않고 빌드 결과(`dist/index.html`)에서 읽습니다.

리팩터링 전후 화면을 비교할 때:

```bash
npm run build && npm run snap -- harness/out/before     # 수정 전
# ... 코드 수정 ...
npm run build && npm run snap -- harness/out/after      # 수정 후
npm run snap:diff -- harness/out/before harness/out/after
```

`harness/out/` 은 git 에 올라가지 않습니다. 브라우저는 `CHROMIUM_PATH` 환경 변수로 지정하거나, 없으면 `npx playwright install chromium` 으로 받은 것을 씁니다. 특정 검사만 돌리려면 `npm run e2e -- --only desk`.

## 결정 기록

- **해시 라우팅**: 호스팅(Vercel, GitHub Pages 어디든)에서 서버 설정 없이 동작하게 하려고.
- **책상을 SVG 로**: 3D 로 만들었다가 품질이 기대에 못 미쳐 일러스트로 바꿨고, 외부 이미지 없이 용량이 작음.
- **상태 관리 라이브러리 없음**: 공유 상태가 책상의 `active` 하나뿐이라 React 상태와 context 로 충분함.
- **나눔스퀘어 네오를 둘로 쪼갬**: 원본이 1.5MB 라서. 지금 쓰는 글자(a)만 항상 받고, 완성형 한글 전체(b)는 필요할 때만 받음.
- **링크 미리보기는 정적 `index.html`**: 메신저가 자바스크립트를 실행하지 않아서 `document.title` 로는 바뀌지 않음.
