export const scrollToId = (id) => document.getElementById(id)?.scrollIntoView()

// 페이지 코드를 늦게 받는 경로(?s=<섹션 id>)에서는 이동하려는 순간 대상이 아직 없을 수 있습니다.
// 대상이 생길 때까지 프레임마다 확인하다가(최대 약 3초) 생기면 이동합니다. 돌려주는 함수를 부르면 멈춥니다.
export function scrollToIdWhenReady(id, frames = 180) {
  let raf = 0
  const tick = () => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView()
    else if (frames-- > 0) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

// 뒤로·앞으로 가기로 돌아왔을 때: 페이지가 충분히 그려져 그 높이까지 내려갈 수 있을 때까지 기다렸다가(최대 약 2초) 그 위치로 즉시 이동합니다.
export function scrollToYWhenReady(y, frames = 120) {
  let raf = 0
  const tick = () => {
    const room = document.documentElement.scrollHeight - window.innerHeight
    if (room >= y - 2 || frames-- <= 0) jumpTo(y)
    else raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

// 전체 스크롤이 부드럽게 설정되어 있어도(CSS scroll-behavior) 애니메이션 없이 그 높이로 바로 이동합니다.
// behavior: 'instant' 만으로는 진행 중이던 부드러운 스크롤이 끝까지 지워지지 않는 경우가 있어, 잠깐 auto 로 바꿔 이동합니다.
export function jumpTo(top) {
  const root = document.documentElement
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, top)
  root.style.scrollBehavior = ''
}
