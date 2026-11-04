import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go } from '../lib/site.mjs'

// 안정성: 페이지 코드를 받지 못해도 사이트가 하얗게 비지 않고, 안내를 보여 주며, 메뉴로 빠져나올 수 있다
export default {
  name: 'stability',
  about: '페이지 코드를 받지 못해도(새 배포 직후, 끊긴 네트워크) 한 번 새로고침해 보고, 그래도 안 되면 안내와 메뉴가 남는다',
  async run({ browser, url, t }) {
    await t('코드를 받지 못하면: 한 번만 새로고침한 뒤 오류 안내가 보이고, 메뉴로 다른 화면에 갈 수 있다', async () => {
      const { page, context } = await openPage(browser)
      let blocked = 0
      await page.route('**/assets/Desk-*.js', (route) => {
        blocked += 1
        route.abort()
      })
      await go(page, url, '/')
      await page.waitForSelector('.nav')
      await page.locator('.nav__links a', { hasText: '책상' }).first().click().catch(() => page.evaluate(() => (window.location.hash = '#/desk')))
      await waitFor(async () => (await page.locator('.fail').count()) === 1, { timeout: 10000, message: '오류 안내가 나타나지 않았습니다' })
      assert.ok(blocked >= 2, `처음 실패 뒤 한 번 새로고침해서 다시 시도해야 합니다(요청 ${blocked}번)`)
      assert.equal(await page.locator('.fail button').count(), 1, '다시 시도 버튼이 없습니다')
      assert.equal(await page.locator('.nav').isVisible(), true, '메뉴가 사라졌습니다')
      await page.locator('.nav__brand').click()
      await waitFor(async () => (await page.locator('.fail').count()) === 0 && (await page.locator('.pin__stage').count()) === 1, { message: '메뉴로 홈에 돌아오지 못했습니다' })
      await context.close()
    })
  },
}
