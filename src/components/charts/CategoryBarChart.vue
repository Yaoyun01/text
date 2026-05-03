<template>
  <div ref="chartRef" class="category-bar-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'category'
  }
})

const chartRef = ref(null)
let chart = null

const defaultData = {
  '民居': { count: 8, materials: 5, avgAge: 400 },
  '官府': { count: 5, materials: 4, avgAge: 300 },
  '皇宫': { count: 3, materials: 6, avgAge: 600 },
  '桥梁': { count: 4, materials: 3, avgAge: 800 }
}

function getOption() {
  const displayData = Object.keys(props.data).length > 0 ? props.data : defaultData
  const categories = Object.keys(displayData)

  if (props.type === 'count') {
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: categories },
      yAxis: { type: 'value', name: '案例数量' },
      series: [{
        type: 'bar',
        data: categories.map(k => displayData[k].count),
        itemStyle: {
          color: (params) => ['#b38728', '#8f3d2e', '#5c1a1a', '#2d5a4a'][params.dataIndex]
        }
      }]
    }
  }

  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: categories },
    yAxis: { type: 'value', name: '平均年代' },
    series: [{
      type: 'bar',
      data: categories.map(k => displayData[k].avgAge),
      itemStyle: {
        color: (params) => ['#b38728', '#8f3d2e', '#5c1a1a', '#2d5a4a'][params.dataIndex]
      }
    }]
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

watch([() => props.data, () => props.type], () => {
  if (chart) {
    chart.setOption(getOption())
  }
})
</script>

<style scoped>
.category-bar-chart {
  width: 100%;
  height: 300px;
}
</style>
