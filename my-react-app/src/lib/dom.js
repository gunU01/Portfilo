// 부드러운 스크롤이 진행 중일 수 있는 시각(ms). jumpTo 가 이것을 보고 그 스크롤을 확실히 멈춥니다.
let smoothUntil = 0

// 목차 버튼처럼 사람이 눌러서 옮기는 이동만 부드럽게 합니다(모션 줄이기 설정에서는 바로). 화면을 옮길 때의 이동은 늘 바로 갑니다.
export function scrollToId(id) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) smoothUntil = performance.now() + 1500
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
}

// 지금 보고 있는 화면의 메뉴(이름, Home 등)를 다시 누르면 같은 주소라 화면이 안 바뀌므로, 직접 맨 위로 부드럽게 올라갑니다.
export function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reduce) smoothUntil = performance.now() + 1500
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}

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

// 애니메이션 없이 그 높이로 바로 이동합니다. 진행 중이던 부드러운 스크롤(목차 버튼)이 있으면 그것도 멈춥니다.
// 브라우저는 부드러운 스크롤을 코드 한 줄로 확실히 지우지 못하는 경우가 있어서(옵션 없이 부르거나 behavior: 'instant' 로 불러도 남음),
// 목차 버튼의 부드러운 스크롤이 막 지나간 뒤라면 몇 프레임 동안 그 높이에 머물렀는지 확인하고 밀려났으면 다시 놓습니다.
export function jumpTo(top, frames = 12) {
  window.scrollTo(0, top)
  if (performance.now() >= smoothUntil) return
  const settle = () => {
    if (Math.abs(window.scrollY - top) > 1) window.scrollTo(0, top)
    if (frames-- > 0) requestAnimationFrame(settle)
  }
  requestAnimationFrame(settle)
}
