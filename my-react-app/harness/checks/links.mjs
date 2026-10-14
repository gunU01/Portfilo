import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { deskLabels, discoverCases, go, ready } from '../lib/site.mjs'

export default {
  name: 'links',
  about: '사이트 안의 모든 내부 링크가 실제 페이지와 섹션으로 이어지고, 바깥 링크는 안전하게 열린다',
  async run({ browser, url, t, base }) {
    const { page, context } = await openPage(browser)
    const internal = new Map() // href → 어디서 발견했는지
    const external = []

    const collect = async (where) => {
      const links = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.getAttribute('href'), target: a.target, rel: a.rel })))
      for (const l of links) {
        if (l.href.startsWith('#/')) internal.set(l.href, internal.get(l.href) ?? where)
        else if (/^https?:|^mailto:|^tel:/.test(l.href)) external.push({ ...l, where })
      }
    }

    const cases = await discoverCases(page, url)
    for (const route of ['/', '/project', '/about', ...cases.map((c) => c.route)]) {
      await go(page, url, route)
      await ready(page)
      await collect(route)
    }
    // 책상: 물건마다 패널을 열어 안의 링크를 모읍니다.
    for (const label of await deskLabels(page, url)) {
      await page.click(`[aria-label="${label}"]`, { force: true })
      await page.waitForSelector('.desk__panel')
      await collect(`책상 / ${label}`)
      await page.keyboard.press('Escape')
    }

    assert.ok(internal.size > 0, '내부 링크를 하나도 찾지 못했습니다')
    for (const [href, where] of internal) {
      await t(`내부 링크 ${href}  (${where})`, async () => {
        await page.goto(`${url}/${href}`)
        await ready(page)
        const [route, query = ''] = href.slice(1).split('?')
        if (route.startsWith('/work/')) assert.ok((await page.title()).includes(' — '), '존재하지 않는 케이스입니다(홈으로 빠짐)')
        const section = new URLSearchParams(query).get('s')
        if (section) await waitFor(() => page.locator(`#${section}`).count(), { message: `#${section} 섹션이 없습니다` })
        assert.ok((await page.title()).includes(base))
      })
    }

    await t(`바깥 링크 ${external.length}개: 새 탭에서 열리고 rel=noreferrer`, async () => {
      const bad = external.filter((l) => /^https?:/.test(l.href) && !(l.target === '_blank' && /noreferrer/.test(l.rel)))
      assert.deepEqual(bad.map((l) => `${l.href} (${l.where})`), [])
    })
    await context.close()
  },
}
