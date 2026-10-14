// 장면 전체가 함께 쓰는 그라디언트와 클리핑 영역
export default function Defs() {
  return (
    <defs>
      <linearGradient id="d-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3d9" />
        <stop offset="1" stopColor="#fde6bd" />
      </linearGradient>
      <radialGradient id="d-vig" cx="0.5" cy="0.45" r="0.8">
        <stop offset="0.6" stopColor="#e0a56c" stopOpacity="0" />
        <stop offset="1" stopColor="#e0a56c" stopOpacity="0.16" />
      </radialGradient>
      <linearGradient id="d-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2cf98" />
        <stop offset="1" stopColor="#ebbd7e" />
      </linearGradient>
      <linearGradient id="d-under" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7d5232" />
        <stop offset="1" stopColor="#a67a4e" />
      </linearGradient>
      <linearGradient id="d-beam" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stopColor="#fff6cf" stopOpacity="0.34" />
        <stop offset="1" stopColor="#fff6cf" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="d-shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9cc986" />
        <stop offset="0.5" stopColor="#b9dca3" />
        <stop offset="1" stopColor="#93bf7e" />
      </linearGradient>
      <linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9fd8ff" />
        <stop offset="1" stopColor="#e4f6ff" />
      </linearGradient>
      <clipPath id="d-view">
        <rect x="104" y="84" width="356" height="316" />
      </clipPath>
    </defs>
  )
}
