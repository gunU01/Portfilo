import { createContext } from 'react'

// 장면 안의 핫스팟들이 함께 쓰는 상태: 지금 가리키는 물건(active)과 그 변경/열기 함수.
// showAll: 이름표를 물건마다 모두 보여 주는 중인지(마우스를 올리지 않아도 어떤 물건이 눌리는지 볼 수 있게 하는 켜기/끄기).
export const DeskContext = createContext({ active: null, setActive: () => {}, onOpen: () => {}, showAll: false })
