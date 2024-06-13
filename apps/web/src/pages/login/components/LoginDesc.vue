<template>
  <div
    class="
      hidden
      relative
      md:flex
      p-10
      max-w-[420px]
      justify-center
      items-center
      bg-gradient-to-br
      from-[#b813b0b4]
      to-[#3f25d19f]
    "
  >
    <div class="flex flex-col px-4 items-start">
      <div
        class="text-base my-4 text-white"
        v-for="(item, index) in items"
        :key="index"
      >
        <div class="flex">
          <component class="text-2xl mr-3 -translate-y-0.5" :is="item.icon" />
          <span class="text-base font-bold">{{ item.title }}</span>
        </div>
        <p class="pl-[36px] text-sm text-justify">{{ item.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { StarOutlined, InsuranceOutlined, CrownOutlined } from '@ant-design/icons-vue';

const items = reactive([
  {
    icon: StarOutlined,
    title: '任务系统',
    desc: '可以自定义发布定时任务，为你的文章、沸点进行点赞和评论。',
  },
  {
    icon: CrownOutlined,
    title: '贡献系统',
    desc: '系统自动使用你的小号执行别人发布的任务以获取贡献值，消耗贡献值发布你的任务。',
  },
  {
    icon: InsuranceOutlined,
    title: '养号系统',
    desc: '系统定时会为你的小号发布随机沸点、随机文章，模拟真实用户操作，降低封号风险。',
  },
]);
</script>
