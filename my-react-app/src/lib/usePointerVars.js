import { useEffect, useRef } from 'react'

const matches = (q) => window.matchMedia(q).matches

// 상자 안의 마우스 위치를 --px/--py(-1~1, 상자 가운데가 0)로 남깁니다. 터치 기기나 모션 줄이기 설정에서는 아무것도 하지 않습니다.
// 돌려주는 함수를 부르면 멈춥니다.
export function trackPointer(box) {
  if (!box || matches('(pointer: coarse)') || matches('(prefers-reduced-motion: reduce)')) return () => {}
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
}

// 요소에 달면 그 안의 마우스 위치가 CSS 변수(--px/--py)로 들어갑니다. 홈 첫 화면의 큰 글자가 쓰는 식입니다.
export function usePointerVars() {
  const ref = useRef(null)
  useEffect(() => trackPointer(ref.current), [])
  return ref
}
