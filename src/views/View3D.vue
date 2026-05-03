<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { sunmaoModels } from '../data/sunmaoModels'
import Sunmao3DViewer from '../components/charts/Sunmao3DViewer.vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { useRoute } from 'vue-router'

const selectedModel = ref(sunmaoModels.find(m => m.name === '北京故宫') || sunmaoModels[0])
const autoRotate = ref(true)
const exploded = ref(false)

const route = useRoute()

const categories = computed(() => {
  return [...new Set(sunmaoModels.map(m => m.category))]
})

const filteredModels = computed(() => {
  return sunmaoModels.filter(m => m.category === selectedModel.value?.category || !selectedModel.value)
})

function selectModel(model) {
  selectedModel.value = model
}

function selectCategory(category) {
  const models = sunmaoModels.filter(m => m.category === category)
  if (models.length > 0) {
    selectedModel.value = models[0]
  }
}

const viewerRef = ref(null)
const bridgeContainer = ref(null)

function handleReset() {
  viewerRef.value?.resetView()
}

function handleToggleExplode() {
  exploded.value = !exploded.value
}

function handleToggleRotate() {
  autoRotate.value = !autoRotate.value
}

// 卢沟桥 3D 模型
let bridgeScene, bridgeCamera, bridgeRenderer, bridgeLabelRenderer, bridgeControls
let bridgeGroup
let bridgeOriginalPositions = []

// 故宫 3D 模型
let palaceScene, palaceCamera, palaceRenderer, palaceLabelRenderer, palaceControls
let palaceGroup
let palaceOriginalPositions = []

// 内乡县衙 3D 模型
let yamenScene, yamenCamera, yamenRenderer, yamenLabelRenderer, yamenControls
let yamenGroup
let yamenOriginalPositions = []

// 北京四合院 3D 模型
let siheyuanScene, siheyuanCamera, siheyuanRenderer, siheyuanLabelRenderer, siheyuanControls
let siheyuanGroup
let siheyuanOriginalPositions = []

