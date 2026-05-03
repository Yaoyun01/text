<template>
  <aside class="detail-panel">
    <div v-if="building">
      <div class="panel-header">
        <h2>{{ building.name }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="badge-row">
        <span class="badge">{{ building.category }}</span>
        <span class="badge">{{ building.dynasty }}</span>
        <span class="badge">{{ building.structure }}</span>
      </div>
      <p class="meaning">{{ building.meaning }}</p>
      <div class="detail-grid">
        <div class="detail-item">
          <h4>功能</h4>
          <p>{{ building.function }}</p>
        </div>
        <div class="detail-item">
          <h4>布局</h4>
          <p>{{ building.layout }}</p>
        </div>
        <div class="detail-item">
          <h4>技术亮点</h4>
          <p>{{ building.technology }}</p>
        </div>
        <div class="detail-item">
          <h4>数据来源</h4>
          <p>{{ building.source }}</p>
        </div>
      </div>
    </div>
    <div v-else class="empty">未找到建筑信息</div>
  </aside>
</template>

<script setup>
defineProps({
  building: Object
})
defineEmits(['close'])
</script>

<style scoped>
.detail-panel {
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: var(--text-sub);
}
.meaning {
  margin-top: 16px;
  line-height: 1.8;
  color: var(--text-sub);
}
.detail-grid {
  display: grid;
  gap: 16px;
  margin-top: 20px;
}
.detail-item h4 {
  font-size: 14px;
  color: var(--text-sub);
  margin-bottom: 4px;
}
.detail-item p {
  line-height: 1.6;
}
</style>
