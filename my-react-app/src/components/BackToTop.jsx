import { useEffect, useState } from 'react'
import { onScrollFrame } from '../lib/onScrollFrame.js'

// 긴 페이지에서 일정 이상 내려오면 나타나는 '맨 위로' 버튼
export default function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => onScrollFrame(() => setShow(window.scrollY > 700)), [])

  const up = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button type="button" className={show ? 'totop is-on' : 'totop'} aria-label="맨 위로" tabIndex={show ? 0 : -1} onClick={up}>
      <span aria-hidden="true">↑</span>
    </button>
  )
}
