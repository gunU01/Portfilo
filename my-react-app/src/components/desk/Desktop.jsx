import Hotspot from './Hotspot.jsx'
import { CatBooks, CatPeek, PeekPaws } from './Cats.jsx'
import { pts } from './shapes.js'

// 책상 본체와 그 위의 물건들. 책상 윗면은 정면에서 본 얇은 판(y 596~640)이고, 물건은 모두 y 596 선 위에 놓입니다.

// 몸통과 다리(제일 먼저 그림)
export function DeskBase() {
  return (
    <g>
      <rect x="190" y="640" width="1220" height="150" className="d-p d-o" />
      <rect x="190" y="640" width="1220" height="16" className="d-g" />
      <rect x="190" y="790" width="60" height="110" className="d-w d-o" />
      <rect x="1350" y="790" width="60" height="110" className="d-w d-o" />
    </g>
  )
}

// 서랍(눌러 볼 수 있음). 호버하면 앞판이 조금 앞으로 나옵니다. cx 는 서랍 가운데 x.
export function Drawer({ id, cx }) {
  return (
    <Hotspot id={id}>
      <rect x={cx - 215} y="664" width="430" height="100" fill="#0a0a0a" />
      <g className="desk__drawer">
        <rect x={cx - 215} y="664" width="430" height="100" className="d-w d-o" />
        <rect x={cx - 190} y="680" width="380" height="68" className="d-p d-o3" />
        <rect x={cx - 44} y="706" width="88" height="16" className="d-k" />
      </g>
    </Hotspot>
  )
}

// 윗판(서랍 위에 겹쳐 그림)
export function DeskTop() {
  return (
    <g>
      <rect x="132" y="608" width="1360" height="44" fill="#0a0a0a" />
      <rect x="120" y="596" width="1360" height="44" className="d-w d-o" />
    </g>
  )
}

// 책 더미(누르면 기획물) 위에 앉은 고양이
export function BookStack() {
  return (
    <Hotspot id="books">
      <rect x="262" y="562" width="220" height="34" className="d-k" />
      <path d="M440 572 V586 M452 572 V586 M464 572 V586" stroke="#fff" strokeWidth="3" />
      <rect x="276" y="530" width="196" height="32" className="d-w d-o" />
      <path d="M300 546 H420" stroke="#0a0a0a" strokeWidth="4" />
      <rect x="270" y="500" width="204" height="30" className="d-g d-o" />
      <CatBooks x={372} y={500} />
    </Hotspot>
  )
}

// 노트북(누르면 프로젝트). 화면 위로 고양이가 고개를 내밀고, 호버하면 화면의 카드들이 차례로 튀어 오릅니다.
export function Laptop() {
  const cards = [624, 748, 872]
  return (
    <Hotspot id="laptop">
      <CatPeek x={800} y={400} />
      <rect x="600" y="410" width="420" height="178" fill="#0a0a0a" />
      <rect x="590" y="400" width="420" height="178" className="d-w d-o" />
      <rect x="608" y="418" width="384" height="142" className="d-k" />
      {cards.map((x, i) => (
        <g key={x} className="desk__card" style={{ '--i': i }}>
          <rect x={x} y="436" width="104" height="104" className="d-w" />
          <rect x={x} y="436" width="104" height="26" className={i === 1 ? 'd-g' : 'd-k'} />
          <path d={`M${x + 12} 482 H${x + 80} M${x + 12} 500 H${x + 62} M${x + 12} 518 H${x + 72}`} stroke="#0a0a0a" strokeWidth="4" />
        </g>
      ))}
      <polygon points={pts([[556, 598], [1044, 598], [1016, 578], [584, 578]])} className="d-w d-o" />
      <rect x="760" y="584" width="80" height="8" className="d-k" />
      <PeekPaws x={800} y={400} />
    </Hotspot>
  )
}

// 머그잔(눌리지 않음, 마우스를 올리면 흔들림). 김은 각진 지그재그 선입니다.
export function Mug() {
  return (
    <g className="desk__mug">
      <g className="desk__steam" fill="none" stroke="#0a0a0a" strokeWidth="4" strokeLinejoin="miter">
        <polyline points={pts([[500, 546], [508, 534], [500, 522], [508, 510]])} />
        <polyline className="desk__steam--b" points={pts([[516, 546], [524, 534], [516, 522]])} />
      </g>
      <polygon points={pts([[484, 596], [488, 554], [530, 554], [534, 596]])} className="d-w d-o" />
      <polygon points={pts([[534, 566], [552, 566], [552, 584], [532, 584]])} fill="none" className="d-o" />
      <rect x="488" y="554" width="42" height="10" className="d-k" />
    </g>
  )
}

// 노트(누르면 소개): 세워 둔 검은 표지의 노트와 비스듬히 기댄 연필. 연필은 호버하면 글씨 쓰듯 움직입니다.
export function Notebook() {
  return (
    <Hotspot id="notebook">
      <rect x="1110" y="526" width="150" height="70" fill="#0a0a0a" />
      <rect x="1100" y="516" width="150" height="80" className="d-k d-o" />
      <rect x="1120" y="536" width="104" height="30" className="d-w" />
      <path d="M1130 546 H1204 M1130 556 H1190" stroke="#0a0a0a" strokeWidth="3" />
      <polygon points={pts([[1226, 516], [1244, 516], [1244, 552], [1235, 544], [1226, 552]])} className="d-w" />
      <g className="desk__pencil">
        <polygon points={pts([[1268, 596], [1278, 596], [1320, 530], [1311, 524]])} className="d-w d-o3" />
        <polygon points={pts([[1268, 596], [1278, 596], [1273, 582]])} fill="#0a0a0a" />
      </g>
    </Hotspot>
  )
}

export function PencilCup() {
  return (
    <g>
      <path d="M1346 556 V524 M1358 556 L1366 512 M1370 556 L1384 522" stroke="#0a0a0a" strokeWidth="5" />
      <polygon points={pts([[1336, 596], [1342, 554], [1384, 554], [1390, 596]])} className="d-w d-o" />
    </g>
  )
}

// 각진 관절 스탠드 조명
export function Lamp() {
  return (
    <g>
      <rect x="1408" y="580" width="80" height="16" fill="#0a0a0a" />
      <polyline points={pts([[1448, 580], [1430, 500], [1370, 432]])} fill="none" stroke="#0a0a0a" strokeWidth="10" strokeLinejoin="miter" />
      <rect x="1442" y="572" width="12" height="12" className="d-w d-o3" />
      <rect x="1424" y="494" width="12" height="12" className="d-w d-o3" />
      <polygon points={pts([[1304, 456], [1346, 404], [1410, 424], [1386, 476]])} fill="#0a0a0a" />
      <polygon points={pts([[1322, 448], [1348, 418], [1372, 426]])} className="d-g" />
      <polygon points={pts([[1312, 470], [1330, 482], [1318, 494]])} className="d-w d-o3" />
    </g>
  )
}
