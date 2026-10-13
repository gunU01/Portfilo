import { useEffect, useRef } from 'react'

const matches = (q) => window.matchMedia(q).matches

// 책상 장면용. 마우스를 따라 층마다 다르게 살짝 움직이도록 --px/--py(-1~1)를 갱신합니다(포인터가 정밀한 기기에서만).
// 좁은 화면에서는 가로 스크롤 장면의 가운데(노트북)가 먼저 보이게 합니다. 돌려주는 ref 를 장면 상자에 답니다.
export function useParallax() {
  const boxRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return undefined
    box.scrollLeft = (box.scrollWidth - box.clientWidth) * 0.5

    if (matches('(pointer: coarse)') || matches('(prefers-reduced-motion: reduce)')) return undefined
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = box.getBoundingClientRect()
        box.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2))
        box.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2))
      })
    }
    box.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      box.removeEventListener('pointermove', onMove)
    }
  }, [])

  return boxRef
}
