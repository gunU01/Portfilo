import DocBody from '../components/DocBody.jsx'
import { usePageMeta } from '../lib/usePageMeta.js'
import { posts } from '../data/blog.js'

// 블로그 글 한 편. 프로젝트 케이스와 같은 본문 블록을 쓰고, 근거 자료나 다음 프로젝트 같은 케이스 전용 부분은 없습니다.
export default function Post({ slug }) {
  const data = posts.find((p) => p.slug === slug)
  usePageMeta(data.summary)

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

      <DocBody sections={data.sections} />
    </article>
  )
}
