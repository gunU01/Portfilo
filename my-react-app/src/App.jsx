import { useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Project from './pages/Project.jsx'
import About from './pages/About.jsx'
import Case from './pages/Case.jsx'
import Desk from './pages/Desk.jsx'
import { cases } from './data/cases.js'
import { profile } from './data/profile.js'
import { useHashRoute } from './lib/useHashRoute.js'
import { scrollToId } from './lib/format.js'

// 해시 경로 → 페이지. 목록에 없는 경로와 케이스(/work/<slug>)는 아래에서 따로 처리합니다.
const PAGES = {
  '/desk': { title: '책상', Page: Desk, footer: false },
  '/project': { title: 'Project', Page: Project },
  '/about': { title: 'About', Page: About },
}

export default function App() {
  const { path, section } = useHashRoute()
  const slug = path.match(/^\/work\/([\w-]+)$/)?.[1]
  const current = cases.find((c) => c.slug === slug)
  const page = PAGES[path]
  const title = current?.title ?? page?.title

  useEffect(() => {
    const base = `${profile.name} · PM 포트폴리오`
    document.title = title ? `${title} — ${base}` : base
  }, [title])

  // 라우트가 바뀌면 맨 위로, 섹션 앵커(?s=)가 있으면 그 섹션으로
  useEffect(() => {
    if (!section) {
      window.scrollTo(0, 0)
      return undefined
    }
    const id = requestAnimationFrame(() => scrollToId(section))
    return () => cancelAnimationFrame(id)
  }, [path, section])

  const Page = page?.Page ?? Home

  return (
    <>
      <a className="skip" href="#main">
        본문으로 건너뛰기
      </a>
      <Nav path={path} />
      <main id="main">{current ? <Case key={current.slug} data={current} /> : <Page />}</main>
      {page?.footer !== false && <Footer />}
    </>
  )
}