function initBridgeModel() {
  if (!bridgeScene) {
    bridgeScene = new THREE.Scene()
    bridgeScene.background = new THREE.Color(0x0a1030)
    bridgeScene.fog = new THREE.FogExp2(0x0a1030, 0.008)

    bridgeCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    bridgeCamera.position.set(16, 8, 18)
    bridgeCamera.lookAt(0, 0.5, 0)

    bridgeRenderer = new THREE.WebGLRenderer({ antialias: true })
    bridgeRenderer.setPixelRatio(window.devicePixelRatio)
    bridgeRenderer.shadowMap.enabled = true
    bridgeRenderer.shadowMap.type = THREE.PCFSoftShadowMap

    bridgeLabelRenderer = new CSS2DRenderer()
    bridgeLabelRenderer.domElement.style.position = 'absolute'
    bridgeLabelRenderer.domElement.style.top = '0px'
    bridgeLabelRenderer.domElement.style.left = '0px'
    bridgeLabelRenderer.domElement.style.pointerEvents = 'none'

    bridgeControls = new OrbitControls(bridgeCamera, bridgeRenderer.domElement)
    bridgeControls.enableDamping = true
    bridgeControls.dampingFactor = 0.05
    bridgeControls.rotateSpeed = 1.0
    bridgeControls.zoomSpeed = 1.2
    bridgeControls.panSpeed = 0.8
    bridgeControls.enableZoom = true
    bridgeControls.enablePan = true
    bridgeControls.target.set(0, 1.2, 0)

    const ambientLight = new THREE.AmbientLight(0x404060, 0.65)
    bridgeScene.add(ambientLight)

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
    bridgeScene.add(dirLight)

    const backLight = new THREE.PointLight(0xccaa66, 0.5)
    backLight.position.set(-3, 4, -5)
    bridgeScene.add(backLight)

    const fillLight = new THREE.PointLight(0x88aaff, 0.4)
    fillLight.position.set(0, -2, 0)
    bridgeScene.add(fillLight)

    const archLight = new THREE.PointLight(0xffaa66, 0.6)
    archLight.position.set(0, 1, 0)
    bridgeScene.add(archLight)

    const gridHelper = new THREE.GridHelper(40, 20, 0x88aaff, 0x335588)
    gridHelper.position.y = -1.2
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.35
    bridgeScene.add(gridHelper)

    const waterPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 18),
      new THREE.MeshStandardMaterial({ color: 0x2a6f8f, roughness: 0.4, metalness: 0.7, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
    )
    waterPlane.rotation.x = -Math.PI / 2
    waterPlane.position.y = -0.95
    waterPlane.receiveShadow = true
    bridgeScene.add(waterPlane)

    bridgeGroup = new THREE.Group()

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
      new THREE.MeshStandardMaterial({ color: 0xbc9a6c, roughness: 0.7, metalness: 0.1, name: "deck" })
    )
    deckBase.position.set(0, pierHeight + deckHeight/2, 0)
    deckBase.castShadow = true
    deckBase.receiveShadow = true
    bridgeGroup.add(deckBase)

    const stoneStripes = new THREE.Mesh(
      new THREE.BoxGeometry(bridgeLength, 0.05, bridgeWidth - 0.2),
      new THREE.MeshStandardMaterial({ color: 0xcdae7a, roughness: 0.8 })
    )
    stoneStripes.position.set(0, pierHeight + deckHeight - 0.02, 0)
    stoneStripes.castShadow = false
    bridgeGroup.add(stoneStripes)

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
      bridgeGroup.add(pierBody)

      const cutterGeo = new THREE.CylinderGeometry(0.28, 0.52, waterCutterLen, 8)
      const cutterMat = new THREE.MeshStandardMaterial({ color: 0xaa8866, roughness: 0.4 })
      const frontCutter = new THREE.Mesh(cutterGeo, cutterMat)
      frontCutter.rotation.x = Math.PI / 2
      frontCutter.rotation.z = 0
      frontCutter.position.set(xPos, pierHeight * 0.65, pierDepth/2 + waterCutterLen/2)
      frontCutter.castShadow = true
      bridgeGroup.add(frontCutter)

      const backCutter = new THREE.Mesh(cutterGeo, cutterMat)
      backCutter.rotation.x = Math.PI / 2
      backCutter.position.set(xPos, pierHeight * 0.6, -pierDepth/2 - waterCutterLen/2)
      backCutter.castShadow = true
      bridgeGroup.add(backCutter)
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
        bridgeGroup.add(archBlock)
      }

      const archStripe = new THREE.Mesh(
        new THREE.TorusGeometry(archRadius + 0.05, 0.08, 16, 40, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xd4b87a, metalness: 0.3 })
      )
      archStripe.rotation.x = Math.PI / 2
      archStripe.rotation.z = 0
      archStripe.position.set(centerX, archStartY + 0.05, 0)
      bridgeGroup.add(archStripe)
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
      const earMat = new THREE.MeshStandardMaterial({ color: 0xbc8f4a })
      const leftEar = new THREE.Mesh(earGeo, earMat)
      leftEar.position.set(-0.06, 0.25, 0.02)
      const rightEar = new THREE.Mesh(earGeo, earMat)
      rightEar.position.set(0.06, 0.25, 0.02)
      lionGroup.add(leftEar)
      lionGroup.add(rightEar)

      const mane = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.03, 8, 20),
        new THREE.MeshStandardMaterial({ color: 0xa57248 })
      )
      mane.position.set(0, 0.12, 0.05)
      mane.rotation.x = Math.PI/2
      lionGroup.add(mane)

      lionGroup.position.set(posX, yBase + 0.2, posZ)
      parent.add(lionGroup)
    }

    const zOffsets = [bridgeWidth/2 - 0.1, -bridgeWidth/2 + 0.1]
    zOffsets.forEach(zSide => {
      for (let i = 0; i < pillarCount; i++) {
        const xPos = startXRail + i * stepX
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarDepth),
          new THREE.MeshStandardMaterial({ color: railingColor, roughness: 0.3 })
        )
        pillar.position.set(xPos, pierHeight + deckHeight + pillarHeight/2, zSide)
        pillar.castShadow = true
        bridgeGroup.add(pillar)

        addLionShape(bridgeGroup, xPos, zSide, pierHeight + deckHeight + pillarHeight - 0.02)

        if (i < pillarCount - 1) {
          const nextX = startXRail + (i+1) * stepX
          const centerX = (xPos + nextX) / 2
          const lenX = Math.abs(nextX - xPos) - 0.08
          if (lenX > 0.05) {
            const railingPlank = new THREE.Mesh(
              new THREE.BoxGeometry(lenX, railingHeight, railingThick),
              new THREE.MeshStandardMaterial({ color: 0xac8060, roughness: 0.6 })
            )
            railingPlank.position.set(centerX, pierHeight + deckHeight + 0.12, zSide + (zSide > 0 ? 0.05 : -0.05))
            railingPlank.castShadow = true
            bridgeGroup.add(railingPlank)
          }
        }
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
      bridgeGroup.add(huabiaoBase)

      const topDeco = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xe5c28e })
      )
      topDeco.position.set(xPos, 0.85, bridgeWidth/2 + 0.25)
      bridgeGroup.add(topDeco)

      const huabiaoBase2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 1.0, 8),
        new THREE.MeshStandardMaterial({ color: 0xcbaa7a })
      )
      huabiaoBase2.position.set(xPos, 0.3, -bridgeWidth/2 - 0.25)
      huabiaoBase2.castShadow = true
      bridgeGroup.add(huabiaoBase2)

      const topDeco2 = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xe5c28e })
      )
      topDeco2.position.set(xPos, 0.85, -bridgeWidth/2 - 0.25)
      bridgeGroup.add(topDeco2)
    })

    for (let i = -6; i <= 6; i++) {
      const lineX = i * 0.95
      const lineMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, bridgeWidth - 0.4),
        new THREE.MeshStandardMaterial({ color: 0x9c7a4c })
      )
      lineMesh.position.set(lineX, pierHeight + deckHeight + 0.03, 0)
      lineMesh.castShadow = false
      bridgeGroup.add(lineMesh)
    }

    bridgeScene.add(bridgeGroup)

    // 保存原始位置
    bridgeGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        bridgeOriginalPositions.push({
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
      bridgeScene.add(label)
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
    const particlesSys = new THREE.Points(particlesGeometry, particlesMat)
    bridgeScene.add(particlesSys)

    const backMount = new THREE.Mesh(
      new THREE.CylinderGeometry(12, 16, 2.5, 32),
      new THREE.MeshStandardMaterial({ color: 0x4a5b66, roughness: 0.9, transparent: true, opacity: 0.4 })
    )
    backMount.position.set(-7, -1, -12)
    bridgeScene.add(backMount)

    let time = 0
    function animateBridge() {
      requestAnimationFrame(animateBridge)
      time += 0.012
      particlesSys.rotation.y = Math.sin(time * 0.1) * 0.05
      particlesSys.rotation.x = Math.sin(time * 0.07) * 0.03
      bridgeControls.update()
      if (bridgeRenderer && bridgeScene && bridgeCamera) {
        bridgeRenderer.render(bridgeScene, bridgeCamera)
      }
      if (bridgeLabelRenderer && bridgeScene && bridgeCamera) {
        bridgeLabelRenderer.render(bridgeScene, bridgeCamera)
      }
    }
    animateBridge()
  }
}

