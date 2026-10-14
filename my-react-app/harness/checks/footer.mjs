import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go, ready } from '../lib/site.mjs'

export default {
  name: 'footer',
  about: '푸터의 복사 아이콘: 이메일과 전화번호가 복사되고, 좁은 화면에서도 값 글자나 화살표와 겹치지 않는다',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser, { permissions: ['clipboard-read', 'clipboard-write'] })

    await t('푸터 복사 아이콘: 이메일과 전화번호가 클립보드에 복사되고 잠시 체크로 바뀐다', async () => {
      await go(page, url, '/')
      await ready(page)
      const row = page.locator('.footer__rows li', { hasText: 'Email' })
      await row.scrollIntoViewIfNeeded()
      const expected = (await row.locator('.footer__v').textContent()).trim()
      const copy = row.locator('.footer__copy')
      assert.equal(await copy.getAttribute('aria-label'), 'Email 복사')
      assert.equal((await copy.textContent()).trim(), '', '글자 없이 아이콘만 있어야 합니다')
      await copy.click()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected)
      assert.equal(await copy.getAttribute('data-copied'), 'true')
      await waitFor(async () => (await copy.getAttribute('data-copied')) === null, { timeout: 3000, message: '복사됨 표시가 사라지지 않았습니다' })
      assert.equal(await page.locator('.footer__rows li', { hasText: 'GitHub' }).locator('.footer__copy').count(), 0, 'GitHub 줄에는 복사 아이콘이 없어야 합니다')
    })

    for (const width of [320, 340, 360, 390]) {
      await t(`푸터 복사 아이콘: 폭 ${width}px 에서 값 글자나 화살표와 겹치지 않고, 줄마다 화살표가 같은 위치`, async () => {
        const m = await openPage(browser, { viewport: { width, height: 800 } })
        await go(m.page, url, '/')
        await ready(m.page)
        const rows = await m.page.$$eval('.footer__rows li', (lis) =>
          lis.map((li) => {
            const r = (el) => el.getBoundingClientRect().toJSON()
            const range = document.createRange()
            range.selectNodeContents(li.querySelector('.footer__v'))
            const copy = li.querySelector('.footer__copy')
            return { name: li.querySelector('.footer__k').textContent, copy: copy && r(copy), text: range.getBoundingClientRect().toJSON(), arrow: r(li.querySelector('.footer__go')) }
          }),
        )
        const overlap = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
        for (const row of rows) {
          if (!row.copy) continue
          assert.ok(!overlap(row.copy, row.text), `${row.name}: 값 글자와 겹칩니다`)
          assert.ok(!overlap(row.copy, row.arrow), `${row.name}: 화살표와 겹칩니다`)
          assert.ok(row.copy.width >= 24 && row.copy.height >= 24, `${row.name}: 누르기에 너무 작습니다`)
        }
        const arrows = new Set(rows.map((row) => Math.round(row.arrow.right)))
        assert.equal(arrows.size, 1, `화살표 위치가 줄마다 다릅니다: ${[...arrows]}`)
        const [sw, cw] = await m.page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
        assert.ok(sw <= cw, `가로로 넘칩니다 (${sw} > ${cw})`)
        await m.context.close()
      })
    }
    await context.close()
  },
}
