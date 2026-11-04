// 장면 전체가 함께 쓰는 무늬(망점, 빗금)와 창문 영역. 흑백 만화처럼 색 대신 점의 크기로 명암을 냅니다.
export default function Defs() {
  return (
    <defs>
      <pattern id="d-dots" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="6" r="2.4" fill="#0a0a0a" />
      </pattern>
      <pattern id="d-dots-fine" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.2" fill="#0a0a0a" />
      </pattern>
      <pattern id="d-hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="16" height="16" fill="#f4f3ea" />
        <rect width="4" height="16" fill="#0a0a0a" />
      </pattern>
      <radialGradient id="d-glow">
        <stop offset="0" stopColor="#0038ff" stopOpacity="0.32" />
        <stop offset="0.55" stopColor="#0038ff" stopOpacity="0.12" />
        <stop offset="1" stopColor="#0038ff" stopOpacity="0" />
      </radialGradient>
      <clipPath id="d-view">
        <rect x="84" y="114" width="292" height="282" />
      </clipPath>
    </defs>
  )
}
