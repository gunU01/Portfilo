import { useEffect } from 'react'

// 페이지마다 검색 결과와 링크 미리보기에 쓰이는 설명(<meta name="description">, og:description)을 바꿉니다.
// description 이 없으면 index.html 의 기본값을 그대로 두고, 페이지를 떠나면 기본값으로 되돌립니다.
const SELECTORS = ['meta[name="description"]', 'meta[property="og:description"]']

export function usePageMeta(description) {
  useEffect(() => {
    if (!description) return undefined
    const metas = SELECTORS.map((q) => document.head.querySelector(q)).filter(Boolean)
    const before = metas.map((m) => m.content)
    metas.forEach((m) => {
      m.content = description
    })
    return () => metas.forEach((m, i) => {
      m.content = before[i]
    })
  }, [description])
}
