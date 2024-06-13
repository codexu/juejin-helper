import { ref } from 'vue';
import { defineStore } from 'pinia';
import { PagePin, getPinPage } from '@/api/pin';

export default defineStore('pinTemplateStore', () => {
  const searchForm = reactive({
    isTemplate: false,
    aiReviewResult: true,
  });
  const loading = ref(false);

  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
    showTotal: (total: number) => `共 ${total} 条`,
  });

  const pageData = ref<PagePin[]>();

  function getPageData() {
    loading.value = true;
    getPinPage(
      pagination.page,
      pagination.pageSize,
      searchForm.isTemplate,
      searchForm.aiReviewResult,
    )
      .then((res) => {
        pageData.value = res.data.records;
        pagination.total = res.data.total;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    searchForm,
    getPageData,
    pageData,
    loading,
    pagination,
  };
});
