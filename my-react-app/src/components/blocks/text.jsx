import Rich from '../Rich.jsx'

// 문장 목록. 각 항목에 **굵게** 표기를 허용합니다.
export function RichList({ items, className }) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item}>
          <Rich text={item} />
        </li>
      ))}
    </ul>
  )
}

export function List({ items }) {
  return <RichList className="list" items={items} />
}

// 체크리스트: 해야 할 일을 체크 표시가 붙은 항목으로 보여 줍니다(눌러서 체크하는 것이 아니라 '이 목록을 채우는 과제'를 보여 주는 용도).
// groups: [{ label, note, items }]  label 은 묶음 이름, note 는 조건(예: '각각 1회 이상'). 항목이 하나뿐인 묶음은 한 줄로, 여러 개면 2열로 놓습니다.
// footer: { label, text } 는 목록 아래에 붙이는 한 줄(예: 보상).
export function Checklist({ title, groups, footer }) {
  return (
    <section className="cklist" aria-label={title}>
      <h4 className="cklist__t">{title}</h4>
      {groups.map((g) => (
        <div className="cklist__g" key={g.label}>
          <p className="cklist__h">
            <span className="cklist__l">{g.label}</span>
            {g.note && <span className="cklist__note">{g.note}</span>}
          </p>
          <ul className={g.items.length > 1 ? 'cklist__items cklist__items--grid' : 'cklist__items'}>
            {g.items.map((item) => (
              <li key={item}>
                <span className="cklist__ic" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {footer && (
        <p className="cklist__f">
          <span className="cklist__fl">{footer.label}</span>
          {footer.text}
        </p>
      )}
    </section>
  )
}

export function Paragraph({ text }) {
  return (
    <p>
      <Rich text={text} />
    </p>
  )
}

export function Subheading({ text }) {
  return <h3 className="csec__sub">{text}</h3>
}

export function Quote({ text, cite }) {
  return (
    <blockquote className="quote">
      {text}
      {cite && <cite>{cite}</cite>}
    </blockquote>
  )
}

export function Callout({ tone, title, text, points }) {
  // 출처의 한계 같은 보조 설명(note)은 박스 없이 작은 각주로 보여 줍니다.
  if (tone === 'note') {
    return (
      <p className="footnote">
        ※ <Rich text={text} />
      </p>
    )
  }
  return (
    <aside className={`callout callout--${tone ?? 'plain'}`}>
      <p className="callout__t">{title}</p>
      <p>
        <Rich text={text} />
      </p>
      {points && (
        <ul className="callout__pts">
          {points.map((pt) => (
            <li key={pt}>
              <Rich text={pt} />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
