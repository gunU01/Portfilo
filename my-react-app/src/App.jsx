import { Suspense, lazy, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Project from './pages/Project.jsx'
import About from './pages/About.jsx'
import Footer from './components/Footer.jsx'
import Case from './pages/Case.jsx'
import { cases } from './data/cases.js'
import { profile } from './data/profile.js'
import { useHashRoute } from './lib/useHashRoute.js'

// 3D는 월드를 열 때만 내려받습니다(three 포함).
const World = lazy(() => import('./pages/World.jsx'))

const TITLES = { '/world': '3D 월드', '/project': 'Project', '/about': 'About' }

export default function App() {
  const { path, section } = useHashRoute()
  const match = path.match(/^\/work\/([\w-]+)$/)
  const index = match ? cases.findIndex((c) => c.slug === match[1]) : -1
  const current = index >= 0 ? cases[index] : null

  useEffect(() => {
    const base = `${profile.name} · PM 포트폴리오`
    document.title = current ? `${current.title} — ${base}` : TITLES[path] ? `${TITLES[path]} — ${base}` : base
  }, [current, path])

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
      <Nav path={path} />
      <main id="main">
        {current ? (
          <Case
            key={current.slug}
            data={current}
            index={index}
            total={cases.length}
            next={cases[(index + 1) % cases.length]}
          />
        ) : path === '/world' ? (
          <Suspense fallback={<p className="wrap world-loading">월드를 불러오는 중입니다…</p>}>
            <World />
          </Suspense>
        ) : path === '/project' ? (
          <Project />
        ) : path === '/about' ? (
          <About />
        ) : (
          <Home />
        )}
      </main>
      {path !== '/world' && <Footer />}
    </>
  )
}
