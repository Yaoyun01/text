<template>
  <div class="section-title">
    <p>{{ tag }}</p>
    <h2>{{ title }}</h2>
    <span v-if="note" class="note">{{ note }}</span>
  </div>
</template>

<script setup>
defineProps({
  tag: String,
  title: String,
  note: String
})
</script>
