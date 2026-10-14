// 아키텍처 규칙: ARCHITECTURE.md 의 표와 같은 내용입니다. 계층을 바꿀 때는 이 파일과 그 문서를 같이 고치세요.

export const ENTRY = 'main.jsx'

// 계층: 파일이 속한 곳 → 가져와도 되는 곳. 목록에 없으면 가져올 수 없습니다. (자기 계층 안에서는 항상 가능)
// packages: 이 계층에서 가져올 수 있는 npm 패키지. 목록에 없으면 가져올 수 없습니다.
export const LAYERS = {
  data: { dir: 'data/', may: ['assets'], packages: [] },
  lib: { dir: 'lib/', may: [], packages: ['react'] },
  'components/desk': { dir: 'components/desk/', may: ['data', 'lib', 'components'], packages: ['react'] },
  components: { dir: 'components/', may: ['data', 'lib', 'components/desk', 'assets'], packages: ['react'] },
  pages: { dir: 'pages/', may: ['components', 'data', 'lib'], packages: ['react'] },
  styles: { dir: 'styles/', may: ['assets'], packages: [] },
  root: { dir: '', may: ['pages', 'components', 'data', 'lib', 'styles', 'assets'], packages: ['react', 'react-dom'] },
}
// 같은 계층 안에서도 서로 가져오면 안 되는 곳: pages 는 페이지끼리 독립입니다.
export const NO_SIBLINGS = new Set(['pages'])
// components/desk 는 DeskScene.jsx 만 가져올 수 있습니다(장면을 이루는 조각이라서).
export const PRIVATE = { 'components/desk': ['components/DeskScene.jsx'] }

