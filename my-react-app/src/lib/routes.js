// 주소(해시 경로)를 만들고 읽는 규칙을 한 곳에 모읍니다. 케이스는 #/work/<slug>, 블로그 글은 #/blog/<slug> 입니다.
// 새 종류의 상세 페이지가 생기면 KINDS 에 한 줄을 더하고, 목록 페이지를 PARENT 로 둡니다.
const KINDS = { case: 'work', post: 'blog' }
const PARENT = '/project' // 상세 화면에서 메뉴가 강조하는 곳, 그리고 없는 상세 주소를 돌려보낼 곳

export const caseHref = (slug) => `#/${KINDS.case}/${slug}`
export const postHref = (slug) => `#/${KINDS.post}/${slug}`

// 경로에서 slug 를 읽습니다(해당 종류가 아니면 undefined). kind: 'case' | 'post'
export function slugOf(path, kind) {
  return path.match(new RegExp(`^/${KINDS[kind]}/([\\w-]+)$`))?.[1]
}

// 케이스나 글 같은 상세 경로인지(목록에 있든 없든)
export const isDetailPath = (path) => Object.values(KINDS).some((prefix) => path.startsWith(`/${prefix}/`))

// 메뉴에서 강조할 경로: 상세 화면에서는 목록(Project)이 켜집니다.
export const menuPath = (path) => (isDetailPath(path) ? PARENT : path)

// 없는 경로를 보낼 가까운 곳: 상세 경로는 목록으로, 그 밖에는 홈으로
export const nearestPath = (path) => (isDetailPath(path) ? PARENT : '/')
