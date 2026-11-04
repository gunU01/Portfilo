// 장면의 각진 도형을 만드는 작은 도구. 좌표는 모두 장면 좌표(viewBox 1600x900)입니다.
// 점 목록([x, y] 배열)을 SVG points 문자열로 바꿉니다.
export const pts = (list) => list.map(([x, y]) => `${x},${y}`).join(' ')

// 가운데 (cx, cy), 반지름 r 의 정육각형(꼭짓점이 위아래). 메달 같은 둥근 물건을 각지게 그릴 때 씁니다.
export const hex = (cx, cy, r) =>
  pts(
    [0, 1, 2, 3, 4, 5].map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2
      return [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]
    }),
  )

// 가시 모양 별(검댕이 고양이의 털). 바깥 반지름 r1, 안쪽 반지름 r2, 뾰족한 곳 n 개.
export const spikes = (cx, cy, r1, r2, n) =>
  pts(
    Array.from({ length: n * 2 }, (_, i) => {
      const r = i % 2 === 0 ? r1 : r2
      const a = (Math.PI / n) * i - Math.PI / 2
      return [Math.round(cx + r * Math.cos(a)), Math.round(cy + r * Math.sin(a))]
    }),
  )