function renderBridgeModel(container) {
  if (!bridgeScene) {
    initBridgeModel()
  }
  
  if (bridgeRenderer && bridgeLabelRenderer) {
    const width = container.clientWidth
    const height = container.clientHeight
    
    bridgeCamera.aspect = width / height
    bridgeCamera.updateProjectionMatrix()
    bridgeRenderer.setSize(width, height)
    bridgeLabelRenderer.setSize(width, height)
    
    if (bridgeRenderer.domElement.parent !== container) {
      container.innerHTML = ''
      container.appendChild(bridgeRenderer.domElement)
      container.appendChild(bridgeLabelRenderer.domElement)
    }
  }
}

function clearBridgeModel() {
  if (bridgeRenderer) {
    if (bridgeRenderer.domElement.parent) {
      bridgeRenderer.domElement.parent.removeChild(bridgeRenderer.domElement)
    }
    bridgeRenderer.dispose()
  }
  if (bridgeLabelRenderer) {
    if (bridgeLabelRenderer.domElement.parent) {
      bridgeLabelRenderer.domElement.parent.removeChild(bridgeLabelRenderer.domElement)
    }
  }
  bridgeScene = null
  bridgeCamera = null
  bridgeRenderer = null
  bridgeLabelRenderer = null
  bridgeControls = null
  bridgeGroup = null
}

