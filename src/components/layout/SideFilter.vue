<template>
  <aside class="side-filter panel">
    <h3>筛选条件</h3>
    <div class="filter-group">
      <label>建筑类型</label>
      <select v-model="filters.category" @change="emitChange">
        <option value="">全部</option>
        <option>民居</option>
        <option>官府</option>
        <option>皇宫</option>
        <option>桥梁</option>
      </select>
    </div>
    <div class="filter-group">
      <label>朝代</label>
      <select v-model="filters.dynasty" @change="emitChange">
        <option value="">全部</option>
        <option>先秦</option>
        <option>秦汉</option>
        <option>隋唐</option>
        <option>宋元</option>
        <option>明清</option>
      </select>
    </div>
    <div class="filter-group">
      <label>地区</label>
      <select v-model="filters.region" @change="emitChange">
        <option value="">全部</option>
        <option>华北</option>
        <option>华东</option>
        <option>华中</option>
        <option>西南</option>
      </select>
    </div>
    <button class="reset-btn" @click="resetFilters">重置筛选</button>
  </aside>
</template>

<script setup>
import { reactive } from 'vue'

const filters = reactive({
  category: '',
  dynasty: '',
  region: ''
})

const emit = defineEmits(['change'])

function emitChange() {
  emit('change', { ...filters })
}

function resetFilters() {
  filters.category = ''
  filters.dynasty = ''
  filters.region = ''
  emit('change', { ...filters })
}
</script>

<style scoped>
.side-filter {
  display: grid;
  gap: 16px;
}
.filter-group {
  display: grid;
  gap: 8px;
}
.filter-group label {
  font-size: 14px;
  color: var(--text-sub);
}
.filter-group select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-strong);
}
.reset-btn {
  margin-top: 8px;
  padding: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-sub);
  transition: background 0.2s;
}
.reset-btn:hover {
  background: rgba(143, 61, 46, 0.06);
}
</style>
