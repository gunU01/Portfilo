import assert from 'node:assert/strict'
import { openPage } from '../lib/browser.mjs'
import { discoverCases, go, ready } from '../lib/site.mjs'

// 대비를 일부러 낮춘 곳(사용자가 정한 디자인). 여기에 적은 것만 검사에서 빠집니다. 늘릴 때는 이유를 적으세요.
const EXEMPT = [
  '.ab__text strong', // 소개 강조: 밝은 파랑을 쓰기로 정함(대비 3.2)
]

// 브라우저 안에서 도는 코드: 보이는 글자마다 글자색과 배경색의 대비를 계산해 기준(일반 4.5, 큰 글씨 3)에 못 미치는 것을 모읍니다.
function findLowContrast(exempt) {
  const parse = (c) => {
    let m = c.match(/^rgba?\(([^)]+)\)$/)
    if (m) {
      const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
      return { r, g, b, a }
    }
    m = c.match(/^color\(srgb ([^)]+)\)$/)
    if (m) {
      const [r, g, b, a = 1] = m[1].split(/[\s/]+/).filter(Boolean).map(Number)
      return { r: r * 255, g: g * 255, b: b * 255, a }
    }
    return null
  }
  const over = (top, bottom) => {
    const a = top.a + bottom.a * (1 - top.a)
    const mix = (k) => (top[k] * top.a + bottom[k] * bottom.a * (1 - top.a)) / (a || 1)
    return { r: mix('r'), g: mix('g'), b: mix('b'), a }
  }
  const lum = ({ r, g, b }) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }

  const found = new Map()
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg, [aria-hidden="true"]') || exempt.some((s) => el.matches(s))) continue
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
    if (!own) continue
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    if (cs.visibility === 'hidden' || cs.display === 'none' || !rect.width || !rect.height) continue
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') continue // 그라데이션 글자는 따로 봅니다

    // 배경: 위로 올라가며 겹쳐 쌓습니다. 그라데이션이나 이미지 배경이 나오면 계산할 수 없어 건너뜁니다.
    const layers = []
    let opacity = 1
    let unknown = false
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n)
      opacity *= Number(s.opacity)
      if (s.backgroundImage !== 'none') {
        unknown = true
        break
      }
      const bg = parse(s.backgroundColor)
      if (!bg) {
        unknown = true
        break
      }
      if (bg.a > 0) layers.push(bg)
      if (bg.a === 1) break
    }
    if (unknown) continue
    let bg = { r: 255, g: 255, b: 255, a: 1 }
    for (const layer of layers.reverse()) bg = over(layer, bg)
    const fg0 = parse(cs.color)
    if (!fg0) continue
    const fg = over({ ...fg0, a: fg0.a * opacity }, bg)

    const size = parseFloat(cs.fontSize)
    const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700)
    const need = large ? 3 : 4.5
    const got = ratio(fg, bg)
    if (got + 0.005 >= need) continue
    const id = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : ''}`
    const key = `${id}|${cs.color}|${cs.backgroundColor}`
    if (!found.has(key)) found.set(key, `${id}  "${el.textContent.trim().slice(0, 24)}"  ${got.toFixed(2)} (필요 ${need})`)
  }
  return [...found.values()]
}

export default {
  name: 'a11y',
  about: '글자와 배경의 대비가 기준(일반 4.5, 큰 글씨 3)을 넘고, 이미지에 대체 텍스트가 있고, 버튼에 이름이 있다',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser, { reducedMotion: 'reduce' }) // 등장 효과 중간 상태를 피함
    const cases = await discoverCases(page, url)

    for (const route of ['/', '/project', '/about', ...cases.map((c) => c.route)]) {
      await t(`글자 대비 ${route}`, async () => {
        await go(page, url, route)
        await ready(page)
        await page.waitForTimeout(400)
        assert.deepEqual(await page.evaluate(findLowContrast, EXEMPT), [])
      })
    }

    await t('글자 대비 책상 패널(모든 물건)', async () => {
      await go(page, url, '/desk')
      await page.waitForSelector('.hs')
      const problems = []
      for (const label of await page.$$eval('.hs', (els) => els.map((e) => e.getAttribute('aria-label')))) {
        await page.click(`[aria-label="${label}"]`, { force: true })
        await page.waitForSelector('.desk__panel')
        problems.push(...(await page.evaluate(findLowContrast, EXEMPT)).map((p) => `${label}: ${p}`))
        await page.keyboard.press('Escape')
      }
      assert.deepEqual(problems, [])
    })

    for (const route of ['/', '/about', '/desk', ...cases.map((c) => c.route)]) {
      await t(`이미지 대체 텍스트와 버튼 이름 ${route}`, async () => {
        await go(page, url, route)
        await ready(page)
        const bad = await page.evaluate(() => {
          const out = []
          for (const img of document.querySelectorAll('img')) if (!img.hasAttribute('alt') && img.getAttribute('aria-hidden') !== 'true' && img.closest('[aria-hidden="true"]') === null) out.push(`img ${img.getAttribute('src')?.slice(-30)}: alt 없음`)
          for (const b of document.querySelectorAll('button, [role="button"], a[href]')) {
            const name = (b.getAttribute('aria-label') || b.textContent || '').trim()
            if (!name) out.push(`${b.tagName.toLowerCase()}${b.className ? `.${b.className}` : ''}: 이름 없음`)
          }
          return out
        })
        assert.deepEqual(bad, [])
      })
    }
    await context.close()
  },
}
