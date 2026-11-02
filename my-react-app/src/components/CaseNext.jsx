import { cases } from '../data/cases.js'
import Arrow from './Arrow.jsx'

// 케이스 맨 아래: 이전과 다음 프로젝트로 이어 주는 두 장의 카드. 목록 순서를 따르고, 처음의 이전은 마지막, 마지막의 다음은 처음으로 돌아갑니다.
// 이름은 CaseNext 지만 이전 카드도 여기서 그립니다. 각 카드는 자기가 가리키는 프로젝트의 포인트 색을 씁니다.
function NavCard({ project, dir, order }) {
  const prev = dir === 'prev'
  return (
    <a className={`cnext__a cnext__a--${dir}`} href={`#/work/${project.slug}`} data-accent={project.accent ?? 'blue'} aria-label={`${prev ? '이전' : '다음'} 프로젝트: ${project.title}`}>
      {prev && (
        <span className="cnext__go">
          <Arrow dir="left" />
        </span>
      )}
      <span className="cnext__body">
        <span className="cnext__k">
          {prev ? '이전 프로젝트' : '다음 프로젝트'}
          <span className="cnext__n tnum">
            {order} / {String(cases.length).padStart(2, '0')}
          </span>
        </span>
        <span className="cnext__t">
          {project.title}
          {project.nameNote && <small className="name-note">{project.nameNote}</small>}
        </span>
        <span className="cnext__s">{project.summary}</span>
      </span>
      {!prev && (
        <span className="cnext__go">
          <Arrow dir="right" />
        </span>
      )}
    </a>
  )
}

export default function CaseNext({ slug }) {
  const i = cases.findIndex((c) => c.slug === slug)
  if (i < 0 || cases.length < 2) return null
  const n = cases.length
  const prevIndex = (i - 1 + n) % n
  const nextIndex = (i + 1) % n
  const two = (k) => String(k + 1).padStart(2, '0')
  return (
    <nav className="cnext" aria-label="이전, 다음 프로젝트">
      <NavCard project={cases[prevIndex]} dir="prev" order={two(prevIndex)} />
      <NavCard project={cases[nextIndex]} dir="next" order={two(nextIndex)} />
    </nav>
  )
}
