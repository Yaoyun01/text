<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  showLabels: {
    type: Boolean,
    default: true
  },
  autoRotate: {
    type: Boolean,
    default: true
  },
  exploded: {
    type: Boolean,
    default: false
  }
})

const containerRef = ref(null)
let scene, camera, renderer
let meshes = []
let animationId
let isDragging = false
let previousMousePosition = { x: 0, y: 0 }
let targetRotation = { x: 0, y: 0 }
let autoRotateAngle = 0
let group = null

const explodeDistance = ref(0)
const selectedPart = ref(null)

const partsList = computed(() => {
  return props.model?.parts || []
})

function createGeometry(part) {
  const { type, size, position } = part.geometry
  
  let geometry
  switch (type) {
    case 'box':
      geometry = new THREE.BoxGeometry(size[0], size[1], size[2])
      break
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(size[0], size[1], size[2], 32)
      break
    case 'sphere':
      geometry = new THREE.SphereGeometry(size[0], 32, 32)
      break
    default:
      geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
  }

  const color = new THREE.Color(part.color)
  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.3,
    roughness: 0.6,
    transparent: true,
    opacity: 0.9
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(position[0], position[1], position[2])
  mesh.userData = { partId: part.id, name: part.name, description: part.description }

  return mesh
}

function createEdgeLine(mesh) {
  const edges = new THREE.EdgesGeometry(mesh.geometry)
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true })
  )
  return line
}

function createLabel(text, position) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 64
  
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'
  context.fillRect(0, 0, 256, 64)
  
  context.fillStyle = '#ffffff'
  context.font = 'bold 24px Arial, "Microsoft YaHei", sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, 128, 32)
  
  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.position.copy(position)
  sprite.scale.set(1.5, 0.375, 1)
  
  return sprite
}

function initScene() {
  if (!containerRef.value || !props.model) return

  if (!renderer) {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000)
    camera.position.set(10, 5, 10)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    containerRef.value.appendChild(renderer.domElement)
    containerRef.value.addEventListener('mousedown', onMouseDown)
    containerRef.value.addEventListener('mousemove', onMouseMove)
    containerRef.value.addEventListener('mouseup', onMouseUp)
    containerRef.value.addEventListener('wheel', onWheel, { passive: false })
    containerRef.value.addEventListener('mouseleave', onMouseUp)
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0xb38728, 0.3)
    fillLight.position.set(-3, 2, -3)
    scene.add(fillLight)

    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x333333)
    gridHelper.position.y = -1
    scene.add(gridHelper)

    group = new THREE.Group()
    scene.add(group)
  }

  meshes.forEach(mesh => {
    if (mesh.parent) mesh.parent.remove(mesh)
    mesh.geometry.dispose()
    mesh.material.dispose()
  })
  meshes = []

  // 清理旧的group，创建新的group
  if (group) {
    scene.remove(group)
    group = null
  }
  group = new THREE.Group()
  scene.add(group)

  if (group) {
    const parts = props.model?.parts || []
    
    parts.forEach((part) => {
      const mesh = createGeometry(part)
      const edgeLine = createEdgeLine(mesh)
      mesh.add(edgeLine)

      if (props.showLabels) {
        const label = createLabel(part.name, new THREE.Vector3(
          part.geometry.position[0],
          part.geometry.position[1] + 0.4,
          part.geometry.position[2]
        ))
        mesh.add(label)
      }

      group.add(mesh)
      meshes.push(mesh)
    })
  }

  onResize()
  startAnimation()
}

