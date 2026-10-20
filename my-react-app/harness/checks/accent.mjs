import assert from 'node:assert/strict'
import { openPage } from '../lib/browser.mjs'
import { go, ready } from '../lib/site.mjs'

// 케이스 데이터의 accent 값에 따라 페이지 전체의 포인트 색이 바뀌고, 다른 페이지로 가면 파랑으로 돌아오는지 확인합니다.
const CASES = [
  ['/work/haemi', 'orange', '#ea580c'],
  ['/work/sosang', 'green', '#65a30d'],
  ['/work/howmuch', null, '#2563eb'],
]

const accentOf = (page) => page.evaluate(() => ({ attr: document.documentElement.dataset.accent ?? null, value: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toLowerCase() }))

export default {
  name: 'accent',
  about: '케이스별 포인트 색: 해미는 주황, 동네 사장님 5분 홍보는 연두, 나머지는 파랑이고, 목록 카드도 같은 색을 쓴다',
  async run({ browser, url, t }) {
    const { page } = await openPage(browser)

    for (const [route, accent, color] of CASES) {
      await t(`${route}: 포인트 색이 ${accent ?? '기본(파랑)'}(${color})이다`, async () => {
        await go(page, url, route)
        await ready(page)
        const got = await accentOf(page)
        assert.equal(got.attr, accent)
        assert.equal(got.value, color)
        const nav = await page.evaluate(() => getComputedStyle(document.querySelector('.nav__pill')).backgroundColor)
        assert.ok(nav, '메뉴 알약이 있어야 합니다')
      })
    }

    await t('케이스에서 나오면 기본 파랑으로 돌아온다', async () => {
      await go(page, url, '/work/haemi')
      await ready(page)
      await go(page, url, '/project')
      await ready(page)
      const got = await accentOf(page)
      assert.equal(got.attr, null)
      assert.equal(got.value, '#2563eb')
    })

    await t('프로젝트 목록: 카드마다 자기 케이스의 포인트 색을 쓴다', async () => {
      await go(page, url, '/project')
      await ready(page)
      const cards = await page.$$eval('.pcard', (els) =>
        els.map((el) => ({ href: el.getAttribute('href'), accent: el.dataset.accent ?? null, value: getComputedStyle(el).getPropertyValue('--accent').trim().toLowerCase() })),
      )
      const by = Object.fromEntries(cards.map((c) => [c.href, c]))
      assert.equal(by['#/work/haemi'].value, '#ea580c')
      assert.equal(by['#/work/sosang'].value, '#65a30d')
      assert.equal(by['#/work/howmuch'].value, '#2563eb')
    })
  },
}
