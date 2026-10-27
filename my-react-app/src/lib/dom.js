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
