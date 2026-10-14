import assert from 'node:assert/strict'
import { openPage, VIEWPORTS } from '../lib/browser.mjs'
import { go } from '../lib/site.mjs'

export default {
  name: 'skills',
  about: '소개 페이지의 기술 도식: 마디와 칩 선택, 방향키 이동, 모바일에서는 설명이 항상 펼쳐짐',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser)
    await go(page, url, '/about')
    await page.waitForSelector('.skflow__node')
    const selectedId = () => page.locator('.skflow__node[aria-selected="true"]').getAttribute('id')

    await t('마디를 고르면 설명 제목이 선택한 마디와 같다', async () => {
      await page.locator('.skflow__node').nth(4).click()
      assert.equal(await page.locator('.skflow__panel b').textContent(), await page.locator('.skflow__node[aria-selected="true"] .skflow__name').textContent())
    })
    await t('방향키: 처음에서 왼쪽으로 가면 마지막으로, Home 은 처음으로', async () => {
      const last = (await page.locator('.skflow__node').count()) - 1
      await page.locator('.skflow__node').nth(0).click()
      await page.keyboard.press('ArrowLeft')
      assert.equal(await selectedId(), `skflow-tab-${last}`)
      await page.keyboard.press('Home')
      assert.equal(await selectedId(), 'skflow-tab-0')
      await page.keyboard.press('End')
      assert.equal(await selectedId(), `skflow-tab-${last}`)
    })
    await t('도구 칩: 고르면 aria-selected 와 설명이 따라온다', async () => {
      const chips = page.locator('.skstack').first().locator('.skstack__chip')
      await chips.nth(1).click()
      assert.equal(await chips.nth(1).getAttribute('aria-selected'), 'true')
      assert.equal(await chips.nth(0).getAttribute('aria-selected'), 'false')
      assert.ok((await page.locator('.skstack__desc').first().textContent()).length > 0)
    })
    await context.close()

    const mobile = await openPage(browser, { viewport: VIEWPORTS.mobile })
    await go(mobile.page, url, '/about')
    await mobile.page.waitForSelector('.skflow__node')
    await t('모바일: 모든 마디의 설명이 보이고, 고르는 패널은 숨겨진다', async () => {
      const inline = await mobile.page.$$eval('.skflow__inline', (ps) => ps.map((p) => p.offsetParent !== null && p.textContent.length > 0))
      assert.ok(inline.length > 0 && inline.every(Boolean), '설명이 보이지 않는 마디가 있습니다')
      assert.equal(await mobile.page.locator('.skflow__panel').isVisible(), false)
    })
    await mobile.context.close()
  },
}
