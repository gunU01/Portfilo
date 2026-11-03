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
  const [showAll, setShowAll] = useState(false)
  const close = useCallback(() => setOpenId(null), [])
  const spot = spots.find((s) => s.id === openId)

  return (
    <section className={spot ? 'desk desk--open' : 'desk'} aria-label="책상 위 포트폴리오">
      <div className="desk__stage" ref={stageRef}>
        <DeskScene active={active} setActive={setActive} onOpen={setOpenId} showAll={showAll} />
      </div>

      {/* 마우스가 없는 화면(모바일)이나 처음 온 사람이 어떤 물건이 눌리는지 한눈에 보도록, 이름표를 모두 켜고 끄는 버튼 */}
      <button className="desk__hint" type="button" aria-pressed={showAll} onClick={() => setShowAll((v) => !v)}>
        {showAll ? '이름표 숨기기' : '눌러 볼 수 있는 물건 모두 보기'}
      </button>

      {spot && <DeskPanel spot={spot} onClose={close} />}
    </section>
  )
}
