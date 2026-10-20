export const kpis = [
  { id: 'K-01', name: '활성화율', definition: '가게 등록을 시작한 사장님 중 24시간 안에 첫 홍보 문구를 만든 비율', target: '미정(컨시어지 결과를 본 뒤 정한다)', targetBasis: 'tbd', hypotheses: ['H-04'] },
  { id: 'K-02', name: '주간 수행률', definition: '주간 완료한 할 일 수 ÷ 전달한 할 일 수', target: '50% 이상', targetBasis: 'benchmark', evidence: ['E-02'], hypotheses: ['H-04'] },
  { id: 'K-03', name: '4주 유지율', definition: '가입 후 4주차에도 할 일을 한 번 이상 완료한 사장님의 비율', target: '미정', targetBasis: 'tbd', hypotheses: ['H-04'] },
  { id: 'K-04', name: '유료 전환 행동률', definition: '컨시어지 참여 가게 중 2주 뒤 입금·신청으로 유료 전환을 표시한 가게의 비율', target: '5곳 중 2곳 이상', targetBasis: 'assumption', hypotheses: ['H-06'] },
  { id: 'K-05', name: '인터뷰 수락률', definition: '인터뷰를 요청한 사장님 중 수락한 비율', target: '20% 이상', targetBasis: 'benchmark', evidence: ['E-05'], hypotheses: ['H-07'] },
  { id: 'K-06', name: '랜딩 사전 신청 전환율', definition: '랜딩 방문자 중 사전 신청까지 한 비율', target: '10% 이상', targetBasis: 'benchmark', evidence: ['E-05'], hypotheses: ['H-06'] },
  { id: 'K-07', name: '월 해지율', definition: '월초 유료 사용자 중 그 달 안에 해지한 비율', target: '5% 미만(5% 이상이면 대행형 전환 검토)', targetBasis: 'benchmark', evidence: ['E-02'], hypotheses: ['H-06'] },
  { id: 'K-08', name: '수집하는 손님 개인정보 항목 수', definition: 'MVP 가 수집하는 손님(가게 이용자) 개인정보 항목의 개수', target: '0개', targetBasis: 'assumption', hypotheses: [] },
]
