import { DeskContext } from './desk/deskContext.js'
import Defs from './desk/Defs.jsx'
import Tags from './desk/Tags.jsx'
import { Window, Frames, Shelf, Calendar } from './desk/Wall.jsx'
import { Ivy, SillPots, Bunting, Polaroids, Stickies } from './desk/WallDecor.jsx'
import { DeskBase, Drawer, DeskTop, BookStack, Laptop, Mug, Notebook, PencilCup, Lamp } from './desk/Desktop.jsx'
import { Floor, UnderDesk, Basket, CatBits } from './desk/Floor.jsx'
import { Rug, Chair, FloorPlant } from './desk/Foreground.jsx'

// 따뜻한 오후의 작업실을 SVG 레이어로 그린 장면입니다(viewBox 1600x900). 외부 이미지 없이 도형과 그라디언트만 씁니다.
// 눌러 볼 수 있는 물건(핫스팟)은 desk/ 아래에서 <Hotspot>으로 감싸며, 호버나 포커스 때 살짝 떠오르고 이름표가 뜹니다.
// 층(back/mid/front)마다 마우스에 다르게 반응합니다(CSS 변수 --px/--py, 스타일은 desk.css).

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

        {/* 바닥과 벽 아랫부분 */}
        <Floor />

        {/* 책상 */}
        <g className="desk__layer desk__layer--mid">
          <UnderDesk />
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
          <CatBits />
          <Basket />
          <Chair />
          <FloorPlant />
        </g>

        <rect width="1600" height="900" fill="url(#d-vig)" pointerEvents="none" />

        <Tags />
      </svg>
    </DeskContext>
  )
}
