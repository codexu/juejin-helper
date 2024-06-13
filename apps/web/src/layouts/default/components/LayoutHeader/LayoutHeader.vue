<template>
  <header
    class="
      bg-white
      flex
      px-8
      items-center
      justify-between
      h-16
      header
      md:relative
      fixed
      top-0
      left-0
      w-full
      z-10
    "
  >
    <WebLogo class="md:hidden inline" />
    <span class="hidden md:block">
      主账号：
      <a
        :href="`https://juejin.cn/user/${userStore.state.mainAccount}`"
        target="_blank"
      >
        {{ userStore.state.mainAccount }}
      </a>
      <setting-outlined class="ml-2" @click="handleSetMainAccount" />
    </span>
    <a-space align="center" :size="isMobile ? 10 : 20">
      <UserContribution class="hidden md:flex" />
      <a-divider v-if="!isMobile" type="vertical" />
      <TaskInfo />
      <a-divider type="vertical" />
      <UserShare class="hidden md:flex" />
      <a-divider v-if="!isMobile" type="vertical" />
      <UserInfo />
    </a-space>
  </header>
</template>

<script lang="ts" setup>
import { SettingOutlined } from '@ant-design/icons-vue';
import device from 'current-device';
import UserInfo from './UserInfo.vue';
import TaskInfo from './TaskInfo.vue';
import UserContribution from './UserContribution.vue';
import useUserStore from '@/stores/user';
import emitter from '@/libs/emitter';
import UserShare from './UserShare.vue';
import WebLogo from '../WebLogo.vue';

// 判断是否是移动端
const isMobile = device.mobile();
const userStore = useUserStore();

const handleSetMainAccount = () => {
  emitter.emit('user-info', true);
};
</script>

<style lang="scss" scoped>
.header {
  border-bottom: 1px solid #f0f0f0;
}
</style>
