import { useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Case from './pages/Case.jsx'
import { cases } from './data/cases.js'
import { profile } from './data/profile.js'
import { useHashRoute } from './lib/useHashRoute.js'

export default function App() {
  const { path, section } = useHashRoute()
  const match = path.match(/^\/work\/([\w-]+)$/)
  const index = match ? cases.findIndex((c) => c.slug === match[1]) : -1
  const current = index >= 0 ? cases[index] : null

  useEffect(() => {
    const base = `${profile.name} · PM 포트폴리오`
    document.title = current ? `${current.title} — ${base}` : base
  }, [current])

  // 라우트가 바뀌면 맨 위로, 섹션 앵커(?s=)가 있으면 그 섹션으로
  useEffect(() => {
    if (!section) {
      window.scrollTo(0, 0)
      return undefined
    }
    const id = requestAnimationFrame(() => document.getElementById(section)?.scrollIntoView())
    return () => cancelAnimationFrame(id)
  }, [path, section])

  return (
    <>
      <a className="skip" href="#main">
        본문으로 건너뛰기
      </a>
      <Nav />
      <main id="main">
        {current ? (
          <Case
            key={current.slug}
            data={current}
            index={index}
            total={cases.length}
            next={cases[(index + 1) % cases.length]}
          />
        ) : (
          <Home />
        )}
      </main>
      <footer className="footer">
        <div className="wrap">
          <span>
            © 2026 {profile.name}. 프로젝트 근거는 팀 문서에서 확인된 내용만 담았습니다.
          </span>
          <span>마지막 업데이트 {profile.updated}</span>
        </div>
      </footer>
    </>
  )
}
