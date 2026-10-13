// 고사리 잎: 곡선 줄기에 작은 잎을 양쪽으로 달아 줍니다.
export default function Fern({ x, y, scale = 1, fronds = 11, spread = 150, len = 150, dark = '#4aa03c', light = '#93d35e' }) {
  const out = []
  for (let i = 0; i < fronds; i += 1) {
    const f = i / (fronds - 1)
    const a = ((-spread / 2 + f * spread) * Math.PI) / 180
    const l = len * (0.72 + 0.28 * Math.sin(i * 2.3 + 1))
    const ex = Math.sin(a) * l
    const ey = -Math.cos(a) * l * 0.92 + Math.abs(Math.sin(a)) * l * 0.28
    const cx = Math.sin(a) * l * 0.3
    const cy = -Math.cos(a) * l * 0.85
    out.push(<path key={`s${i}`} d={`M0 0 Q${cx} ${cy} ${ex} ${ey}`} stroke={dark} strokeWidth="3" fill="none" strokeLinecap="round" />)
    for (let k = 1; k <= 9; k += 1) {
      const t = 0.18 + k * 0.088
      const px = 2 * (1 - t) * t * cx + t * t * ex
      const py = 2 * (1 - t) * t * cy + t * t * ey
      const tx = 2 * (1 - t) * cx + 2 * t * (ex - cx)
      const ty = 2 * (1 - t) * cy + 2 * t * (ey - cy)
      const ang = (Math.atan2(ty, tx) * 180) / Math.PI
      const size = (1 - t) * 15 + 5
      for (const side of [-1, 1]) {
        out.push(<ellipse key={`${i}-${k}-${side}`} cx={px} cy={py} rx={size} ry={3.1} transform={`rotate(${ang + side * 62} ${px} ${py})`} fill={(i + k) % 2 ? light : dark} />)
      }
    }
  }
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>{out}</g>
}
