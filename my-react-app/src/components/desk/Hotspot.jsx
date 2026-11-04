import { useContext } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'
import { PINGS } from './pings.js'

// 눌러 볼 수 있는 물건. 호버나 포커스 때 살짝 떠오르고(.is-on), 클릭이나 Enter/Space 로 열립니다.
export default function Hotspot({ id, children }) {
  const ping = PINGS[id]
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
      <g className="hs__body">{children}</g>
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
