// 케이스마다 주소와 이름, 포인트 색. 홈에서 바로 필요한 가벼운 정보라서 케이스 본문(큰 파일)과 따로 둡니다.
// 각 케이스 파일이 이것을 펼쳐서 쓰므로 한 곳만 고치면 됩니다. accent 는 이 케이스의 포인트 색이고, 없으면 기본 파랑입니다.
export const caseMeta = {
  eolma: { slug: 'howmuch', title: '얼마' },
  haemi: { slug: 'haemi', title: '해미', accent: 'orange' },
  sosang: { slug: 'sosang', title: '오늘한입', accent: 'green' },
  toss: { slug: 'value-chain', title: '토스 BM 분석' },
  tossux: { slug: 'toss-ux', title: '토스 UX 다이어트' },
}

// 홈 목록과 라우팅에서 쓰는 순서와 같습니다(data/cases.js 의 cases 와 같은 순서여야 합니다).
export const caseIndex = [caseMeta.eolma, caseMeta.haemi, caseMeta.sosang, caseMeta.toss, caseMeta.tossux]
