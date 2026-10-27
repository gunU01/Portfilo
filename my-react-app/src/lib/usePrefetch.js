import { useEffect } from 'react'

// 다음 페이지 코드를 미리 받아 둡니다.
// - idle: 한가할 때 받을 함수들(requestIdleCallback 이 없으면 1.5초 뒤)
// - hover: { '/desk': 함수 } 처럼, 그 경로로 가는 링크에 마우스를 올리면 받을 함수
export function usePrefetch({ idle = [], hover = {} }) {
  useEffect(() => {
    const later = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500))
    const handle = later(() => idle.forEach((load) => load()))
    const onOver = (e) => {
      for (const [route, load] of Object.entries(hover)) if (e.target.closest?.(`a[href="#${route}"]`)) load()
    }
    document.addEventListener('pointerover', onOver)
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle)
      else clearTimeout(handle)
      document.removeEventListener('pointerover', onOver)
    }
    // idle 과 hover 는 한 번만 읽으면 되는 상수(App 의 loaders)입니다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
