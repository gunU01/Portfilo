// 검증 하네스: 빌드된 사이트(dist)를 실제 브라우저로 열어 라우트, 링크, 상호작용, 공유 정보를 확인합니다.
//   npm run build && npm run e2e
//   npm run e2e -- --only desk          특정 검사만
//   npm run e2e -- --url http://localhost:5173   이미 떠 있는 서버 사용
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch } from './lib/browser.mjs'
import { startPreview } from './lib/server.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const only = opt('only')

const files = fs.readdirSync(path.join(HERE, 'checks')).filter((f) => f.endsWith('.mjs')).sort()
const checks = []
for (const f of files) {
  const mod = await import(`./checks/${f}`)
  if (!only || mod.default.name === only) checks.push(mod.default)
}
if (!checks.length) {
  console.error(`'${only}' 검사를 찾지 못했습니다. 있는 검사: ${files.map((f) => f.replace('.mjs', '')).join(', ')}`)
  process.exit(2)
}

let server
let url = opt('url')
if (!url) {
  if (!fs.existsSync(path.join(HERE, '..', 'dist'))) {
    console.error('dist 가 없습니다. 먼저 npm run build 를 실행하세요.')
    process.exit(2)
  }
  server = await startPreview()
  url = server.url
}
const browser = await launch()

let passed = 0
const failed = []
for (const check of checks) {
  console.log(`\n■ ${check.name} — ${check.about}`)
  // t: 항목 하나. 실패해도 다음 항목을 계속 돕니다.
  const t = async (title, fn) => {
    try {
      await fn()
      passed += 1
      console.log(`  ✓ ${title}`)
    } catch (e) {
      failed.push(`${check.name} / ${title}: ${e.message}`)
      console.log(`  ✗ ${title}\n      ${e.message.split('\n').join('\n      ')}`)
    }
  }
  try {
    await check.run({ browser, url, t })
  } catch (e) {
    failed.push(`${check.name}: ${e.message}`)
    console.log(`  ✗ (검사 자체가 중단됨) ${e.message}`)
  }
}

await browser.close()
server?.stop()
console.log(`\n통과 ${passed}건, 실패 ${failed.length}건`)
if (failed.length) {
  console.log(failed.map((f) => `  - ${f}`).join('\n'))
  process.exit(1)
}
