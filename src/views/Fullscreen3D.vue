<template>
  <div class="fullscreen-3d" ref="fullscreenContainer">
    <div class="fullscreen-header">
      <button class="back-btn" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        返回地图
      </button>
      <h1 class="model-title">{{ modelName }}</h1>
      <div class="view-controls">
        <button class="fullscreen-btn" @click="toggleFullscreen">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          全屏
        </button>
        <label class="control-item">
          <input type="checkbox" v-model="autoRotate" />
          <span>自动旋转</span>
        </label>
        <label class="control-item">
          <input type="checkbox" v-model="exploded" />
          <span>爆炸视图</span>
        </label>
        <button class="reset-btn" @click="resetView">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 1 3 6.7"/>
            <path d="M3 7v5h5"/>
          </svg>
          重置视角
        </button>
      </div>
    </div>
    <div class="fullscreen-content" ref="containerRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const route = useRoute()
const router = useRouter()
const containerRef = ref(null)
const fullscreenContainer = ref(null)
const autoRotate = ref(true)
const exploded = ref(false)
const modelName = ref('')

let scene, camera, renderer, labelRenderer, controls
let modelGroup = null
let originalPositions = []
let particles = null
let isFullscreen = false

function goBack() {
  router.push('/map')
}

function resetView() {
  if (controls) {
    controls.reset()
  }
}

function toggleFullscreen() {
  if (!fullscreenContainer.value) return
  
  if (!isFullscreen) {
    // 进入全屏
    if (fullscreenContainer.value.requestFullscreen) {
      fullscreenContainer.value.requestFullscreen()
    } else if (fullscreenContainer.value.mozRequestFullScreen) {
      fullscreenContainer.value.mozRequestFullScreen()
    } else if (fullscreenContainer.value.webkitRequestFullscreen) {
      fullscreenContainer.value.webkitRequestFullscreen()
    } else if (fullscreenContainer.value.msRequestFullscreen) {
      fullscreenContainer.value.msRequestFullscreen()
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

function initPalaceModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a1a2a)
  scene.fog = new THREE.FogExp2(0x0a1a2a, 0.006)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(12, 7, 15)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 0.8
  controls.zoomSpeed = 1.2
  controls.enablePan = true
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 2, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(5, 12, 4)
  dirLight.castShadow = true
  dirLight.receiveShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  scene.add(dirLight)

  const fillLight = new THREE.PointLight(0xccaa77, 0.5)
  fillLight.position.set(-3, 5, 3)
  scene.add(fillLight)

  const backLight = new THREE.PointLight(0x88aaff, 0.4)
  backLight.position.set(0, 3, -6)
  scene.add(backLight)

  const gridHelper = new THREE.GridHelper(40, 20, 0x88aacc, 0x335577)
  gridHelper.position.y = -0.8
  gridHelper.material.transparent = true
  gridHelper.material.opacity = 0.3
  scene.add(gridHelper)

  modelGroup = new THREE.Group()

  const baseLevels = [
    { y: 0, w: 14, d: 8, color: 0xe8e0d0 },
    { y: 0.35, w: 12.5, d: 6.5, color: 0xefead8 },
    { y: 0.7, w: 11, d: 5.2, color: 0xf5f0e0 }
  ]

  baseLevels.forEach((level, idx) => {
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(level.w, 0.3, level.d),
      new THREE.MeshStandardMaterial({ color: level.color, roughness: 0.3, metalness: 0.05 })
    )
    base.position.set(0, level.y + 0.15, 0)
    base.castShadow = true
    base.receiveShadow = true
    modelGroup.add(base)

    const railMat = new THREE.MeshStandardMaterial({ color: 0xddccaa })
    for (let side = -1; side <= 1; side+=2) {
      for (let x = -level.w/2+0.3; x <= level.w/2; x+=0.65) {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.28, 0.12),
          railMat
        )
        pillar.position.set(x, level.y + 0.3, side * (level.d/2 - 0.1))
        pillar.castShadow = true
        modelGroup.add(pillar)
      }
      for (let z = -level.d/2+0.3; z <= level.d/2; z+=0.65) {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.28, 0.12),
          railMat
        )
        pillar.position.set(side * (level.w/2 - 0.1), level.y + 0.3, z)
        pillar.castShadow = true
        modelGroup.add(pillar)
      }
    }
  })

  const halls = [
    { name: "太和殿", x: 0, z: 0, w: 3.8, h: 1.4, d: 2.6, roofColor: 0xe6b422, wallColor: 0xba2d2d },
    { name: "中和殿", x: -4.2, z: 0, w: 2.2, h: 1.1, d: 2.2, roofColor: 0xdbaa33, wallColor: 0xba2d2d },
    { name: "保和殿", x: 4.2, z: 0, w: 3.2, h: 1.3, d: 2.4, roofColor: 0xdbaa33, wallColor: 0xba2d2d }
  ]

  halls.forEach(hall => {
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(hall.w, hall.h, hall.d),
      new THREE.MeshStandardMaterial({ color: hall.wallColor, roughness: 0.2 })
    )
    walls.position.set(hall.x, 0.95 + baseLevels[2].y + 0.2, hall.z)
    walls.castShadow = true
    walls.receiveShadow = true
    modelGroup.add(walls)

    const roofMat = new THREE.MeshStandardMaterial({ color: hall.roofColor, metalness: 0.3, roughness: 0.4 })
    const roofMain = new THREE.Mesh(
      new THREE.CylinderGeometry(hall.w*0.7, hall.w*0.95, 0.5, 4),
      roofMat
    )
    roofMain.rotation.y = Math.PI/4
    roofMain.position.set(hall.x, 0.95 + baseLevels[2].y + hall.h, hall.z)
    roofMain.castShadow = true
    modelGroup.add(roofMain)

    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(hall.w*0.9, 0.1, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xffdd88 })
    )
    ridge.position.set(hall.x, 0.95 + baseLevels[2].y + hall.h + 0.28, hall.z)
    modelGroup.add(ridge)

    if (hall.name === "太和殿") {
      const lowerRoof = new THREE.Mesh(
        new THREE.CylinderGeometry(hall.w*0.85, hall.w*0.95, 0.35, 4),
        roofMat
      )
      lowerRoof.rotation.y = Math.PI/4
      lowerRoof.position.set(hall.x, 0.95 + baseLevels[2].y + hall.h - 0.35, hall.z)
      lowerRoof.castShadow = true
      modelGroup.add(lowerRoof)
    }
  })

  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xcdba92 })
  for (let i = -2; i <= 2; i++) {
    const bridge = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.2, 1.2),
      bridgeMat
    )
    bridge.position.set(i * 1.5, -0.35, -4.5)
    bridge.castShadow = true
    modelGroup.add(bridge)

    const pillarL = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.35, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xeeddcc })
    )
    pillarL.position.set(i*1.5 - 0.35, -0.15, -4.5)
    modelGroup.add(pillarL)

    const pillarR = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.35, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xeeddcc })
    )
    pillarR.position.set(i*1.5 + 0.35, -0.15, -4.5)
    modelGroup.add(pillarR)
  }

  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 18),
    new THREE.MeshStandardMaterial({ color: 0xaa3a3a })
  )
  leftWall.position.set(-8.2, 0.6, 0)
  leftWall.castShadow = true
  modelGroup.add(leftWall)

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 18),
    new THREE.MeshStandardMaterial({ color: 0xaa3a3a })
  )
  rightWall.position.set(8.2, 0.6, 0)
  rightWall.castShadow = true
  modelGroup.add(rightWall)

  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({
        object: child,
        position: child.position.clone()
      })
    }
  })

  function makeLabel(text, pos, fontSize='0.9rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.fontWeight = 'bold'
    div.style.textShadow = '1px 1px 0 #000'
    div.style.background = 'rgba(0,0,0,0.55)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '20px'
    div.style.borderLeft = '3px solid #e6b422'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }

  makeLabel('🏛️ 太和殿 (重檐庑殿顶)', new THREE.Vector3(0, 3.2, 1.2), '0.9rem')
  makeLabel('⚜️ 中和殿 (方形攒尖)', new THREE.Vector3(-4.2, 2.6, 1.0), '0.8rem')
  makeLabel('📜 保和殿 (殿试)', new THREE.Vector3(4.2, 2.7, 1.0), '0.8rem')
  makeLabel('三层须弥座台基 & 螭首', new THREE.Vector3(0, 1.2, 3.2), '0.8rem')
  makeLabel('金水桥', new THREE.Vector3(0, -0.2, -4.0), '0.75rem')
  makeLabel('红墙宫门', new THREE.Vector3(-8, 1.4, -2), '0.8rem')

  const particleCount = 600
  const particleGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount*3)
  for(let i=0;i<particleCount;i++) {
    positions[i*3] = (Math.random()-0.5)*28
    positions[i*3+1] = Math.random()*4
    positions[i*3+2] = (Math.random()-0.5)*20
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xffcc88, size: 0.045, transparent: true, opacity: 0.45 })
  )
  scene.add(particles)
}

function initBridgeModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a1030)
  scene.fog = new THREE.FogExp2(0x0a1030, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
  camera.position.set(16, 8, 18)
  camera.lookAt(0, 0.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.8
  controls.enableZoom = true
  controls.enablePan = true
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.2, 0)

  const ambientLight = new THREE.AmbientLight(0x404060, 0.65)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(5, 12, 4)
  dirLight.castShadow = true
  dirLight.receiveShadow = true
  dirLight.shadow.mapSize.width = 1024
  dirLight.shadow.mapSize.height = 1024
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 25
  dirLight.shadow.camera.left = -10
  dirLight.shadow.camera.right = 10
  dirLight.shadow.camera.top = 10
  dirLight.shadow.camera.bottom = -10
  scene.add(dirLight)

  const backLight = new THREE.PointLight(0xccaa66, 0.5)
  backLight.position.set(-3, 4, -5)
  scene.add(backLight)

  const fillLight = new THREE.PointLight(0x88aaff, 0.4)
  fillLight.position.set(0, -2, 0)
  scene.add(fillLight)

  const archLight = new THREE.PointLight(0xffaa66, 0.6)
  archLight.position.set(0, 1, 0)
  scene.add(archLight)

  const gridHelper = new THREE.GridHelper(40, 20, 0x88aaff, 0x335588)
  gridHelper.position.y = -1.2
  gridHelper.material.transparent = true
  gridHelper.material.opacity = 0.35
  scene.add(gridHelper)

  const waterPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(32, 18),
    new THREE.MeshStandardMaterial({ color: 0x2a6f8f, roughness: 0.4, metalness: 0.7, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  )
  waterPlane.rotation.x = -Math.PI / 2
  waterPlane.position.y = -0.95
  waterPlane.receiveShadow = true
  scene.add(waterPlane)

  modelGroup = new THREE.Group()

  const bridgeLength = 14.8
  const bridgeWidth = 3.2
  const deckHeight = 0.28
  const archCount = 11
  const archSpan = bridgeLength / (archCount + 0.2)
  const startX = -bridgeLength / 2

  const pierWidth = 0.7
  const pierDepth = 2.1
  const pierHeight = 1.1
  const waterCutterLen = 0.45

  const deckBase = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLength, deckHeight, bridgeWidth),
    new THREE.MeshStandardMaterial({ color: 0xbc9a6c, roughness: 0.7, metalness: 0.1 })
  )
  deckBase.position.set(0, pierHeight + deckHeight/2, 0)
  deckBase.castShadow = true
  deckBase.receiveShadow = true
  modelGroup.add(deckBase)

  const stoneStripes = new THREE.Mesh(
    new THREE.BoxGeometry(bridgeLength, 0.05, bridgeWidth - 0.2),
    new THREE.MeshStandardMaterial({ color: 0xcdae7a, roughness: 0.8 })
  )
  stoneStripes.position.set(0, pierHeight + deckHeight - 0.02, 0)
  stoneStripes.castShadow = false
  modelGroup.add(stoneStripes)

  for (let i = 0; i < archCount + 1; i++) {
    let xPos = startX + i * archSpan
    let isEndPier = (i === 0 || i === archCount)
    let pierW = isEndPier ? 0.85 : pierWidth

    const pierBody = new THREE.Mesh(
      new THREE.BoxGeometry(pierW, pierHeight, pierDepth),
      new THREE.MeshStandardMaterial({ color: 0x9b7e5c, roughness: 0.6, metalness: 0.05 })
    )
    pierBody.position.set(xPos, pierHeight/2, 0)
    pierBody.castShadow = true
    pierBody.receiveShadow = true
    modelGroup.add(pierBody)

    const cutterGeo = new THREE.CylinderGeometry(0.28, 0.52, waterCutterLen, 8)
    const cutterMat = new THREE.MeshStandardMaterial({ color: 0xaa8866, roughness: 0.4 })
    const frontCutter = new THREE.Mesh(cutterGeo, cutterMat)
    frontCutter.rotation.x = Math.PI / 2
    frontCutter.rotation.z = 0
    frontCutter.position.set(xPos, pierHeight * 0.65, pierDepth/2 + waterCutterLen/2)
    frontCutter.castShadow = true
    modelGroup.add(frontCutter)

    const backCutter = new THREE.Mesh(cutterGeo, cutterMat)
    backCutter.rotation.x = Math.PI / 2
    backCutter.position.set(xPos, pierHeight * 0.6, -pierDepth/2 - waterCutterLen/2)
    backCutter.castShadow = true
    modelGroup.add(backCutter)
  }

  const archRadius = 0.85
  const archDepth = bridgeWidth - 0.4
  const archStartY = pierHeight - 0.05

  for (let i = 0; i < archCount; i++) {
    const leftPierX = startX + i * archSpan
    const rightPierX = startX + (i+1) * archSpan
    const centerX = (leftPierX + rightPierX) / 2

    const segments = 12
    for (let s = 0; s <= segments; s++) {
      const angle = Math.PI * (s / segments)
      const xOff = Math.cos(angle) * archRadius
      const yOff = Math.sin(angle) * archRadius + archStartY
      const blockW = archRadius * 0.25
      const blockH = 0.18
      const blockD = archDepth
      const archBlock = new THREE.Mesh(
        new THREE.BoxGeometry(blockW, blockH, blockD),
        new THREE.MeshStandardMaterial({ color: 0xc9aa7a, roughness: 0.5, metalness: 0.1 })
      )
      archBlock.position.set(centerX + xOff * 0.9, yOff, 0)
      archBlock.castShadow = true
      modelGroup.add(archBlock)
    }

    const archStripe = new THREE.Mesh(
      new THREE.TorusGeometry(archRadius + 0.05, 0.08, 16, 40, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xd4b87a, metalness: 0.3 })
    )
    archStripe.rotation.x = Math.PI / 2
    archStripe.rotation.z = 0
    archStripe.position.set(centerX, archStartY + 0.05, 0)
    modelGroup.add(archStripe)
  }

  const railingColor = 0xb88b5c
  const pillarHeight = 0.55
  const pillarWidth = 0.2
  const pillarDepth = 0.22
  const railingHeight = 0.28
  const railingThick = 0.12

  const pillarCount = 28
  const stepX = bridgeLength / (pillarCount - 1)
  const startXRail = -bridgeLength/2

  function addLionShape(parent, posX, posZ, yBase) {
    const lionGroup = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xc9a45c, metalness: 0.2, roughness: 0.4 })
    )
    body.position.set(0, 0.08, 0)
    lionGroup.add(body)

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd6ae6b })
    )
    head.position.set(0, 0.18, 0.03)
    lionGroup.add(head)

    const earGeo = new THREE.ConeGeometry(0.05, 0.07, 8)
    const earL = new THREE.Mesh(earGeo, new THREE.MeshStandardMaterial({ color: 0xc9a45c }))
    earL.position.set(-0.05, 0.23, 0)
    earL.rotation.z = -0.3
    lionGroup.add(earL)

    const earR = new THREE.Mesh(earGeo, new THREE.MeshStandardMaterial({ color: 0xc9a45c }))
    earR.position.set(0.05, 0.23, 0)
    earR.rotation.z = 0.3
    lionGroup.add(earR)

    const tailGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.15, 6)
    const tail = new THREE.Mesh(tailGeo, new THREE.MeshStandardMaterial({ color: 0xc9a45c }))
    tail.position.set(0, 0.15, -0.12)
    tail.rotation.x = -0.5
    lionGroup.add(tail)

    lionGroup.position.set(posX, yBase, posZ)
    parent.add(lionGroup)
  }

  const zSides = [bridgeWidth / 2 + 0.1, -bridgeWidth / 2 - 0.1]
  zSides.forEach(zSide => {
    let lastX = startXRail
    for (let i = 0; i < pillarCount; i++) {
      const xPos = startXRail + i * stepX
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarDepth),
        new THREE.MeshStandardMaterial({ color: railingColor, roughness: 0.6, metalness: 0.2 })
      )
      pillar.position.set(xPos, pierHeight + deckHeight + pillarHeight / 2, zSide)
      pillar.castShadow = true
      modelGroup.add(pillar)

      if (i % 3 === 0) {
        addLionShape(modelGroup, xPos, zSide, pierHeight + deckHeight)
      }

      if (i > 0) {
        const lenX = Math.abs(xPos - lastX) - 0.08
        if (lenX > 0.05) {
          const railingPlank = new THREE.Mesh(
            new THREE.BoxGeometry(lenX, railingHeight, railingThick),
            new THREE.MeshStandardMaterial({ color: 0xac8060, roughness: 0.6 })
          )
          const centerX = (lastX + xPos) / 2
          railingPlank.position.set(centerX, pierHeight + deckHeight + 0.12, zSide + (zSide > 0 ? 0.05 : -0.05))
          railingPlank.castShadow = true
          modelGroup.add(railingPlank)
        }
      }
      lastX = xPos
    }
  })

  const endPillarPos = [-bridgeLength/2 - 0.45, bridgeLength/2 + 0.45]
  endPillarPos.forEach(xPos => {
    const huabiaoBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 1.0, 8),
      new THREE.MeshStandardMaterial({ color: 0xcbaa7a, metalness: 0.1 })
    )
    huabiaoBase.position.set(xPos, 0.3, bridgeWidth/2 + 0.25)
    huabiaoBase.castShadow = true
    modelGroup.add(huabiaoBase)

    const topDeco = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xe5c28e })
    )
    topDeco.position.set(xPos, 0.85, bridgeWidth/2 + 0.25)
    modelGroup.add(topDeco)

    const huabiaoBase2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 1.0, 8),
      new THREE.MeshStandardMaterial({ color: 0xcbaa7a })
    )
    huabiaoBase2.position.set(xPos, 0.3, -bridgeWidth/2 - 0.25)
    huabiaoBase2.castShadow = true
    modelGroup.add(huabiaoBase2)

    const topDeco2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xe5c28e })
    )
    topDeco2.position.set(xPos, 0.85, -bridgeWidth/2 - 0.25)
    modelGroup.add(topDeco2)
  })

  for (let i = -6; i <= 6; i++) {
    const lineX = i * 0.95
    const lineMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, bridgeWidth - 0.4),
      new THREE.MeshStandardMaterial({ color: 0x9c7a4c })
    )
    lineMesh.position.set(lineX, pierHeight + deckHeight + 0.03, 0)
    lineMesh.castShadow = false
    modelGroup.add(lineMesh)
  }

  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({
        object: child,
        position: child.position.clone()
      })
    }
  })

  function makeLabel(text, position, fontSize = '1rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffecb3'
    div.style.fontSize = fontSize
    div.style.fontWeight = 'bold'
    div.style.textShadow = '1px 1px 0px #000'
    div.style.background = 'rgba(0,0,0,0.55)'
    div.style.padding = '2px 8px'
    div.style.borderRadius = '20px'
    div.style.borderLeft = `3px solid #d4af37`
    div.style.fontFamily = 'system-ui'
    div.style.backdropFilter = 'blur(4px)'
    div.style.pointerEvents = 'none'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(position)
    scene.add(label)
  }

  makeLabel('🏛️ 11孔联拱券', new THREE.Vector3(0, 2.5, 1.6), '0.9rem')
  makeLabel('🗿 望柱石狮 (501只)', new THREE.Vector3(3.2, 1.3, 2.2), '0.8rem')
  makeLabel('⚓ 分水尖桥墩', new THREE.Vector3(4.5, 0.4, 2.4), '0.8rem')
  makeLabel('🗼 石栏 & 望柱', new THREE.Vector3(-3.8, 1.4, -2.0), '0.8rem')
  makeLabel('🌊 永定河河床', new THREE.Vector3(5, -0.9, 1.2), '0.7rem')
  makeLabel('拱券结构', new THREE.Vector3(0, 0.9, 1.3), '0.75rem')
  makeLabel('华表 (示意)', new THREE.Vector3(-7.2, 0.9, 2.3), '0.7rem')

  const particleCount = 400
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesPositions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    particlesPositions[i*3] = (Math.random() - 0.5) * 35
    particlesPositions[i*3+1] = Math.random() * 4
    particlesPositions[i*3+2] = (Math.random() - 0.5) * 18
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.045, transparent: true, opacity: 0.5 })
  particles = new THREE.Points(particlesGeometry, particlesMat)
  scene.add(particles)

  const backMount = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 16, 2.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x4a5b66, roughness: 0.9, transparent: true, opacity: 0.4 })
  )
  backMount.position.set(-7, -1, -12)
  scene.add(backMount)
}

function initYamenModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x112233)
  scene.fog = new THREE.FogExp2(0x112233, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400)
  camera.position.set(8, 5, 12)
  camera.lookAt(0, 1, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x4a5b6e, 0.7)
  scene.add(ambient)

  const mainLight = new THREE.DirectionalLight(0xffeec9, 1.1)
  mainLight.position.set(6, 10, 4)
  mainLight.castShadow = true
  scene.add(mainLight)

  const fillLight = new THREE.PointLight(0xccaa88, 0.5)
  fillLight.position.set(-2, 3, 3)
  scene.add(fillLight)

  modelGroup = new THREE.Group()

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    new THREE.MeshStandardMaterial({ color: 0x6b5a48, roughness: 0.8, side: THREE.DoubleSide })
  )
  ground.rotation.x = -Math.PI/2
  ground.position.y = -0.2
  ground.receiveShadow = true
  scene.add(ground)

  function addBuilding(name, x, z, width, depth, height, wallColor, roofColor, hasPlatform=false) {
    const platformY = hasPlatform ? 0.2 : 0
    if(hasPlatform) {
      const platform = new THREE.Mesh(
        new THREE.BoxGeometry(width+0.4, 0.2, depth+0.4),
        new THREE.MeshStandardMaterial({ color: 0xbcac8a, roughness: 0.6 })
      )
      platform.position.set(x, platformY, z)
      platform.castShadow = true
      modelGroup.add(platform)
    }
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.4 })
    )
    walls.position.set(x, platformY + height/2, z)
    walls.castShadow = true
    walls.receiveShadow = true
    modelGroup.add(walls)

    const roofLen = width + 0.2
    const roofHeight = 0.45
    const roofGeo = new THREE.CylinderGeometry(roofLen*0.7, roofLen*0.9, roofHeight, 4)
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 }))
    roof.rotation.y = Math.PI/4
    roof.position.set(x, platformY + height + roofHeight/2 - 0.05, z)
    roof.castShadow = true
    modelGroup.add(roof)

    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(roofLen-0.2, 0.06, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xaa8866 })
    )
    ridge.position.set(x, platformY + height + roofHeight - 0.03, z)
    modelGroup.add(ridge)
  }

  addBuilding("大门", 0, -4.2, 2.4, 1.6, 0.9, 0xbe8a60, 0x7a5a3a)
  addBuilding("仪门", 0, -1.8, 2.4, 1.5, 0.85, 0xbe8a60, 0x7a5a3a)
  addBuilding("大堂 (正堂)", 0, 1.2, 3.2, 2.2, 1.1, 0xa57248, 0x6d4c2c, true)
  addBuilding("二堂 (琴治堂)", 0, 3.8, 2.8, 2.0, 1.0, 0xa57248, 0x6d4c2c)
  addBuilding("三堂 (三省堂)", 0, 6.0, 2.6, 1.9, 0.95, 0xa57248, 0x6d4c2c)

  const sideRooms = [[-2.8, -2.5, 1.4, 1.0], [2.8, -2.5, 1.4, 1.0], [-2.8, 1.0, 1.4, 1.0], [2.8, 1.0, 1.4, 1.0], [-2.6, 4.2, 1.4, 1.0], [2.6, 4.2, 1.4, 1.0]]
  sideRooms.forEach(pos => {
    const [x, z, w, d] = pos
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.7, d),
      new THREE.MeshStandardMaterial({ color: 0xbc8f5a })
    )
    wall.position.set(x, 0.35, z)
    wall.castShadow = true
    modelGroup.add(wall)

    const sRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(w*0.8, w*0.9, 0.3, 4),
      new THREE.MeshStandardMaterial({ color: 0x765a3a })
    )
    sRoof.rotation.y = Math.PI/4
    sRoof.position.set(x, 0.75, z)
    modelGroup.add(sRoof)
  })

  const yuetai = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.2, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xbcac8a })
  )
  yuetai.position.set(0, 0.05, -0.3)
  yuetai.castShadow = true
  modelGroup.add(yuetai)

  const lionMat = new THREE.MeshStandardMaterial({ color: 0xbd9e6b })
  const lionLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), lionMat)
  lionLeft.position.set(-1.2, 0.2, -4.5)
  modelGroup.add(lionLeft)

  const lionRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), lionMat)
  lionRight.position.set(1.2, 0.2, -4.5)
  modelGroup.add(lionRight)

  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({
        object: child,
        position: child.position.clone()
      })
    }
  })

  function addLabel(text, pos, fontSize='0.8rem') {
    const d = document.createElement('div')
    d.textContent = text
    d.style.color = '#f7e9c3'
    d.style.fontSize = fontSize
    d.style.background = 'rgba(0,0,0,0.6)'
    d.style.padding = '2px 8px'
    d.style.borderRadius = '16px'
    d.style.borderLeft = '3px solid #c7a252'
    d.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(d)
    label.position.copy(pos)
    scene.add(label)
  }

  addLabel('🚪 大门 (八字墙)', new THREE.Vector3(0, 1.2, -4.8), '0.8rem')
  addLabel('仪门', new THREE.Vector3(0, 1.3, -2.2), '0.75rem')
  addLabel('大堂 (审理重案)', new THREE.Vector3(0, 2.1, 1.2), '0.85rem')
  addLabel('二堂 · 琴治堂', new THREE.Vector3(0, 1.9, 4.0), '0.8rem')
  addLabel('三堂 · 三省堂', new THREE.Vector3(0, 1.8, 6.2), '0.8rem')
  addLabel('东西花厅', new THREE.Vector3(-2.8, 0.8, -1.5), '0.7rem')
  addLabel('刑钱夫子院', new THREE.Vector3(3.0, 0.8, 1.5), '0.7rem')
  addLabel('月台 (青石台基)', new THREE.Vector3(0, 0.6, -0.2), '0.7rem')

  const leafParticles = new THREE.BufferGeometry()
  const leafCount = 400
  const leafPos = []
  for(let i=0;i<leafCount;i++) {
    leafPos.push((Math.random()-0.5)*16, Math.random()*0.2, (Math.random()-0.5)*12)
  }
  leafParticles.setAttribute('position', new THREE.BufferAttribute(new Float32Array(leafPos), 3))
  const leafMat = new THREE.PointsMaterial({ color: 0xb87c3a, size: 0.045 })
  particles = new THREE.Points(leafParticles, leafMat)
  scene.add(particles)
}

function initSiheyuanModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a1428)
  scene.fog = new THREE.FogExp2(0x0a1428, 0.006)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 5, 9)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = 0.8
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.8
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambientLight = new THREE.AmbientLight(0x404060, 0.65)
  scene.add(ambientLight)
  const mainLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  mainLight.position.set(6, 10, 4)
  mainLight.castShadow = true
  mainLight.receiveShadow = true
  mainLight.shadow.mapSize.width = 1024
  mainLight.shadow.mapSize.height = 1024
  mainLight.shadow.camera.near = 0.5
  mainLight.shadow.camera.far = 20
  mainLight.shadow.camera.left = -8
  mainLight.shadow.camera.right = 8
  mainLight.shadow.camera.top = 8
  mainLight.shadow.camera.bottom = -8
  scene.add(mainLight)
  
  const fillLight = new THREE.PointLight(0xccaa77, 0.5)
  fillLight.position.set(-3, 4, 2)
  scene.add(fillLight)
  
  const backLight = new THREE.PointLight(0x88aacc, 0.4)
  backLight.position.set(0, 3, -5)
  scene.add(backLight)
  
  const groundLight = new THREE.PointLight(0xaa8866, 0.3)
  groundLight.position.set(0, -0.5, 0)
  scene.add(groundLight)
  
  const gridHelper = new THREE.GridHelper(20, 20, 0x88aaff, 0x446688)
  gridHelper.position.y = -0.8
  gridHelper.material.transparent = true
  gridHelper.material.opacity = 0.25
  scene.add(gridHelper)

  modelGroup = new THREE.Group()

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a, roughness: 0.5, metalness: 0.05 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.7, metalness: 0.02 })
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xac8a5a, roughness: 0.4 })
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x9a7a4a, roughness: 0.3 })

  function addGableRoof(parent, x, z, width, depth, height, baseY) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat)
    body.position.set(x, baseY + height/2, z)
    body.castShadow = true
    body.receiveShadow = true
    parent.add(body)
    const roofHeight = height * 0.5
    const roofGeo = new THREE.CylinderGeometry(width*0.95, width*1.05, roofHeight, 4)
    const roofMesh = new THREE.Mesh(roofGeo, roofMat)
    roofMesh.rotation.y = Math.PI/4
    roofMesh.position.set(x, baseY + height + roofHeight/2 - 0.05, z)
    roofMesh.castShadow = true
    parent.add(roofMesh)
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(width*0.9, 0.08, 0.2), new THREE.MeshStandardMaterial({ color: 0xccaa77 }))
    ridge.position.set(x, baseY + height + roofHeight - 0.04, z)
    ridge.castShadow = true
    parent.add(ridge)
    const eavesMat = new THREE.MeshStandardMaterial({ color: 0xba9a5a })
    const leftEave = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, depth+0.2), eavesMat)
    leftEave.position.set(x - width/2 - 0.1, baseY + height*0.9, z)
    parent.add(leftEave)
    const rightEave = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, depth+0.2), eavesMat)
    rightEave.position.set(x + width/2 + 0.1, baseY + height*0.9, z)
    parent.add(rightEave)
  }
  
  addGableRoof(modelGroup, 0, 1.6, 2.6, 2.0, 1.0, 0)
  for (let i = -0.8; i <= 0.8; i+=0.8) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.8, 8), pillarMat)
    pillar.position.set(i, 0.5, 2.1)
    pillar.castShadow = true
    modelGroup.add(pillar)
  }
  
  addGableRoof(modelGroup, -2.0, -0.2, 2.0, 1.4, 0.9, 0)
  addGableRoof(modelGroup, 2.0, -0.2, 2.0, 1.4, 0.9, 0)
  addGableRoof(modelGroup, 0, -1.8, 2.4, 1.6, 0.85, 0)
  
  const gateBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.0), wallMat)
  gateBase.position.set(0, 0.15, -0.6)
  gateBase.castShadow = true
  modelGroup.add(gateBase)
  const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), pillarMat)
  gatePillarL.position.set(-0.6, 0.6, -0.6)
  modelGroup.add(gatePillarL)
  const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), pillarMat)
  gatePillarR.position.set(0.6, 0.6, -0.6)
  modelGroup.add(gatePillarR)
  const gateRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.3, 4), roofMat)
  gateRoof.rotation.y = Math.PI/4
  gateRoof.position.set(0, 1.0, -0.6)
  modelGroup.add(gateRoof)
  
  const corridorMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  const corridorPoints = [[-1.8, -1.0], [1.8, -1.0], [-1.8, 1.0], [1.8, 1.0]]
  corridorPoints.forEach(pos => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), woodMat)
    pillar.position.set(pos[0], 0.3, pos[1])
    pillar.castShadow = true
    modelGroup.add(pillar)
  })
  
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xccbb99, roughness: 0.8 })
  const pathX = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.6), stoneMat)
  pathX.position.set(0, 0.03, 0)
  pathX.castShadow = true
  modelGroup.add(pathX)
  const pathZ = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 2.2), stoneMat)
  pathZ.position.set(0, 0.03, 0)
  pathZ.castShadow = true
  modelGroup.add(pathZ)

  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({
        object: child,
        position: child.position.clone()
      })
    }
  })

  function makeLabel(text, pos, fontSize = '0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.fontWeight = 'bold'
    div.style.textShadow = '1px 1px 0 #000'
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    div.style.backdropFilter = 'blur(4px)'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  
  makeLabel('🏠 正房 (长辈居所)', new THREE.Vector3(0, 2.0, 1.8), '0.9rem')
  makeLabel('📖 东厢房', new THREE.Vector3(-2.4, 1.4, -0.2), '0.8rem')
  makeLabel('📖 西厢房', new THREE.Vector3(2.4, 1.4, -0.2), '0.8rem')
  makeLabel('🚪 倒座房 (门房/佣房)', new THREE.Vector3(0, 1.3, -2.2), '0.8rem')
  makeLabel('🌸 垂花门', new THREE.Vector3(0, 1.4, -0.8), '0.8rem')
  makeLabel('🪨 影壁 (位于大门内)', new THREE.Vector3(0, 0.6, -2.8), '0.75rem')
  makeLabel('🔘 门墩', new THREE.Vector3(-0.8, 0.2, -2.4), '0.7rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initZhaozhouBridgeModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a2a3a)
  scene.fog = new THREE.FogExp2(0x0a2a3a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 8)
  camera.lookAt(0, 0.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.8, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.5)
  fillLight.position.set(-3, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 20, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a, roughness: 0.6, metalness: 0.05 })
  const mainArch = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.18, 48, 96, Math.PI), stoneMat)
  mainArch.rotation.x = Math.PI / 2
  mainArch.position.set(0, 0.25, 0)
  mainArch.castShadow = true
  modelGroup.add(mainArch)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 1.6), stoneMat)
  deck.position.set(0, 0.65, 0)
  deck.castShadow = true
  modelGroup.add(deck)
  const smallArchGeo = new THREE.TorusGeometry(0.55, 0.1, 32, 64, Math.PI)
  const leftSmall1 = new THREE.Mesh(smallArchGeo, stoneMat)
  leftSmall1.rotation.x = Math.PI/2
  leftSmall1.position.set(-1.6, 0.2, 0.85)
  modelGroup.add(leftSmall1)
  const leftSmall2 = new THREE.Mesh(smallArchGeo, stoneMat)
  leftSmall2.rotation.x = Math.PI/2
  leftSmall2.position.set(-2.8, 0.2, 0.85)
  modelGroup.add(leftSmall2)
  const rightSmall1 = new THREE.Mesh(smallArchGeo, stoneMat)
  rightSmall1.rotation.x = Math.PI/2
  rightSmall1.position.set(1.6, 0.2, 0.85)
  modelGroup.add(rightSmall1)
  const rightSmall2 = new THREE.Mesh(smallArchGeo, stoneMat)
  rightSmall2.rotation.x = Math.PI/2
  rightSmall2.position.set(2.8, 0.2, 0.85)
  modelGroup.add(rightSmall2)
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xaa8a5a })
  for (let i = -2.4; i <= 2.4; i+=0.8) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.18), pillarMat)
    pillar.position.set(i, 0.95, 0.9)
    pillar.castShadow = true
    modelGroup.add(pillar)
    const pillar2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.18), pillarMat)
    pillar2.position.set(i, 0.95, -0.9)
    pillar2.castShadow = true
    modelGroup.add(pillar2)
  }
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 主拱券 (敞肩拱)', new THREE.Vector3(0, 1.0, 1.1), '0.9rem')
  makeLabel('小拱券 (减轻自重)', new THREE.Vector3(-2.2, 0.5, 1.2), '0.8rem')
  makeLabel('石板桥面', new THREE.Vector3(0, 1.1, 1.4), '0.8rem')
  makeLabel('望柱 & 石栏', new THREE.Vector3(2.0, 1.2, 1.2), '0.8rem')

  const particleCount = 400
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initTulouModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a2a1a)
  scene.fog = new THREE.FogExp2(0x1a2a1a, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 4, 7)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.8, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(5, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(14, 12, 0x88aacc, 0x446688)
  grid.position.y = -0.8
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const earthMat = new THREE.MeshStandardMaterial({ color: 0xc6a87a, roughness: 0.7, metalness: 0.02 })
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xbc8a5a, roughness: 0.5 })
  const outerWall = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 2.2, 64), earthMat)
  outerWall.castShadow = true
  outerWall.receiveShadow = true
  modelGroup.add(outerWall)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.35, 0.7, 64), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }))
  roof.position.y = 1.2
  roof.castShadow = true
  modelGroup.add(roof)
  const innerRing = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.8, 32), new THREE.MeshStandardMaterial({ color: 0xbc9a6a }))
  innerRing.position.y = 0.5
  innerRing.castShadow = true
  modelGroup.add(innerRing)
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2
    const x = Math.cos(angle) * 1.6
    const z = Math.sin(angle) * 1.6
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), woodMat)
    pillar.position.set(x, 0.6, z)
    pillar.castShadow = true
    modelGroup.add(pillar)
  }
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.4), earthMat)
  gate.position.set(2.1, 0.6, 0)
  gate.castShadow = true
  modelGroup.add(gate)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏘️ 夯土外墙 (厚1.8m)', new THREE.Vector3(2.4, 1.2, 0), '0.9rem')
  makeLabel('🏛️ 中心祖堂', new THREE.Vector3(0, 1.2, 1.2), '0.85rem')
  makeLabel('🪵 木构回廊', new THREE.Vector3(1.8, 1.0, 1.2), '0.8rem')
  makeLabel('🚪 大门', new THREE.Vector3(2.6, 0.9, 0), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initBishushanModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a3a4a)
  scene.fog = new THREE.FogExp2(0x1a3a4a, 0.006)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 4, 8)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-3, 4, 3)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const nanmuMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a, roughness: 0.4 })
  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.8), nanmuMat)
  mainHall.position.set(0, 0.5, 0)
  mainHall.castShadow = true
  modelGroup.add(mainHall)
  const roofMain = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x8a6a3a }))
  roofMain.rotation.y = Math.PI/4
  roofMain.position.set(0, 1.05, 0)
  modelGroup.add(roofMain)
  const yanyuBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), nanmuMat)
  yanyuBase.position.set(2.2, 0.2, 1.6)
  modelGroup.add(yanyuBase)
  const yanyuUpper = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 1.2), nanmuMat)
  yanyuUpper.position.set(2.2, 0.8, 1.6)
  modelGroup.add(yanyuUpper)
  const yanyuRoof = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  yanyuRoof.position.set(2.2, 1.2, 1.6)
  modelGroup.add(yanyuRoof)
  const jinshanBase = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.8, 8), nanmuMat)
  jinshanBase.position.set(-1.8, 0.4, 1.2)
  modelGroup.add(jinshanBase)
  const jinshanRoof = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  jinshanRoof.position.set(-1.8, 0.9, 1.2)
  modelGroup.add(jinshanRoof)
  const water = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), new THREE.MeshStandardMaterial({ color: 0x2a7a9f, transparent: true, opacity: 0.6, side: THREE.DoubleSide }))
  water.rotation.x = -Math.PI/2
  water.position.set(-1, -0.2, -1)
  modelGroup.add(water)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 澹泊敬诚殿 (楠木殿)', new THREE.Vector3(0, 1.3, 1.2), '0.9rem')
  makeLabel('🌧️ 烟雨楼', new THREE.Vector3(2.2, 1.6, 2.0), '0.85rem')
  makeLabel('⛩️ 金山亭', new THREE.Vector3(-1.8, 1.2, 1.8), '0.85rem')
  makeLabel('💧 湖区 (仿西湖)', new THREE.Vector3(-1, 0.2, -1.2), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initHuizhouModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd4e6f0)
  scene.fog = new THREE.FogExp2(0xd4e6f0, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(5, 3.5, 6)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.3, 0)

  const ambient = new THREE.AmbientLight(0x606070, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.1)
  dirLight.position.set(5, 8, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.5)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(12, 10, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0, roughness: 0.6 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.8 })
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xbc8a5a })
  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.8), wallMat)
  mainBody.position.set(0, 0.6, 0)
  mainBody.castShadow = true
  modelGroup.add(mainBody)
  const roofMain = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.5, 4), roofMat)
  roofMain.rotation.y = Math.PI/4
  roofMain.position.set(0, 1.25, 0)
  modelGroup.add(roofMain)
  const horseHeadL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.2), wallMat)
  horseHeadL.position.set(-1.1, 1.0, 0)
  modelGroup.add(horseHeadL)
  const horseHeadR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.2), wallMat)
  horseHeadR.position.set(1.1, 1.0, 0)
  modelGroup.add(horseHeadR)
  const patio = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.0), new THREE.MeshStandardMaterial({ color: 0xbcac8a }))
  patio.position.set(0, 0.05, 0)
  modelGroup.add(patio)
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), woodMat)
  gate.position.set(0, 0.5, 0.95)
  modelGroup.add(gate)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#3a2a1a'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(255,250,230,0.8)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #a57c3c'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏠 马头墙', new THREE.Vector3(-1.3, 1.4, 0.5), '0.8rem')
  makeLabel('🏠 马头墙', new THREE.Vector3(1.3, 1.4, 0.5), '0.8rem')
  makeLabel('🏛️ 徽派门楼', new THREE.Vector3(0, 1.0, 1.1), '0.8rem')
  makeLabel('🌞 天井 (四水归堂)', new THREE.Vector3(0, 0.4, 0.8), '0.8rem')

  const particleCount = 400
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 12
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 10
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initKaifengModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a202a)
  scene.fog = new THREE.FogExp2(0x1a202a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 4, 7)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xba7a4a })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a })
  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 2.0), wallMat)
  mainHall.position.set(0, 0.55, 0)
  mainHall.castShadow = true
  modelGroup.add(mainHall)
  const roofHall = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.6, 4), roofMat)
  roofHall.rotation.y = Math.PI/4
  roofHall.position.set(0, 1.2, 0)
  modelGroup.add(roofHall)
  const yimen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.0), wallMat)
  yimen.position.set(0, 0.4, -1.8)
  modelGroup.add(yimen)
  const roofYimen = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.4, 4), roofMat)
  roofYimen.rotation.y = Math.PI/4
  roofYimen.position.set(0, 0.85, -1.8)
  modelGroup.add(roofYimen)
  const jieshi = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.6), new THREE.MeshStandardMaterial({ color: 0xbc9a6a }))
  jieshi.position.set(0, 0.2, -0.8)
  modelGroup.add(jieshi)
  const towerBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), wallMat)
  towerBase.position.set(2.5, 0.6, 1.2)
  modelGroup.add(towerBase)
  const towerUpper = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.0), wallMat)
  towerUpper.position.set(2.5, 1.2, 1.2)
  modelGroup.add(towerUpper)
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.6, 4), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  towerRoof.position.set(2.5, 1.7, 1.2)
  modelGroup.add(towerRoof)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 大堂 (正堂)', new THREE.Vector3(0, 1.5, 1.2), '0.9rem')
  makeLabel('🚪 仪门', new THREE.Vector3(0, 1.0, -2.2), '0.8rem')
  makeLabel('🗿 戒石铭', new THREE.Vector3(0, 0.6, -0.6), '0.7rem')
  makeLabel('🏯 清心楼', new THREE.Vector3(2.5, 2.0, 1.5), '0.85rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initLuoyangBridgeModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a2a4a)
  scene.fog = new THREE.FogExp2(0x0a2a4a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 3, 9)
  camera.lookAt(0, 0.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.6, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.5)
  fillLight.position.set(-3, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.2, 1.4), stoneMat)
  deck.position.set(0, 0.4, 0)
  deck.castShadow = true
  modelGroup.add(deck)
  for (let i = -2.5; i <= 2.5; i+=1.2) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.7, 8), stoneMat)
    pier.position.set(i, 0.15, 0)
    pier.castShadow = true
    modelGroup.add(pier)
  }
  const towerBase = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), stoneMat)
  towerBase.position.set(-3.2, 0.8, 0.8)
  modelGroup.add(towerBase)
  const towerTop = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0xccaa77 }))
  towerTop.position.set(-3.2, 1.4, 0.8)
  modelGroup.add(towerTop)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 石桥面', new THREE.Vector3(0, 0.9, 1.0), '0.8rem')
  makeLabel('🛶 船形桥墩', new THREE.Vector3(1.5, 0.6, 1.0), '0.8rem')
  makeLabel('🗼 石塔', new THREE.Vector3(-3.2, 1.6, 1.2), '0.8rem')

  const particleCount = 400
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initBellDrumModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a2a3a)
  scene.fog = new THREE.FogExp2(0x2a2a3a, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 4, 7)
  camera.lookAt(0, 1.8, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.8, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(14, 12, 0x88aacc, 0x446688)
  grid.position.y = -0.8
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xbcac8a })
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xba7a4a })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xdbaa33 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 2.2), baseMat)
  base.position.set(-1.5, 0.2, 0)
  modelGroup.add(base)
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), wallMat)
  body.position.set(-1.5, 1.0, 0)
  modelGroup.add(body)
  const roof1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.6, 4), roofMat)
  roof1.rotation.y = Math.PI/4
  roof1.position.set(-1.5, 1.7, 0)
  modelGroup.add(roof1)
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.5, 4), roofMat)
  roof2.position.set(-1.5, 2.2, 0)
  modelGroup.add(roof2)
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 2.2), baseMat)
  base2.position.set(1.5, 0.2, 0)
  modelGroup.add(base2)
  const body2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), wallMat)
  body2.position.set(1.5, 1.0, 0)
  modelGroup.add(body2)
  const roof1b = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.6, 4), roofMat)
  roof1b.rotation.y = Math.PI/4
  roof1b.position.set(1.5, 1.7, 0)
  modelGroup.add(roof1b)
  const roof2b = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.5, 4), roofMat)
  roof2b.position.set(1.5, 2.2, 0)
  modelGroup.add(roof2b)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🕰️ 钟楼', new THREE.Vector3(-1.5, 2.6, 0.8), '0.9rem')
  makeLabel('🥁 鼓楼', new THREE.Vector3(1.5, 2.6, 0.8), '0.9rem')
  makeLabel('重檐歇山顶', new THREE.Vector3(0, 2.5, 1.5), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initYiheyuanModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a4a5a)
  scene.fog = new THREE.FogExp2(0x1a4a5a, 0.005)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 4.5, 9)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 2.0, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 4, 3)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.8
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xbc9a6a }))
  base.position.set(0, 0.25, 0)
  modelGroup.add(base)
  const level1 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xba7a4a }))
  level1.position.set(0, 0.9, 0)
  modelGroup.add(level1)
  const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  roof1.position.set(0, 1.4, 0)
  modelGroup.add(roof1)
  const level2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xba7a4a }))
  level2.position.set(0, 1.9, 0)
  modelGroup.add(level2)
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  roof2.position.set(0, 2.4, 0)
  modelGroup.add(roof2)
  const corridor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 0.8), new THREE.MeshStandardMaterial({ color: 0xbc9a6a }))
  corridor.position.set(2.2, 0.2, 1.5)
  modelGroup.add(corridor)
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshStandardMaterial({ color: 0x2a7a9f, transparent: true, opacity: 0.6, side: THREE.DoubleSide }))
  lake.rotation.x = -Math.PI/2
  lake.position.set(-1.5, -0.2, -1)
  modelGroup.add(lake)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏯 佛香阁 (八角三层)', new THREE.Vector3(0, 2.9, 1.0), '0.9rem')
  makeLabel('🏞️ 长廊', new THREE.Vector3(2.2, 0.8, 2.0), '0.8rem')
  makeLabel('💧 昆明湖', new THREE.Vector3(-1.5, 0.2, -1.5), '0.8rem')

  const particleCount = 600
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 18
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 16
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initChengyangBridgeModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a3a2a)
  scene.fog = new THREE.FogExp2(0x2a3a2a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 3.5, 8)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.2, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-3, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xbc8a5a, roughness: 0.5 })
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9a8a6a })
  
  const pier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.8, 6), stoneMat)
  pier1.position.set(-2.2, 0.1, 0)
  modelGroup.add(pier1)
  const pier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.8, 6), stoneMat)
  pier2.position.set(0, 0.1, 0)
  modelGroup.add(pier2)
  const pier3 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.8, 6), stoneMat)
  pier3.position.set(2.2, 0.1, 0)
  modelGroup.add(pier3)
  
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.15, 1.8), woodMat)
  deck.position.set(0, 0.55, 0)
  deck.castShadow = true
  modelGroup.add(deck)
  
  const towerPos = [-2.2, -1.1, 0, 1.1, 2.2]
  towerPos.forEach(x => {
    const pillar1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 0.18), woodMat)
    pillar1.position.set(x, 1.2, 0.7)
    modelGroup.add(pillar1)
    const pillar2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 0.18), woodMat)
    pillar2.position.set(x, 1.2, -0.7)
    modelGroup.add(pillar2)
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0x8a6a3a }))
    roof.position.set(x, 1.85, 0)
    modelGroup.add(roof)
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
    top.position.set(x, 2.15, 0)
    modelGroup.add(top)
  })
  
  const corridorRoof = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.1, 1.2), new THREE.MeshStandardMaterial({ color: 0x8a6a3a }))
  corridorRoof.position.set(0, 1.6, 0)
  modelGroup.add(corridorRoof)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏯 五座桥亭', new THREE.Vector3(0, 2.4, 1.2), '0.9rem')
  makeLabel('🪵 榫卯木构', new THREE.Vector3(2.0, 1.5, 1.2), '0.8rem')
  makeLabel('石桥墩', new THREE.Vector3(-2.2, 0.6, 1.0), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initDiaolouModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x3a4a5a)
  scene.fog = new THREE.FogExp2(0x3a4a5a, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(5, 4.5, 6)
  camera.lookAt(0, 1.8, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 2.0, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(12, 10, 0x88aacc, 0x446688)
  grid.position.y = -0.8
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbc9a7a, roughness: 0.4 })
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xac8a6a })
  
  const levels = [0.6, 1.2, 1.8, 2.4, 3.0]
  levels.forEach((y, i) => {
    const width = 1.4 - i * 0.05
    const depth = 1.4 - i * 0.05
    const level = new THREE.Mesh(new THREE.BoxGeometry(width, 0.55, depth), wallMat)
    level.position.set(0, y, 0)
    level.castShadow = true
    modelGroup.add(level)
    if (i < 4) {
      const windowGeo = new THREE.BoxGeometry(0.35, 0.3, 0.05)
      const windowMat = new THREE.MeshStandardMaterial({ color: 0x8a7a5a })
      const win = new THREE.Mesh(windowGeo, windowMat)
      win.position.set(0.45, y+0.2, 0.71)
      modelGroup.add(win)
    }
  })
  
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.6), new THREE.MeshStandardMaterial({ color: 0xac9a7a }))
  balcony.position.set(0, 3.35, 0)
  modelGroup.add(balcony)
  
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xccaa77 }))
  dome.position.set(0, 3.7, 0)
  modelGroup.add(dome)
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  spire.position.set(0, 4.0, 0)
  modelGroup.add(spire)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏰 多层碉楼 (防御)', new THREE.Vector3(0, 4.2, 1.2), '0.9rem')
  makeLabel('🔫 燕子窝/枪眼', new THREE.Vector3(0.8, 3.5, 1.2), '0.8rem')
  makeLabel('穹顶装饰', new THREE.Vector3(0, 4.3, 0.8), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 5
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initShenyangPalaceModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a2a3a)
  scene.fog = new THREE.FogExp2(0x2a2a3a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 4, 7)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.8, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xbc9a7a }))
  base.position.set(-1.8, 0.2, 0)
  modelGroup.add(base)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0xba4a3a }))
  body.position.set(-1.8, 0.9, 0)
  modelGroup.add(body)
  const roof1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  roof1.position.set(-1.8, 1.5, 0)
  modelGroup.add(roof1)
  const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  roof2.position.set(-1.8, 2.0, 0)
  modelGroup.add(roof2)
  
  const hall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 1.6), new THREE.MeshStandardMaterial({ color: 0xba7a4a }))
  hall.position.set(1.2, 0.5, 0)
  modelGroup.add(hall)
  const hallRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
  hallRoof.rotation.y = Math.PI/4
  hallRoof.position.set(1.2, 1.05, 0)
  modelGroup.add(hallRoof)
  
  for (let i = -1; i <= 1; i+=1) {
    const ting = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0xbc8a5a }))
    ting.position.set(-2.5 + i*1.2, 0.3, 1.8)
    modelGroup.add(ting)
  }
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 大政殿 (八角重檐)', new THREE.Vector3(-1.8, 2.4, 1.0), '0.9rem')
  makeLabel('🏯 崇政殿', new THREE.Vector3(1.2, 1.6, 1.2), '0.85rem')
  makeLabel('⛺ 十王亭', new THREE.Vector3(-2.0, 1.0, 2.2), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initHongcunModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd4e6f0)
  scene.fog = new THREE.FogExp2(0xd4e6f0, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 7)
  camera.lookAt(0, 1.0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.2, 0)

  const ambient = new THREE.AmbientLight(0x606070, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.1)
  dirLight.position.set(5, 8, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.5)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(14, 12, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f0e0 })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x6a5a4a })
  
  const buildingPositions = [[-1.2,0,0.8], [1.2,0,0.5], [0,0,-1], [2.0,0,0], [-2,0,-0.5]]
  buildingPositions.forEach(([x,z,rot]) => {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.2), wallMat)
    body.position.set(x, 0.45, z)
    body.castShadow = true
    modelGroup.add(body)
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.4, 4), roofMat)
    roof.rotation.y = Math.PI/4
    roof.position.set(x, 0.95, z)
    modelGroup.add(roof)
    const horse = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.2), wallMat)
    horse.position.set(x + 0.8, 0.8, z)
    modelGroup.add(horse)
  })
  
  const moonPond = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0x4a8aaf, transparent: true, opacity: 0.7 }))
  moonPond.position.set(-1.5, 0.02, 1.5)
  modelGroup.add(moonPond)
  
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0xbc9a6a }))
  bridge.position.set(-1.5, 0.2, 1.5)
  modelGroup.add(bridge)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#2a2a1a'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(255,250,230,0.8)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #a57c3c'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏘️ 徽派民居', new THREE.Vector3(0, 1.2, 1.2), '0.85rem')
  makeLabel('🌙 月沼', new THREE.Vector3(-1.5, 0.4, 2.0), '0.8rem')
  makeLabel('画桥', new THREE.Vector3(-1.5, 0.6, 1.8), '0.7rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const particlePositions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i*3] = (Math.random() - 0.5) * 14
    particlePositions[i*3+1] = Math.random() * 3.5
    particlePositions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initPingyaoYamenModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a2a1a)
  scene.fog = new THREE.FogExp2(0x2a2a1a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 8)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xba7a4a })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a })
  
  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.8), wallMat)
  mainHall.position.set(0, 0.5, 0)
  mainHall.castShadow = true
  modelGroup.add(mainHall)
  const roofMain = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.9, 0.5, 4), roofMat)
  roofMain.rotation.y = Math.PI/4
  roofMain.position.set(0, 1.05, 0)
  modelGroup.add(roofMain)
  
  const secondHall = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.6), wallMat)
  secondHall.position.set(0, 0.45, 1.8)
  modelGroup.add(secondHall)
  const roofSecond = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.45, 4), roofMat)
  roofSecond.rotation.y = Math.PI/4
  roofSecond.position.set(0, 0.95, 1.8)
  modelGroup.add(roofSecond)
  
  const yimen = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.0), wallMat)
  yimen.position.set(0, 0.4, -1.6)
  modelGroup.add(yimen)
  
  const stone = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0xbc9a6a }))
  stone.position.set(0, 0.25, -0.8)
  modelGroup.add(stone)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 大堂 (亲民堂)', new THREE.Vector3(0, 1.5, 0.8), '0.9rem')
  makeLabel('🏛️ 二堂', new THREE.Vector3(0, 1.3, 2.2), '0.85rem')
  makeLabel('🚪 仪门', new THREE.Vector3(0, 1.0, -1.2), '0.8rem')
  makeLabel('🗿 戒石坊', new THREE.Vector3(0, 0.7, -0.5), '0.7rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initWutingBridgeModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a5a6a)
  scene.fog = new THREE.FogExp2(0x2a5a6a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3, 8)
  camera.lookAt(0, 0.8, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.0, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  
  const deck = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.2, 1.6), stoneMat)
  deck.position.set(0, 0.4, 0)
  deck.castShadow = true
  modelGroup.add(deck)
  
  for (let i = -2; i <= 2; i++) {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 8), stoneMat)
    pier.position.set(i * 1.2, 0.1, 0)
    modelGroup.add(pier)
  }
  
  const towerPos = [-1.8, -0.9, 0, 0.9, 1.8]
  towerPos.forEach(x => {
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.16), new THREE.MeshStandardMaterial({ color: 0xba7a4a }))
    pillarL.position.set(x, 0.85, 0.6)
    modelGroup.add(pillarL)
    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.9, 0.16), new THREE.MeshStandardMaterial({ color: 0xba7a4a }))
    pillarR.position.set(x, 0.85, -0.6)
    modelGroup.add(pillarR)
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.45, 6), new THREE.MeshStandardMaterial({ color: 0xdbaa33 }))
    roof.position.set(x, 1.35, 0)
    modelGroup.add(roof)
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.35, 6), new THREE.MeshStandardMaterial({ color: 0xccaa77 }))
    top.position.set(x, 1.65, 0)
    modelGroup.add(top)
  })
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏯 五亭桥', new THREE.Vector3(0, 2.0, 1.2), '0.9rem')
  makeLabel('⛩️ 莲花亭', new THREE.Vector3(1.8, 1.9, 0.8), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initDiaojiaoModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a3a2a)
  scene.fog = new THREE.FogExp2(0x2a3a2a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(5, 3.5, 6)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(12, 10, 0x88aacc, 0x446688)
  grid.position.y = -0.8
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xbc8a5a })
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x9a7a4a })
  
  const pillars = [[-0.9,0.3], [0,0.3], [0.9,0.3]]
  pillars.forEach(([x,z]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.9, 6), pillarMat)
    pillar.position.set(x, 0.45, z)
    modelGroup.add(pillar)
  })
  
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.8), woodMat)
  floor.position.set(0, 0.95, 0)
  floor.castShadow = true
  modelGroup.add(floor)
  
  const walls = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.6), woodMat)
  walls.position.set(0, 1.35, 0.1)
  walls.castShadow = true
  modelGroup.add(walls)
  
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x6a4a2a }))
  roof.rotation.y = Math.PI/4
  roof.position.set(0, 1.85, 0)
  modelGroup.add(roof)
  
  const railing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.08), woodMat)
  railing.position.set(0, 1.0, 0.95)
  modelGroup.add(railing)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏡 吊脚楼', new THREE.Vector3(0, 2.2, 1.2), '0.9rem')
  makeLabel('🪵 底部吊柱', new THREE.Vector3(0.9, 0.8, 1.0), '0.8rem')
  makeLabel('🪑 美人靠', new THREE.Vector3(1.2, 1.3, 1.2), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 12
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 10
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initPotalaModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1a2a4a)
  scene.fog = new THREE.FogExp2(0x1a2a4a, 0.006)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 5, 9)
  camera.lookAt(0, 2.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 2.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.3)
  dirLight.position.set(6, 12, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 4, 3)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.9
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0ece0 })
  const redMat = new THREE.MeshStandardMaterial({ color: 0xaa4a3a })
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xdbaa33 })
  
  const leftWhite = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.6), whiteMat)
  leftWhite.position.set(-1.5, 0.9, 0)
  leftWhite.castShadow = true
  modelGroup.add(leftWhite)
  const rightWhite = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 1.6), whiteMat)
  rightWhite.position.set(1.5, 0.9, 0)
  rightWhite.castShadow = true
  modelGroup.add(rightWhite)
  
  const redPalace = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 1.8), redMat)
  redPalace.position.set(0, 1.1, 0)
  redPalace.castShadow = true
  modelGroup.add(redPalace)
  
  const goldRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.4, 8), goldMat)
  goldRoof.position.set(0, 2.2, 0)
  modelGroup.add(goldRoof)
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.7, 8), goldMat)
  spire.position.set(0, 2.55, 0)
  modelGroup.add(spire)
  
  const sideLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), whiteMat)
  sideLeft.position.set(-2.5, 0.6, 1.2)
  modelGroup.add(sideLeft)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏔️ 布达拉宫', new THREE.Vector3(0, 3.2, 1.5), '1.0rem')
  makeLabel('🔴 红宫 (佛殿、灵塔)', new THREE.Vector3(0, 2.5, 1.8), '0.85rem')
  makeLabel('⚪ 白宫 (行政)', new THREE.Vector3(-1.6, 2.0, 1.5), '0.8rem')
  makeLabel('✨ 金顶', new THREE.Vector3(0, 3.0, 1.2), '0.8rem')

  const particleCount = 600
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 18
    positions[i*3+1] = Math.random() * 5
    positions[i*3+2] = (Math.random() - 0.5) * 16
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initQilouModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a3a4a)
  scene.fog = new THREE.FogExp2(0x2a3a4a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 7)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(14, 12, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const groundMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  const upperMat = new THREE.MeshStandardMaterial({ color: 0xba7a4a })
  const columnMat = new THREE.MeshStandardMaterial({ color: 0xac8a5a })
  
  const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 1.2), groundMat)
  groundFloor.position.set(0, 0.5, 0)
  groundFloor.castShadow = true
  modelGroup.add(groundFloor)
  
  const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.5, 1.2), upperMat)
  upperFloor.position.set(0, 1.75, 0)
  upperFloor.castShadow = true
  modelGroup.add(upperFloor)
  
  const corridor = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 2.0), groundMat)
  corridor.position.set(0, 0.5, -0.4)
  modelGroup.add(corridor)
  
  for (let i = -1.2; i <= 1.2; i+=0.8) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.0, 8), columnMat)
    column.position.set(i, 0.5, -0.4)
    modelGroup.add(column)
  }
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏪 骑楼底层 (商铺)', new THREE.Vector3(0, 1.0, 0.8), '0.85rem')
  makeLabel('🏠 居住层', new THREE.Vector3(0, 2.2, 0.8), '0.85rem')
  makeLabel('🚶 骑楼走廊', new THREE.Vector3(0, 0.8, -1.0), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initDaliModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x8ab0c0)
  scene.fog = new THREE.FogExp2(0x8ab0c0, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 7)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x606870, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbc8a5a })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a7a4a })
  
  const gateBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 1.2), wallMat)
  gateBase.position.set(-1.8, 0.6, 0)
  modelGroup.add(gateBase)
  const gateRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.7, 0.5, 4), roofMat)
  gateRoof.rotation.y = Math.PI/4
  gateRoof.position.set(-1.8, 1.25, 0)
  modelGroup.add(gateRoof)
  
  const wuhuaBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.4), wallMat)
  wuhuaBase.position.set(0, 0.5, 0)
  modelGroup.add(wuhuaBase)
  const wuhuaRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.5, 4), roofMat)
  wuhuaRoof.rotation.y = Math.PI/4
  wuhuaRoof.position.set(0, 1.05, 0)
  modelGroup.add(wuhuaRoof)
  
  const house = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0xe0d8c0 }))
  house.position.set(1.8, 0.4, 1.2)
  modelGroup.add(house)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.1), new THREE.MeshStandardMaterial({ color: 0xccaa77 }))
  screen.position.set(1.8, 0.7, 2.0)
  modelGroup.add(screen)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏯 南城门', new THREE.Vector3(-1.8, 1.7, 1.0), '0.85rem')
  makeLabel('🏛️ 五华楼', new THREE.Vector3(0, 1.6, 1.2), '0.85rem')
  makeLabel('🏘️ 白族民居 (三坊一照壁)', new THREE.Vector3(1.8, 1.2, 1.8), '0.85rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initNanjingModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a2a3a)
  scene.fog = new THREE.FogExp2(0x2a2a3a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 4, 8)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(20, 18, 0x88aacc, 0x446688)
  grid.position.y = -0.8
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xbcac8a })
  const brickMat = new THREE.MeshStandardMaterial({ color: 0xac8a6a })
  
  const wumenBase = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.5, 1.8), stoneMat)
  wumenBase.position.set(0, 0.25, -1.8)
  modelGroup.add(wumenBase)
  
  const fengtianBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 2.0), stoneMat)
  fengtianBase.position.set(0, 0.15, 0)
  modelGroup.add(fengtianBase)
  
  for (let i = -0.8; i <= 0.8; i+=0.8) {
    const columnBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.2, 8), brickMat)
    columnBase.position.set(i, 0.35, i)
    modelGroup.add(columnBase)
  }
  
  const moat = new THREE.Mesh(new THREE.PlaneGeometry(5, 3), new THREE.MeshStandardMaterial({ color: 0x2a6a8a, transparent: true, opacity: 0.6, side: THREE.DoubleSide }))
  moat.rotation.x = -Math.PI/2
  moat.position.set(0, -0.3, -2.5)
  modelGroup.add(moat)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 午门遗址', new THREE.Vector3(0, 0.9, -1.2), '0.85rem')
  makeLabel('🏯 奉天殿台基', new THREE.Vector3(0, 0.7, 0.8), '0.85rem')
  makeLabel('💧 护城河', new THREE.Vector3(0, 0.1, -2.8), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 20
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 18
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initYueluModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x4a6a3a)
  scene.fog = new THREE.FogExp2(0x4a6a3a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 7)
  camera.lookAt(0, 1.2, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7a5a3a })
  
  const lecture = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.6), wallMat)
  lecture.position.set(0, 0.45, 0)
  modelGroup.add(lecture)
  const roofLecture = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.5, 4), roofMat)
  roofLecture.rotation.y = Math.PI/4
  roofLecture.position.set(0, 0.95, 0)
  modelGroup.add(roofLecture)
  
  const hexi = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.2), wallMat)
  hexi.position.set(1.8, 0.35, 1.2)
  modelGroup.add(hexi)
  
  const library = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.2), wallMat)
  library.position.set(-1.5, 0.55, 0.8)
  modelGroup.add(library)
  const libRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.4, 4), roofMat)
  libRoof.rotation.y = Math.PI/4
  libRoof.position.set(-1.5, 1.15, 0.8)
  modelGroup.add(libRoof)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('📖 讲堂', new THREE.Vector3(0, 1.4, 1.0), '0.9rem')
  makeLabel('🏛️ 赫曦台', new THREE.Vector3(1.8, 1.1, 1.8), '0.85rem')
  makeLabel('📚 御书楼', new THREE.Vector3(-1.5, 1.6, 1.2), '0.85rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initYuzuiModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a5a6a)
  scene.fog = new THREE.FogExp2(0x2a5a6a, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 2.5, 8)
  camera.lookAt(0, 0.3, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2a7a9f, transparent: true, opacity: 0.6 })
  
  const fishMouth = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 3), stoneMat)
  fishMouth.rotation.z = Math.PI/2
  fishMouth.position.set(0, 0.2, 1.5)
  modelGroup.add(fishMouth)
  
  const dike = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 0.8), stoneMat)
  dike.position.set(0, 0.1, 0)
  modelGroup.add(dike)
  
  const riverLeft = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.5), waterMat)
  riverLeft.rotation.x = -Math.PI/2
  riverLeft.position.set(-1.2, 0, 0.5)
  modelGroup.add(riverLeft)
  const riverRight = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.5), waterMat)
  riverRight.rotation.x = -Math.PI/2
  riverRight.position.set(1.2, 0, 0.5)
  modelGroup.add(riverRight)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🐟 鱼嘴分水堤', new THREE.Vector3(0, 0.8, 1.8), '0.9rem')
  makeLabel('🌊 外江', new THREE.Vector3(1.5, 0.4, 1.2), '0.8rem')
  makeLabel('🌊 内江', new THREE.Vector3(-1.5, 0.4, 1.2), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 18
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 16
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0x6ab0d0, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initYaodongModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd4bc8a)
  scene.fog = new THREE.FogExp2(0xd4bc8a, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(5, 3, 6)
  camera.lookAt(0, 0.8, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.8, 0)

  const ambient = new THREE.AmbientLight(0x606050, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.1)
  dirLight.position.set(5, 8, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.5)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(14, 12, 0x88aacc, 0x446688)
  grid.position.y = -0.6
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const soilMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
  
  const cave = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI*2, 0, Math.PI/2), soilMat)
  cave.scale.set(1.2, 0.6, 1.2)
  cave.position.set(0, 0.35, 0)
  cave.castShadow = true
  modelGroup.add(cave)
  
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.2), new THREE.MeshStandardMaterial({ color: 0xac8a6a }))
  frontWall.position.set(0, 0.45, 0.7)
  modelGroup.add(frontWall)
  
  const windowMat = new THREE.MeshStandardMaterial({ color: 0x8a6a4a })
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.05), windowMat)
  door.position.set(0, 0.35, 0.81)
  modelGroup.add(door)
  
  const lattice = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), windowMat)
  lattice.position.set(0, 0.7, 0.81)
  modelGroup.add(lattice)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#3a2a1a'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(255,250,230,0.8)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #a57c3c'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏠 靠崖窑洞', new THREE.Vector3(0, 1.1, 1.0), '0.9rem')
  makeLabel('🚪 花格窗', new THREE.Vector3(0.6, 0.9, 1.1), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 14
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 12
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initKongmiaoModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a2a1a)
  scene.fog = new THREE.FogExp2(0x2a2a1a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 4, 7)
  camera.lookAt(0, 1.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.5, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xba7a4a })
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xdbaa33 })
  
  const dacheng = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 2.0), wallMat)
  dacheng.position.set(0, 0.6, 0)
  dacheng.castShadow = true
  modelGroup.add(dacheng)
  const roofDacheng = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 0.6, 4), roofMat)
  roofDacheng.rotation.y = Math.PI/4
  roofDacheng.position.set(0, 1.25, 0)
  modelGroup.add(roofDacheng)
  
  for (let i = -0.8; i <= 0.8; i+=1.6) {
    const dragon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xccaa77 }))
    dragon.position.set(i, 0.5, 1.1)
    modelGroup.add(dragon)
  }
  
  const gate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.2), new THREE.MeshStandardMaterial({ color: 0xac8a6a }))
  gate.position.set(0, 0.7, -1.6)
  modelGroup.add(gate)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 大成殿 (黄瓦重檐)', new THREE.Vector3(0, 2.0, 1.4), '0.9rem')
  makeLabel('🐉 龙柱', new THREE.Vector3(0.9, 1.2, 1.3), '0.8rem')
  makeLabel('🚪 棂星门', new THREE.Vector3(0, 1.4, -1.2), '0.85rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initEpangModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x4a3a2a)
  scene.fog = new THREE.FogExp2(0x4a3a2a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(7, 3.5, 8)
  camera.lookAt(0, 0.8, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.8, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const earthMat = new THREE.MeshStandardMaterial({ color: 0xbc9a7a })
  
  const platform = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 2.4), earthMat)
  platform.position.set(0, 0.2, 0)
  modelGroup.add(platform)
  
  for (let x = -1.2; x <= 1.2; x+=1.2) {
    for (let z = -0.8; z <= 0.8; z+=0.8) {
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xac8a6a }))
      column.position.set(x, 0.45, z)
      modelGroup.add(column)
    }
  }
  
  const wall = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 0.2), earthMat)
  wall.position.set(0, 0.35, 1.3)
  modelGroup.add(wall)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 阿房宫前殿台基', new THREE.Vector3(0, 0.9, 1.4), '0.9rem')
  makeLabel('柱础遗迹', new THREE.Vector3(1.2, 0.8, 0.8), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 18
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 16
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initChanganModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x5a4a3a)
  scene.fog = new THREE.FogExp2(0x5a4a3a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(8, 4, 9)
  camera.lookAt(0, 0.6, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.7, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(22, 20, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xbc9a7a })
  
  const cityWall = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 0.6), wallMat)
  cityWall.position.set(0, 0.2, -2.2)
  modelGroup.add(cityWall)
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.4), wallMat)
  gate.position.set(0, 0.45, -2.2)
  modelGroup.add(gate)
  
  const palaceBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.6), wallMat)
  palaceBase.position.set(0, 0.15, 0.8)
  modelGroup.add(palaceBase)
  
  for (let i = -1.5; i <= 1.5; i+=1.5) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0xac8a6a }))
    block.position.set(i, 0.05, -1)
    modelGroup.add(block)
  }
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏰 汉长安城城墙', new THREE.Vector3(0, 0.8, -1.8), '0.85rem')
  makeLabel('🏛️ 未央宫遗址', new THREE.Vector3(0, 0.7, 1.2), '0.85rem')
  makeLabel('🏘️ 里坊', new THREE.Vector3(1.2, 0.4, -0.8), '0.8rem')

  const particleCount = 500
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 22
    positions[i*3+1] = Math.random() * 4
    positions[i*3+2] = (Math.random() - 0.5) * 20
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initWeiyangModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x4a3a2a)
  scene.fog = new THREE.FogExp2(0x4a3a2a, 0.008)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3.5, 7)
  camera.lookAt(0, 1.0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 1.2, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(16, 14, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const earthMat = new THREE.MeshStandardMaterial({ color: 0xbc9a7a })
  
  const terrace1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 2.0), earthMat)
  terrace1.position.set(0, 0.15, 0)
  modelGroup.add(terrace1)
  const terrace2 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.25, 1.7), earthMat)
  terrace2.position.set(0, 0.45, 0)
  modelGroup.add(terrace2)
  const terrace3 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.4), earthMat)
  terrace3.position.set(0, 0.7, 0)
  modelGroup.add(terrace3)
  
  for (let i = -0.6; i <= 0.6; i+=0.6) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.5, 6), new THREE.MeshStandardMaterial({ color: 0xac8a6a }))
    column.position.set(i, 1.0, 0.6)
    modelGroup.add(column)
  }
  
  const corridor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.4), earthMat)
  corridor.position.set(0, 0.25, 1.2)
  modelGroup.add(corridor)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🏛️ 未央宫前殿台基', new THREE.Vector3(0, 1.2, 1.2), '0.9rem')
  makeLabel('立柱遗迹', new THREE.Vector3(0.6, 1.4, 0.8), '0.8rem')
  makeLabel('廊道', new THREE.Vector3(0, 0.6, 1.4), '0.8rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 16
    positions[i*3+1] = Math.random() * 3.5
    positions[i*3+2] = (Math.random() - 0.5) * 14
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0xd4bc7a, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function initLudingModel() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x2a4a5a)
  scene.fog = new THREE.FogExp2(0x2a4a5a, 0.01)

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
  camera.position.set(6, 3, 8)
  camera.lookAt(0, 0.5, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true

  labelRenderer = new CSS2DRenderer()
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  labelRenderer.domElement.style.pointerEvents = 'none'

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.autoRotate = autoRotate.value
  controls.target.set(0, 0.6, 0)

  const ambient = new THREE.AmbientLight(0x404060, 0.7)
  scene.add(ambient)
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
  dirLight.position.set(6, 10, 4)
  dirLight.castShadow = true
  scene.add(dirLight)
  const fillLight = new THREE.PointLight(0xccaa88, 0.6)
  fillLight.position.set(-2, 3, 2)
  scene.add(fillLight)
  const grid = new THREE.GridHelper(18, 16, 0x88aacc, 0x446688)
  grid.position.y = -0.7
  grid.material.transparent = true
  grid.material.opacity = 0.3
  scene.add(grid)

  modelGroup = new THREE.Group()
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x8a7a6a, metalness: 0.7, roughness: 0.3 })
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })

  for (let i = -0.8; i <= 0.8; i+=0.27) {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5.5, 8), ironMat)
    chain.rotation.z = Math.PI/2
    chain.position.set(i, 0.45, 0)
    modelGroup.add(chain)
  }

  const planks = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 1.2), woodMat)
  planks.position.set(0, 0.5, 0)
  planks.castShadow = true
  modelGroup.add(planks)

  const pavilion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.2), new THREE.MeshStandardMaterial({ color: 0xbc8a5a }))
  pavilion.position.set(-3.2, 0.6, 0)
  modelGroup.add(pavilion)
  const pavRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x8a6a3a }))
  pavRoof.rotation.y = Math.PI/4
  pavRoof.position.set(-3.2, 1.15, 0)
  modelGroup.add(pavRoof)
  scene.add(modelGroup)

  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      originalPositions.push({ object: child, position: child.position.clone() })
    }
  })

  function makeLabel(text, pos, fontSize='0.85rem') {
    const div = document.createElement('div')
    div.textContent = text
    div.style.color = '#ffefc0'
    div.style.fontSize = fontSize
    div.style.background = 'rgba(0,0,0,0.65)'
    div.style.padding = '2px 12px'
    div.style.borderRadius = '24px'
    div.style.borderLeft = '3px solid #d4af37'
    div.style.whiteSpace = 'nowrap'
    const label = new CSS2DObject(div)
    label.position.copy(pos)
    scene.add(label)
  }
  makeLabel('🌉 泸定桥 (铁索桥)', new THREE.Vector3(0, 1.1, 1.2), '0.9rem')
  makeLabel('⛓️ 13根铁链', new THREE.Vector3(0.8, 0.8, 1.1), '0.8rem')
  makeLabel('🏯 桥亭', new THREE.Vector3(-3.2, 1.4, 0.8), '0.85rem')

  const particleCount = 450
  const particlesGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 18
    positions[i*3+1] = Math.random() * 3
    positions[i*3+2] = (Math.random() - 0.5) * 16
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const particlesMat = new THREE.PointsMaterial({ color: 0x6ab0d0, size: 0.04, transparent: true, opacity: 0.4 })
  particles = new THREE.Points(particlesGeo, particlesMat)
  scene.add(particles)
}

