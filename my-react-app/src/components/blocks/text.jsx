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
