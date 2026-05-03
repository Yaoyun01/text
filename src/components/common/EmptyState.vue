<template>
  <div class="empty-state">
    <p class="empty-icon">📭</p>
    <h3>{{ title || '暂无数据' }}</h3>
    <p v-if="message" class="empty-message">{{ message }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: String,
  message: String
})
</script>

<style scoped>
.empty-state {
  min-height: 240px;
  display: grid;
  place-items: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-sub);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.empty-message {
  margin-top: 8px;
  color: var(--text-sub);
}
</style>
