import fs from 'node:fs'
import { chromium } from 'playwright'

// 브라우저 위치: CHROMIUM_PATH 환경 변수 > 알려진 설치 위치 > playwright 가 받은 브라우저(npx playwright install chromium)
const KNOWN = ['/opt/pw-browsers/chromium']

export async function launch() {
  const executablePath = process.env.CHROMIUM_PATH || KNOWN.find((p) => fs.existsSync(p))
  const root = typeof process.getuid === 'function' && process.getuid() === 0
  return chromium.launch({ executablePath, args: root ? ['--no-sandbox'] : [] })
}

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 800 },
}

// 페이지를 열고, 콘솔 오류와 예외를 모아 둡니다. 모션 줄이기를 켜서 화면이 흔들리지 않게 할 수 있습니다.
export async function openPage(browser, { viewport = VIEWPORTS.desktop, reducedMotion = 'no-preference' } = {}) {
  const context = await browser.newContext({ viewport, reducedMotion })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  // 페이지를 옮기다 끊긴 요청(ERR_ABORTED)은 오류로 보지 않습니다.
  page.on('requestfailed', (r) => !/ERR_ABORTED/.test(r.failure()?.errorText ?? '') && errors.push(`requestfailed: ${r.url()}`))
  return { page, context, errors }
}

export async function waitFor(fn, { timeout = 4000, interval = 100, message = '조건이 충족되지 않았습니다' } = {}) {
  const start = Date.now()
  let last
  while (Date.now() - start < timeout) {
    last = await fn()
    if (last) return last
    await new Promise((r) => setTimeout(r, interval))
  }
  throw new Error(`${message} (${timeout}ms)`)
}
