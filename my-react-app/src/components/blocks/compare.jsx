import Rich from '../Rich.jsx'
import { RichList } from './text.jsx'


export function Decisions({ items }) {
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

export function BeforeAfter({ before, after }) {
  return (
    <div className="ba">
      <div className="ba__col">
        <h4>{before.title}</h4>
        <RichList items={before.items} />
      </div>
      <div className="ba__col ba__col--after">
        <h4>{after.title}</h4>
        <RichList items={after.items} />
      </div>
    </div>
  )
}

export function Roles({ role, responsibilities, results }) {
  return (
    <div className="roles">
      <div className="roles__card">
        <h4>Role</h4>
        <p className="roles__role">{role}</p>
      </div>
      <div className="roles__card">
        <h4>Responsibility</h4>
        <RichList className="list" items={responsibilities} />
      </div>
      {results?.length > 0 && (
        <div className="roles__card">
          <h4>Result</h4>
          <RichList className="list" items={results} />
        </div>
      )}
    </div>
  )
}
