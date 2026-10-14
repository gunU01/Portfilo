import { useEffect, useRef } from 'react'
import { trackPointer } from './usePointerVars.js'

// 책상 장면용. 마우스를 따라 층마다 다르게 살짝 움직이도록 --px/--py(-1~1)를 갱신합니다(포인터가 정밀한 기기에서만).
// 좁은 화면에서는 가로 스크롤 장면의 가운데(노트북)가 먼저 보이게 합니다. 돌려주는 ref 를 장면 상자에 답니다.
export function useParallax() {
  const boxRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    if (!box) return undefined
    box.scrollLeft = (box.scrollWidth - box.clientWidth) * 0.5

    return trackPointer(box)
  }, [])

  return boxRef
}
