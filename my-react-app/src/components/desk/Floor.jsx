// 바닥과 책상 아래 공간: 벽 아랫부분, 마루, 햇빛 자국, 책상 밑 수납
import { OUT } from './outline.js'

// 마루 판자의 이음선(세로)과 줄눈(가로)
const SEAMS = Array.from({ length: 11 }, (_, i) => <line key={i} x1={-260 + i * 210} y1="802" x2={-420 + i * 250} y2="900" stroke="#b48258" strokeWidth="2" opacity="0.45" />)
const ROWS = [826, 858, 892].map((y) => <line key={y} x1="0" y1={y} x2="1600" y2={y} stroke="#c28d5c" strokeWidth="1.6" opacity="0.35" />)

// 뒷벽 아랫부분과 바닥. 책상 뒤에 깔리는 층입니다.
export function Floor() {
  return (
    <>
      {/* 벽 아랫부분: 한 단 어두운 띠와 걸레받이 */}
      <rect x="0" y="716" width="1600" height="62" fill="#f7d9a8" opacity="0.55" />
      <line x1="0" y1="716" x2="1600" y2="716" stroke="#e8bf86" strokeWidth="3" />
      <rect x="0" y="770" width="1600" height="30" fill="#fff4de" />
      <rect x="0" y="770" width="1600" height="4" fill="#fffdf4" />
      <line x1="0" y1="799" x2="1600" y2="799" stroke="#e3c08c" strokeWidth="2" />

      <rect x="0" y="800" width="1600" height="100" fill="url(#d-floor)" />
      {SEAMS}
      {ROWS}
      {/* 창으로 들어오는 햇빛 자국 */}
      <polygon points="150,804 470,804 560,900 180,900" fill="#fff6d6" opacity="0.28" />
      <polygon points="300,804 400,804 440,900 330,900" fill="#fff6d6" opacity="0.18" />
    </>
  )
}

// 책상 밑 공간: 안쪽 판, 바닥 그림자, 수납 상자와 가방, 휴지통
export function UnderDesk() {
  return (
    <>
      <rect x="190" y="760" width="1220" height="40" fill="#8a5f3d" />
      {Array.from({ length: 20 }, (_, i) => (
        <line key={i} x1={250 + i * 62} y1="764" x2={250 + i * 62} y2="798" stroke="#fff0d2" strokeWidth="2" opacity="0.1" />
      ))}
      <rect x="190" y="796" width="1220" height="90" fill="#b98a58" />
      <rect x="190" y="796" width="1220" height="16" fill="#7d5232" opacity="0.35" />

      {/* 수납 상자 두 개 */}
      <g>
        <rect x="262" y="826" width="136" height="56" rx="6" fill="#a7dcc4" {...OUT} />
        <rect x="262" y="826" width="136" height="12" rx="5" fill="#c3ead8" {...OUT} />
        <rect x="304" y="846" width="52" height="18" rx="4" fill="#fffdf6" stroke="#8fc3aa" strokeWidth="1.6" />
        <line x1="312" y1="855" x2="348" y2="855" stroke="#8fc3aa" strokeWidth="2.4" strokeLinecap="round" />
        <rect x="280" y="772" width="104" height="54" rx="6" fill="#f2c27c" {...OUT} />
        <rect x="280" y="772" width="104" height="11" rx="5" fill="#f9d79e" {...OUT} />
        <rect x="324" y="772" width="16" height="54" fill="#fbe9c4" opacity="0.8" />
      </g>

      {/* 벽에 기대 둔 가방 */}
      <g>
        <path d="M440 884 L452 800 Q480 790 506 800 L520 884Z" fill="#f6a5b8" {...OUT} />
        <rect x="448" y="826" width="64" height="34" rx="5" fill="#fbc4d1" stroke="#c97b90" strokeWidth="1.8" />
        <path d="M466 800 Q482 774 498 800" fill="none" stroke="#c97b90" strokeWidth="5" strokeLinecap="round" />
        <circle cx="480" cy="843" r="4.5" fill="#fff" />
      </g>

      {/* 휴지통과 구겨진 종이 */}
      <g>
        <path d="M1240 800 H1318 L1308 880 H1250Z" fill="#c9d9ea" {...OUT} />
        {[1256, 1274, 1292].map((x) => (
          <line key={x} x1={x} y1="806" x2={x - 2} y2="874" stroke="#98b3cf" strokeWidth="2" />
        ))}
        <ellipse cx="1279" cy="800" rx="40" ry="7" fill="#e4eef8" {...OUT} />
        <circle cx="1262" cy="796" r="9" fill="#fffdf6" stroke="#cda878" strokeWidth="1.6" />
        <circle cx="1292" cy="794" r="7.5" fill="#fff6dd" stroke="#cda878" strokeWidth="1.6" />
      </g>
    </>
  )
}

// 책상 바깥 오른쪽 바닥: 담요 바구니
export function Basket() {
  return (
    <g>
      <ellipse cx="1538" cy="884" rx="64" ry="9" fill="#5a3b24" opacity="0.3" />
      <path d="M1486 818 H1590 L1580 880 H1496Z" fill="#dca865" {...OUT} />
      {[836, 852, 868].map((y) => (
        <path key={y} d={`M${1490 + (y - 818) * 0.16} ${y} H${1586 - (y - 818) * 0.16}`} stroke="#b8803f" strokeWidth="2.4" strokeLinecap="round" />
      ))}
      <ellipse cx="1538" cy="818" rx="52" ry="9" fill="#efc88f" {...OUT} />
      {/* 담요 */}
      <path d="M1492 818 C1500 790 1580 784 1584 818 C1560 826 1516 826 1492 818Z" fill="#f6a5b8" {...OUT} />
      <path d="M1508 806 C1530 812 1556 812 1574 804" fill="none" stroke="#fbc4d1" strokeWidth="5" strokeLinecap="round" />
    </g>
  )
}

// 러그 위: 고양이 밥그릇 둘과 털실 뭉치
export function CatBits() {
  return (
    <g>
      {[[570, '#ffd4a8'], [646, '#bfe4f6']].map(([x, c]) => (
        <g key={x}>
          <ellipse cx={x} cy="880" rx="32" ry="7" fill="#5a3b24" opacity="0.25" />
          <path d={`M${x - 30} 862 H${x + 30} L${x + 22} 880 H${x - 22}Z`} fill="#f4eee2" {...OUT} />
          <ellipse cx={x} cy="862" rx="30" ry="6" fill={c} {...OUT} />
        </g>
      ))}
      <g>
        <circle cx="742" cy="870" r="17" fill="#ff8fa9" {...OUT} />
        <path d="M730 864 q12 8 24 -2 M728 872 q14 6 28 -2 M734 880 q10 2 18 -6" fill="none" stroke="#ffc0cf" strokeWidth="2" strokeLinecap="round" />
        <path d="M726 876 q-14 6 -26 -2 q-8 -4 -12 2" fill="none" stroke="#ff8fa9" strokeWidth="2.6" strokeLinecap="round" />
      </g>
    </g>
  )
}
