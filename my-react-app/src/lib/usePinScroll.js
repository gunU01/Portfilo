import { useEffect, useRef } from 'react'
import { onScrollFrame } from './onScrollFrame.js'

// 스크롤하는 동안 화면에 고정되는 구간(.pin)의 단계를 정합니다. 돌려주는 ref 를 구간 전체(section)에 답니다.
//  - 구간 안에 고정되는 무대(.pin__stage, position: sticky)와 스크롤 길이를 만드는 빈 칸(.pin__track)이 있어야 합니다.
//  - data-step: 지금 단계(0 ~ steps-1). 스타일은 이 값으로 켜고 끕니다.
//  - --p(0~1): 구간을 지나간 정도.
// 모션 줄이기 설정에서는 고정하지 않고 마지막 단계(모두 켜진 모습)로 둡니다.
export function usePinScroll(steps) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const stage = el?.querySelector('.pin__stage')
    if (!el || !stage) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.dataset.step = String(steps - 1)
      el.classList.add('is-static')
      return undefined
    }
    const top = Number.parseFloat(getComputedStyle(stage).top) || 0
    return onScrollFrame(() => {
      const travel = el.offsetHeight - stage.offsetHeight
      const p = travel > 0 ? Math.max(0, Math.min(1, (top - el.getBoundingClientRect().top) / travel)) : 0
      el.style.setProperty('--p', p.toFixed(3))
      el.dataset.step = String(Math.min(steps - 1, Math.floor(p * steps)))
    })
  }, [steps])
  return ref
}
