// 사용법: node planning/harness/build.mjs [프로젝트] [--check]
// 모델에서 문서를 만들어 projects/<이름>/docs, reports 아래에 씁니다.
// --check 는 쓰지 않고, 파일이 최신이 아니면 종료 코드 1 (문서를 직접 고쳤거나 build 를 잊은 경우를 잡습니다).
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { listProjects, loadModel, projectDir } from './lib.mjs'
import { renderAll } from './render.mjs'

const args = process.argv.slice(2)
const check = args.includes('--check')
const name = args.find((a) => !a.startsWith('--')) ?? listProjects()[0]
const model = await loadModel(name)
const files = renderAll(model)

let stale = 0
for (const [rel, content] of Object.entries(files)) {
  const file = join(projectDir(name), rel)
  const body = content.endsWith('\n') ? content : `${content}\n`
  if (check) {
    if (!existsSync(file) || readFileSync(file, 'utf8') !== body) {
      console.log(`  최신이 아님: ${rel}`)
      stale += 1
    }
  } else {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, body)
  }
}
if (check) {
  console.log(stale === 0 ? `문서 ${Object.keys(files).length}개가 모델과 일치합니다` : `\n문서 ${stale}개가 모델과 다릅니다. npm run plan:build 를 실행하세요`)
  process.exit(stale === 0 ? 0 : 1)
}
console.log(`문서 ${Object.keys(files).length}개를 만들었습니다 → planning/projects/${name}/`)
