import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go, ready } from '../lib/site.mjs'

const num = (v) => Number.parseFloat(v)

export default {
  name: 'effects',
  about: '사이트의 움직임: 페이지 전환, 스크롤 진행 막대, 메뉴 알약, 첫 화면 글자, 카드 기울기, 버튼 끌림, 복사 아이콘',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser, { permissions: ['clipboard-read', 'clipboard-write'] })

    await t('페이지가 바뀌면 main 이 새로 만들어지며 들어오는 효과(page-in)가 걸린다', async () => {
      await go(page, url, '/')
      await ready(page)
      const main = await page.$('main#main')
      assert.equal(await main.evaluate((e) => getComputedStyle(e).animationName), 'page-in')
      await page.locator('.nav__links a', { hasText: 'About' }).click()
      await waitFor(() => main.evaluate((e) => !e.isConnected), { message: '페이지를 옮겼는데 main 이 그대로입니다' })
    })

    await t('스크롤 진행 막대: 내리면 차오르고, 맨 위에서는 0, 책상에는 없다', async () => {
      await go(page, url, '/about')
      await ready(page)
      await waitFor(() => page.evaluate(() => window.scrollY === 0), { message: '맨 위로 올라가지 않았습니다' })
      assert.ok(num(await page.$eval('html', (e) => e.style.getPropertyValue('--scroll'))) < 0.02)
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await waitFor(async () => num(await page.$eval('html', (e) => e.style.getPropertyValue('--scroll'))) > 0.98, { message: '맨 아래에서 1 에 가까워지지 않았습니다' })
      assert.ok((await page.$eval('.progress', (e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a)) > 0.98)
      await go(page, url, '/desk')
      await page.waitForSelector('.hs')
      assert.equal(await page.locator('.progress').count(), 0)
    })

    await t('메뉴 알약: 현재 메뉴 뒤에 있고, 메뉴를 옮기면 따라가며, 책상에서는 숨는다', async () => {
      await go(page, url, '/')
      await ready(page)
      const pillX = () => page.$eval('.nav__pill', (e) => Number.parseFloat(e.style.getPropertyValue('--x')))
      const linkX = (name) => page.locator('.nav__links a', { hasText: name }).evaluate((e) => e.offsetLeft)
      await waitFor(() => page.$eval('.nav__pill', (e) => e.classList.contains('is-on')), { message: '알약이 나타나지 않았습니다' })
      assert.equal(await pillX(), await linkX('Home'))
      await page.locator('.nav__links a', { hasText: 'Project' }).click()
      await waitFor(async () => (await pillX()) === (await linkX('Project')), { message: '알약이 Project 로 옮겨 가지 않았습니다' })
      await page.locator('.nav__desk').click()
      await waitFor(() => page.$eval('.nav__pill', (e) => !e.classList.contains('is-on')), { message: '책상에서 알약이 숨지 않았습니다' })
    })

    await t('첫 화면 글자: 처음에 차례로 올라오고, 마우스를 따라 안쪽으로만 움직인다', async () => {
      await go(page, url, '/')
      await ready(page)
      assert.equal(await page.$eval('.kw span', (e) => getComputedStyle(e).animationName), 'kw-in')
      const shift = (n) => page.$eval(`.kw span:nth-child(${n})`, (e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).e)
      await page.waitForTimeout(1300) // 처음 올라오는 효과가 끝나기를 기다립니다
      const box = await page.locator('.hero').boundingBox()
      await page.mouse.move(box.x + box.width - 10, box.y + 200)
      await waitFor(async () => (await shift(1)) > 5, { message: '첫 줄이 오른쪽으로 움직이지 않습니다' })
      await page.mouse.move(box.x + 10, box.y + 200)
      await waitFor(async () => (await shift(3)) < -5, { message: '셋째 줄이 왼쪽으로 움직이지 않습니다' })
      assert.ok((await shift(1)) >= 0, '첫 줄은 왼쪽(밖)으로 나가면 안 됩니다')
    })

    await t('프로젝트 카드: 마우스 쪽으로 기울고 나가면 돌아온다', async () => {
      await go(page, url, '/project')
      await page.waitForSelector('.pcard')
      const card = page.locator('.pcard').first()
      const box = await card.boundingBox()
      await page.mouse.move(box.x + box.width - 20, box.y + 30)
      await waitFor(async () => num(await card.evaluate((e) => e.style.getPropertyValue('--fx'))) > 0.5, { message: '--fx 가 들어오지 않았습니다' })
      await waitFor(async () => /^matrix3d/.test(await card.locator('.cover').first().evaluate((e) => getComputedStyle(e).transform)), { message: '카드가 기울지 않습니다' })
      await page.mouse.move(5, 5)
      await waitFor(async () => num(await card.evaluate((e) => e.style.getPropertyValue('--fx'))) === 0, { message: '나갔는데 돌아오지 않았습니다' })
    })

    await t('버튼 끌림: 버튼 위에서 마우스 쪽으로 살짝 움직인다', async () => {
      await go(page, url, '/')
      await ready(page)
      const btn = page.locator('.btn--solid')
      const box = await btn.boundingBox()
      await page.mouse.move(box.x + box.width - 4, box.y + box.height / 2)
      await waitFor(async () => num(await btn.evaluate((e) => getComputedStyle(e).translate)) > 3, { message: '버튼이 끌려오지 않습니다' })
    })

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

    await t('모션 줄이기: 전환, 첫 화면 글자, 카드 기울기, 버튼 끌림이 모두 꺼진다', async () => {
      const calm = await openPage(browser, { reducedMotion: 'reduce' })
      await go(calm.page, url, '/')
      await ready(calm.page)
      assert.equal(await calm.page.$eval('main#main', (e) => getComputedStyle(e).animationName), 'none')
      assert.equal(await calm.page.$eval('.kw span', (e) => getComputedStyle(e).animationName), 'none')
      const btn = calm.page.locator('.btn--solid')
      const box = await btn.boundingBox()
      await calm.page.mouse.move(box.x + box.width - 4, box.y + box.height / 2)
      await calm.page.waitForTimeout(400)
      assert.equal(await btn.evaluate((e) => getComputedStyle(e).translate), 'none')
      await calm.context.close()
    })
  },
}
