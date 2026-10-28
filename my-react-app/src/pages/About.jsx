import { profile } from '../data/profile.js'
import { skillGroups, skillTools } from '../data/skills.js'
import { awards } from '../data/awards.js'
import { contests } from '../data/contests.js'
import { useScrollSpy } from '../lib/useScrollSpy.js'
import { useTimelineProgress } from '../lib/useTimelineProgress.js'
import { useReveal } from '../lib/useReveal.js'
import { scrollToId } from '../lib/dom.js'
import Spec from '../components/Spec.jsx'
import SkillMap from '../components/SkillMap.jsx'
import IntroFlow from '../components/IntroFlow.jsx'
import { TimelineBar, TimelineAxis } from '../components/TimelineBar.jsx'
import { boundsOf } from '../lib/months.js'

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
  // 읽는 위치에 맞춰 활동 기록과 대회 참가의 진행선이 차오릅니다(목록마다 따로)
  const bounds = boundsOf(about.timeline)
  const historyRef = useTimelineProgress()
  const contestsRef = useTimelineProgress()

  return (
    <div className="ab">
      <SectionIndex />

      <section className="wrap ab__intro" id="intro" aria-labelledby="ab-title">
        <div className="ab__introgrid">
          <div>
            <h1 className="ab__h" id="ab-title">
              소개
            </h1>
            <IntroFlow flow={about.flow} />
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
        <SkillMap groups={skillGroups} tools={skillTools} />
      </section>

      <section className="wrap ab__sec" id="history" aria-labelledby="hi-title">
        <h2 className="ab__h" id="hi-title">
          활동 기록
        </h2>
        <TimelineAxis bounds={bounds} />
        <ol className="tl tl--live tl--range" ref={historyRef}>
          {about.timeline.map((t) => {
            const [title, ...desc] = t.text.split('\n')
            return (
              <li className="tl__item reveal" key={`${t.when}-${title}`}>
                <span className="tl__when tnum">{t.when}</span>
                <div className="tl__main">
                  <p className="tl__text">
                    <span className="tl__title">{title}</span>
                    {desc.map((d) => (
                      <span className="tl__desc" key={d}>
                        {d}
                      </span>
                    ))}
                  </p>
                  <TimelineBar range={t.range} bounds={bounds} plan={t.plan} tone={t.tone} />
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="wrap ab__sec" id="contests" aria-labelledby="ct-title">
        <h2 className="ab__h" id="ct-title">
          대회 참가
        </h2>
        <ol className="tl tl--wide tl--live" ref={contestsRef}>
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
