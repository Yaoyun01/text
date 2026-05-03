<template>
  <section class="page-shell">
    <div class="section-title">
      <p>时间维度</p>
      <h2>时间演进</h2>
      <span class="note">纵览两千多年建筑发展史，探索各朝代建筑类型的演变与传承。</span>
    </div>

    <!-- 朝代概览卡片 -->
    <div class="dynasty-overview">
      <div v-for="(item, idx) in dynastyStats" :key="item.name" 
           class="dynasty-card" 
           :style="{ borderTopColor: getDynastyColor(item.name) }"
           :class="{ active: activeDynasty === item.name }"
           @click="activeDynasty = activeDynasty === item.name ? '' : item.name">
        <div class="dynasty-name">{{ item.name }}</div>
        <div class="dynasty-count">{{ item.count }}个</div>
        <div class="dynasty-types">
          <span v-for="type in item.types" :key="type" class="dynasty-type-tag" :style="{ background: getCatColor(type) + '20', color: getCatColor(type) }">{{ type }}</span>
        </div>
      </div>
    </div>

    <!-- 主图表区域 -->
    <div class="chart-section">
      <div class="panel">
        <h3 class="chart-title">建筑分布时间轴</h3>
        <TimelineChart :categoryFilter="categoryFilter" :dynastyFilter="activeDynasty || dynastyFilter" />
      </div>
      
      <div class="side-panel">
        <!-- 数量趋势 -->
        <div class="panel" style="margin-bottom: 20px;">
          <h3 class="chart-title">各朝代建筑数量</h3>
          <DynastyBarChart :dynastyFilter="activeDynasty || dynastyFilter" />
        </div>
        
        <!-- 类型占比 -->
        <div class="panel">
          <h3 class="chart-title">朝代类型分布</h3>
          <TypePieChart :dynastyFilter="activeDynasty || dynastyFilter" />
        </div>
      </div>
    </div>

    <!-- 底部时间线 -->
    <div class="panel">
      <h3 class="chart-title">历史时间线</h3>
      <div class="timeline-bar">
        <div v-for="(item, idx) in dynastyStats" :key="idx" 
             class="timeline-segment"
             :style="{ flex: item.count, background: getDynastyColor(item.name) }"
             @click="activeDynasty = activeDynasty === item.name ? '' : item.name">
          <span class="timeline-label">{{ item.name }}</span>
          <span class="timeline-count">{{ item.count }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import TimelineChart from '../components/charts/TimelineChart.vue'
import DynastyBarChart from '../components/charts/DynastyBarChart.vue'
import TypePieChart from '../components/charts/TypePieChart.vue'
import buildings from '../data/buildings.json'

const categoryFilter = ref('全部')
const dynastyFilter = ref('全部')
const activeDynasty = ref('')

const dynastyStats = computed(() => {
  const dynasties = ['先秦', '秦汉', '隋唐', '宋元', '明清']
  const categories = ['民居', '官府', '皇宫', '桥梁']
  
  return dynasties.map(name => {
    const dynastyBuildings = buildings.filter(b => {
      if (['战国', '秦', '先秦'].includes(b.dynasty) && name === '先秦') return true
      if (['秦', '汉', '秦汉', '三国'].includes(b.dynasty) && name === '秦汉') return true
      if (['隋', '唐', '隋唐'].includes(b.dynasty) && name === '隋唐') return true
      if (['宋', '辽', '金', '元', '宋元'].includes(b.dynasty) && name === '宋元') return true
      if (['明', '清', '明清', '清初', '清末民国'].includes(b.dynasty) && name === '明清') return true
      return false
    })
    
    const types = categories.filter(cat => 
      dynastyBuildings.some(b => b.category === cat)
    )
    
    return {
      name,
      count: dynastyBuildings.length,
      types
    }
  }).filter(d => d.count > 0)
})

function getDynastyColor(name) {
  const colors = {
    '先秦': '#8f3d2e',
    '秦汉': '#b38728',
    '隋唐': '#5c1a1a',
    '宋元': '#2d5a4a',
    '明清': '#6b4423'
  }
  return colors[name] || '#8f3d2e'
}

function getCatColor(cat) {
  const colors = {
    '民居': '#b38728',
    '官府': '#8f3d2e',
    '皇宫': '#5c1a1a',
    '桥梁': '#2d5a4a'
  }
  return colors[cat] || '#8f3d2e'
}

function resetFilters() {
  categoryFilter.value = '全部'
  dynastyFilter.value = '全部'
  activeDynasty.value = ''
}
</script>

<style scoped>
.dynasty-overview {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 24px;
}

.dynasty-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  border-top-width: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.dynasty-card:hover,
.dynasty-card.active {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.dynasty-card.active {
  border-color: var(--primary);
}

.dynasty-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8px;
}

.dynasty-count {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.dynasty-types {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.dynasty-type-tag {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.chart-section {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 320px;
}

.side-panel {
  display: grid;
  gap: 20px;
}

.chart-title {
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, var(--primary), var(--accent));
  border-radius: 2px;
}

.timeline-bar {
  display: flex;
  gap: 4px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.timeline-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-width: 60px;
}

.timeline-segment:hover {
  filter: brightness(1.2);
  transform: scaleY(1.1);
}

.timeline-label {
  font-size: 14px;
  font-weight: 600;
}

.timeline-count {
  font-size: 20px;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .chart-section {
    grid-template-columns: 1fr;
  }
  
  .dynasty-overview {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .dynasty-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
