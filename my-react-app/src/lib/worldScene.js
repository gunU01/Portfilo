import * as THREE from 'three'

// 저폴리 미니어처 월드. React와 분리해 두어, 월드를 열 때만(lazy import) three가 로드됩니다.
// 그림자·후처리·외부 모델 없이 기본 도형만 쓰고, 화면 밖이나 탭이 숨겨지면 렌더를 멈춥니다.

const ZONE_RADIUS = 15 // 월드 중심에서 구역 중심까지
const ZONE_DISC = 7
const NEAR = 2.6
const BOUND = 24
const SPEED = 6.5

const css = (name, fallback) =>
  new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback)

const mat = (color) => new THREE.MeshLambertMaterial({ color, flatShading: true })

function buildLandmark(kind, tint, base) {
  const g = new THREE.Group()
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.55, 0.3, 12), mat(base))
  pedestal.position.y = 0.15
  g.add(pedestal)

  if (kind === 0) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 1.6), mat(tint))
    body.position.y = 1.25
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.9, 4), mat(0x2b2f3a))
    roof.position.y = 2.65
    roof.rotation.y = Math.PI / 4
    g.add(body, roof)
  } else if (kind === 1) {
    for (let i = 0; i < 4; i += 1) {
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.2, 2.4), mat(i % 2 ? tint : 0xffffff))
      sheet.position.y = 0.45 + i * 0.26
      sheet.rotation.y = (i - 1.5) * 0.18
      g.add(sheet)
    }
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), mat(0xd9453d))
    pin.position.y = 1.75
    g.add(pin)
  } else {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.38, 0.95, 8), mat(tint))
    cup.position.y = 1.7
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 6), mat(tint))
    stem.position.y = 1.0
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.34), mat(0xfff0b3))
    star.position.y = 2.55
    star.userData.spin = true
    g.add(cup, stem, star)
  }
  return g
}

function buildCharacter(accent) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.95, 8), mat(accent))
  body.position.y = 0.55
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), mat(0xffe3c4))
  head.position.y = 1.4
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x15171c })
  for (const x of [-0.14, 0.14]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), eyeMat)
    eye.position.set(x, 1.45, 0.36)
    g.add(eye)
  }
  g.add(body, head)
  return g
}

