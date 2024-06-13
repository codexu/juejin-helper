import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDashboardInfo, StatisticResult } from '@/api/pin';

export default defineStore('pinDashboardStore', () => {
  const loading = ref(false);

  const statistics = reactive<StatisticResult>({
    pinsTotal: 0,
    keywordsTotal: 0,
    templateTotal: 0,
    aiReviewTotal: 0,
    aiReviewResultTotal: 0,
  });

  function getPageData() {
    loading.value = true;
    getDashboardInfo()
      .then((res) => {
        statistics.pinsTotal = res.data.pinsTotal;
        statistics.keywordsTotal = res.data.keywordsTotal;
        statistics.templateTotal = res.data.templateTotal;
        statistics.aiReviewTotal = res.data.aiReviewTotal;
        statistics.aiReviewResultTotal = res.data.aiReviewResultTotal;
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    getPageData,
    statistics,
    loading,
  };
});
