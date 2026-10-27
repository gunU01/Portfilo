import { useEffect } from 'react'

// 막대 도식(.chart)이 화면에 들어오면 is-in 을 붙여 막대가 왼쪽부터 차오르게 합니다. 모션 줄이기 설정에서는 처음부터 채워 둡니다.
// 접힌 항목 안의 도식은 펼쳐져 보이는 때에 맞춰 차오릅니다.
export function useGrow() {
  useEffect(() => {
    const els = [...document.querySelectorAll('.chart')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.3 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
