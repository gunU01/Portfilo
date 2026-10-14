import { profile } from '../data/profile.js'
import { skillGroups } from '../data/skills.js'
import { awards } from '../data/awards.js'
import { contests } from '../data/contests.js'
import { useScrollSpy } from '../lib/useScrollSpy.js'
import { useTimelineProgress } from '../lib/useTimelineProgress.js'
import { useReveal } from '../lib/useReveal.js'
import { scrollToId } from '../lib/format.js'
import Spec from '../components/Spec.jsx'
import SkillMap from '../components/SkillMap.jsx'
import Rich from '../components/Rich.jsx'

const SECTIONS = [
  ['intro', '소개'],
  ['skills', '기술'],
  ['history', '활동'],
  ['contests', '대회'],
  ...(awards.length ? [['awards', '수상']] : []),
]
const SECTION_IDS = SECTIONS.map(([id]) => id)

function SectionIndex() {
  const active = useScrollSpy(SECTION_IDS, { lastAtBottom: true })
  return (
    <nav className="sidx" aria-label="섹션 이동">
      {SECTIONS.map(([id, label], i) => (
        <button key={id} type="button" aria-current={active === id} onClick={() => scrollToId(id)}>
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
  const timelineRef = useTimelineProgress() // 읽는 위치에 맞춰 활동 기록의 진행선이 차오릅니다

  return (
    <div className="ab">
      <SectionIndex />

      <section className="wrap ab__intro" id="intro" aria-labelledby="ab-title">
        <div className="ab__introgrid">
          <div>
            <h1 className="ab__h" id="ab-title">
              소개
            </h1>
            <div className="ab__text">
              {about.paragraphs.map((p) => (
                <p key={p}>
                  <Rich text={p} />
                </p>
              ))}
            </div>
          </div>
          <div className="ab__side">
            <Spec />
          </div>
        </div>
      </section>

      <section className="wrap ab__sec" id="skills" aria-labelledby="sk-title">
        <h2 className="ab__h" id="sk-title">
          나의 기술들
        </h2>
        <SkillMap groups={skillGroups} />
      </section>

      <section className="wrap ab__sec" id="history" aria-labelledby="hi-title">
        <h2 className="ab__h" id="hi-title">
          활동 기록
        </h2>
        <ol className="tl tl--live" ref={timelineRef}>
          {about.timeline.map((t) => (
            <li className="tl__item reveal" key={t.when}>
              <span className="tl__when tnum">{t.when}</span>
              <p className="tl__text">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap ab__sec" id="contests" aria-labelledby="ct-title">
        <h2 className="ab__h" id="ct-title">
          대회 참가
        </h2>
        <ol className="tl tl--wide">
          {contests.map((c) => (
            <li className="tl__item reveal" key={c.title}>
              <span className="tl__when tnum">{c.when}</span>
              <p className="tl__text">{c.title}</p>
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
                  {(a.org || a.note) && <small>{[a.org, a.note].filter(Boolean).join(' · ')}</small>}
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
