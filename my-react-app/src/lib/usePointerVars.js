import { useEffect, useRef } from 'react'

const matches = (q) => window.matchMedia(q).matches

// 상자 안의 마우스 위치를 --px/--py(-1~1, 상자 가운데가 0)로 남깁니다. 터치 기기나 모션 줄이기 설정에서는 아무것도 하지 않습니다.
// 돌려주는 함수를 부르면 멈춥니다.
export function trackPointer(box) {
  if (!box || matches('(pointer: coarse)') || matches('(prefers-reduced-motion: reduce)')) return () => {}
  let raf = 0
  let r = null // 상자 위치와 크기: 마우스가 들어올 때(와 창 크기가 바뀔 때) 한 번만 읽습니다
  const measure = () => {
    r = box.getBoundingClientRect()
  }
  const onMove = (e) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      if (!r) measure()
      box.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2))
      box.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2))
    })
  }
  const forget = () => {
    r = null
  }
  box.addEventListener('pointerenter', measure)
  box.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('resize', forget)
  window.addEventListener('scroll', forget, { passive: true })
  return () => {
    cancelAnimationFrame(raf)
    box.removeEventListener('pointerenter', measure)
    box.removeEventListener('pointermove', onMove)
    window.removeEventListener('resize', forget)
    window.removeEventListener('scroll', forget)
  }
}

// 요소에 달면 그 안의 마우스 위치가 CSS 변수(--px/--py)로 들어갑니다. 홈 첫 화면의 큰 글자가 쓰는 식입니다.
export function usePointerVars() {
  const ref = useRef(null)
  useEffect(() => trackPointer(ref.current), [])
  return ref
}
