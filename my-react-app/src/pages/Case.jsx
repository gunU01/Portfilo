import { useEffect, useState } from 'react'
import Blocks from '../components/Blocks.jsx'

export default function Case({ data, index, total, next }) {
  const [active, setActive] = useState(data.sections[0].id)

  // 읽는 위치에 따라 목차 강조
  useEffect(() => {
    const els = data.sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-18% 0px -72% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [data])

  // 인쇄(PDF 저장) 시 접힌 항목을 모두 펼침
  useEffect(() => {
    const openAll = () => document.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))
    window.addEventListener('beforeprint', openAll)
    return () => window.removeEventListener('beforeprint', openAll)
  }, [])

  const jump = (id) => document.getElementById(id)?.scrollIntoView()

  return (
    <article>
      <header className="wrap case__head">
        <a className="back" href="#/?s=work">
          ← 프로젝트 목록
        </a>
        <p className="eyebrow">
          Case {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
        <h1 className="case__title">{data.title}</h1>
        <p className="case__sub">{data.subtitle}</p>
        <p className="case__sum">{data.summary}</p>
        <div className="case__tags">
          {data.tags.map((t) => (
            <span className="chip chip--accent" key={t}>
              {t}
            </span>
          ))}
          <span className="chip">{data.status}</span>
        </div>

        <dl className="meta">
          {data.meta.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          {data.links?.map((l) => (
            <div key={l.href}>
              <dt>링크</dt>
              <dd>
                <a href={l.href} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="wrap case__body">
        <nav className="toc" aria-label="이 페이지의 목차">
          {data.sections.map((s) => (
            <button key={s.id} type="button" aria-current={active === s.id} onClick={() => jump(s.id)}>
              {s.title}
            </button>
          ))}
        </nav>

        <div>
          {data.sections.map((s) => (
            <section className="csec" id={s.id} key={s.id} aria-labelledby={`${s.id}-t`}>
              <p className="csec__kicker">{s.kicker}</p>
              <h2 className="csec__title" id={`${s.id}-t`}>
                {s.title}
              </h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <footer className="sources">
            <h2>근거 자료</h2>
            <ul>
              {data.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </footer>

          <a className="next" href={`#/work/${next.slug}`}>
            <small>다음 케이스</small>
            <b>{next.title}</b>
            <span>{next.subtitle}</span>
          </a>
        </div>
      </div>
    </article>
  )
}
