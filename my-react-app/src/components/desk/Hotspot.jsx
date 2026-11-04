import { useContext, useEffect, useLayoutEffect, useRef } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'
import { PINGS } from './pings.js'

const ON_DELAY = 70 // 마우스가 올라온 뒤 이만큼(ms) 머물러야 켜집니다
const OFF_DELAY = 140 // 마우스가 나간 뒤 이만큼(ms) 지나야 꺼집니다(그 사이 다시 들어오면 그대로 유지)

// 눌러 볼 수 있는 물건. 호버나 포커스 때 살짝 떠오르고(.is-on), 클릭이나 Enter/Space 로 열립니다.
// 떠오르면 물건이 커서 밑에서 빠져나가 호버가 풀렸다 다시 걸리며 떨리므로, 떠오르지 않는 '가만히 있는 감지 영역'(.hs__hit)을
// 물건 뒤에 깔아 둡니다. 물건의 처음 크기(떠오르기 전)만큼이라, 가장자리에서도 호버가 안정적으로 유지됩니다.
export default function Hotspot({ id, children }) {
  const ping = PINGS[id]
  const body = useRef(null)
  const hit = useRef(null)
  useLayoutEffect(() => {
    const b = body.current?.getBBox()
    if (!b || !hit.current) return
    hit.current.setAttribute('x', b.x - 4)
    hit.current.setAttribute('y', b.y - 4)
    hit.current.setAttribute('width', b.width + 8)
    hit.current.setAttribute('height', b.height + 8)
  }, [])
  const { active, setActive, onOpen } = useContext(DeskContext)
  // 마우스를 아주 잠깐 스치거나 가장자리에서 흔들려도 번쩍이지 않도록, 켜질 때와 꺼질 때에 짧은 유예를 둡니다.
  // (키보드 포커스는 바로 켜고 끕니다)
  const timer = useRef(0)
  const set = (on, wait) => {
    clearTimeout(timer.current)
    const apply = () => setActive((v) => (on ? id : v === id ? null : v))
    if (wait > 0) timer.current = setTimeout(apply, wait)
    else apply()
  }
  useEffect(() => () => clearTimeout(timer.current), [])
  const off = () => set(false, 0)
  return (
    <g
      className={active === id ? 'hs is-on' : 'hs'}
      role="button"
      tabIndex={0}
      aria-label={`${titles[id]} 열기`}
      onPointerEnter={() => set(true, ON_DELAY)}
      onPointerLeave={() => set(false, OFF_DELAY)}
      onFocus={() => set(true, 0)}
      onBlur={off}
      onClick={() => onOpen(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(id)
        }
      }}
    >
      <rect className="hs__hit" ref={hit} width="0" height="0" fill="transparent" />
      <g className="hs__body" ref={body}>
        {children}
      </g>
      {/* 눌러 볼 수 있다는 표시(만화에서 반짝임을 나타내는 각진 별. 흑백으로 그려 장면의 톤과 맞춥니다): 평소에만 보이고, 가리키거나 패널이 열리면 사라집니다(스타일은 desk.css) */}
      {ping && (
        <g className="hs__ping" transform={`translate(${ping[0]} ${ping[1]})`} pointerEvents="none" aria-hidden="true">
          <g className="hs__spark">
            <polygon className="hs__star-shadow" points="2,-14 6,-2 18,2 6,6 2,18 -2,6 -14,2 -2,-2" />
            <polygon className="hs__star" points="0,-16 4,-4 16,0 4,4 0,16 -4,4 -16,0 -4,-4" />
            <polygon className="hs__star hs__star--s" points="15,-14 17,-9 22,-7 17,-5 15,0 13,-5 8,-7 13,-9" />
          </g>
        </g>
      )}
    </g>
  )
}
