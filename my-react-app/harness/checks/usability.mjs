import assert from 'node:assert/strict'
import { openPage, VIEWPORTS } from '../lib/browser.mjs'
import { discoverCases, go, ready } from '../lib/site.mjs'

// UI 편의(사용하기 편한가) 검사. 모양이 아니라 '쓸 때 걸리는 것'을 기계로 잡습니다.
// 페이지 안에서 재는 함수는 모두 { 문제 목록 } 을 돌려주고, 아래 검사가 라우트마다 모아 한 번에 보고합니다.
// 기준 값은 파일 위쪽 LIMITS 한 곳에 모았습니다. 근거: 눌림 영역 24px 은 WCAG 2.2 의 2.5.8(최소 대상 크기), 글자 11px 은 이 사이트의 가장 작은 보조 글자입니다.
const LIMITS = {
  touchMin: 24, // 모바일에서 누르는 것의 짧은 변 최소(px). 문장 속 링크는 제외
  overlapMin: 16, // 눌림 영역끼리 겹친 면적이 이보다 크면 잘못 누르기 쉬움(px²)
  fontMin: 11, // 이보다 작은 글자는 읽기 어려움(px)
  stickyMax: 0.25, // 위에 붙어 다니는 것들(메뉴, 탭)이 화면 높이에서 차지할 수 있는 비율
  stickyAlphaMin: 0.95, // 위에 붙은 막대 배경의 불투명도. 이보다 투명하면 뒤로 지나가는 글이 비쳐 어지럽다
  boldBlockMin: 60, // 이 글자 수 이상의 문단 전체가 굵으면(600 이상) 읽기 힘들다
  orphanMax: 2, // 여러 줄 글의 마지막 줄에 이 글자 수 이하만 남으면 어색한 줄바꿈
}

// ---- 페이지 안에서 도는 측정 함수들(page.evaluate 로 보냅니다. 바깥 변수를 쓰지 않습니다) ----

// 눌림 영역: 화면에 보이는 링크, 버튼, 요약, 탭
const measureTargets = ({ touchMin, overlapMin, part }) => {
  const sel = 'a[href], button, summary, [role="tab"], [role="button"], input, select, textarea'
  const label = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : ''} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 16)}"`
  const els = [...document.querySelectorAll(sel)].filter((el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && el.getClientRects().length)
  // 문장 속 링크(앞뒤에 글이 이어짐)는 크기 예외입니다
  const inline = (el) => {
    if (el.tagName !== 'A' || getComputedStyle(el).display !== 'inline') return false
    const p = el.parentElement
    return [...p.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim().length > 0)
  }
  const small = []
  const rects = []
  for (const el of els) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    rects.push([el, r])
    if (!inline(el) && Math.min(r.width, r.height) < touchMin) small.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`)
  }
  const overlap = []
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const [a, ra] = rects[i]
      const [b, rb] = rects[j]
      if (a.contains(b) || b.contains(a)) continue
      const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left)
      const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top)
      if (w > 0 && h > 0 && w * h > overlapMin) overlap.push(`${label(a)} × ${label(b)} (${Math.round(w)}x${Math.round(h)})`)
    }
  }
  return part === 'overlap' ? overlap : part === 'count' ? [`count:${rects.length}`] : small
}

// 글자 크기: 글이 실제로 있는 요소의 크기
const measureFonts = ({ fontMin }) => {
  const out = new Map()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue
    const el = n.parentElement
    if (!el || el.closest('script, style, noscript, svg') || !el.checkVisibility()) continue
    const px = parseFloat(getComputedStyle(el).fontSize)
    if (px < fontMin) out.set(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`, `${px}px "${n.textContent.trim().slice(0, 14)}"`)
  }
  return [...out].map(([k, v]) => `${k} ${v}`)
}

