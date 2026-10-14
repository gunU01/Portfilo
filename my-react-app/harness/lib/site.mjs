import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DIST = path.join(ROOT, 'dist')

export const readIndexHtml = () => fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')

// 사이트 이름은 빌드된 index.html 의 <title> 에서 읽습니다. 검사마다 문구를 따로 적어 두면 문구를 바꿀 때 검사가 어긋납니다.
export const siteTitle = () => readIndexHtml().match(/<title>([^<]*)<\/title>/)?.[1] ?? ''

export const go = (page, url, route) => page.goto(`${url}/#${route}`)

// 라우트가 그려져서 main 안에 내용이 생길 때까지
export const ready = (page) => page.waitForSelector('main#main *')

// 케이스 라우트는 프로젝트 목록의 카드에서 찾습니다. 새 케이스가 생겨도 검사 대상에 자동으로 들어옵니다.
export async function discoverCases(page, url) {
  await go(page, url, '/project')
  await page.waitForSelector('.pcard')
  return page.$$eval('.pcard', (cards) => cards.map((c) => ({ route: c.getAttribute('href').slice(1), title: c.querySelector('h2').textContent })))
}

// 책상 위에서 누를 수 있는 물건들의 aria-label ('수상 열기' 같은 것)
export async function deskLabels(page, url) {
  await go(page, url, '/desk')
  await page.waitForSelector('.hs')
  return page.$$eval('.hs', (els) => els.map((e) => e.getAttribute('aria-label')))
}
