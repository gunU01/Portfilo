import { startTransition, useEffect, useState } from 'react'

function read() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, query = ''] = raw.split('?')
  return { path: path.replace(/\/+$/, '') || '/', section: new URLSearchParams(query).get('s') }
}

// 해시 기반 라우팅: #/ 홈, #/work/<slug> 케이스, ?s=<id> 로 섹션 앵커.
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
