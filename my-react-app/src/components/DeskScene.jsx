import { awards } from '../data/awards.js'

// 따뜻한 오후의 작업실을 SVG 레이어로 그린 장면입니다. 외부 이미지 없이 도형과 그라디언트만 씁니다.
// 눌러 볼 수 있는 물건(핫스팟)은 <Hs>로 감싸며, 호버나 포커스 때 살짝 떠오르고 이름표가 뜹니다.

const MEDAL = { 금상: '#f2c14e', 우수상: '#c9ced8', 동상: '#cd7f32', 장려상: '#3fb68b' }

// 이름표 위치(장면 좌표)
const TAGS = {
  frames: [740, 62],
  drawerL: [515, 664],
  drawerR: [1085, 664],
  calendar: [1455, 112],
  laptop: [712, 438],
  books: [414, 436],
  notebook: [1070, 584],
}

const rnd = (seed) => {
  let a = seed
  return () => {
    a = (a * 16807) % 2147483647
    return a / 2147483647
  }
}

// 고사리 잎: 곡선 줄기에 작은 잎을 양쪽으로 달아 줍니다.
function Fern({ x, y, scale = 1, fronds = 11, spread = 150, len = 150, dark = '#4aa03c', light = '#93d35e' }) {
  const out = []
  for (let i = 0; i < fronds; i += 1) {
    const f = i / (fronds - 1)
    const a = ((-spread / 2 + f * spread) * Math.PI) / 180
    const l = len * (0.72 + 0.28 * Math.sin(i * 2.3 + 1))
    const ex = Math.sin(a) * l
    const ey = -Math.cos(a) * l * 0.92 + Math.abs(Math.sin(a)) * l * 0.28
    const cx = Math.sin(a) * l * 0.3
    const cy = -Math.cos(a) * l * 0.85
    out.push(<path key={`s${i}`} d={`M0 0 Q${cx} ${cy} ${ex} ${ey}`} stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />)
    for (let k = 1; k <= 9; k += 1) {
      const t = 0.18 + k * 0.088
      const px = 2 * (1 - t) * t * cx + t * t * ex
      const py = 2 * (1 - t) * t * cy + t * t * ey
      const tx = 2 * (1 - t) * cx + 2 * t * (ex - cx)
      const ty = 2 * (1 - t) * cy + 2 * t * (ey - cy)
      const ang = (Math.atan2(ty, tx) * 180) / Math.PI
      const size = (1 - t) * 15 + 5
      for (const side of [-1, 1]) {
        out.push(<ellipse key={`${i}-${k}-${side}`} cx={px} cy={py} rx={size} ry={3.1} transform={`rotate(${ang + side * 62} ${px} ${py}) translate(${side * 0} 0)`} fill={(i + k) % 2 ? light : dark} />)
      }
    }
  }
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>{out}</g>
}


const FLAG = ['#ff8a70', '#ffd35e', '#7ed6a4', '#ff9ec7', '#79b8ff']

// 깃발 가랜드
function Bunting() {
  const flags = []
  for (let i = 0; i < 9; i += 1) {
    const t = (i + 0.5) / 9
    const x = (1 - t) * (1 - t) * 1004 + 2 * (1 - t) * t * 1170 + t * t * 1336
    const y = (1 - t) * (1 - t) * 92 + 2 * (1 - t) * t * 168 + t * t * 98
    flags.push(<polygon key={i} points={`${x - 13},${y - 2} ${x + 13},${y - 2} ${x},${y + 30}`} fill={FLAG[i % FLAG.length]} />)
  }
  return (
    <g className="desk__sway" style={{ transformOrigin: '1170px 90px' }}>
      <path d="M1004 92 Q1170 168 1336 98" fill="none" stroke="#b98a58" strokeWidth="3" />
      {flags}
    </g>
  )
}

