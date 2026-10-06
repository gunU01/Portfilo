import { profile } from '../data/profile.js'
import { awards } from '../data/awards.js'
import { goHomeSection } from '../lib/goSection.js'

export default function Nav() {
  const items = [
    ['work', '프로젝트'],
    ['about', '소개'],
    ['skills', '기술'],
    ...(awards.length ? [['awards', '수상']] : []),
    ['contact', '연락'],
  ]

  return (
    <nav className="nav" aria-label="주 메뉴">
      <div className="wrap nav__in">
        <a className="nav__brand" href="#/">
          {profile.name}
          <small>{profile.roleLine}</small>
        </a>
        <div className="nav__links">
          {items.map(([id, label]) => (
            <button key={id} type="button" onClick={() => goHomeSection(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
