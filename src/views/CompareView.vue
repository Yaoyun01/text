<template>
  <section class="page-shell">
    <div class="section-title">
      <p>比较维度</p>
      <h2>类型对比</h2>
      <span class="note">对比民居、官府、皇宫、桥梁在功能、布局、结构和技术上的差异。</span>
    </div>

    <div class="grid-2">
      <div class="panel">
        <h3 class="panel-title">综合特征对比</h3>
        <CompareRadarChart />
      </div>
      <div class="panel">
        <h3 class="panel-title">类型数量统计</h3>
        <CategoryBarChart type="count" />
      </div>
    </div>

    <div class="panel">
      <h3 class="panel-title">建筑类型-功能-结构关系</h3>
      <RelationGraph />
    </div>
  </section>
</template>

<script setup>
import CompareRadarChart from '../components/charts/CompareRadarChart.vue'
import CategoryBarChart from '../components/charts/CategoryBarChart.vue'
import RelationGraph from '../components/charts/RelationGraph.vue'
</script>
