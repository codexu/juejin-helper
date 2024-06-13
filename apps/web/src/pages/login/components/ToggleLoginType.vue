<template>
  <p class="flex items-center justify-center cursor-pointer" @click="toggleLoginType">
    <retweet-outlined class="text-lg mr-2 translate-y-0.5" />
    <span>{{ toggleTitle }}</span>
  </p>
</template>
<script lang="ts" setup>
import { RetweetOutlined } from '@ant-design/icons-vue';
import { useVModel } from '@vueuse/core';

const props = defineProps<{
  value: 'qr' | 'password';
}>();

const emit = defineEmits(['update:modelValue']);

const loginType = useVModel(props, 'value', emit);

const toggleTitle = ref('扫码登录');

function toggleLoginType() {
  loginType.value = loginType.value === 'qr' ? 'password' : 'qr';
  toggleTitle.value = loginType.value === 'qr' ? '密码登录' : '扫码登录';
}
</script>
