// 케이스의 대표 비주얼. 데이터의 cover.kind 에 따라 실제 화면, 실제 수치, 핵심 전환 중 하나를 보여 줍니다.
// 모든 값은 케이스 데이터에서 가져오며, 이 파일은 모양만 정합니다.
import Arrow from './Arrow.jsx'

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
      <p className="shift__arrow">
        <Arrow dir="down" />
      </p>
      <p className="shift__to">{cover.to}</p>
    </div>
  )
}

// 서비스 로고. 손으로 그린 듯한 굵은 한 줄 선의 쿠키형 접시에 한 입 베어 문 자국이 있고, 안에는 체크 표시(오늘 할 일 하나를 끝낸다)가 있습니다.
// 마우스를 올리면 접시가 살짝 기울고 부스러기가 튀어 나갑니다.
function Logo({ cover, size }) {
  return (
    <div className={`cover cover--logo cover--${size}`} role="img" aria-label={cover.alt}>
      <svg className="logo__mark" viewBox="0 0 120 112" aria-hidden="true" focusable="false">
        <g className="logo__plate">
          <path d="M20 62 C17 38 36 21 58 20 C68 19.5 76 22 82 26 C77 31 81 38 88 38 C86 45 92 47 99 50 C103 72 90 93 66 99 C44 104 23 91 20 62 Z" />
          <circle className="logo__chip" cx="36" cy="44" r="3" />
          <circle className="logo__chip" cx="64" cy="35" r="2.6" />
          <circle className="logo__chip" cx="82" cy="72" r="3" />
          <circle className="logo__chip" cx="44" cy="86" r="2.4" />
        </g>
        <path className="logo__check" d="M37 62 L51 76 L75 50" pathLength="1" />
        <path className="logo__crumb logo__crumb--1" d="M101 21 C104 22 105 27 102 29 C99 28 98 23 101 21 Z" />
        <path className="logo__crumb logo__crumb--2" d="M111 37 C114 38 114 42 112 43 C109 42 109 38 111 37 Z" />
        <circle className="logo__crumb logo__crumb--3" cx="95" cy="14" r="1.8" />
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
