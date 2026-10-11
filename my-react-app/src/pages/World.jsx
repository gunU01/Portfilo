import { useEffect, useRef, useState } from 'react'
import { zones } from '../data/world.js'
import { createWorld } from '../lib/worldScene.js'

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 월드는 읽기 모드로 가는 또 하나의 입구입니다. WebGL이 없거나 모션 줄이기가 켜져 있으면 읽기 모드를 기본으로 안내합니다.
export default function World() {
  const hostRef = useRef(null)
  const worldRef = useRef(null)
  const padRef = useRef(null)
  const [supported] = useState(hasWebGL)
  const [started, setStarted] = useState(() => !prefersReducedMotion())
  const [near, setNear] = useState(null)
  const [zoneId, setZoneId] = useState(null)

  useEffect(() => {
    if (!supported || !started) return undefined
    const world = createWorld({
      container: hostRef.current,
      zones,
      onNear: setNear,
      onZone: setZoneId,
      onActivate: (href) => {
        window.location.hash = href
      },
    })
    worldRef.current = world
    hostRef.current.focus({ preventScroll: true })
    return () => {
      world.dispose()
      worldRef.current = null
    }
  }, [supported, started])

  const moveStick = (e) => {
    const rect = padRef.current.getBoundingClientRect()
    const r = rect.width / 2
    let x = (e.clientX - (rect.left + r)) / r
    let y = (e.clientY - (rect.top + r)) / r
    const len = Math.hypot(x, y)
    if (len > 1) {
      x /= len
      y /= len
    }
    worldRef.current?.setStick(x, y)
    const knob = padRef.current.firstElementChild
    knob.style.transform = `translate(${x * r * 0.55}px, ${y * r * 0.55}px)`
  }
  const endStick = () => {
    worldRef.current?.setStick(0, 0)
    const knob = padRef.current?.firstElementChild
    if (knob) knob.style.transform = ''
  }

  const zoneName = zones.find((z) => z.id === zoneId)?.name

  if (!supported || !started) {
    return (
      <section className="wrap world-fallback" aria-labelledby="world-title">
        <h1 id="world-title">3D 월드</h1>
        <p>
          {supported
            ? '모션 줄이기 설정이 켜져 있어 월드를 자동으로 시작하지 않았습니다.'
            : '이 브라우저에서는 3D를 표시할 수 없습니다.'}
          {' '}읽기 모드에서 같은 내용을 모두 볼 수 있습니다.
        </p>
        <div className="world-fallback__actions">
          <a className="btn" href="#/">
            읽기 모드로 보기
          </a>
          {supported && (
            <button className="btn" type="button" onClick={() => setStarted(true)}>
              그래도 월드 시작
            </button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="world" aria-label="3D 포트폴리오 월드">
      <div
        className="world__stage"
        ref={hostRef}
        tabIndex={0}
        role="application"
        aria-label="3D 월드. 방향키 또는 WASD로 이동하고, 가까운 건물에서 Enter 키로 엽니다."
      />

      <div className="world__top">
        <div className="world__zones" role="group" aria-label="구역으로 바로 이동">
          {zones.map((z, i) => (
            <button
              key={z.id}
              type="button"
              className={z.id === zoneId ? 'is-on' : ''}
              onClick={() => {
                worldRef.current?.goTo(z.id)
                hostRef.current?.focus({ preventScroll: true })
              }}
            >
              <i>{String(i + 1).padStart(2, '0')}</i>
              {z.name}
            </button>
          ))}
        </div>
        <a className="world__exit" href="#/">
          읽기 모드로 보기
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>

      <p className="world__where">
        <span className="world__dot" aria-hidden="true" />
        {zoneName ?? '길을 따라 구역으로 이동하세요'}
      </p>

      <p className="world__hint" aria-hidden="true">
        <span className="keys">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd>
        </span>
        이동
        <span className="world__sep" />
        <kbd>Enter</kbd>
        열기
      </p>

      {near && (
        <a className="world__card" href={near.href}>
          <b>{near.title}</b>
          <span>{near.sub}</span>
          <em>
            <kbd>Enter</kbd>
            열기 →
          </em>
        </a>
      )}

      <div
        className="world__pad"
        ref={padRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          moveStick(e)
        }}
        onPointerMove={(e) => e.buttons && moveStick(e)}
        onPointerUp={endStick}
        onPointerCancel={endStick}
        aria-hidden="true"
      >
        <span />
      </div>

      <p className="world__live" aria-live="polite">
        {near ? `${near.title}. Enter 키로 엽니다.` : ''}
      </p>
    </section>
  )
}
