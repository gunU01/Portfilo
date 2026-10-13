// 스냅샷 폴더 두 개를 픽셀 단위로 비교합니다. 다른 곳은 <after>/diff 에 빨갛게 표시한 그림으로 남깁니다.
//   npm run snap:diff -- <before> <after> [--max 0.001]   (--max: 다른 픽셀의 허용 비율, 기본 0.0005)
import fs from 'node:fs'
import path from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const [a, b] = process.argv.slice(2).filter((x) => !x.startsWith('--'))
const maxIdx = process.argv.indexOf('--max')
const max = maxIdx >= 0 ? Number(process.argv[maxIdx + 1]) : 0.0005
if (!a || !b) {
  console.error('사용법: npm run snap:diff -- <before 폴더> <after 폴더>')
  process.exit(2)
}
const diffDir = path.join(b, 'diff')
fs.mkdirSync(diffDir, { recursive: true })

let bad = 0
for (const f of fs.readdirSync(a).filter((x) => x.endsWith('.png')).sort()) {
  if (!fs.existsSync(path.join(b, f))) {
    console.log(`없음   ${f}`)
    bad += 1
    continue
  }
  const A = PNG.sync.read(fs.readFileSync(path.join(a, f)))
  const B = PNG.sync.read(fs.readFileSync(path.join(b, f)))
  if (A.width !== B.width || A.height !== B.height) {
    console.log(`크기   ${f}  ${A.width}x${A.height} → ${B.width}x${B.height}`)
    bad += 1
    continue
  }
  const diff = new PNG({ width: A.width, height: A.height })
  const n = pixelmatch(A.data, B.data, diff.data, A.width, A.height, { threshold: 0.1 })
  const ratio = n / (A.width * A.height)
  if (ratio > max) {
    fs.writeFileSync(path.join(diffDir, f), PNG.sync.write(diff))
    console.log(`다름   ${f}  ${n}px (${(ratio * 100).toFixed(3)}%)`)
    bad += 1
  } else if (n) console.log(`같음~  ${f}  ${n}px (허용 범위)`)
}
console.log(bad ? `\n${bad}장이 다릅니다. ${diffDir} 를 보세요.` : '\n모든 화면이 같습니다.')
process.exit(bad ? 1 : 0)
