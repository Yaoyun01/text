<template>
  <header class="site-header">
    <div class="container nav-row">
      <RouterLink class="brand" to="/">
        <span class="brand-logo"></span>
        古建可视化引擎
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/timeline">时间演进</RouterLink>
        <RouterLink to="/map">地域分布</RouterLink>
        <RouterLink to="/compare">类型对比</RouterLink>
        <RouterLink to="/summary">总结归纳</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(245, 239, 229, 0.8);
  border-bottom: 1px solid var(--border);
}
.nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  min-height: 72px;
}
.brand {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}
.nav-links {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: var(--text-sub);
}
.nav-links .router-link-active {
  color: var(--primary);
  font-weight: 600;
}
</style>
