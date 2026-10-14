// 화면 스냅샷: 모든 페이지와 책상 패널을 PC·모바일로 찍어 폴더에 저장합니다. 리팩터링 전후를 비교할 때 씁니다.
//   npm run build && npm run snap -- harness/out/before
//   (코드 수정 후) npm run build && npm run snap -- harness/out/after
//   npm run snap:diff -- harness/out/before harness/out/after
import fs from 'node:fs'
import path from 'node:path'
import { launch, openPage, VIEWPORTS } from './lib/browser.mjs'
import { parseArgs } from './lib/args.mjs'
import { startPreview } from './lib/server.mjs'
import { deskLabels, discoverCases, go } from './lib/site.mjs'

const { positional: [out] } = parseArgs()
if (!out) {
  console.error('사용법: npm run snap -- <저장할 폴더>')
  process.exit(2)
}
fs.mkdirSync(out, { recursive: true })

const server = await startPreview()
const browser = await launch()
const name = (s) => s.replace(/[^\w가-힣-]+/g, '_').replace(/^_|_$/g, '') || 'home'

for (const [vp, viewport] of Object.entries(VIEWPORTS)) {
  const { page, context } = await openPage(browser, { viewport, reducedMotion: 'reduce' })
  const cases = (await discoverCases(page, server.url)).map((c) => c.route)
  for (const route of ['/', '/project', '/about', '/desk', ...cases]) {
    await go(page, server.url, route)
    await page.reload()
    await page.waitForTimeout(1200)
    await page.screenshot({ path: path.join(out, `${vp}-${name(route)}.png`), fullPage: true })
  }
  for (const label of await deskLabels(page, server.url)) {
    await page.reload()
    await page.click(`[aria-label="${label}"]`, { force: true })
    await page.waitForTimeout(1200) // 호버 전환이 끝나기를 기다립니다
    await page.screenshot({ path: path.join(out, `${vp}-desk-${name(label)}.png`) })
    await page.keyboard.press('Escape')
  }
  await context.close()
}
await browser.close()
server.stop()
console.log(`${fs.readdirSync(out).filter((f) => f.endsWith('.png')).length}장을 ${out} 에 저장했습니다`)
