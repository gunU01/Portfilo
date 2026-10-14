# PM 포트폴리오

프론트엔드 출신 PM 포트폴리오 사이트. React 19 + Vite, 해시 라우팅, 폰트·CDN 미사용. 글꼴은 나눔스퀘어 네오(NAVER, SIL OFL)를 `src/assets/fonts/` 에 함께 배포합니다. `#/desk` 는 SVG 로 그린 책상 위의 물건을 눌러 포트폴리오를 둘러보는 입구입니다.

```bash
npm install
npm run dev      # 개발 서버
npm run build    # dist/ 생성 (base './' 라 어떤 하위 경로에 올려도 동작)
```

## 내용 수정

화면 코드는 건드리지 않고 `src/data/` 만 고치면 됩니다.

| 파일 | 내용 |
| --- | --- |
| `profile.js` | 이름, 히어로 문구, 소개·타임라인, 연락처(빈 값은 자동 숨김) |
| `eolma.js` · `haemi.js` · `toss.js` | 케이스 스터디 본문. `sections[].blocks[]` 의 타입(`p`, `list`, `table`, `decisions`, `stats` …)을 조합 |
| `skills.js` | 기술·도구 (어디에 어떻게 썼는지). 묶음의 `view` 가 도식('process', 순서가 곧 항목 순서)인지 칩('stack')인지 정함 |
| `awards.js` · `contests.js` | 수상 이력(항목을 넣으면 ‘수상’ 섹션이 나타남) · 대회 참가 기록 |
| `cases.js` | 프로젝트 노출 순서 |
| `src/assets/` | 케이스에 쓰는 화면 이미지. 개인 식별 정보(이름·얼굴·전화·계좌·영수증 상세)가 보이면 흐림 처리하거나 쓰지 않습니다 |
| `desk.js` | 책상 위 물건과, 누르면 열리는 내용. 기존 `cases`·`awards`·`contests`·`profile`에서 가져오므로 보통 고칠 필요 없음 |

## 작성 원칙

- 수치는 출처가 확인된 것만 싣고, 팀원이 한 일은 ‘팀’으로 표기합니다.
- 근거(문서로 확인된 사실)와 해석(본인 해석)을 구분합니다.
- 성과 지표가 아직 없는 항목은 비워 두지 않고 ‘집계 전’이라고 적습니다.

## PDF로 제출하기

브라우저 인쇄(Ctrl/Cmd+P) → PDF 저장. 인쇄용 스타일이 있어 메뉴가 숨겨지고 접힌 항목이 펼쳐집니다.

## 코드 구조

계층 규칙, 데이터 흐름, 자주 하는 변경은 [ARCHITECTURE.md](./ARCHITECTURE.md) 에 있습니다.

```
src/
  pages/        Home · Project · Case(케이스 본문) · About · Desk(책상 입구)
  components/   Nav · Footer · Spec · SkillMap · Blocks · CaseCover · DeskScene · DeskPanel
    desk/       책상 SVG 를 이루는 조각들 (Wall · WallDecor · Desktop · Foreground · Hotspot · Tags …)
  data/         화면에 나오는 모든 문구와 수치 (위 표)
  lib/          useHashRoute · useReveal · useScrollSpy · useParallax · usePointerVars · useFollow · useScrollProgress · useScrollPassed · useInkHover · arrowNav · format
  styles/       index.css 가 순서대로 불러옵니다. 뒤 파일이 앞 규칙을 덮어쓸 수 있으니 순서를 바꾸지 마세요
harness/        검증 하네스 (아키텍처 검사, 브라우저 검사 checks/, 스냅샷 비교)
scripts/        글꼴 쪼개기
```

## 검증

```bash
npm run verify        # lint + 아키텍처 검사 + 빌드 + 브라우저 검사를 한 번에
npm run arch          # 계층 규칙만
npm run e2e           # 브라우저 검사만 (먼저 npm run build)
```

처음 한 번은 `npx playwright install chromium` 으로 브라우저를 받아야 합니다. 자세한 내용은 ARCHITECTURE.md 의 '검증 하네스'.

## 글꼴 다시 만들기

나눔스퀘어 네오는 용량 때문에 두 파일로 쪼개 쓰고(`scripts/subset-font.py`), 지금 사이트에 쓰는 글자(a)만 항상 받고 나머지 완성형 한글(b)은 필요할 때만 받습니다.
문구를 많이 바꿨다면 가변 글꼴 원본(woff2)을 구해 아래를 다시 돌리세요. 안 돌려도 b 가 대신 받아져서 글자가 깨지지는 않습니다.

```bash
pip install fonttools brotli
python3 scripts/subset-font.py <NanumSquareNeo-Variable.woff2>
```
