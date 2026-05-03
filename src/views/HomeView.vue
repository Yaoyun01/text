<template>
  <section class="home-shell">
    <!-- 全屏英雄区 -->
    <div class="hero-fullscreen">
      <div class="hero-bg-pattern"></div>
      <div class="hero-content-center">
        <div class="hero-top-tag">中国古代建筑文明专题</div>
        <h1 class="hero-main-title">古建可视化引擎</h1>
        <p class="hero-sub">基于多维数据分析的中国传统建筑信息可视化系统</p>
        <p class="hero-desc">
          穿越千年营造智慧，探索中国古代建筑文明的璀璨华章。
        </p>
        <div class="hero-categories">
          <div class="cat-pill" @click="scrollToGallery">
            <svg class="cat-svg cat-svg-minju" viewBox="0 0 32 32" fill="none">
              <path d="M4 20V14L16 6L28 14V20H4Z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.1"/>
              <rect x="8" y="16" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15" rx="0.5"/>
              <rect x="18" y="16" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15" rx="0.5"/>
            </svg>
            <span>民居</span>
          </div>
          <div class="cat-pill" @click="scrollToGallery">
            <svg class="cat-svg cat-svg-guanfu" viewBox="0 0 32 32" fill="none">
              <path d="M4 22V14L16 6L28 14V22" stroke="currentColor" stroke-width="2" fill="none"/>
              <rect x="6" y="22" width="20" height="4" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1" rx="0.5"/>
              <rect x="10" y="16" width="4" height="4" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15" rx="0.5"/>
              <rect x="18" y="16" width="4" height="4" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15" rx="0.5"/>
            </svg>
            <span>官府</span>
          </div>
          <div class="cat-pill" @click="scrollToGallery">
            <svg class="cat-svg cat-svg-huanggong" viewBox="0 0 32 32" fill="none">
              <path d="M2 20V12L16 4L30 12V20" stroke="currentColor" stroke-width="2" fill="none"/>
              <rect x="4" y="20" width="24" height="6" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1" rx="0.5"/>
              <path d="M12 14V20H20V14" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.15"/>
              <circle cx="16" cy="8" r="2" fill="currentColor" opacity="0.6"/>
            </svg>
            <span>皇宫</span>
          </div>
          <div class="cat-pill" @click="scrollToGallery">
            <svg class="cat-svg cat-svg-qiaoliang" viewBox="0 0 32 32" fill="none">
              <path d="M4 18C4 12 8 8 16 8C24 8 28 12 28 18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
              <line x1="4" y1="18" x2="28" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="18" x2="8" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="16" y1="18" x2="16" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="24" y1="18" x2="24" y2="24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>桥梁</span>
          </div>
        </div>
        <div class="hero-scroll-hint">
          <span>向下滚动探索</span>
          <div class="scroll-arrow">↓</div>
        </div>
      </div>
      <div class="hero-decoration-left"></div>
      <div class="hero-decoration-right"></div>
    </div>

    <!-- 数据统计横条 -->
    <div class="stats-bar">
      <div class="container stats-inner">
        <div class="stat-item">
          <span class="stat-number">{{ buildings.length }}</span>
          <span class="stat-label">收录案例</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">4</span>
          <span class="stat-label">建筑类型</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">6</span>
          <span class="stat-label">历史朝代</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-number">7</span>
          <span class="stat-label">地理区域</span>
        </div>
      </div>
    </div>

    <!-- 全屏案例滑动区 -->
    <div class="gallery-section" ref="galleryRef">
      <!-- 类型筛选 -->
      <div class="filter-bar">
        <button class="filter-btn" :class="{ active: activeFilter === '全部' }" @click="activeFilter = '全部'">全部</button>
        <button class="filter-btn" :class="{ active: activeFilter === '民居' }" @click="activeFilter = '民居'">
          <svg class="filter-svg" viewBox="0 0 24 24" fill="none"><path d="M3 16L12 8L21 16V20H3V16Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.1"/><rect x="8" y="13" width="3" height="4" fill="currentColor" fill-opacity="0.2"/><rect x="13" y="13" width="3" height="4" fill="currentColor" fill-opacity="0.2"/></svg>
          民居
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === '官府' }" @click="activeFilter = '官府'">
          <svg class="filter-svg" viewBox="0 0 24 24" fill="none"><path d="M3 18V12L12 6L21 12V18" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="4" y="18" width="16" height="2" fill="currentColor" fill-opacity="0.2"/><rect x="9" y="12" width="2" height="3" fill="currentColor" fill-opacity="0.2"/><rect x="13" y="12" width="2" height="3" fill="currentColor" fill-opacity="0.2"/></svg>
          官府
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === '皇宫' }" @click="activeFilter = '皇宫'">
          <svg class="filter-svg" viewBox="0 0 24 24" fill="none"><path d="M2 18V10L12 3L22 10V18" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="4" y="18" width="16" height="2" fill="currentColor" fill-opacity="0.2"/><path d="M9 12V18H15V12" stroke="currentColor" stroke-width="1.2" fill="currentColor" fill-opacity="0.15"/></svg>
          皇宫
        </button>
        <button class="filter-btn" :class="{ active: activeFilter === '桥梁' }" @click="activeFilter = '桥梁'">
          <svg class="filter-svg" viewBox="0 0 24 24" fill="none"><path d="M2 14C2 10 5 7 12 7C19 7 22 10 22 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="6" y1="14" x2="6" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="14" x2="12" y2="21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="18" y1="14" x2="18" y2="19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          桥梁
        </button>
      </div>

      <!-- 全屏滑动容器 -->
      <div class="slider-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
        <div class="slider-wrapper" 
             :style="{ transform: `translateY(-${currentIndex * 100}%)`, transition: transitionStyle }"
             @transitionend="onTransitionEnd">
          <div v-for="item in filteredBuildings" :key="item.id" class="slide-item">
            <div class="slide-card" @click="$router.push(`/detail/${item.id}`)">
              <!-- 全屏背景图区 -->
              <div class="slide-bg" :style="{ backgroundImage: `url(/images/${item.id}.jpg)`, backgroundColor: getCategoryGradient(item.category) }">
              </div>
              <!-- 底部信息覆盖层 -->
              <div class="slide-overlay">
                <div class="slide-overlay-content">
                  <span class="slide-type-badge">{{ item.category }}</span>
                  <span class="slide-era-tag">{{ item.dynasty }}</span>
                  <h3 class="slide-title">{{ item.name }}</h3>
                  <p class="slide-location"><span class="loc-icon"></span> {{ item.city === item.province ? item.city : item.city + '，' + item.province }}</p>
                  <div class="slide-action">
                    <span class="action-btn">点击查看详情 →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 导航按钮 -->
        <button class="nav-btn nav-prev" @click="prevSlide" :disabled="currentIndex === 0">
          <span>↑</span>
        </button>
        <button class="nav-btn nav-next" @click="nextSlide" :disabled="currentIndex === filteredBuildings.length - 1">
          <span>↓</span>
        </button>

        <!-- 缩略导航点 -->
        <div class="slider-dots">
          <span v-for="(item, idx) in filteredBuildings" :key="item.id" 
                class="dot" 
                :class="{ active: idx === currentIndex }"
                @click="goToSlide(idx)">
          </span>
        </div>

        <!-- 进度指示器 -->
        <div class="slider-progress">
          <span class="progress-text">{{ currentIndex + 1 }} / {{ filteredBuildings.length }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import buildings from '../data/buildings.json'

const galleryRef = ref(null)
const activeFilter = ref('全部')
const currentIndex = ref(0)
const isAnimating = ref(false)
const touchStartY = ref(0)

const transitionStyle = ref('transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)')

const filteredBuildings = computed(() => {
  return activeFilter.value === '全部' ? buildings : buildings.filter(b => b.category === activeFilter.value)
})

watch(activeFilter, () => {
  isAnimating.value = false
  currentIndex.value = 0
})

function scrollToGallery() {
  galleryRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function nextSlide() {
  if (isAnimating.value) return
  if (currentIndex.value < filteredBuildings.value.length - 1) {
    isAnimating.value = true
    currentIndex.value++
  }
}

function prevSlide() {
  if (isAnimating.value) return
  if (currentIndex.value > 0) {
    isAnimating.value = true
    currentIndex.value--
  }
}

function goToSlide(idx) {
  if (isAnimating.value) return
  if (idx >= 0 && idx < filteredBuildings.value.length && idx !== currentIndex.value) {
    isAnimating.value = true
    currentIndex.value = idx
  }
}

function onTransitionEnd() {
  isAnimating.value = false
}

function handleTouchStart(e) {
  touchStartY.value = e.touches[0].clientY
}

function handleTouchEnd(e) {
  const touchEndY = e.changedTouches[0].clientY
  const deltaY = touchStartY.value - touchEndY
  if (Math.abs(deltaY) > 50) {
    if (deltaY > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
}

function handleKeydown(e) {
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    prevSlide()
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    nextSlide()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function getCategoryGradient(cat) {
  const gradients = {
    '民居': 'linear-gradient(135deg, #f0e6d3 0%, #d4a574 50%, #b8865a 100%)',
    '官府': 'linear-gradient(135deg, #e8d5c4 0%, #c9956b 50%, #8f3d2e 100%)',
    '皇宫': 'linear-gradient(135deg, #d4a574 0%, #8f3d2e 50%, #5c1a1a 100%)',
    '桥梁': 'linear-gradient(135deg, #c8d8cc 0%, #6b8f7a 50%, #2d5a4a 100%)'
  }
  return gradients[cat] || 'linear-gradient(135deg, #f5efe5, #e8d5c4)'
}

function getImagePath(item) {
  return `/images/${item.image || 'default'}.jpg`
}
</script>

<style scoped>
.home-shell {
  min-height: 100vh;
}

/* ===== 全屏英雄区 ===== */
.hero-fullscreen {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #faf6ee 0%, #f5efe5 50%, #f0e8d8 100%);
  overflow: hidden;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(143, 61, 46, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(179, 135, 40, 0.05) 0%, transparent 50%);
  background-size: 100% 100%;
}

.hero-decoration-left {
  position: absolute;
  left: -100px;
  top: 20%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(143, 61, 46, 0.06) 0%, transparent 70%);
  animation: float 8s ease-in-out infinite;
}

.hero-decoration-right {
  position: absolute;
  right: -80px;
  bottom: 20%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(179, 135, 40, 0.06) 0%, transparent 70%);
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

.hero-content-center {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-top-tag {
  display: inline-block;
  padding: 8px 24px;
  background: rgba(143, 61, 46, 0.1);
  color: var(--primary);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 3px;
  margin-bottom: 24px;
}

.hero-main-title {
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 8px;
  background: linear-gradient(180deg, #b8865a 0%, #8f3d2e 40%, #5c1a1a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 12px rgba(143,61,46,0.15));
  position: relative;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-main-title::after {
  content: '古建可视化引擎';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  font-size: 48px;
  font-weight: 900;
  letter-spacing: 8px;
  -webkit-text-stroke: 1.5px rgba(143,61,46,0.08);
  -webkit-text-fill-color: transparent;
  pointer-events: none;
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}

.hero-sub {
  font-size: 18px;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.hero-desc {
  font-size: 16px;
  line-height: 1.9;
  color: var(--text-sub);
  max-width: 640px;
  margin: 0 auto 36px;
}

.hero-categories {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 60px;
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s;
}

.cat-pill:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.cat-svg {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  stroke: var(--primary);
  fill: none;
  transition: all 0.3s;
}

.cat-pill:hover .cat-svg {
  stroke: var(--primary);
  transform: scale(1.1);
}

.hero-scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-sub);
  font-size: 13px;
  letter-spacing: 2px;
}

.scroll-arrow {
  font-size: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* ===== 统计横条 ===== */
.stats-bar {
  background: var(--surface);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 32px 0;
}

.stats-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--text-sub);
  letter-spacing: 1px;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: var(--border);
}

/* ===== 案例滑动区 ===== */
.gallery-section {
  position: relative;
  padding: 0;
  background: linear-gradient(180deg, #f0e8d8 0%, #f5efe5 100%);
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

/* 分类筛选栏 */
.filter-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgba(245, 239, 229, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(89, 62, 46, 0.1);
}

.filter-btn {
  padding: 10px 24px;
  border: 2px solid var(--border);
  border-radius: 50px;
  background: var(--surface);
  color: var(--text-main);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  stroke: currentColor;
  fill: none;
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

/* ===== 滑动容器 ===== */
.slider-container {
  position: relative;
  width: 100vw;
  height: calc(100vh - 64px);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.slider-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  will-change: transform;
}

.slide-item {
  min-width: 100vw;
  min-height: calc(100vh - 64px);
  width: 100vw;
  height: calc(100vh - 64px);
  flex-shrink: 0;
  will-change: transform;
}

.slide-card {
  position: relative;
  width: 100%;
  height: calc(100vh - 64px);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.4s;
}

.slide-card:hover {
  transform: scale(1.01);
}

/* 全屏背景图区 */
.slide-bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.slide-emoji {
  font-size: 200px;
  opacity: 0.35;
  filter: blur(2px);
  transition: all 0.6s;
}

.slide-card:hover .slide-emoji {
  opacity: 0.45;
  filter: blur(0px);
  transform: scale(1.15);
}

/* 底部信息覆盖层 */
.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 80px 48px 48px;
  background: linear-gradient(to top, 
    rgba(0, 0, 0, 0.85) 0%, 
    rgba(0, 0, 0, 0.6) 40%, 
    rgba(0, 0, 0, 0.3) 70%, 
    transparent 100%
  );
  display: flex;
  align-items: flex-end;
}

.slide-overlay-content {
  max-width: 800px;
  width: 100%;
}

.slide-era-tag {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.slide-title {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  letter-spacing: 4px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.slide-location {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loc-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  position: relative;
  flex-shrink: 0;
}

.loc-icon::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 50% 50% 50% 0;
  top: 2px;
  left: 2px;
  transform: rotate(-45deg);
}
.loc-icon::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  top: 8px;
  left: 8px;
}

.slide-action {
  display: flex;
  align-items: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 36px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  transition: all 0.3s;
  cursor: pointer;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  color: var(--primary);
  border-color: #fff;
  transform: translateX(8px);
}

/* 导航按钮 */
.nav-btn {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary);
  border-color: #fff;
  transform: translateX(-50%) scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
}

.nav-prev { top: 24px; }
.nav-next { bottom: 24px; }

/* 圆点导航 */
.slider-dots {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.6);
}

.dot.active {
  background: #fff;
  transform: scale(1.4);
  border-color: #fff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
}

/* 进度指示器 */
.slider-progress {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 50px;
}

.progress-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
  min-width: 50px;
  text-align: center;
}

.slide-type-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-right: 12px;
  letter-spacing: 1px;
}

/* ===== 响应式 ===== */
@media (max-width: 1100px) {
  .slide-emoji {
    font-size: 150px;
  }
  .slide-title {
    font-size: 36px;
  }
  .slide-overlay {
    padding: 60px 32px 40px;
  }
  .hero-main-title {
    font-size: 90px;
    letter-spacing: 18px;
  }
  .hero-main-title::after {
    font-size: 90px;
    letter-spacing: 18px;
  }
}

@media (max-width: 700px) {
  .slide-emoji {
    font-size: 100px;
  }
  .slide-title {
    font-size: 28px;
    letter-spacing: 2px;
  }
  .slide-location {
    font-size: 15px;
  }
  .slide-overlay {
    padding: 40px 24px 32px;
  }
  .action-btn {
    padding: 12px 28px;
    font-size: 14px;
  }
  .hero-main-title {
    font-size: 40px;
    letter-spacing: 6px;
  }
  .hero-categories {
    flex-wrap: wrap;
  }
  .nav-btn {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
  .slider-dots {
    right: 12px;
    gap: 8px;
  }
  .dot {
    width: 10px;
    height: 10px;
  }
}
</style>
