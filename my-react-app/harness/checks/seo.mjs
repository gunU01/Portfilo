import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { DIST, readIndexHtml, go } from '../lib/site.mjs'
import { openPage, waitFor } from '../lib/browser.mjs'

// 링크 미리보기(카카오톡, 슬랙 등)는 자바스크립트를 실행하지 않고 이 index.html 만 읽습니다.
export default {
  name: 'seo',
  about: '링크 미리보기와 검색에 쓰이는 정보가 index.html 에 있고(제목, 설명, 구조화 데이터, 스크립트 없이 읽는 본문, robots.txt), 페이지마다 설명이 바뀌고, 외부 CDN 을 쓰지 않는다',
  async run({ t, browser, url }) {
    const html = readIndexHtml()
    const meta = (attr, key) => html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1]

    await t('언어가 ko', async () => assert.match(html, /<html[^>]*lang="ko"/))
    await t('제목이 있다', async () => assert.match(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '', /문채원/))
    await t('description 과 og:description 이 같다', async () => {
      assert.ok(meta('name', 'description'), 'description 없음')
      assert.equal(meta('property', 'og:description'), meta('name', 'description'))
    })
    await t('og:title 이 <title> 과 같다', async () => assert.equal(meta('property', 'og:title'), html.match(/<title>([^<]*)<\/title>/)[1]))
    await t('설명이 너무 길지 않다(미리보기에서 두 줄 안, 60자 이하)', async () => assert.ok(meta('name', 'description').length <= 60))
    await t('외부 CDN 을 쓰지 않는다(스크립트, 스타일, 글꼴)', async () => {
      assert.doesNotMatch(html.replace(/<link[^>]+rel="canonical"[^>]*>/, ''), /<(script|link)[^>]+(src|href)="https?:/)
      const assets = fs.readdirSync(path.join(DIST, 'assets')).filter((f) => f.endsWith('.css'))
      for (const f of assets) assert.doesNotMatch(fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'), /url\(["']?https?:|@import\s+url\(["']?https?:/, `${f} 에 외부 주소가 있습니다`)
    })

    await t('구조화 데이터(JSON-LD)에 이름과 직무가 있다', async () => {
      const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/)?.[1] ?? 'null')
      const person = ld['@graph'].find((n) => n['@type'] === 'Person')
      assert.equal(person.name, '문채원')
      assert.ok(person.jobTitle)
    })
    await t('스크립트 없이도 읽히는 본문(<noscript>)에 제목과 프로젝트 이름이 있다', async () => {
      const body = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? ''
      assert.match(body, /<h1>/)
      for (const name of ['얼마', '해미', '오늘한입', '토스 BM 분석', '토스 UX 다이어트']) assert.ok(body.includes(name), `${name} 이 본문에 없습니다`)
    })
    await t('robots.txt 가 있고 모든 검색 엔진을 허용한다', async () => {
      assert.match(fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8'), /User-agent: \*\s+Allow: \//)
    })
    await t('페이지마다 설명(description)이 바뀌고, 홈으로 돌아오면 기본으로 돌아온다', async () => {
      const { page, context } = await openPage(browser)
      const desc = () => page.$eval('meta[name="description"]', (e) => e.content)
      await go(page, url, '/')
      const home = await desc()
      await go(page, url, '/project')
      await waitFor(async () => (await desc()) !== home, { message: 'Project 에서 설명이 바뀌지 않았습니다' })
      await go(page, url, '/work/haemi')
      await waitFor(async () => (await desc()).includes('치매'), { message: '해미 케이스에서 설명이 케이스 요약이 아닙니다' })
      await go(page, url, '/')
      await waitFor(async () => (await desc()) === home, { message: '홈으로 돌아와도 기본 설명으로 돌아오지 않았습니다' })
      await context.close()
    })
  },
}
