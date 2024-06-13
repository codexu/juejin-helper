<route lang="yaml">
name: Dashboard
meta:
  title: 信息总览
  auth: true
</route>

<template>
  <DashboardStatistic />
  <div class="w-full overflow-hidden md:p-6">
    <a-row :gutter="isMobile ? [0, 0] : [24, 24]">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="12" :xxxl="12">
        <UserCount />
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="12" :xxxl="12">
        <TaskCount />
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="12" :xxxl="12">
        <RecentLog />
      </a-col>
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="12" :xxxl="12">
        <TopUser />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import device from 'current-device';
import DashboardStatistic from './components/DashboardStatistic.vue';
import RecentLog from './components/RecentLog.vue';
import TopUser from './components/TopUser.vue';
import UserCount from './components/UserCount.vue';
import TaskCount from './components/TaskCount.vue';
import useStore from './store';

// 判断是否是移动端
const isMobile = device.mobile();
const store = useStore();

onMounted(() => {
  store.getPageData();
});
</script>
