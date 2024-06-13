<template>
  <a-card title="任务统计">
    <div class="w-full h-40 md:h-[365px]" ref="chartRef"></div>
  </a-card>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted } from 'vue';
import dayjs from 'dayjs';
import useStore from '../store';

const store = useStore();

const articleLikeCounts = computed(() =>
  store.statistics.statisticData.map((item) => item.articleLikeCount),
);

const articleCommentCounts = computed(() =>
  store.statistics.statisticData.map((item) => item.articleCommentCount),
);

const pinLikeCounts = computed(() =>
  store.statistics.statisticData.map((item) => item.pinLikeCount),
);

const xAxisData = computed(() =>
  store.statistics.statisticData.map((item) => dayjs(item.createdAt).format('MM-DD')),
);

let chart: echarts.ECharts | null = null;

const chartRef = ref<HTMLElement | null>(null);

const option = {
  color: ['#95a2ff', '#fa8080', '#ffc076'],
  grid: {
    top: 40,
    left: 30,
    right: 5,
    bottom: 20,
  },
  legend: {
    data: ['文章点赞', '文章评论', '沸点点赞'],
    itemWidth: 16,
    itemHeight: 8,
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  yAxis: {
    type: 'value',
  },
  xAxis: {
    type: 'category',
  },
  series: [
    {
      name: '文章点赞',
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      barWidth: 16,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(115, 72, 255,0.80)',
          },
          {
            offset: 1,
            color: 'rgba(115, 72, 255,0.20)',
          },
        ]),
      },
    },
    {
      name: '文章评论',
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      barWidth: 16,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(18,152,235,0.80)',
          },
          {
            offset: 1,
            color: 'rgba(18,152,235,0.20)',
          },
        ]),
      },
    },
    {
      name: '沸点点赞',
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      barWidth: 16,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(13,219,168,0.80)',
          },
          {
            offset: 1,
            color: 'rgba(13,219,168,0.20)',
          },
        ]),
      },
    },
  ],
};

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    chart.setOption(option, true);
  }
});

watch(store.statistics, () => {
  if (chart) {
    chart.setOption({
      xAxis: {
        data: xAxisData.value,
      },
      series: [
        {
          data: articleLikeCounts.value,
        },
        {
          data: articleCommentCounts.value,
        },
        {
          data: pinLikeCounts.value,
        },
      ],
    });
  }
});
</script>
