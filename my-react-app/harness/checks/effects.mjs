import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go, ready } from '../lib/site.mjs'

const num = (v) => Number.parseFloat(v)

export default {
  name: 'effects',
  about: '사이트의 움직임: 페이지 전환, 스크롤 진행 막대, 메뉴 알약, 첫 화면 글자, 카드 기울기, 버튼 끌림',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser)

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
      assert.ok(num(await page.$eval('.progress', (e) => e.style.getPropertyValue('--scroll'))) < 0.02)
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
      await waitFor(async () => num(await page.$eval('.progress', (e) => e.style.getPropertyValue('--scroll'))) > 0.98, { message: '맨 아래에서 1 에 가까워지지 않았습니다' })
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
      await page.evaluate(() => document.fonts.ready) // 글꼴이 늦게 로드돼 글자 폭이 바뀌어도 알약이 따라가야 합니다
      const fits = async (name) => {
        const link = await page.locator('.nav__links a', { hasText: name }).evaluate((e) => [e.offsetLeft, e.offsetWidth])
        const pill = await page.$eval('.nav__pill', (e) => [Number.parseFloat(e.style.getPropertyValue('--x')), Number.parseFloat(e.style.getPropertyValue('--w'))])
        return link[0] === pill[0] && link[1] === pill[1]
      }
      await waitFor(() => fits('Home'), { message: '알약이 Home 메뉴의 위치와 폭에 맞지 않습니다' })
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
      // 처음 올라오는 효과가 끝나기를 기다립니다. 고정 시간(효과 길이 1.26초와 거의 같은 값)은 부하가 걸리면 어긋나서, 실제 애니메이션이 끝났는지 봅니다.
      await page.waitForFunction(() => document.querySelector('.kw span')?.getAnimations().every((a) => a.playState === 'finished'), null, { timeout: 8000 })
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