export function createWorld({ container, zones, onNear, onZone, onActivate }) {
  const palette = {
    bg: css('--bg', '#fbfaf7'),
    sunken: css('--sunken', '#f3f1ea'),
    line: css('--line', '#e4e1d8'),
    accent: css('--accent', '#2447f5'),
    accentSoft: css('--accent-soft', '#e9edff'),
    warnSoft: css('--warn-soft', '#fff4dc'),
  }
  const zoneTint = [palette.accent, new THREE.Color('#e8a33d'), new THREE.Color('#3fb68b')]
  const zoneGround = [palette.accentSoft, palette.warnSoft, palette.sunken]

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
  container.prepend(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = palette.bg
  scene.fog = new THREE.Fog(palette.bg, 28, 52)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a90a0, 1.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.6)
  sun.position.set(6, 12, 8)
  scene.add(sun)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120)
  camera.position.set(0, 10, 12)

  const ground = new THREE.Mesh(new THREE.CircleGeometry(BOUND + 2, 48), mat(palette.sunken))
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  const labelLayer = document.createElement('div')
  labelLayer.className = 'world__labels'
  labelLayer.setAttribute('aria-hidden', 'true')
  container.append(labelLayer)

  const makeLabel = (text, cls) => {
    const el = document.createElement('div')
    el.className = cls
    el.textContent = text
    labelLayer.append(el)
    return el
  }

  const zoneInfo = []
  const landmarks = []

  zones.forEach((zone, zi) => {
    const theta = -Math.PI / 2 + (zi * 2 * Math.PI) / zones.length
    const cx = Math.cos(theta) * ZONE_RADIUS
    const cz = Math.sin(theta) * ZONE_RADIUS

    const disc = new THREE.Mesh(new THREE.CylinderGeometry(ZONE_DISC, ZONE_DISC, 0.12, 40), mat(zoneGround[zi % 3]))
    disc.position.set(cx, 0.06, cz)
    scene.add(disc)

    const pathLen = ZONE_RADIUS - ZONE_DISC
    const path = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, pathLen), mat(palette.line))
    path.position.set((Math.cos(theta) * (pathLen / 2 + 0.3)), 0.04, Math.sin(theta) * (pathLen / 2 + 0.3))
    path.rotation.y = -theta + Math.PI / 2
    scene.add(path)

    zoneInfo.push({ id: zone.id, name: zone.name, x: cx, z: cz, label: makeLabel(zone.name, 'world__zone') })

    const n = zone.items.length
    const step = n > 3 ? 0.74 : 0.9
    zone.items.forEach((item, ii) => {
      const phi = theta + (ii - (n - 1) / 2) * step
      const x = cx + Math.cos(phi) * 4.2
      const z = cz + Math.sin(phi) * 4.2
      const mesh = buildLandmark(zi, zoneTint[zi % 3], zoneGround[zi % 3])
      mesh.position.set(x, 0.12, z)
      mesh.rotation.y = -phi + Math.PI / 2
      scene.add(mesh)

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.7, 2.0, 32),
        new THREE.MeshBasicMaterial({ color: zoneTint[zi % 3], side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
      )
      ring.rotation.x = -Math.PI / 2
      ring.position.set(x, 0.2, z)
      ring.visible = false
      scene.add(ring)

      landmarks.push({ ...item, x, z, mesh, ring, label: makeLabel(item.title, 'world__label') })
    })
  })

  const character = buildCharacter(palette.accent)
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 14),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  )
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  scene.add(shadow, character)

  const pos = new THREE.Vector3(0, 0, 2)
  let facing = Math.PI
  const keys = { up: false, down: false, left: false, right: false }
  const stick = { x: 0, y: 0 }
  let target = null
  let nearId = null
  let zoneId = null

  const KEYMAP = {
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
  }

  const activate = () => {
    const hit = landmarks.find((l) => l.id === nearId)
    if (hit) onActivate?.(hit.href)
  }

  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (KEYMAP[e.key]) {
      keys[KEYMAP[e.key]] = true
      target = null
      e.preventDefault()
    } else if (e.key === 'Enter' || e.key === 'e' || e.key === 'E' || e.key === ' ') {
      if (nearId) {
        e.preventDefault()
        activate()
      }
    }
  }
  const onKeyUp = (e) => {
    if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false
  }
  const onBlur = () => {
    keys.up = keys.down = keys.left = keys.right = false
  }
  container.addEventListener('keydown', onKeyDown)
  container.addEventListener('keyup', onKeyUp)
  container.addEventListener('blur', onBlur)

  const size = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // 세로로 긴 화면에서는 시야를 넓혀 월드가 잘리지 않게
    camera.fov = w / h < 0.8 ? 58 : 42
    camera.updateProjectionMatrix()
  }
  size()
  const ro = new ResizeObserver(size)
  ro.observe(container)

  const v = new THREE.Vector3()
  const project = (el, x, y, z, fadeFrom, fadeTo) => {
    v.set(x, y, z).project(camera)
    const w = container.clientWidth
    const h = container.clientHeight
    const dist = Math.hypot(x - pos.x, z - pos.z)
    const visible = v.z < 1 && Math.abs(v.x) < 1.1 && Math.abs(v.y) < 1.1
    const a = fadeTo === undefined ? 1 : Math.min(1, Math.max(0, (fadeTo - dist) / (fadeTo - fadeFrom)))
    el.style.opacity = visible ? String(a) : '0'
    el.style.transform = `translate3d(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px, 0) translate(-50%, -100%)`
  }

  let raf = 0
  let last = performance.now()
  let running = false
  let visibleInView = true

  const frame = (now) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now

    let ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + stick.x
    let iz = (keys.down ? 1 : 0) - (keys.up ? 1 : 0) + stick.y
    let len = Math.hypot(ix, iz)
    if (len < 0.08 && target) {
      ix = target.x - pos.x
      iz = target.z - pos.z
      const d = Math.hypot(ix, iz)
      if (d < 0.25) {
        target = null
        len = 0
      } else {
        ix /= d
        iz /= d
        len = 1
      }
    } else if (len >= 0.08) {
      target = null
    }

    const moving = len >= 0.08
    if (moving) {
      const k = Math.min(len, 1) / len
      pos.x += ix * k * SPEED * dt
      pos.z += iz * k * SPEED * dt
      const want = Math.atan2(ix, iz)
      let diff = want - facing
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      facing += diff * Math.min(1, dt * 12)
    }

    // 랜드마크와 겹치지 않게 밀어내고, 월드 밖으로 나가지 않게 제한
    for (const l of landmarks) {
      const dx = pos.x - l.x
      const dz = pos.z - l.z
      const d = Math.hypot(dx, dz)
      if (d < 1.55 && d > 0.0001) {
        pos.x = l.x + (dx / d) * 1.55
        pos.z = l.z + (dz / d) * 1.55
      }
    }
    const r = Math.hypot(pos.x, pos.z)
    if (r > BOUND) {
      pos.x = (pos.x / r) * BOUND
      pos.z = (pos.z / r) * BOUND
    }

    const t = now / 1000
    character.position.set(pos.x, moving ? Math.abs(Math.sin(t * 11)) * 0.1 : 0, pos.z)
    character.rotation.y = facing
    shadow.position.x = pos.x
    shadow.position.z = pos.z

    // 가까운 랜드마크와 현재 구역 (바뀔 때만 알림)
    let best = null
    let bestD = NEAR
    for (const l of landmarks) {
      const d = Math.hypot(pos.x - l.x, pos.z - l.z)
      if (d < bestD) {
        best = l
        bestD = d
      }
      l.ring.visible = false
    }
    if (best) {
      best.ring.visible = true
      best.ring.scale.setScalar(1 + Math.sin(t * 5) * 0.05)
    }
    const nextNear = best ? best.id : null
    if (nextNear !== nearId) {
      nearId = nextNear
      onNear?.(best ? { id: best.id, title: best.title, sub: best.sub, href: best.href } : null)
    }
    let nextZone = null
    for (const z of zoneInfo) {
      if (Math.hypot(pos.x - z.x, pos.z - z.z) < ZONE_DISC + 1.5) nextZone = z.id
    }
    if (nextZone !== zoneId) {
      zoneId = nextZone
      onZone?.(nextZone)
    }

    for (const l of landmarks) {
      l.mesh.traverse((o) => {
        if (o.userData.spin) o.rotation.y = t * 1.6
      })
    }

    const want = new THREE.Vector3(pos.x, 10, pos.z + 12)
    camera.position.lerp(want, 1 - Math.exp(-dt * 4))
    camera.lookAt(pos.x, 0.6, pos.z)
    renderer.render(scene, camera)

    for (const z of zoneInfo) project(z.label, z.x, 0.4, z.z, 14, 26)
    for (const l of landmarks) project(l.label, l.x, 3.6, l.z, 6, 12)
  }

  const start = () => {
    if (running || document.hidden || !visibleInView) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }
  const onVisibility = () => (document.hidden ? stop() : start())
  document.addEventListener('visibilitychange', onVisibility)
  const io = new IntersectionObserver(([entry]) => {
    visibleInView = entry.isIntersecting
    if (visibleInView) start()
    else stop()
  })
  io.observe(container)
  start()

  return {
    setStick(x, y) {
      stick.x = x
      stick.y = y
    },
    goTo(id) {
      const z = zoneInfo.find((zz) => zz.id === id)
      if (z) target = { x: z.x, z: z.z }
    },
    activate,
    dispose() {
      stop()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      container.removeEventListener('keydown', onKeyDown)
      container.removeEventListener('keyup', onKeyUp)
      container.removeEventListener('blur', onBlur)
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) o.material.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
      labelLayer.remove()
    },
  }
}
