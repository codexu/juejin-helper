<route lang="yaml">
name: CommentManage
meta:
  title: 日志管理
  auth: true
</route>

<template>
  <div class="p-6">
    <a-card title="日志管理">
      <template #extra>
        <a-space>
          <a-radio-group
            v-model:value="store.searchForm.type"
            size="small"
            @change="handleTypeChange"
          >
            <a-radio-button :value="undefined">全部</a-radio-button>
            <a-radio-button value="好评">好评</a-radio-button>
            <a-radio-button value="废话">废话</a-radio-button>
            <a-radio-button value="差评">差评</a-radio-button>
            <a-radio-button value="爬虫">爬虫</a-radio-button>
          </a-radio-group>
          <a-button @click="handleAdd" size="small" :disabled="!isAdmin" type="primary">
            新增评论
          </a-button>
        </a-space>
      </template>
      <PageTable />
    </a-card>
  </div>
  <EditForm ref="editFormRef" />
</template>

<script setup lang="ts">
import EditForm from './components/EditForm.vue';
import PageTable from './components/PageTable.vue';
import useStore from './store';
import useIsAdmin from '@/hooks/useIsAdmin';

const isAdmin = useIsAdmin();
const store = useStore();

const editFormRef = ref<InstanceType<typeof EditForm>>();

function handleAdd() {
  editFormRef.value?.showModal();
}

function handleTypeChange() {
  store.pagination.current = 1;
  store.getPageData();
}

onMounted(() => {
  store.getPageData();
});
</script>
