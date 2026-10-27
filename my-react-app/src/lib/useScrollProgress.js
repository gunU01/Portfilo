import { useEffect } from 'react'
import { onScrollFrame } from './onScrollFrame.js'

// 페이지를 얼마나 내렸는지(0~1)를 위쪽 진행 막대(.progress)의 --scroll 로 남깁니다.
// 값을 <html> 이 아니라 막대에만 써서, 스크롤할 때마다 문서 전체의 스타일을 다시 계산하지 않게 합니다.
export function useScrollProgress() {
  useEffect(() => {
    let bar = null
    const stop = onScrollFrame(() => {
      if (!bar?.isConnected) bar = document.querySelector('.progress')
      if (!bar) return
      const root = document.documentElement
      const max = root.scrollHeight - window.innerHeight
      bar.style.setProperty('--scroll', max > 0 ? String(Math.min(1, window.scrollY / max)) : '0')
    })
    return stop
  }, [])
}