// 줄에 집게로 매단 폴라로이드 사진
function Polaroids() {
  const pics = [
    { x: 1185, y: 169, r: -4, c: '#bfe3ff', icon: 'sun' },
    { x: 1254, y: 166, r: 3, c: '#ffd9e3', icon: 'heart' },
    { x: 1317, y: 151, r: -2, c: '#d3f0c4', icon: 'hill' },
  ]
  return (
    <g>
      <path d="M1060 140 Q1200 196 1336 144" fill="none" stroke="#b98a58" strokeWidth="2.5" />
      {pics.map((p) => (
        <g key={p.icon} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
          <rect x="-4" y="-6" width="8" height="16" rx="2" fill="#e2a46a" />
          <rect x="-28" y="6" width="56" height="66" rx="2" fill="#fffdf6" />
          <rect x="-24" y="10" width="48" height="46" fill={p.c} />
          {p.icon === 'sun' && (
            <g>
              <circle cx="0" cy="30" r="9" fill="#ffc83d" />
              <path d="M-24 56 L-8 40 L6 52 L14 46 L24 56Z" fill="#7fc47a" />
            </g>
          )}
          {p.icon === 'heart' && <path d="M0 46 C-18 32 -10 20 0 28 C10 20 18 32 0 46Z" fill="#ff6f8f" />}
          {p.icon === 'hill' && (
            <g>
              <path d="M-24 56 L-6 28 L8 48 L16 38 L24 56Z" fill="#5fae6a" />
              <circle cx="14" cy="22" r="5" fill="#fff" opacity="0.9" />
            </g>
          )}
          <line x1="-16" y1="64" x2="10" y2="64" stroke="#d8cdb0" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

// 창가에 늘어진 하트잎 덩굴
function Ivy() {
  const leaves = []
  const pts = [[468, 118], [474, 150], [466, 184], [478, 214], [470, 246], [462, 278], [474, 306], [466, 336]]
  pts.forEach(([x, y], i) => {
    const side = i % 2 ? 1 : -1
    leaves.push(
      <g key={i} transform={`translate(${x} ${y}) rotate(${side * 28})`}>
        <path d="M0 0 C-14 -10 -8 -24 0 -16 C8 -24 14 -10 0 0Z" fill={i % 2 ? '#5fc05a' : '#86d46a'} transform="scale(1.5) translate(0 14)" />
      </g>,
    )
  })
  return (
    <g className="desk__sway" style={{ transformOrigin: '470px 84px' }}>
      <path d="M470 84 C462 140 486 190 470 250 C458 300 478 330 466 352" fill="none" stroke="#3f9a4a" strokeWidth="3" strokeLinecap="round" />
      {leaves}
    </g>
  )
}

// 창턱의 작은 화분들
function SillPots() {
  return (
    <g>
      <g transform="translate(150 406)">
        <path d="M-18 -26 H18 L14 0 H-14Z" fill="#f0a98a" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-40" rx="8" ry="16" fill={a % 120 ? '#7fcf9a' : '#5fbf86'} transform={`rotate(${a} 0 -34) translate(0 -2)`} />
        ))}
        <circle cy="-36" r="6" fill="#ffb7c8" />
      </g>
      <g transform="translate(222 406)">
        <path d="M-16 -22 H16 L12 0 H-12Z" fill="#f6d18a" />
        <rect x="-9" y="-62" width="18" height="42" rx="9" fill="#5fae6a" />
        <rect x="-22" y="-52" width="10" height="22" rx="5" fill="#5fae6a" />
        <rect x="12" y="-46" width="10" height="18" rx="5" fill="#5fae6a" />
        <circle cy="-64" r="6" fill="#ff7aa8" />
      </g>
      <g transform="translate(396 406)">
        <path d="M-18 -24 H18 L14 0 H-14Z" fill="#9fd0e8" />
        <circle cx="-8" cy="-34" r="14" fill="#6fc47a" />
        <circle cx="8" cy="-36" r="15" fill="#86d46a" />
        <circle cy="-46" r="12" fill="#5fb470" />
      </g>
    </g>
  )
}

// 벽에 붙인 포스트잇과 별 스티커
function Stickies() {
  const notes = [
    { x: 600, y: 352, c: '#fff1a6', r: -5 },
    { x: 686, y: 362, c: '#ffd0dc', r: 4 },
    { x: 774, y: 350, c: '#c9f0dc', r: -3 },
  ]
  const star = (x, y, k) => <polygon key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${k})`} points="0,-10 3,-3 10,-3 4,2 6,9 0,5 -6,9 -4,2 -10,-3 -3,-3" fill="#ffc83d" />
  return (
    <g>
      {notes.map((n) => (
        <g key={n.x} transform={`translate(${n.x} ${n.y}) rotate(${n.r})`}>
          <rect x="3" y="4" width="62" height="58" fill="#8a7a3a" opacity="0.18" />
          <rect width="62" height="58" fill={n.c} />
          <rect x="-4" y="-5" width="36" height="12" fill="#fff" opacity="0.6" transform="rotate(-4)" />
          <path d="M10 22 H50 M10 32 H44 M10 42 H34" stroke="#b9a66a" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}
      {star(560, 372, 1.1)}
      {star(842, 372, 0.9)}
      {star(950, 340, 1)}
      {star(1000, 300, 0.7)}
    </g>
  )
}

// 책 위에서 낮잠 자는 고양이
function Cat() {
  return (
    <g>
      <g className="desk__breathe">
        <path d="M366 524 C340 524 334 494 356 490" fill="none" stroke="#f0b27a" strokeWidth="11" strokeLinecap="round" />
        <ellipse cx="418" cy="514" rx="58" ry="26" fill="#f6efe3" />
        <path d="M376 500 C390 486 410 488 414 500 C402 504 388 506 376 500Z" fill="#f0b27a" />
        <ellipse cx="438" cy="522" rx="26" ry="8" fill="#ffffff" opacity="0.7" />
      </g>
      <g transform="translate(466 496)">
        <path d="M-20 -8 L-17 -30 L-4 -16Z" fill="#f6efe3" />
        <path d="M20 -8 L17 -30 L4 -16Z" fill="#f0b27a" />
        <path d="M-16 -10 L-15 -24 L-8 -16Z" fill="#ffb8c4" />
        <ellipse rx="24" ry="20" fill="#f6efe3" />
        <path d="M2 -20 C14 -20 22 -10 20 0 C12 -2 6 -8 2 -20Z" fill="#f0b27a" />
        <path d="M-13 -2 Q-8 3 -3 -2 M5 -2 Q10 3 15 -2" fill="none" stroke="#5a3b2a" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M-2.5 5 H3.5 L0.5 9Z" fill="#ff8fa3" />
        <ellipse cx="-14" cy="6" rx="4.5" ry="3" fill="#ffb8c4" opacity="0.8" />
        <ellipse cx="18" cy="6" rx="4.5" ry="3" fill="#ffb8c4" opacity="0.8" />
        <path d="M-26 4 H-16 M-26 9 L-16 8 M26 4 H16 M26 9 L16 8" stroke="#c9b9a4" strokeWidth="1.4" />
      </g>
      <text x="498" y="472" className="desk__zzz">
        z
      </text>
      <text x="514" y="454" className="desk__zzz desk__zzz--b">
        z
      </text>
    </g>
  )
}

// 바닥의 동그란 러그
function Rug() {
  return (
    <g>
      <ellipse cx="800" cy="884" rx="400" ry="40" fill="#ee9c78" />
      <ellipse cx="800" cy="884" rx="352" ry="32" fill="#fdf0d6" />
      <ellipse cx="800" cy="884" rx="304" ry="26" fill="#7fc9a6" />
      <ellipse cx="800" cy="884" rx="256" ry="20" fill="#fdf0d6" />
      <ellipse cx="800" cy="884" rx="208" ry="15" fill="#ffd27a" />
    </g>
  )
}

function Hs({ id, label, active, setActive, onOpen, children }) {
  return (
    <g
      className={active === id ? 'hs is-on' : 'hs'}
      role="button"
      tabIndex={0}
      aria-label={`${label} 열기`}
      onPointerEnter={() => setActive(id)}
      onPointerLeave={() => setActive((v) => (v === id ? null : v))}
      onFocus={() => setActive(id)}
      onBlur={() => setActive((v) => (v === id ? null : v))}
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

export default function DeskScene({ active, setActive, onOpen, stageRef }) {
  const hs = { active, setActive, onOpen }
  const medals = awards.map((a) => MEDAL[a.result] ?? '#c9ced8')
  const days = []
  for (let i = 0; i < 35; i += 1) {
    const cx = 1396 + (i % 7) * 20.5
    const cy = 150 + Math.floor(i / 7) * 32
    days.push(<circle key={i} cx={cx} cy={cy} r={i === 12 || i === 19 || i === 26 ? 7.5 : 2.2} fill={i === 12 || i === 19 || i === 26 ? '#e3685a' : '#c8b88f'} />)
  }
  const planks = []
  for (let i = 0; i < 9; i += 1) planks.push(<line key={i} x1={-200 + i * 230} y1="812" x2={-260 + i * 250} y2="900" stroke="#6f5036" strokeWidth="2" opacity="0.5" />)
  const grain = []
  const g = rnd(5)
  for (let i = 0; i < 22; i += 1) {
    const y = 636 + g() * 22
    const x = 160 + g() * 1100
    grain.push(<line key={i} x1={x} y1={y} x2={x + 120 + g() * 160} y2={y + (g() - 0.5) * 2} stroke="#cf9c60" strokeWidth="1.6" opacity="0.35" />)
  }

  return (
    <svg
      className="desk__svg"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      role="group"
      aria-label="책상 위의 물건들. 물건을 눌러 내용을 엽니다"
      ref={stageRef}
    >
      <defs>
        <linearGradient id="d-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4ebcf" />
          <stop offset="1" stopColor="#ecdcb2" />
        </linearGradient>
        <radialGradient id="d-vig" cx="0.5" cy="0.45" r="0.8">
          <stop offset="0.55" stopColor="#9a8a4a" stopOpacity="0" />
          <stop offset="1" stopColor="#9a8a4a" stopOpacity="0.24" />
        </radialGradient>
        <linearGradient id="d-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2cf98" />
          <stop offset="1" stopColor="#ebbd7e" />
        </linearGradient>
        <linearGradient id="d-under" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a4a2c" />
          <stop offset="1" stopColor="#93704a" />
        </linearGradient>
        <linearGradient id="d-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6f5cf" />
          <stop offset="0.5" stopColor="#a6d46e" />
          <stop offset="1" stopColor="#62ad4a" />
        </linearGradient>
        <linearGradient id="d-beam" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fff6cf" stopOpacity="0.34" />
          <stop offset="1" stopColor="#fff6cf" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="d-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9cc986" />
          <stop offset="0.5" stopColor="#b9dca3" />
          <stop offset="1" stopColor="#93bf7e" />
        </linearGradient>
        <filter id="d-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#d-wall)" />

      {/* 뒷벽 */}
      <g className="desk__layer desk__layer--back">
        {/* 창문 */}
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

        {/* 액자(수상) */}
        <Hs id="frames" label="수상" {...hs}>
          <rect x="500" y="56" width="470" height="270" fill="transparent" />
          <Frame x={520} y={110} w={120} h={150} color={medals[0] ?? '#c9ced8'} tilt={-1.5} />
          <Frame x={660} y={80} w={150} h={110} color={medals[1] ?? '#c9ced8'} tilt={1} />
          <Frame x={660} y={212} w={120} h={100} color={medals[2] ?? '#c9ced8'} tilt={-0.8} />
          <Frame x={830} y={136} w={110} h={140} color={medals[3] ?? '#c9ced8'} tilt={1.4} />
        </Hs>

        {/* 선반 */}
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

        <Ivy />
        <SillPots />
        <Bunting />
        <Polaroids />
        <Stickies />

        {/* 달력(활동 기록) */}
        <Hs id="calendar" label="활동기록" {...hs}>
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
        </Hs>

      </g>

      {/* 바닥 */}
      <rect x="0" y="796" width="1600" height="104" fill="#c2a074" />
      <rect x="0" y="786" width="1600" height="14" fill="#faf2dc" />
      {planks}

      {/* 책상 */}
      <g className="desk__layer desk__layer--mid">
        <rect x="190" y="760" width="1220" height="120" fill="url(#d-under)" />
        {/* 다리 */}
        {[140, 1385].map((x) => (
          <g key={x}>
            <rect x={x} y="676" width="78" height="210" fill="#ecc088" />
            {[0, 1, 2].map((i) => (
              <rect key={i} x={x + 12 + i * 22} y="700" width="12" height="170" rx="3" fill="#d9a66a" />
            ))}
          </g>
        ))}
        {/* 앞면 */}
        <rect x="200" y="676" width="1200" height="92" fill="#f0c994" />
        <rect x="200" y="676" width="1200" height="8" fill="#dba96c" opacity="0.6" />
        {/* 서랍 */}
        <Hs id="drawerL" label="대회 참가" {...hs}>
          <rect x="300" y="690" width="430" height="68" fill="transparent" />
          <rect x="304" y="694" width="422" height="60" rx="4" fill="#f6d9a8" stroke="#dba96c" strokeWidth="3" />
          <rect x="486" y="700" width="60" height="16" rx="3" fill="#fffdf6" stroke="#d9b98a" strokeWidth="1.6" />
          <polygon points="516,702 518,707 523,707 519,710 521,715 516,712 511,715 513,710 509,707 514,707" fill="#ffc83d" />
          <rect x="478" y="722" width="76" height="16" rx="8" fill="#b9884f" />
          <rect x="482" y="724" width="68" height="5" rx="2.5" fill="#cf9d62" />
        </Hs>
        <Hs id="drawerR" label="학력과 연락" {...hs}>
          <rect x="870" y="690" width="430" height="68" fill="transparent" />
          <rect x="874" y="694" width="422" height="60" rx="4" fill="#f6d9a8" stroke="#dba96c" strokeWidth="3" />
          <rect x="1056" y="700" width="60" height="16" rx="3" fill="#fffdf6" stroke="#d9b98a" strokeWidth="1.6" />
          <path d="M1086 713 C1076 706 1080 700 1086 704 C1092 700 1096 706 1086 713Z" fill="#ff6f8f" />
          <rect x="1048" y="722" width="76" height="16" rx="8" fill="#b9884f" />
          <rect x="1052" y="724" width="68" height="5" rx="2.5" fill="#cf9d62" />
        </Hs>
        {/* 상판 */}
        <polygon points="150,630 1450,630 1500,664 100,664" fill="url(#d-top)" />
        <rect x="100" y="664" width="1400" height="18" rx="4" fill="#e4b57a" />
        {grain}

        {/* 상판 위 그림자 */}
        <ellipse cx="710" cy="650" rx="190" ry="9" fill="#6a4020" opacity="0.28" />
        <ellipse cx="412" cy="646" rx="110" ry="8" fill="#6a4020" opacity="0.25" />
        <ellipse cx="1070" cy="652" rx="130" ry="7" fill="#6a4020" opacity="0.2" />
        <ellipse cx="1340" cy="648" rx="70" ry="7" fill="#6a4020" opacity="0.28" />

        {/* 화분 */}
        <Fern x={250} y={606} scale={0.62} fronds={9} spread={140} len={130} />
        <path d="M222 600 H278 L272 644 H228Z" fill="#e49a73" />
        <rect x="218" y="594" width="64" height="10" rx="3" fill="#efae88" />

        {/* 책 더미(기획 작업물) */}
        <Hs id="books" label="기획물" {...hs}>
          <rect x="326" y="446" width="200" height="200" fill="transparent" />
          <Cat />
          <rect x="330" y="614" width="172" height="30" rx="3" fill="#4f8f7e" />
          <rect x="340" y="618" width="150" height="3" fill="#86b9a8" />
          <g transform="rotate(-2 415 600)">
            <rect x="340" y="586" width="152" height="28" rx="3" fill="#f08a6b" />
            <rect x="350" y="591" width="110" height="3" fill="#f7b49b" />
          </g>
          <g transform="rotate(1.5 415 574)">
            <rect x="334" y="558" width="164" height="28" rx="3" fill="#f4d77a" />
            <rect x="346" y="564" width="96" height="3" fill="#faeaa8" />
          </g>
          <g transform="rotate(-3 415 546)">
            <rect x="346" y="532" width="142" height="26" rx="3" fill="#7bb88a" />
            <rect x="356" y="537" width="80" height="3" fill="#a9d6b4" />
          </g>
        </Hs>

        {/* 노트북(프로젝트) */}
        <Hs id="laptop" label="프로젝트" {...hs}>
          <rect x="524" y="456" width="376" height="204" fill="transparent" />
          <rect x="560" y="464" width="304" height="176" rx="10" fill="#2a2c33" />
          <rect x="570" y="474" width="284" height="156" rx="3" fill="#f7f9fd" />
          <rect x="570" y="474" width="284" height="26" fill="#eaf0fb" />
          <circle cx="584" cy="487" r="4" fill="#ef7a6c" />
          <circle cx="598" cy="487" r="4" fill="#f2c14e" />
          <circle cx="612" cy="487" r="4" fill="#6cc48a" />
          {[
            ['#1f6bff', '얼마'],
            ['#ff9f43', '해미'],
            ['#ff6fa3', '토스'],
          ].map(([c, t], i) => (
            <g key={t} transform={`translate(${584 + i * 90} 512)`}>
              <rect width="80" height="104" rx="8" fill="#ffffff" stroke="#e1e8f5" strokeWidth="2" />
              <rect x="8" y="8" width="64" height="44" rx="5" fill={c} opacity="0.9" />
              <rect x="8" y="62" width="50" height="6" rx="3" fill="#cfd9ec" />
              <rect x="8" y="76" width="34" height="6" rx="3" fill="#dfe6f3" />
              <circle cx="22" cy="30" r="9" fill="#ffffff" opacity="0.55" />
            </g>
          ))}
          <path d="M522 640 H902 L914 658 H510Z" fill="#c9ccd4" />
          <rect x="682" y="640" width="60" height="6" rx="3" fill="#aeb2bb" />
          <path d="M510 658 H914 V662 H510Z" fill="#9ea2ab" />
        </Hs>

        {/* 머그컵 */}
        <g>
          <rect x="934" y="614" width="40" height="34" rx="8" fill="#fbf6ea" />
          <rect x="934" y="624" width="40" height="8" fill="#6bb27a" />
          <path d="M974 622 C992 622 992 642 974 642" fill="none" stroke="#fbf6ea" strokeWidth="6" />
        </g>

        <g className="desk__steam" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8">
          <path d="M946 606 C940 594 954 588 948 574" />
          <path d="M962 606 C956 596 968 590 963 578" className="desk__steam--b" />
        </g>

        {/* 노트(소개) */}
        <Hs id="notebook" label="소개" {...hs}>
          <rect x="990" y="596" width="240" height="68" fill="transparent" />
          <path d="M1000 636 L1112 628 L1112 652 L1000 662Z" fill="#fffaf0" stroke="#e6dcc0" strokeWidth="2" />
          <path d="M1116 628 L1228 636 L1228 662 L1116 652Z" fill="#fffdf6" stroke="#e6dcc0" strokeWidth="2" />
          <path d="M1112 628 V652" stroke="#d4c8a4" strokeWidth="3" />
          {[0, 1, 2].map((i) => (
            <g key={i} stroke="#cdbf96" strokeWidth="2" strokeLinecap="round">
              <line x1="1014" y1={640 + i * 6} x2="1098" y2={634 + i * 6} />
              <line x1="1130" y1={634 + i * 6} x2="1210" y2={640 + i * 6} />
            </g>
          ))}
          <rect x="1030" y="630" width="30" height="3" fill="#e08a4f" transform="rotate(-4 1045 631)" />
          <g transform="rotate(-6 1180 624)">
            <rect x="1150" y="620" width="104" height="8" rx="2" fill="#f2c14e" />
            <polygon points="1254,620 1272,624 1254,628" fill="#f1dcb2" />
            <polygon points="1266,623 1272,624 1266,625" fill="#3a2c2a" />
            <rect x="1150" y="620" width="10" height="8" rx="2" fill="#f19aa8" />
          </g>
        </Hs>

        {/* 연필꽂이 */}
        <g>
          <path d="M1258 604 L1262 590 M1268 604 L1276 586 M1278 604 L1282 592" stroke="#e08a4f" strokeWidth="4" strokeLinecap="round" />
          <path d="M1262 590 L1258 604 M1276 586 L1268 604" stroke="#7bb88a" strokeWidth="0" />
          <rect x="1252" y="600" width="42" height="46" rx="7" fill="#d6ebee" opacity="0.8" stroke="#b5d3d8" strokeWidth="2" />
        </g>

        {/* 스탠드 */}
        <g>
          <ellipse cx="1356" cy="646" rx="42" ry="9" fill="#b98a58" />
          <rect x="1348" y="548" width="16" height="96" rx="4" fill="#cf9d62" />
          <ellipse cx="1356" cy="548" rx="8" ry="6" fill="#b98a58" />
          <path d="M1306 458 H1406 L1436 550 H1276Z" fill="url(#d-shade)" />
          {[1316, 1332, 1348, 1364, 1380, 1396, 1412, 1428].map((x, i) => (
            <line key={x} x1={1310 + i * 14 * 0.9 + (i > 0 ? 0 : 0)} y1="460" x2={x - 6 + (i - 3.5) * 2} y2="548" stroke="#86b36f" strokeWidth="2.4" opacity="0.7" />
          ))}
          <ellipse cx="1356" cy="458" rx="50" ry="8" fill="#cfe6ba" />
          <ellipse cx="1356" cy="458" rx="40" ry="5" fill="#d6e6c4" opacity="0.6" />
        </g>
      </g>

      {/* 앞쪽: 의자와 바닥 화분 */}
      <g className="desk__layer desk__layer--front">
        <Rug />
        <path d="M806 900 C792 812 820 774 892 764 L1118 746 C1170 744 1196 786 1180 900Z" fill="#7a583a" />
        {Array.from({ length: 15 }).map((_, i) => {
          const x = 826 + i * 23.5
          const top = 770 - Math.sin(((x - 810) / 380) * Math.PI) * 18
          return <line key={i} x1={x} y1={top + 4} x2={x + (x - 995) * 0.03} y2="900" stroke="#dba96c" strokeWidth="7" strokeLinecap="round" />
        })}
        <path d="M806 896 C792 812 820 774 892 764 L1118 746 C1170 744 1196 786 1180 896" fill="none" stroke="#ecc794" strokeWidth="16" strokeLinecap="round" />
        <path d="M806 836 C830 820 860 812 892 806 M1180 836 C1160 820 1140 812 1110 806" fill="none" stroke="#ecc794" strokeWidth="10" strokeLinecap="round" />

        <g>
          <Fern x={78} y={730} scale={0.95} fronds={11} spread={150} len={170} />
          <path d="M34 726 H124 L116 842 H42Z" fill="#f4ead2" />
          <rect x="28" y="716" width="102" height="16" rx="5" fill="#fbf4e3" />
          <ellipse cx="78" cy="846" rx="52" ry="8" fill="#5a3b24" opacity="0.4" />
        </g>
      </g>

      <rect width="1600" height="900" fill="url(#d-vig)" pointerEvents="none" />

      {/* 이름표 */}
      <g className="desk__tags" pointerEvents="none">
        {Object.entries(TAGS).map(([id, [x, y]]) => {
          const label = { frames: '수상', calendar: '활동기록', laptop: '프로젝트', books: '기획물', notebook: '소개', drawerL: '대회 참가', drawerR: '학력과 연락' }[id]
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
    </svg>
  )
}
