import { profile } from '../data/profile.js'
import { cases } from '../data/cases.js'
import { awards } from '../data/awards.js'
import { useReveal } from '../lib/useReveal.js'

const githubId = (url) => url?.replace(/\/+$/, '').split('/').pop()

function Hero() {
  const { hero } = profile
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <p className="eyebrow">{hero.eyebrow}</p>

        <p className="kw" aria-hidden="true">
          {hero.keywords.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </p>

        <div className="hero__grid">
          <div>
            <h1 id="hero-title">{hero.title.join(' ')}</h1>
            <p className="hero__lead">{hero.lead}</p>
            <div className="hero__cta">
              <a className="btn btn--solid" href="#/project">
                프로젝트 보기
              </a>
              <a className="btn btn--3d" href="#/world">
                3D로 감상하기
              </a>
            </div>
            <p className="hero__note">3D는 같은 내용을 캐릭터로 둘러보는 부가 콘텐츠입니다. 이 화면이 기본입니다.</p>
          </div>

          <aside className="spec" aria-label="한눈에 보기">
            <p className="spec__t">At a glance</p>
            <dl>
              <div>
                <dt>이름</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>역할</dt>
                <dd>{profile.roleLine}</dd>
              </div>
              <div>
                <dt>소속</dt>
                <dd>{profile.school}</dd>
              </div>
              {hero.facts.map((f) => (
                <div key={f}>
                  <dt>기록</dt>
                  <dd>{f}</dd>
                </div>
              ))}
              {profile.contact.github && (
                <div>
                  <dt>GitHub</dt>
                  <dd>
                    <a href={profile.contact.github} target="_blank" rel="noreferrer">
                      @{githubId(profile.contact.github)}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Overview() {
  return (
    <section className="ov" aria-labelledby="ov-title">
      <div className="wrap">
        <h2 className="ov__t" id="ov-title">
          OVERVIEW
        </h2>
        <p className="ov__p">{profile.overview}</p>
        <div className="ov__cards">
          <a className="ov__card reveal" href="#/project">
            <span className="ov__n tnum">01</span>
            <h3>Project</h3>
            <p>
              {cases.map((c) => c.title).join(' · ')} — 목표·방식·결과로 읽는 케이스 {cases.length}개
            </p>
            <span className="ov__go">프로젝트 보기 →</span>
          </a>
          <a className="ov__card reveal" href="#/about">
            <span className="ov__n tnum">02</span>
            <h3>About</h3>
            <p>
              경험과 생각, 기술
              {awards.length ? `, 수상 ${awards.length}건` : ''}
            </p>
            <span className="ov__go">소개 보기 →</span>
          </a>
        </div>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="wrap caps-wrap" aria-label="핵심 역량">
      <div className="caps">
        {profile.capabilities.map((c, i) => (
          <a className="cap reveal" key={c.title} href={`#/work/${c.to.slug}?s=${c.to.section}`}>
            <span className="cap__n tnum">0{i + 1}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <span className="cap__go">근거 보기 →</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  useReveal()
  return (
    <>
      <Hero />
      <Capabilities />
      <Overview />
    </>
  )
}
