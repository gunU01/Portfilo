import { useRef, useState } from 'react'

const DEFAULT_LABELS = {
  tablist: '밸류체인 레일',
  situation: '무슨 일이 일어나나',
  players: '누가 맡고 있나',
  choice: '선택',
  screen: '화면에서는',
  behind: '뒤에서는',
}

// 밸류체인 탐색기. 레일(탭)을 고르면 그 레일의 근거·선택·화면/뒤 구조·해석을 보여 줍니다.
// 문구는 labels로 바꿀 수 있습니다(예: 분석 대상이 다른 서비스일 때).
export default function ValueChain({ stages, labels }) {
  const L = { ...DEFAULT_LABELS, ...labels }
  const [index, setIndex] = useState(0)
  const nodes = useRef([])
  const stage = stages[index]

  const select = (next) => {
    const i = (next + stages.length) % stages.length
    setIndex(i)
    nodes.current[i]?.focus()
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      select(index + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      select(index - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      select(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      select(stages.length - 1)
    }
  }

  return (
    <div className="vc">
      <p className="vc__legend">
        <span>
          <i /> 근거 — 문서로 확인된 사실
        </span>
        <span>
          <i className="is-analysis" /> 해석 — 제 해석
        </span>
      </p>

      <div className="rail" role="tablist" aria-label={L.tablist} onKeyDown={onKeyDown}>
        {stages.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              nodes.current[i] = el
            }}
            type="button"
            role="tab"
            id={`vc-tab-${s.id}`}
            aria-selected={i === index}
            aria-controls={`vc-panel-${s.id}`}
            tabIndex={i === index ? 0 : -1}
            className="rail__node"
            onClick={() => setIndex(i)}
          >
            <span className="rail__dot tnum">{String(i + 1).padStart(2, '0')}</span>
            <span className="rail__name">{s.name}</span>
            <span className="rail__en">{s.en}</span>
          </button>
        ))}
      </div>

      <section
        className="vc__panel"
        role="tabpanel"
        id={`vc-panel-${stage.id}`}
        aria-labelledby={`vc-tab-${stage.id}`}
      >
        <h3 className="vc__q">
          <small>
            {String(index + 1).padStart(2, '0')} · {stage.name} · {stage.en}
          </small>
          {stage.question}
        </h3>

        <div className="vc__cols">
          <div className="vc__col">
            <h4>{L.situation}</h4>
            <ul>
              {stage.situation.map((t) => (
                <li key={t}>{t}</li>
              ))}
              {stage.limits.map((t) => (
                <li className="is-limit" key={t}>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="vc__col">
            <h4>{L.players}</h4>
            <ul>
              {stage.players.map((p) => (
                <li key={p.name}>
                  <b>{p.name}</b>
                  <span>{p.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="vc__col">
            <h4>{L.choice}</h4>
            <p>{stage.choice}</p>
          </div>
        </div>

        <div className="vc__lens">
          <div>
            <h4>{L.screen}</h4>
            <p>{stage.screen}</p>
          </div>
          <div>
            <h4>{L.behind}</h4>
            <p>{stage.behind}</p>
          </div>
        </div>

        <p className="vc__analysis">
          <em>해석</em>
          <span>{stage.analysis}</span>
        </p>
      </section>
    </div>
  )
}
