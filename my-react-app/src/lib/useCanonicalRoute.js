import { useEffect } from 'react'

// 주소를 정리합니다. 주소창에 적힌 경로(typed)가 target 과 다르면(끝의 / 가 붙었거나 없는 경로) target 으로 옮기고,
// query(?s= 같은 뒷부분)는 있으면 그대로 이어 붙입니다. 값은 모두 라우트 상태(useHashRoute)에서 받으므로 빠르게 옮겨 다녀도 서로 어긋나지 않습니다.
// 같은 화면에서 주소만 바뀌어도(예: #/about 에서 #/about/ 로) typed 가 바뀌므로 다시 확인합니다.
// location.replace 라서 기록에 남지 않아, 뒤로 가기가 같은 자리로 되튕기지 않습니다.
export function useCanonicalRoute(target, typed, query) {
  useEffect(() => {
    if (typed !== target) window.location.replace(`#${target}${query ? `?${query}` : ''}`)
  }, [target, typed, query])
}
