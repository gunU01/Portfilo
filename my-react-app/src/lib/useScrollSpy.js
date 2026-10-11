import { useEffect, useState } from 'react'

// 화면 위쪽에 걸린 섹션의 id 를 돌려줍니다. 홈의 우측 목차와 같은 곳에서 씁니다.
export function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    // 마지막 섹션은 짧아서 관찰 구간에 닿지 못하므로, 페이지 끝에 닿으면 마지막으로 처리
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6) setActive(ids[ids.length - 1])
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [ids])

  return active
}
