import { awards } from '../../data/awards.js'
import Hotspot from './Hotspot.jsx'
import { OUT } from './outline.js'

const MEDAL = { 금상: '#f2c14e', 우수상: '#c9ced8', 동상: '#cd7f32', 장려상: '#3fb68b' }
const medalColor = (award) => MEDAL[award?.result] ?? '#c9ced8'

function Frame({ x, y, w, h, color, tilt = 0, i = 0 }) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g transform={`rotate(${tilt} ${cx} ${cy})`}>
      <g className="desk__frame" style={{ '--i': i }}>
        <rect x={x + 6} y={y + 8} width={w} height={h} rx="3" fill="#8b6a2c" opacity="0.22" />
        <rect x={x} y={y} width={w} height={h} rx="4" fill="#d0a06a" {...OUT} />
        <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} rx="1" fill="#fbf3df" stroke="#d9c79c" strokeWidth="2" />
        <g transform={`translate(${cx} ${cy + 4})`}>
          <path d="M-12 -30 L-20 6 L-4 -2 L0 6 L4 -2 L20 6 L12 -30Z" fill={color} opacity="0.55" transform="translate(0 6)" />
          <circle r={Math.min(w, h) * 0.2} fill={color} />
          <circle r={Math.min(w, h) * 0.2 - 6} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2.5" />
          <path d="M-6 -2 L0 -10 L6 -2 L3 6 L-3 6Z" fill="#ffffff" opacity="0.6" />
        </g>
        <polygon points={`${x + 9},${y + 9} ${x + 9 + (w - 18) * 0.5},${y + 9} ${x + 9},${y + 9 + (h - 18) * 0.42}`} fill="#fff" opacity="0.45" />
        <polygon points={`${x + 9 + (w - 18) * 0.56},${y + 9} ${x + 9 + (w - 18) * 0.66},${y + 9} ${x + 9},${y + 9 + (h - 18) * 0.62} ${x + 9},${y + 9 + (h - 18) * 0.52}`} fill="#fff" opacity="0.3" />
      </g>
    </g>
  )
}

// 창문: 납작한 하늘과 언덕과 나무, 양쪽에 묶어 둔 커튼, 바닥으로 드리우는 햇빛
function Cloud({ x, y, s = 1, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#fff">
      <g className="desk__cloud" style={{ animationDelay: `${delay}s` }}>
        <rect x="-34" y="-8" width="68" height="22" rx="11" />
        <circle cx="-12" cy="-10" r="14" />
        <circle cx="8" cy="-14" r="17" />
      </g>
    </g>
  )
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-8" width="10" height="36" rx="3" fill="#a56d3f" />
      <circle cx="0" cy="-26" r="26" fill="#47a653" />
      <circle cx="-17" cy="-12" r="16" fill="#47a653" />
      <circle cx="17" cy="-12" r="16" fill="#47a653" />
      <circle cx="-6" cy="-32" r="9" fill="#62bd68" opacity="0.7" />
    </g>
  )
}

function Curtain({ side }) {
  // side: -1 왼쪽, 1 오른쪽. 오른쪽은 가운데(x=282)를 기준으로 좌우를 뒤집습니다.
  return (
    <g transform={side > 0 ? 'translate(564 0) scale(-1 1)' : undefined}>
      <path d="M104 86 H156 C160 150 154 214 136 268 C130 286 118 298 104 304Z" fill="#ffcfe0" {...OUT} />
      <path d="M126 90 C130 150 124 210 112 262 M144 90 C148 150 144 206 132 258" fill="none" stroke="#f59cbb" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M136 268 C150 282 150 316 126 332 C118 322 112 312 104 304 C118 298 130 286 136 268Z" fill="#ffb7d0" {...OUT} />
      <rect x="104" y="246" width="48" height="12" rx="6" fill="#ff8fb3" {...OUT} />
    </g>
  )
}

export function Window() {
  return (
    <>
      <rect x="86" y="66" width="392" height="352" rx="10" fill="#fffaf0" {...OUT} />
      <g clipPath="url(#d-view)">
        <rect x="104" y="84" width="356" height="316" fill="url(#d-sky)" />
        <circle cx="352" cy="128" r="26" fill="#ffd95e" />
        <Cloud x={196} y={134} />
        <Cloud x={388} y={196} s={0.7} delay={-5} />
        <path d="M104 268 C160 226 230 238 290 262 C350 286 410 246 460 256 V400 H104Z" fill="#9ad86f" />
        <Tree x={178} y={262} s={0.9} />
        <Tree x={392} y={274} s={0.62} />
        <path d="M104 322 C170 292 250 300 320 322 C380 340 430 318 460 326 V400 H104Z" fill="#68c053" />
        {[[150, 350, '#ff8fb3'], [214, 366, '#fff'], [272, 344, '#ffd95e'], [338, 362, '#ff8fb3'], [408, 350, '#fff']].map(([x, y, c]) => (
          <g key={x}>
            <circle cx={x} cy={y} r="5.5" fill={c} />
            <circle cx={x} cy={y} r="2" fill="#f5b800" />
          </g>
        ))}
      </g>
      <rect x="276" y="84" width="10" height="316" fill="#fffaf0" {...OUT} />
      <rect x="104" y="236" width="356" height="9" fill="#fffaf0" {...OUT} />
      <rect x="76" y="406" width="412" height="16" rx="5" fill="#f1e2c0" {...OUT} />
      <Curtain side={-1} />
      <Curtain side={1} />
      <rect x="94" y="74" width="376" height="10" rx="5" fill="#c9965e" {...OUT} />
      <circle cx="94" cy="79" r="7" fill="#e0b27a" {...OUT} />
      <circle cx="470" cy="79" r="7" fill="#e0b27a" {...OUT} />
      <polygon points="110,424 470,424 840,740 300,740" fill="url(#d-beam)" />
    </>
  )
}

