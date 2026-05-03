<template>
  <span class="info-tag" :style="{ background: bgColor }">{{ text }}</span>
</template>

<script setup>
const props = defineProps({
  text: String,
  type: {
    type: String,
    default: 'default'
  }
})

const colorMap = {
  '民居': 'rgba(179, 135, 40, 0.12)',
  '官府': 'rgba(143, 61, 46, 0.12)',
  '皇宫': 'rgba(92, 26, 26, 0.12)',
  '桥梁': 'rgba(45, 90, 74, 0.12)',
  'default': 'rgba(143, 61, 46, 0.08)'
}

const bgColor = colorMap[props.type] || colorMap.default
</script>

<style scoped>
.info-tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--primary);
}
</style>
