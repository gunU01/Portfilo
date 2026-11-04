import Hotspot from './Hotspot.jsx'
import { CatWindow } from './Cats.jsx'
import { hex, pts } from './shapes.js'

// 뒷벽의 큰 물건: 창문(고양이 한 마리가 앉아 있음), 수상 액자(누르면 수상), 달력(누르면 활동기록).
// 선은 모두 검정, 면은 흰색, 종이색, 망점으로만 칠합니다(클래스 d-* 는 desk.css).

function Cloud({ x, y, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="desk__cloud" style={{ animationDelay: `${delay}s` }}>
        <polygon points={pts([[-38, 0], [-26, -16], [-6, -16], [4, -28], [24, -28], [32, -14], [44, 0]])} className="d-w d-o3" />
      </g>
    </g>
  )
}

export function Window() {
  return (
    <g>
      <rect x="72" y="102" width="340" height="330" fill="#0a0a0a" />
      <rect x="60" y="90" width="340" height="330" className="d-p d-o" />
      <g clipPath="url(#d-view)">
        <rect x="84" y="114" width="292" height="282" fill="#fff" />
        <rect x="84" y="114" width="292" height="282" fill="url(#d-dots-fine)" opacity="0.6" />
        <polygon points={hex(318, 176, 34)} className="d-w d-o3" />
        <Cloud x={150} y={172} />
        <Cloud x={270} y={236} delay={-4} />
        <polygon className="d-w" points={pts([[84, 396], [84, 304], [124, 304], [124, 266], [170, 266], [170, 322], [206, 322], [206, 228], [246, 228], [246, 290], [290, 290], [290, 254], [328, 254], [328, 332], [376, 332], [376, 396]])} />
        <polygon className="d-g d-o3" points={pts([[84, 396], [84, 304], [124, 304], [124, 266], [170, 266], [170, 322], [206, 322], [206, 228], [246, 228], [246, 290], [290, 290], [290, 254], [328, 254], [328, 332], [376, 332], [376, 396]])} />
        {[[138, 284], [186, 340], [222, 250], [222, 276], [302, 272], [344, 350]].map(([wx, wy]) => (
          <rect key={`${wx}-${wy}`} x={wx} y={wy} width="12" height="14" className="d-w d-o3" />
        ))}
      </g>
      <rect x="224" y="114" width="12" height="282" className="d-w d-o3" />
      <rect x="84" y="244" width="292" height="12" className="d-w d-o3" />
      <rect x="84" y="114" width="292" height="282" fill="none" className="d-o" />
      <rect x="40" y="420" width="380" height="26" className="d-w d-o" />
      <CatWindow x={180} y={420} />
    </g>
  )
}

const FRAMES = [
  { x: 470, y: 110, w: 130, h: 170, medal: 'k' },
  { x: 625, y: 80, w: 170, h: 120, medal: 'g' },
  { x: 625, y: 225, w: 120, h: 120, medal: 'w' },
  { x: 770, y: 215, w: 130, h: 150, medal: 'k' },
]

function Frame({ x, y, w, h, medal, i }) {
  const cx = x + w / 2
  const r = Math.min(w, h) * 0.22
  const cy = y + h / 2 - (h < 130 ? 8 : 0) // 낮은 액자는 리본이 아래 테두리에 닿지 않게 조금 올림
  return (
    <g className="desk__frame" style={{ '--i': i }}>
      <rect x={x + 9} y={y + 9} width={w} height={h} fill="#0a0a0a" />
      <rect x={x} y={y} width={w} height={h} className="d-w d-o" />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} className="d-p d-o3" />
      <polygon points={pts([[cx - r * 0.7, cy + r * 0.3], [cx - r * 0.95, cy + r * 1.7], [cx, cy + r * 1.2], [cx + r * 0.95, cy + r * 1.7], [cx + r * 0.7, cy + r * 0.3]])} className="d-w d-o3" />
      {medal === 'g' && <polygon points={hex(cx, cy, r)} className="d-w" />}
      <polygon points={hex(cx, cy, r)} className={`d-o3 ${medal === 'k' ? 'd-k' : medal === 'g' ? 'd-g' : 'd-w'}`} />
      <polygon points={hex(cx, cy, r * 0.5)} className={medal === 'w' ? 'd-k' : 'd-w'} />
    </g>
  )
}

// 수상 액자 네 개
export function Frames() {
  return (
    <Hotspot id="frames">
      {FRAMES.map((f, i) => (
        <Frame key={i} {...f} i={i} />
      ))}
    </Hotspot>
  )
}

// 달력: 검은 머리띠와 'MONTH', 날짜 칸. 표시된 날짜 세 곳은 호버하면 커집니다.
export function Calendar() {
  const marked = new Set(['1-3', '2-4', '3-1'])
  return (
    <Hotspot id="calendar">
      <rect x="1340" y="100" width="200" height="290" fill="#0a0a0a" />
      <rect x="1330" y="90" width="200" height="290" className="d-w d-o" />
      <rect x="1330" y="90" width="200" height="62" className="d-k d-o" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={1352 + i * 38} y="76" width="14" height="28" className="d-w d-o3" />
      ))}
      <text x="1430" y="132" textAnchor="middle" className="desk__cal">
        MONTH
      </text>
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4, 5].map((c) => {
          const on = marked.has(`${r}-${c}`)
          return <rect key={`${r}-${c}`} className={on ? 'desk__mark d-k' : 'd-w d-o3'} x={1348 + c * 28} y={176 + r * 46} width="16" height="16" />
        }),
      )}
    </Hotspot>
  )
}
