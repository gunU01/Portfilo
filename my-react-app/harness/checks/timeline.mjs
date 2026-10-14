import assert from 'node:assert/strict'
import { openPage, waitFor } from '../lib/browser.mjs'
import { go } from '../lib/site.mjs'

export default {
  name: 'timeline',
  about: '활동 기록의 진행선: 읽는 위치를 따라 이어서 차오르고, 점과 항목 상태가 선을 따라간다',
  async run({ browser, url, t }) {
    const { page, context } = await openPage(browser)
    await go(page, url, '/about')
    await page.waitForSelector('.tl--live .tl__item')

    // 목록 상단을 화면 위에서 offset 만큼 아래에 오게 스크롤합니다.
    const scrollListTo = (offset) =>
      page.evaluate((o) => window.scrollTo({ top: document.querySelector('.tl--live').getBoundingClientRect().top + window.scrollY - o, behavior: 'instant' }), offset)
    const state = () =>
      page.evaluate(() => {
        const list = document.querySelector('.tl--live')
        const lt = list.getBoundingClientRect().top
        const items = [...list.querySelectorAll('.tl__item')]
        return {
          fill: Number.parseFloat(list.style.getPropertyValue('--fill')),
          height: list.getBoundingClientRect().height,
          afterHeight: Number.parseFloat(getComputedStyle(list, '::after').height),
          passed: items.filter((i) => i.classList.contains('is-passed')).length,
          current: items.filter((i) => i.classList.contains('is-current')).length,
          currentIndex: items.findIndex((i) => i.classList.contains('is-current')),
          dots: items.map((i) => i.getBoundingClientRect().top - lt + 12), // 점의 가운데(목록 맨 위 기준)
          dimmed: items.map((i) => Number(getComputedStyle(i.querySelector('.tl__text')).opacity) < 0.9),
          total: items.length,
        }
      })

    await t('목록에 닿기 전에는 비어 있다: 진행선 0, 지나간 항목 없음, 모든 항목이 흐리다', async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await waitFor(async () => (await state()).fill === 0, { message: '진행선이 0 이 아닙니다' })
      const s = await state()
      assert.equal(s.passed, 0)
      assert.equal(s.current, 0)
      await waitFor(async () => (await state()).dimmed.every(Boolean), { message: '아직 안 온 항목이 흐려지지 않았습니다' })
    })

    await t('내려가는 만큼 이어서 차오른다: 선 끝이 지금 항목의 점과 다음 항목의 점 사이에 있다', async () => {
      const seen = []
      for (const offset of [520, 380, 240, 120]) {
        await scrollListTo(offset)
        // 스크롤 직후에는 이전 값이 남아 있을 수 있어서, 화면 기하로 계산한 '지나가야 할 항목 수'와 같아질 때까지 기다립니다.
        const expected = await page.evaluate(() => [...document.querySelectorAll('.tl--live .tl__item')].filter((i) => i.getBoundingClientRect().top + 12 < window.innerHeight * 0.62).length)
        await waitFor(async () => {
          const s = await state()
          return s.passed === expected && s.current === (expected > 0 ? 1 : 0)
        }, { message: `offset ${offset}: 지나간 항목이 ${expected}개가 되지 않았습니다` })
        const s = await state()
        seen.push(s.fill)
        assert.ok(Math.abs(s.afterHeight - s.fill) < 1, '진행선(::after) 길이가 --fill 과 같아야 합니다')
        assert.equal(s.passed, s.currentIndex + 1, '지금 항목은 지나간 항목 중 마지막이어야 합니다')
        assert.ok(s.fill >= s.dots[s.currentIndex] - 1, '선 끝이 지금 항목의 점보다 아래여야 합니다')
        if (s.dots[s.currentIndex + 1] !== undefined) assert.ok(s.fill < s.dots[s.currentIndex + 1], '선 끝이 다음 항목의 점을 넘으면 안 됩니다')
        // 흐림은 0.4초에 걸쳐 바뀌므로 끝나기를 기다립니다.
        await waitFor(async () => {
          const d = (await state()).dimmed
          return d.slice(0, s.passed).every((x) => !x) && d.slice(s.passed).every(Boolean)
        }, { message: `지나간 항목은 또렷하고 아직 안 온 항목은 흐려야 합니다 (offset ${offset})` })
      }
      assert.ok(seen.every((v, i) => i === 0 || v > seen[i - 1]), `내릴수록 길어져야 합니다: ${seen}`)
    })

    await t('끝까지 지나면 선이 목록 길이만큼 차고 모두 지나가며 마지막이 현재 항목이다', async () => {
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('.tl--live').getBoundingClientRect().bottom + window.scrollY, behavior: 'instant' }))
      await waitFor(async () => (await state()).passed === (await state()).total, { message: '모두 지나가지 않았습니다' })
      const s = await state()
      assert.ok(Math.abs(s.fill - s.height) < 1)
      assert.equal(s.currentIndex, s.total - 1)
    })

    await t('다시 위로 올리면 되돌아간다', async () => {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await waitFor(async () => (await state()).passed === 0 && (await state()).fill === 0, { message: '되돌아가지 않았습니다' })
    })
    await context.close()

    await t('모션 줄이기: 현재 항목의 숨쉬는 고리 애니메이션이 꺼진다', async () => {
      const calm = await openPage(browser, { reducedMotion: 'reduce' })
      await go(calm.page, url, '/about')
      await calm.page.waitForSelector('.tl--live .tl__item')
      await calm.page.evaluate(() => window.scrollTo({ top: document.querySelector('.tl--live').getBoundingClientRect().top + window.scrollY - 240, behavior: 'instant' }))
      await waitFor(() => calm.page.$('.tl--live .is-current'), { message: '현재 항목이 없습니다' })
      assert.equal(await calm.page.$eval('.tl--live .is-current', (e) => getComputedStyle(e, '::before').animationName), 'none')
      await calm.context.close()
    })
  },
}
