<template>
  <a-card title="沸点热门关键词">
    <template #extra>
      <a-radio-group v-model:value="valueType" @change="setValueType">
        <a-radio-button value="hot">热度</a-radio-button>
        <a-radio-button value="like">点赞数</a-radio-button>
        <a-radio-button value="comment">评论数</a-radio-button>
      </a-radio-group>
    </template>
    <div class="w-full h-40 md:h-[365px]" ref="chartRef"></div>
  </a-card>
  <a-modal
    width="1200px"
    v-model:visible="visible"
    title="沸点列表"
    @ok="visible = false"
  >
    <a-list item-layout="horizontal" :data-source="pins">
      <template #renderItem="{ item, index }">
        <a-list-item>
          <template #actions>
            <a-space>
              <span>点赞数: {{ item.like }}</span>
              <span>评论数: {{ item.comment }}</span>
            </a-space>
          </template>
          <a-list-item-meta>
            <template #title>
              <a :href="`https://juejin.cn/pin/${item.pinId}`" target="_blank">
                {{ item.content }}
              </a>
            </template>
            <template #avatar>
              <a-tag>{{ index + 1 }}</a-tag>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </template>
    </a-list>
  </a-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import { getKeywords, KeywordResult, Pin, getPinsByPinIds } from '@/api/pin';
import 'echarts-wordcloud';

const visible = ref(false);
const pins = ref<Pin[]>([]);
const valueType = ref<'hot' | 'like' | 'comment'>('hot');
const keywords = ref<KeywordResult[]>();
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts;

onMounted(async () => {
  const { data } = await getKeywords(1000);
  keywords.value = data;

  const keywordsData = keywords.value.map((item) => ({
    name: item.word,
    id: item.id,
    pinIds: item.pinIds,
    value: item.hot,
  }));

  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
  }
  chart.setOption({
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        keepAspect: false,
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        bottom: null,
        sizeRange: [12, 60],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        shrinkToFit: false,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color() {
            return `rgb(${[
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
            ].join(',')})`;
          },
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            textShadowBlur: 10,
            textShadowColor: '#333',
          },
        },
        data: keywordsData,
      },
    ],
  });
  // 绑定点击事件
  chart.on('click', (params) => {
    visible.value = true;
    const currentData = params.data as KeywordResult;
    getPinsByPinIds(currentData.pinIds).then((res) => {
      pins.value = res.data;
    });
  });
});

function setValueType() {
  keywords.value = keywords.value?.map((item) => {
    item.value = item[valueType.value];
    return item;
  });
  const keywordsData = keywords.value?.map((item) => ({
    name: item.word,
    id: item.id,
    pinIds: item.pinIds,
    value: item[valueType.value],
  }));
  chart.setOption({
    series: [
      {
        data: keywordsData,
      },
    ],
  });
}
</script>

<style lang="scss" scoped></style>