function initPalaceModel() {
  if (!palaceScene) {
    palaceScene = new THREE.Scene()
    palaceScene.background = new THREE.Color(0x0a1a2a)
    palaceScene.fog = new THREE.FogExp2(0x0a1a2a, 0.006)

    palaceCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
    palaceCamera.position.set(12, 7, 15)
    palaceCamera.lookAt(0, 1.5, 0)

    palaceRenderer = new THREE.WebGLRenderer({ antialias: true })
    palaceRenderer.setPixelRatio(window.devicePixelRatio)
    palaceRenderer.shadowMap.enabled = true
    palaceRenderer.shadowMap.type = THREE.PCFSoftShadowMap

    palaceLabelRenderer = new CSS2DRenderer()
    palaceLabelRenderer.domElement.style.position = 'absolute'
    palaceLabelRenderer.domElement.style.top = '0px'
    palaceLabelRenderer.domElement.style.left = '0px'
    palaceLabelRenderer.domElement.style.pointerEvents = 'none'

    palaceControls = new OrbitControls(palaceCamera, palaceRenderer.domElement)
    palaceControls.enableDamping = true
    palaceControls.dampingFactor = 0.05
    palaceControls.rotateSpeed = 0.8
    palaceControls.zoomSpeed = 1.2
    palaceControls.enablePan = true
    palaceControls.target.set(0, 2, 0)

    const ambient = new THREE.AmbientLight(0x404060, 0.7)
    palaceScene.add(ambient)

    const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.2)
    dirLight.position.set(5, 12, 4)
    dirLight.castShadow = true
    dirLight.receiveShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    palaceScene.add(dirLight)

    const fillLight = new THREE.PointLight(0xccaa77, 0.5)
    fillLight.position.set(-3, 5, 3)
    palaceScene.add(fillLight)

    const backLight = new THREE.PointLight(0x88aaff, 0.4)
    backLight.position.set(0, 3, -6)
    palaceScene.add(backLight)

    const gridHelper = new THREE.GridHelper(40, 20, 0x88aacc, 0x335577)
    gridHelper.position.y = -0.8
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.3
    palaceScene.add(gridHelper)

    palaceGroup = new THREE.Group()

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
      palaceGroup.add(base)

      const railMat = new THREE.MeshStandardMaterial({ color: 0xddccaa })
      for (let side = -1; side <= 1; side+=2) {
        for (let x = -level.w/2+0.3; x <= level.w/2; x+=0.65) {
          const pillar = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.28, 0.12),
            railMat
          )
          pillar.position.set(x, level.y + 0.3, side * (level.d/2 - 0.1))
          pillar.castShadow = true
          palaceGroup.add(pillar)
        }
        for (let z = -level.d/2+0.3; z <= level.d/2; z+=0.65) {
          const pillar = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.28, 0.12),
            railMat
          )
          pillar.position.set(side * (level.w/2 - 0.1), level.y + 0.3, z)
          pillar.castShadow = true
          palaceGroup.add(pillar)
        }
      }
    })

    const halls = [
      { name: "太和殿", x: 0, z: 0, w: 3.8, h: 1.4, d: 2.6, roofColor: 0xe6b422, wallColor: 0xba2d2d, roofStyle: "重檐" },
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
      palaceGroup.add(walls)

      const roofMat = new THREE.MeshStandardMaterial({ color: hall.roofColor, metalness: 0.3, roughness: 0.4 })
      const roofMain = new THREE.Mesh(
        new THREE.CylinderGeometry(hall.w*0.7, hall.w*0.95, 0.5, 4),
        roofMat
      )
      roofMain.rotation.y = Math.PI/4
      roofMain.position.set(hall.x, 0.95 + baseLevels[2].y + hall.h, hall.z)
      roofMain.castShadow = true
      palaceGroup.add(roofMain)

      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(hall.w*0.9, 0.1, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xffdd88 })
      )
      ridge.position.set(hall.x, 0.95 + baseLevels[2].y + hall.h + 0.28, hall.z)
      palaceGroup.add(ridge)

      if (hall.name === "太和殿") {
        const lowerRoof = new THREE.Mesh(
          new THREE.CylinderGeometry(hall.w*0.85, hall.w*0.95, 0.35, 4),
          roofMat
        )
        lowerRoof.rotation.y = Math.PI/4
        lowerRoof.position.set(hall.x, 0.95 + baseLevels[2].y + hall.h - 0.35, hall.z)
        lowerRoof.castShadow = true
        palaceGroup.add(lowerRoof)
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
      palaceGroup.add(bridge)

      const pillarL = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.35, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xeeddcc })
      )
      pillarL.position.set(i*1.5 - 0.35, -0.15, -4.5)
      palaceGroup.add(pillarL)

      const pillarR = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.35, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xeeddcc })
      )
      pillarR.position.set(i*1.5 + 0.35, -0.15, -4.5)
      palaceGroup.add(pillarR)
    }

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 18),
      new THREE.MeshStandardMaterial({ color: 0xaa3a3a })
    )
    leftWall.position.set(-8.2, 0.6, 0)
    leftWall.castShadow = true
    palaceGroup.add(leftWall)

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 18),
      new THREE.MeshStandardMaterial({ color: 0xaa3a3a })
    )
    rightWall.position.set(8.2, 0.6, 0)
    rightWall.castShadow = true
    palaceGroup.add(rightWall)

    palaceScene.add(palaceGroup)

    // 保存原始位置
    palaceGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        palaceOriginalPositions.push({
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
      palaceScene.add(label)
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
    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0xffcc88, size: 0.045, transparent: true, opacity: 0.45 })
    )
    palaceScene.add(particles)

    function animatePalace() {
      requestAnimationFrame(animatePalace)
      particles.rotation.y = Math.sin(Date.now() * 0.0001) * 0.1
      particles.rotation.x = Math.sin(Date.now() * 0.00007) * 0.05
      palaceControls.update()
      if (palaceRenderer && palaceScene && palaceCamera) {
        palaceRenderer.render(palaceScene, palaceCamera)
      }
      if (palaceLabelRenderer && palaceScene && palaceCamera) {
        palaceLabelRenderer.render(palaceScene, palaceCamera)
      }
    }
    animatePalace()
  }
}

function renderPalaceModel(container) {
  if (!palaceScene) {
    initPalaceModel()
  }
  
  if (palaceRenderer && palaceLabelRenderer) {
    const width = container.clientWidth
    const height = container.clientHeight
    
    palaceCamera.aspect = width / height
    palaceCamera.updateProjectionMatrix()
    palaceRenderer.setSize(width, height)
    palaceLabelRenderer.setSize(width, height)
    
    if (palaceRenderer.domElement.parent !== container) {
      container.innerHTML = ''
      container.appendChild(palaceRenderer.domElement)
      container.appendChild(palaceLabelRenderer.domElement)
    }
  }
}

function clearPalaceModel() {
  if (palaceRenderer) {
    if (palaceRenderer.domElement.parent) {
      palaceRenderer.domElement.parent.removeChild(palaceRenderer.domElement)
    }
    palaceRenderer.dispose()
  }
  if (palaceLabelRenderer) {
    if (palaceLabelRenderer.domElement.parent) {
      palaceLabelRenderer.domElement.parent.removeChild(palaceLabelRenderer.domElement)
    }
  }
  palaceScene = null
  palaceCamera = null
  palaceRenderer = null
  palaceLabelRenderer = null
  palaceControls = null
  palaceGroup = null
}