function renderModel() {
  if (!containerRef.value) return

  if (renderer && labelRenderer) {
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    labelRenderer.setSize(width, height)

    if (renderer.domElement.parent !== containerRef.value) {
      containerRef.value.innerHTML = ''
      containerRef.value.appendChild(renderer.domElement)
      containerRef.value.appendChild(labelRenderer.domElement)
    }
  }
}

function animate() {
  requestAnimationFrame(animate)
  if (particles) {
    particles.rotation.y = Math.sin(Date.now() * 0.0001) * 0.1
    particles.rotation.x = Math.sin(Date.now() * 0.00007) * 0.05
  }
  if (controls) {
    controls.update()
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
  if (labelRenderer && scene && camera) {
    labelRenderer.render(scene, camera)
  }
}

function handleResize() {
  renderModel()
}

function handleFullscreenChange() {
  isFullscreen = !!(document.fullscreenElement || 
                   document.mozFullScreenElement || 
                   document.webkitFullscreenElement || 
                   document.msFullscreenElement)
}

function initModel(buildingName) {
  originalPositions = []
  particles = null
  modelGroup = null

  // 先匹配具体建筑，再匹配通用关键词（顺序很重要！）
  if (buildingName.includes('沈阳故宫')) {
    modelName.value = '沈阳故宫'
    initShenyangPalaceModel()
  } else if (buildingName.includes('南京') || buildingName.includes('明故宫')) {
    modelName.value = '南京明故宫'
    initNanjingModel()
  } else if (buildingName.includes('北京四合院') || buildingName.includes('四合院')) {
    modelName.value = '北京四合院'
    initSiheyuanModel()
  } else if (buildingName.includes('故宫')) {
    modelName.value = '北京故宫'
    initPalaceModel()
  } else if (buildingName.includes('布达拉宫')) {
    modelName.value = '布达拉宫'
    initPotalaModel()
  } else if (buildingName.includes('阿房宫')) {
    modelName.value = '阿房宫遗址'
    initEpangModel()
  } else if (buildingName.includes('未央宫')) {
    modelName.value = '未央宫'
    initWeiyangModel()
  } else if (buildingName.includes('避暑山庄')) {
    modelName.value = '承德避暑山庄'
    initBishushanModel()
  } else if (buildingName.includes('平遥古城县衙') || buildingName.includes('平遥')) {
    modelName.value = '平遥古城县衙'
    initPingyaoYamenModel()
  } else if (buildingName.includes('内乡县衙') || buildingName.includes('县衙') || buildingName.includes('内乡')) {
    modelName.value = '内乡县衙'
    initYamenModel()
  } else if (buildingName.includes('开封府') || buildingName.includes('开封')) {
    modelName.value = '开封府'
    initKaifengModel()
  } else if (buildingName.includes('岳麓书院') || buildingName.includes('岳麓')) {
    modelName.value = '岳麓书院'
    initYueluModel()
  } else if (buildingName.includes('曲阜孔庙') || buildingName.includes('曲阜') || buildingName.includes('孔庙')) {
    modelName.value = '曲阜孔庙'
    initKongmiaoModel()
  } else if (buildingName.includes('汉长安城') || buildingName.includes('汉长安')) {
    modelName.value = '汉长安城'
    initChanganModel()
  } else if (buildingName.includes('西安钟鼓楼') || buildingName.includes('钟鼓楼')) {
    modelName.value = '西安钟鼓楼'
    initBellDrumModel()
  } else if (buildingName.includes('卢沟桥')) {
    modelName.value = '卢沟桥'
    initBridgeModel()
  } else if (buildingName.includes('赵州桥')) {
    modelName.value = '赵州桥'
    initZhaozhouBridgeModel()
  } else if (buildingName.includes('程阳风雨桥') || buildingName.includes('风雨桥')) {
    modelName.value = '程阳风雨桥'
    initChengyangBridgeModel()
  } else if (buildingName.includes('五亭桥')) {
    modelName.value = '五亭桥'
    initWutingBridgeModel()
  } else if (buildingName.includes('洛阳桥')) {
    modelName.value = '洛阳桥'
    initLuoyangBridgeModel()
  } else if (buildingName.includes('泸定桥')) {
    modelName.value = '泸定桥'
    initLudingModel()
  } else if (buildingName.includes('都江堰鱼嘴') || buildingName.includes('都江堰')) {
    modelName.value = '都江堰鱼嘴'
    initYuzuiModel()
  } else if (buildingName.includes('福建土楼') || buildingName.includes('土楼')) {
    modelName.value = '福建土楼'
    initTulouModel()
  } else if (buildingName.includes('开平碉楼') || buildingName.includes('碉楼')) {
    modelName.value = '开平碉楼'
    initDiaolouModel()
  } else if (buildingName.includes('宏村古民居') || buildingName.includes('宏村')) {
    modelName.value = '宏村古民居'
    initHongcunModel()
  } else if (buildingName.includes('徽州民居') || buildingName.includes('徽州')) {
    modelName.value = '徽州民居'
    initHuizhouModel()
  } else if (buildingName.includes('土家族吊脚楼') || buildingName.includes('吊脚楼')) {
    modelName.value = '土家族吊脚楼'
    initDiaojiaoModel()
  } else if (buildingName.includes('广东骑楼') || buildingName.includes('骑楼')) {
    modelName.value = '广东骑楼'
    initQilouModel()
  } else if (buildingName.includes('大理古城') || buildingName.includes('大理')) {
    modelName.value = '大理古城'
    initDaliModel()
  } else if (buildingName.includes('陕北窑洞') || buildingName.includes('窑洞')) {
    modelName.value = '陕北窑洞'
    initYaodongModel()
  } else if (buildingName.includes('颐和园')) {
    modelName.value = '颐和园'
    initYiheyuanModel()
  } else {
    modelName.value = buildingName || '北京故宫'
    initPalaceModel()
  }

  animate()
}

watch(autoRotate, (value) => {
  if (controls) {
    controls.autoRotate = value
  }
})

watch(exploded, (value) => {
  if (originalPositions.length > 0) {
    originalPositions.forEach(({ object, position }) => {
      if (value) {
        const center = new THREE.Vector3(0, 0, 0)
        const direction = position.clone().sub(center).normalize()
        const distance = position.distanceTo(center) * 0.3
        object.position.copy(position).add(direction.multiplyScalar(distance))
      } else {
        object.position.copy(position)
      }
    })
  }
})

onMounted(() => {
  const buildingParam = route.query.building
  initModel(buildingParam || '北京故宫')
  renderModel()
  window.addEventListener('resize', handleResize)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  
  // 页面加载时自动进入全屏
  setTimeout(() => {
    toggleFullscreen()
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  
  // 退出全屏
  if (isFullscreen) {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
  
  if (renderer) {
    if (renderer.domElement.parent) {
      renderer.domElement.parent.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }
  if (labelRenderer) {
    if (labelRenderer.domElement.parent) {
      labelRenderer.domElement.parent.removeChild(labelRenderer.domElement)
    }
  }
})
</script>

<style scoped>
.fullscreen-3d {
  width: 100vw;
  height: 100vh;
  background: #0a1a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen-header {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.model-title {
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-item {
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
}

.control-item input[type="checkbox"] {
  accent-color: #d4af37;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fullscreen-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.fullscreen-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>