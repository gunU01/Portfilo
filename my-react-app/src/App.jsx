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
import { useRouteScroll } from './lib/useRouteScroll.js'
import { useCanonicalRoute } from './lib/useCanonicalRoute.js'
import { usePrefetch } from './lib/usePrefetch.js'

// 처음 화면(홈)만 먼저 받고, 나머지 페이지는 그 경로에 들어갈 때 받습니다.
const loaders = {
  project: () => import('./pages/Project.jsx'),
  about: () => import('./pages/About.jsx'),
  case: () => import('./pages/Case.jsx'),
  desk: () => import('./pages/Desk.jsx'),
}
// 한가할 때 받을 가벼운 페이지들, 마우스를 올리면 받을 페이지(책상). 렌더마다 새로 만들지 않도록 모듈 상수로 둡니다.
const PREFETCH = { idle: [loaders.project, loaders.about, loaders.case], hover: { '/desk': loaders.desk } }
const Project = lazy(loaders.project)
const About = lazy(loaders.about)
const Case = lazy(loaders.case)
const Desk = lazy(loaders.desk)

// 해시 경로 → 페이지. 목록에 없는 경로와 케이스(/work/<slug>)는 아래에서 따로 처리합니다.
const PAGES = {
  '/desk': { title: '책상', Page: Desk, footer: false },
  '/project': { title: 'Project', Page: Project },
  '/about': { title: 'About', Page: About },
}

export default function App() {
  const { path, typed, query, section } = useHashRoute()
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

  // 라우트가 바뀌면 맨 위(또는 ?s= 구간)에서 시작하고, 뒤로·앞으로 가기는 떠난 위치로 돌아갑니다
  useRouteScroll(path, section)

  // 주소 정리: 없는 경로는 가까운 곳으로 옮깁니다(케이스는 목록으로, 그 밖에는 홈으로)
  const known = path === '/' || Boolean(page) || Boolean(current)
  useCanonicalRoute(known ? path : path.startsWith('/work/') ? '/project' : '/', typed, known ? query : '')

  // 한가할 때 가벼운 페이지를, 책상은 메뉴에 마우스를 올리면 미리 받습니다
  usePrefetch(PREFETCH)

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
      <main id="main" key={pageKey} className="page-in" data-path={path}>
        <Suspense fallback={<div className="page-wait" aria-hidden="true" />}>{current ? <Case data={current} /> : <Page />}</Suspense>
      </main>
      {page?.footer !== false && <Footer />}
      {page?.footer !== false && <BackToTop />}
    </>
  )
}
