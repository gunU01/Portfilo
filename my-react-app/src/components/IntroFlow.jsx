// 소개를 글 대신 '개발자에서 PM으로' 흐름도로 보여 줍니다. 모든 문구는 data/profile.js 의 about.flow 에서 옵니다.
export default function IntroFlow({ flow }) {
  return (
    <div className="iflow">
      <ol className="iflow__steps">
        {flow.steps.map((s, i) => (
          <li key={s.label} className={`iflow__step${i === flow.steps.length - 1 ? ' is-now' : ''}`}>
            <small className="iflow__label">{s.label}</small>
            <b className="iflow__title">{s.title}</b>
            {s.text && <p className="iflow__text">{s.text}</p>}
            {s.chips && (
              <ul className="iflow__chips">
                {s.chips.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <p className="iflow__principle">{flow.principle}</p>
    </div>
  )
}
