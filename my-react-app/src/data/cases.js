import { eolma } from './eolma.js'
import { haemi } from './haemi.js'
import { sosang } from './sosang.js'
import { toss } from './toss.js'
import { tossux } from './tossux.js'

// 홈 목록과 라우팅에서 쓰는 순서. 얼마 → 해미 → 오늘한입(개인 기획) → 토스 BM 분석 → 토스 UX 다이어트(그 분석에서 이어진 제안).
export const cases = [eolma, haemi, sosang, toss, tossux]
