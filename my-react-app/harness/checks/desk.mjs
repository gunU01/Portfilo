import assert from 'node:assert/strict'
import { openPage, VIEWPORTS, waitFor } from '../lib/browser.mjs'
import { deskLabels } from '../lib/site.mjs'

export default {
  name: 'desk',
  about: '책상의 물건 7개를 키보드와 마우스로 열고 닫을 수 있고, 모바일에서는 가운데가 먼저 보인다',
  async run({ browser, url, t }) {
    const { page, context, errors } = await openPage(browser)
    const labels = await deskLabels(page, url)

    await t('핫스팟 7개', async () => assert.equal(labels.length, 7))

    for (const label of labels) {
      const name = label.replace(/ 열기$/, '')
      await t(`${name}: 포커스하면 이름표, Enter 로 열림, Esc 로 닫힘`, async () => {
        const sel = `[aria-label="${label}"]`
        await page.focus(sel)
        assert.equal(await page.locator('.tag.is-on').count(), 1, '이름표가 하나만 떠야 합니다')
        assert.equal(await page.locator('.tag.is-on .desk__tagtext').textContent(), name)
        await page.keyboard.press('Enter')
        await page.waitForSelector('.desk__panel')
        assert.equal(await page.locator('.desk__panel h2').textContent(), name, '패널 제목')
        assert.equal(await page.evaluate(() => document.activeElement?.className), 'desk__close', '포커스가 닫기 버튼으로 가야 합니다')
        await page.keyboard.press('Escape')
        assert.equal(await page.locator('.desk__panel').count(), 0, '패널이 닫혀야 합니다')
      })
    }

    await t('패널 안에서 다른 물건에 마우스를 올려도 포커스가 닫기 버튼에 머문다', async () => {
      await page.click(`[aria-label="${labels[0]}"]`, { force: true })
      await page.waitForSelector('.desk__panel')
      await page.hover(`[aria-label="${labels[1]}"]`, { force: true })
      await page.hover(`[aria-label="${labels[2]}"]`, { force: true })
      assert.equal(await page.evaluate(() => document.activeElement?.className), 'desk__close')
      await page.keyboard.press('Escape')
    })

    await t('마우스를 움직이면 층이 따라 움직인다(--px 가 바뀜)', async () => {
      await page.mouse.move(100, 200)
      await page.mouse.move(1300, 700)
      const v = await waitFor(() => page.$eval('.desk__stage', (e) => e.style.getPropertyValue('--px')), { message: '--px 가 설정되지 않았습니다' })
      assert.ok(Math.abs(Number(v)) > 0.3)
    })
    await t('고양이: 눈동자가 마우스를 따라가고, 마우스를 올리면 웃는 눈과 하트가 나타난다', async () => {
      const pupil = () => page.$eval('.desk__look', (e) => getComputedStyle(e).transform)
      await page.mouse.move(60, 160)
      await waitFor(async () => (await pupil()) !== 'none', { message: '눈동자가 움직이지 않습니다' })
      const left = await pupil()
      await page.mouse.move(1540, 840)
      await waitFor(async () => (await pupil()) !== left, { message: '눈동자가 마우스를 따라가지 않습니다' })
      await page.hover('[aria-label="기획물 열기"]', { force: true })
      await waitFor(() => page.$eval('.desk__happy', (e) => Number(getComputedStyle(e).opacity) > 0.9), { message: '웃는 눈이 나타나지 않습니다' })
      assert.ok(await page.$eval('.desk__blink', (e) => Number(getComputedStyle(e).opacity) < 0.1), '평소 눈은 숨겨져야 합니다')
      assert.ok(await page.$eval('.desk__hearts', (e) => Number(getComputedStyle(e).opacity) > 0.9), '하트가 나타나야 합니다')
    })
    await t('호버 반응: 서랍이 열리고, 노트북 화면의 카드와 액자가 움직인다', async () => {
      await page.hover('[aria-label="대회 참가 열기"]', { force: true })
      await waitFor(() => page.$eval('.desk__drawer', (e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).f > 4), { message: '서랍이 열리지 않습니다' })
      await page.hover('[aria-label="프로젝트 열기"]', { force: true })
      await waitFor(() => page.$eval('.desk__card', (e) => getComputedStyle(e).animationName !== 'none'), { message: '카드가 움직이지 않습니다' })
      await page.hover('[aria-label="수상 열기"]', { force: true })
      await waitFor(() => page.$eval('.desk__frame', (e) => getComputedStyle(e).animationName !== 'none'), { message: '액자가 움직이지 않습니다' })
    })
    await t('브라우저 오류 없음', async () => assert.deepEqual(errors, []))
    await context.close()

    const calm = await openPage(browser, { reducedMotion: 'reduce' })
    await deskLabels(calm.page, url)
    await t('모션 줄이기: 장면의 모든 애니메이션과 전환이 멈춘다', async () => {
      await calm.page.hover('[aria-label="기획물 열기"]', { force: true })
      const moving = await calm.page.$$eval('.desk__svg *', (els) => els.filter((e) => getComputedStyle(e).animationName !== 'none').length)
      assert.equal(moving, 0, '움직이는 요소 수')
    })
    await calm.context.close()

    const mobile = await openPage(browser, { viewport: VIEWPORTS.mobile })
    await deskLabels(mobile.page, url)
    await t('모바일: 장면 가운데가 먼저 보인다', async () => {
      const [left, sw, cw] = await mobile.page.$eval('.desk__stage', (e) => [e.scrollLeft, e.scrollWidth, e.clientWidth])
      assert.ok(sw > cw, '모바일에서는 장면이 화면보다 넓어야 합니다')
      assert.ok(Math.abs(left - (sw - cw) / 2) <= 2, `scrollLeft ${left} (가운데는 ${(sw - cw) / 2})`)
    })
    await mobile.context.close()
  },
}
