
// 고양이들: 검은 실루엣에 흰 동그라미 눈. 몸은 둥글고 부드러운 곡선으로 그립니다(주변 물건은 각진 도형). 좌표는 모두 '앉은 자리 가운데 아래'를 (0, 0)으로 한 값이고, 위쪽이 음수입니다.
// 눈동자(.desk__look)는 모든 고양이가 마우스를 따라가고, 눈 깜빡임(.cat__blink)도 모두 합니다.
// 책 더미 위 고양이(main)만 호버할 때 웃는 눈(.desk__happy)과 하트(.desk__hearts)가 나옵니다(스타일은 desk.css).

const INK = '#0a0a0a'

// 둥근 종 모양 몸통: 아래는 넓고 위는 좁아지는 부드러운 덩어리. w 는 아래 반폭, h 는 높이.
const body = (w, h) => `M${-w} 0 C${-w - 6} ${-h * 0.55} ${-w * 0.7} ${-h} 0 ${-h} C${w * 0.7} ${-h} ${w + 6} ${-h * 0.55} ${w} 0 Z`

// 둥근 머리: 볼이 통통하고 귀는 부드럽게 뾰족합니다. (0, -52) 아래쪽 가운데를 기준으로 가로 ±68, 높이 100 입니다.
const HEAD =
  'M-62 -78 C-72 -104 -58 -118 -50 -126 C-50 -138 -50 -148 -46 -156 C-36 -150 -26 -142 -20 -130 C-8 -133 8 -133 20 -130 C26 -142 36 -150 46 -156 C50 -148 50 -138 50 -126 C58 -118 72 -104 62 -78 C54 -58 24 -50 0 -50 C-24 -50 -54 -58 -62 -78 Z'

// 머리 크기를 s 배로(아래쪽 가운데 (0, -50)는 그대로) 그리고, dy 만큼 위로 올립니다.
const headAt = (s = 1, dy = 0) => `translate(0 ${-dy - 50 + 50 * s}) scale(${s})`

// 하트(가운데 아래 끝이 (0, 0)): 호버 때 솟아오르는 모양
const HEART = 'M0 12 C-22 -2 -12 -20 0 -9 C12 -20 22 -2 0 12 Z'

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
        <g className="desk__happy" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round">
          {[-gap, gap].map((dx) => (
            <path key={dx} d={`M${x + dx - r + 2} ${y + 6} Q${x + dx} ${y - r - 6} ${x + dx + r - 2} ${y + 6}`} />
          ))}
        </g>
      )}
    </g>
  )
}

// 굵고 둥근 꼬리(선 하나). 호버하면 흔들립니다.
function Tail({ d, width = 16, origin }) {
  return <path className="desk__tail" d={d} fill="none" stroke={INK} strokeWidth={width} strokeLinecap="round" style={origin ? { transformOrigin: origin } : undefined} />
}

// A. 책 더미 위에 앉은 고양이(정면). 호버하면 웃는 눈과 하트, 꼬리를 빨리 흔듭니다.
export function CatBooks({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Tail d="M40 -8 C84 -4 104 -34 92 -70" />
      <path d={body(50, 82)} fill={INK} />
      <path d={HEAD} fill={INK} />
      <Eyes y={-94} gap={29} r={17} main />
      <g className="desk__hearts" fill="#0038ff">
        {[[-62, -170, 'a'], [0, -192, 'b'], [62, -170, 'c']].map(([hx, hy, k]) => (
          <g key={k} transform={`translate(${hx} ${hy})`}>
            <path className={`desk__heart desk__heart--${k}`} d={HEART} />
          </g>
        ))}
      </g>
    </g>
  )
}

