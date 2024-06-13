<template>
  <div class="bg-white px-6 py-6">
    <div class="hidden md:flex justify-between items-center">
      <h1 class="text-2xl font-bold mb-8">信息总览</h1>
      <reload-outlined
        @click="store.getPageData"
        class="text-xl cursor-pointer text-blue-500 hover:text-blue-700"
      />
    </div>
    <div class="flex justify-center md:justify-between">
      <QuickOperation />
      <a-space :size="isMobile ? 5 : 30">
        <a-statistic title="账号总数" :value="store.statistics.onlineAccountCount">
          <template #suffix>
            <span>/ {{ store.statistics.totalAccountCount }}</span>
          </template>
        </a-statistic>
        <a-divider type="vertical" />
        <a-statistic title="待办任务" :value="totalTaskCount" />
        <a-divider type="vertical" />
        <a-statistic title="文章点赞" :value="store.statistics.userArticleLikeCount" />
        <a-divider type="vertical" />
        <a-statistic title="沸点点赞" :value="store.statistics.userPinLikeCount" />
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ReloadOutlined } from '@ant-design/icons-vue';
import device from 'current-device';
import QuickOperation from './QuickOperation.vue';
import useStore from '../store';

// 判断是否是移动端
const isMobile = device.mobile();

const store = useStore();

const totalTaskCount = computed(() => {
  // 将任务数量对象的值相加
  return Object.values(store.statistics.totalJobCount).reduce((a, b) => a + b, 0);
});
</script>
