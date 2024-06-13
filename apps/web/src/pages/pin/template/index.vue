<route lang="yaml">
name: PinTemplate
meta:
  title: 沸点模板管理
  auth: true
</route>

<template>
  <div class="p-6">
    <a-card title="沸点模板管理">
      <template #extra>
        <a-checkbox v-model:checked="store.searchForm.isTemplate">只看模板</a-checkbox>
        <a-checkbox v-model:checked="store.searchForm.aiReviewResult">
          AI审核
        </a-checkbox>
      </template>
      <PageTable />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import PageTable from './components/PageTable.vue';
import useStore from './store';

const store = useStore();

onMounted(() => {
  store.getPageData();
});

watch(
  () => store.searchForm.isTemplate,
  () => {
    store.pagination.page = 1;
    store.getPageData();
  },
);

watch(
  () => store.searchForm.aiReviewResult,
  () => {
    store.pagination.page = 1;
    store.getPageData();
  },
);
</script>
