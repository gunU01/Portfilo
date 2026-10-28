import { cases } from '../data/cases.js'

// 케이스 맨 아래: 다음 프로젝트로 이어 주는 카드. 마지막 케이스에서는 처음으로 돌아갑니다.
export default function CaseNext({ slug }) {
  const i = cases.findIndex((c) => c.slug === slug)
  const next = cases[(i + 1) % cases.length]
  if (i < 0 || next.slug === slug) return null
  return (
    <nav className="cnext" aria-label="다음 프로젝트">
      <a className="cnext__a" href={`#/work/${next.slug}`}>
        <span className="cnext__k">다음 프로젝트</span>
        <span className="cnext__t">
          {next.title}
          {next.nameNote && <small className="name-note">{next.nameNote}</small>}
        </span>
        <span className="cnext__s">{next.summary}</span>
        <span className="cnext__go" aria-hidden="true">
          →
        </span>
      </a>
    </nav>
  )
}
