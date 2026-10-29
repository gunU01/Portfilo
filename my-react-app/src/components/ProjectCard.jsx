import CaseCover from './CaseCover.jsx'

// 프로젝트 목록의 카드 한 장. 카드 전체가 케이스로 가는 링크이고, 케이스의 포인트 색(accent)을 따릅니다.
export default function ProjectCard({ c }) {
  return (
    <a className="pcard follow reveal is-in" href={`#/work/${c.slug}`} data-accent={c.accent}>
      {c.cover ? <CaseCover cover={c.cover} size="card" /> : <div className="cover cover--card cover--blank" aria-hidden="true" />}
      <div className="pcard__text">
        <h2 className="pcard__t">
          {c.title}
          {c.nameNote && <small className="name-note">{c.nameNote}</small>}
        </h2>
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
          {c.status && <span>{c.status}</span>}
        </p>
      </div>
    </a>
  )
}
