import { useEffect } from 'react'

// 주소를 정리합니다. 지금 주소의 경로가 target 과 다르면(끝의 / 가 붙었거나 없는 경로) target 으로 옮깁니다.
// location.replace 라서 기록에 남지 않아, 뒤로 가기가 같은 자리로 되튕기지 않습니다. keepQuery 이면 ?s= 같은 뒷부분을 그대로 이어 붙입니다.
export function useCanonicalRoute(target, keepQuery) {
  useEffect(() => {
    const [rawPath, ...rest] = window.location.hash.replace(/^#/, '').split('?')
    if (rawPath === target) return
    window.location.replace(`#${target}${keepQuery && rest.length ? `?${rest.join('?')}` : ''}`)
  }, [target, keepQuery])
}
