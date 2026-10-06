import { useEffect, useState } from 'react'

function read() {
  const raw = window.location.hash.replace(/^#/, '') || '/'
  const [path, query = ''] = raw.split('?')
  return { path: path || '/', section: new URLSearchParams(query).get('s') }
}

// 해시 기반 라우팅: #/ 홈, #/work/<slug> 케이스, ?s=<id> 로 섹션 앵커.
// 정적 호스팅(GitHub Pages 등)에서도 새로고침이 깨지지 않습니다.
export function useHashRoute() {
  const [route, setRoute] = useState(read)

  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
