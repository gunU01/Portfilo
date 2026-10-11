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
          </div>

          <aside className="spec" aria-label="한눈에 보기">
            <p className="spec__t">한눈에 보기</p>
            <dl>
              <div>
                <dt>이름</dt>
                <dd>{profile.name}</dd>
              </div>
              <div>
                <dt>직무</dt>
                <dd>{profile.roleLine}</dd>
              </div>
              <div>
                <dt>소속</dt>
                <dd>{profile.school}</dd>
              </div>
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
            <p>케이스 {cases.length}개를 목표·방식·결과 순서로 정리했습니다.</p>
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

export default function Home() {
  useReveal()
  return (
    <>
      <Hero />
      <Overview />
    </>
  )
}
