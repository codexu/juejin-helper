<template>
  <div class="bg-white px-6 py-6">
    <a-space :size="isMobile ? 5 : 30">
      <a-statistic title="AI审核通过" :value="store.statistics.aiReviewResultTotal" />
      <a-divider type="vertical" />
      <a-statistic title="AI已审核" :value="store.statistics.aiReviewTotal" />
      <a-divider type="vertical" />
      <a-statistic title="沸点总数" :value="store.statistics.pinsTotal" />
      <a-divider type="vertical" />
      <a-statistic title="关键词总数" :value="store.statistics.keywordsTotal" />
      <a-divider type="vertical" />
      <a-statistic title="模板总数" :value="store.statistics.templateTotal" />
    </a-space>
  </div>
</template>

<script lang="ts" setup>
import device from 'current-device';
import useStore from '../store';

// 判断是否是移动端
const isMobile = device.mobile();

const store = useStore();
</script>
