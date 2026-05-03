<template>
  <div ref="chartRef" class="relation-graph"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const chartRef = ref(null)
let chart = null

const defaultData = {
  nodes: [
    { name: '民居', category: 0 },
    { name: '官府', category: 0 },
    { name: '皇宫', category: 0 },
    { name: '桥梁', category: 0 },
    { name: '居住功能', category: 1 },
    { name: '行政管理', category: 1 },
    { name: '皇权礼制', category: 1 },
    { name: '交通通行', category: 1 },
    { name: '木构架', category: 2 },
    { name: '石拱桥', category: 2 },
    { name: '院落式', category: 2 },
    { name: '中轴对称', category: 2 }
  ],
  links: [
    { source: '民居', target: '居住功能' },
    { source: '民居', target: '院落式' },
    { source: '官府', target: '行政管理' },
    { source: '官府', target: '中轴对称' },
    { source: '皇宫', target: '皇权礼制' },
    { source: '皇宫', target: '中轴对称' },
    { source: '桥梁', target: '交通通行' },
    { source: '桥梁', target: '石拱桥' },
    { source: '民居', target: '木构架' },
    { source: '官府', target: '木构架' },
    { source: '皇宫', target: '木构架' }
  ]
}

const categories = ['建筑类型', '功能', '结构/布局']

function getOption() {
  const displayData = Object.keys(props.data).length > 0 ? props.data : defaultData

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => `${params.data.name}`
    },
    legend: {
      data: categories,
      bottom: 0
    },
    series: [{
      type: 'graph',
      layout: 'force',
      symbolSize: 40,
      draggable: true,
      roam: true,
      label: { show: true, fontSize: 12 },
      edgeSymbol: ['circle', 'arrow'],
      data: displayData.nodes.map(n => ({
        ...n,
        category: n.category
      })),
      links: displayData.links,
      categories: categories.map((name, i) => ({ name })),
      lineStyle: { color: '#8f3d2e', opacity: 0.6 },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { color: '#b38728', width: 3 }
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

watch(() => props.data, () => {
  if (chart) {
    chart.setOption(getOption())
  }
})
</script>

<style scoped>
.relation-graph {
  width: 100%;
  height: 450px;
}
</style>
