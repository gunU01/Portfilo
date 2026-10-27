// els 가 화면에 들어오면 className 을 한 번만 붙이고 관찰을 멈춥니다. 모션 줄이기 설정에서는 바로 붙입니다.
// 돌려주는 함수를 부르면 관찰을 끊습니다. 등장 효과(useReveal)와 막대 차오름(useGrow)이 같이 씁니다.
export function observeOnce(els, className, options) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add(className))
    return () => {}
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add(className)
        io.unobserve(e.target)
      }
    })
  }, options)
  els.forEach((el) => io.observe(el))
  return () => io.disconnect()
}
