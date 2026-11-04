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
    const items = [...list.querySelectorAll(itemSelector)]
    return onScrollFrame(() => {
      const line = window.innerHeight * READ_LINE
      // 읽기를 모두 끝낸 뒤에 쓰기: 항목마다 읽고 쓰면 화면 배치를 항목 수만큼 다시 계산합니다.
      const box = list.getBoundingClientRect()
      const tops = items.map((el) => el.getBoundingClientRect().top)
      list.style.setProperty('--fill', `${Math.max(0, Math.min(box.height, line - box.top))}px`)
      let current = -1
      items.forEach((el, i) => {
        const passed = tops[i] + 12 < line // 12px: 점의 가운데
        if (passed) current = i
        if (el.classList.contains('is-passed') !== passed) el.classList.toggle('is-passed', passed)
      })
      items.forEach((el, i) => {
        if (el.classList.contains('is-current') !== (i === current)) el.classList.toggle('is-current', i === current)
      })
    })
  }, [itemSelector])
  return ref
}
