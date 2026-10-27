import { lazy, Suspense, useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'
import Home from './pages/Home.jsx'
import { cases } from './data/cases.js'
import { profile } from './data/profile.js'
import { useHashRoute } from './lib/useHashRoute.js'
import { useAccent } from './lib/useAccent.js'
import { useInkHover } from './lib/useInkHover.js'
import { useFollow } from './lib/useFollow.js'
import { useScrollProgress } from './lib/useScrollProgress.js'
import { scrollToIdWhenReady } from './lib/dom.js'

// 처음 화면(홈)만 먼저 받고, 나머지 페이지는 그 경로에 들어갈 때 받습니다.
const Project = lazy(() => import('./pages/Project.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Case = lazy(() => import('./pages/Case.jsx'))
const Desk = lazy(() => import('./pages/Desk.jsx'))

// 해시 경로 → 페이지. 목록에 없는 경로와 케이스(/work/<slug>)는 아래에서 따로 처리합니다.
const PAGES = {
  '/desk': { title: '책상', Page: Desk, footer: false },
  '/project': { title: 'Project', Page: Project },
  '/about': { title: 'About', Page: About },
}

export default function App() {
  const { path, section } = useHashRoute()
  useInkHover()
  useFollow()
  useScrollProgress()
  const slug = path.match(/^\/work\/([\w-]+)$/)?.[1]
  const current = cases.find((c) => c.slug === slug)
  useAccent(current?.accent)
  const page = PAGES[path]
  const title = current?.title ?? page?.title

  useEffect(() => {
    const base = `${profile.name} 포트폴리오 사이트`
    document.title = title ? `${title} — ${base}` : base
  }, [title])

  // 라우트가 바뀌면 맨 위로, 섹션 앵커(?s=)가 있으면 그 섹션으로
  useEffect(() => {
    if (!section) {
      window.scrollTo(0, 0)
      return undefined
    }
    return scrollToIdWhenReady(section)
  }, [path, section])

  const Page = page?.Page ?? Home
  // 페이지가 바뀔 때마다 main 을 새로 만들어 들어오는 효과(page-in)가 다시 시작되게 합니다.
  const pageKey = current?.slug ?? path

  return (
    <>
      <a className="skip" href="#main">
        본문으로 건너뛰기
      </a>
      {page?.footer !== false && <div className="progress" aria-hidden="true" />}
      <Nav path={path} />
      <main id="main" key={pageKey} className="page-in">
        <Suspense fallback={<div className="page-wait" aria-hidden="true" />}>{current ? <Case data={current} /> : <Page />}</Suspense>
      </main>
      {page?.footer !== false && <Footer />}
      {page?.footer !== false && <BackToTop />}
    </>
  )
}
