import { DeskContext } from './desk/deskContext.js'
import Defs from './desk/Defs.jsx'
import Tags from './desk/Tags.jsx'
import { Window, Frames, Shelf, Calendar } from './desk/Wall.jsx'
import { Ivy, SillPots, Bunting, Polaroids, Stickies } from './desk/WallDecor.jsx'
import { DeskBase, Drawer, DeskTop, BookStack, Laptop, Mug, Notebook, PencilCup, Lamp } from './desk/Desktop.jsx'
import { Rug, Chair, FloorPlant } from './desk/Foreground.jsx'

// 따뜻한 오후의 작업실을 SVG 레이어로 그린 장면입니다(viewBox 1600x900). 외부 이미지 없이 도형과 그라디언트만 씁니다.
// 눌러 볼 수 있는 물건(핫스팟)은 desk/ 아래에서 <Hotspot>으로 감싸며, 호버나 포커스 때 살짝 떠오르고 이름표가 뜹니다.
// 층(back/mid/front)마다 마우스에 다르게 반응합니다(CSS 변수 --px/--py, 스타일은 desk.css).

// 바닥 판자의 이음선
const PLANKS = Array.from({ length: 9 }, (_, i) => <line key={i} x1={-200 + i * 230} y1="812" x2={-260 + i * 250} y2="900" stroke="#b48258" strokeWidth="2" opacity="0.5" />)

export default function DeskScene({ active, setActive, onOpen }) {
  return (
    <DeskContext value={{ active, setActive, onOpen }}>
      <svg className="desk__svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" role="group" aria-label="책상 위의 물건들. 물건을 눌러 내용을 엽니다">
        <Defs />

        <rect width="1600" height="900" fill="url(#d-wall)" />

        {/* 뒷벽 */}
        <g className="desk__layer desk__layer--back">
          <Window />
          <Frames />
          <Shelf />
          <Ivy />
          <SillPots />
          <Bunting />
          <Polaroids />
          <Stickies />
          <Calendar />
        </g>

        {/* 바닥 */}
        <rect x="0" y="796" width="1600" height="104" fill="#d8a776" />
        <rect x="0" y="786" width="1600" height="14" fill="#fff6e3" />
        {PLANKS}

        {/* 책상 */}
        <g className="desk__layer desk__layer--mid">
          <DeskBase />
          <Drawer id="drawerL" mark="star" />
          <Drawer id="drawerR" mark="heart" dx={570} />
          <DeskTop />
          <BookStack />
          <Laptop />
          <Mug />
          <Notebook />
          <PencilCup />
          <Lamp />
        </g>

        {/* 앞쪽: 러그, 의자, 바닥 화분 */}
        <g className="desk__layer desk__layer--front">
          <Rug />
          <Chair />
          <FloorPlant />
        </g>

        <rect width="1600" height="900" fill="url(#d-vig)" pointerEvents="none" />

        <Tags />
      </svg>
    </DeskContext>
  )
}
