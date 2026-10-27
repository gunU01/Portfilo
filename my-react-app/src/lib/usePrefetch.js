import { useEffect, useRef } from 'react'

// 다음 페이지 코드를 미리 받아 둡니다.
// - idle: 한가할 때 받을 함수들(requestIdleCallback 이 없으면 1.5초 뒤)
// - hover: { '/desk': 함수 } 처럼, 그 경로로 가는 링크에 마우스를 올리면 받을 함수
export function usePrefetch({ idle = [], hover = {} }) {
  // 렌더 중에는 ref 를 고치지 않으므로, 매 렌더 뒤에 최신 값을 적어 둡니다
  const latest = useRef({ idle, hover })
  useEffect(() => {
    latest.current = { idle, hover }
  })

  useEffect(() => {
    const later = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500))
    const handle = later(() => latest.current.idle.forEach((load) => load()))
    const onOver = (e) => {
      const href = e.target.closest?.('a')?.getAttribute('href')
      if (href?.startsWith('#/')) latest.current.hover[href.slice(1)]?.()
    }
    document.addEventListener('pointerover', onOver)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle)
      else clearTimeout(handle)
      document.removeEventListener('pointerover', onOver)
    }
  }, [])
}
