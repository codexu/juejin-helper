import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getDashboardInfo, DashboardInfo } from '@/api/dashboard';

export default defineStore('dashboardStore', () => {
  const loading = ref(false);

  const statistics = reactive<DashboardInfo>({
    adminAccountCount: 0,
    userAccountCount: 0,
    totalAccountCount: 0,
    offlineAccountCount: 0,
    onlineAccountCount: 0,
    userArticleLikeCount: 0,
    userPinLikeCount: 0,
    topUser: [],
    totalJobCount: {
      active: 0,
      completed: 0,
      delayed: 0,
      failed: 0,
      paused: 0,
      waiting: 0,
    },
    statisticData: [],
  });

  function getPageData() {
    loading.value = true;
    getDashboardInfo()
      .then((res) => {
        statistics.adminAccountCount = res.data.adminAccountCount;
        statistics.userAccountCount = res.data.userAccountCount;
        statistics.totalAccountCount = res.data.totalAccountCount;
        statistics.offlineAccountCount = res.data.offlineAccountCount;
        statistics.onlineAccountCount = res.data.onlineAccountCount;
        statistics.userArticleLikeCount = res.data.userArticleLikeCount;
        statistics.userPinLikeCount = res.data.userPinLikeCount;
        statistics.topUser = res.data.topUser;
        statistics.totalJobCount = res.data.totalJobCount;
        statistics.totalJobCount.completed = 0;
        statistics.statisticData = res.data.statisticData;
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
