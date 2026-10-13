// 장면 전체가 함께 쓰는 그라디언트와 흐림 필터
export default function Defs() {
  return (
    <defs>
      <linearGradient id="d-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4ebcf" />
        <stop offset="1" stopColor="#ecdcb2" />
      </linearGradient>
      <radialGradient id="d-vig" cx="0.5" cy="0.45" r="0.8">
        <stop offset="0.55" stopColor="#9a8a4a" stopOpacity="0" />
        <stop offset="1" stopColor="#9a8a4a" stopOpacity="0.24" />
      </radialGradient>
      <linearGradient id="d-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2cf98" />
        <stop offset="1" stopColor="#ebbd7e" />
      </linearGradient>
      <linearGradient id="d-under" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6a4a2c" />
        <stop offset="1" stopColor="#93704a" />
      </linearGradient>
      <linearGradient id="d-win" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e6f5cf" />
        <stop offset="0.5" stopColor="#a6d46e" />
        <stop offset="1" stopColor="#62ad4a" />
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
      <filter id="d-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  )
}
