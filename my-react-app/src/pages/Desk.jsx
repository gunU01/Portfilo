import { useCallback, useState } from 'react'
import DeskScene from '../components/DeskScene.jsx'
import DeskPanel from '../components/DeskPanel.jsx'
import { spots } from '../data/desk.js'
import { useParallax } from '../lib/useParallax.js'

// 책상 위 물건을 눌러 포트폴리오를 둘러보는 입구입니다. 본문은 항상 케이스 페이지에서 읽습니다.
export default function Desk() {
  const stageRef = useParallax()
  const [active, setActive] = useState(null)
  const [openId, setOpenId] = useState(null)
  const close = useCallback(() => setOpenId(null), [])
  const spot = spots.find((s) => s.id === openId)

  return (
    <section className="desk" aria-label="책상 위 포트폴리오">
      <div className="desk__stage" ref={stageRef}>
        <DeskScene active={active} setActive={setActive} onOpen={setOpenId} />
      </div>

      {spot && <DeskPanel spot={spot} onClose={close} />}
    </section>
  )
}
