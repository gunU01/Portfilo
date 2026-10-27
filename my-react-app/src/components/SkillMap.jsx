import { useEffect, useRef, useState } from 'react'
import { arrowTarget } from '../lib/arrowNav.js'
import { observeOnce } from '../lib/observeOnce.js'

// 기술을 글 목록 대신 '일하는 순서 지도'로 보여 줍니다.
// - 단계(마디)를 고르면 그 단계의 설명이 열리고, 단계 아래에는 그 단계에서 쓴 도구가 붙습니다.
// - 아래의 도구를 고르면 그 도구를 쓴 단계만 켜지고 나머지는 흐려집니다.
// 모든 문구는 data/skills.js 에서 오고, 여기서는 모양만 정합니다.

export default function SkillMap({ groups, tools }) {
  const mapRef = useRef(null)
  const nodeRefs = useRef([])
  const [index, setIndex] = useState(0)
  const [tool, setTool] = useState(null)

  // 화면에 들어오면 단계가 차례로 켜집니다(모션 줄이기 설정에서는 처음부터 보임)
  useEffect(() => observeOnce([mapRef.current], 'is-in', { threshold: 0.15 }), [])

  // 묶음 순서대로 한 줄로 이어 붙입니다. phase 는 묶음 번호(색과 모양을 정함).
  const steps = groups.flatMap((g, phase) => g.items.map((item) => ({ ...item, phase, group: g.title })))
  const current = steps[index]
  const uses = (s) => tool && (s.tools ?? []).includes(tool)
  const hits = tool ? steps.filter(uses).length : 0
  const activeTool = tools.find((t) => t.name === tool)

  const onKeyDown = (e) => {
    const next = arrowTarget(e.key, index, steps.length)
    if (next === undefined) return
    e.preventDefault()
    setIndex(next)
    nodeRefs.current[next]?.focus()
  }

  // 도구를 고르면 그 도구를 쓴 첫 단계로 설명도 옮깁니다. 같은 도구를 다시 누르면 해제합니다.
  const pickTool = (name) => {
    const next = tool === name ? null : name
    setTool(next)
    const first = next ? steps.findIndex((s) => (s.tools ?? []).includes(next)) : -1
    if (first >= 0) setIndex(first)
  }

  return (
    <div className="skmap" ref={mapRef}>
      <div className="skflow" style={{ '--n': steps.length }}>
        <div className="skflow__phases" aria-hidden="true">
          {groups.map((g, phase) => (
            <span key={g.title} className={`skflow__phase skflow__phase--${phase}`} style={{ gridColumn: `span ${g.items.length}` }}>
              {g.title}
            </span>
          ))}
        </div>

        <ol className="skflow__steps" role="tablist" aria-label="일하는 순서" onKeyDown={onKeyDown}>
          {steps.map((s, i) => (
            <li
              key={s.name}
              className={`skflow__step skflow__step--${s.phase}${i === index ? ' is-on' : ''}${tool ? (uses(s) ? ' is-hit' : ' is-dim') : ''}`}
              style={{ '--i': i }}
            >
              <button
                type="button"
                className="skflow__node"
                ref={(el) => {
                  nodeRefs.current[i] = el
                }}
                role="tab"
                id={`skflow-tab-${i}`}
                aria-selected={i === index}
                aria-controls="skflow-panel"
                tabIndex={i === index ? 0 : -1}
                onClick={() => setIndex(i)}
              >
                <span className="skflow__dot tnum">{i + 1}</span>
                <span className="skflow__name">{s.name}</span>
              </button>
              {s.tools && (
                <span className="skflow__tools" aria-label="쓴 도구">
                  {s.tools.map((t) => (
                    <span key={t} className={t === tool ? 'skflow__tag is-active' : 'skflow__tag'}>
                      {t}
                    </span>
                  ))}
                </span>
              )}
              {/* 좁은 화면에서는 세로로 이어 붙이고, 고른 단계의 설명만 그 아래에 펼칩니다 */}
              <p className="skflow__inline">{s.used}</p>
            </li>
          ))}
        </ol>

        <div key={index} className={`skflow__panel skflow__panel--${current.phase}`} role="tabpanel" id="skflow-panel" aria-labelledby={`skflow-tab-${index}`}>
          <small>
            {current.group} · {index + 1}단계
          </small>
          <b>{current.name}</b>
          <p>{current.used}</p>
        </div>

        <div className="sktools">
          <p className="sktools__t">도구를 누르면 쓴 단계가 켜집니다</p>
          <div className="sktools__chips" role="group" aria-label="도구">
            {tools.map((t) => (
              <button key={t.name} type="button" className="sktools__chip ink" aria-pressed={t.name === tool} onClick={() => pickTool(t.name)}>
                {t.name}
              </button>
            ))}
          </div>
          <p className="sktools__desc" aria-live="polite">
            {activeTool ? (
              <>
                <b>{activeTool.name}</b> {activeTool.used} <span className="sktools__n">({hits}개 단계에서 사용)</span>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  )
}