// B. 노트북 화면 위로 고개를 내민 고양이. 몸은 화면 뒤에 있어서 머리와 앞발만 보입니다. (0, 0)은 화면 윗변 가운데.
export function CatPeek({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-72 14 C-82 -18 -68 -42 -58 -52 C-58 -62 -58 -72 -54 -80 C-44 -74 -36 -66 -30 -56 C-12 -60 12 -60 30 -56 C36 -66 44 -74 54 -80 C58 -72 58 -62 58 -52 C68 -42 82 -18 72 14 Z"
        fill={INK}
      />
      <Eyes y={-14} gap={30} r={16} delay={1.2} />
    </g>
  )
}
// 노트북 화면 윗변에 걸친 앞발(노트북보다 앞에 그립니다): 둥근 발끝과 발가락 선
export function PeekPaws({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[-46, 46].map((dx) => (
        <g key={dx}>
          <rect x={dx - 17} y="-12" width="34" height="22" rx="11" fill={INK} />
          <path d={`M${dx - 6} -4 V4 M${dx + 6} -4 V4`} stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

// C. 창턱에 앉아 바깥을 보는 뒷모습 고양이: 통통한 종 모양 몸에 둥근 머리, 쫑긋한 두 귀, 옆으로 길게 늘어뜨린 꼬리
export function CatWindow({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Tail d="M-50 -8 C-100 -4 -122 -26 -112 -52" width={18} origin="100% 100%" />
      <path d="M-62 0 C-80 -32 -64 -78 -28 -96 C-10 -101 10 -101 28 -96 C64 -78 80 -32 62 0 C30 7 -30 7 -62 0 Z" fill={INK} />
      <path
        d="M-46 -112 C-50 -132 -46 -150 -41 -168 C-29 -160 -19 -152 -12 -146 C-4 -148 4 -148 12 -146 C19 -152 29 -160 41 -168 C46 -150 50 -132 46 -112 C44 -92 22 -82 0 -82 C-22 -82 -44 -92 -46 -112 Z"
        fill={INK}
      />
      <g stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d="M-47 -122 C-56 -123 -62 -121 -68 -119 M-47 -112 C-56 -112 -64 -109 -70 -106" />
        <path d="M47 -122 C56 -123 62 -121 68 -119 M47 -112 C56 -112 64 -109 70 -106" />
      </g>
    </g>
  )
}

// D. 헤드폰을 끼고 음악을 듣는 고양이(러그 위)
export function CatHeadphones({ x, y }) {
  const band = 'M-64 -92 C-64 -146 64 -146 64 -92'
  return (
    <g transform={`translate(${x} ${y})`}>
      <Tail d="M42 -8 C88 -4 110 -36 96 -74" />
      <path d={body(46, 74)} fill={INK} />
      <path d={HEAD} transform={headAt(0.92)} fill={INK} />
      <Eyes y={-88} gap={26} r={15} delay={2.4} />
      <path d={band} fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <path d={band} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {[-64, 64].map((dx) => (
        <rect key={dx} x={dx - 12} y="-108" width="24" height="38" rx="10" fill="#fff" stroke={INK} strokeWidth="4" />
      ))}
      {/* 헤드폰 오른쪽 위로 음표가 솟아올랐다 사라지길 반복합니다(동작은 desk.css 의 .desk__note) */}
      {[[84, -128, 0], [104, -150, 0.9], [92, -176, 1.8]].map(([nx, ny, delay], i) => (
        <g key={i} transform={`translate(${nx} ${ny})`}>
          <g className="desk__note" style={{ animationDelay: `${delay}s` }} fill={INK} stroke={INK} strokeWidth="4" strokeLinecap="round">
            <ellipse cx="0" cy="0" rx="7" ry="5.5" stroke="none" />
            <path d="M6 -1 V-26 C12 -22 16 -20 16 -12" fill="none" />
          </g>
        </g>
      ))}
    </g>
  )
}

// F. 바닥에 납작하게 엎드려 앞발을 쭉 뻗은 고양이
export function CatLying({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Tail d="M118 -10 C152 -8 164 -30 154 -54" />
      <path d="M-70 0 C-70 -52 -30 -66 30 -64 C90 -62 126 -44 126 0 Z" fill={INK} />
      <ellipse cx="-122" cy="-7" rx="26" ry="9" fill={INK} />
      <path d="M-126 -34 C-126 -58 -108 -66 -88 -66 C-68 -66 -50 -58 -50 -34 C-50 -10 -68 0 -88 0 C-108 0 -126 -10 -126 -34 Z" fill={INK} />
      <path d="M-116 -56 L-112 -84 L-92 -64 Z M-84 -64 L-64 -82 L-60 -56 Z" fill={INK} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <Eyes x={-88} y={-34} gap={17} r={8} delay={1.8} />
    </g>
  )
}
