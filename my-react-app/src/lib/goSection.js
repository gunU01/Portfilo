// 홈의 섹션으로 이동. 이미 홈이면 바로 스크롤하고, 케이스 페이지에서는 홈으로 이동한 뒤 스크롤합니다.
export function goHomeSection(id) {
  const path = window.location.hash.replace(/^#/, '').split('?')[0]
  if (path === '' || path === '/') {
    document.getElementById(id)?.scrollIntoView()
  } else {
    window.location.hash = `/?s=${id}`
  }
}
