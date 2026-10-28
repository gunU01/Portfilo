// 공유 미리보기 이미지(public/og.png, 1200×630): 홈의 첫 화면을 그대로 찍습니다.
//   npm run build && npm run og   (화면이 바뀌면 다시 찍고, 다시 빌드해야 dist 에 들어갑니다)
import fs from 'node:fs'
import { launch } from './lib/browser.mjs'
import { startPreview } from './lib/server.mjs'
import { go } from './lib/site.mjs'

const server = await startPreview()
const browser = await launch()
// 1200×630 은 가로세로 비율이 1.9:1 입니다. 1800×945 로 열어 2/3 로 줄여 찍으면 소개 카드까지 한 화면에 들어옵니다.
const context = await browser.newContext({ viewport: { width: 1800, height: 945 }, deviceScaleFactor: 2 / 3, reducedMotion: 'reduce' })
const page = await context.newPage()
await go(page, server.url, '/')
await page.reload()
await page.waitForTimeout(1200)
fs.mkdirSync('public', { recursive: true })
await page.screenshot({ path: 'public/og.png' })
await context.close()
await browser.close()
server.stop()
console.log('public/og.png 를 저장했습니다')
