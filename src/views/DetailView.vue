<template>
  <section class="detail-shell">
    <!-- Hero 全屏图片区 -->
    <div class="detail-hero" v-if="building">
      <div class="hero-image-wrap">
        <img :src="`/images/${building.id}.jpg`" :alt="building.name" class="hero-photo" @error="handleImgError" />
        <div class="hero-fallback" v-if="imgError" :style="{ background: getCategoryGradient(building.category) }">
          <span class="hero-icon" :class="'icon-' + building.category"></span>
        </div>
        <div class="hero-overlay">
          <div class="hero-meta">
            <span class="meta-tag">{{ building.category }}</span>
            <span class="meta-tag">{{ building.dynasty }}</span>
            <span class="meta-tag heritage" v-if="building.heritage.includes('世界')"><span class="meta-icon-world"></span>{{ building.heritage }}</span>
            <span class="meta-tag heritage" v-else-if="building.heritage.includes('全国重点')"><span class="meta-icon-heritage"></span>{{ building.heritage }}</span>
          </div>
          <h1 class="hero-title">{{ building.name }}</h1>
          <p class="hero-desc">{{ building.imageDesc || building.meaning }}</p>
        </div>
      </div>
    </div>

    <!-- 核心信息摘要区 -->
    <div class="summary-strip" v-if="building">
      <div class="summary-card">
        <span class="card-icon icon-location"></span>
        <span class="card-label">地理位置</span>
        <span class="card-value">{{ building.province === building.city ? building.province : building.province + ' ' + building.city }}</span>
        <span class="card-sub">{{ building.region }}地区</span>
      </div>
      <div class="summary-card">
        <span class="card-icon icon-scale"></span>
        <span class="card-label">建筑规模</span>
        <span class="card-value">{{ building.scale }}</span>
        <span class="card-sub">{{ building.level }}</span>
      </div>
      <div class="summary-card">
        <span class="card-icon icon-structure"></span>
        <span class="card-label">结构类型</span>
        <span class="card-value">{{ building.structure }}</span>
        <span class="card-sub">{{ building.layout }}</span>
      </div>
      <div class="summary-card">
        <span class="card-icon icon-heritage"></span>
        <span class="card-label">保护级别</span>
        <span class="card-value">{{ building.heritage }}</span>
        <span class="card-sub">{{ building.dynasty }}时期</span>
      </div>
    </div>

    <!-- 建筑概述区 -->
    <div class="overview-section" v-if="building">
      <div class="section-label">建筑概述</div>
      <div class="overview-content">
        <p class="overview-text">{{ generateOverview() }}</p>
      </div>
    </div>

    <!-- 深度解读区 -->
    <div class="insight-grid" v-if="building">
      <div class="section-label">深度解读</div>

      <div class="insight-cards">
        <!-- 历史背景 -->
        <article class="insight-card">
          <div class="card-header">
            <span class="card-icon-insight icon-history"></span>
            <h3>历史背景</h3>
          </div>
          <div class="card-body">
            <p class="card-text">{{ generateHistory() }}</p>
            <div class="card-tags">
              <span class="tag">{{ building.dynasty }}</span>
              <span class="tag">{{ building.yearRange }}</span>
            </div>
          </div>
        </article>

        <!-- 技术特点 -->
        <article class="insight-card">
          <div class="card-header">
            <span class="card-icon-insight icon-tech"></span>
            <h3>技术特点</h3>
          </div>
          <div class="card-body">
            <p class="card-text">{{ generateTechnology() }}</p>
            <div class="card-tags">
              <span class="tag" v-for="m in building.material" :key="m">{{ m }}</span>
              <span class="tag">{{ building.craft }}</span>
            </div>
          </div>
        </article>

        <!-- 空间特征 -->
        <article class="insight-card">
          <div class="card-header">
            <span class="card-icon-insight icon-space"></span>
            <h3>空间特征</h3>
          </div>
          <div class="card-body">
            <p class="card-text">{{ generateSpatial() }}</p>
            <div class="card-tags">
              <span class="tag">{{ building.layout }}</span>
              <span class="tag">{{ building.function }}</span>
            </div>
          </div>
        </article>

        <!-- 文化价值 -->
        <article class="insight-card">
          <div class="card-header">
            <span class="card-icon-insight icon-culture"></span>
            <h3>文化价值</h3>
          </div>
          <div class="card-body">
            <p class="card-text">{{ generateCulture() }}</p>
            <div class="card-tags">
              <span class="tag">{{ building.heritage }}</span>
            </div>
          </div>
        </article>

        <!-- 影响与传承（全宽） -->
        <article class="insight-card full-width">
          <div class="card-header">
            <span class="card-icon-insight icon-legacy"></span>
            <h3>影响与传承</h3>
          </div>
          <div class="card-body">
            <p class="card-text">{{ generateLegacy() }}</p>
          </div>
        </article>
      </div>
    </div>

    <!-- 技术参数明细区 -->
    <div class="spec-section" v-if="building">
      <div class="section-label">技术参数</div>
      <div class="spec-grid">
        <div class="spec-item">
          <span class="spec-label">功能用途</span>
          <span class="spec-value">{{ building.function }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">平面布局</span>
          <span class="spec-value">{{ building.layout }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">结构形式</span>
          <span class="spec-value">{{ building.structure }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">建筑材料</span>
          <span class="spec-value spec-tags">
            <span class="spec-tag" v-for="m in building.material" :key="m">{{ m }}</span>
          </span>
        </div>
        <div class="spec-item">
          <span class="spec-label">营造工艺</span>
          <span class="spec-value">{{ building.craft }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">建筑规模</span>
          <span class="spec-value">{{ building.scale }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">建筑等级</span>
          <span class="spec-value">{{ building.level }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">保护级别</span>
          <span class="spec-value">{{ building.heritage }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">地理坐标</span>
          <span class="spec-value">{{ building.coords ? building.coords.join(', ') : '-' }}</span>
        </div>
        <div class="spec-item">
          <span class="spec-label">建造年代</span>
          <span class="spec-value">{{ building.yearRange }}</span>
        </div>
      </div>
    </div>

    <!-- 未找到 -->
    <div v-if="!building" class="panel">
      <div class="empty-state">
        <span class="icon">📭</span>
        <h3>没有找到对应案例</h3>
        <p>请从首页重新进入或检查链接。</p>
        <button @click="$router.push('/')" class="back-btn">返回首页</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import buildings from '../data/buildings.json'

const route = useRoute()
const imgError = ref(false)

const building = computed(() =>
  buildings.find((item) => item.id === route.params.id)
)

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
})

function handleImgError() {
  imgError.value = true
}

function getCategoryGradient(cat) {
  const gradients = {
    '民居': 'linear-gradient(135deg, #f0e6d3, #d4a574)',
    '官府': 'linear-gradient(135deg, #e8d5c4, #8f3d2e)',
    '皇宫': 'linear-gradient(135deg, #d4a574, #5c1a1a)',
    '桥梁': 'linear-gradient(135deg, #c8d8cc, #2d5a4a)'
  }
  return gradients[cat] || 'linear-gradient(135deg, #f5efe5, #e8d5c4)'
}

function generateOverview() {
  const b = building.value
  if (!b) return ''
  return `${b.name}位于${b.province}${b.city}，始建于${b.dynasty}时期（${b.yearRange}），是${b.level}的代表性建筑。该建筑采用${b.structure}结构体系，以${b.material.join('、')}为主要材料，体现了${b.layout}的布局特征。${b.feature}，在中国古代建筑史上具有重要地位。`
}

function generateHistory() {
  const b = building.value
  if (!b) return ''
  const dynastyMap = {
    '先秦': '先秦时期是中国古代建筑的萌芽阶段，夯土技术广泛应用于城墙与宫殿建设',
    '秦汉': '秦汉时期是中国古代建筑体系形成的关键阶段，都城规模宏大，宫殿建筑气势恢宏',
    '隋唐': '隋唐时期是中国古代建筑的鼎盛时期，木构技术成熟，建筑风格雄浑大气',
    '宋元': '宋元时期建筑技术精细化，《营造法式》的出现标志着建筑营造的标准化',
    '明清': '明清时期是中国古建筑的集大成时期，官式建筑规制严格，民间建筑百花齐放',
    '近现代': '近现代时期传统建筑面临转型，中西合璧的建筑风格开始出现'
  }
  return `${dynastyMap[b.dynasty] || ''}。${b.name}始建于${b.yearRange}，${b.meaning}。`
}

function generateTechnology() {
  const b = building.value
  if (!b) return ''
  const craftMap = {
    '榫卯连接': '榫卯连接技术是中国古代木构建筑的核心工艺，无需铁钉即可实现构件间的牢固连接，具有优异的抗震性能',
    '抬梁式': '抬梁式结构通过在立柱上架设横梁，逐层抬高形成屋顶，是中国古代大型建筑的典型结构形式',
    '穿斗式': '穿斗式结构以密集的立柱直接承接檩条，结构紧凑，用料经济，多见于南方民居',
    '石拱技术': '石拱桥技术利用石材抗压特性，通过楔形石块砌成弧形拱券，跨越能力出色',
    '夯土技术': '夯土技术将黄土层层夯实形成墙体，施工简便，保温性能好，是中国最古老的建筑工艺之一',
    '木构架': '木构架体系以柱、梁、枋、檩等构件组合成柔性框架，具有"墙倒屋不塌"的抗震优势'
  }
  return `${b.technology}。该建筑采用${b.structure}，${craftMap[b.craft] || b.craft}，以${b.material.join('、')}为主要建筑材料。`
}

function generateSpatial() {
  const b = building.value
  if (!b) return ''
  const layoutMap = {
    '中轴对称': '中轴对称布局是中国古代官式建筑的典型特征，主要建筑沿中轴线依次排列，体现等级秩序',
    '院落式': '院落式布局以庭院为中心组织空间，四面或三面建筑围合，形成内向型空间序列',
    '环形围楼': '环形围楼是一种防御性聚居建筑，环形平面布局使所有住户享有均等的防御视野',
    '山水园林式': '山水园林式布局追求"虽由人作，宛自天开"的境界，建筑与山水自然环境融为一体',
    '不规则方形': '不规则方形布局因地制宜，根据地形地势灵活调整建筑朝向和规模',
    '廊桥合一': '廊桥合一将桥梁与廊屋结合，既满足交通功能，又提供遮风避雨的通行空间'
  }
  return `${b.name}采用${b.layout}的空间组织方式，${layoutMap[b.layout] || ''}。建筑功能以${b.function}为主，规模达${b.scale}级别。`
}

function generateCulture() {
  const b = building.value
  if (!b) return ''
  return `${b.meaning}。该建筑${b.heritage.includes('世界') ? '已被列入世界文化遗产名录' : b.heritage.includes('全国重点') ? '被列为全国重点文物保护单位' : '具有重要的历史文化遗产价值'}，是${b.dynasty}时期${b.category}建筑的杰出代表，体现了中国古代劳动人民的智慧和创造力。`
}

function generateLegacy() {
  const b = building.value
  if (!b) return ''
  return `${b.name}作为${b.dynasty}时期${b.category}建筑的代表，其${b.structure}技术和${b.layout}布局理念对后世建筑产生了深远影响。${b.heritage.includes('世界') ? '作为世界文化遗产' : b.heritage.includes('全国重点') ? '作为全国重点文物保护单位' : '作为珍贵的历史文化遗产'}，${b.name}不仅是研究中国古代建筑技术的重要实物资料，更是传承中华优秀传统文化的重要载体。今天，它继续向世人展示着中华建筑文明的独特魅力。`
}
</script>

<style scoped>
.detail-shell {
  min-height: 100vh;
  background: var(--bg);
}

/* ===== Hero 全屏图片区 ===== */
.detail-hero {
  width: 100%;
  position: relative;
}

.hero-image-wrap {
  position: relative;
  width: 100%;
  height: 70vh;
  min-height: 480px;
  max-height: 680px;
  overflow: hidden;
}

.hero-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-icon {
  width: 100px;
  height: 100px;
  position: relative;
  opacity: 0.4;
}

.hero-icon::before, .hero-icon::after {
  content: '';
  position: absolute;
}

.icon-民居::before {
  width: 70px;
  height: 70px;
  border: 4px solid #fff;
  border-radius: 4px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.icon-民居::after {
  width: 0;
  height: 0;
  border-left: 48px solid transparent;
  border-right: 48px solid transparent;
  border-bottom: 30px solid #fff;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.icon-官府::before {
  width: 80px;
  height: 60px;
  border: 4px solid #fff;
  border-radius: 3px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.icon-官府::after {
  width: 60px;
  height: 3px;
  background: #fff;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 12px 0 #fff, 0 24px 0 #fff;
}

.icon-皇宫::before {
  width: 84px;
  height: 64px;
  border: 4px solid #fff;
  border-radius: 3px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.icon-皇宫::after {
  width: 96px;
  height: 6px;
  background: #fff;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;
  box-shadow: 0 12px 0 #fff;
}

.icon-桥梁::before {
  width: 80px;
  height: 8px;
  background: #fff;
  border-radius: 4px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.icon-桥梁::after {
  width: 6px;
  height: 20px;
  background: #fff;
  bottom: 16px;
  left: 12px;
  border-radius: 2px;
  box-shadow: 70px 0 0 #fff;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60px 48px 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.meta-tag {
  padding: 6px 16px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 20px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.meta-tag.heritage {
  background: rgba(179,135,40,0.3);
  border-color: rgba(179,135,40,0.5);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.meta-icon-world, .meta-icon-heritage {
  display: inline-block;
  width: 16px;
  height: 16px;
  position: relative;
  flex-shrink: 0;
}

.meta-icon-world::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 50%;
  top: 2px;
  left: 2px;
}
.meta-icon-world::after {
  content: '';
  position: absolute;
  width: 2px;
  height: 8px;
  background: rgba(255,255,255,0.9);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  box-shadow: -3px 0 0 rgba(255,255,255,0.9), 3px 0 0 rgba(255,255,255,0.9);
}

.meta-icon-heritage::before {
  content: '';
  position: absolute;
  width: 10px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.9);
  border-radius: 2px;
  top: 1px;
  left: 3px;
}
.meta-icon-heritage::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 6px;
  margin-bottom: 8px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.3);
}

.hero-desc {
  font-size: 16px;
  color: rgba(255,255,255,0.85);
  letter-spacing: 1px;
  max-width: 600px;
}

/* ===== 核心信息摘要区 ===== */
.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  margin-top: -1px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px;
  border-right: 1px solid var(--border);
  position: relative;
  transition: background 0.3s;
}

.summary-card:last-child {
  border-right: none;
}

.summary-card:hover {
  background: rgba(143,61,46,0.03);
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--primary);
  border-radius: 0 0 3px 3px;
}

.card-icon {
  display: inline-block;
  width: 32px;
  height: 32px;
  position: relative;
  flex-shrink: 0;
}

.card-icon::before, .card-icon::after {
  content: '';
  position: absolute;
}

.icon-location::before {
  width: 20px;
  height: 20px;
  border: 3px solid var(--primary);
  border-radius: 50% 50% 50% 0;
  top: 4px;
  left: 6px;
  transform: rotate(-45deg);
}
.icon-location::after {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  top: 11px;
  left: 13px;
}

.icon-scale::before {
  width: 24px;
  height: 24px;
  border: 3px solid var(--primary);
  border-radius: 3px;
  top: 4px;
  left: 4px;
}
.icon-scale::after {
  width: 2px;
  height: 12px;
  background: var(--primary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: -6px 0 0 var(--primary), 6px 0 0 var(--primary), -3px -4px 0 var(--primary), -3px 4px 0 var(--primary), 3px -4px 0 var(--primary), 3px 4px 0 var(--primary);
}

.icon-structure::before {
  width: 20px;
  height: 4px;
  background: var(--primary);
  top: 12px;
  left: 6px;
  border-radius: 2px;
}
.icon-structure::after {
  width: 4px;
  height: 16px;
  background: var(--primary);
  top: 8px;
  left: 10px;
  border-radius: 2px;
  box-shadow: 8px 0 0 var(--primary), 16px 0 0 var(--primary);
}

.icon-heritage::before {
  width: 24px;
  height: 24px;
  border: 3px solid var(--primary);
  border-radius: 50%;
  top: 4px;
  left: 4px;
}
.icon-heritage::after {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.card-label {
  font-size: 12px;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.card-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  text-align: center;
}

.card-sub {
  font-size: 13px;
  color: var(--text-sub);
}

/* ===== 通用区块标题 ===== */
.section-label {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 3px;
  margin-bottom: 24px;
  padding-left: 16px;
  border-left: 4px solid var(--primary);
}

/* ===== 建筑概述区 ===== */
.overview-section {
  padding: 48px 0;
  max-width: 900px;
  margin: 0 auto;
}

.overview-content {
  background: var(--surface);
  border-radius: 12px;
  padding: 32px;
  border: 1px solid var(--border);
}

.overview-text {
  font-size: 16px;
  line-height: 2;
  color: var(--text-sub);
  text-align: justify;
  margin: 0;
}

/* ===== 深度解读区 ===== */
.insight-grid {
  padding: 0 0 48px;
  max-width: 1100px;
  margin: 0 auto;
}

.insight-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.insight-card {
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--border);
  overflow: hidden;
  transition: all 0.3s;
}

.insight-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.insight-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
}

.card-icon-insight {
  display: inline-block;
  width: 28px;
  height: 28px;
  position: relative;
  flex-shrink: 0;
}

.card-icon-insight::before, .card-icon-insight::after {
  content: '';
  position: absolute;
}

.icon-history::before {
  width: 20px;
  height: 20px;
  border: 3px solid var(--primary);
  border-radius: 50%;
  top: 4px;
  left: 4px;
}
.icon-history::after {
  width: 2px;
  height: 8px;
  background: var(--primary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  transform-origin: bottom center;
}

.icon-tech::before {
  width: 20px;
  height: 4px;
  background: var(--primary);
  top: 12px;
  left: 4px;
  border-radius: 2px;
}
.icon-tech::after {
  width: 4px;
  height: 12px;
  background: var(--primary);
  top: 8px;
  left: 8px;
  border-radius: 2px;
  box-shadow: 8px 0 0 var(--primary);
}

.icon-space::before {
  width: 20px;
  height: 16px;
  border: 3px solid var(--primary);
  top: 6px;
  left: 4px;
  border-radius: 2px;
}
.icon-space::after {
  width: 2px;
  height: 2px;
  background: var(--primary);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: -6px -4px 0 var(--primary), 6px -4px 0 var(--primary), -6px 4px 0 var(--primary), 6px 4px 0 var(--primary);
}

.icon-culture::before {
  width: 16px;
  height: 20px;
  border: 3px solid var(--primary);
  border-radius: 2px;
  top: 4px;
  left: 6px;
}
.icon-culture::after {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.icon-legacy::before {
  width: 24px;
  height: 24px;
  border: 3px solid var(--primary);
  border-radius: 50%;
  top: 2px;
  left: 2px;
}
.icon-legacy::after {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: -8px 0 0 var(--primary), 8px 0 0 var(--primary), 0 -8px 0 var(--primary), 0 8px 0 var(--primary);
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  letter-spacing: 1px;
}

.card-body {
  padding: 20px 24px 24px;
}

.card-text {
  font-size: 15px;
  line-height: 1.9;
  color: var(--text-sub);
  margin: 0 0 16px;
  text-align: justify;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background: rgba(143,61,46,0.08);
  color: var(--primary);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

/* ===== 技术参数明细区 ===== */
.spec-section {
  padding: 0 0 60px;
  max-width: 1100px;
  margin: 0 auto;
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.spec-item {
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s;
}

.spec-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 12px rgba(143,61,46,0.08);
}

.spec-label {
  font-size: 12px;
  color: var(--text-sub);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.spec-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-main);
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.spec-tag {
  padding: 3px 10px;
  background: rgba(179,135,40,0.1);
  color: var(--accent);
  border-radius: 8px;
  font-size: 13px;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-state .icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  color: var(--text-main);
  margin: 16px 0 8px;
}

.empty-state p {
  color: var(--text-sub);
  margin-bottom: 24px;
}

.back-btn {
  padding: 12px 32px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  background: var(--accent);
  transform: translateY(-2px);
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .summary-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .summary-card:nth-child(2) {
    border-right: none;
  }
  .insight-cards {
    grid-template-columns: 1fr;
  }
  .spec-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .hero-title {
    font-size: 36px;
  }
}

@media (max-width: 700px) {
  .hero-image-wrap {
    height: 50vh;
    min-height: 320px;
  }
  .hero-overlay {
    padding: 40px 24px 28px;
  }
  .hero-title {
    font-size: 28px;
    letter-spacing: 3px;
  }
  .hero-desc {
    font-size: 14px;
  }
  .summary-strip {
    grid-template-columns: 1fr 1fr;
  }
  .summary-card {
    padding: 20px 12px;
  }
  .card-value {
    font-size: 16px;
  }
  .overview-section,
  .insight-grid,
  .spec-section {
    padding-left: 16px;
    padding-right: 16px;
  }
  .spec-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .section-label {
    font-size: 20px;
  }
}
</style>
