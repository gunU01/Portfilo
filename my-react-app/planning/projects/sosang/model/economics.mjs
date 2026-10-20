// 수익성 감을 잡기 위한 민감도 계산입니다. 입력값은 모두 검증 전이며, 결과는 '이 가정이면 이렇게 된다'일 뿐 예측이 아닙니다.
// basis: notion = 팀 노션 문서의 값, assumption = 검증 전 가정, verified = 근거로 확인한 값
export const economics = {
  params: [
    { key: 'price', label: '월 이용료 시안(사장님 플랜)', value: 19000, unit: '원', basis: 'notion', note: 'E-04. 근거 없는 시안(D-05)' },
    { key: 'priceMax', label: '월 이용료 시안(단골관리 플랜)', value: 39000, unit: '원', basis: 'notion', note: 'E-04. 이탈 감지는 later 기능이라 MVP 에는 없다' },
    { key: 'churnLow', label: '월 해지율 시나리오(낮음)', value: 0.05, unit: '', basis: 'notion', note: 'E-02 의 대행형 전환 기준값' },
    { key: 'churnMid', label: '월 해지율 시나리오(중간)', value: 0.1, unit: '', basis: 'assumption', note: '비교용 가정' },
    { key: 'churnHigh', label: '월 해지율 시나리오(높음)', value: 0.15, unit: '', basis: 'assumption', note: '비교용 가정' },
    { key: 'grossMargin', label: '매출총이익률', value: null, unit: '', basis: 'assumption', note: 'AI 생성 비용과 알림 비용을 확인하기 전에는 정할 수 없다' },
    { key: 'cac', label: '고객 1곳을 얻는 비용', value: null, unit: '원', basis: 'assumption', note: 'T-03 랜딩 결과와 T-05 경로 비용을 본 뒤 정한다' },
  ],
}
