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

// base './' + 해시 라우팅 → GitHub Pages(하위 경로)·Vercel 어디에 올려도 동작합니다.
export default defineConfig({
  base: './',
  plugins: [react(), preloadFont()],
})
