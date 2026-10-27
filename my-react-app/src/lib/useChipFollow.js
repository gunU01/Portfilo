import { useEffect } from 'react'

// 모바일에서 가로로 넘기는 목차(.toc): 읽는 위치가 바뀌면 강조된 칩이 가운데 오도록 목차 안에서만 옮깁니다.
// 넓은 화면의 세로 목차에서는 하지 않습니다.
export function useChipFollow(active) {
  useEffect(() => {
    if (!window.matchMedia('(max-width: 900px)').matches) return
    const toc = document.querySelector('.toc')
    const chip = toc?.querySelector('[aria-current="true"]')
    if (chip) toc.scrollTo({ left: chip.offsetLeft - toc.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' })
  }, [active])
}
