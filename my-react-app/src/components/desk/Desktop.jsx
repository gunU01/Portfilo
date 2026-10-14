import Fern from './Fern.jsx'
import Hotspot from './Hotspot.jsx'
import { OUT, OUT_DARK } from './outline.js'

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
          <rect x={x} y="676" width="78" height="210" rx="7" fill="#f3cc94" {...OUT} />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x + 12 + i * 22} y="700" width="12" height="170" rx="5" fill="#e6b479" />
          ))}
        </g>
      ))}
      {/* 앞면 */}
      <rect x="200" y="676" width="1200" height="92" rx="4" fill="#f7d4a2" {...OUT} />
      <rect x="204" y="680" width="1192" height="7" rx="3" fill="#e9bb80" opacity="0.7" />
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
        {/* 마우스를 올리면 서랍이 살짝 열립니다 */}
        <g className="desk__drawer">
          <rect x="304" y="694" width="422" height="60" rx="8" fill="#fbe1b6" {...OUT} />
          <rect x="314" y="702" width="402" height="44" rx="5" fill="#f6d5a1" stroke="#e3b678" strokeWidth="1.8" />
          <rect x="486" y="700" width="60" height="17" rx="4" fill="#fffdf6" stroke="#cda878" strokeWidth="1.8" />
          {MARKS[mark]}
          <rect x="478" y="722" width="76" height="17" rx="8.5" fill="#dc9a45" {...OUT} />
          <rect x="486" y="725" width="60" height="4" rx="2" fill="#f4c986" />
        </g>
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
      <polygon points="150,630 1450,630 1500,664 100,664" fill="url(#d-top)" {...OUT} />
      <rect x="100" y="664" width="1400" height="18" rx="6" fill="#efc189" {...OUT} />
      <line x1="170" y1="636" x2="1430" y2="636" stroke="#fff" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
      {grain}

      {/* 상판 위 그림자 */}
      <ellipse cx="710" cy="650" rx="190" ry="9" fill="#6a4020" opacity="0.28" />
      <ellipse cx="412" cy="646" rx="110" ry="8" fill="#6a4020" opacity="0.25" />
      <ellipse cx="1070" cy="652" rx="130" ry="7" fill="#6a4020" opacity="0.2" />
      <ellipse cx="1340" cy="648" rx="70" ry="7" fill="#6a4020" opacity="0.28" />

      {/* 화분 */}
      <Fern x={250} y={606} scale={0.62} fronds={9} spread={140} len={130} />
      <path d="M222 600 H278 L272 644 H228Z" fill="#ee9b76" {...OUT} />
      <rect x="216" y="592" width="68" height="12" rx="4" fill="#f6b48f" {...OUT} />
    </>
  )
}

// 책 위에 널브러진 까만 덩어리 고양이. 로우폴리(각진 면)로 단순하게 그리고, 표정은 눈만 남겼습니다(코, 입 없음).
// 눈동자는 마우스를 따라가고(--px/--py), 마우스를 올리면 눈을 감고 웃으며 하트를 날립니다. 꼬리는 살랑거립니다.
const FACETS = [
  ['#2b2832', '398,450 414,462 400,490 388,468'],
  ['#19171d', '442,450 426,462 440,490 452,468'],
  ['#27242e', '414,462 426,462 440,490 400,490'],
  ['#24212a', '372,486 388,468 400,490 392,520 366,532 360,508'],
  ['#1a181f', '468,486 452,468 440,490 450,520 474,532 480,508'],
  ['#2e2b37', '400,490 440,490 450,520 392,520'],
  ['#1d1b22', '392,520 450,520 474,532 366,532'],
]

function Cat() {
  return (
    <g>
      <g className="desk__tail">
        <polygon points="366,526 352,521 343,505 349,494 358,498 358,512 369,516" fill="#1e1c23" />
        <polygon points="349,494 358,498 358,512 352,521 343,505" fill="#2a2731" />
      </g>
      <g className="desk__breathe">
        {/* 덩어리: 윤곽 위에 면을 겹쳐 깎은 느낌을 냅니다 */}
        <polygon points="366,532 360,508 372,486 388,468 398,448 414,462 426,462 442,448 452,468 468,486 480,508 474,532" fill="#211e27" />
        {FACETS.map(([c, pts]) => (
          <polygon key={pts} points={pts} fill={c} />
        ))}
        <polygon points="399,455 408,464 394,466" fill="#c4607a" />
        <polygon points="441,455 432,464 446,466" fill="#c4607a" />
        {/* 앞발은 그냥 납작한 조각 */}
        <polygon points="394,532 398,524 410,524 414,532" fill="#34303d" />
        <polygon points="426,532 430,524 442,524 446,532" fill="#34303d" />
      </g>
      {/* 눈은 크기가 다르고 서로 다른 데를 봅니다 */}
      <g className="desk__blink">
        <circle cx="405" cy="480" r="9.5" fill="#fff" />
        <circle cx="435" cy="478" r="6.5" fill="#fff" />
        <g className="desk__look">
          <circle cx="408" cy="484" r="3.6" fill="#0d0c10" />
          <circle cx="433" cy="480" r="2.6" fill="#0d0c10" />
        </g>
      </g>
      <g className="desk__happy" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M397 483 L405 476 L413 483" />
        <path d="M428 481 L435 475 L442 481" />
      </g>
      <g className="desk__hearts" fill="#ff6f8f">
        <path className="desk__heart" d="M352 462 C346 456 348 451 352 454 C356 451 358 456 352 462Z" />
        <path className="desk__heart desk__heart--b" d="M492 466 C486 460 488 455 492 458 C496 455 498 460 492 466Z" />
        <path className="desk__heart desk__heart--c" d="M376 440 C371 435 373 431 376 433 C379 431 381 435 376 440Z" />
      </g>
    </g>
  )
}