// 위에 붙어 다니는 것(메뉴, 탭 등)의 합계 높이와 아래 가장자리
const measureSticky = () => {
  const found = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if ((cs.position === 'fixed' || cs.position === 'sticky') && el.checkVisibility()) {
      const r = el.getBoundingClientRect()
      // 화면 위쪽에 붙은 것만(top 근처에서 시작)
      if (r.height > 0 && r.top <= 90 && r.bottom > 0 && r.width > innerWidth * 0.5) {
        // 배경의 불투명도: rgba(r,g,b,a) 또는 color(... / a) 꼴에서 a 를 읽습니다(없으면 1)
        const bg = cs.backgroundColor
        const alpha = bg === 'transparent' ? 0 : Number((bg.match(/\/\s*([\d.]+)\s*\)/) ?? bg.match(/rgba\([^)]*,\s*([\d.]+)\)/))?.[1] ?? 1)
        found.push({ name: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`, bottom: r.bottom, height: r.height, alpha })
      }
    }
  }
  return found
}

// 긴 문단이 통째로 굵게 나오는지(굵은 글은 짧은 강조에만 씁니다)
const measureHeavy = ({ boldBlockMin }) => {
  const out = []
  for (const el of document.querySelectorAll('p, li, dd, td')) {
    if (!el.checkVisibility() || el.querySelector('p, li, td, table, ul')) continue
    const text = el.textContent.replace(/\s+/g, ' ').trim()
    if (text.length >= boldBlockMin && Number(getComputedStyle(el).fontWeight) >= 600) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${text.slice(0, 16)}…" (${text.length}자, 굵기 ${getComputedStyle(el).fontWeight})`)
  }
  return out
}

// 글: 여러 줄 글의 마지막 줄에 한두 글자만 남는지
const measureOrphans = ({ orphanMax }) => {
  const out = []
  for (const el of document.querySelectorAll('p, li, dd, td, h1, h2, h3, h4')) {
    // 안에 칸을 나눠 배치한(grid, flex) 부분이 있으면 글 한 덩이가 아니라서 제외합니다
    if (!el.checkVisibility() || el.querySelector('p, li, td, table, ul') || [el, ...el.querySelectorAll('*')].some((d) => ['grid', 'flex', 'inline-grid', 'inline-flex'].includes(getComputedStyle(d).display))) continue
    const text = el.textContent.replace(/\s+/g, ' ').trim()
    if (text.length < 12) continue
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const nodes = []
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent.trim()) nodes.push(n)
    if (!nodes.length) continue
    const charTops = []
    for (const n of nodes) {
      for (let i = 0; i < n.textContent.length; i++) {
        if (!n.textContent[i].trim()) continue
        const range = document.createRange()
        range.setStart(n, i)
        range.setEnd(n, i + 1)
        const r = range.getClientRects()[0]
        if (r && r.height) charTops.push(Math.round(r.top))
      }
    }
    if (charTops.length < 6) continue
    // '10명 중 6명' 아래에 '이상' 처럼 작은 보조 글자를 일부러 아래에 두는 경우는 제외합니다
    if (el.querySelector('small') && [...el.querySelectorAll('small')].some((sm) => sm.textContent.trim() && sm.getBoundingClientRect().top > el.getBoundingClientRect().top + 8)) continue
    const last = charTops[charTops.length - 1]
    if (charTops[0] >= last - 4) continue // 한 줄
    let count = 0
    for (let i = charTops.length - 1; i >= 0 && Math.abs(charTops[i] - last) <= 4; i--) count++
    if (count <= orphanMax) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} …${text.slice(-14)} (마지막 줄 ${count}글자)`)
  }
  return out
}

// 잘림: 넘치는 글을 숨기고 있는 요소(스크롤이나 접기 등 의도된 것은 제외)
const measureClipped = () => {
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    if (!el.checkVisibility()) continue
    const cs = getComputedStyle(el)
    const hideX = ['hidden', 'clip'].includes(cs.overflowX)
    const hideY = ['hidden', 'clip'].includes(cs.overflowY)
    if (!hideX && !hideY) continue
    // 의도해서 줄 수를 줄인 글(line-clamp)과 줄임표(…)는 제외합니다
    if (el.closest('svg, .is-folded, details:not([open]), .desk, [aria-hidden="true"]') || cs.textOverflow === 'ellipsis' || (cs.webkitLineClamp && cs.webkitLineClamp !== 'none')) continue
    if (!el.textContent.trim()) continue
    const overX = hideX && el.scrollWidth > el.clientWidth + 2
    const overY = hideY && el.scrollHeight > el.clientHeight + 2
    if (overX || overY) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${el.textContent.trim().slice(0, 14)}" (${overX ? `가로 ${el.scrollWidth}>${el.clientWidth}` : `세로 ${el.scrollHeight}>${el.clientHeight}`})`)
  }
  return out
}

// ---- 검사 ----

async function routesOf(page, url) {
  const cases = await discoverCases(page, url)
  const posts = await page.$$eval('.blog__item', (items) => items.map((a) => a.getAttribute('href').slice(1)))
  return ['/', '/project', '/about', ...cases.map((c) => c.route), ...posts]
}

