import assert from 'node:assert/strict'
import { openPage, waitFor, VIEWPORTS } from '../lib/browser.mjs'
import { go } from '../lib/site.mjs'

export default {
  name: 'skills',
  about: '소개 페이지의 기술 도식: 단계 선택과 방향키 이동, 묶음 카드 아래의 도구, 도구를 고르면 쓴 단계가 켜짐, 모바일에서는 고른 단계의 설명만 펼쳐짐',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser)
    await go(page, url, '/about')
    await page.waitForSelector('.skflow__node')
    const selectedId = () => page.locator('.skflow__node[aria-selected="true"]').getAttribute('id')

    await t('단계를 고르면 설명 제목이 선택한 단계와 같다', async () => {
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
    await t('묶음 카드마다 그 묶음에서 쓴 도구가 붙고, 도구를 쓰지 않은 묶음에는 붙지 않는다', async () => {
      const chips = await page.$$eval('.skflow__phase', (ps) => ps.map((p) => p.querySelectorAll('.sktools__chip').length))
      assert.ok(chips.length >= 2 && chips.some((n) => n > 0), '도구가 붙은 묶음이 없습니다')
    })
    await t('도구를 고르면 aria-pressed 가 바뀌고, 그 도구를 쓴 단계만 켜지며, 다시 누르면 풀린다', async () => {
      const chips = page.locator('.sktools__chip')
      const notion = chips.filter({ hasText: 'Notion' }).first()
      await notion.click()
      assert.equal(await notion.getAttribute('aria-pressed'), 'true')
      const hit = await page.locator('.skflow__step.is-hit').count()
      const dim = await page.locator('.skflow__step.is-dim').count()
      const total = await page.locator('.skflow__step').count()
      assert.ok(hit >= 1 && hit + dim === total, `켜진 단계 ${hit}, 흐린 단계 ${dim}, 전체 ${total}`)
      assert.ok((await page.locator('.sktools__desc').textContent()).length > 0, '도구 설명이 나오지 않았습니다')
      assert.equal(await page.locator('.skflow__node[aria-selected="true"]').evaluate((e) => e.closest('li').classList.contains('is-hit')), true, '설명이 켜진 단계로 옮겨 가지 않았습니다')
      await notion.click()
      assert.equal(await notion.getAttribute('aria-pressed'), 'false')
      assert.equal(await page.locator('.skflow__step.is-dim').count(), 0)
    })
    await t('화면에 들어오면 단계가 켜진다(is-in)', async () => {
      await waitFor(() => page.locator('.skmap').evaluate((e) => e.classList.contains('is-in')), { message: 'is-in 이 붙지 않았습니다' })
    })
    await context.close()

    const mobile = await openPage(browser, { viewport: VIEWPORTS.mobile })
    await go(mobile.page, url, '/about')
    await mobile.page.waitForSelector('.skflow__node')
    await t('모바일: 고른 단계의 설명만 보이고, 다른 단계를 누르면 옮겨 간다', async () => {
      const visible = () => mobile.page.$$eval('.skflow__inline', (ps) => ps.filter((p) => p.offsetParent !== null).length)
      assert.equal(await visible(), 1)
      assert.equal(await mobile.page.locator('.skflow__panel').isVisible(), false)
      await mobile.page.locator('.skflow__node').nth(3).click()
      assert.equal(await visible(), 1)
      assert.equal(await mobile.page.locator('.skflow__step.is-on .skflow__node').getAttribute('id'), 'skflow-tab-3')
    })
    await mobile.context.close()
  },
}
