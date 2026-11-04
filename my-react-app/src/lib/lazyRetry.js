// 페이지 코드를 늦게 받는 import 를 감쌉니다. 새 버전이 배포된 직후에는 열어 둔 탭이 가진 옛 파일 이름이 사라져
// 받기에 실패할 수 있습니다. 이때 한 번만 새로고침해서 새 버전을 받고, 그래도 안 되면 오류를 그대로 던져
// 화면의 오류 안내(ErrorBoundary)가 보이게 합니다. 성공하면 표시를 지워, 다음 배포 때 다시 한 번 시도할 수 있게 합니다.
const FLAG = 'chunk-retry'

const store = () => {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function lazyRetry(load) {
  return () =>
    load().then(
      (mod) => {
        store()?.removeItem(FLAG)
        return mod
      },
      (err) => {
        const s = store()
        if (s && !s.getItem(FLAG)) {
          s.setItem(FLAG, '1')
          window.location.reload()
          return new Promise(() => {}) // 새로고침되는 동안 기다립니다
        }
        throw err
      },
    )
}