function initYamenModel() {
  if (!yamenScene) {
    yamenScene = new THREE.Scene()
    yamenScene.background = new THREE.Color(0x112233)
    yamenScene.fog = new THREE.FogExp2(0x112233, 0.01)

    yamenCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 400)
    yamenCamera.position.set(8, 5, 12)
    yamenCamera.lookAt(0, 1, 0)

    yamenRenderer = new THREE.WebGLRenderer({ antialias: true })
    yamenRenderer.setPixelRatio(window.devicePixelRatio)
    yamenRenderer.shadowMap.enabled = true

    yamenLabelRenderer = new CSS2DRenderer()
    yamenLabelRenderer.domElement.style.position = 'absolute'
    yamenLabelRenderer.domElement.style.top = '0px'
    yamenLabelRenderer.domElement.style.left = '0px'
    yamenLabelRenderer.domElement.style.pointerEvents = 'none'

    yamenControls = new OrbitControls(yamenCamera, yamenRenderer.domElement)
    yamenControls.enableDamping = true
    yamenControls.dampingFactor = 0.05
    yamenControls.target.set(0, 1.5, 0)

    const ambient = new THREE.AmbientLight(0x4a5b6e, 0.7)
    yamenScene.add(ambient)

    const mainLight = new THREE.DirectionalLight(0xffeec9, 1.1)
    mainLight.position.set(6, 10, 4)
    mainLight.castShadow = true
    yamenScene.add(mainLight)

    const fillLight = new THREE.PointLight(0xccaa88, 0.5)
    fillLight.position.set(-2, 3, 3)
    yamenScene.add(fillLight)

    yamenGroup = new THREE.Group()

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 12),
      new THREE.MeshStandardMaterial({ color: 0x6b5a48, roughness: 0.8, side: THREE.DoubleSide })
    )
    ground.rotation.x = -Math.PI/2
    ground.position.y = -0.2
    ground.receiveShadow = true
    yamenScene.add(ground)

    function addBuilding(name, x, z, width, depth, height, wallColor, roofColor, hasPlatform=false) {
      const platformY = hasPlatform ? 0.2 : 0
      if(hasPlatform) {
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(width+0.4, 0.2, depth+0.4),
          new THREE.MeshStandardMaterial({ color: 0xbcac8a, roughness: 0.6 })
        )
        platform.position.set(x, platformY, z)
        platform.castShadow = true
        yamenGroup.add(platform)
      }
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.4 })
      )
      walls.position.set(x, platformY + height/2, z)
      walls.castShadow = true
      walls.receiveShadow = true
      yamenGroup.add(walls)

      const roofLen = width + 0.2
      const roofHeight = 0.45
      const roofGeo = new THREE.CylinderGeometry(roofLen*0.7, roofLen*0.9, roofHeight, 4)
      const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 }))
      roof.rotation.y = Math.PI/4
      roof.position.set(x, platformY + height + roofHeight/2 - 0.05, z)
      roof.castShadow = true
      yamenGroup.add(roof)

      const ridge = new THREE.Mesh(
        new THREE.BoxGeometry(roofLen-0.2, 0.06, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xaa8866 })
      )
      ridge.position.set(x, platformY + height + roofHeight - 0.03, z)
      yamenGroup.add(ridge)
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
      yamenGroup.add(wall)

      const sRoof = new THREE.Mesh(
        new THREE.CylinderGeometry(w*0.8, w*0.9, 0.3, 4),
        new THREE.MeshStandardMaterial({ color: 0x765a3a })
      )
      sRoof.rotation.y = Math.PI/4
      sRoof.position.set(x, 0.75, z)
      yamenGroup.add(sRoof)
    })

    const yuetai = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.2, 2.8),
      new THREE.MeshStandardMaterial({ color: 0xbcac8a })
    )
    yuetai.position.set(0, 0.05, -0.3)
    yuetai.castShadow = true
    yamenGroup.add(yuetai)

    const lionMat = new THREE.MeshStandardMaterial({ color: 0xbd9e6b })
    const lionLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), lionMat)
    lionLeft.position.set(-1.2, 0.2, -4.5)
    yamenGroup.add(lionLeft)

    const lionRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.35), lionMat)
    lionRight.position.set(1.2, 0.2, -4.5)
    yamenGroup.add(lionRight)

    yamenScene.add(yamenGroup)

    // 保存原始位置
    yamenGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        yamenOriginalPositions.push({
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
      yamenScene.add(label)
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
    const leaves = new THREE.Points(leafParticles, leafMat)
    yamenScene.add(leaves)

    function animateYamen() {
      requestAnimationFrame(animateYamen)
      leaves.rotation.y = Math.sin(Date.now() * 0.0001) * 0.1
      leaves.rotation.x = Math.sin(Date.now() * 0.00007) * 0.05
      yamenControls.update()
      if (yamenRenderer && yamenScene && yamenCamera) {
        yamenRenderer.render(yamenScene, yamenCamera)
      }
      if (yamenLabelRenderer && yamenScene && yamenCamera) {
        yamenLabelRenderer.render(yamenScene, yamenCamera)
      }
    }
    animateYamen()
  }
}

function renderYamenModel(container) {
  if (!yamenScene) {
    initYamenModel()
  }
  
  if (yamenRenderer && yamenLabelRenderer) {
    const width = container.clientWidth
    const height = container.clientHeight
    
    yamenCamera.aspect = width / height
    yamenCamera.updateProjectionMatrix()
    yamenRenderer.setSize(width, height)
    yamenLabelRenderer.setSize(width, height)
    
    if (yamenRenderer.domElement.parent !== container) {
      container.innerHTML = ''
      container.appendChild(yamenRenderer.domElement)
      container.appendChild(yamenLabelRenderer.domElement)
    }
  }
}

function clearYamenModel() {
  if (yamenRenderer) {
    if (yamenRenderer.domElement.parent) {
      yamenRenderer.domElement.parent.removeChild(yamenRenderer.domElement)
    }
    yamenRenderer.dispose()
  }
  if (yamenLabelRenderer) {
    if (yamenLabelRenderer.domElement.parent) {
      yamenLabelRenderer.domElement.parent.removeChild(yamenLabelRenderer.domElement)
    }
  }
  yamenScene = null
  yamenCamera = null
  yamenRenderer = null
  yamenLabelRenderer = null
  yamenControls = null
  yamenGroup = null
}

