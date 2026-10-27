import assert from 'node:assert/strict'
import { openPage, waitFor, VIEWPORTS } from '../lib/browser.mjs'
import { go, ready } from '../lib/site.mjs'

export default {
  name: 'transitions',
  about: '화면 전환과 주소 정리: 없는 경로 되돌리기, 끝의 / 정리, 되돌아가기가 되튕기지 않음, 뒤로 가기는 보던 자리로, 새 화면은 맨 위에서 시작',
  async run({ browser, url, t }) {
    const hashOf = (page) => new URL(page.url()).hash

    await t('없는 경로는 홈으로 옮겨지고, 기록을 남기지 않아 뒤로 가기가 되튕기지 않는다', async () => {
      const { page, context } = await openPage(browser)
      await go(page, url, '/about')
      await ready(page)
      await page.evaluate(() => {
        window.location.hash = '#/nonsense'
      })
      await waitFor(async () => hashOf(page) === '#/', { message: `홈으로 옮겨지지 않았습니다(${hashOf(page)})` })
      await page.goBack()
      await waitFor(async () => hashOf(page) === '#/about', { message: `뒤로 가기가 About 으로 돌아가지 않았습니다(${hashOf(page)})` })
      await context.close()
    })

    await t('없는 케이스는 프로젝트 목록으로, 끝의 / 는 지워진다', async () => {
      const { page, context } = await openPage(browser)
      await go(page, url, '/work/없는-케이스')
      await waitFor(async () => hashOf(page) === '#/project', { message: `목록으로 옮겨지지 않았습니다(${hashOf(page)})` })
      await go(page, url, '/about/')
      await waitFor(async () => hashOf(page) === '#/about', { message: `끝의 / 가 지워지지 않았습니다(${hashOf(page)})` })
      await context.close()
    })

    await t('구간 주소(?s=)는 정리되면서도 그대로 남는다', async () => {
      const { page, context } = await openPage(browser)
      await go(page, url, '/about/?s=awards')
      await waitFor(async () => hashOf(page) === '#/about?s=awards', { message: `구간이 남지 않았습니다(${hashOf(page)})` })
      await context.close()
    })

    await t('페이지 코드를 늦게 받는 주소를 직접 열어도 레이아웃이 크게 밀리지 않는다(누적 이동 0.1 미만)', async () => {
      for (const route of ['/about', '/work/howmuch', '/project']) {
        const { page, context } = await openPage(browser)
        await page.addInitScript(() => {
          window.__cls = 0
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
          }).observe({ type: 'layout-shift', buffered: true })
        })
        await go(page, url, route)
        await ready(page)
        await page.waitForTimeout(1200)
        const cls = await page.evaluate(() => window.__cls)
        assert.ok(cls < 0.1, `${route} 레이아웃 이동 ${cls.toFixed(3)}`)
        await context.close()
      }
    })

    await t('뒤로 가기는 떠나기 전의 스크롤 위치로 돌아가고, 새 화면은 맨 위에서 시작한다', async () => {
      const { page, context } = await openPage(browser, { viewport: VIEWPORTS.mobile })
      await go(page, url, '/project')
      await ready(page)
      await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }))
      await waitFor(() => page.evaluate(() => Math.abs(window.scrollY - 700) < 3), { message: '스크롤이 700 에 닿지 않았습니다' })
      await page.locator('.pcard').nth(2).click()
      await waitFor(async () => hashOf(page).startsWith('#/work/'), { message: '케이스로 이동하지 않았습니다' })
      await ready(page)
      await waitFor(() => page.evaluate(() => window.scrollY === 0), { timeout: 3000, message: '새 화면이 맨 위에서 시작하지 않았습니다' })
      await page.goBack()
      await waitFor(async () => hashOf(page) === '#/project', { message: '목록으로 돌아가지 않았습니다' })
      await waitFor(() => page.evaluate(() => Math.abs(window.scrollY - 700) < 8), { timeout: 4000, message: '보던 자리로 돌아가지 않았습니다' })
      await context.close()
    })
  },
}
