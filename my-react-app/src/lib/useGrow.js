import { useEffect } from 'react'
import { observeOnce } from './observeOnce.js'

// 막대 도식(.chart)이 화면에 들어오면 is-in 을 붙여 막대가 왼쪽부터 차오르게 합니다. 모션 줄이기 설정에서는 처음부터 채워 둡니다.
// 접힌 항목 안의 도식은 펼쳐져 보이는 때에 맞춰 차오릅니다.
export function useGrow() {
  useEffect(() => observeOnce([...document.querySelectorAll('.chart')], 'is-in', { threshold: 0.3 }), [])
}
