import { profile } from '../data/profile.js'

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
        <a className="nav__desk" href="#/desk">
          책상<span className="nav__desk-long">에서 둘러보기</span>
        </a>
      </div>
    </nav>
  )
}
