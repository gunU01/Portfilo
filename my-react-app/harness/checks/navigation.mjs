import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go } from '../lib/site.mjs'

// 숫자나 방향키 같은 '이동' 상호작용: 메뉴, 프로젝트 탭, 목차
export default {
  name: 'navigation',
  about: '메뉴 강조, 프로젝트 탭 필터, 케이스 목차와 소개 페이지 목차 이동',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser)

    await t('메뉴: 현재 페이지가 aria-current, 케이스 안에서는 Project 가 강조', async () => {
      await go(page, url, '/project')
      assert.equal(await page.locator('.nav__links a[aria-current="page"]').textContent(), 'Project')
      await page.locator('.pcard').first().click()
      await page.waitForSelector('.case__title')
      assert.equal(await page.locator('.nav__links a[aria-current="page"]').textContent(), 'Project')
    })

    await t('프로젝트 탭: 눌러서 거른 카드 수가 탭의 숫자와 같다', async () => {
      await go(page, url, '/project')
      await page.waitForSelector('.pcard')
      const tabs = await page.$$eval('.pj__tabs button', (bs) => bs.map((b) => [b.firstChild.textContent.trim(), Number(b.querySelector('span').textContent)]))
      assert.ok(tabs.length >= 2)
      for (const [label, count] of tabs) {
        await page.locator('.pj__tabs button', { hasText: label }).click()
        assert.equal(await page.locator('.pcard').count(), count, `${label} 탭`)
        assert.equal(await page.locator('.pj__tabs button[aria-pressed="true"]').count(), 1)
      }
    })

    await t('케이스 목차: 누르면 그 섹션으로 이동하고 강조가 따라온다', async () => {
      await go(page, url, '/work/howmuch')
      await page.waitForSelector('.toc button')
      const second = page.locator('.toc button').nth(1)
      const label = await second.textContent()
      await second.click()
      await waitFor(async () => (await page.locator('.toc button[aria-current="true"]').textContent()) === label, { timeout: 6000, message: '목차 강조가 따라오지 않았습니다' })
    })

    await t('소개 페이지 우측 목차: 누르면 이동하고 강조가 따라온다', async () => {
      await go(page, url, '/about')
      await page.waitForSelector('.sidx button')
      // 페이지가 바뀌면 맨 위로 부드럽게 올라가는 중이라, 끝난 뒤에 눌러야 서로 간섭하지 않습니다.
      await waitFor(() => page.evaluate(() => window.scrollY === 0), { timeout: 6000, message: '맨 위로 올라가지 않았습니다' })
      const third = page.locator('.sidx button').nth(2)
      const label = (await third.textContent()).replace(/^\d+/, '')
      await third.click()
      await waitFor(async () => (await page.locator('.sidx button[aria-current="true"]').textContent()).replace(/^\d+/, '') === label, { timeout: 6000, message: '목차 강조가 따라오지 않았습니다' })
    })

    await t('이름(왼쪽 위)과 지금 보는 메뉴를 누르면 맨 위로 올라가고, 다른 화면에서 이름을 누르면 홈으로 간다', async () => {
      await go(page, url, '/project')
      await page.waitForSelector('.pcard')
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }))
      await page.locator('.nav__links a', { hasText: 'Project' }).click()
      await waitFor(() => page.evaluate(() => window.scrollY === 0), { timeout: 4000, message: '지금 보는 메뉴를 눌렀는데 맨 위로 올라가지 않았습니다' })
      await page.locator('.nav__brand').click()
      await waitFor(() => page.evaluate(() => window.location.hash === '#/'), { message: '이름을 눌렀는데 홈으로 가지 않았습니다' })
      await page.waitForSelector('.pin__stage')
      await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }))
      await page.locator('.nav__brand').click()
      await waitFor(() => page.evaluate(() => window.scrollY === 0), { timeout: 4000, message: '홈에서 이름을 눌렀는데 맨 위로 올라가지 않았습니다' })
    })

    await context.close()
  },
}
