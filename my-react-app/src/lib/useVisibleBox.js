import { useEffect, useState } from 'react'

// preserveAspectRatio="xMidYMax slice" 인 SVG 가 화면 비율 때문에 잘릴 때, 실제로 보이는 영역을 SVG 좌표(viewBox 기준)로 돌려줍니다.
// slice 는 비율을 유지한 채 꽉 채우므로 한쪽이 잘립니다: 가로가 넓은 화면은 위쪽(yMax 라서 아래는 붙음)이, 좁은 화면은 좌우가 같은 양(xMid)씩 잘립니다.
// ref 는 SVG 안의 아무 요소(또는 SVG 자신)에 답니다. 크기를 읽기 전에는 null 입니다.
export function useVisibleBox(ref) {
  const [box, setBox] = useState(null)

  useEffect(() => {
    const node = ref.current
    const svg = node?.ownerSVGElement ?? node
    if (!svg) return undefined
    const update = () => {
      const vb = svg.viewBox.baseVal
      const { width, height } = svg.getBoundingClientRect()
      if (!width || !height || !vb.width) return
      const scale = Math.max(width / vb.width, height / vb.height)
      const seenW = width / scale
      const seenH = height / scale
      setBox({ left: (vb.width - seenW) / 2, right: (vb.width + seenW) / 2, top: vb.height - seenH })
    }
    const observer = new ResizeObserver(update)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [ref])

  return box
}
