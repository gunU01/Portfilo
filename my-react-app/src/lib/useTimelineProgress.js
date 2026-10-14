import { useEffect, useRef } from 'react'
import { onScrollFrame } from './onScrollFrame.js'

// 화면 위쪽 62% 선(READ_LINE)이 목록을 지나가는 만큼 진행선을 채웁니다. 돌려주는 ref 를 목록(ol)에 답니다.
//  - 목록에 --fill(px): 목록 맨 위에서 그 선까지의 길이. 진행선의 길이가 됩니다.
//  - 항목마다 is-passed: 점이 그 선을 지났음. 위로 올리면 다시 빠집니다.
//  - 지나간 항목 중 마지막 하나에만 is-current: 지금 읽고 있는 항목.
// 스타일은 effects.css 의 .tl--live 입니다.
const READ_LINE = 0.62

export function useTimelineProgress(itemSelector = '.tl__item') {
  const ref = useRef(null)
  useEffect(() => {
    const list = ref.current
    if (!list) return undefined
    return onScrollFrame(() => {
      const line = window.innerHeight * READ_LINE
      const box = list.getBoundingClientRect()
      list.style.setProperty('--fill', `${Math.max(0, Math.min(box.height, line - box.top))}px`)
      let current = null
      list.querySelectorAll(itemSelector).forEach((el) => {
        const passed = el.getBoundingClientRect().top + 12 < line // 12px: 점의 가운데
        el.classList.toggle('is-passed', passed)
        el.classList.remove('is-current')
        if (passed) current = el
      })
      current?.classList.add('is-current')
    })
  }, [itemSelector])
  return ref
}
