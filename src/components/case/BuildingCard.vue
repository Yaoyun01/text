<template>
  <article class="building-card" @click="$emit('click', building)">
    <span class="badge">{{ building.category }}</span>
    <h3>{{ building.name }}</h3>
    <p class="meta">{{ building.dynasty }} · {{ building.province }}</p>
    <p class="feature">{{ building.feature }}</p>
    <RouterLink :to="`/detail/${building.id}`" class="link" @click.stop>查看详情</RouterLink>
  </article>
</template>

<script setup>
defineProps({
  building: Object
})
defineEmits(['click'])
</script>

<style scoped>
.building-card {
  padding: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.building-card:hover {
  box-shadow: var(--shadow);
}
.building-card h3 {
  margin-top: 12px;
  font-size: 18px;
}
.meta {
  margin-top: 6px;
  font-size: 14px;
  color: var(--text-sub);
}
.feature {
  margin-top: 8px;
  line-height: 1.6;
  color: var(--text-sub);
}
.link {
  display: inline-block;
  margin-top: 12px;
  color: var(--primary);
  font-weight: 500;
}
</style>