// 모든 라우트에서 같은 측정을 돌리고, 문제를 라우트 이름과 함께 모읍니다.
async function sweep(page, url, routes, fn, arg) {
  const problems = []
  for (const route of routes) {
    await go(page, url, route)
    await ready(page)
    await page.waitForTimeout(350)
    const found = await page.evaluate(fn, arg)
    problems.push(...(Array.isArray(found) ? found : Object.values(found).flat()).map((p) => `${route}  ${p}`))
  }
  return problems
}

// 키보드로 Tab 을 눌러 가며: 포커스가 화면에 보이는 것에만 가고, 위에 붙은 메뉴 밑에 숨지 않고, 포커스 표시가 있는지
async function tabSweep(page, limit) {
  const problems = []
  const seen = []
  await page.evaluate(() => {
    window.scrollTo(0, 0)
    document.activeElement?.blur()
  })
  const sig = (el) => {
    const cs = getComputedStyle(el)
    return [cs.outlineStyle, cs.outlineWidth, cs.boxShadow, cs.backgroundColor, cs.color, cs.borderTopColor, cs.textDecorationLine, cs.opacity, cs.transform].join('|')
  }
  for (let i = 0; i < limit; i++) {
    await page.keyboard.press('Tab')
    await page.waitForTimeout(40)
    const info = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const cs = getComputedStyle(el)
      const r = el.getBoundingClientRect()
      const nav = document.querySelector('.nav')?.getBoundingClientRect().bottom ?? 0
      const name = `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : ''} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 14)}"`
      const hasOutline = cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px'
      return { name, visible: el.checkVisibility() && r.width > 0, underNav: !el.closest('.nav, .skip') && r.top < nav - 1 && r.bottom > 0, offBottom: r.top >= innerHeight, hasOutline, key: el.outerHTML.slice(0, 120) }
    })
    if (!info) break
    if (seen.some((x) => x.key === info.key)) break // 한 바퀴를 돌았음
    seen.push(info)
    if (!info.visible) problems.push(`${info.name}: 보이지 않는 곳으로 포커스가 감`)
    if (info.underNav) problems.push(`${info.name}: 위에 붙은 메뉴 밑에 가려짐`)
    if (info.offBottom) problems.push(`${info.name}: 포커스가 화면 밖에 있음`)
    if (!info.hasOutline) {
      const handle = await page.evaluateHandle(() => document.activeElement)
      const focused = await handle.evaluate(sigSrc, null)
      await handle.evaluate((el) => el.blur())
      const plain = await handle.evaluate(sigSrc, null)
      if (focused === plain) problems.push(`${info.name}: 포커스 표시가 없음`)
      await handle.evaluate((el) => el.focus({ preventScroll: true }))
    }
  }
  return { problems, count: seen.length }
}
// page.evaluate 에 보낼 수 있게 문자열이 아닌 함수로 따로 둡니다(바깥 변수를 쓰지 않음)
function sigSrc(el) {
  const cs = getComputedStyle(el)
  return [cs.outlineStyle, cs.outlineWidth, cs.boxShadow, cs.backgroundColor, cs.color, cs.borderTopColor, cs.textDecorationLine, cs.opacity, cs.transform].join('|')
}

