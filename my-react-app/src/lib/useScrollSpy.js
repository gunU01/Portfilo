import { useEffect, useState } from 'react'

// 화면 위쪽에 걸린 섹션의 id 를 돌려줍니다. ids 는 바뀌지 않는 배열(모듈 상수나 useMemo)이어야 합니다.
// lastAtBottom: 마지막 섹션은 짧아서 관찰 구간에 닿지 못할 수 있으니, 페이지 끝에 닿으면 마지막으로 처리합니다.
export function useScrollSpy(ids, { rootMargin = '-30% 0px -60% 0px', lastAtBottom = false } = {}) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin },
    )
    els.forEach((el) => io.observe(el))

    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) setActive(ids[ids.length - 1])
    }
    if (lastAtBottom) window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      if (lastAtBottom) window.removeEventListener('scroll', onScroll)
    }
  }, [ids, rootMargin, lastAtBottom])

  return active
}
