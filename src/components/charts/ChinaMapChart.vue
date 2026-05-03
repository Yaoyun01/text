<template>
  <div ref="chartRef" class="china-map-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import buildings from '../../data/buildings.json'
import { useRouter } from 'vue-router'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  categoryFilter: {
    type: String,
    default: '全部'
  },
  regionFilter: {
    type: String,
    default: '全部'
  }
})

const chartRef = ref(null)
let chart = null
const router = useRouter()

const regionMap = {
  '华北': ['北京', '河北', '天津', '山西', '内蒙古'],
  '华东': ['江苏', '浙江', '安徽', '福建', '江西', '山东', '上海'],
  '华中': ['湖北', '湖南', '河南'],
  '西南': ['四川', '云南', '贵州', '西藏', '重庆'],
  '华南': ['广东', '广西', '海南'],
  '西北': ['陕西', '甘肃', '青海', '宁夏', '新疆'],
  '东北': ['辽宁', '吉林', '黑龙江']
}

const categoryColors = {
  '民居': '#b38728',
  '官府': '#8f3d2e',
  '皇宫': '#5c1a1a',
  '桥梁': '#2d5a4a'
}

function getScatterOption() {
  const mapData = props.data.length > 0 ? props.data : buildings
  const filtered = mapData.filter(b => {
    if (props.categoryFilter !== '全部' && b.category !== props.categoryFilter) return false
    if (props.regionFilter !== '全部') {
      const provinces = regionMap[props.regionFilter] || []
      if (!provinces.includes(b.province)) return false
    }
    return true
  })

  const scatterData = filtered.map(b => ({
    name: b.name,
    value: [...b.coords],
    category: b.category,
    province: b.province || '',
    city: b.city || '',
    dynasty: b.dynasty || '',
    feature: b.feature || ''
  }))

  return {
    title: {
      text: '建筑地域分布图',
      left: 'center',
      top: 10,
      textStyle: { fontSize: 18, color: '#2d241d', fontWeight: 700 }
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,250,243,0.96)',
      borderColor: 'rgba(89,62,46,0.3)',
      borderWidth: 1,
      textStyle: { color: '#2d241d', fontSize: 13 },
      padding: [10, 14],
      formatter: (params) => {
        if (params.componentSubType === 'scatter') {
          return `<strong style="font-size:15px">${params.name}</strong><br/>
            <span style="color:#8f3d2e">类型:</span> ${params.data.category}<br/>
            <span style="color:#8f3d2e">朝代:</span> ${params.data.dynasty}<br/>
            <span style="color:#8f3d2e">地点:</span> ${params.data.city}，${params.data.province}<br/>
            <span style="color:#8f3d2e">特色:</span> ${params.data.feature}`
        }
        return `<strong>${params.name}</strong>`
      }
    },
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      inRange: { symbolSize: [24, 36] }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.15,
      center: [104, 35],
      label: {
        show: true,
        fontSize: 11,
        color: '#5a4a3a'
      },
      itemStyle: {
        areaColor: '#f0e8d8',
        borderColor: '#8f3d2e',
        borderWidth: 1.5,
        shadowColor: 'rgba(143, 61, 46, 0.3)',
        shadowBlur: 20
      },
      emphasis: {
        label: { show: true, color: '#2d241d', fontWeight: 'bold' },
        itemStyle: { 
          areaColor: '#d4a574',
          borderColor: '#5c1a1a',
          borderWidth: 2
        }
      },
      regions: [
        { name: '南海诸岛', itemStyle: { areaColor: '#e0d8c8' } }
      ]
    },
    series: [{
      type: 'scatter',
      coordinateSystem: 'geo',
      data: scatterData,
      symbolSize: 22,
      label: {
        show: true,
        formatter: (p) => p.name,
        position: 'top',
        fontSize: 11,
        color: '#2d241d',
        backgroundColor: 'rgba(255,250,243,0.9)',
        padding: [3, 6],
        borderRadius: 4,
        borderColor: 'rgba(89,62,46,0.2)',
        borderWidth: 1
      },
      itemStyle: {
        color: (params) => categoryColors[params.data.category] || '#8f3d2e',
        shadowBlur: 12,
        shadowColor: 'rgba(0,0,0,0.2)'
      },
      emphasis: {
        scale: true,
        symbolSize: 32
      }
    }],
    animationDuration: 1200,
    animationEasing: 'cubicOut'
  }
}

async function initChart() {
  if (!chartRef.value) return
  
  chart = echarts.init(chartRef.value, null, { renderer: 'canvas' })
  
  try {
    const response = await fetch('/map/china.json')
    if (response.ok) {
      const chinaMapData = await response.json()
      echarts.registerMap('china', chinaMapData)
      console.log('地图数据加载成功')
    }
  } catch (e) {
    console.warn('地图数据加载失败:', e)
  }
  
  chart.setOption(getScatterOption())
  
  // 添加点击事件处理
  chart.on('click', (params) => {
    if (params.componentSubType === 'scatter') {
      // 优先使用 params.data.name，因为它包含完整的建筑名称
      const buildingName = params.data?.name || params.name
      console.log('点击的建筑:', buildingName)
      // 跳转到全屏 3D 视图，并传递建筑名称作为参数
      router.push({
        path: '/fullscreen-3d',
        query: { building: buildingName }
      })
    }
  })
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

watch([() => props.categoryFilter, () => props.regionFilter], () => {
  if (chart) {
    chart.setOption(getScatterOption())
  }
})
</script>

<style scoped>
.china-map-chart {
  width: 100%;
  height: 600px;
}
</style>
