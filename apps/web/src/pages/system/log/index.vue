<route lang="yaml">
name: AccountLog
meta:
  title: 账号日志
  auth: true
</route>

<template>
  <div class="p-6">
    <a-card title="账号日志">
      <a-tabs
        v-model:activeKey="store.activeKey"
        type="card"
        @change="store.getPageData"
      >
        <a-tab-pane key="账号" tab="账号"></a-tab-pane>
        <a-tab-pane key="系统" tab="系统"></a-tab-pane>
        <a-tab-pane key="文章" tab="文章"></a-tab-pane>
        <a-tab-pane key="沸点" tab="沸点"></a-tab-pane>
      </a-tabs>
      <PageTable />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import PageTable from './components/PageTable.vue';
import useStore from './store';

const store = useStore();

onMounted(() => {
  store.getPageData();
});
</script>
