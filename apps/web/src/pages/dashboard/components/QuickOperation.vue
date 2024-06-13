<template>
  <div class="hidden md:flex items-center">
    <div class="mr-8">
      <a-avatar :src="userStore.state.avatar" :size="80" />
    </div>
    <div class="flex flex-col">
      <div class="flex items-center mb-2">
        <h2 class="mb-0 mr-2">{{ userStore.state.username }}</h2>
        <a-tag>{{ userStore.state.type === 'admin' ? '管理员' : '用户' }}</a-tag>
      </div>
      <a-space>
        <a-tooltip>
          <template #title>检测全部账号是否可用</template>
          <alert-outlined @click="handleCheckCookie" />
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip>
          <template #title>爬取用户信息</template>
          <security-scan-outlined @click="handleQueryAccountInformation" />
        </a-tooltip>
        <a-divider type="vertical" />
        <a-tooltip>
          <template #title>系统账户手动登录（本地）</template>
          <team-outlined @click="handleGetCookie" />
        </a-tooltip>
      </a-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  AlertOutlined,
  SecurityScanOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { checkCookie, queryAccountInformation, getCookie } from '@/api/account';
import useUserStore from '@/stores/user';

const userStore = useUserStore();

function handleCheckCookie() {
  checkCookie().then((res) => {
    notification.success({
      message: res.message,
    });
  });
}

function handleQueryAccountInformation() {
  queryAccountInformation().then((res) => {
    notification.success({
      message: res.message,
    });
  });
}

function handleGetCookie() {
  getCookie().then((res) => {
    notification.success({
      message: res.message,
    });
  });
}
</script>
