<route lang="yaml">
name: PinDashboard
meta:
  title: 沸点概览
  auth: true
</route>

<template>
  <div class="w-full overflow-hidden md:p-6">
    <DashboardStatistic class="mb-6" />
    <a-row :gutter="isMobile ? [0, 0] : [24, 24]">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" :xxl="24" :xxxl="24">
        <PinWordcloud />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import device from 'current-device';
import useStore from './store';
import PinWordcloud from './components/PinWordcloud.vue';
import DashboardStatistic from './components/DashboardStatistic.vue';

// 判断是否是移动端
const isMobile = device.mobile();
const store = useStore();

onMounted(() => {
  store.getPageData();
});
</script>
