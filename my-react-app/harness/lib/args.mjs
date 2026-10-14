// 아주 작은 명령줄 해석기: `--이름 값` 은 flags 로, 나머지는 순서대로 positional 로 돌려줍니다.
export function parseArgs(argv = process.argv.slice(2)) {
  const flags = {}
  const positional = []
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) flags[argv[i].slice(2)] = argv[++i]
    else positional.push(argv[i])
  }
  return { flags, positional }
}
