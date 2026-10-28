import { useEffect } from 'react'

// 페이지마다 포인트 색을 바꿉니다. <html data-accent="orange"> 이면 styles/base.css 의 [data-accent] 규칙이
// --accent 계열 변수를 덮어써서 메뉴, 링크, 칩, 진행선까지 한꺼번에 그 색이 됩니다. 값이 없으면 기본(파랑)입니다.
export function useAccent(accent) {
  useEffect(() => {
    const root = document.documentElement
    if (accent) root.dataset.accent = accent
    else delete root.dataset.accent
    return () => {
      delete root.dataset.accent
    }
  }, [accent])
}
