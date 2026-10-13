import { useEffect, useRef } from 'react'
import Rich from './Rich.jsx'
import { isExternal } from '../lib/format.js'

const linkProps = (href) => (isExternal(href) ? { target: '_blank', rel: 'noreferrer' } : {})

// 책상 위 물건을 눌렀을 때 열리는 내용. spot 에 있는 항목(paragraphs, items, timeline, links)만 차례로 그립니다.
export default function DeskPanel({ spot, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [spot.id, onClose])

  return (
    <aside className="desk__panel" role="dialog" aria-label={spot.title}>
      <button className="desk__close" type="button" onClick={onClose} ref={closeRef} aria-label="닫기">
        <span aria-hidden="true">×</span>
      </button>
      <h2>{spot.title}</h2>

      {spot.paragraphs?.map((p) => (
        <p key={p}>
          <Rich text={p} />
        </p>
      ))}

      {spot.items && (
        <ul className="desk__list">
          {spot.items.map((it) => (
            <li key={it.title}>
              <a className="ink" href={it.href} {...linkProps(it.href)}>
                <b>{it.title}</b>
                {it.sub && <span>{it.sub}</span>}
              </a>
            </li>
          ))}
        </ul>
      )}

      {spot.timeline && (
        <ol className="desk__tl">
          {spot.timeline.map((t) => (
            <li key={`${t.when}-${t.text}`}>
              <span className="tnum">{t.when}</span>
              <p>{t.text}</p>
            </li>
          ))}
        </ol>
      )}

      {spot.links && (
        <p className="desk__links">
          {spot.links.map((l) => (
            <a key={l.href} href={l.href} {...linkProps(l.href)}>
              {l.label}
            </a>
          ))}
        </p>
      )}
    </aside>
  )
}
