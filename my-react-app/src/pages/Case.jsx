import { useEffect, useMemo } from 'react'
import Blocks from '../components/Blocks.jsx'
import CaseCover from '../components/CaseCover.jsx'
import CaseNext from '../components/CaseNext.jsx'
import Rich from '../components/Rich.jsx'
import { useScrollSpy } from '../lib/useScrollSpy.js'
import { scrollToId } from '../lib/dom.js'
import { useGrow } from '../lib/useGrow.js'
import { useChipFollow } from '../lib/useChipFollow.js'
import { cases } from '../data/cases.js'
import { usePageMeta } from '../lib/usePageMeta.js'

export default function Case({ slug }) {
  const data = cases.find((c) => c.slug === slug) // 본문 데이터는 이 페이지 코드와 함께 받습니다(홈에는 들어 있지 않음)
  usePageMeta(`${data.subtitle}. ${data.summary.replace(/\*\*/g, '').replace(/\s*\n\s*/g, ' ')}`)
  const ids = useMemo(() => data.sections.map((s) => s.id), [data])
  // 읽는 위치에 따라 목차 강조
  const active = useScrollSpy(ids, { rootMargin: '-18% 0px -72% 0px' })
  useGrow()

  useChipFollow(active)

  // 인쇄(PDF 저장) 시 접힌 항목을 모두 펼침
  useEffect(() => {
    const openAll = () => document.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))
    window.addEventListener('beforeprint', openAll)
    return () => window.removeEventListener('beforeprint', openAll)
  }, [])

  return (
    <article>
      <header className="wrap case__head">
        <a className="back" href="#/project">
          ← 프로젝트 목록
        </a>
        <h1 className="case__title">
          {data.title}
          {data.nameNote && <small className="name-note">{data.nameNote}</small>}
        </h1>
        <p className="case__sub">{data.subtitle}</p>
        <p className="case__sum">{data.summary}</p>
        <div className="case__tags">
          {data.tags.map((t) => (
            <span className="chip chip--accent" key={t}>
              {t}
            </span>
          ))}
          {data.status && <span className="chip">{data.status}</span>}
        </div>

        {data.cover && (
          <div className="case__cover">
            <CaseCover cover={data.cover} size="banner" />
          </div>
        )}

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
                <a className="xlink ink" href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                  <span aria-hidden="true">↗</span>
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="wrap case__body">
        <nav className="toc" aria-label="이 페이지의 목차">
          {data.sections.map((s) => (
            <button key={s.id} type="button" aria-current={active === s.id} onClick={() => scrollToId(s.id)}>
              {s.title}
            </button>
          ))}
        </nav>

        <div>
          {data.sections.map((s) => (
            <section className="csec" id={s.id} key={s.id} aria-labelledby={`${s.id}-t`}>
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
                <li key={s}>
                  <Rich text={s} />
                </li>
              ))}
            </ul>
          </footer>
        </div>
      </div>

      <div className="wrap">
        <CaseNext slug={data.slug} />
      </div>
    </article>
  )
}
