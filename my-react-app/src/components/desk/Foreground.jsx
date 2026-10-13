// 앞쪽 바닥 층: 러그, 의자, 바닥 화분
import Fern from './Fern.jsx'

// 바닥의 동그란 러그
export function Rug() {
  return (
    <g>
      <ellipse cx="800" cy="884" rx="400" ry="40" fill="#ee9c78" />
      <ellipse cx="800" cy="884" rx="352" ry="32" fill="#fdf0d6" />
      <ellipse cx="800" cy="884" rx="304" ry="26" fill="#7fc9a6" />
      <ellipse cx="800" cy="884" rx="256" ry="20" fill="#fdf0d6" />
      <ellipse cx="800" cy="884" rx="208" ry="15" fill="#ffd27a" />
    </g>
  )
}

export function Chair() {
  return (
    <>
      <path d="M806 900 C792 812 820 774 892 764 L1118 746 C1170 744 1196 786 1180 900Z" fill="#7a583a" />
      {Array.from({ length: 15 }).map((_, i) => {
        const x = 826 + i * 23.5
        const top = 770 - Math.sin(((x - 810) / 380) * Math.PI) * 18
        return <line key={i} x1={x} y1={top + 4} x2={x + (x - 995) * 0.03} y2="900" stroke="#dba96c" strokeWidth="7" strokeLinecap="round" />
      })}
      <path d="M806 896 C792 812 820 774 892 764 L1118 746 C1170 744 1196 786 1180 896" fill="none" stroke="#ecc794" strokeWidth="16" strokeLinecap="round" />
      <path d="M806 836 C830 820 860 812 892 806 M1180 836 C1160 820 1140 812 1110 806" fill="none" stroke="#ecc794" strokeWidth="10" strokeLinecap="round" />
    </>
  )
}

export function FloorPlant() {
  return (
      <g>
        <Fern x={78} y={730} scale={0.95} fronds={11} spread={150} len={170} />
        <path d="M34 726 H124 L116 842 H42Z" fill="#f4ead2" />
        <rect x="28" y="716" width="102" height="16" rx="5" fill="#fbf4e3" />
        <ellipse cx="78" cy="846" rx="52" ry="8" fill="#5a3b24" opacity="0.4" />
      </g>
  )
}
