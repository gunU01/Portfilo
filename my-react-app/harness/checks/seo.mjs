import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { DIST, ROOT, readIndexHtml, go } from '../lib/site.mjs'
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
    // 주소와 소유권 확인 코드를 주고 따로 빌드해서(임시 폴더), 주소가 필요한 태그와 사이트맵이 실제로 만들어지는지 봅니다.
    const buildWith = (env) => {
      const out = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-build-'))
      execFileSync('npx', ['vite', 'build', '--outDir', out, '--emptyOutDir'], { cwd: ROOT, env: { ...process.env, SITE_URL: '', VERCEL_PROJECT_PRODUCTION_URL: '', ...env }, stdio: 'ignore' })
      return { out, html: fs.readFileSync(path.join(out, 'index.html'), 'utf8') }
    }
    await t('배포 주소(SITE_URL)를 주면 canonical, og:url, og:image, 사이트맵과 robots 의 Sitemap 줄이 생긴다', async () => {
      const { out, html: built } = buildWith({ SITE_URL: 'https://example.test/' })
      assert.match(built, /<link[^>]+rel="canonical"[^>]+href="https:\/\/example\.test\/"/)
      assert.match(built, /property="og:image"[^>]+content="https:\/\/example\.test\/og\.png"/)
      assert.match(built, /property="og:url"[^>]+content="https:\/\/example\.test\/"/)
      assert.match(fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8'), /<loc>https:\/\/example\.test\/<\/loc>/)
      assert.match(fs.readFileSync(path.join(out, 'robots.txt'), 'utf8'), /Sitemap: https:\/\/example\.test\/sitemap\.xml/)
    })
    await t('주소를 안 줘도 Vercel 이 주는 운영 주소(VERCEL_PROJECT_PRODUCTION_URL)를 쓴다', async () => {
      const { out } = buildWith({ VERCEL_PROJECT_PRODUCTION_URL: 'portfolio.example.test' })
      assert.match(fs.readFileSync(path.join(out, 'sitemap.xml'), 'utf8'), /<loc>https:\/\/portfolio\.example\.test\/<\/loc>/)
    })
    await t('구글, 네이버, Bing 소유권 확인 코드를 주면 meta 태그가 들어가고, 안 주면 없다', async () => {
      assert.doesNotMatch(html, /google-site-verification|naver-site-verification|msvalidate\.01/)
      const { html: built } = buildWith({ GOOGLE_SITE_VERIFICATION: 'g-code', NAVER_SITE_VERIFICATION: 'n-code', BING_SITE_VERIFICATION: 'b-code' })
      assert.match(built, /name="google-site-verification"[^>]+content="g-code"/)
      assert.match(built, /name="naver-site-verification"[^>]+content="n-code"/)
      assert.match(built, /name="msvalidate\.01"[^>]+content="b-code"/)
    })
    await t('스크립트 없이 읽히는 본문(<noscript>)에 블로그 글 제목이 있다', async () => {
      const body = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? ''
      assert.ok(body.includes('토스 계좌 개설'), '블로그 글이 본문에 없습니다')
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
