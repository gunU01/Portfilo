import Fern from './Fern.jsx'
import Hotspot from './Hotspot.jsx'

const rnd = (seed) => {
  let a = seed
  return () => {
    a = (a * 16807) % 2147483647
    return a / 2147483647
  }
}

// 책상 몸통: 서랍 속, 다리, 앞면
export function DeskBase() {
  return (
    <>
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
    </>
  )
}

// 서랍 이름표 카드에 붙는 표시(별, 하트)
const MARKS = {
  star: <polygon points="516,702 518,707 523,707 519,710 521,715 516,712 511,715 513,710 509,707 514,707" fill="#ffc83d" />,
  heart: <path d="M516 713 C506 706 510 700 516 704 C522 700 526 706 516 713Z" fill="#ff6f8f" />,
}

// 서랍 한 칸. 왼쪽 칸 기준으로 그리고 dx 만큼 옮깁니다.
export function Drawer({ id, dx = 0, mark }) {
  return (
    <Hotspot id={id}>
      <g transform={`translate(${dx} 0)`}>
        <rect x="300" y="690" width="430" height="68" fill="transparent" />
        <rect x="304" y="694" width="422" height="60" rx="4" fill="#f6d9a8" stroke="#dba96c" strokeWidth="3" />
        <rect x="486" y="700" width="60" height="16" rx="3" fill="#fffdf6" stroke="#d9b98a" strokeWidth="1.6" />
        {MARKS[mark]}
        <rect x="478" y="722" width="76" height="16" rx="8" fill="#b9884f" />
        <rect x="482" y="724" width="68" height="5" rx="2.5" fill="#cf9d62" />
      </g>
    </Hotspot>
  )
}

// 상판, 나뭇결, 물건 밑 그림자, 상판 위 화분
export function DeskTop() {
  const grain = []
  const g = rnd(5)
  for (let i = 0; i < 22; i += 1) {
    const y = 636 + g() * 22
    const x = 160 + g() * 1100
    grain.push(<line key={i} x1={x} y1={y} x2={x + 120 + g() * 160} y2={y + (g() - 0.5) * 2} stroke="#cf9c60" strokeWidth="1.6" opacity="0.35" />)
  }
  return (
    <>
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
    </>
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

// 책 더미(기획 작업물). 맨 위에서 고양이가 낮잠을 자고 있습니다.
export function BookStack() {
  return (
    <Hotspot id="books">
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
    </Hotspot>
  )
}

// 노트북(프로젝트)
export function Laptop() {
  return (
    <Hotspot id="laptop">
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
    </Hotspot>
  )
}

// 김이 오르는 머그컵
export function Mug() {
  return (
    <>
      <g>
        <rect x="934" y="614" width="40" height="34" rx="8" fill="#fbf6ea" />
        <rect x="934" y="624" width="40" height="8" fill="#6bb27a" />
        <path d="M974 622 C992 622 992 642 974 642" fill="none" stroke="#fbf6ea" strokeWidth="6" />
      </g>

      <g className="desk__steam" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8">
        <path d="M946 606 C940 594 954 588 948 574" />
        <path d="M962 606 C956 596 968 590 963 578" className="desk__steam--b" />
      </g>
    </>
  )
}

// 펼쳐 놓은 노트와 연필(소개)
export function Notebook() {
  return (
    <Hotspot id="notebook">
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
    </Hotspot>
  )
}

export function PencilCup() {
  return (
      <g>
        <path d="M1258 604 L1262 590 M1268 604 L1276 586 M1278 604 L1282 592" stroke="#e08a4f" strokeWidth="4" strokeLinecap="round" />
        <rect x="1252" y="600" width="42" height="46" rx="7" fill="#d6ebee" opacity="0.8" stroke="#b5d3d8" strokeWidth="2" />
      </g>
  )
}

// 스탠드
export function Lamp() {
  return (
      <g>
        <ellipse cx="1356" cy="646" rx="42" ry="9" fill="#b98a58" />
        <rect x="1348" y="548" width="16" height="96" rx="4" fill="#cf9d62" />
        <ellipse cx="1356" cy="548" rx="8" ry="6" fill="#b98a58" />
        <path d="M1306 458 H1406 L1436 550 H1276Z" fill="url(#d-shade)" />
        {[1316, 1332, 1348, 1364, 1380, 1396, 1412, 1428].map((x, i) => (
          <line key={x} x1={1310 + i * 14 * 0.9} y1="460" x2={x - 6 + (i - 3.5) * 2} y2="548" stroke="#86b36f" strokeWidth="2.4" opacity="0.7" />
        ))}
        <ellipse cx="1356" cy="458" rx="50" ry="8" fill="#cfe6ba" />
        <ellipse cx="1356" cy="458" rx="40" ry="5" fill="#d6e6c4" opacity="0.6" />
      </g>
  )
}
