import { useEffect } from 'react'
import { onScrollFrame } from './onScrollFrame.js'

// 페이지를 얼마나 내렸는지(0~1)를 <html> 의 --scroll 로 남깁니다. 위쪽의 진행 막대가 이 값을 씁니다.
export function useScrollProgress() {
  useEffect(() => {
    const root = document.documentElement
    const stop = onScrollFrame(() => {
      const max = root.scrollHeight - window.innerHeight
      root.style.setProperty('--scroll', max > 0 ? String(Math.min(1, window.scrollY / max)) : '0')
    })
    return () => {
      stop()
      root.style.removeProperty('--scroll')
    }
  }, [])
}
