import { Fragment } from 'react'
import { profile } from '../data/profile.js'
import Spec from '../components/Spec.jsx'
import { useReveal } from '../lib/useReveal.js'
import { usePointerVars } from '../lib/usePointerVars.js'
import { usePinScroll } from '../lib/usePinScroll.js'

function Hero() {
  const { hero } = profile
  const pinRef = usePinScroll(hero.keywords.length) // 스크롤하는 동안 화면이 고정되고, 키워드와 문장이 차례로 켜집니다
  const pointerRef = usePointerVars() // 마우스를 따라 큰 글자가 줄마다 다르게 살짝 움직입니다
  return (
    <section className="hero pin" aria-labelledby="hero-title" ref={pinRef} data-step="0">
      <div className="pin__stage" ref={pointerRef}>
        <div className="wrap">
          <p className="kw" aria-hidden="true">
            {hero.keywords.map((k, i) => (
              <span key={k} style={{ '--i': i }}>
                {k}
              </span>
            ))}
          </p>

          <div className="hero__body">
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
            <p className="hero__lead">
              <span className="hero__s">{hero.lead.intro}</span>{' '}
              {hero.lead.steps.map((t) => (
                <span className="hero__s" key={t}>
                  {t}{' '}
                </span>
              ))}
            </p>
            <div className="hero__cta">
              <a className="btn btn--solid ink follow magnet" href="#/project">
                프로젝트 보기
              </a>
              <a className="btn btn--desk ink follow magnet" href="#/desk">
                책상에서 둘러보기
              </a>
            </div>
            <div className="pin__rail" aria-hidden="true">
              {hero.keywords.map((k) => (
                <i key={k} />
              ))}
              <span>스크롤해서 보기</span>
            </div>
          </div>
        </div>
      </div>
      <div className="pin__track" aria-hidden="true" />
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
      <div className="wrap hero__spec">
        <Spec />
      </div>
      <Overview />
    </>
  )
}
