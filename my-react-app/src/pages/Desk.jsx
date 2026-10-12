import { useEffect, useRef, useState } from 'react'
import DeskScene from '../components/DeskScene.jsx'
import { spots } from '../data/desk.js'

const external = (href) => /^https?:/.test(href)
const linkProps = (href) => (external(href) ? { target: '_blank', rel: 'noreferrer' } : {})

function Panel({ spot, onClose }) {
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

      {spot.paragraphs && spot.paragraphs.map((p) => <p key={p}>{p}</p>)}

      {spot.items && (
        <>
          {spot.itemsTitle && <h3 className="desk__sub">{spot.itemsTitle}</h3>}
        <ul className="desk__list">
          {spot.items.map((it) => (
            <li key={it.title}>
              <a href={it.href} {...linkProps(it.href)}>
                <b>{it.title}</b>
                {it.sub && <span>{it.sub}</span>}
              </a>
            </li>
          ))}
        </ul>
        </>
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

// 책상 위 물건을 눌러 포트폴리오를 둘러보는 입구입니다. 본문은 항상 케이스 페이지에서 읽습니다.
export default function Desk() {
  const stageRef = useRef(null)
  const boxRef = useRef(null)
  const [active, setActive] = useState(null)
  const [openId, setOpenId] = useState(null)
  const spot = spots.find((s) => s.id === openId)

  // 마우스를 따라 층마다 다르게 살짝 움직입니다(포인터가 정밀한 기기에서만).
  useEffect(() => {
    const box = boxRef.current
    if (!box || window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = box.getBoundingClientRect()
        box.style.setProperty('--px', String(((e.clientX - r.left) / r.width - 0.5) * 2))
        box.style.setProperty('--py', String(((e.clientY - r.top) / r.height - 0.5) * 2))
      })
    }
    box.addEventListener('pointermove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      box.removeEventListener('pointermove', onMove)
    }
  }, [])

  // 좁은 화면에서는 장면 가운데(노트북)가 먼저 보이게 합니다.
  useEffect(() => {
    const box = boxRef.current
    if (box) box.scrollLeft = (box.scrollWidth - box.clientWidth) * 0.5
  }, [])

  const open = (id) => setOpenId(id)
  const close = () => setOpenId(null)

  return (
    <section className="desk" aria-label="책상 위 포트폴리오">
      <div className="desk__stage" ref={boxRef}>
        <DeskScene active={active} setActive={setActive} onOpen={open} stageRef={stageRef} />
      </div>

      <div className="desk__top">
        <div className="desk__chips" role="group" aria-label="바로 가기">
          {spots.map((s) => (
            <button key={s.id} type="button" className={s.id === openId ? 'is-on' : ''} onClick={() => open(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <a className="desk__exit" href="#/">
          읽기 모드로 보기
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>

      {spot && <Panel spot={spot} onClose={close} />}
    </section>
  )
}
