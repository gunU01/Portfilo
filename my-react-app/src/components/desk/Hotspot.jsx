import { useContext } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'

// 눌러 볼 수 있는 물건. 호버나 포커스 때 살짝 떠오르고(.is-on), 클릭이나 Enter/Space 로 열립니다.
export default function Hotspot({ id, children }) {
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
    </g>
  )
}
