<template>
  <div ref="chartRef" class="dynasty-bar-chart"></div>
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

const dynasties = ['先秦', '秦汉', '隋唐', '宋元', '明清']
const dynastyColors = {
  '先秦': '#8f3d2e',
  '秦汉': '#b38728',
  '隋唐': '#5c1a1a',
  '宋元': '#2d5a4a',
  '明清': '#6b4423'
}

function getOption() {
  const data = dynasties.map(name => {
    let count = 0
    buildings.forEach(b => {
      if (['战国', '秦', '先秦'].includes(b.dynasty) && name === '先秦') count++
      else if (['秦', '汉', '秦汉', '三国'].includes(b.dynasty) && name === '秦汉') count++
      else if (['隋', '唐', '隋唐'].includes(b.dynasty) && name === '隋唐') count++
      else if (['宋', '辽', '金', '元', '宋元'].includes(b.dynasty) && name === '宋元') count++
      else if (['明', '清', '明清', '清初', '清末民国'].includes(b.dynasty) && name === '明清') count++
    })
    return { name, value: count }
  })

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,250,243,0.96)',
      borderColor: 'rgba(89,62,46,0.3)',
      textStyle: { color: '#2d241d' },
      formatter: (params) => {
        return `<strong>${params[0].name}</strong><br/>建筑数量: ${params[0].value}个`
      }
    },
    grid: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { type: 'dashed', color: 'rgba(89,62,46,0.1)' } },
      axisLabel: { fontSize: 11, color: '#5a4a3a' }
    },
    yAxis: {
      type: 'category',
      data: dynasties,
      axisLine: { lineStyle: { color: 'rgba(89,62,46,0.2)' } },
      axisLabel: { fontSize: 12, color: '#5a4a3a', fontWeight: 500 },
      axisTick: { show: false }
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: dynastyColors[d.name] + '80' },
            { offset: 1, color: dynastyColors[d.name] }
          ]),
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: 20,
      label: {
        show: true,
        position: 'right',
        fontSize: 12,
        fontWeight: 600,
        color: '#5a4a3a'
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
.dynasty-bar-chart {
  width: 100%;
  height: 220px;
}
</style>