// 책 더미(기획 작업물). 맨 위에서 까만 고양이가 앉아 있습니다.
const BOOKS = [
  { x: 330, y: 614, w: 172, h: 30, c: '#4f8f7e', band: '#86b9a8' },
  { x: 340, y: 586, w: 152, h: 28, c: '#f08a6b', band: '#f7b49b', rot: [-2, 415, 600] },
  { x: 334, y: 558, w: 164, h: 28, c: '#f4d77a', band: '#faeaa8', rot: [1.5, 415, 574] },
  { x: 346, y: 532, w: 142, h: 26, c: '#7bb88a', band: '#a9d6b4', rot: [-3, 415, 546] },
]

export function BookStack() {
  return (
    <Hotspot id="books">
      <rect x="326" y="446" width="200" height="200" fill="transparent" />
      {BOOKS.map(({ x, y, w, h, c, band, rot }) => (
        <g key={y} transform={rot ? `rotate(${rot.join(' ')})` : undefined}>
          <rect x={x} y={y} width={w} height={h} rx="5" fill={c} {...OUT} />
          <rect x={x + w - 13} y={y + 4} width="9" height={h - 8} rx="2" fill="#fff6e0" />
          <rect x={x + 10} y={y + h / 2 - 1.5} width={w * 0.42} height="3" rx="1.5" fill={band} />
          <rect x={x + 6} y={y + 4} width="3" height={h - 8} rx="1.5" fill="#000" opacity="0.12" />
        </g>
      ))}
      <Cat />
    </Hotspot>
  )
}

// 노트북(프로젝트)
export function Laptop() {
  return (
    <Hotspot id="laptop">
      <rect x="524" y="456" width="376" height="204" fill="transparent" />
      <rect x="560" y="464" width="304" height="176" rx="12" fill="#363842" {...OUT_DARK} />
      <rect x="572" y="476" width="280" height="152" rx="4" fill="#f7f9fd" />
      <rect x="572" y="476" width="280" height="26" rx="4" fill="#eaf0fb" />
      <circle cx="712" cy="470" r="2.2" fill="#6b6e7a" />
      <circle cx="586" cy="489" r="4" fill="#ef7a6c" />
      <circle cx="600" cy="489" r="4" fill="#f2c14e" />
      <circle cx="614" cy="489" r="4" fill="#6cc48a" />
      {[
        ['#1f6bff', '얼마'],
        ['#ff9f43', '해미'],
        ['#ff6fa3', '토스'],
      ].map(([c, t], i) => (
        <g key={t} transform={`translate(${584 + i * 90} 514)`}>
          <g className="desk__card" style={{ '--i': i }}>
          <rect width="80" height="104" rx="8" fill="#ffffff" stroke="#e1e8f5" strokeWidth="2" />
          <rect x="8" y="8" width="64" height="44" rx="5" fill={c} opacity="0.9" />
          <rect x="8" y="62" width="50" height="6" rx="3" fill="#cfd9ec" />
          <rect x="8" y="76" width="34" height="6" rx="3" fill="#dfe6f3" />
          <circle cx="22" cy="30" r="9" fill="#ffffff" opacity="0.55" />
          </g>
        </g>
      ))}
      <path d="M522 640 H902 L914 658 H510Z" fill="#d6d9e1" {...OUT_DARK} />
      <rect x="682" y="640" width="60" height="6" rx="3" fill="#b1b5bf" />
      <path d="M510 658 H914 V662 H510Z" fill="#a4a8b2" />
      <path d="M846 631 C838 625 840 620 846 622 C852 620 854 625 846 631Z" fill="#ff7aa8" />
    </Hotspot>
  )
}

