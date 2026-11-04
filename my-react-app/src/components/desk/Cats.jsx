import { pts, spikes } from './shapes.js'

// 고양이들: 검은 실루엣에 흰 동그라미 눈. 몸은 각진 도형으로 그립니다. 좌표는 모두 '앉은 자리 가운데 아래'를 (0, 0)으로 한 값이고, 위쪽이 음수입니다.
// 눈동자(.desk__look)는 모든 고양이가 마우스를 따라가고, 눈 깜빡임(.cat__blink)도 모두 합니다.
// 책 더미 위 고양이(main)만 호버할 때 웃는 눈(.desk__happy)과 하트(.desk__hearts)가 나옵니다(스타일은 desk.css).

// 눈 한 쌍: 흰 동그라미 테두리 + 안쪽의 흰 눈동자. main 이면 호버용 클래스 이름을 씁니다.
function Eyes({ x = 0, y, gap, r, main = false, delay = 0 }) {
  const blink = main ? 'desk__blink' : 'cat__blink'
  return (
    <g>
      <g className={blink} style={{ animationDelay: `${delay}s` }}>
        {[-gap, gap].map((dx) => (
          <g key={dx}>
            <circle cx={x + dx} cy={y} r={r} fill="none" stroke="#fff" strokeWidth="5" />
            <circle className="desk__look" cx={x + dx} cy={y} r={Math.max(3, r * 0.4)} fill="#fff" />
          </g>
        ))}
      </g>
      {main && (
        <g className="desk__happy" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="miter">
          {[-gap, gap].map((dx) => (
            <polyline key={dx} points={pts([[x + dx - r, y + 5], [x + dx, y - r + 4], [x + dx + r, y + 5]])} />
          ))}
        </g>
      )}
    </g>
  )
}

// A. 책 더미 위에 앉은 고양이(정면). 호버하면 웃는 눈과 하트, 꼬리를 빨리 흔듭니다.
export function CatBooks({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon className="desk__tail" points={pts([[40, -4], [92, -14], [106, -58], [88, -64], [80, -32], [40, -22]])} fill="#0a0a0a" />
      <polygon points={pts([[-48, 0], [-44, -50], [-26, -76], [26, -76], [44, -50], [48, 0]])} fill="#0a0a0a" />
      <polygon points={pts([[-64, -72], [-68, -106], [-54, -146], [-30, -120], [30, -120], [54, -146], [68, -106], [64, -72], [30, -56], [-30, -56]])} fill="#0a0a0a" />
      <Eyes y={-94} gap={29} r={17} main />
      <g className="desk__hearts" fill="#0038ff">
        {[[-62, -170, ''], [0, -190, 'b'], [62, -170, 'c']].map(([hx, hy, k]) => (
          <polygon key={hx} className={`desk__heart desk__heart--${k || 'a'}`} points={pts([[hx, hy - 12], [hx + 12, hy], [hx, hy + 12], [hx - 12, hy]])} />
        ))}
      </g>
    </g>
  )
}

// B. 노트북 화면 위로 고개를 내민 고양이. 몸은 화면 뒤에 있어서 머리와 앞발만 보입니다. (0, 0)은 화면 윗변 가운데.
export function CatPeek({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={pts([[-72, 14], [-74, -30], [-58, -66], [-34, -40], [34, -40], [58, -66], [74, -30], [72, 14]])} fill="#0a0a0a" />
      <Eyes y={-14} gap={30} r={16} delay={1.2} />
    </g>
  )
}
// 노트북 화면 윗변에 걸친 앞발(노트북보다 앞에 그립니다)
export function PeekPaws({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#0a0a0a">
      {[-46, 46].map((dx) => (
        <g key={dx}>
          <polygon points={pts([[dx - 16, 8], [dx - 14, -8], [dx + 14, -8], [dx + 16, 8]])} />
          <path d={`M${dx - 5} -8 V-1 M${dx + 5} -8 V-1`} stroke="#fff" strokeWidth="2.5" />
        </g>
      ))}
    </g>
  )
}

// C. 창턱에 앉아 바깥을 보는 뒷모습 고양이
export function CatWindow({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#0a0a0a">
      <polygon className="desk__tail" style={{ transformOrigin: '100% 100%' }} points={pts([[-34, -2], [-78, -8], [-90, -52], [-72, -56], [-64, -26], [-34, -18]])} />
      <polygon points={pts([[-36, 0], [-40, -50], [-26, -88], [-30, -124], [-8, -102], [8, -102], [30, -124], [26, -88], [40, -50], [36, 0]])} />
    </g>
  )
}

// D. 헤드폰을 끼고 음악을 듣는 고양이(러그 위)
export function CatHeadphones({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon className="desk__tail" points={pts([[44, -4], [96, -16], [112, -62], [94, -68], [84, -34], [44, -22]])} fill="#0a0a0a" />
      <polygon points={pts([[-46, 0], [-42, -48], [-24, -72], [24, -72], [42, -48], [46, 0]])} fill="#0a0a0a" />
      <polygon points={pts([[-58, -68], [-60, -100], [-46, -136], [-26, -114], [26, -114], [46, -136], [60, -100], [58, -68], [28, -54], [-28, -54]])} fill="#0a0a0a" />
      <Eyes y={-90} gap={26} r={15} delay={2.4} />
      <polyline points={pts([[-62, -92], [-62, -128], [0, -142], [62, -128], [62, -92]])} fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="miter" />
      <polyline points={pts([[-62, -92], [-62, -128], [0, -142], [62, -128], [62, -92]])} fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinejoin="miter" />
      {[-62, 62].map((dx) => (
        <rect key={dx} x={dx - 11} y={-106} width="22" height="36" fill="#fff" stroke="#0a0a0a" strokeWidth="4" />
      ))}
      <g fill="#0a0a0a" stroke="#0a0a0a" strokeWidth="3">
        <polygon points={pts([[84, -150], [96, -154], [96, -190], [90, -190], [90, -164], [84, -162]])} />
        <rect x="106" y="-176" width="14" height="10" transform="rotate(-20 113 -171)" />
        <polygon points={pts([[114, -170], [120, -172], [120, -204], [114, -202]])} />
      </g>
    </g>
  )
}

// E. 책상 밑에서 올려다보는 검댕이 고양이
export function CatSoot({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points={spikes(0, 0, 54, 40, 12)} fill="#0a0a0a" />
      <Eyes y={-2} gap={19} r={12} delay={3.6} />
    </g>
  )
}

// F. 책상 가장자리를 향해 앞발을 뻗는 고양이(서 있음)
export function CatReach({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#0a0a0a">
      <polygon className="desk__tail" points={pts([[28, -6], [74, -18], [84, -62], [66, -64], [60, -34], [28, -26]])} />
      <polygon points={pts([[-34, 0], [-40, -72], [-30, -132], [30, -132], [38, -72], [32, 0]])} />
      <polygon points={pts([[22, -118], [50, -122], [50, -300], [34, -304], [24, -300]])} />
      <polygon points={pts([[22, -304], [50, -308], [58, -326], [14, -326]])} />
      <path d="M22 -344 V-362 M36 -348 V-370 M50 -344 V-362" stroke="#0a0a0a" strokeWidth="5" fill="none" />
      <polygon points={pts([[-52, -140], [-54, -176], [-42, -214], [-22, -192], [22, -192], [42, -214], [54, -176], [52, -140], [24, -124], [-24, -124]])} />
      <Eyes y={-160} gap={22} r={13} delay={0.6} />
    </g>
  )
}
