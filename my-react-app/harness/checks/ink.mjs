import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go } from '../lib/site.mjs'

export default {
  name: 'ink',
  about: '호버 번짐: 들어온 자리에서 차오르고 나간 자리로 걷힌다, 모션 줄이기에서는 바로 바뀐다',
  async run({ browser, url, t }) {
    const scaleOf = (el) => el.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e, '::before').transform).a)
    const originOf = (el) => el.evaluate((e) => [parseFloat(e.style.getPropertyValue('--ix')), parseFloat(e.style.getPropertyValue('--iy'))])

    await t('들어온 자리에서 차오르고, 나간 자리로 중심이 옮겨져 걷힌다', async () => {
      const { page, context } = await openPage(browser)
      await go(page, url, '/')
      const card = page.locator('.ov__card').first()
      await card.scrollIntoViewIfNeeded()
      const box = await card.boundingBox()
      await page.mouse.move(5, 5)
      await page.mouse.move(box.x + 20, box.y + box.height - 20)
      assert.ok((await originOf(card))[0] < 40, '들어온 자리(왼쪽)에서 시작해야 합니다')
      await waitFor(async () => (await scaleOf(card)) > 0.99, { timeout: 3000, message: '색이 끝까지 차오르지 않았습니다' })
      await page.mouse.move(box.x + box.width - 30, box.y + 10, { steps: 5 })
      await page.mouse.move(box.x + box.width - 30, box.y - 30)
      assert.ok((await originOf(card))[0] > box.width - 60, '나간 자리(오른쪽)로 중심이 옮겨져야 합니다')
      await waitFor(async () => (await scaleOf(card)) < 0.01, { timeout: 3000, message: '색이 걷히지 않았습니다' })
      await context.close()
    })

    await t('번지는 도중에 나가도 중심이 튀지 않는다', async () => {
      const { page, context } = await openPage(browser)
      await go(page, url, '/')
      const card = page.locator('.ov__card').first()
      await card.scrollIntoViewIfNeeded()
      const box = await card.boundingBox()
      await page.mouse.move(5, 5)
      await page.mouse.move(box.x + 20, box.y + box.height - 20)
      const entered = await originOf(card)
      await page.mouse.move(box.x + box.width - 30, box.y - 30, { steps: 2 })
      assert.deepEqual(await originOf(card), entered)
      await context.close()
    })

    await t('모션 줄이기 설정에서는 애니메이션 없이 바로 바뀐다', async () => {
      const { page, context } = await openPage(browser, { reducedMotion: 'reduce' })
      await go(page, url, '/')
      const card = page.locator('.ov__card').first()
      await card.scrollIntoViewIfNeeded()
      const box = await card.boundingBox()
      await page.mouse.move(box.x + 20, box.y + 20)
      await page.waitForTimeout(80)
      assert.ok((await scaleOf(card)) > 0.99)
      await context.close()
    })
  },
}
