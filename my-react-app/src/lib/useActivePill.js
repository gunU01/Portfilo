import { useLayoutEffect, useRef } from 'react'

// 메뉴 뒤에서 현재 메뉴(aria-current="page")를 따라다니는 알약의 위치와 크기를 CSS 변수(--x/--y/--w/--h)로 남깁니다.
// 돌려주는 두 ref 를 메뉴 묶음과 알약 요소에 답니다. 현재 메뉴가 없으면(책상 등) 알약을 숨깁니다(.is-on 을 뗌).
// 글꼴이 늦게 로드돼 글자 폭이 바뀌어도 어긋나지 않도록, 메뉴 묶음의 크기가 변할 때와 글꼴 로드가 끝났을 때 다시 잽니다.
// current 는 현재 메뉴가 바뀌었음을 알리는 값입니다.
export function useActivePill(current) {
  const linksRef = useRef(null)
  const pillRef = useRef(null)

  useLayoutEffect(() => {
    const links = linksRef.current
    const pill = pillRef.current
    if (!links || !pill) return undefined
    const place = () => {
      const active = links.querySelector('[aria-current="page"]')
      if (!active) {
        pill.classList.remove('is-on')
        return
      }
      const first = !pill.classList.contains('is-on')
      pill.style.transition = first ? 'none' : '' // 처음 놓일 때는 미끄러지지 않고 바로 자리 잡습니다
      pill.style.setProperty('--x', `${active.offsetLeft}px`)
      pill.style.setProperty('--y', `${active.offsetTop}px`)
      pill.style.setProperty('--w', `${active.offsetWidth}px`)
      pill.style.setProperty('--h', `${active.offsetHeight}px`)
      pill.classList.add('is-on')
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(links)
    links.querySelectorAll('a').forEach((a) => ro.observe(a))
    document.fonts?.ready.then(place)
    return () => ro.disconnect()
  }, [current])

  return { linksRef, pillRef }
}
