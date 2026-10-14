import { useEffect } from 'react'

// 마우스가 .follow 요소 위에 있는 동안, 요소 가운데를 0 으로 한 마우스 위치(-1~1)를 --fx/--fy 로 남깁니다.
// 마우스가 나가면 0 으로 돌려놓습니다. 카드의 기울기, 버튼의 끌려오는 효과가 이 값을 씁니다(스타일은 effects.css).
// 터치나 펜 입력에서는 하지 않습니다.
const FOLLOW = '.follow'

export function useFollow() {
  useEffect(() => {
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const el = e.target instanceof Element ? e.target.closest(FOLLOW) : null
      if (!el) return
      const r = el.getBoundingClientRect()
      const clamp = (v) => Math.max(-1, Math.min(1, v))
      el.style.setProperty('--fx', String(clamp(((e.clientX - r.left) / r.width - 0.5) * 2)))
      el.style.setProperty('--fy', String(clamp(((e.clientY - r.top) / r.height - 0.5) * 2)))
    }
    const onOut = (e) => {
      const el = e.target instanceof Element ? e.target.closest(FOLLOW) : null
      if (!el || el.contains(e.relatedTarget)) return
      el.style.setProperty('--fx', '0')
      el.style.setProperty('--fy', '0')
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerout', onOut)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
    }
  }, [])
}
