import { eolma } from './eolma.js'
import { haemi } from './haemi.js'
import { sosang } from './sosang.js'
import { toss } from './toss.js'

// 홈 목록과 라우팅에서 쓰는 순서. 얼마 → 해미 → 동네 사장님 5분 홍보(개인 기획) → 토스 BM 분석.
export const cases = [eolma, haemi, sosang, toss]
