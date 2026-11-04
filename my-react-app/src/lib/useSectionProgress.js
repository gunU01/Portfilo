import { useEffect, useRef, useState } from 'react'
import { onScrollFrame } from './onScrollFrame.js'

// 화면 위쪽 35% 지점에 걸린 위치를 섹션 번호의 소수(0 ~ n-1)로 돌려줍니다. 예: 1.5 는 두 번째와 세 번째 섹션의 한가운데.
// 목차가 스크롤에 맞춰 연속으로 돌아가게 하는 값입니다. ids 는 바뀌지 않는 배열이어야 합니다.
// 같이 돌려주는 scrubTo(f) 는 반대로 그 값에 해당하는 높이로 바로 스크롤합니다(드래그용).
const PROBE = 0.35

function tops(ids) {
  return ids.map((id) => {
    const el = document.getElementById(id)
    return el ? el.getBoundingClientRect().top + window.scrollY : 0
  })
}

export function useSectionProgress(ids) {
  const [f, setF] = useState(0)
  const cache = useRef([])

  useEffect(() => {
    const read = () => {
      const t = tops(ids)
      cache.current = t
      const y = window.scrollY + window.innerHeight * PROBE
      let i = 0
      while (i < ids.length - 1 && y >= t[i + 1]) i += 1
      const end = i < ids.length - 1 ? t[i + 1] : document.documentElement.scrollHeight
      let v = i + Math.min(1, Math.max(0, (y - t[i]) / Math.max(1, end - t[i])))
      // 마지막 섹션은 짧아서 이 지점에 닿지 못할 수 있으니, 페이지 끝에 닿으면 마지막으로 처리합니다.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) v = ids.length - 1
      setF(Math.min(ids.length - 1, v))
    }
    return onScrollFrame(read)
  }, [ids])

  const scrubTo = (value) => {
    const t = tops(ids)
    const v = Math.min(ids.length - 1, Math.max(0, value))
    const i = Math.min(ids.length - 2, Math.floor(v))
    const frac = v - i
    const probe = t[i] + (t[i + 1] - t[i]) * frac
    window.scrollTo(0, probe - window.innerHeight * PROBE)
  }

  return [f, scrubTo]
}