function initSiheyuanModel() {
  if (!siheyuanScene) {
    siheyuanScene = new THREE.Scene()
    siheyuanScene.background = new THREE.Color(0x0a1428)
    siheyuanScene.fog = new THREE.FogExp2(0x0a1428, 0.006)

    siheyuanCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 500)
    siheyuanCamera.position.set(7, 5, 9)
    siheyuanCamera.lookAt(0, 1.2, 0)

    siheyuanRenderer = new THREE.WebGLRenderer({ antialias: true })
    siheyuanRenderer.setPixelRatio(window.devicePixelRatio)
    siheyuanRenderer.shadowMap.enabled = true
    siheyuanRenderer.shadowMap.type = THREE.PCFSoftShadowMap

    siheyuanLabelRenderer = new CSS2DRenderer()
    siheyuanLabelRenderer.domElement.style.position = 'absolute'
    siheyuanLabelRenderer.domElement.style.top = '0px'
    siheyuanLabelRenderer.domElement.style.left = '0px'
    siheyuanLabelRenderer.domElement.style.pointerEvents = 'none'

    siheyuanControls = new OrbitControls(siheyuanCamera, siheyuanRenderer.domElement)
    siheyuanControls.enableDamping = true
    siheyuanControls.dampingFactor = 0.05
    siheyuanControls.rotateSpeed = 0.8
    siheyuanControls.zoomSpeed = 1.2
    siheyuanControls.panSpeed = 0.8
    siheyuanControls.autoRotate = autoRotate.value
    siheyuanControls.target.set(0, 1.5, 0)

    const ambientLight = new THREE.AmbientLight(0x404060, 0.65)
    siheyuanScene.add(ambientLight)
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
    siheyuanScene.add(mainLight)
    
    const fillLight = new THREE.PointLight(0xccaa77, 0.5)
    fillLight.position.set(-3, 4, 2)
    siheyuanScene.add(fillLight)
    
    const backLight = new THREE.PointLight(0x88aacc, 0.4)
    backLight.position.set(0, 3, -5)
    siheyuanScene.add(backLight)
    
    const groundLight = new THREE.PointLight(0xaa8866, 0.3)
    groundLight.position.set(0, -0.5, 0)
    siheyuanScene.add(groundLight)
    
    const gridHelper = new THREE.GridHelper(20, 20, 0x88aaff, 0x446688)
    gridHelper.position.y = -0.8
    gridHelper.material.transparent = true
    gridHelper.material.opacity = 0.25
    siheyuanScene.add(gridHelper)

    siheyuanGroup = new THREE.Group()

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
    
    addGableRoof(siheyuanGroup, 0, 1.6, 2.6, 2.0, 1.0, 0)
    for (let i = -0.8; i <= 0.8; i+=0.8) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.8, 8), pillarMat)
      pillar.position.set(i, 0.5, 2.1)
      pillar.castShadow = true
      siheyuanGroup.add(pillar)
    }
    
    addGableRoof(siheyuanGroup, -2.0, -0.2, 2.0, 1.4, 0.9, 0)
    addGableRoof(siheyuanGroup, 2.0, -0.2, 2.0, 1.4, 0.9, 0)
    addGableRoof(siheyuanGroup, 0, -1.8, 2.4, 1.6, 0.85, 0)
    
    const gateBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.0), wallMat)
    gateBase.position.set(0, 0.15, -0.6)
    gateBase.castShadow = true
    siheyuanGroup.add(gateBase)
    const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), pillarMat)
    gatePillarL.position.set(-0.6, 0.6, -0.6)
    siheyuanGroup.add(gatePillarL)
    const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.15), pillarMat)
    gatePillarR.position.set(0.6, 0.6, -0.6)
    siheyuanGroup.add(gatePillarR)
    const gateRoof = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.1, 0.3, 4), roofMat)
    gateRoof.rotation.y = Math.PI/4
    gateRoof.position.set(0, 1.0, -0.6)
    siheyuanGroup.add(gateRoof)
    
    const corridorMat = new THREE.MeshStandardMaterial({ color: 0xbc9a6a })
    const corridorPoints = [[-1.8, -1.0], [1.8, -1.0], [-1.8, 1.0], [1.8, 1.0]]
    corridorPoints.forEach(pos => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), woodMat)
      pillar.position.set(pos[0], 0.3, pos[1])
      pillar.castShadow = true
      siheyuanGroup.add(pillar)
    })
    
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xccbb99, roughness: 0.8 })
    const pathX = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 0.6), stoneMat)
    pathX.position.set(0, 0.03, 0)
    pathX.castShadow = true
    siheyuanGroup.add(pathX)
    const pathZ = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 2.2), stoneMat)
    pathZ.position.set(0, 0.03, 0)
    pathZ.castShadow = true
    siheyuanGroup.add(pathZ)

    siheyuanScene.add(siheyuanGroup)

    siheyuanGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        siheyuanOriginalPositions.push({
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
      siheyuanScene.add(label)
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
    const particles = new THREE.Points(particlesGeo, particlesMat)
    siheyuanScene.add(particles)

    function animateSiheyuan() {
      requestAnimationFrame(animateSiheyuan)
      particles.rotation.y = Math.sin(Date.now() * 0.0001) * 0.05
      particles.rotation.x = Math.sin(Date.now() * 0.00015) * 0.03
      siheyuanControls.update()
      if (siheyuanRenderer && siheyuanScene && siheyuanCamera) {
        siheyuanRenderer.render(siheyuanScene, siheyuanCamera)
      }
      if (siheyuanLabelRenderer && siheyuanScene && siheyuanCamera) {
        siheyuanLabelRenderer.render(siheyuanScene, siheyuanCamera)
      }
    }
    animateSiheyuan()
  }
}

