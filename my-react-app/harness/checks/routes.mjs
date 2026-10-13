import assert from 'node:assert/strict'
import { openPage, VIEWPORTS } from '../lib/browser.mjs'

const BASE = '문채원 포트폴리오 사이트'

export default {
  name: 'routes',
  about: '모든 라우트가 오류 없이 열리고, 제목과 푸터가 맞고, 가로로 넘치지 않는다',
  async run({ browser, url, t }) {
    for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
      const { page, context, errors } = await openPage(browser, { viewport })

      // 케이스 라우트는 프로젝트 목록의 카드에서 찾습니다(새 케이스가 생겨도 자동으로 검사됩니다).
      await page.goto(`${url}/#/project`)
      await page.waitForSelector('.pcard')
      const cases = await page.$$eval('.pcard', (cards) => cards.map((c) => [c.getAttribute('href').slice(1), c.querySelector('h2').textContent]))
      assert.ok(cases.length > 0, '프로젝트 카드가 없습니다')

      const routes = [
        ['/', BASE, true],
        ['/project', `Project — ${BASE}`, true],
        ['/about', `About — ${BASE}`, true],
        ['/desk', `책상 — ${BASE}`, false],
        ...cases.map(([route, title]) => [route, `${title} — ${BASE}`, true]),
        ['/work/없는-케이스', BASE, true], // 알 수 없는 경로는 홈으로
      ]

      for (const [route, title, footer] of routes) {
        await t(`${vpName} ${route}`, async () => {
          const before = errors.length
          await page.goto(`${url}/#${route}`)
          await page.waitForSelector('main#main *')
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
