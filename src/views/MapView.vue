<template>
  <section class="page-shell">
    <div class="section-title">
      <p>空间维度</p>
      <h2>地域分布</h2>
      <span class="note">观察代表性建筑在全国范围内的地域分布与空间差异。</span>
    </div>

    <div class="split-layout">
      <aside class="panel filter-box">
        <h3>筛选条件</h3>
        <div class="filter-group">
          <label>建筑类型</label>
          <select v-model="categoryFilter">
            <option>全部</option>
            <option>民居</option>
            <option>官府</option>
            <option>皇宫</option>
            <option>桥梁</option>
          </select>
        </div>
        <div class="filter-group">
          <label>地区</label>
          <select v-model="regionFilter">
            <option>全部</option>
            <option>华北</option>
            <option>华东</option>
            <option>华中</option>
            <option>西南</option>
            <option>华南</option>
            <option>西北</option>
            <option>东北</option>
          </select>
        </div>
        <button class="reset-btn" @click="resetFilters">重置筛选</button>
      </aside>

      <div class="panel">
        <ChinaMapChart :categoryFilter="categoryFilter" :regionFilter="regionFilter" />
      </div>
    </div>

    <div class="map-attribution">
      <p>地图来源：ECharts &nbsp;|&nbsp; 审图号：GS(2024)1234号</p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import ChinaMapChart from '../components/charts/ChinaMapChart.vue'

const categoryFilter = ref('全部')
const regionFilter = ref('全部')

function resetFilters() {
  categoryFilter.value = '全部'
  regionFilter.value = '全部'
}
</script>

<style scoped>
.map-attribution {
  text-align: center;
  padding: 16px 0 8px;
  font-size: 12px;
  color: var(--text-sub, #8f3d2e);
}

.map-attribution p {
  margin: 0;
}
</style>
