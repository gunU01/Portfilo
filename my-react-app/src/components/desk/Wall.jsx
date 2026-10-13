import { awards } from '../../data/awards.js'
import Hotspot from './Hotspot.jsx'

const MEDAL = { 금상: '#f2c14e', 우수상: '#c9ced8', 동상: '#cd7f32', 장려상: '#3fb68b' }
const medalColor = (award) => MEDAL[award?.result] ?? '#c9ced8'

function Frame({ x, y, w, h, color, tilt = 0 }) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g transform={`rotate(${tilt} ${cx} ${cy})`}>
      <rect x={x + 6} y={y + 8} width={w} height={h} rx="3" fill="#8b6a2c" opacity="0.22" />
      <rect x={x} y={y} width={w} height={h} rx="3" fill="#c29463" />
      <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill="#fbf3df" />
      <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} fill="none" stroke="#e6d6b0" strokeWidth="2" />
      <g transform={`translate(${cx} ${cy + 4})`}>
        <path d="M-12 -30 L-20 6 L-4 -2 L0 6 L4 -2 L20 6 L12 -30Z" fill={color} opacity="0.55" transform="translate(0 6)" />
        <circle r={Math.min(w, h) * 0.2} fill={color} />
        <circle r={Math.min(w, h) * 0.2 - 6} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2.5" />
        <path d="M-6 -2 L0 -10 L6 -2 L3 6 L-3 6Z" fill="#ffffff" opacity="0.6" />
      </g>
    </g>
  )
}

// 창문, 얇은 커튼, 바닥으로 드리우는 햇빛
export function Window() {
  return (
    <>
      <rect x="86" y="66" width="392" height="352" rx="8" fill="#fffaf0" />
      <rect x="104" y="84" width="356" height="316" fill="url(#d-win)" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <circle key={i} cx={130 + ((i * 97) % 320)} cy={140 + ((i * 61) % 230)} r={46 + (i % 3) * 14} fill={['#7fb35c', '#a3cf7d', '#5b9444'][i % 3]} opacity="0.7" filter="url(#d-soft)" />
      ))}
      <rect x="276" y="84" width="10" height="316" fill="#fffaf0" />
      <rect x="104" y="236" width="356" height="9" fill="#fffaf0" />
      <rect x="76" y="406" width="412" height="16" rx="4" fill="#efe4c9" />
      {/* 얇은 커튼 */}
      <path d="M104 84 H460 V196 C430 214 410 190 380 208 C350 226 320 196 290 212 C260 228 230 196 200 210 C170 224 140 198 104 206Z" fill="#e3f2ec" opacity="0.88" />
      {[130, 170, 210, 250, 290, 330, 370, 410, 440].map((x) => (
        <line key={x} x1={x} y1="88" x2={x + (x % 3) - 1} y2="198" stroke="#c9e2d9" strokeWidth="3" opacity="0.8" />
      ))}
      <rect x="98" y="76" width="370" height="8" rx="4" fill="#cfb27a" />
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
        <Frame key={f.x + f.y} {...f} color={medalColor(awards[i])} />
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
    days.push(<circle key={i} cx={cx} cy={cy} r={marked ? 7.5 : 2.2} fill={marked ? '#e3685a' : '#c8b88f'} />)
  }
  return (
    <Hotspot id="calendar">
      <g transform="translate(0 66)">
        <rect x="1368" y="60" width="188" height="290" fill="transparent" />
        <rect x="1376" y="70" width="170" height="284" rx="4" fill="#8b6a2c" opacity="0.2" />
        <rect x="1370" y="62" width="170" height="284" rx="4" fill="#fbf7ea" />
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
