import assert from 'node:assert/strict'
import { openPage, waitFor, VIEWPORTS } from '../lib/browser.mjs'
import { go, ready } from '../lib/site.mjs'

export default {
  name: 'interactions',
  about: '케이스 페이지의 움직임: 막대가 차오름, 접힌 항목이 부드럽게 열림, 다음 프로젝트 카드, 맨 위로 버튼, 오늘한입 로고',
  async run({ browser, url, t }) {
    const { page } = await openPage(browser)

    await t('오늘한입 표지는 서비스 로고(마크, 이름, 설명)이고 접근 가능한 설명이 있다', async () => {
      await go(page, url, '/work/sosang')
      await ready(page)
      const logo = page.locator('.case__cover .cover--logo')
      assert.equal(await logo.count(), 1)
      assert.equal(await logo.getAttribute('role'), 'img')
      assert.ok((await logo.getAttribute('aria-label')).includes('로고'))
      assert.equal(await logo.locator('.logo__name').textContent(), '오늘한입')
      assert.equal(await logo.locator('svg path.logo__check').count(), 1)
    })

    await t('막대 도식: 화면 밖에서는 비어 있고 들어오면 차오른다', async () => {
      await go(page, url, '/work/sosang')
      await ready(page)
      const bar = page.locator('.chart .bars__bar').first()
      await waitFor(async () => (await bar.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a)) < 0.05, { message: '화면 밖인데 막대가 이미 채워져 있습니다' })
      await page.locator('.chart').first().scrollIntoViewIfNeeded()
      await waitFor(async () => (await bar.evaluate((e) => new DOMMatrixReadOnly(getComputedStyle(e).transform).a)) > 0.98, { message: '화면에 들어왔는데 막대가 차오르지 않았습니다' })
    })

    await t('접힌 항목: 눌러 열면 내용 높이까지 부드럽게 늘어난다', async () => {
      const tg = page.locator('details.tg').first()
      await tg.scrollIntoViewIfNeeded()
      const closed = await tg.evaluate((e) => e.getBoundingClientRect().height)
      await tg.locator('summary').click()
      await waitFor(async () => (await tg.evaluate((e) => e.getBoundingClientRect().height)) > closed + 100, { message: '펼쳤는데 높이가 늘어나지 않았습니다' })
      await tg.locator('summary').click()
      await waitFor(async () => Math.abs((await tg.evaluate((e) => e.getBoundingClientRect().height)) - closed) < 2, { message: '접었는데 원래 높이로 돌아오지 않았습니다' })
    })

    await t('다음 프로젝트 카드: 목록의 다음 케이스를 가리키고, 마지막 케이스에서는 처음으로 돌아간다', async () => {
      const hrefs = await (async () => {
        await go(page, url, '/project')
        await page.waitForSelector('.pcard')
        return page.$$eval('.pcard', (cards) => cards.map((c) => c.getAttribute('href')))
      })()
      for (let i = 0; i < hrefs.length; i++) {
        await go(page, url, hrefs[i].slice(1))
        await ready(page)
        const next = page.locator('.cnext__a')
        assert.equal(await next.getAttribute('href'), hrefs[(i + 1) % hrefs.length], `${hrefs[i]} 의 다음 카드가 목록 순서와 다릅니다`)
      }
    })

    await t('맨 위로 버튼: 맨 위에서는 숨고, 내려가면 나타나며, 누르면 맨 위로 올라간다', async () => {
      await go(page, url, '/work/sosang')
      await ready(page)
      const btn = page.locator('.totop')
      await waitFor(() => btn.evaluate((e) => getComputedStyle(e).visibility === 'hidden'), { message: '맨 위에서 버튼이 숨지 않았습니다' })
      assert.equal(await btn.getAttribute('tabindex'), '-1')
      await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }))
      await waitFor(() => btn.evaluate((e) => e.classList.contains('is-on')), { message: '내려갔는데 버튼이 나타나지 않았습니다' })
      assert.equal(await btn.getAttribute('tabindex'), '0')
      await btn.click()
      await waitFor(() => page.evaluate(() => window.scrollY < 4), { message: '버튼을 눌렀는데 맨 위로 올라가지 않았습니다' })
    })

    await t('모바일 표: 행이 많으면 앞부분만 보이고, 버튼으로 펼치고 접으며, 데스크톱에서는 전부 보인다', async () => {
      const { page: m } = await openPage(browser, { viewport: VIEWPORTS.mobile })
      await go(m, url, '/work/haemi')
      await ready(m)
      const wrap = m.locator('.tablewrap').filter({ has: m.locator('.tmore') }).first()
      assert.ok((await wrap.count()) > 0, '접히는 표가 없습니다')
      const rows = () => wrap.locator('tbody tr').evaluateAll((trs) => trs.filter((tr) => getComputedStyle(tr).display !== 'none').length)
      const total = await wrap.locator('tbody tr').count()
      assert.equal(await rows(), 4, '처음에는 4행만 보여야 합니다')
      await wrap.locator('.tmore').click()
      assert.equal(await rows(), total)
      assert.equal(await wrap.locator('.tmore').getAttribute('aria-expanded'), 'true')
      await wrap.locator('.tmore').click()
      assert.equal(await rows(), 4)
      await go(page, url, '/work/haemi')
      await ready(page)
      const desktopWrap = page.locator('.tablewrap').filter({ has: page.locator('.tmore') }).first()
      assert.equal(await desktopWrap.locator('.tmore').evaluate((e) => getComputedStyle(e).display), 'none')
      assert.equal(await desktopWrap.locator('tbody tr').evaluateAll((trs) => trs.filter((tr) => getComputedStyle(tr).display !== 'none').length), await desktopWrap.locator('tbody tr').count())
    })

    await t('모바일 목차: 위에 붙는 가로 칩이고, 읽는 위치의 칩이 강조된다', async () => {
      const { page: m } = await openPage(browser, { viewport: VIEWPORTS.mobile })
      await go(m, url, '/work/sosang')
      await ready(m)
      const toc = m.locator('.toc')
      assert.equal(await toc.evaluate((e) => getComputedStyle(e).position), 'sticky')
      assert.equal(await toc.evaluate((e) => e.scrollWidth > e.clientWidth), true, '칩이 가로로 이어져야 합니다')
      await m.evaluate(() => window.scrollTo({ top: document.getElementById('validation')?.offsetTop ?? 3000, behavior: 'instant' }))
      await waitFor(async () => (await toc.locator('[aria-current="true"]').textContent()) !== (await toc.locator('button').first().textContent()), { message: '읽는 위치를 따라 칩 강조가 바뀌지 않았습니다' })
    })

    await t('책상에는 맨 위로 버튼이 없다', async () => {
      await go(page, url, '/desk')
      await page.waitForSelector('.hs')
      assert.equal(await page.locator('.totop').count(), 0)
    })
  },
}
