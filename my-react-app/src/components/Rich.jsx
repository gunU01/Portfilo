import { Fragment } from 'react'

// **굵게** 만 지원하는 아주 작은 인라인 마크업.
export default function Rich({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  )
}
