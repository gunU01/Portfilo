// 바닥과 책상 밑. 바닥은 옅은 종이색에 빗금, 책상 밑은 망점으로 어둡게 합니다.
export function Floor() {
  return (
    <g>
      <rect x="0" y="690" width="1600" height="210" fill="#e3e2d9" />
      <rect x="0" y="690" width="1600" height="210" fill="url(#d-hatch)" opacity="0.14" />
      <rect x="0" y="682" width="1600" height="12" fill="#0a0a0a" />
    </g>
  )
}

export function UnderDesk() {
  return (
    <g>
      <rect x="250" y="790" width="1100" height="110" className="d-w" />
      <rect x="250" y="790" width="1100" height="110" className="d-g" />
      <rect x="250" y="790" width="1100" height="10" className="d-k" />
    </g>
  )
}
