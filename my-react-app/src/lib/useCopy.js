import { useEffect, useState } from 'react'

// 클립보드 복사와 그 결과 표시. copied 는 방금 복사한 항목의 이름(실패하면 `이름:fail`)이고 1.6초 뒤 null 로 돌아갑니다.
// 클립보드는 보안 연결(https)에서만 쓸 수 있어서, 안 되면 실패로 표시합니다.
export function useCopy() {
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (!copied) return undefined
    const id = setTimeout(() => setCopied(null), 1600)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async (name, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(name)
    } catch {
      setCopied(`${name}:fail`)
    }
  }
  return { copied, copy }
}