function renderSiheyuanModel(container) {
  if (!siheyuanScene) {
    initSiheyuanModel()
  }
  
  if (siheyuanRenderer && siheyuanLabelRenderer) {
    const width = container.clientWidth
    const height = container.clientHeight
    
    siheyuanCamera.aspect = width / height
    siheyuanCamera.updateProjectionMatrix()
    siheyuanRenderer.setSize(width, height)
    siheyuanLabelRenderer.setSize(width, height)
    
    if (siheyuanRenderer.domElement.parent !== container) {
      container.innerHTML = ''
      container.appendChild(siheyuanRenderer.domElement)
      container.appendChild(siheyuanLabelRenderer.domElement)
    }
  }
}

function clearSiheyuanModel() {
  if (siheyuanRenderer) {
    if (siheyuanRenderer.domElement.parent) {
      siheyuanRenderer.domElement.parent.removeChild(siheyuanRenderer.domElement)
    }
    siheyuanRenderer.dispose()
  }
  if (siheyuanLabelRenderer) {
    if (siheyuanLabelRenderer.domElement.parent) {
      siheyuanLabelRenderer.domElement.parent.removeChild(siheyuanLabelRenderer.domElement)
    }
  }
  siheyuanScene = null
  siheyuanCamera = null
  siheyuanRenderer = null
  siheyuanLabelRenderer = null
  siheyuanControls = null
  siheyuanGroup = null
  siheyuanOriginalPositions = []
}

watch(() => selectedModel.value, (newModel) => {
  if (newModel?.id === 'building-03') {
    setTimeout(() => {
      if (bridgeContainer.value) {
        renderBridgeModel(bridgeContainer.value)
      }
    }, 100)
  } else if (newModel?.id === 'building-02') {
    setTimeout(() => {
      if (bridgeContainer.value) {
        renderPalaceModel(bridgeContainer.value)
      }
    }, 100)
  } else if (newModel?.id === 'building-01') {
    setTimeout(() => {
      if (bridgeContainer.value) {
        renderYamenModel(bridgeContainer.value)
      }
    }, 100)
  } else if (newModel?.id === 'building-00') {
    setTimeout(() => {
      if (bridgeContainer.value) {
        renderSiheyuanModel(bridgeContainer.value)
      }
    }, 100)
  } else {
    clearBridgeModel()
    clearPalaceModel()
    clearYamenModel()
    clearSiheyuanModel()
  }
}, { immediate: true })

watch(() => autoRotate.value, (value) => {
  if (bridgeControls) {
    bridgeControls.autoRotate = value
  }
  if (palaceControls) {
    palaceControls.autoRotate = value
  }
  if (yamenControls) {
    yamenControls.autoRotate = value
  }
  if (siheyuanControls) {
    siheyuanControls.autoRotate = value
  }
})

