export const assumptions = [
  { id: 'A-01', statement: '요식업 사장님 10명을 인터뷰할 경로(가게 방문, 지인 소개)를 구할 수 있다.', riskIfWrong: '표본이 모이지 않거나 아는 가게에 치우쳐 결과를 일반화할 수 없다.', test: ['T-05'], status: 'open' },
  { id: 'A-02', statement: '가게 정보 세 가지만으로 만든 문구를 사장님이 조금만 고쳐 쓸 수 있는 수준이다.', riskIfWrong: '문구를 다시 쓰게 되면 사장님의 시간을 줄여 준다는 가치가 사라진다.', test: ['T-02'], status: 'open' },
  { id: 'A-03', statement: '사장님이 알림을 가장 잘 보는 채널을 알고 있다(앱 푸시인지, 카카오톡인지).', riskIfWrong: '알림이 닿지 않아 수행률이 낮게 나오고, 원인을 문제로 잘못 해석한다.', test: ['T-01'], status: 'open' },
  { id: 'A-04', statement: '인스타그램·카카오 채널·스마트플레이스에 외부에서 게시를 올릴 수 있는 범위와 정책을 알고 있다.', riskIfWrong: '자동 발행 기능(F-07)을 만들 수 없거나 정책에 걸린다.', test: ['T-04'], status: 'open' },
  { id: 'A-05', statement: '사장님은 월 19,000원 안팎의 이용료를 실제로 낸다.', riskIfWrong: '사업성이 없다(X-01).', test: ['T-02', 'T-03'], status: 'open' },
  { id: 'A-06', statement: '첫 2주 안에 사장님이 체감할 수 있는 결과를 보여 줄 수 있다.', riskIfWrong: '효과가 늦게 나타나는 구조에서 중간에 해지한다(X-02).', test: ['T-02'], status: 'open' },
]
