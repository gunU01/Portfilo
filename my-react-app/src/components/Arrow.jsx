// 사이트의 모든 화살표(←, →, ↗, ↓, ↑)는 이 한 가지 모양을 돌려서 씁니다. 모양은 styles/base.css 의 --arw 에 한 번만 있고, 글자색(currentColor)을 따라갑니다.
// dir: 'left' | 'right' | 'up-right' | 'down' | 'up'
export default function Arrow({ dir = 'right' }) {
  return <span className={`arw arw--${dir}`} aria-hidden="true" />
}