watch(() => exploded.value, (value) => {
  // 控制卢沟桥模型爆炸视图
  if (bridgeOriginalPositions.length > 0) {
    bridgeOriginalPositions.forEach(({ object, position }) => {
      if (value) {
        const center = new THREE.Vector3(0, 0, 0)
        const direction = position.clone().sub(center).normalize()
        const distance = position.distanceTo(center) * 0.5
        object.position.copy(position).add(direction.multiplyScalar(distance))
      } else {
        object.position.copy(position)
      }
    })
  }
  
  // 控制故宫模型爆炸视图
  if (palaceOriginalPositions.length > 0) {
    palaceOriginalPositions.forEach(({ object, position }) => {
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
  
  // 控制内乡县衙模型爆炸视图
  if (yamenOriginalPositions.length > 0) {
    yamenOriginalPositions.forEach(({ object, position }) => {
      if (value) {
        const center = new THREE.Vector3(0, 0, 0)
        const direction = position.clone().sub(center).normalize()
        const distance = position.distanceTo(center) * 0.4
        object.position.copy(position).add(direction.multiplyScalar(distance))
      } else {
        object.position.copy(position)
      }
    })
  }
  
  // 控制北京四合院模型爆炸视图
  if (siheyuanOriginalPositions.length > 0) {
    siheyuanOriginalPositions.forEach(({ object, position }) => {
      if (value) {
        const center = new THREE.Vector3(0, 0, 0)
        const direction = position.clone().sub(center).normalize()
        const distance = position.distanceTo(center) * 0.35
        object.position.copy(position).add(direction.multiplyScalar(distance))
      } else {
        object.position.copy(position)
      }
    })
  }
})

function resetView() {
  if (bridgeControls) {
    bridgeControls.reset()
  }
  if (palaceControls) {
    palaceControls.reset()
  }
  if (yamenControls) {
    yamenControls.reset()
  }
  if (siheyuanControls) {
    siheyuanControls.reset()
  }
  if (viewerRef.value) {
    viewerRef.value.resetView()
  }
}

onMounted(() => {
  // 检查 URL 参数
  const buildingParam = route.query.building
  if (buildingParam) {
    // 根据建筑名称查找对应的模型
    const model = sunmaoModels.find(m => m.name.includes(buildingParam))
    if (model) {
      selectedModel.value = model
    }
  }
  
  if (selectedModel.value?.id === 'building-03' && bridgeContainer.value) {
    renderBridgeModel(bridgeContainer.value)
  } else if (selectedModel.value?.id === 'building-02' && bridgeContainer.value) {
    renderPalaceModel(bridgeContainer.value)
  } else if (selectedModel.value?.id === 'building-01' && bridgeContainer.value) {
    renderYamenModel(bridgeContainer.value)
  } else if (selectedModel.value?.id === 'building-00' && bridgeContainer.value) {
    renderSiheyuanModel(bridgeContainer.value)
  }
})

onUnmounted(() => {
  clearBridgeModel()
  clearPalaceModel()
  clearYamenModel()
  clearSiheyuanModel()
})
</script>

<template>
  <div class="page-3d">
    <header class="page-header">
      <div class="header-left">
        <h1>3D 结构解析</h1>
        <p class="header-desc">360° 交互式查看古代建筑详细结构</p>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="resetView">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 1 3 6.7"/>
            <path d="M3 7v5h5"/>
          </svg>
          重置视角
        </button>
      </div>
    </header>

    <div class="main-content">
      <aside class="sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">模型分类</h3>
          <div class="category-list">
            <button 
              class="category-btn" 
              v-for="cat in categories" 
              :key="cat"
              :class="{ active: selectedModel?.category === cat }"
              @click="selectCategory(cat)"
            >
              {{ cat }}
              <span class="category-count">{{ sunmaoModels.filter(m => m.category === cat).length }}</span>
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">模型列表</h3>
          <div class="model-list">
            <div 
              class="model-item" 
              v-for="model in filteredModels" 
              :key="model.id"
              :class="{ active: selectedModel?.id === model.id }"
              @click="selectModel(model)"
            >
              <div class="model-thumb" :style="{ background: model.parts[0]?.color || '#b38728' }">
                <span class="model-type">{{ model.category.charAt(0) }}</span>
              </div>
              <div class="model-meta">
                <span class="model-name">{{ model.name }}</span>
                <span class="model-difficulty" :class="'diff-' + model.difficulty">{{ model.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">显示选项</h3>
          <div class="options-list">
            <label class="option-item">
              <input type="checkbox" v-model="autoRotate" />
              <span>自动旋转</span>
            </label>
            <label class="option-item">
              <input type="checkbox" v-model="exploded" />
              <span>爆炸视图</span>
            </label>
          </div>
        </div>

        <div class="sidebar-section model-desc-section" v-if="selectedModel">
          <h3 class="section-title">结构说明</h3>
          <p class="desc-text">{{ selectedModel.desc }}</p>
          <div class="assembly-info">
            <span class="info-label">组装方式</span>
            <span class="info-value">{{ selectedModel.assembly.description }}</span>
          </div>
        </div>
      </aside>

      <main class="viewer-area">
        <Sunmao3DViewer
          v-if="selectedModel"
          ref="viewerRef"
          :model="selectedModel"
          :auto-rotate="autoRotate"
          :exploded="exploded"
          @toggle-rotate="handleToggleRotate"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-3d {
  min-height: 100vh;
  background: var(--bg);
  padding: 0;
}

.page-header {
  background: var(--surface);
  padding: 24px 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 4px 0;
}

.header-desc {
  font-size: 14px;
  color: var(--text-sub);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-main);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.main-content {
  display: flex;
  height: calc(100vh - 85px);
}

.sidebar {
  width: 300px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 20px;
}

.sidebar-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 12px 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-main);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: var(--primary);
}

.category-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.category-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.category-btn.active .category-count {
  background: rgba(255,255,255,0.2);
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.model-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.model-item:hover {
  background: rgba(179,135,40,0.1);
}

.model-item.active {
  background: rgba(179,135,40,0.15);
  border: 1px solid rgba(179,135,40,0.3);
}

.model-thumb {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.model-type {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
}

.model-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-main);
}

.model-difficulty {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 8px;
  width: fit-content;
}

.diff-简单 {
  background: rgba(45,90,74,0.2);
  color: #6bc4a0;
}

.diff-基础 {
  background: rgba(179,135,40,0.2);
  color: #f0d48a;
}

.diff-中级 {
  background: rgba(143,61,46,0.2);
  color: #e8a0a0;
}

.diff-高级 {
  background: rgba(92,26,26,0.2);
  color: #e07070;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-main);
  cursor: pointer;
}

.option-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

.model-desc-section {
  background: var(--bg);
  border-radius: 12px;
  padding: 16px;
}

.desc-text {
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.assembly-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.info-label {
  font-size: 12px;
  color: var(--text-sub);
}

.info-value {
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
}

.viewer-area {
  flex: 1;
  position: relative;
}

.bridge-3d-viewer {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
