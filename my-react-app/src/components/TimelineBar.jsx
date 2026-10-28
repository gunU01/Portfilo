import { month } from '../lib/months.js'

// 활동 기록 한 줄의 기간 막대. 전체 기간(bounds) 안에서 이 활동이 놓인 자리를 보여 줍니다. 월은 'YYYY.MM' 문자열입니다.
function place(range, bounds) {
  const total = month(bounds[1]) - month(bounds[0]) + 1
  return { left: `${((month(range[0]) - month(bounds[0])) / total) * 100}%`, width: `${((month(range[1]) - month(range[0]) + 1) / total) * 100}%` }
}

export function TimelineBar({ range, bounds, plan, tone }) {
  return (
    <span className="tl__range" aria-hidden="true">
      <span className={`tl__bar${plan ? ' is-plan' : ''}`} data-tone={tone} style={place(range, bounds)} />
    </span>
  )
}

// 막대들 위의 눈금: 시작 월, 새해, 끝 월
export function TimelineAxis({ bounds }) {
  const total = month(bounds[1]) - month(bounds[0]) + 1
  const newYear = Number(bounds[1].slice(0, 4)) * 12 + 1 // 끝나는 해의 1월
  const at = ((newYear - month(bounds[0])) / total) * 100
  return (
    <div className="tl__axis" aria-hidden="true">
      <span style={{ left: 0 }}>{bounds[0]}</span>
      <span style={{ left: `${at}%` }}>{bounds[1].slice(0, 4)}</span>
      <span style={{ right: 0 }}>{bounds[1]}</span>
    </div>
  )
}