// 액자 4개(수상). 메달 색은 수상 결과에서 가져옵니다.
const FRAMES = [
  { x: 520, y: 110, w: 120, h: 150, tilt: -1.5 },
  { x: 660, y: 80, w: 150, h: 110, tilt: 1 },
  { x: 660, y: 212, w: 120, h: 100, tilt: -0.8 },
  { x: 830, y: 136, w: 110, h: 140, tilt: 1.4 },
]

export function Frames() {
  return (
    <Hotspot id="frames">
      <rect x="500" y="56" width="470" height="270" fill="transparent" />
      {FRAMES.map((f, i) => (
        <Frame key={f.x + f.y} {...f} i={i} color={medalColor(awards[i])} />
      ))}
    </Hotspot>
  )
}

// 선반과 그 위의 꽃병, 책, 촛불, 작은 집
export function Shelf() {
  return (
    <>
      <rect x="1010" y="296" width="300" height="16" rx="3" fill="#e4bd88" />
      <rect x="1010" y="296" width="300" height="5" rx="2" fill="#f2d3a4" />
      <path d="M1050 312 V352 M1270 312 V352" stroke="#cf9d62" strokeWidth="8" strokeLinecap="round" />
      <g transform="translate(1066 296)">
        <path d="M-22 0 C-26 -30 -14 -44 -10 -52 H10 C14 -44 26 -30 22 0Z" fill="#3f6f5a" />
        {[-14, -4, 8, 16].map((dx, i) => (
          <g key={dx} transform={`translate(${dx} -52) rotate(${(i - 1.5) * 14})`}>
            <line x1="0" y1="0" x2="0" y2="-34" stroke="#62ad4a" strokeWidth="3" />
            <circle cy="-40" r="9" fill="#fff" />
            <circle cy="-40" r="3.6" fill="#f2b705" />
          </g>
        ))}
      </g>
      <g transform="translate(1150 296)">
        <rect x="-34" y="-20" width="68" height="20" rx="2" fill="#4a7ea0" />
        <rect x="-30" y="-40" width="62" height="20" rx="2" fill="#e08a4f" />
        <rect x="-26" y="-58" width="54" height="18" rx="2" fill="#f0d27a" />
      </g>
      <g transform="translate(1226 296)">
        <rect x="-16" y="-44" width="32" height="44" rx="4" fill="#fbf3df" />
        <rect x="-1.5" y="-56" width="3" height="12" rx="1.5" fill="#6b5030" />
        <ellipse cx="0" cy="-44" rx="16" ry="4" fill="#e8dcbd" />
      </g>
      <g transform="translate(1282 296)">
        <rect x="-18" y="-24" width="36" height="24" fill="#f6e4c4" />
        <polygon points="-24,-24 0,-46 24,-24" fill="#c0655a" />
        <rect x="-4" y="-14" width="8" height="14" fill="#b9884f" />
      </g>
    </>
  )
}

// 달력(활동 기록). 빨간 점은 표시된 날짜입니다.
const MARKED_DAYS = [12, 19, 26]

export function Calendar() {
  const days = []
  for (let i = 0; i < 35; i += 1) {
    const cx = 1396 + (i % 7) * 20.5
    const cy = 150 + Math.floor(i / 7) * 32
    const marked = MARKED_DAYS.includes(i)
    days.push(<circle key={i} className={marked ? 'desk__mark' : undefined} cx={cx} cy={cy} r={marked ? 7.5 : 2.2} fill={marked ? '#e3685a' : '#c8b88f'} />)
  }
  return (
    <Hotspot id="calendar">
      <g transform="translate(0 66)">
        <rect x="1368" y="60" width="188" height="290" fill="transparent" />
        <rect x="1376" y="70" width="170" height="284" rx="4" fill="#8b6a2c" opacity="0.2" />
        <rect x="1370" y="62" width="170" height="284" rx="6" fill="#fbf7ea" {...OUT} />
        <rect x="1370" y="62" width="170" height="54" rx="4" fill="#6bb27a" />
        <rect x="1370" y="96" width="170" height="20" fill="#6bb27a" />
        <text x="1455" y="102" textAnchor="middle" className="desk__cal">
          MONTH
        </text>
        {[1394, 1424, 1454, 1484, 1514].map((x) => (
          <rect key={x} x={x} y="54" width="6" height="18" rx="3" fill="#7a5a3a" />
        ))}
        {days}
      </g>
    </Hotspot>
  )
}
