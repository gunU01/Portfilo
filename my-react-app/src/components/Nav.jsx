import { profile } from '../data/profile.js'
import { useActivePill } from '../lib/useActivePill.js'

const LINKS = [
  ['/', 'Home'],
  ['/project', 'Project'],
  ['/about', 'About'],
]

export default function Nav({ path }) {
  const current = path.startsWith('/work/') ? '/project' : path
  const { linksRef, pillRef } = useActivePill(current) // 현재 메뉴 뒤의 알약이 메뉴를 옮겨 다닙니다

  return (
    <nav className="nav" aria-label="주 메뉴">
      <div className="wrap nav__in">
        <a className="nav__brand" href="#/">
          {profile.name}
          <small>{profile.roleLine}</small>
        </a>
        <div className="nav__links" ref={linksRef}>
          <span className="nav__pill" ref={pillRef} aria-hidden="true" />
          {LINKS.map(([to, label]) => (
            <a key={to} className="ink" href={`#${to}`} aria-current={current === to ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </div>
        <a className="nav__desk ink" href="#/desk">
          책상<span className="nav__desk-long">에서 둘러보기</span>
        </a>
      </div>
    </nav>
  )
}
