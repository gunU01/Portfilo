// 기술·도구는 ‘무엇을 할 수 있는가’를 기준으로 적습니다. 특정 서비스의 경험처럼 쓰지 않습니다.
// 묶음(skillGroups)은 일하는 순서를 따라 이어 붙인 도식이고, 항목 순서가 곧 순서입니다.
// 항목의 tools 는 그 단계에서 쓴 도구(skillTools 의 name)입니다. 근거가 있는 연결만 적습니다.
export const skillGroups = [
  {
    title: '기획·문서',
    view: 'process',
    items: [
      { name: '문제 정의 · 요구사항 명세', tools: ['Notion'], used: '문제를 정의하고 요구사항을 명세서로 정리할 수 있습니다. 팀의 피드백을 받아 세부 기능과 BM 설계를 보강하며 문서를 발전시킵니다.' },
      { name: '경쟁·BM 분석', used: '유사한 서비스(그룹 정산, 예산 관리 등)를 기준을 세워 비교하고, 그 결과를 BM 설계에 반영할 수 있습니다.' },
      { name: '기능 명세', tools: ['Figma'], used: '기능 ID 체계로 구조를 맞추고, 액터, 용어 및 삭제할 기능을 정비하며 버전별 기능 명세를 작성할 수 있습니다.' },
      { name: '유저 플로우 · IA', used: '유저 플로우 차트를 그리고 정보 구조를 설계해 기능 명세와 맞출 수 있습니다.' },
    ],
  },
  {
    title: '운영·검증',
    view: 'process',
    items: [
      { name: '스프린트 · MVP', tools: ['Notion'], used: 'MVP 범위를 정하고 스프린트 일정과 역할 분담을 정리할 수 있습니다.' },
      { name: '일정 관리', used: 'WBS, 간트차트, CPM/PERT로 프로젝트 일정을 관리할 수 있습니다.' },
      { name: '베타 테스트', used: '베타 테스트 체크리스트와 참여 설문, 스토어 등록 정보를 작성할 수 있습니다.' },
    ],
  },
  {
    title: '개발·배포',
    view: 'process',
    items: [
      { name: '프론트엔드 개발', tools: ['React', 'React Native · Expo'], used: '컴포넌트를 나눠 화면을 구성하고, TanStack Query로 서버 상태를 관리할 수 있습니다. React Native와 Expo로 앱 화면도 만들며, Zustand, React Hook Form, Zod를 함께 사용합니다.' },
      { name: '협업 · 배포', tools: ['GitHub', 'Vercel', 'Jira'], used: 'Git 및 GitHub로 협업하고 Vercel로 웹 서비스를 배포할 수 있으며, Jira를 사용해 본 경험이 있습니다.' },
    ],
  },
]

// 도구 하나하나의 설명. 도구를 누르면 이 설명이 나오고, 그 도구를 쓴 단계가 켜집니다.
export const skillTools = [
  { name: 'Notion', used: '문서 허브와 스프린트 보드(보드 및 캘린더)를 구성해 운영할 수 있습니다.' },
  { name: 'Figma', used: '화면 정의서를 보며 기능 명세와 화면이 서로 맞는지 검토할 수 있습니다.' },
  { name: 'GitHub', used: 'Git 및 GitHub로 협업할 수 있습니다.' },
  { name: 'Vercel', used: 'Vercel로 웹 서비스를 배포할 수 있습니다.' },
  { name: 'Jira', used: 'Jira를 사용해 본 경험이 있습니다.' },
  { name: 'React', used: '컴포넌트를 나눠 화면을 구성하고, TanStack Query로 서버 상태를 관리할 수 있습니다.' },
  { name: 'React Native · Expo', used: 'React Native와 Expo로 앱 화면을 만들 수 있으며, Zustand, TanStack Query, React Hook Form, Zod를 함께 사용합니다.' },
]
