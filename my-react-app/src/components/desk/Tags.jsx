import { useContext } from 'react'
import { DeskContext } from './deskContext.js'
import { titles } from '../../data/desk.js'

// 이름표 위치(장면 좌표)
const POSITIONS = {
  frames: [740, 62],
  drawerL: [515, 664],
  drawerR: [1085, 664],
  calendar: [1455, 112],
  laptop: [712, 438],
  books: [420, 414],
  notebook: [1070, 584],
}

// 가리키는 물건 위에 뜨는 검은 말풍선
export default function Tags() {
  const { active } = useContext(DeskContext)
  return (
    <g className="desk__tags" pointerEvents="none">
      {Object.entries(POSITIONS).map(([id, [x, y]]) => {
        const label = titles[id]
        const w = label.length * 24 + 40
        return (
          <g key={id} className={active === id ? 'tag is-on' : 'tag'} transform={`translate(${x} ${y})`}>
            <rect x={-w / 2} y="-24" width={w} height="42" rx="21" fill="#2b2118" />
            <text x="0" y="5" textAnchor="middle" className="desk__tagtext">
              {label}
            </text>
            <path d="M-8 18 L0 28 L8 18Z" fill="#2b2118" />
          </g>
        )
      })}
    </g>
  )
}
