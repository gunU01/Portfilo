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
- `eolma.js`, `haemi.js`, `toss.js` 는 케이스 한 편씩이고, `cases.js` 가 노출 순서를 정합니다. 케이스 본문은 `sections[].blocks[]` 로 구성되고 `components/Blocks.jsx` 가 블록 타입별로 그립니다.
- `desk.js` 는 새 내용을 만들지 않고 위 데이터를 모아 책상의 물건 7개(`spots`)로 보여 줍니다. 물건의 이름표, 접근성 라벨, 패널 제목은 `spots[].title` 하나를 같이 씁니다.

## 라우팅

해시 라우팅(`#/`, `#/project`, `#/about`, `#/desk`, `#/work/<slug>`, `?s=<섹션 id>`)이라 정적 호스팅에서 새로고침해도 깨지지 않습니다. `App.jsx` 의 `PAGES` 표가 경로 → 페이지, 제목, 푸터 표시 여부를 정하고, `/work/<slug>` 는 `cases` 에서 찾아 `Case` 로 그립니다. 알 수 없는 경로는 홈입니다.

## 스타일

- `styles/index.css` 의 `@import` 순서가 곧 우선순위입니다. 뒤 파일이 앞 규칙을 덮어쓸 수 있으니 순서를 바꾸지 마세요(`base → nav → hero → about → case → responsive → print → desk → components → layout → pages → skills → ink`).
- 색, 간격 같은 값은 `base.css` 의 `:root` 변수에 있습니다. 색 원칙: 글씨는 중립 회색(`--ink`, `--muted`, `--faint`), 파랑(`--accent`)은 링크, 버튼, 강조에만 씁니다. 새 색을 넣을 때는 흰색이나 `--surface` 위에서 대비 4.5 이상인지 `npm run e2e -- --only a11y` 로 확인하세요.
- `font.css` 는 `scripts/subset-font.py` 가 만듭니다(직접 고치지 않음).
- 호버 번짐: 요소에 `ink` 클래스를 붙이면 됩니다. 중심 위치는 `lib/useInkHover.js` 가, 모양은 `styles/ink.css` 가 맡습니다.

## 책상 장면

`pages/Desk.jsx` 가 상태(`active`, `openId`)를 갖고, `DeskScene` 이 조각들을 레이어(`back`, `mid`, `front`) 순서로 조립합니다. 조각 안의 핫스팟(`Hotspot`)은 context(`deskContext.js`)로 `active`, `setActive`, `onOpen` 을 받으므로 props 를 내려보낼 필요가 없습니다. 마우스를 따라 층이 움직이는 효과는 `lib/useParallax.js` 입니다. 물건마다의 반응(서랍이 열림, 연필이 움직임, 고양이가 웃으며 하트를 날림 등)은 JS 없이 `desk.css` 가 `.hs.is-on`(호버나 포커스) 상태를 보고 처리하고, 고양이 눈동자는 `useParallax` 가 정하는 `--px`/`--py` 를 그대로 씁니다. 모든 장면 애니메이션은 모션 줄이기 설정에서 멈춥니다. 그림체는 `desk/outline.js` 의 갈색 윤곽선으로 통일합니다.

## 자주 하는 변경

| 하고 싶은 일 | 고칠 곳 |
| --- | --- |
| 소개, 연락처, 타임라인 문구 | `data/profile.js` |
| 새 케이스 추가 | `data/<slug>.js` 를 만들고 `data/cases.js` 에 등록. 책상의 기획물 목록에도 넣으려면 `data/desk.js` |
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
