// 화면 모드(라이트/다크). 선택은 localStorage 에 저장하고, 저장된 값이 없으면 기기 설정을 따릅니다.
// 저장소를 못 쓰는 환경(사생활 보호 모드 등)에서도 동작하도록 모든 접근을 try/catch 로 감쌉니다.
const KEY = 'portfolio-theme'

export function readTheme() {
  try {
    const saved = window.localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* 저장소 접근 불가 */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0c1424' : '#ffffff')
}

export function saveTheme(theme) {
  try {
    window.localStorage.setItem(KEY, theme)
  } catch {
    /* 저장소 접근 불가 */
  }
}
