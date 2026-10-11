import { useEffect } from 'react'

// .reveal 요소가 화면에 들어오면 is-in 을 붙입니다. 모션 줄이기 설정에서는 처음부터 보이게 둡니다.
// 관찰이 실패해도 내용이 숨겨져 있지 않도록 2.5초 뒤에는 모두 보이게 합니다.
export function useReveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll('.reveal')]
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
      { rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const fallback = setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 2500)
    return () => {
      clearTimeout(fallback)
      io.disconnect()
    }
  }, [])
}
