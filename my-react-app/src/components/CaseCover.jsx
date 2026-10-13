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

const COVERS = { screens: Screens, bars: Bars, shift: Shift }

export default function CaseCover({ cover, size = 'card' }) {
  const Cover = COVERS[cover?.kind]
  return Cover ? <Cover cover={cover} size={size} /> : null
}
