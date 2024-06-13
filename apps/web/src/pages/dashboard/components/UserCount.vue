<template>
  <a-card title="账号统计">
    <div class="w-full h-40 md:h-[365px]" ref="chartRef"></div>
  </a-card>
</template>
<script lang="ts" setup>
import * as echarts from 'echarts';
import { onMounted } from 'vue';
import dayjs from 'dayjs';
import useStore from '../store';

const store = useStore();

const userCounts = computed(() =>
  store.statistics.statisticData.map((item) => item.userCount),
);

const enableUserCounts = computed(() =>
  store.statistics.statisticData.map((item) => item.enableUserCount),
);

const xAxisData = computed(() =>
  store.statistics.statisticData.map((item) => dayjs(item.createdAt).format('MM-DD')),
);

let chart: echarts.ECharts | null = null;

const chartRef = ref<HTMLElement | null>(null);

const option = {
  grid: {
    top: 40,
    left: 30,
    right: 5,
    bottom: 20,
  },
  legend: {
    show: true,
    data: ['全部账号', '可用账号'],
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
  xAxis: {
    type: 'category',
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '全部账号',
      type: 'line',
      itemStyle: {
        normal: {
          color: '#7348FF',
          barBorderRadius: 0,
        },
      },
      areaStyle: {
        opacity: 1,
        itemStyle: {
          normal: {
            color: '#7348FF',
            barBorderRadius: 0,
          },
        },
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(115, 72, 255,0.40)',
          },
          {
            offset: 1,
            color: 'rgba(115, 72, 255,0)',
          },
        ]),
      },
    },
    {
      name: '可用账号',
      type: 'line',
      itemStyle: {
        normal: {
          color: '#1298EB',
          barBorderRadius: 0,
        },
      },
      areaStyle: {
        opacity: 1,
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgba(18,152,235,0.30)',
          },
          {
            offset: 1,
            color: 'rgba(18,152,235,0)',
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
          data: userCounts.value,
        },
        {
          data: enableUserCounts.value,
        },
      ],
    });
  }
});
</script>
