// 케이스의 대표 비주얼. 데이터의 cover.kind 에 따라 실제 화면, 실제 수치, 핵심 전환 중 하나를 보여 줍니다.
// 모든 값은 케이스 데이터에서 가져오며, 이 파일은 모양만 정합니다.

function Screens({ cover, size }) {
  return (
    <div className={`cover cover--screens cover--${size}${cover.tone ? ` cover--${cover.tone}` : ''}`} aria-hidden={cover.decorative ? 'true' : undefined}>
      {cover.images.map((img, i) => (
        <figure className={`phone phone--${i + 1}`} key={img.src}>
          <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
        </figure>
      ))}
    </div>
  )
}

function Bars({ cover, size }) {
  const max = cover.max ?? Math.max(...cover.items.map((b) => b.value))
  const last = cover.items.length - 1
  return (
    <div className={`cover cover--bars cover--${size}`} role="img" aria-label={cover.alt}>
      <div className="bars__head">
        <p className="cover__cap">{cover.caption}</p>
        {cover.unit && <span className="bars__unit">{cover.unit}</span>}
      </div>
      <div className="bars">
        {cover.items.map((b, i) => (
          <div className="bars__row" key={b.label}>
            <span className="bars__l">
              {b.label}
              {b.note && <small>{b.note}</small>}
            </span>
            <span className="bars__track">
              <span className={i === last ? 'bars__bar is-last' : 'bars__bar'} style={{ width: `${(b.value / max) * 100}%` }} />
            </span>
            <span className="bars__v tnum">{b.display}</span>
          </div>
        ))}
      </div>
      {cover.source && <p className="bars__src">{cover.source}</p>}
    </div>
  )
}

function Shift({ cover, size }) {
  return (
    <div className={`cover cover--shift cover--${size}`} role="img" aria-label={cover.alt}>
      <p className="cover__cap">{cover.caption}</p>
      <p className="shift__from">{cover.from}</p>
      <p className="shift__arrow" aria-hidden="true">
        ↓
      </p>
      <p className="shift__to">{cover.to}</p>
    </div>
  )
}

// 서비스 로고. 한 입 베어 문 접시 안에 체크 표시(오늘 할 일 하나를 끝낸다)를 두었고, 마우스를 올리면 한 입 더 베어 뭅니다.
function Logo({ cover, size }) {
  const mask = `logo-bite-${size}`
  return (
    <div className={`cover cover--logo cover--${size}`} role="img" aria-label={cover.alt}>
      <svg className="logo__mark" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
        <defs>
          <mask id={mask}>
            <rect width="96" height="96" fill="#fff" />
            <circle className="logo__bite" cx="76" cy="22" r="17" fill="#000" />
          </mask>
        </defs>
        <circle className="logo__plate" cx="48" cy="50" r="38" mask={`url(#${mask})`} />
        <path className="logo__check" d="M28 54 L41 67 L62 44" pathLength="1" />
        <circle className="logo__crumb logo__crumb--1" cx="85" cy="40" r="2.6" />
        <circle className="logo__crumb logo__crumb--2" cx="91" cy="31" r="2" />
      </svg>
      <p className="logo__name">{cover.name}</p>
      <p className="logo__tag">{cover.tagline}</p>
    </div>
  )
}

// 이미지 한 장을 표지 전체에 채웁니다(가로가 긴 배너에서는 얼굴이 보이는 높이로 맞춰 잘림).
function Photo({ cover, size }) {
  return (
    <div className={`cover cover--image cover--${size}`}>
      <img src={cover.src} alt={cover.alt} loading="lazy" decoding="async" />
    </div>
  )
}

// 서비스 로고 이미지를 가운데에 둡니다(정사각형, 배경은 투명).
function Mark({ cover, size }) {
  return (
    <div className={`cover cover--mark cover--${size}`}>
      <img src={cover.src} alt={cover.alt} loading="lazy" decoding="async" />
    </div>
  )
}

const COVERS = { screens: Screens, bars: Bars, shift: Shift, logo: Logo, image: Photo, mark: Mark }

export default function CaseCover({ cover, size = 'card' }) {
  const Cover = COVERS[cover?.kind]
  return Cover ? <Cover cover={cover} size={size} /> : null
}
