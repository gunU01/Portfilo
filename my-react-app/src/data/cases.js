import { eolma } from './eolma.js'
import { haemi } from './haemi.js'
import { valueChain } from './valueChain.js'

// 홈 목록과 라우팅에서 쓰는 순서. 얼마 → 해미 → 역기획.
export const cases = [eolma, haemi, valueChain]
