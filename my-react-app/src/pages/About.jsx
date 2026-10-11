import { useMemo } from 'react'
import { profile } from '../data/profile.js'
import { skillGroups } from '../data/skills.js'
import { awards } from '../data/awards.js'
import { useScrollSpy } from '../lib/useScrollSpy.js'
import { useReveal } from '../lib/useReveal.js'

function SectionIndex({ items }) {
  const ids = useMemo(() => items.map(([id]) => id), [items])
  const active = useScrollSpy(ids)
  return (
    <nav className="sidx" aria-label="섹션 이동">
      {items.map(([id, label], i) => (
        <button key={id} type="button" aria-current={active === id} onClick={() => document.getElementById(id)?.scrollIntoView()}>
          <span className="tnum">{String(i + 1).padStart(2, '0')}</span>
          {label}
        </button>
      ))}
    </nav>
  )
}

export default function About() {
  const { about } = profile
  useReveal()
  const items = useMemo(
    () => [
      ['intro', '소개'],
      ['skills', '기술'],
      ['history', '활동'],
      ...(awards.length ? [['awards', '수상']] : []),
    ],
    [],
  )

  return (
    <div className="ab">
      <SectionIndex items={items} />

      <section className="wrap ab__intro" id="intro" aria-labelledby="ab-title">
        <div className="ab__introgrid">
          <div>
            <h1 className="ab__h" id="ab-title">
              소개
            </h1>
            <div className="ab__text">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <div className="ab__side">
            <aside className="spec" aria-label="About me">
              <p className="spec__t">About me</p>
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
                        @{profile.contact.github.replace(/\/+$/, '').split('/').pop()}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="wrap ab__sec" id="skills" aria-labelledby="sk-title">
        <h2 className="ab__h" id="sk-title">
          나의 기술들
        </h2>
        <div className="skcards">
          {skillGroups.map((g, i) => (
            <article className="skcard reveal" key={g.title}>
              <header>
                <h3>{g.title}</h3>
                <span className="skcard__n tnum">{i + 1}</span>
              </header>
              <ul>
                {g.items.map((s) => (
                  <li key={s.name}>
                    <b>{s.name}</b>
                    <span>{s.used}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap ab__sec" id="history" aria-labelledby="hi-title">
        <h2 className="ab__h" id="hi-title">
          활동 기록
        </h2>
        <ol className="tl">
          {about.timeline.map((t) => (
            <li className="tl__item reveal" key={t.when}>
              <span className="tl__when tnum">{t.when}</span>
              <p className="tl__text">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {awards.length > 0 && (
        <section className="wrap ab__sec" id="awards" aria-labelledby="aw-title">
          <h2 className="ab__h" id="aw-title">
            수상
          </h2>
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
        </section>
      )}
    </div>
  )
}
