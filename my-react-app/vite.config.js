import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 모든 페이지가 쓰는 글꼴(지금 쓰는 글자만 담은 파일)을 HTML 이 열리자마자 받게 합니다.
// 파일 이름에 해시가 붙어 index.html 에 직접 적을 수 없어서, 빌드 결과에서 찾아 넣습니다.
function preloadFont() {
  return {
    name: 'preload-font',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((f) => /NanumSquareNeo-a-.*\.woff2$/.test(f))
        if (!file) return html
        return [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: `./${file}` }, injectTo: 'head-prepend' }]
      },
    },
  }
}

// 링크를 공유할 때 보이는 미리보기 그림과 주소. 메신저가 읽으려면 절대 주소여야 해서, 배포 주소를 알 때만 넣습니다.
// 주소는 빌드할 때 SITE_URL 환경 변수로 줍니다(예: SITE_URL=https://example.com npm run build). 없으면 이 태그들은 넣지 않습니다.
function shareMeta(site) {
  return {
    name: 'share-meta',
    transformIndexHtml() {
      if (!site) return []
      const base = site.replace(/\/+$/, '')
      return [
        { tag: 'meta', attrs: { property: 'og:url', content: `${base}/` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image', content: `${base}/og.png` }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' }, injectTo: 'head' },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
      ]
    },
  }
}

// base './' + 해시 라우팅 → GitHub Pages(하위 경로)·Vercel 어디에 올려도 동작합니다.
export default defineConfig({
  base: './',
  plugins: [react(), preloadFont(), shareMeta(process.env.SITE_URL)],
})
