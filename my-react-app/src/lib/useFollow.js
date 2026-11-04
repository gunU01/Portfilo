import { useEffect } from 'react'

// 마우스가 .follow 요소 위에 있는 동안, 요소 가운데를 0 으로 한 마우스 위치(-1~1)를 --fx/--fy 로 남깁니다.
// 마우스가 나가면 0 으로 돌려놓습니다. 카드의 기울기, 버튼의 끌려오는 효과가 이 값을 씁니다(스타일은 effects.css).
// 터치나 펜 입력에서는 하지 않습니다.
const FOLLOW = '.follow'

export function useFollow() {
  useEffect(() => {
    let raf = 0
    let pending = null
    // 마우스가 움직일 때마다 읽고 쓰면 화면 배치를 그때마다 다시 계산하므로, 프레임당 한 번만 반영합니다.
    const flush = () => {
      raf = 0
      if (!pending) return
      const { el, x, y } = pending
      pending = null
      const r = el.getBoundingClientRect()
      const clamp = (v) => Math.max(-1, Math.min(1, v))
      el.style.setProperty('--fx', String(clamp(((x - r.left) / r.width - 0.5) * 2)))
      el.style.setProperty('--fy', String(clamp(((y - r.top) / r.height - 0.5) * 2)))
    }
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const el = e.target instanceof Element ? e.target.closest(FOLLOW) : null
      if (!el) return
      pending = { el, x: e.clientX, y: e.clientY }
      if (!raf) raf = requestAnimationFrame(flush)
    }
    const onOut = (e) => {
      const el = e.target instanceof Element ? e.target.closest(FOLLOW) : null
      if (!el || el.contains(e.relatedTarget)) return
      if (pending?.el === el) pending = null
      el.style.setProperty('--fx', '0')
      el.style.setProperty('--fy', '0')
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
    }
  }, [])
}
