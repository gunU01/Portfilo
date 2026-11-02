import assert from 'node:assert/strict'
import { openPage, VIEWPORTS } from '../lib/browser.mjs'
import { discoverCases, go, ready } from '../lib/site.mjs'

export default {
  name: 'routes',
  about: '모든 라우트가 오류 없이 열리고, 제목과 푸터가 맞고, 가로로 넘치지 않는다',
  async run({ browser, url, t, base }) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      const { page, context, errors } = await openPage(browser, { viewport })
      const cases = await discoverCases(page, url)
      assert.ok(cases.length > 0, '프로젝트 카드가 없습니다')
      // 블로그 글도 프로젝트 목록 아래의 링크에서 찾습니다
      const posts = await page.$$eval('.blog__item', (items) => items.map((a) => ({ route: a.getAttribute('href').slice(1), title: a.querySelector('.blog__name').textContent.trim() })))
      assert.ok(posts.length > 0, '블로그 글이 없습니다')

      // [경로, 기대하는 제목, 푸터가 있어야 하는지]
      const routes = [
        ['/', base, true],
        ['/project', `Project — ${base}`, true],
        ['/about', `About — ${base}`, true],
        ['/desk', `책상 — ${base}`, false],
        ...cases.map(({ route, title }) => [route, `${title} — ${base}`, true]),
        ['/work/없는-케이스', `Project — ${base}`, true], // 없는 케이스는 목록으로
        ...posts.map(({ route, title }) => [route, `${title} — ${base}`, true]),
        ['/blog/없는-글', `Project — ${base}`, true], // 없는 글도 목록으로
      ]

      for (const [route, title, footer] of routes) {
        await t(`${vpName} ${route}`, async () => {
          const before = errors.length
          await go(page, url, route)
          await ready(page)
          await page.waitForTimeout(300)
          assert.equal(await page.title(), title)
          assert.equal(await page.locator('footer.footer').count(), footer ? 1 : 0, '푸터 표시 여부')
          const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
          assert.ok(sw <= cw, `가로로 넘칩니다 (${sw} > ${cw})`)
          assert.ok(await page.evaluate(() => document.fonts.check('16px NanumSquareNeo')), '나눔스퀘어 네오가 로드되지 않았습니다')
          assert.deepEqual(errors.slice(before), [], '브라우저 오류')
        })
      }
      await context.close()
    }
  },
}
