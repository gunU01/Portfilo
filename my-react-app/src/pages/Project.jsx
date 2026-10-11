import { useState } from 'react'
import { cases } from '../data/cases.js'
import CaseCover from '../components/CaseCover.jsx'
import { useReveal } from '../lib/useReveal.js'

const GROUPS = [
  ['ALL', '전체'],
  ['TEAM', '팀 프로젝트'],
  ['ANALYSIS', '역기획'],
]

export default function Project() {
  const [group, setGroup] = useState('ALL')
  useReveal()

  // 필터에 없는 분류가 생겨도 탭이 비지 않게, 실제 있는 분류만 보여 줍니다.
  const present = new Set(cases.map((c) => c.group))
  const tabs = GROUPS.filter(([key]) => key === 'ALL' || present.has(key))
  const shown = cases.filter((c) => group === 'ALL' || c.group === group)

  return (
    <section className="pj">
      <div className="wrap">
        <h1 className="pj__t">MY PROJECT</h1>
        <p className="pj__lead">
          각 프로젝트는 목표, 방식, 결과 순서로 읽을 수 있고, 제가 맡은 역할도 함께 정리했습니다. 카드를 누르면 자세한 내용으로 이동합니다.
        </p>

        <div className="pj__tabs" role="group" aria-label="분류">
          {tabs.map(([key, label]) => (
            <button key={key} type="button" aria-pressed={group === key} onClick={() => setGroup(key)}>
              {label}
              <span className="tnum">{key === 'ALL' ? cases.length : cases.filter((c) => c.group === key).length}</span>
            </button>
          ))}
        </div>

        <div className="pj__grid">
          {shown.map((c) => (
            <a className="pcard reveal is-in" key={c.slug} href={`#/work/${c.slug}`}>
              <CaseCover cover={c.cover} size="card" />
              <div className="pcard__text">
                <h2 className="pcard__t">{c.title}</h2>
                <p className="pcard__sub">{c.subtitle}</p>
                <p className="pcard__sum">{c.summary}</p>
                <div className="pcard__tags">
                  {c.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="pcard__meta">
                  <span className="tnum">{c.period}</span>
                  <span>{c.status}</span>
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
