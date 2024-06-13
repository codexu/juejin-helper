<template>
  <a-form
    :model="formState"
    name="basic"
    autocomplete="off"
    @submit="onSubmit"
    class="w-72"
  >
    <a-form-item
      name="account"
      :rules="[{ required: true, message: '请输入掘金手机号或邮箱！' }]"
    >
      <a-input
        v-model:value="formState.account"
        :disabled="loading"
        placeholder="请输入掘金手机号或邮箱"
      >
        <template #prefix><UserOutlined class="site-form-item-icon" /></template>
      </a-input>
    </a-form-item>

    <a-form-item name="password" :rules="[{ required: true, message: '请输入密码！' }]">
      <a-input-password
        v-model:value="formState.password"
        :disabled="loading"
        placeholder="请输入掘金手机号或邮箱"
      >
        <template #prefix><LockOutlined class="site-form-item-icon" /></template>
      </a-input-password>
    </a-form-item>

    <a-button class="w-full" type="primary" html-type="submit" :loading="loading">
      {{ loading ? loadingText : '登录' }}
    </a-button>
  </a-form>
</template>

<script lang="ts" setup>
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { useStorage } from '@vueuse/core';
import useUserStore from '@/stores/user';

const { VITE_APP_BASE_URL } = import.meta.env;

const props = defineProps<{
  shareId: string;
}>();

const formState = useStorage('formState', {
  account: '',
  password: '',
});

const userStore = useUserStore();

const loading = ref(false);
const loadingText = ref('正在登录，请耐心等待...');

function onSubmit() {
  loading.value = true;
  const params = {
    account: formState.value.account,
    password: formState.value.password,
    shareId: props.shareId,
  };

  const url = `${VITE_APP_BASE_URL}user/login?${new URLSearchParams(
    params,
  ).toString()}`;

  const eventSource = new EventSource(url);
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'end':
        userStore.handleLogin(data.data);
        eventSource.close();
        loading.value = false;
        break;
      case 'error':
        notification.error({
          message: '登录失败',
          description: data.message,
        });
        loading.value = false;
        eventSource.close();
        break;
      default:
        loadingText.value = data.message;
        break;
    }
  };
  eventSource.onerror = () => {
    loading.value = false;
    notification.error({
      message: '登录失败',
      description: '网络错误，请稍后重试',
    });
    eventSource.close();
  };
}
</script>
