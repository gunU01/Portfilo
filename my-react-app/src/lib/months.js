// 'YYYY.MM' 문자열의 월을 비교 가능한 숫자로 바꿉니다.
export const month = (s) => {
  const [y, m] = s.split('.').map(Number)
  return y * 12 + m
}

// 항목들의 range([시작, 끝])를 모아 가장 이른 월과 가장 늦은 월을 돌려줍니다.
export function boundsOf(items) {
  const all = items.flatMap((t) => t.range ?? [])
  return [all.reduce((a, b) => (month(a) <= month(b) ? a : b)), all.reduce((a, b) => (month(a) >= month(b) ? a : b))]
}
