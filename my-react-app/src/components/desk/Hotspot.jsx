import { useContext, useLayoutEffect, useRef } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'
import { PINGS } from './pings.js'

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
  const off = () => setActive((v) => (v === id ? null : v))
  return (
    <g
      className={active === id ? 'hs is-on' : 'hs'}
      role="button"
      tabIndex={0}
      aria-label={`${titles[id]} 열기`}
      onPointerEnter={() => setActive(id)}
      onPointerLeave={off}
      onFocus={() => setActive(id)}
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
      {/* 눌러 볼 수 있다는 표시(마름모): 평소에만 보이고, 가리키거나 패널이 열리면 사라집니다(스타일은 desk.css) */}
      {ping && (
        <g className="hs__ping" transform={`translate(${ping[0]} ${ping[1]})`} pointerEvents="none" aria-hidden="true">
          <g transform="rotate(45)">
            <rect className="hs__ring" x="-24" y="-24" width="48" height="48" />
            <rect className="hs__dot" x="-10" y="-10" width="20" height="20" />
          </g>
        </g>
      )}
    </g>
  )
}
