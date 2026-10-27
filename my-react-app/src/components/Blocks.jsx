import { Callout, List, Paragraph, Quote, Subheading } from './blocks/text.jsx'
import { Chart, Flow, Goals, Readout, Stats, Table, Timeline } from './blocks/data.jsx'
import { BeforeAfter, Decisions, Roles } from './blocks/compare.jsx'
import { Figure, Gallery } from './blocks/media.jsx'

// 케이스 본문의 블록을 타입별로 그립니다. 타입마다의 모양은 components/blocks/ 에 있고, 여기서는 타입 → 그림을 이어 줍니다.
// 새 타입은 blocks/ 에 컴포넌트를 만들고 아래 switch 에 한 줄을 더하면 됩니다.
const WIDE_TYPES = new Set(['table', 'stats', 'chart', 'toggle', 'readout', 'goals', 'figure', 'gallery'])

function Block({ block: b }) {
  switch (b.type) {
    case 'p':
      return <Paragraph text={b.text} />
    case 'list':
      return <List items={b.items} />
    case 'quote':
      return <Quote text={b.text} cite={b.cite} />
    case 'callout':
      return <Callout tone={b.tone} title={b.title} text={b.text} points={b.points} />
    case 'h3':
      return <Subheading text={b.text} />
    case 'stats':
      return <Stats columns={b.columns} compact={b.compact} items={b.items} />
    case 'goals':
      return <Goals groups={b.groups} />
    case 'readout':
      return <Readout says={b.says} silent={b.silent} />
    case 'chart':
      return <Chart groups={b.groups} unit={b.unit} source={b.source} />
    case 'table':
      return <Table head={b.head} rows={b.rows} idColumn={b.idColumn} />
    case 'timeline':
      return <Timeline items={b.items} />
    case 'flow':
      return <Flow steps={b.steps} />
    case 'beforeAfter':
      return <BeforeAfter before={b.before} after={b.after} />
    case 'decisions':
      return <Decisions items={b.items} />
    case 'roles':
      return <Roles role={b.role} responsibilities={b.responsibilities} results={b.results} />
    case 'figure':
      return <Figure src={b.src} alt={b.alt} caption={b.caption} dark={b.dark} />
    case 'gallery':
      return <Gallery cols={b.cols} items={b.items} />
    case 'toggle':
      // 접이식 안에 다른 블록이 들어가므로 이 파일에서 직접 이어 붙입니다(자기 자신을 다시 그림)
      return (
        <details className="tg">
          <summary>{b.title}</summary>
          <div className="tg__body">
            {b.blocks.map((inner, i) => (
              <Block key={i} block={inner} />
            ))}
          </div>
        </details>
      )
    default:
      return null
  }
}

export default function Blocks({ blocks }) {
  const wide = blocks.some((b) => WIDE_TYPES.has(b.type))
  return (
    <div className={wide ? 'blocks blocks--wide' : 'blocks'}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
