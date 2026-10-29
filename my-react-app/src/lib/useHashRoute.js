import { startTransition, useEffect, useState } from 'react'

// 이 경로 읽기(# 뒤, ? 앞, 끝의 / 제거)는 harness/lib/site.mjs 의 ready() 가 같은 규칙으로 따라 읽습니다. 바꾸면 그쪽도 같이 고치세요.
function read() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [typed, query = ''] = raw.split('?')
  // typed 는 주소창에 적힌 그대로의 경로(끝의 / 포함)입니다. 주소 정리(useCanonicalRoute)가 씁니다.
  return { path: typed.replace(/\/+$/, '') || '/', typed, query, section: new URLSearchParams(query).get('s') }
}

// 해시 기반 라우팅: #/ 홈, #/work/<slug> 케이스, #/blog/<slug> 블로그 글, ?s=<id> 로 섹션 앵커.
// 정적 호스팅(GitHub Pages 등)에서도 새로고침이 깨지지 않습니다. 끝의 / 는 없는 것으로 읽습니다.
// 경로가 바뀔 때는 transition 으로 알려, 다음 페이지 코드를 받는 동안 지금 화면이 그대로 남고(빈 화면이 끼지 않고) 준비되면 한 번에 바뀝니다.
export function useHashRoute() {
  const [route, setRoute] = useState(read)

  useEffect(() => {
    const onChange = () => startTransition(() => setRoute(read()))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
