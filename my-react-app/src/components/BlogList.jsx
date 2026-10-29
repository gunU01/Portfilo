// 프로젝트 목록 아래의 블로그: 글마다 날짜, 제목, 요약, 태그를 한 줄로 보여 주고 글 페이지(#/blog/<slug>)로 잇습니다.
export default function BlogList({ posts }) {
  return (
    <section className="blog" id="blog" aria-labelledby="blog-t">
      <h2 className="blog__t" id="blog-t">
        MY BLOG
      </h2>
      <p className="blog__lead">프로젝트로 묶기 전의 생각과 분석을 글로 정리합니다.</p>
      <ul className="blog__list">
        {posts.map((p) => (
          <li key={p.slug}>
            <a className="blog__item ink" href={`#/blog/${p.slug}`}>
              <span className="blog__meta tnum">{p.date}</span>
              <span className="blog__body">
                <strong className="blog__name">{p.title}</strong>
                <span className="blog__sum">{p.summary}</span>
                <span className="blog__tags">
                  {p.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
              <span className="blog__go" aria-hidden="true">
                →
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
