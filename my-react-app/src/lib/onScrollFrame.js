// 스크롤과 창 크기 변화를 프레임당 한 번으로 모아서 알려 줍니다. 스크롤에 맞춰 값을 갱신하는 훅들이 같이 씁니다.
// 처음에도 한 번 부르고, 돌려주는 함수를 부르면 구독을 끊습니다.
export function onScrollFrame(update) {
  let raf = 0
  const schedule = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(update)
  }
  update()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
  }
}
