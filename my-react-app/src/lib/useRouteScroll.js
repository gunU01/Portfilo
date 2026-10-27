import { useEffect, useRef } from 'react'
import { jumpTo, scrollToIdWhenReady, scrollToYWhenReady } from './dom.js'

// 화면을 옮길 때의 스크롤.
// - 새 화면은 맨 위(또는 ?s=<구간>)에서 바로 시작합니다. 전체 스크롤이 부드럽게 설정되어 있어도 위로 훑어 올라가지 않도록 즉시 옮깁니다.
// - 뒤로·앞으로 가기는 그 화면을 떠날 때의 스크롤 위치로 돌아갑니다(예: 목록 → 케이스 → 뒤로 가면 보던 자리).
//   이동 방식은 Navigation API 로 알 수 있고, 지원하지 않는 브라우저에서는 늘 맨 위에서 시작합니다.
export function useRouteScroll(path, section) {
  const saved = useRef(new Map()) // 경로 → 떠날 때의 스크롤 위치
  const here = useRef(path) // 지금 보여 주는 경로
  const how = useRef('push') // 마지막 이동 방식(push, replace, traverse)
  const shown = useRef(null) // 이전에 보여 준 경로(같은 화면 안의 구간 이동인지 알기 위해)

  useEffect(() => {
    const onNavigate = (e) => {
      how.current = e.navigationType
    }
    // 새 화면이 그려지기 전, 아직 이전 화면의 높이일 때 위치를 적어 둡니다
    const onLeave = () => {
      saved.current.set(here.current, window.scrollY)
      // 목차 누르기 같은 부드러운 스크롤이 진행 중이면 그 자리에서 멈춰, 새 화면에서 그 움직임이 이어지지 않게 합니다
      jumpTo(window.scrollY)
    }
    window.navigation?.addEventListener('navigate', onNavigate)
    window.addEventListener('hashchange', onLeave)
    return () => {
      window.navigation?.removeEventListener('navigate', onNavigate)
      window.removeEventListener('hashchange', onLeave)
    }
  }, [])

  useEffect(() => {
    here.current = path
    const samePage = shown.current === path
    shown.current = path
    const back = how.current === 'traverse' ? saved.current.get(path) : undefined
    how.current = 'push'
    if (back !== undefined) return scrollToYWhenReady(back)
    // 같은 화면 안에서 구간만 바뀌면 맨 위로 되돌아갔다 내려가지 않고 그 구간으로 바로 갑니다
    if (section) {
      if (!samePage) jumpTo(0)
      return scrollToIdWhenReady(section)
    }
    jumpTo(0)
    return undefined
  }, [path, section])
}
