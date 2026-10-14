import { useEffect, useRef } from 'react'

// 목록의 항목이 화면 위쪽 62% 선을 지나갔는지에 따라 항목에 is-passed 를 붙이고 뗍니다. 위로 올리면 다시 빠집니다.
// 활동 기록의 선이 스크롤에 맞춰 차오르는 효과에 씁니다. 돌려주는 ref 를 목록 요소에 답니다.
export function useScrollPassed(itemSelector) {
  const ref = useRef(null)
  useEffect(() => {
    const list = ref.current
    if (!list) return undefined
    let raf = 0
    const update = () => {
      const line = window.innerHeight * 0.62
      list.querySelectorAll(itemSelector).forEach((el) => el.classList.toggle('is-passed', el.getBoundingClientRect().top < line))
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [itemSelector])
  return ref
}
