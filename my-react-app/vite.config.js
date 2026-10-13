import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' + 해시 라우팅 → GitHub Pages(하위 경로)·Vercel 어디에 올려도 동작합니다.
export default defineConfig({
  base: './',
  plugins: [react()],
})
