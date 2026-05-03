<template>
  <div class="compare-table">
    <table>
      <thead>
        <tr>
          <th>对比项</th>
          <th v-for="b in buildings" :key="b.id">{{ b.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="label">类型</td>
          <td v-for="b in buildings" :key="b.id">{{ b.category }}</td>
        </tr>
        <tr>
          <td class="label">朝代</td>
          <td v-for="b in buildings" :key="b.id">{{ b.dynasty }}</td>
        </tr>
        <tr>
          <td class="label">功能</td>
          <td v-for="b in buildings" :key="b.id">{{ b.function }}</td>
        </tr>
        <tr>
          <td class="label">结构</td>
          <td v-for="b in buildings" :key="b.id">{{ b.structure }}</td>
        </tr>
        <tr>
          <td class="label">布局</td>
          <td v-for="b in buildings" :key="b.id">{{ b.layout }}</td>
        </tr>
        <tr>
          <td class="label">特征</td>
          <td v-for="b in buildings" :key="b.id">{{ b.feature }}</td>
        </tr>
        <tr>
          <td class="label">技术</td>
          <td v-for="b in buildings" :key="b.id">{{ b.technology }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  buildings: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
.compare-table {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
th {
  font-weight: 600;
  color: var(--primary);
}
td.label {
  color: var(--text-sub);
  font-weight: 500;
}
tbody tr:hover {
  background: rgba(143, 61, 46, 0.04);
}
</style>
