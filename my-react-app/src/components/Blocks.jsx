import Rich from './Rich.jsx'
import ValueChain from './ValueChain.jsx'

const WIDE_TYPES = new Set(['valueChain', 'table', 'stats', 'figure', 'gallery'])

// 문장 목록. 각 항목에 **굵게** 표기를 허용합니다.
function RichList({ items, className }) {
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

function statsClass(block) {
  if (block.columns === 2) return 'stats stats--2'
  return block.items.length === 3 ? 'stats stats--3' : 'stats'
}

function Table({ head, rows }) {
  return (
    <div className="tablewrap">
      <table className="table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} data-label={head[c]}>
                  <Rich text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Decisions({ items }) {
  return (
    <div className="decisions">
      {items.map((d, i) => (
        <details className="dec" key={d.title} open={i === 0}>
          <summary>
            <span className="dec__n tnum">D{i + 1}</span>
            <span>{d.title}</span>
          </summary>
          <dl className="dec__body">
            <div>
              <dt>왜</dt>
              <dd>
                <Rich text={d.why} />
              </dd>
            </div>
            <div>
              <dt>선택</dt>
              <dd>
                <Rich text={d.chosen} />
              </dd>
            </div>
            <div>
              <dt>대가</dt>
              <dd>
                <Rich text={d.tradeoff} />
              </dd>
            </div>
          </dl>
        </details>
      ))}
    </div>
  )
}

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <Rich text={block.text} />
        </p>
      )

    case 'list':
      return <RichList className="list" items={block.items} />

    case 'quote':
      return (
        <blockquote className="quote">
          {block.text}
          {block.cite && <cite>{block.cite}</cite>}
        </blockquote>
      )

    case 'callout':
      // 출처의 한계 같은 보조 설명(note)은 박스 없이 작은 각주로 보여 줍니다.
      if (block.tone === 'note') {
        return (
          <p className="footnote">
            ※ <Rich text={block.text} />
          </p>
        )
      }
      return (
        <aside className={`callout callout--${block.tone ?? 'plain'}`}>
          <p className="callout__t">{block.title}</p>
          <p>
            <Rich text={block.text} />
          </p>
        </aside>
      )

    case 'stats':
      return (
        <div className={statsClass(block)}>
          {block.items.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat__v">{s.value}</span>
              <span className="stat__l">{s.label}</span>
              {s.note && <span className="stat__n">{s.note}</span>}
            </div>
          ))}
        </div>
      )

    case 'table':
      return <Table head={block.head} rows={block.rows} />

    case 'beforeAfter':
      return (
        <div className="ba">
          <div className="ba__col">
            <h4>{block.before.title}</h4>
            <RichList items={block.before.items} />
          </div>
          <div className="ba__col ba__col--after">
            <h4>{block.after.title}</h4>
            <RichList items={block.after.items} />
          </div>
        </div>
      )

    case 'timeline':
      return (
        <ol className="tl">
          {block.items.map((t) => (
            <li className="tl__item" key={t.title}>
              <span className="tl__when">{t.when}</span>
              <div>
                <p className="tl__title">{t.title}</p>
                <p className="tl__desc">{t.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      )

    case 'flow':
      return (
        <ol className="flow">
          {block.steps.map((s) => (
            <li key={s.label}>
              <b>{s.label}</b>
              <span>{s.desc}</span>
            </li>
          ))}
        </ol>
      )

    case 'decisions':
      return <Decisions items={block.items} />

    case 'roles':
      return (
        <div className="roles">
          <div className="roles__card">
            <h4>Role</h4>
            <p className="roles__role">{block.role}</p>
          </div>
          <div className="roles__card">
            <h4>Responsibility</h4>
            <RichList className="list" items={block.responsibilities} />
          </div>
          {block.results?.length > 0 && (
            <div className="roles__card">
              <h4>Result</h4>
              <RichList className="list" items={block.results} />
            </div>
          )}
        </div>
      )

    case 'valueChain':
      return <ValueChain stages={block.stages} labels={block.labels} />

    case 'figure':
      return (
        <figure className={`fig${block.dark ? ' fig--dark' : ''}`}>
          <img src={block.src} alt={block.alt} loading="lazy" decoding="async" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )

    case 'gallery':
      return (
        <div className="gallery" style={{ '--cols': block.cols ?? 4 }}>
          {block.items.map((it) => (
            <figure className="gallery__item" key={it.src}>
              <span className="phone phone--flat">
                <img src={it.src} alt={it.alt} loading="lazy" decoding="async" />
              </span>
              <figcaption>
                <b>{it.title}</b>
                {it.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      )

    default:
      return null
  }
}

export default function Blocks({ blocks }) {
  const wide = blocks.some((b) => WIDE_TYPES.has(b.type))
  return (
    <div className={wide ? 'blocks blocks--wide' : 'blocks'}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
