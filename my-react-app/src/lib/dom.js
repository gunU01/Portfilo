// 목차 버튼처럼 사람이 눌러서 옮기는 이동만 부드럽게 합니다(모션 줄이기 설정에서는 바로). 화면을 옮길 때의 이동은 늘 바로 갑니다.
export const scrollToId = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

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

// 애니메이션 없이 그 높이로 바로 이동합니다. 진행 중이던 부드러운 스크롤(목차 버튼)도 여기서 멈춥니다.
export function jumpTo(top) {
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}
