import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'

export default {
  name: 'interactions',
  about: '메뉴 강조, 프로젝트 탭, 목차 이동, 호버 번짐 같은 상호작용',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser)

    await t('메뉴: 현재 페이지가 aria-current, 케이스 안에서는 Project 가 강조', async () => {
      await page.goto(`${url}/#/project`)
      assert.equal(await page.locator('.nav__links a[aria-current="page"]').textContent(), 'Project')
      await page.locator('.pcard').first().click()
      await page.waitForSelector('.case__title')
      assert.equal(await page.locator('.nav__links a[aria-current="page"]').textContent(), 'Project')
    })

    await t('프로젝트 탭: 눌러서 거른 카드 수가 탭의 숫자와 같다', async () => {
      await page.goto(`${url}/#/project`)
      await page.waitForSelector('.pcard')
      const tabs = await page.$$eval('.pj__tabs button', (bs) => bs.map((b) => [b.firstChild.textContent.trim(), Number(b.querySelector('span').textContent)]))
      assert.ok(tabs.length >= 2)
      for (const [label, count] of tabs) {
        await page.locator('.pj__tabs button', { hasText: label }).click()
        assert.equal(await page.locator('.pcard').count(), count, `${label} 탭`)
        assert.equal(await page.locator(`.pj__tabs button[aria-pressed="true"]`).count(), 1)
      }
    })

    await t('케이스 목차: 누르면 그 섹션으로 이동하고 강조가 따라온다', async () => {
      await page.goto(`${url}/#/work/howmuch`)
      await page.waitForSelector('.toc button')
      const second = page.locator('.toc button').nth(1)
      const label = await second.textContent()
      await second.click()
      await waitFor(async () => (await page.locator('.toc button[aria-current="true"]').textContent()) === label, { timeout: 6000, message: '목차 강조가 따라오지 않았습니다' })
    })

    await t('소개 페이지 우측 목차: 누르면 이동하고 강조가 따라온다', async () => {
      await page.goto(`${url}/#/about`)
      await page.waitForSelector('.sidx button')
      // 페이지가 바뀌면 맨 위로 부드럽게 올라가는 중이라, 끝난 뒤에 눌러야 서로 간섭하지 않습니다.
      await waitFor(() => page.evaluate(() => window.scrollY === 0), { timeout: 6000, message: '맨 위로 올라가지 않았습니다' })
      const third = page.locator('.sidx button').nth(2)
      const label = (await third.textContent()).replace(/^\d+/, '')
      await third.click()
      await waitFor(async () => (await page.locator('.sidx button[aria-current="true"]').textContent()).replace(/^\d+/, '') === label, { timeout: 6000, message: '목차 강조가 따라오지 않았습니다' })
    })

    await t('기술 도식: 마디를 고르면 설명이 바뀌고, 방향키로 이동하며 양 끝이 이어진다', async () => {
      await page.goto(`${url}/#/about`)
      await page.waitForSelector('.skflow__node')
      const selected = () => page.locator('.skflow__node[aria-selected="true"] .skflow__name').textContent()
      const panel = () => page.locator('.skflow__panel b').textContent()
      await page.locator('.skflow__node').nth(4).click()
      assert.equal(await panel(), await selected(), '선택한 마디와 설명 제목이 같아야 합니다')
      await page.locator('.skflow__node').nth(0).click()
      await page.keyboard.press('ArrowLeft')
      assert.equal(await page.locator('.skflow__node[aria-selected="true"]').getAttribute('id'), `skflow-tab-${(await page.locator('.skflow__node').count()) - 1}`, '처음에서 왼쪽으로 가면 마지막으로')
      await page.keyboard.press('Home')
      assert.equal(await page.locator('.skflow__node[aria-selected="true"]').getAttribute('id'), 'skflow-tab-0')
      const chips = page.locator('.skstack').first().locator('.skstack__chip')
      await chips.nth(1).click()
      assert.equal(await chips.nth(1).getAttribute('aria-selected'), 'true')
      assert.ok((await page.locator('.skstack__desc').first().textContent()).length > 0)
    })

    await t('호버 번짐: 들어온 자리에서 차오르고, 나간 자리로 걷힌다', async () => {
      await page.goto(`${url}/#/`)
      const card = page.locator('.ov__card').first()
      await card.scrollIntoViewIfNeeded()
      const box = await card.boundingBox()
      const scale = () => card.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e, '::before').transform).a)
      const origin = () => card.evaluate((e) => [parseFloat(e.style.getPropertyValue('--ix')), parseFloat(e.style.getPropertyValue('--iy'))])
      await page.mouse.move(5, 5)
      await page.mouse.move(box.x + 20, box.y + box.height - 20)
      assert.ok((await origin())[0] < 40, '들어온 자리(왼쪽)에서 시작해야 합니다')
      await waitFor(async () => (await scale()) > 0.99, { timeout: 3000, message: '색이 끝까지 차오르지 않았습니다' })
      await page.mouse.move(box.x + box.width - 30, box.y + 10, { steps: 5 })
      await page.mouse.move(box.x + box.width - 30, box.y - 30)
      assert.ok((await origin())[0] > box.width - 60, '나간 자리(오른쪽)로 중심이 옮겨져야 합니다')
      await waitFor(async () => (await scale()) < 0.01, { timeout: 3000, message: '색이 걷히지 않았습니다' })
    })

    await t('호버 번짐: 모션 줄이기 설정에서는 애니메이션 없이 바로 바뀐다', async () => {
      const rm = await openPage(browser, { reducedMotion: 'reduce' })
      await rm.page.goto(`${url}/#/`)
      const card = rm.page.locator('.ov__card').first()
      await card.scrollIntoViewIfNeeded()
      const box = await card.boundingBox()
      await rm.page.mouse.move(box.x + 20, box.y + 20)
      await rm.page.waitForTimeout(80)
      assert.ok((await card.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e, '::before').transform).a)) > 0.99)
      await rm.context.close()
    })

    await context.close()
  },
}
