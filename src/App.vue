<template>
  <div class="app-shell">
    <AppHeader />
    <main class="container main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
</script>
