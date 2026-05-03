<template>
  <div ref="chartRef" class="timeline-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import buildings from '../../data/buildings.json'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  categoryFilter: {
    type: String,
    default: '全部'
  },
  dynastyFilter: {
    type: String,
    default: '全部'
  }
})

const chartRef = ref(null)
let chart = null

const dynasties = ['先秦', '秦汉', '隋唐', '宋元', '明清', '近现代']
const categories = ['民居', '官府', '皇宫', '桥梁']
const categoryColors = {
  '民居': '#b38728',
  '官府': '#8f3d2e',
  '皇宫': '#5c1a1a',
  '桥梁': '#2d5a4a'
}

const dynastyColors = {
  '先秦': '#d4a574',
  '秦汉': '#c9956b',
  '隋唐': '#b8865a',
  '宋元': '#a8764a',
  '明清': '#8f3d2e',
  '近现代': '#5c1a1a'
}

function getDynastyName(dynasty) {
  if (['战国', '秦', '先秦'].includes(dynasty)) return '先秦'
  if (['秦', '汉', '秦汉', '三国'].includes(dynasty)) return '秦汉'
  if (['隋', '唐', '隋唐'].includes(dynasty)) return '隋唐'
  if (['宋', '辽', '金', '元', '宋元'].includes(dynasty)) return '宋元'
  if (['明', '清', '明清', '清初', '清末民国'].includes(dynasty)) return '明清'
  if (['近现代', '民国'].includes(dynasty)) return '近现代'
  return dynasty
}

function getOption() {
  const sourceData = props.data.length > 0 ? props.data : buildings

  const filtered = sourceData.filter(b => {
    const dynastyName = getDynastyName(b.dynasty)
    if (props.dynastyFilter && props.dynastyFilter !== '全部' && dynastyName !== props.dynastyFilter) return false
    if (props.categoryFilter && props.categoryFilter !== '全部' && b.category !== props.categoryFilter) return false
    return true
  })

  const dynastyData = {}
  dynasties.forEach(d => dynastyData[d] = [])
  filtered.forEach(b => {
    const dName = getDynastyName(b.dynasty)
    if (dynastyData[dName]) {
      dynastyData[dName].push({
        name: b.name,
        year: b.year,
        category: b.category,
        province: b.province || b.city || ''
      })
    }
  })

  const dynastyCounts = dynasties.map(d => dynastyData[d].length)
  const maxCount = Math.max(...dynastyCounts, 1)

  const barData = dynasties.map((d, i) => ({
    name: d,
    value: dynastyCounts[i],
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: dynastyColors[d] },
        { offset: 1, color: dynastyColors[d] + '88' }
      ]),
      borderRadius: [6, 6, 0, 0]
    }
  }))

  const scatterData = filtered.map((b, i) => {
    const dName = getDynastyName(b.dynasty)
    const dynastyIndex = dynasties.indexOf(dName)
    return {
      name: b.name,
      value: [dynastyIndex, b.year],
      dynasty: dName,
      category: b.category,
      province: b.province || b.city || '',
      year: b.year,
      itemStyle: {
        color: categoryColors[b.category],
        borderColor: '#fff',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: categoryColors[b.category] + '66'
      }
    }
  })

  return {
    title: {
      text: '建筑分布时间轴',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 700,
        color: '#2d241d',
        letterSpacing: 2
      }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,250,243,0.96)',
      borderColor: 'rgba(89,62,46,0.3)',
      borderWidth: 1,
      textStyle: { color: '#2d241d', fontSize: 13 },
      padding: [10, 14],
      formatter: (params) => {
        if (params.componentSubType === 'scatter' && params.data) {
          const d = params.data
          return `<strong style="font-size:15px">${d.name}</strong><br/>
            <span style="color:#8f3d2e">类型:</span> ${d.category}<br/>
            <span style="color:#8f3d2e">年代:</span> ${d.year < 0 ? '前' + Math.abs(d.year) + '年' : d.year + '年'}<br/>
            <span style="color:#8f3d2e">朝代:</span> ${d.dynasty}<br/>
            <span style="color:#8f3d2e">地点:</span> ${d.province}`
        }
        return ''
      }
    },
    legend: {
      data: categories,
      bottom: 10,
      itemGap: 32,
      textStyle: { fontSize: 13, color: '#5a4a3a' },
      inactiveColor: '#ccc'
    },
    grid: {
      left: 80,
      right: 40,
      top: 60,
      bottom: 80
    },
    xAxis: {
      type: 'category',
      data: dynasties,
      name: '朝代',
      nameTextStyle: { fontSize: 14, padding: [10, 0, 0, 0], color: '#5a4a3a' },
      axisLine: { 
        lineStyle: { 
          color: 'rgba(89,62,46,0.2)',
          width: 2
        } 
      },
      axisLabel: { 
        fontSize: 13, 
        color: '#5a4a3a',
        fontWeight: 500,
        interval: 0
      },
      axisTick: { 
        lineStyle: { color: 'rgba(89,62,46,0.2)' },
        alignWithLabel: true
      },
      boundaryGap: true,
      splitArea: {
        show: true,
        areaStyle: {
          color: dynasties.map((d, i) => i % 2 === 0 ? 'rgba(212,165,116,0.04)' : 'rgba(143,61,46,0.04)')
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '年份',
      inverse: true,
      nameTextStyle: { fontSize: 14, color: '#5a4a3a' },
      axisLine: { lineStyle: { color: 'rgba(89,62,46,0.2)' } },
      axisLabel: { 
        fontSize: 12, 
        color: '#5a4a3a',
        formatter: (val) => val < 0 ? `前${Math.abs(val)}年` : `${val}年`
      },
      splitLine: { 
        lineStyle: { 
          type: 'dashed', 
          color: 'rgba(89,62,46,0.06)',
          width: 1
        } 
      },
      min: 'dataMin',
      max: 'dataMax'
    },
    series: [
      {
        name: '各朝代数量',
        type: 'bar',
        data: barData,
        barWidth: '40%',
        barGap: '-100%',
        z: 0,
        label: {
          show: true,
          position: 'top',
          formatter: (p) => p.value > 0 ? `${p.value}个` : '',
          fontSize: 12,
          fontWeight: 600,
          color: '#5a4a3a'
        }
      },
      {
        name: '建筑分布',
        type: 'scatter',
        data: scatterData,
        symbolSize: (val, params) => {
          return Math.max(8, Math.min(16, dynastyCounts[dynasties.indexOf(params.data.dynasty)] / 3 * 6))
        },
        z: 10,
        label: {
          show: scatterData.length <= 12,
          formatter: (p) => p.data.name || '',
          position: 'top',
          fontSize: 10,
          color: '#5a4a3a',
          backgroundColor: 'rgba(255,250,243,0.9)',
          padding: [2, 6],
          borderRadius: 4,
          borderColor: 'rgba(89,62,46,0.15)',
          borderWidth: 1
        },
        emphasis: {
          scale: 1.5,
          itemStyle: {
            shadowBlur: 16,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        },
        animationDelay: (idx) => idx * 80
      }
    ],
    animationDuration: 1200,
    animationEasing: 'cubicOut'
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

watch([() => props.categoryFilter, () => props.dynastyFilter], () => {
  if (chart) {
    chart.setOption(getOption())
  }
})
</script>

<style scoped>
.timeline-chart {
  width: 100%;
  height: 500px;
}
</style>
