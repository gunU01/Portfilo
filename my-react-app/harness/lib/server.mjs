import { spawn } from 'node:child_process'
import net from 'node:net'

const freePort = () =>
  new Promise((resolve, reject) => {
    const s = net.createServer()
    s.once('error', reject)
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address()
      s.close(() => resolve(port))
    })
  })

// 빌드 결과(dist)를 vite preview 로 띄웁니다. 빈 포트를 골라 쓰므로 개발 서버와 부딪히지 않습니다.
export async function startPreview() {
  const port = await freePort()
  const child = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { stdio: 'ignore' })
  const url = `http://127.0.0.1:${port}`
  for (let i = 0; i < 80; i += 1) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => child.kill() }
    } catch {
      /* 아직 안 떴습니다 */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  child.kill()
  throw new Error('vite preview 가 20초 안에 뜨지 않았습니다. 먼저 npm run build 를 했는지 확인하세요.')
}
