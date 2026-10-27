import { Fragment } from 'react'

// **굵게** 와 [글자](주소) 링크만 지원하는 아주 작은 인라인 마크업.
// 주소가 #/ 로 시작하면 이 사이트 안의 페이지, https:// 로 시작하면 새 탭으로 엽니다.
const TOKEN = /(\*\*.+?\*\*|\[[^\]]+\]\((?:#\/|https:\/\/)[^)\s]+\))/g
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/

export default function Rich({ text }) {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    const link = part.match(LINK)
    if (link) {
      const external = link[2].startsWith('https://')
      return (
        <a key={i} className="xlink ink" href={link[2]} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {link[1]}
        </a>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}
