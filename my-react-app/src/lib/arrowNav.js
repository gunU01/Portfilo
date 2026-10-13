// 탭 목록 같은 가로 목록의 방향키 이동. 눌린 키에 해당하는 다음 위치를 돌려주고, 관련 없는 키면 undefined 입니다.
// 양 끝에서는 반대쪽 끝으로 이어집니다.
export function arrowTarget(key, index, length) {
  const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: length - 1 }[key]
  return target === undefined ? undefined : (target + length) % length
}
