import { useState } from 'react'
import { cases } from '../data/cases.js'
import { posts } from '../data/blog.js'
import ProjectCard from '../components/ProjectCard.jsx'
import BlogList from '../components/BlogList.jsx'
import { useReveal } from '../lib/useReveal.js'

const GROUPS = [
  ['ALL', '전체'],
  ['TEAM', '팀 프로젝트'],
  ['PLAN', '개인 기획'],
  ['ANALYSIS', '분석'],
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
        <p className="pj__lead">기획한 서비스와 분석 사례를 담았습니다.</p>

        <div className="pj__tabs" role="group" aria-label="분류">
          {tabs.map(([key, label]) => (
            <button key={key} className="ink" type="button" aria-pressed={group === key} onClick={() => setGroup(key)}>
              {label}
              <span className="tnum">{key === 'ALL' ? cases.length : cases.filter((c) => c.group === key).length}</span>
            </button>
          ))}
        </div>

        <div className="pj__grid">
          {shown.map((c) => (
            <ProjectCard key={c.slug} c={c} />
          ))}
        </div>

        <BlogList posts={posts} />
      </div>
    </section>
  )
}
