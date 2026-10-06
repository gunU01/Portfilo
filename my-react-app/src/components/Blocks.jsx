import Rich from './Rich.jsx'
import ValueChain from './ValueChain.jsx'

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
      return (
        <ul className="list">
          {block.items.map((item) => (
            <li key={item}>
              <Rich text={item} />
            </li>
          ))}
        </ul>
      )

    case 'quote':
      return (
        <blockquote className="quote">
          {block.text}
          {block.cite && <cite>{block.cite}</cite>}
        </blockquote>
      )

    case 'callout':
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
        <div className="stats">
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
            <ul>
              {block.before.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="ba__col ba__col--after">
            <h4>{block.after.title}</h4>
            <ul>
              {block.after.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
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
            <ul className="list">
              {block.responsibilities.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className="roles__card">
            <h4>Result</h4>
            <ul className="list">
              {block.results.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )

    case 'valueChain':
      return <ValueChain stages={block.stages} />

    default:
      return null
  }
}

export default function Blocks({ blocks }) {
  const wide = blocks.some((b) => b.type === 'valueChain' || b.type === 'table' || b.type === 'stats')
  return (
    <div className={wide ? 'blocks blocks--wide' : 'blocks'}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
