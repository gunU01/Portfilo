import { useContext, useRef } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'
import { pts } from './shapes.js'
import { useVisibleBox } from '../../lib/useVisibleBox.js'

// 이름표 위치(장면 좌표): 가리키는 물건 위
const POSITIONS = {
  frames: [685, 62],
  drawerL: [515, 640],
  drawerR: [1085, 640],
  calendar: [1430, 62],
  laptop: [800, 300],
  books: [372, 322],
  notebook: [1175, 488],
}

// 이름표 모양: 아래 가운데에 뾰족한 꼬리가 달린 상자
const shape = (w) => pts([[-w / 2, -24], [w / 2, -24], [w / 2, 18], [9, 18], [0, 30], [-9, 18], [-w / 2, 18]])

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi))

// 가리키는 물건 위에 뜨는 검은 각진 말풍선. 화면 비율 때문에 장면이 잘려도 이름표는 보이는 영역 안에 머뭅니다.
export default function Tags() {
  const { active, showAll } = useContext(DeskContext)
  const ref = useRef(null)
  const seen = useVisibleBox(ref)
  const gap = 18 // 보이는 영역 가장자리와 이름표 사이 여백
  return (
    <g className="desk__tags" pointerEvents="none" ref={ref}>
      {Object.entries(POSITIONS).map(([id, [px, py]]) => {
        const label = titles[id]
        const w = label.length * 24 + 40
        // 이름표는 (x, y) 기준 위로 24, 아래로 30(뾰족한 끝 포함), 좌우로 w/2 만큼 차지합니다
        const x = seen ? clamp(px, seen.left + w / 2 + gap, seen.right - w / 2 - gap) : px
        const y = seen ? Math.max(py, seen.top + 24 + gap) : py
        return (
          <g key={id} className={active === id || showAll ? 'tag is-on' : 'tag'} transform={`translate(${x} ${y})`}>
            {/* 검은 물건(고양이 등) 위에서도 모양이 보이도록: 흰 바탕에 검은 테두리, 파란 딱딱한 그림자 */}
            <polygon points={shape(w)} transform="translate(6 6)" fill="#0038ff" />
            <polygon points={shape(w)} className="desk__tagbox" />
            <text x="0" y="5" textAnchor="middle" className="desk__tagtext">
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
