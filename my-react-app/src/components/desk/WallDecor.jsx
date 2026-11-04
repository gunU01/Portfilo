import { profile } from '../../data/profile.js'
import { hex, pts } from './shapes.js'

// 눌리지 않는 벽 장식: 글자 타일(이름 옆 직무), 선반(책, 화분), 포스트잇.

// 직무(PM / FE)의 글자를 한 글자씩 타일로 붙입니다.
export function Letters() {
  const letters = profile.roleLine.replace(/[^A-Za-z]/g, '').split('')
  const tilt = [-3, 2, -2, 3]
  return (
    <g>
      {letters.map((ch, i) => (
        <g key={i} transform={`translate(${930 + i * 76} 100) rotate(${tilt[i % tilt.length]} 31 38)`}>
          <rect x="8" y="8" width="62" height="76" fill="#0a0a0a" />
          <rect width="62" height="76" className="d-w d-o" />
          <text x="31" y="60" textAnchor="middle" className="desk__letter">
            {ch}
          </text>
        </g>
      ))}
    </g>
  )
}

export function Shelf() {
  return (
    <g>
      <polygon points={pts([[1004, 346], [1004, 392], [1048, 346]])} fill="#0a0a0a" />
      <polygon points={pts([[1176, 346], [1176, 392], [1220, 346]])} fill="#0a0a0a" />
      <rect x="960" y="330" width="300" height="18" className="d-w d-o" />
      <rect x="985" y="296" width="22" height="34" className="d-k" />
      <rect x="1009" y="288" width="22" height="42" className="d-g d-o3" />
      <rect x="1033" y="302" width="22" height="28" className="d-w d-o3" />
      <polygon points={pts([[1136, 330], [1236, 330], [1224, 294], [1148, 294]])} className="d-w d-o3" />
      <polygon fill="#0a0a0a" points={pts([[1186, 294], [1156, 238], [1180, 262], [1190, 220], [1204, 262], [1228, 240]])} />
      <polygon points={hex(1096, 318, 12)} className="d-w d-o3" />
    </g>
  )
}

export function Stickies() {
  const notes = [
    { x: 480, y: 334, rot: -4, fill: 'd-w' },
    { x: 556, y: 350, rot: 3, fill: 'd-g' },
    { x: 632, y: 338, rot: -2, fill: 'd-w' },
  ]
  return (
    <g>
      {notes.map((n) => (
        <g key={n.x} transform={`translate(${n.x} ${n.y}) rotate(${n.rot} 29 29)`}>
          <rect x="6" y="6" width="58" height="58" fill="#0a0a0a" />
          <rect width="58" height="58" className={`${n.fill} d-o3`} />
          {n.fill === 'd-w' && <path d="M10 18 H48 M10 30 H40 M10 42 H46" stroke="#0a0a0a" strokeWidth="3" />}
        </g>
      ))}
    </g>
  )
}
