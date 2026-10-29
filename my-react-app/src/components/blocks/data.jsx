import { useState } from 'react'
import Rich from '../Rich.jsx'

function statsClass({ columns, compact, items }) {
  if (columns === 2) return compact ? 'stats stats--2 stats--compact' : 'stats stats--2'
  return items.length === 3 ? 'stats stats--3' : 'stats'
}

export function Stats({ columns, compact, items }) {
  return (
    <div className={statsClass({ columns, compact, items })}>
      {items.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat__v">{s.value}</span>
          <span className="stat__l">{s.label}</span>
          {s.note && <span className="stat__n">{s.note}</span>}
        </div>
      ))}
    </div>
  )
}

// 모바일에서는 행이 이 개수를 넘으면 앞부분만 보여 주고 나머지는 버튼으로 펼칩니다(데스크톱에서는 전부 보임).
const TABLE_FOLD = 4

// idColumn: 첫 열이 H-01 같은 짧은 ID 일 때 하이픈에서 줄이 꺾이지 않게 합니다.
export function Table({ head, rows, idColumn }) {
  const [open, setOpen] = useState(false)
  const extra = rows.length - TABLE_FOLD
  const fold = extra >= 2
  // 모바일에서 '이름 + 내용'의 이름 칸 너비: 짧은 이름은 한 줄에 맞추고, 긴 이름(6자 초과)은 내용 위에 따로 둡니다.
  const labels = head.slice(1)
  const longest = Math.max(0, ...labels.map((l) => l.length))
  const cls = ['table', idColumn && 'table--id', head.length === 2 && 'table--2', longest > 6 && 'table--stack'].filter(Boolean).join(' ')
  const labelWidth = `${Math.max(3.6, longest * 0.95)}em`
  return (
    <div className={fold && !open ? 'tablewrap is-folded' : 'tablewrap'}>
      <table className={cls} style={{ '--lab': labelWidth }}>
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
            <tr key={r} className={fold && r >= TABLE_FOLD ? 'is-extra' : undefined}>
              {row.map((cell, c) => (
                <td key={c} data-label={head[c]}>
                  <Rich text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {fold && (
        <button type="button" className="tmore" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? '접기' : `나머지 ${extra}개 보기`}
        </button>
      )}
    </div>
  )
}

export function Chart({ groups, unit, source }) {
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

export function Goals({ groups }) {
  return (
    <div className="goals">
      {groups.map((g) => (
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
}

export function Readout({ says, silent }) {
  return (
    <div className="readout">
      <section className="readout__col">
        <h4 className="readout__h">{says.title}</h4>
        <ul className="readout__list">
          {says.items.map((it) => (
            <li key={it.title}>
              <span className="readout__v tnum">{it.value}</span>
              <b>{it.title}</b>
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="readout__col readout__col--silent">
        <h4 className="readout__h">{silent.title}</h4>
        <ul className="readout__list">
          {silent.items.map((it) => (
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
}

export function Timeline({ items }) {
  return (
    <ol className="tl">
      {items.map((t) => (
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
}

export function Flow({ steps }) {
  return (
    <ol className="flow">
      {steps.map((s) => (
        <li key={s.label}>
          <b>{s.label}</b>
          <span>{s.desc}</span>
        </li>
      ))}
    </ol>
  )
}
