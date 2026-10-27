import { useEffect } from 'react'

// 다음 페이지 코드를 미리 받아 둡니다. config 는 렌더마다 새로 만들지 않는 값(모듈 상수)으로 넘깁니다.
// - config.idle: 한가할 때 받을 함수들(requestIdleCallback 이 없으면 1.5초 뒤)
// - config.hover: { '/desk': 함수 } 처럼, 그 경로로 가는 링크(#/desk, #/desk/, #/desk?s=… 모두)에 마우스를 올리면 받을 함수
export function usePrefetch(config) {
  useEffect(() => {
    const later = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500))
    const handle = later(() => config.idle.forEach((load) => load()))
    const onOver = (e) => {
      const href = e.target.closest?.('a')?.getAttribute('href')
      if (!href?.startsWith('#/')) return
      const route = href.slice(1).split('?')[0].replace(/\/+$/, '') || '/'
      config.hover[route]?.()
    }
    document.addEventListener('pointerover', onOver)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle)
      else clearTimeout(handle)
      document.removeEventListener('pointerover', onOver)
    }
  }, [config])
}
