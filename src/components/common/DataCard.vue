<template>
  <article class="data-card">
    <span class="card-label">{{ label }}</span>
    <strong class="card-value">{{ value }}</strong>
    <p v-if="desc" class="card-desc">{{ desc }}</p>
  </article>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  desc: String
})
</script>

<style scoped>
.data-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.card-label {
  color: var(--text-sub);
  font-size: 14px;
}
.card-value {
  display: block;
  margin-top: 8px;
  font-size: 28px;
  color: var(--primary);
}
.card-desc {
  margin-top: 6px;
  color: var(--text-sub);
  line-height: 1.6;
}
</style>
