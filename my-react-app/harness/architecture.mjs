// 아키텍처 검사: src 의 import 그래프가 ARCHITECTURE.md 의 계층 규칙을 지키는지 확인합니다.
// 의존 없이 돌아가며(정규식으로 import 를 읽음), 위반이 있으면 종료 코드 1 로 끝납니다.
//   node harness/architecture.mjs
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')
const ENTRY = 'main.jsx'

// 계층: 파일이 속한 곳 → 가져와도 되는 곳. 목록에 없으면 가져올 수 없습니다. (자기 계층 안에서는 항상 가능)
// 패키지는 허용 목록(PACKAGES)에 있는 것만 가져올 수 있습니다.
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
const NO_SIBLINGS = new Set(['pages'])
// components/desk 는 DeskScene.jsx 만 가져올 수 있습니다(장면을 이루는 조각이라서).
const PRIVATE = { 'components/desk': ['components/DeskScene.jsx'] }

const exists = (f) => fs.existsSync(f) && fs.statSync(f).isFile()
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]))
const rel = (f) => path.relative(SRC, f).split(path.sep).join('/')

// 가장 구체적인(긴 dir) 계층을 고릅니다. assets 는 계층이 아니라 정적 파일입니다.
function layerOf(file) {
  const r = rel(file)
  if (r.startsWith('assets/')) return 'assets'
  const found = Object.entries(LAYERS)
    .filter(([name, l]) => name !== 'root' && r.startsWith(l.dir))
    .sort((a, b) => b[1].dir.length - a[1].dir.length)[0]
  return found ? found[0] : 'root'
}

const IMPORT_RE = /(?:import|export)\s+(?:[^'"()]*?\s+from\s+)?['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g

// CSS 는 @import 와 url() 로 다른 파일(CSS, 글꼴, 이미지)을 가져옵니다.
const CSS_RE = /@import\s+(?:url\()?['"]([^'"]+)['"]|url\(\s*['"]?([^'")]+?)['"]?\s*\)/g

export function readImports(file) {
  const text = fs.readFileSync(file, 'utf8')
  const out = []
  if (file.endsWith('.css')) {
    for (const m of text.matchAll(CSS_RE)) {
      const spec = m[1] ?? m[2]
      if (spec.startsWith('.')) out.push(spec)
    }
    return out
  }
  for (const m of text.matchAll(IMPORT_RE)) out.push(m[1] ?? m[2])
  return out
}

function resolve(from, spec) {
  const base = path.resolve(path.dirname(from), spec)
  for (const c of [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js'), path.join(base, 'index.jsx')]) if (exists(c)) return c
  return null
}

export function check() {
  const errors = []
  const warnings = []
  const files = walk(SRC)
  const code = files.filter((f) => /\.(jsx?|mjs|css)$/.test(f))
  const graph = new Map()

  for (const file of code) {
    const myLayer = layerOf(file)
    const rule = LAYERS[myLayer]
    const deps = []
    for (const spec of readImports(file)) {
      if (!spec.startsWith('.')) {
        const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
        if (!rule.packages.includes(pkg)) errors.push(`${rel(file)}: '${pkg}' 패키지는 ${myLayer} 계층에서 쓸 수 없습니다`)
        continue
      }
      const target = resolve(file, spec)
      if (!target) {
        errors.push(`${rel(file)}: '${spec}' 를 찾을 수 없습니다`)
        continue
      }
      const tLayer = layerOf(target)
      deps.push(target)
      if (tLayer === myLayer) {
        if (NO_SIBLINGS.has(myLayer) && target !== file) errors.push(`${rel(file)} → ${rel(target)}: ${myLayer} 끼리는 서로 가져올 수 없습니다`)
      } else if (!rule.may.includes(tLayer)) {
        errors.push(`${rel(file)} → ${rel(target)}: ${myLayer} 은(는) ${tLayer} 을(를) 가져올 수 없습니다`)
      }
      const priv = PRIVATE[tLayer]
      if (priv && !priv.includes(rel(file)) && myLayer !== tLayer) errors.push(`${rel(file)} → ${rel(target)}: ${tLayer} 는 ${priv.join(', ')} 만 가져올 수 있습니다`)
    }
    graph.set(file, deps)
  }

  // 순환 의존
  const state = new Map()
  const stack = []
  const cycle = (f) => {
    state.set(f, 1)
    stack.push(f)
    for (const d of graph.get(f) ?? []) {
      if (state.get(d) === 1) errors.push(`순환 의존: ${[...stack.slice(stack.indexOf(d)), d].map(rel).join(' → ')}`)
      else if (!state.has(d)) cycle(d)
    }
    stack.pop()
    state.set(f, 2)
  }
  for (const f of graph.keys()) if (!state.has(f)) cycle(f)

  // 도달할 수 없는 파일: main.jsx 에서 이어지지 않는 모듈(오류), 어디서도 쓰지 않는 정적 파일(경고)
  const reached = new Set()
  const visit = (f) => {
    if (reached.has(f)) return
    reached.add(f)
    for (const d of graph.get(f) ?? []) visit(d)
  }
  visit(path.join(SRC, ENTRY))
  const referenced = new Set()
  for (const file of code) for (const spec of readImports(file)) if (spec.startsWith('.')) { const t = resolve(file, spec); if (t) referenced.add(t) }
  for (const f of code) if (!reached.has(f)) errors.push(`${rel(f)}: ${ENTRY} 에서 이어지지 않는 모듈입니다(쓰지 않는 코드)`)
  for (const f of files) {
    if (/\.(jsx?|mjs|css)$/.test(f)) continue
    if (!referenced.has(f)) warnings.push(`${rel(f)}: 어디서도 가져오지 않는 파일입니다`)
  }
  return { errors, warnings, count: code.length }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { errors, warnings, count } = check()
  for (const w of warnings) console.log(`경고  ${w}`)
  for (const e of errors) console.log(`위반  ${e}`)
  console.log(`\n아키텍처 검사: 모듈 ${count}개, 위반 ${errors.length}건, 경고 ${warnings.length}건`)
  process.exit(errors.length ? 1 : 0)
}
