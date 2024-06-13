<template>
  <a-popover placement="bottom" trigger="click">
    <template #content>
      <a-descriptions
        title="获取方式（养号系统会使用你的账号自动操作）"
        bordered
        size="small"
      >
        <a-descriptions-item label="文章阅读">0.1</a-descriptions-item>
        <a-descriptions-item label="文章点赞">10</a-descriptions-item>
        <a-descriptions-item label="文章收藏">10</a-descriptions-item>
        <a-descriptions-item label="文章评论">20</a-descriptions-item>
        <a-descriptions-item label="沸点点赞">5</a-descriptions-item>
        <a-descriptions-item label="关注作者">20</a-descriptions-item>
        <a-descriptions-item label="可用账号，每日获取">100</a-descriptions-item>
      </a-descriptions>
      <br />
      <a-descriptions title="贡献消耗说明" bordered size="small">
        <a-descriptions-item label="文章阅读">1</a-descriptions-item>
        <a-descriptions-item label="文章点赞">50</a-descriptions-item>
        <a-descriptions-item label="文章收藏">50</a-descriptions-item>
        <a-descriptions-item label="文章评论">100</a-descriptions-item>
        <a-descriptions-item label="沸点点赞">25</a-descriptions-item>
        <a-descriptions-item label="关注作者">100</a-descriptions-item>
      </a-descriptions>
    </template>
    <template #title>
      <h3 class="font-bold text-xl mt-2">贡献值 {{ store.state.contribution }}</h3>
    </template>
    <div class="flex justify-center items-center cursor-pointer">
      <crown-two-tone style="font-size: 24px" class="mr-2" />
      <a-statistic
        valueStyle="font-size: 18px; font-weight: bold; transform: translateY(2px); color: rgba(0, 0, 0, 0.65);"
        :value="store.state.contribution"
      />
    </div>
  </a-popover>
</template>

<script lang="ts" setup>
import { CrownTwoTone } from '@ant-design/icons-vue';
import useUserStore from '@/stores/user';

const store = useUserStore();
</script>
