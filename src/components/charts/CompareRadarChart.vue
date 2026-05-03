<template>
  <div ref="chartRef" class="compare-radar-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import buildings from '../../data/buildings.json'

const chartRef = ref(null)
let chart = null

const categories = ['民居', '官府', '皇宫', '桥梁']

function calculateRadarData() {
  return categories.map(cat => {
    const catBuildings = buildings.filter(b => b.category === cat)
    const count = catBuildings.length
    
    const heritageCount = catBuildings.filter(b => 
      b.heritage && (b.heritage.includes('世界') || b.heritage.includes('全国重点'))
    ).length
    
    const avgYear = catBuildings.reduce((sum, b) => sum + (b.year || 0), 0) / Math.max(count, 1)
    const age = avgYear > 0 ? Math.min(100, (2024 - avgYear) / 10) : 50
    
    const uniqueMaterials = new Set()
    catBuildings.forEach(b => b.material?.forEach(m => uniqueMaterials.add(m)))
    
    return {
      name: cat,
      value: [
        Math.min(100, count * 12 + 10),
        Math.min(100, heritageCount * 15 + 20),
        Math.min(100, Math.round(age)),
        Math.min(100, uniqueMaterials.size * 15),
        Math.min(100, count * 10 + 25),
        Math.min(100, count * 8 + 30)
      ]
    }
  })
}

const indicators = [
  { name: '案例数量' },
  { name: '保护级别' },
  { name: '历史年代' },
  { name: '材料多样性' },
  { name: '技术复杂度' },
  { name: '文化影响力' }
]

function getOption() {
  const radarData = calculateRadarData()
  
  const categoryColors = {
    '民居': 'rgba(179, 135, 40, 0.8)',
    '官府': 'rgba(143, 61, 46, 0.8)',
    '皇宫': 'rgba(92, 26, 26, 0.8)',
    '桥梁': 'rgba(45, 90, 74, 0.8)'
  }

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,250,243,0.96)',
      borderColor: 'rgba(89,62,46,0.3)',
      textStyle: { color: '#2d241d' },
      padding: [10, 14]
    },
    legend: {
      data: categories,
      bottom: 0,
      itemGap: 28,
      textStyle: { fontSize: 13, color: '#5a4a3a' }
    },
    radar: {
      indicator: indicators,
      center: ['50%', '48%'],
      radius: '60%',
      name: {
        textStyle: { fontSize: 12, color: '#5a4a3a' }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(255,250,243,0.1)', 'rgba(255,250,243,0.2)', 
                   'rgba(255,250,243,0.3)', 'rgba(255,250,243,0.4)',
                   'rgba(255,250,243,0.5)']
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(89,62,46,0.2)' }
      },
      splitLine: {
        lineStyle: { color: 'rgba(89,62,46,0.15)' }
      }
    },
    series: [{
      type: 'radar',
      data: radarData.map(d => ({
        value: d.value,
        name: d.name,
        lineStyle: { width: 2.5, color: categoryColors[d.name] },
        areaStyle: { opacity: 0.15, color: categoryColors[d.name] },
        itemStyle: { color: categoryColors[d.name], borderWidth: 2 }
      }))
    }],
    animationDuration: 1000
  }
}

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  chart.setOption(getOption())
}

function resizeChart() {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>

<style scoped>
.compare-radar-chart {
  width: 100%;
  height: 450px;
}
</style>
