import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Log, getLog } from '@/api/log';

export default defineStore('accountLogStore', () => {
  const loading = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    showTotal: (total: number) => `共 ${total} 条`,
  });

  const activeKey = ref('账号');

  const pageData = ref<Log[]>();

  function getPageData() {
    loading.value = true;
    getLog(pagination.current, pagination.pageSize, activeKey.value)
      .then((res) => {
        pageData.value = res.data.records;
        pagination.total = res.data.total;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    getPageData,
    pageData,
    activeKey,
    loading,
    pagination,
  };
});
