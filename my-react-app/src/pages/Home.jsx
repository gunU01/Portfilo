import { Fragment } from 'react'
import { profile } from '../data/profile.js'
import Spec from '../components/Spec.jsx'
import { useReveal } from '../lib/useReveal.js'

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
            <h1 id="hero-title">
              {hero.title.map((line, i) => (
                <Fragment key={line}>
                  {i > 0 && (
                    <>
                      {' '}
                      <br className="br-mobile" />
                    </>
                  )}
                  {line}
                </Fragment>
              ))}
            </h1>
            <p className="hero__lead">{hero.lead}</p>
            <div className="hero__cta">
              <a className="btn btn--solid ink" href="#/project">
                프로젝트 보기
              </a>
              <a className="btn btn--desk ink" href="#/desk">
                책상에서 둘러보기
              </a>
            </div>
          </div>

          <Spec />
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
        <div className="ov__cards">
          <a className="ov__card ink reveal" href="#/project">
            <span className="ov__n tnum">01</span>
            <h3>Project</h3>
            <p>기획한 서비스와 분석 사례를 담았습니다.</p>
            <span className="ov__go">프로젝트 보기 →</span>
          </a>
          <a className="ov__card ink reveal" href="#/about">
            <span className="ov__n tnum">02</span>
            <h3>About</h3>
            <p>소개와 기술, 활동, 대회와 수상 이력을 담았습니다.</p>
            <span className="ov__go">자기소개 보기 →</span>
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
