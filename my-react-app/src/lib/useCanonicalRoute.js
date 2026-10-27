import { useEffect } from 'react'

// 주소를 정리합니다. 주소창에 적힌 경로(typed)가 target 과 다르면(끝의 / 가 붙었거나 없는 경로) target 으로 옮깁니다.
// 같은 화면에서 주소만 바뀌어도(예: #/about 에서 #/about/ 로) typed 가 바뀌므로 다시 확인합니다.
// location.replace 라서 기록에 남지 않아, 뒤로 가기가 같은 자리로 되튕기지 않습니다. keepQuery 이면 ?s= 같은 뒷부분을 그대로 이어 붙입니다.
export function useCanonicalRoute(target, typed, keepQuery) {
  useEffect(() => {
    if (typed === target) return
    const rest = window.location.hash.replace(/^#/, '').split('?').slice(1)
    window.location.replace(`#${target}${keepQuery && rest.length ? `?${rest.join('?')}` : ''}`)
  }, [target, typed, keepQuery])
}
