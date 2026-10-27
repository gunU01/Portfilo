import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DIST = path.join(ROOT, 'dist')

export const readIndexHtml = () => fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

// 사이트 이름은 빌드된 index.html 의 <title> 에서 읽습니다. 검사마다 문구를 따로 적어 두면 문구를 바꿀 때 검사가 어긋납니다.
export const siteTitle = () => readIndexHtml().match(/<title>([^<]*)<\/title>/)?.[1] ?? ''

export const go = (page, url, route) => page.goto(`${url}/#${route}`)

// 지금 주소의 라우트가 실제로 그려질 때까지. 경로가 바뀔 때는 다음 페이지가 준비될 때까지 이전 화면이 남아 있으므로
// (startTransition), main 에 내용이 있다는 것만으로는 부족하고 main 의 data-path 가 주소의 경로와 같아야 합니다.
// 페이지 코드를 받는 동안의 빈 자리표시(.page-wait)는 내용으로 세지 않습니다.
// 아래의 경로 읽기(# 뒤, ? 앞, 끝의 / 제거)는 src/lib/useHashRoute.js 의 read() 와 같은 규칙이어야 합니다.
export const ready = (page) =>
  page.waitForFunction(() => {
    const here = window.location.hash.replace(/^#/, '').split('?')[0].replace(/\/+$/, '') || '/'
    const main = document.querySelector('main#main')
    return main?.dataset.path === here && main.children.length > 0 && !main.querySelector(':scope > .page-wait')
  })

// 케이스 라우트는 프로젝트 목록의 카드에서 찾습니다. 새 케이스가 생겨도 검사 대상에 자동으로 들어옵니다.
export async function discoverCases(page, url) {
  await go(page, url, '/project')
  await page.waitForSelector('.pcard')
  return page.$$eval('.pcard', (cards) => {
    // 이름 옆 설명(.name-note)은 제목에서 뺀다
    const titleOf = (h) => {
      const copy = h.cloneNode(true)
      copy.querySelector('.name-note')?.remove()
      return copy.textContent.trim()
    }
    return cards.map((c) => ({ route: c.getAttribute('href').slice(1), title: titleOf(c.querySelector('h2')) }))
  })
}

// 책상 위에서 누를 수 있는 물건들의 aria-label ('수상 열기' 같은 것)
export async function deskLabels(page, url) {
  await go(page, url, '/desk')
  await page.waitForSelector('.hs')
  return page.$$eval('.hs', (els) => els.map((e) => e.getAttribute('aria-label')))
}
