import Head from '../components/Head.jsx'
import { profile } from '../data/profile.js'
import { skillGroups } from '../data/skills.js'
import { awards } from '../data/awards.js'
import { ideas, ideasIntro } from '../data/ideas.js'
import { cases } from '../data/cases.js'

function Hero() {
  const { hero } = profile
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title">
          {hero.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="hero__lead">{hero.lead}</p>
        <div className="hero__meta">
          <span className="chip chip--accent">{profile.roleLine}</span>
          <span className="chip">{profile.school}</span>
        </div>
      </div>
    </section>
  )
}

function Capabilities() {
  return (
    <section className="wrap" aria-label="핵심 역량" style={{ paddingBottom: 72 }}>
      <div className="caps">
        {profile.capabilities.map((c, i) => (
          <a className="cap" key={c.title} href={`#/work/${c.to.slug}?s=${c.to.section}`}>
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

function Work() {
  return (
    <section className="section" id="work">
      <div className="wrap">
        <Head
          kicker="Work"
          title="프로젝트"
          lead="프로젝트는 목표·방식·결과 순으로, 내 역할은 역할·책임·결과 순으로 읽도록 정리했습니다."
        />
        <div className="work">
          {cases.map((c, i) => (
            <a className="work__item" key={c.slug} href={`#/work/${c.slug}`}>
              <span className="work__no tnum">0{i + 1}</span>
              <div>
                <h3 className="work__title">{c.title}</h3>
                <p className="work__sub">{c.subtitle}</p>
                <p className="work__sum">{c.summary}</p>
                <div className="work__tags">
                  {c.tags.map((t) => (
                    <span className="chip" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="work__side">
                <span className="tnum">{c.period}</span>
                <span>{c.status}</span>
                <span className="work__open">케이스 보기 →</span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 56 }}>
          <h3 style={{ fontSize: 20, marginBottom: 8 }}>탐색한 기획</h3>
          <p style={{ color: 'var(--muted)', maxWidth: 640, marginBottom: 20 }}>{ideasIntro}</p>
          <div className="ideas">
            {ideas.map((idea) => (
              <details className="idea" key={idea.title}>
                <summary>
                  <h3>{idea.title}</h3>
                  <span>{idea.tag}</span>
                </summary>
                <dl className="idea__body">
                  <div>
                    <dt>문제</dt>
                    <dd>{idea.problem}</dd>
                  </div>
                  <div>
                    <dt>접근</dt>
                    <dd>{idea.approach}</dd>
                  </div>
                  <div>
                    <dt>핵심</dt>
                    <dd>{idea.insight}</dd>
                  </div>
                  {idea.structure.length > 0 && (
                    <div>
                      <dt>리포트 구성</dt>
                      <dd>
                        <ul>
                          {idea.structure.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                </dl>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  const { about } = profile
  return (
    <section className="section" id="about">
      <div className="wrap">
        <Head kicker="About" title="소개" />
        <div className="about">
          <div className="about__text">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ol className="tl">
            {about.timeline.map((t) => (
              <li className="tl__item" key={t.when}>
                <span className="tl__when tnum">{t.when}</span>
                <p className="tl__text">{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Skills() {
  return (
    <section className="section" id="skills">
      <div className="wrap">
        <Head
          kicker="Skills"
          title="기술과 도구"
          lead="무엇을 아는지가 아니라, 어디에 어떻게 썼는지로 적었습니다."
        />
        <div className="skills">
          {skillGroups.map((g) => (
            <div className="skillgroup" key={g.title}>
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((s) => (
                  <li key={s.name}>
                    <b>{s.name}</b>
                    <span>{s.used}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Awards() {
  if (!awards.length) return null
  return (
    <section className="section" id="awards">
      <div className="wrap">
        <Head kicker="Awards" title="수상" />
        <ul className="awards">
          {awards.map((a) => (
            <li key={`${a.year}-${a.title}`}>
              <span className="tnum" style={{ color: 'var(--faint)' }}>
                {a.year}
              </span>
              <div>
                <b>{a.title}</b>
                <small>{[a.org, a.note].filter(Boolean).join(' · ')}</small>
              </div>
              <span className="awards__res">{a.result}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Contact() {
  const { contact } = profile
  const links = [
    ['GitHub', contact.github],
    ['이메일', contact.email && `mailto:${contact.email}`],
    ['LinkedIn', contact.linkedin],
    ['Notion', contact.notion],
  ].filter(([, href]) => href)

  return (
    <section className="section" id="contact">
      <div className="wrap">
        <Head kicker="Contact" title="연락" lead="프로젝트의 근거 자료나 더 자세한 이야기가 궁금하시면 편하게 연락 주세요." />
        <div className="contact">
          {links.map(([label, href]) => (
            <a className="btn" key={label} href={href} target="_blank" rel="noreferrer">
              {label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <Capabilities />
      <Work />
      <About />
      <Skills />
      <Awards />
      <Contact />
    </>
  )
}
