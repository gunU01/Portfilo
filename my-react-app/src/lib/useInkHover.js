import { useEffect } from 'react'

// styles/ink.css 와 같은 목록이어야 합니다.
const INK =
  ".btn--solid, .btn--desk, .nav__desk, .ov__card, .nav__links a, .pj__tabs button:not([aria-pressed='true']), .xlink, .footer__rows a, .desk__list a"

// 호버가 시작되는 순간, 마우스가 들어온 자리와 그 자리에서 모서리까지 덮는 데 필요한 원의 크기를 CSS 변수로 남깁니다.
// 원 안쪽 58%가 꽉 찬 색이라, 가장 먼 모서리까지의 거리가 그 반경이 되도록 지름을 잡습니다.
export function useInkHover() {
  useEffect(() => {
    const onOver = (e) => {
      const el = e.target instanceof Element ? e.target.closest(INK) : null
      if (!el || el.contains(e.relatedTarget)) return
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const far = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y))
      el.style.setProperty('--ix', `${x}px`)
      el.style.setProperty('--iy', `${y}px`)
      el.style.setProperty('--ir', `${(2 * far) / 0.58}px`)
    }
    document.addEventListener('pointerover', onOver)
    return () => document.removeEventListener('pointerover', onOver)
  }, [])
}
