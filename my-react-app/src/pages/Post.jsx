import { useMemo } from 'react'
import Blocks from '../components/Blocks.jsx'
import { useScrollSpy } from '../lib/useScrollSpy.js'
import { scrollToId } from '../lib/dom.js'
import { useChipFollow } from '../lib/useChipFollow.js'
import { usePageMeta } from '../lib/usePageMeta.js'
import { posts } from '../data/blog.js'

// 블로그 글 한 편. 프로젝트 케이스와 같은 본문 블록을 쓰고, 근거 자료나 다음 프로젝트 같은 케이스 전용 부분은 없습니다.
export default function Post({ slug }) {
  const data = posts.find((p) => p.slug === slug)
  usePageMeta(data.summary)
  const ids = useMemo(() => data.sections.map((s) => s.id), [data])
  const active = useScrollSpy(ids, { rootMargin: '-18% 0px -72% 0px' })
  useChipFollow(active)

  return (
    <article>
      <header className="wrap case__head">
        <a className="back" href="#/project?s=blog">
          ← 블로그 목록
        </a>
        <h1 className="case__title post__title">{data.title}</h1>
        <p className="case__sum">{data.summary}</p>
        <div className="case__tags">
          {data.tags.map((t) => (
            <span className="chip chip--accent" key={t}>
              {t}
            </span>
          ))}
          <span className="chip tnum">{data.date}</span>
        </div>
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
        </div>
      </div>
    </article>
  )
}
