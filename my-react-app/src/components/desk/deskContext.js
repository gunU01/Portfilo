import { createContext } from 'react'

// 장면 안의 핫스팟들이 함께 쓰는 상태: 지금 가리키는 물건(active)과 그 변경/열기 함수.
export const DeskContext = createContext({ active: null, setActive: () => {}, onOpen: () => {} })
