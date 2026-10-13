import { useEffect } from 'react'

// styles/ink.css 와 같은 목록이어야 합니다.
const INK =
  ".btn--solid, .btn--desk, .nav__desk, .ov__card, .nav__links a, .pj__tabs button:not([aria-pressed='true']), .xlink, .footer__rows a, .desk__list a"

// 번지는 원의 중심과 크기를 CSS 변수로 남깁니다. 원 안쪽 58%가 꽉 찬 색이라,
// 중심에서 가장 먼 모서리까지의 거리가 그 반경이 되도록 지름을 잡습니다.
function place(el, e) {
  const r = el.getBoundingClientRect()
  const x = Math.min(Math.max(e.clientX - r.left, 0), r.width)
  const y = Math.min(Math.max(e.clientY - r.top, 0), r.height)
  const far = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y))
  el.style.setProperty('--ix', `${x}px`)
  el.style.setProperty('--iy', `${y}px`)
  el.style.setProperty('--ir', `${(2 * far) / 0.58}px`)
}

const target = (e) => {
  const el = e.target instanceof Element ? e.target.closest(INK) : null
  return el && !el.contains(e.relatedTarget) ? el : null
}

// 들어올 때는 마우스가 닿은 자리에서 번지고, 나갈 때는 마우스가 빠져나간 자리로 색이 걷힙니다.
// 번지는 도중에 나가면 원이 튀어 보이므로, 거의 다 퍼진 뒤에만 중심을 옮깁니다.
export function useInkHover() {
  useEffect(() => {
    const onOver = (e) => {
      const el = target(e)
      if (el) place(el, e)
    }
    const onOut = (e) => {
      const el = target(e)
      if (!el) return
      const scale = new DOMMatrixReadOnly(getComputedStyle(el, '::before').transform).a
      if (scale >= 0.97) place(el, e)
    }
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [])
}