export default {
  name: 'usability',
  about: 'UI 편의: 눌림 영역 크기와 겹침, 너무 작은 글자, 통째로 굵은 긴 문단, 어색한 줄바꿈, 잘린 글, 위에 붙은 것이 가리는 정도, 키보드 이동과 포커스 표시',
  async run({ browser, url, t }) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      const { page, context } = await openPage(browser, { viewport, reducedMotion: 'reduce' })
      const routes = await routesOf(page, url)

      if (vpName === 'mobile') {
        await t(`${vpName} 눌림 영역: 짧은 변이 ${LIMITS.touchMin}px 이상(문장 속 링크 제외)`, async () => {
          const counts = await sweep(page, url, routes, measureTargets, { ...LIMITS, part: 'count' })
          assert.ok(counts.length === routes.length && counts.every((c) => Number(c.match(/count:(\d+)/)[1]) >= 3), '눌림 영역을 제대로 찾지 못했습니다(측정이 비어 있음)')
          assert.deepEqual(await sweep(page, url, routes, measureTargets, { ...LIMITS, part: 'small' }), [])
        })
      }
      await t(`${vpName} 눌림 영역: 서로 겹치지 않는다`, async () => {
        assert.deepEqual(await sweep(page, url, routes, measureTargets, { ...LIMITS, part: 'overlap' }), [])
      })
      await t(`${vpName} 글자 크기: ${LIMITS.fontMin}px 보다 작은 글자가 없다`, async () => {
        assert.deepEqual(await sweep(page, url, routes, measureFonts, LIMITS), [])
      })
      await t(`${vpName} 줄바꿈: 여러 줄 글의 마지막 줄에 ${LIMITS.orphanMax}글자 이하만 남지 않는다`, async () => {
        assert.deepEqual(await sweep(page, url, routes, measureOrphans, LIMITS), [])
      })
      await t(`${vpName} 굵기: ${LIMITS.boldBlockMin}자 이상의 문단이 통째로 굵지 않다`, async () => {
        assert.deepEqual(await sweep(page, url, routes, measureHeavy, LIMITS), [])
      })
      await t(`${vpName} 잘림: 넘치는 글을 숨기고 있는 요소가 없다`, async () => {
        assert.deepEqual(await sweep(page, url, routes, measureClipped), [])
      })
      await t(`${vpName} 고정 요소: 위에 붙어 다니는 것이 화면 높이의 ${LIMITS.stickyMax * 100}% 를 넘지 않는다`, async () => {
        const bad = []
        for (const route of routes) {
          await go(page, url, route)
          await ready(page)
          const total = (await page.evaluate(measureSticky)).reduce((sum, s) => sum + s.height, 0)
          if (total > viewport.height * LIMITS.stickyMax) bad.push(`${route} ${Math.round(total)}px / ${viewport.height}px`)
        }
        assert.deepEqual(bad, [])
      })
      await t(`${vpName} 고정 요소: 배경이 ${LIMITS.stickyAlphaMin * 100}% 이상 불투명해서 뒤의 글이 비치지 않는다`, async () => {
        const bad = []
        for (const route of routes) {
          await go(page, url, route)
          await ready(page)
          for (const s of await page.evaluate(measureSticky)) if (s.alpha < LIMITS.stickyAlphaMin) bad.push(`${route} ${s.name} 불투명도 ${s.alpha}`)
        }
        assert.deepEqual(bad, [])
      })
      await t(`${vpName} 키보드: Tab 으로 도는 동안 포커스 표시가 있고 메뉴 밑에 숨지 않는다`, async () => {
        const problems = []
        for (const route of ['/', '/project', '/about', routes.find((r) => r.startsWith('/work/')), routes.find((r) => r.startsWith('/blog/'))]) {
          await go(page, url, route)
          await ready(page)
          await page.waitForTimeout(300)
          const { problems: found, count } = await tabSweep(page, 120)
          if (count < 4) problems.push(`${route}: Tab 으로 갈 수 있는 곳이 ${count}곳뿐`)
          problems.push(...found.map((p) => `${route}  ${p}`))
        }
        assert.deepEqual(problems, [])
      })
      await t(`${vpName} 목차: 눌러서 이동한 제목이 위에 붙은 메뉴 밑에 가리지 않는다`, async () => {
        const bad = []
        for (const route of routes.filter((r) => r.startsWith('/work/') || r.startsWith('/blog/'))) {
          await go(page, url, route)
          await ready(page)
          await page.waitForSelector('.toc button')
          const n = await page.locator('.toc button').count()
          for (let i = 1; i < n; i++) {
            await page.locator('.toc button').nth(i).evaluate((b) => b.click())
            let prev = -1
            for (let k = 0; k < 40; k++) {
              await page.waitForTimeout(100)
              const y = await page.evaluate(() => scrollY)
              if (y === prev) break
              prev = y
            }
            const { top, nav } = await page.evaluate((idx) => {
              const sections = document.querySelectorAll('.csec')
              return { top: sections[idx].querySelector('.csec__title').getBoundingClientRect().top, nav: [...document.querySelectorAll('.nav, .pj__tabs, .toc')].filter((e) => ['fixed', 'sticky'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().width > innerWidth * 0.5).reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0) }
            }, i)
            if (top < nav - 1) bad.push(`${route} 섹션 ${i + 1}: 제목이 ${Math.round(nav - top)}px 가려짐`)
          }
        }
        assert.deepEqual(bad, [])
      })
      await context.close()
    }
  },
}
