import { useMemo, useRef } from 'react'
import { useSectionProgress } from '../lib/useSectionProgress.js'
import { scrollToId } from '../lib/dom.js'

// 화면 오른쪽에 늘 떠 있는 호 모양 목차(큰 화면용). 스크롤하면 목록이 호를 따라 돌아가고, 지금 위치의 항목이 가운데에서 강조됩니다.
// 오른쪽의 검은 손잡이나 빈 곳을 위아래로 끌면 그만큼 페이지가 스크롤됩니다. 항목을 누르면 그 섹션으로 이동합니다.
const GAP = 66 // 항목 사이 세로 간격(px)
const R = 300 // 호의 반지름(px)
const STEP = GAP / R // 항목 하나가 호에서 차지하는 각도(rad)
const REACH = 3 // 가운데에서 이만큼 떨어지면 완전히 사라짐(항목 수)

export default function SectionDial({ sections }) {
  const ids = useMemo(() => sections.map(([id]) => id), [sections])
  const [f, scrubTo] = useSectionProgress(ids)
  const drag = useRef(null)
  const active = Math.round(f)

  const onDown = (e) => {
    if (e.target.closest('button')) return
    drag.current = { y: e.clientY, f }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onMove = (e) => {
    if (!drag.current) return
    // 아래로 끌면 앞 섹션이, 위로 끌면 뒤 섹션이 가운데로 옵니다.
    scrubTo(drag.current.f - (e.clientY - drag.current.y) / GAP)
  }
  const onUp = () => {
    drag.current = null
  }

  const arc = (a) => [R * (1 - Math.cos(a)), R * Math.sin(a)]
  const [x1, y1] = arc(-STEP * REACH)
  const [x2, y2] = arc(STEP * REACH)

  return (
    <nav className="sidx" aria-label="섹션 이동" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      <svg className="sidx__arc" width="120" height={y2 * 2 + 40} viewBox={`0 ${-y2 - 20} 120 ${y2 * 2 + 40}`} aria-hidden="true" focusable="false">
        <path d={`M${60 + x1} ${y1} A${R} ${R} 0 0 0 ${60 + x2} ${y2}`} fill="none" />
      </svg>
      <span className="sidx__handle" aria-hidden="true" />
      <div className="sidx__list">
        {sections.map(([id, label], i) => {
          const d = i - f
          const a = d * STEP
          const [x, y] = arc(a)
          const shown = Math.abs(d) < REACH
          return (
            <button
              key={id}
              type="button"
              aria-current={active === i}
              tabIndex={shown ? 0 : -1}
              style={{ transform: `translate(${x}px, ${y}px) rotate(${a * 22}deg)`, visibility: shown ? 'visible' : 'hidden' }}
              onClick={() => scrollToId(id)}
            >
              <span className="sidx__n tnum">{String(i + 1).padStart(2, '0')}</span>
              <span className="sidx__l">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
