import { useContext } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'
import { pts } from './shapes.js'

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

// 가리키는 물건 위에 뜨는 검은 각진 말풍선
export default function Tags() {
  const { active, showAll } = useContext(DeskContext)
  return (
    <g className="desk__tags" pointerEvents="none">
      {Object.entries(POSITIONS).map(([id, [x, y]]) => {
        const label = titles[id]
        const w = label.length * 24 + 40
        return (
          <g key={id} className={active === id || showAll ? 'tag is-on' : 'tag'} transform={`translate(${x} ${y})`}>
            <polygon points={pts([[-w / 2, -24], [w / 2, -24], [w / 2, 18], [9, 18], [0, 30], [-9, 18], [-w / 2, 18]])} fill="#0a0a0a" />
            <text x="0" y="5" textAnchor="middle" className="desk__tagtext">
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
