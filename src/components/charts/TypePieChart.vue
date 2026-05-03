<template>
  <div ref="chartRef" class="type-pie-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import buildings from '../../data/buildings.json'

const props = defineProps({
  dynastyFilter: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chart = null

const categories = ['民居', '官府', '皇宫', '桥梁']
const categoryColors = {
  '民居': '#b38728',
  '官府': '#8f3d2e',
  '皇宫': '#5c1a1a',
  '桥梁': '#2d5a4a'
}

function getOption() {
  const data = categories.map(cat => {
    const count = buildings.filter(b => b.category === cat).length
    return { name: cat, value: count }
  })

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,250,243,0.96)',
      borderColor: 'rgba(89,62,46,0.3)',
      textStyle: { color: '#2d241d' },
      formatter: (params) => {
        return `<strong>${params.name}</strong><br/>数量: ${params.value}个<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { fontSize: 12, color: '#5a4a3a' }
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fffdf8',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: (p) => `{name|${p.name}}\n{value|${p.value}个}`,
        rich: {
          name: { fontSize: 11, color: '#5a4a3a', padding: [0, 0, 2, 0] },
          value: { fontSize: 14, fontWeight: 600, color: '#2d241d' }
        }
      },
      labelLine: {
        length: 10,
        length2: 15
      },
      data: data.map(d => ({
        ...d,
        itemStyle: { color: categoryColors[d.name] }
      })),
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      }
    }],
    animationDuration: 800
  }
}

function initChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
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
.type-pie-chart {
  width: 100%;
  height: 280px;
}
</style>
