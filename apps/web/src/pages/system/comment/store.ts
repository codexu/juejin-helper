import { ref } from 'vue';
import { defineStore } from 'pinia';
import { Comment, getComment } from '@/api/comment';

export default defineStore('commentStore', () => {
  const searchForm = reactive({
    type: undefined,
  });
  const loading = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    showTotal: (total: number) => `共 ${total} 条`,
  });

  const pageData = ref<Comment[]>();

  function getPageData() {
    loading.value = true;
    getComment(pagination.current, pagination.pageSize, searchForm.type)
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
