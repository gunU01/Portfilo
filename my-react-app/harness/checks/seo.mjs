import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist')

// 링크 미리보기(카카오톡, 슬랙 등)는 자바스크립트를 실행하지 않고 이 index.html 만 읽습니다.
export default {
  name: 'seo',
  about: '링크 미리보기에 쓰이는 정보가 index.html 에 있고, 외부 CDN 을 쓰지 않는다',
  async run({ t }) {
    const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8')
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
      assert.doesNotMatch(html, /<(script|link)[^>]+(src|href)="https?:/)
      const assets = fs.readdirSync(path.join(DIST, 'assets')).filter((f) => f.endsWith('.css'))
      for (const f of assets) assert.doesNotMatch(fs.readFileSync(path.join(DIST, 'assets', f), 'utf8'), /url\(["']?https?:|@import\s+url\(["']?https?:/, `${f} 에 외부 주소가 있습니다`)
    })
  },
}
