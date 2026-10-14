import { useLayoutEffect, useRef } from 'react'
import { profile } from '../data/profile.js'

const LINKS = [
  ['/', 'Home'],
  ['/project', 'Project'],
  ['/about', 'About'],
]

export default function Nav({ path }) {
  const current = path.startsWith('/work/') ? '/project' : path
  const linksRef = useRef(null)
  const pillRef = useRef(null)

  // 현재 메뉴 뒤의 알약이 메뉴를 옮겨 다닙니다. 현재 메뉴가 없는 페이지(책상)에서는 숨깁니다.
  useLayoutEffect(() => {
    const place = () => {
      const pill = pillRef.current
      const active = linksRef.current?.querySelector('[aria-current="page"]')
      if (!pill) return
      if (!active) {
        pill.classList.remove('is-on')
        return
      }
      const first = !pill.classList.contains('is-on')
      pill.style.transition = first ? 'none' : ''
      pill.style.setProperty('--x', `${active.offsetLeft}px`)
      pill.style.setProperty('--y', `${active.offsetTop}px`)
      pill.style.setProperty('--w', `${active.offsetWidth}px`)
      pill.style.setProperty('--h', `${active.offsetHeight}px`)
      pill.classList.add('is-on')
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [current])

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
