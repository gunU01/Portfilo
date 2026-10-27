import Rich from './Rich.jsx'

const WIDE_TYPES = new Set(['table', 'stats', 'chart', 'toggle', 'readout', 'goals', 'figure', 'gallery'])

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
  if (block.columns === 2) return block.compact ? 'stats stats--2 stats--compact' : 'stats stats--2'
  return block.items.length === 3 ? 'stats stats--3' : 'stats'
}

// idColumn: 첫 열이 H-01 같은 짧은 ID 일 때 하이픈에서 줄이 꺾이지 않게 합니다.
function Table({ head, rows, idColumn }) {
  return (
    <div className="tablewrap">
      <table className={idColumn ? 'table table--id' : 'table'}>
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

// 가로 막대 도식. groups 마다 제목과 막대 목록이 있고, hl 이 true 인 막대만 진하게 보여 줍니다.
function Chart({ groups, unit, source }) {
  return (
    <figure className="chart">
      <div className="chart__groups">
        {groups.map((g) => (
          <div className="chart__group" key={g.title}>
            <p className="chart__t">{g.title}</p>
            <div className="bars">
              {g.items.map((b, i) => (
                <div className="bars__row" key={b.label} style={{ '--i': i }}>
                  <span className="bars__l">{b.label}</span>
                  <span className="bars__track">
                    <span className={b.hl ? 'bars__bar is-last' : 'bars__bar'} style={{ width: `${(b.value / (g.max ?? 100)) * 100}%` }} />
                  </span>
                  <span className="bars__v tnum">{b.display}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {(unit || source) && (
        <figcaption className="chart__src">
          {unit && <span>{unit}</span>}
          {source && <span>{source}</span>}
        </figcaption>
      )}
    </figure>
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

    case 'goals':
      return (
        <div className="goals">
          {block.groups.map((g) => (
            <section className="goals__col" key={g.title}>
              <h4 className="goals__h">{g.title}</h4>
              <ul className="goals__list">
                {g.items.map((it) => (
                  <li key={it.id}>
                    <span className="goals__id tnum">{it.id}</span>
                    <b>{it.text}</b>
                    <span className="goals__goal">
                      <span className="goals__big tnum">{it.goal}</span>
                      {it.unit && <small>{it.unit}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )

    case 'readout':
      return (
        <div className="readout">
          <section className="readout__col">
            <h4 className="readout__h">{block.says.title}</h4>
            <ul className="readout__list">
              {block.says.items.map((it) => (
                <li key={it.title}>
                  <span className="readout__v tnum">{it.value}</span>
                  <b>{it.title}</b>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="readout__col readout__col--silent">
            <h4 className="readout__h">{block.silent.title}</h4>
            <ul className="readout__list">
              {block.silent.items.map((it) => (
                <li key={it.title}>
                  <span className="readout__v readout__v--q" aria-hidden="true">
                    ?
                  </span>
                  <b>{it.title}</b>
                  <span>{it.text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )

    case 'toggle':
      return (
        <details className="tg">
          <summary>{block.title}</summary>
          <div className="tg__body">
            {block.blocks.map((b, i) => (
              <Block key={i} block={b} />
            ))}
          </div>
        </details>
      )

    case 'chart':
      return <Chart groups={block.groups} unit={block.unit} source={block.source} />

    case 'table':
      return <Table head={block.head} rows={block.rows} idColumn={block.idColumn} />

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