function startAnimation() {
  if (animationId) cancelAnimationFrame(animationId)
  
  const loop = () => {
    animationId = requestAnimationFrame(loop)

    if (!isDragging && props.autoRotate) {
      autoRotateAngle += 0.005
      targetRotation.y = autoRotateAngle
    }

    if (group) {
      group.rotation.y += (targetRotation.y - group.rotation.y) * 0.1
      group.rotation.x += (targetRotation.x - group.rotation.x) * 0.1
    }

    if (props.model?.parts && meshes.length > 0) {
      const explodeAmount = props.exploded ? 1.5 : 0
      meshes.forEach((mesh, index) => {
        const part = props.model.parts[index]
        if (!part) return
        const pos = part.geometry.position
        
        const targetX = pos[0] + (pos[0] > 0 ? explodeAmount : pos[0] < 0 ? -explodeAmount : 0)
        const targetY = pos[1] + (pos[1] > 0 ? explodeAmount : pos[1] < 0 ? -explodeAmount : 0)
        const targetZ = pos[2] + (pos[2] > 0 ? explodeAmount : pos[2] < 0 ? -explodeAmount : 0)
        
        mesh.position.x += (targetX - mesh.position.x) * 0.1
        mesh.position.y += (targetY - mesh.position.y) * 0.1
        mesh.position.z += (targetZ - mesh.position.z) * 0.1
      })
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  
  loop()
}

function onMouseDown(event) {
  isDragging = true
  const rect = containerRef.value.getBoundingClientRect()
  previousMousePosition = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

function onMouseMove(event) {
  if (!isDragging || !containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  const currentX = event.clientX - rect.left
  const currentY = event.clientY - rect.top
  
  const deltaX = currentX - previousMousePosition.x
  const deltaY = currentY - previousMousePosition.y
  
  // 归一化鼠标移动，使其与查看器大小无关
  const sensitivity = 0.01
  targetRotation.y += deltaX * sensitivity
  targetRotation.x += deltaY * sensitivity
  
  targetRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotation.x))
  
  previousMousePosition = { x: currentX, y: currentY }
}

function onMouseUp() {
  isDragging = false
}

function onWheel(event) {
  event.preventDefault()
  camera.position.z += event.deltaY * 0.002
  camera.position.z = Math.max(1.5, Math.min(10, camera.position.z))
}

function onResize() {
  if (!containerRef.value || !renderer || !camera) return
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function animate() {
  if (animationId) cancelAnimationFrame(animationId)
  
  const loop = () => {
    animationId = requestAnimationFrame(loop)

    if (!isDragging && props.autoRotate) {
      autoRotateAngle += 0.005
      targetRotation.y = autoRotateAngle
    }

    if (group) {
      group.rotation.y += (targetRotation.y - group.rotation.y) * 0.1
      group.rotation.x += (targetRotation.x - group.rotation.x) * 0.1
    }

    if (props.model?.parts && meshes.length > 0) {
      const explodeAmount = props.exploded ? 1.5 : 0
      meshes.forEach((mesh, index) => {
        const part = props.model.parts[index]
        if (!part) return
        const pos = part.geometry.position
        
        const targetX = pos[0] + (pos[0] > 0 ? explodeAmount : pos[0] < 0 ? -explodeAmount : 0)
        const targetY = pos[1] + (pos[1] > 0 ? explodeAmount : pos[1] < 0 ? -explodeAmount : 0)
        const targetZ = pos[2] + (pos[2] > 0 ? explodeAmount : pos[2] < 0 ? -explodeAmount : 0)
        
        mesh.position.x += (targetX - mesh.position.x) * 0.1
        mesh.position.y += (targetY - mesh.position.y) * 0.1
        mesh.position.z += (targetZ - mesh.position.z) * 0.1
      })
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }
  
  loop()
}

function resetView() {
  targetRotation = { x: 0, y: 0 }
  autoRotateAngle = 0
  if (camera) {
    camera.position.set(10, 5, 10)
    camera.lookAt(0, 0, 0)
  }
}

function toggleExplode() {
  explodeDistance.value = explodeDistance.value > 0.5 ? 0 : 2
}

function selectPart(partId) {
  selectedPart.value = partId
  meshes.forEach(mesh => {
    if (mesh.userData.partId === partId) {
      mesh.material.emissive = new THREE.Color(0xb38728)
      mesh.material.emissiveIntensity = 0.3
    } else {
      mesh.material.emissive = new THREE.Color(0x000000)
      mesh.material.emissiveIntensity = 0
    }
  })
}

function highlightPart(partId, highlight) {
  meshes.forEach(mesh => {
    if (mesh.userData.partId === partId) {
      if (highlight) {
        mesh.material.emissive = new THREE.Color(0xb38728)
        mesh.material.emissiveIntensity = 0.5
      } else {
        mesh.material.emissive = new THREE.Color(0x000000)
        mesh.material.emissiveIntensity = 0
      }
    }
  })
}

watch(() => props.model, () => {
  initScene()
}, { deep: true })

onMounted(() => {
  initScene()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (containerRef.value) {
    containerRef.value.removeEventListener('mousedown', onMouseDown)
    containerRef.value.removeEventListener('mousemove', onMouseMove)
    containerRef.value.removeEventListener('mouseup', onMouseUp)
    containerRef.value.removeEventListener('wheel', onWheel)
    containerRef.value.removeEventListener('mouseleave', onMouseUp)
  }
  if (renderer) {
    renderer.dispose()
    if (renderer.domElement.parent) {
      renderer.domElement.parent.removeChild(renderer.domElement)
    }
  }
  window.removeEventListener('resize', onResize)
})

defineExpose({
  resetView,
  toggleExplode,
  selectPart,
  highlightPart
})
</script>

<template>
  <div class="viewer-3d" ref="containerRef">
    <div class="viewer-overlay">
      <div class="viewer-controls">
        <button class="ctrl-btn" @click="resetView" title="重置视角">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 1 3 6.7"/>
            <path d="M3 7v5h5"/>
          </svg>
        </button>
        <button class="ctrl-btn" :class="{ active: exploded }" @click="toggleExplode" title="爆炸视图">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <path d="M14 3l-3.5 3.5M3 14l3.5-3.5"/>
          </svg>
        </button>
        <button class="ctrl-btn" :class="{ active: autoRotate }" @click="$emit('toggle-rotate')" title="自动旋转">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-3-6.7"/>
            <path d="M21 3v6h-6"/>
          </svg>
        </button>
      </div>
      
      <div class="model-info" v-if="model">
        <h3 class="model-name">{{ model.name }}</h3>
        <span class="model-category">{{ model.category }}</span>
        <span class="model-difficulty" :class="'diff-' + model.difficulty">{{ model.difficulty }}</span>
      </div>
    </div>
    
    <div class="parts-list" v-if="showLabels && partsList.length > 0">
      <div 
        class="part-item" 
        v-for="part in partsList" 
        :key="part.id"
        @mouseenter="highlightPart(part.id, true)"
        @mouseleave="highlightPart(part.id, false)"
        @click="selectPart(part.id)"
        :class="{ active: selectedPart === part.id }"
      >
        <span class="part-color" :style="{ background: part.color }"></span>
        <div class="part-info">
          <span class="part-name">{{ part.name }}</span>
          <span class="part-desc">{{ part.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewer-3d {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
}

.viewer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  z-index: 10;
}

.viewer-controls {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.6);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.ctrl-btn:hover {
  background: rgba(179,135,40,0.6);
  border-color: #b38728;
}

.ctrl-btn.active {
  background: rgba(179,135,40,0.8);
  border-color: #b38728;
}

.model-info {
  pointer-events: auto;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: right;
}

.model-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 6px 0;
}

.model-category {
  display: inline-block;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 6px;
}

.model-difficulty {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.diff-简单 {
  background: rgba(45,90,74,0.6);
  color: #6bc4a0;
}

.diff-基础 {
  background: rgba(179,135,40,0.6);
  color: #f0d48a;
}

.diff-中级 {
  background: rgba(143,61,46,0.6);
  color: #e8a0a0;
}

.diff-高级 {
  background: rgba(92,26,26,0.6);
  color: #e07070;
}

.parts-list {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  pointer-events: auto;
}

.part-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.part-item:hover,
.part-item.active {
  background: rgba(179,135,40,0.2);
  border: 1px solid rgba(179,135,40,0.3);
}

.part-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.part-info {
  flex: 1;
  min-width: 0;
}

.part-name {
  display: block;
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.part-desc {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
  margin-top: 2px;
}
</style>
