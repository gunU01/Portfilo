// 벽과 창가를 채우는 작은 소품들. 모두 장식이라 눌러 볼 수 없습니다.
const FLAG = ['#ff8a70', '#ffd35e', '#7ed6a4', '#ff9ec7', '#79b8ff']

// 깃발 가랜드
export function Bunting() {
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
export function Polaroids() {
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
export function Ivy() {
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
export function SillPots() {
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
export function Stickies() {
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