// 김이 오르는 머그컵 (얼굴이 있습니다). 마우스를 올리면 흔들립니다.
export function Mug() {
  return (
    <g className="desk__mug">
      <ellipse cx="956" cy="648" rx="30" ry="5.5" fill="#f4ebd8" {...OUT} strokeWidth="2" />
      <path d="M974 622 C994 620 994 644 974 642" fill="none" stroke="#9a6a45" strokeWidth="9.4" strokeLinecap="round" />
      <path d="M974 622 C994 620 994 644 974 642" fill="none" stroke="#fffaf0" strokeWidth="5" strokeLinecap="round" />
      <rect x="934" y="614" width="40" height="34" rx="9" fill="#fffaf0" />
      <rect x="934" y="618" width="40" height="7" fill="#6bb27a" />
      <rect x="934" y="614" width="40" height="34" rx="9" fill="none" {...OUT} />
      <circle cx="946" cy="635" r="2" fill="#5a3b2a" />
      <circle cx="962" cy="635" r="2" fill="#5a3b2a" />
      <path d="M950 639 Q954 643 958 639" fill="none" stroke="#5a3b2a" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="941" cy="639" rx="3" ry="2" fill="#ff9fb4" opacity="0.7" />
      <ellipse cx="967" cy="639" rx="3" ry="2" fill="#ff9fb4" opacity="0.7" />

      <g className="desk__steam" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.85">
        <path d="M946 606 C940 594 954 588 948 574" />
        <path d="M962 606 C956 596 968 590 963 578" className="desk__steam--b" />
      </g>
    </g>
  )
}

// 펼쳐 놓은 노트와 연필(소개)
export function Notebook() {
  return (
    <Hotspot id="notebook">
      <rect x="990" y="596" width="240" height="68" fill="transparent" />
      <path d="M1000 636 L1112 628 L1112 652 L1000 662Z" fill="#fffaf0" {...OUT} strokeWidth="2" />
      <path d="M1116 628 L1228 636 L1228 662 L1116 652Z" fill="#fffdf6" {...OUT} strokeWidth="2" />
      <path d="M1112 628 V652" stroke="#d4b98a" strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <g key={i} stroke="#d8c9a0" strokeWidth="2" strokeLinecap="round">
          <line x1="1014" y1={640 + i * 6} x2="1098" y2={634 + i * 6} />
          <line x1="1130" y1={634 + i * 6} x2="1210" y2={640 + i * 6} />
        </g>
      ))}
      <rect x="1030" y="630" width="30" height="3" fill="#e08a4f" transform="rotate(-4 1045 631)" />
      <g transform="rotate(-6 1180 624)">
        {/* 마우스를 올리면 연필이 글씨를 쓰듯 움직입니다 */}
        <g className="desk__pencil">
          <rect x="1150" y="620" width="104" height="9" rx="2.5" fill="#f2c14e" {...OUT} strokeWidth="1.8" />
          <polygon points="1254,620 1273,624.5 1254,629" fill="#f6e2bb" {...OUT} strokeWidth="1.6" />
          <polygon points="1267,623 1273,624.5 1267,626" fill="#3a2c2a" />
          <rect x="1150" y="620" width="11" height="9" rx="2.5" fill="#f19aa8" {...OUT} strokeWidth="1.8" />
        </g>
      </g>
    </Hotspot>
  )
}

export function PencilCup() {
  return (
    <g>
      <path d="M1258 604 L1260 588 M1268 604 L1276 584 M1278 604 L1284 592" stroke="#e08a4f" strokeWidth="5" strokeLinecap="round" />
      <path d="M1268 604 L1276 584" stroke="#7bb88a" strokeWidth="5" strokeLinecap="round" />
      <path d="M1260 589 L1260 586 M1275 586 L1276 583" stroke="#3a2c2a" strokeWidth="5" strokeLinecap="round" />
      <rect x="1252" y="600" width="42" height="46" rx="8" fill="#d9eef1" opacity="0.92" stroke="#8fbac1" strokeWidth="2.4" />
      <path d="M1259 608 V636" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
    </g>
  )
}

// 스탠드
export function Lamp() {
  return (
    <g>
      <ellipse cx="1356" cy="646" rx="42" ry="9" fill="#c99a62" {...OUT} />
      <rect x="1348" y="548" width="16" height="96" rx="5" fill="#d8a76b" {...OUT} />
      <ellipse cx="1356" cy="548" rx="9" ry="6" fill="#c99a62" {...OUT} />
      <path d="M1306 458 H1406 L1436 550 H1276Z" fill="url(#d-shade)" stroke="#6f9a5e" strokeWidth="2.4" strokeLinejoin="round" />
      {[1316, 1332, 1348, 1364, 1380, 1396, 1412, 1428].map((x, i) => (
        <line key={x} x1={1310 + i * 14 * 0.9} y1="460" x2={x - 6 + (i - 3.5) * 2} y2="548" stroke="#86b36f" strokeWidth="2.4" opacity="0.6" />
      ))}
      <ellipse cx="1356" cy="458" rx="50" ry="8" fill="#d3e9bf" stroke="#6f9a5e" strokeWidth="2.4" />
    </g>
  )
}
