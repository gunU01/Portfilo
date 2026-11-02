import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'

// 모든 페이지가 쓰는 글꼴(지금 쓰는 글자만 담은 파일)을 HTML 이 열리자마자 받게 합니다.
// 파일 이름에 해시가 붙어 index.html 에 직접 적을 수 없어서, 빌드 결과에서 찾아 넣습니다.
function preloadFont() {
  return {
    name: 'preload-font',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /Pretendard-a-.*\.woff2$/.test(f))
        if (!file) return html
        return [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `./${file}` }, injectTo: 'head-prepend' }]
      },
    },
  }
}

// 배포 주소: 빌드할 때 SITE_URL 환경 변수 > profile.site.url 순으로 찾습니다.
// 둘 다 비어 있으면 주소가 필요한 태그(og:url, og:image, canonical, sitemap.xml)는 넣지 않습니다. 공유 미리보기는 메신저가 읽으려면 절대 주소여야 합니다.
function siteBase(profile) {
  return (process.env.SITE_URL || profile.site.url || '').replace(/\/+$/, '')
}

// 검색 엔진 등록(Google Search Console, 네이버 서치어드바이저, Bing 웹마스터)의 소유권 확인 태그. 값은 환경 변수 > profile.site.verification 순입니다.
function verificationTags(profile) {
  const v = profile.site.verification ?? {}
  const pick = (env, key) => process.env[env] || v[key] || ''
  return [
    ['google-site-verification', pick('GOOGLE_SITE_VERIFICATION', 'google')],
    ['naver-site-verification', pick('NAVER_SITE_VERIFICATION', 'naver')],
    ['msvalidate.01', pick('BING_SITE_VERIFICATION', 'bing')],
  ]
    .filter(([, content]) => content)
    .map(([name, content]) => ({ tag: 'meta', attrs: { name, content }, injectTo: 'head' }))
}

// 검색 엔진과 링크 미리보기는 자바스크립트를 거의 실행하지 않고 index.html 만 읽습니다. 그래서 사이트 데이터(src/data)에서 읽은 값으로
// 제목과 설명, 구조화 데이터(JSON-LD), 스크립트 없이 읽을 수 있는 본문(<noscript>)을 index.html 에 채웁니다. 문구를 따로 적어 두지 않으므로 데이터만 고치면 됩니다.
// 배포 주소(SITE_URL)를 알면 canonical 과 sitemap.xml 도 만듭니다. 주소가 해시(#/...)라 검색 엔진은 첫 화면(/) 하나만 색인하므로, 그 한 페이지에 핵심 내용이 모두 읽히게 합니다.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = (s) => String(s).replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s*\n\s*/g, ' ').trim()

async function readSiteData() {
  const server = await createServer({ configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, ws: false }, optimizeDeps: { noDiscovery: true } })
  try {
    const load = async (name) => server.ssrLoadModule(`/src/data/${name}.js`)
    const [{ profile }, { cases }, { skillGroups }, { contests }, { awards }, { posts }] = await Promise.all(['profile', 'cases', 'skills', 'contests', 'awards', 'blog'].map(load))
    return { profile, cases, skillGroups, contests, awards, posts }
  } finally {
    await server.close()
  }
}

function noscriptBody({ profile, cases, skillGroups, contests, awards, posts }) {
  const { hero, about, contact } = profile
  const li = (items) => `<ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>`
  return [
    `<header><strong>${esc(profile.name)}</strong> ${esc(profile.roleLine)} · ${esc(profile.school)}</header>`,
    `<main><h1>${esc(hero.title.join(' '))}</h1>`,
    `<p>${esc([hero.lead.intro, ...hero.lead.steps].join(' '))}</p>`,
    `<p>이 사이트는 자바스크립트로 동작합니다. 켜 두면 프로젝트, 소개, 책상(인터랙티브 화면)을 볼 수 있습니다.</p>`,
    `<h2>프로젝트</h2>`,
    li(cases.map((c) => `<a href="#/work/${esc(c.slug)}"><strong>${esc(c.title)}</strong></a> — ${esc(c.subtitle)}<br>${esc(plain(c.summary))}`)),
    `<h2>블로그</h2>`,
    li(posts.map((p) => `<a href="#/blog/${esc(p.slug)}"><strong>${esc(p.title)}</strong></a> — ${esc(p.summary)}`)),
    `<h2>소개</h2>`,
    about.paragraphs.map((p) => `<p>${esc(plain(p))}</p>`).join(''),
    `<h2>기술</h2>`,
    li(skillGroups.map((g) => `<strong>${esc(g.title)}</strong>: ${g.items.map((i) => esc(i.name)).join(', ')}`)),
    `<h2>활동 기록</h2>`,
    li(about.timeline.map((t) => `${esc(t.when)} — ${esc(plain(t.text))}`)),
    `<h2>대회 참가</h2>`,
    li(contests.map((c) => `${esc(c.when)} ${esc(c.title)}`)),
    awards.length ? `<h2>수상</h2>${li(awards.map((a) => `${esc(a.year)} ${esc(a.title)} ${esc(a.result)}`))}` : '',
    `<h2>연락</h2>`,
    li([`GitHub <a href="${esc(contact.github)}">${esc(contact.github)}</a>`]),
    `</main>`,
  ].join('')
}

function jsonLd({ profile }, base) {
  const person = {
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.roleLine,
    description: profile.site.description,
    affiliation: { '@type': 'EducationalOrganization', name: profile.school },
    sameAs: [profile.contact.github].filter(Boolean),
    ...(base ? { url: `${base}/` } : {}),
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [person, { '@type': 'WebSite', name: profile.site.title, inLanguage: 'ko-KR', ...(base ? { url: `${base}/` } : {}) }] })
}

function seoFiles() {
  let data
  return {
    name: 'seo-files',
    async transformIndexHtml(html) {
      data ??= await readSiteData()
      const base = siteBase(data.profile)
      const out = html.replaceAll('{{TITLE}}', esc(data.profile.site.title)).replaceAll('{{DESCRIPTION}}', esc(data.profile.site.description))
      const tags = [
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: jsonLd(data, base), injectTo: 'head' },
        ...verificationTags(data.profile),
        ...(base
          ? [
              { tag: 'link', attrs: { rel: 'canonical', href: `${base}/` }, injectTo: 'head' },
              { tag: 'meta', attrs: { property: 'og:url', content: `${base}/` }, injectTo: 'head' },
              { tag: 'meta', attrs: { property: 'og:image', content: `${base}/og.png` }, injectTo: 'head' },
              { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
              { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
              { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
            ]
          : []),
        { tag: 'noscript', children: noscriptBody(data), injectTo: 'body-prepend' },
      ]
      return { html: out, tags }
    },
    async generateBundle() {
      data ??= await readSiteData()
      const base = siteBase(data.profile)
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}` })
      // 주소가 해시(#/...)라 검색 엔진은 첫 화면(/) 하나만 색인합니다. 그래서 사이트맵에도 첫 화면 하나만 적습니다.
      if (base) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url></urlset>\n` })
    },
  }
}

// base './' + 해시 라우팅 → GitHub Pages(하위 경로)·Vercel 어디에 올려도 동작합니다.
export default defineConfig({
  base: './',
  plugins: [react(), preloadFont(), seoFiles()],
})
