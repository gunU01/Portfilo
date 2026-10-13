import { useRef, useState } from 'react'
import { arrowTarget } from '../lib/arrowNav.js'

// 기술을 글 목록 대신 도식으로 보여 줍니다.
// - view: 'process' 인 묶음은 일하는 순서를 따라 이어 붙인 흐름도(마디를 고르면 설명이 아래에 열림)
// - view: 'stack' 인 묶음은 도구 칩(칩을 고르면 설명이 열림)
// 모든 문구는 data/skills.js 에서 오고, 여기서는 모양만 정합니다.

// 마디를 고르는 탭 목록의 공통 동작: 선택 상태와 방향키 이동
function useTabs(length) {
  const [index, setIndex] = useState(0)
  const refs = useRef([])
  const onKeyDown = (e) => {
    const next = arrowTarget(e.key, index, length)
    if (next === undefined) return
    e.preventDefault()
    setIndex(next)
    refs.current[next]?.focus()
  }
  const bind = (i, id) => ({
    ref: (el) => {
      refs.current[i] = el
    },
    role: 'tab',
    id: `${id}-tab-${i}`,
    'aria-selected': i === index,
    'aria-controls': `${id}-panel`,
    tabIndex: i === index ? 0 : -1,
    onClick: () => setIndex(i),
  })
  return { index, onKeyDown, bind }
}

function Process({ groups }) {
  // 묶음 순서대로 한 줄로 이어 붙입니다. phase 는 묶음 번호(색과 모양을 정함).
  const steps = groups.flatMap((g, phase) => g.items.map((item) => ({ ...item, phase, group: g.title })))
  const { index, onKeyDown, bind } = useTabs(steps.length)
  const current = steps[index]

  return (
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
          <li key={s.name} className={`skflow__step skflow__step--${s.phase}`}>
            <button type="button" className="skflow__node" {...bind(i, 'skflow')}>
              <span className="skflow__dot tnum">{i + 1}</span>
              <span className="skflow__name">{s.name}</span>
            </button>
            {/* 좁은 화면에서는 세로로 이어 붙이고 설명을 항상 펼쳐 둡니다 */}
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
    </div>
  )
}

function Stack({ group, tone }) {
  const id = `skstack-${tone}`
  const { index, onKeyDown, bind } = useTabs(group.items.length)
  const current = group.items[index]

  return (
    <section className={`skstack skstack--${tone}`} aria-label={group.title}>
      <h3>
        <span className="skstack__mark" aria-hidden="true" />
        {group.title}
      </h3>
      <div className="skstack__chips" role="tablist" aria-label={group.title} onKeyDown={onKeyDown}>
        {group.items.map((s, i) => (
          <button key={s.name} type="button" className="skstack__chip ink" {...bind(i, id)}>
            {s.name}
          </button>
        ))}
      </div>
      <p className="skstack__desc" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${index}`}>
        {current.used}
      </p>
    </section>
  )
}

const TONES = ['tool', 'fe']

export default function SkillMap({ groups }) {
  const process = groups.filter((g) => g.view === 'process')
  const stacks = groups.filter((g) => g.view === 'stack')
  return (
    <div className="skmap">
      {process.length > 0 && <Process groups={process} />}
      <div className="skmap__stacks">
        {stacks.map((g, i) => (
          <Stack key={g.title} group={g} tone={TONES[i % TONES.length]} />
        ))}
      </div>
    </div>
  )
}
