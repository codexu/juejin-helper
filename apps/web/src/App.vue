<template>
  <a-config-provider :locale="locale">
    <router-view />
    <MainAccount />
  </a-config-provider>
</template>

<script lang="ts" setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import MainAccount from '@/components/SystemSettings/MainAccount.vue';

const locale = zhCN;
</script>
