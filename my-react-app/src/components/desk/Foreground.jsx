import { CatHeadphones, CatLying } from './Cats.jsx'
import { pts } from './shapes.js'

// 앞쪽: 러그와 그 위의 헤드폰 고양이와 엎드린 고양이, 의자 등받이, 바닥 화분. 마우스에 가장 크게 반응하는 층입니다.

export function Rug() {
  return (
    <g>
      <polygon points={pts([[330, 896], [1270, 896], [1216, 822], [384, 822]])} className="d-p d-o" />
      <polygon points={pts([[366, 880], [1234, 880], [1196, 836], [404, 836]])} fill="none" className="d-o3" />
      <polygon points={pts([[420, 864], [1180, 864], [1160, 850], [440, 850]])} className="d-g" />
      <CatHeadphones x={500} y={872} />
      <g transform="translate(1085 882) scale(0.8)">
        <CatLying x={0} y={0} />
      </g>
    </g>
  )
}

export function Chair() {
  return (
    <g>
      <polygon points={pts([[660, 906], [670, 780], [930, 780], [940, 906]])} className="d-w d-o" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={700 + i * 32} y="796" width="14" height="96" fill="#0a0a0a" />
      ))}
      <rect x="660" y="772" width="280" height="16" className="d-k" />
    </g>
  )
}

export function FloorPlant() {
  return (
    <g>
      <polygon fill="#0a0a0a" points={pts([[1496, 826], [1440, 740], [1460, 690], [1500, 760], [1510, 662], [1536, 760], [1580, 706], [1560, 800]])} />
      <path d="M1496 820 L1460 700 M1500 820 L1510 672 M1504 820 L1570 716" stroke="#fff" strokeWidth="3" fill="none" />
      <polygon points={pts([[1446, 896], [1558, 896], [1546, 822], [1458, 822]])} className="d-w d-o" />
      <rect x="1458" y="822" width="88" height="14" className="d-k" />
    </g>
  )
}
