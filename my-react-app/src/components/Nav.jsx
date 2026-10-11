import { profile } from '../data/profile.js'
import ThemeToggle from './ThemeToggle.jsx'

const LINKS = [
  ['/', 'Home'],
  ['/project', 'Project'],
  ['/about', 'About'],
]

export default function Nav({ path }) {
  const current = path.startsWith('/work/') ? '/project' : path

  return (
    <nav className="nav" aria-label="주 메뉴">
      <div className="wrap nav__in">
        <a className="nav__brand" href="#/">
          {profile.name}
          <small>{profile.roleLine}</small>
        </a>
        <div className="nav__links">
          {LINKS.map(([to, label]) => (
            <a key={to} href={`#${to}`} aria-current={current === to ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </div>
        <ThemeToggle />
        <a className="nav__3d" href="#/world">
          3D<span className="nav__3d-long">로 감상하기</span>
        </a>
      </div>
    </nav>
  )
}
