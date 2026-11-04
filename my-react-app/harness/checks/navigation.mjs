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

    await t('블로그: 프로젝트 목록 아래의 글을 열면 Project 가 강조되고, 목록으로 돌아오면 블로그 구간에서 시작', async () => {
      await go(page, url, '/project')
      await page.waitForSelector('.blog__item')
      await page.locator('.blog__item').first().click()
      await page.waitForSelector('.post__title')
      assert.equal(await page.locator('.nav__links a[aria-current="page"]').textContent(), 'Project')
      await page.locator('.back').click()
      await page.waitForSelector('#blog')
      await waitFor(() => page.evaluate(() => Math.abs(document.querySelector('#blog').getBoundingClientRect().top) < 200), { timeout: 6000, message: '블로그 구간으로 이동하지 않았습니다' })
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

    await t('소개 페이지 호 목차: 큰 화면에서 스크롤해도 화면 가운데 오른쪽에 계속 보이고, 끌면 스크롤된다', async () => {
      await page.setViewportSize({ width: 1600, height: 900 })
      await go(page, url, '/about')
      await page.waitForSelector('.sidx button')
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.waitForTimeout(300)
      const inView = () =>
        page.$eval('.sidx', (e) => {
          const r = e.getBoundingClientRect()
          return r.top >= 0 && r.bottom <= window.innerHeight && r.right <= window.innerWidth + 1 && Math.abs((r.top + r.bottom) / 2 - window.innerHeight / 2) < 8
        })
      assert.equal(await inView(), true, '맨 위에서 목차가 화면 가운데에 보이지 않습니다')
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight * 0.55, behavior: 'instant' }))
      await page.waitForTimeout(300)
      assert.equal(await inView(), true, '스크롤한 뒤에 목차가 화면 가운데에 보이지 않습니다')
      const visible = await page.$$eval('.sidx button', (bs) => bs.filter((b) => Number(getComputedStyle(b).opacity) > 0.3).length)
      assert.ok(visible >= 3, '가운데 주변의 항목이 보이지 않습니다')
      const before = await page.evaluate(() => window.scrollY)
      const box = await page.locator('.sidx__handle').boundingBox()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 160, { steps: 8 })
      await page.mouse.up()
      assert.ok((await page.evaluate(() => window.scrollY)) > before + 100, '목차를 끌었는데 페이지가 스크롤되지 않았습니다')
      await page.setViewportSize({ width: 1440, height: 900 })
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
