// 월드의 간단한 물리 엔진. 외부 라이브러리 없이 기둥(원기둥)과 구체만 다룹니다.
// - 모든 개체는 구체이고, y는 발밑(바닥에 닿는 점) 높이입니다.
// - 세계의 단단한 것(나무, 울타리, 건물, 받침대)은 원기둥 { x, z, r, top }으로 표현합니다.
// - 낮은 단차는 걸어서 오르고(stepMax), 높은 것은 막히거나 위로 뛰어 올라탈 수 있습니다.
// - 슬라임: 가속과 마찰, 자동 통통 뛰기, 점프(공중에서는 다시 뛸 수 없습니다), 착지 충격, 버섯 트램펄린.
// - 공: 중력, 반발, 구름 마찰, 서로와 슬라임, 기둥과의 충돌. 울타리 밖으로는 나가지 못합니다.

export const GRAVITY = -32
const SUB_DT = 1 / 120

const HOP_V = 7.4
const JUMP_V = 14.5
const SPEED = 7.6
const SLIME_STEP = 0.46
const BALL_STEP = 0.26

export function createPhysics({ columns, islandR, bound, ballBound, spawn }) {
  const events = []

  const slime = {
    x: spawn.x, y: 0, z: spawn.z,
    vx: 0, vy: 0, vz: 0,
    r: 0.85,
    mass: 4,
    grounded: true,
    coyote: 0,
    jumps: 1,
    hopCd: 0,
    airTime: 0,
    stuck: 0,
  }
  const balls = []

  // 발 아래의 바닥(가장 높은 받침)을 찾습니다.
  function groundAt(x, z, y) {
    let h = x * x + z * z < islandR * islandR ? 0 : -Infinity
    let col = null
    for (const c of columns) {
      if (!c.stand) continue
      const dx = x - c.x
      const dz = z - c.z
      if (dx * dx + dz * dz < c.r * c.r && c.top <= y + 0.5 && c.top > h) {
        h = c.top
        col = c
      }
    }
    return { h, col }
  }

  // 옆에서 부딪히는 기둥에서 밀어내고, 속도를 반사합니다.
  function pushOut(e, stepMax, rest) {
    for (const c of columns) {
      if (e.y >= c.top - stepMax) continue
      const dx = e.x - c.x
      const dz = e.z - c.z
      const rr = c.r + e.r
      const d2 = dx * dx + dz * dz
      if (d2 >= rr * rr) continue
      const d = Math.sqrt(d2) || 0.0001
      const nx = dx / d
      const nz = dz / d
      e.x = c.x + nx * rr
      e.z = c.z + nz * rr
      const vn = e.vx * nx + e.vz * nz
      if (vn < 0) {
        e.vx -= (1 + rest) * vn * nx
        e.vz -= (1 + rest) * vn * nz
        if (c.onHit && -vn > 1.2) c.onHit(nx, nz, -vn)
        if (e.ball && -vn > 2) events.push({ type: 'knock', x: e.x, y: e.y, z: e.z, power: -vn })
      }
    }
  }

  function addBall(x, z, r, color) {
    const b = { ball: true, x, y: 3 + Math.random() * 2, z, vx: 0, vy: 0, vz: 0, r, mass: r * r * r * 8, grounded: false, home: { x, z }, color, spinX: 0, spinZ: 0 }
    balls.push(b)
    return b
  }

  function jump() {
    if (slime.coyote > 0 || slime.grounded) {
      slime.vy = JUMP_V
      slime.grounded = false
      slime.coyote = 0
      slime.jumps = 1
      events.push({ type: 'jump', x: slime.x, y: slime.y, z: slime.z })
    }
  }

  function stepSlime(dt, ix, iz, mag) {
    const s = slime
    // 수평 가속: 땅에서는 빠르게 따라가고, 공중에서는 천천히 조절합니다.
    const tx = ix * SPEED * mag
    const tz = iz * SPEED * mag
    const accel = (s.grounded ? 70 : 24) * dt
    if (mag > 0.05) {
      const dx = tx - s.vx
      const dz = tz - s.vz
      const dl = Math.hypot(dx, dz) || 1
      const k = Math.min(1, accel / dl)
      s.vx += dx * k
      s.vz += dz * k
    } else if (s.grounded) {
      const f = Math.exp(-9 * dt)
      s.vx *= f
      s.vz *= f
    } else {
      const f = Math.exp(-0.6 * dt)
      s.vx *= f
      s.vz *= f
    }

    s.hopCd -= dt
    s.coyote -= dt
    if (s.grounded && mag > 0.15 && s.hopCd <= 0) {
      s.vy = HOP_V
      s.grounded = false
      events.push({ type: 'hop', x: s.x, y: s.y, z: s.z })
    }

    s.vy += GRAVITY * dt
    s.x += s.vx * dt
    s.z += s.vz * dt
    s.y += s.vy * dt

    pushOut(s, SLIME_STEP, 0.4)

    // 울타리 안쪽의 보이지 않는 벽(말랑하게 튕김)
    const rad = Math.hypot(s.x, s.z)
    if (rad > bound) {
      const nx = s.x / rad
      const nz = s.z / rad
      s.x = nx * bound
      s.z = nz * bound
      const vn = s.vx * nx + s.vz * nz
      if (vn > 0) {
        s.vx -= 1.5 * vn * nx
        s.vz -= 1.5 * vn * nz
      }
    }

    const { h, col } = groundAt(s.x, s.z, s.y + SLIME_STEP)
    if (s.y <= h) {
      const impact = -s.vy
      s.y = h
      if (!s.grounded && impact > 0) {
        if (col && col.bounce) {
          s.vy = col.bounce
          s.grounded = false
          s.jumps = 1
          events.push({ type: 'bounce', x: s.x, y: s.y, z: s.z, impact, col })
        } else {
          s.vy = 0
          s.grounded = true
          s.jumps = 1
          s.hopCd = 0.07
          s.coyote = 0.1
          events.push({ type: 'land', x: s.x, y: s.y, z: s.z, impact })
        }
      } else if (s.grounded) {
        s.vy = 0
      }
    } else if (s.grounded && s.y > h + 0.08) {
      s.grounded = false
      s.coyote = 0.1
    } else if (!s.grounded) {
      s.airTime += dt
    }
    if (s.grounded) s.airTime = 0
  }

  function stepBalls(dt) {
    for (const b of balls) {
      b.vy += GRAVITY * dt
      b.x += b.vx * dt
      b.z += b.vz * dt
      b.y += b.vy * dt
      pushOut(b, BALL_STEP, 0.62)
      // 울타리 안쪽의 보이지 않는 벽: 공도 밖으로 나가지 못하고 튕겨 돌아옵니다.
      const rad = Math.hypot(b.x, b.z)
      if (rad > ballBound) {
        const nx = b.x / rad
        const nz = b.z / rad
        b.x = nx * ballBound
        b.z = nz * ballBound
        const vn = b.vx * nx + b.vz * nz
        if (vn > 0) {
          b.vx -= 1.6 * vn * nx
          b.vz -= 1.6 * vn * nz
          if (vn > 2.5) events.push({ type: 'knock', x: b.x, y: b.y, z: b.z, power: vn })
        }
      }
      const { h, col } = groundAt(b.x, b.z, b.y + BALL_STEP)
      if (b.y <= h) {
        const impact = -b.vy
        b.y = h
        if (col && col.bounce && impact > 1) {
          b.vy = col.bounce * 0.8
          events.push({ type: 'bounce', x: b.x, y: b.y, z: b.z, impact, col, ball: true })
        } else if (impact > 1.6) {
          b.vy = impact * 0.66
          if (impact > 4) events.push({ type: 'ballbounce', x: b.x, y: b.y, z: b.z, impact })
        } else {
          b.vy = 0
        }
        const f = Math.exp(-0.55 * dt)
        b.vx *= f
        b.vz *= f
        b.grounded = true
      } else {
        b.grounded = false
      }
      const sp = Math.hypot(b.vx, b.vz)
      b.spinX = sp > 0.02 ? (b.vz / b.r) * dt : 0
      b.spinZ = sp > 0.02 ? (-b.vx / b.r) * dt : 0
      if (b.y < -22) {
        b.x = b.home.x
        b.z = b.home.z
        b.y = 7
        b.vx = b.vy = b.vz = 0
        events.push({ type: 'respawn', x: b.x, y: b.y, z: b.z })
      }
    }

    // 공끼리, 슬라임과 공 사이의 충돌(질량에 따라 밀려납니다)
    for (let i = 0; i < balls.length; i += 1) {
      for (let j = i + 1; j < balls.length; j += 1) collide(balls[i], balls[j], 0.72)
      collide(balls[i], { x: slime.x, y: slime.y + slime.r * 0.9, z: slime.z, vx: slime.vx, vy: slime.vy, vz: slime.vz, r: slime.r, mass: slime.mass, ref: slime }, 0.78, true)
    }
  }

  function collide(a, b, rest, bIsSlime = false) {
    const ay = a.y + a.r
    const by = bIsSlime ? b.y : b.y + b.r
    const dx = b.x - a.x
    const dy = by - ay
    const dz = b.z - a.z
    const rr = a.r + b.r
    const d2 = dx * dx + dy * dy + dz * dz
    if (d2 >= rr * rr || d2 === 0) return
    const d = Math.sqrt(d2)
    const nx = dx / d
    const ny = dy / d
    const nz = dz / d
    const pen = rr - d
    const ma = a.mass
    const mb = b.mass
    const tot = ma + mb
    a.x -= nx * pen * (mb / tot)
    a.y -= ny * pen * (mb / tot)
    a.z -= nz * pen * (mb / tot)
    if (!bIsSlime) {
      b.x += nx * pen * (ma / tot)
      b.y += ny * pen * (ma / tot)
      b.z += nz * pen * (ma / tot)
    }
    const rvx = b.vx - a.vx
    const rvy = b.vy - a.vy
    const rvz = b.vz - a.vz
    const vn = rvx * nx + rvy * ny + rvz * nz
    if (vn > 0) return
    const j = (-(1 + rest) * vn) / (1 / ma + 1 / mb)
    a.vx -= (j * nx) / ma
    a.vy -= (j * ny) / ma
    a.vz -= (j * nz) / ma
    const target = bIsSlime ? b.ref : b
    target.vx += (j * nx) / mb
    target.vy += (j * ny) / mb
    target.vz += (j * nz) / mb
    if (-vn > 2.5) events.push({ type: 'knock', x: a.x, y: a.y, z: a.z, power: -vn })
  }

  return {
    slime,
    balls,
    addBall,
    jump,
    groundAt,
    // input: { ix, iz, mag } (ix, iz는 단위 방향, mag는 0~1)
    update(dt, input) {
      const n = Math.max(1, Math.min(8, Math.ceil(dt / SUB_DT)))
      const h = dt / n
      for (let i = 0; i < n; i += 1) {
        stepSlime(h, input.ix, input.iz, input.mag)
        stepBalls(h)
      }
    },
    drain() {
      return events.splice(0, events.length)
    },
  }
}
