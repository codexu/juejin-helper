<route lang="yaml">
name: Login
meta:
  title: 登录
  layout: BlankLayout
</route>

<template>
  <div class="login-wrapper h-screen flex justify-center items-center">
    <div
      class="
        absolute
        inset-0
        bg
        bg-[bottom_1px_center]
        dark:bg-grid-slate-400/[0.05]
        dark:bg-bottom
        dark:border-b
        dark:border-slate-100/5
      "
      style="-webkit-mask-image: linear-gradient(transparent, black)"
    ></div>
    <QuestionDesc />
    <div
      class="
        z-10
        w-[900px]
        overflow-hidden
        md:shadow-xl
        rounded-3xl
        flex
        bg-slate-50
        h-[440px]
      "
    >
      <LoginDesc />
      <div class="flex flex-1 p-10 pb-24 items-center justify-center flex-col relative">
        <h1 class="text-2xl text-center font-bold py-4">
          <like-two-tone />
          掘鑫互吹
        </h1>
        <div class="w-full">
          <a-divider>稀土掘鑫专业刷赞平台</a-divider>
        </div>
        <div class="flex flex-1 items-center justify-center flex-col w-full">
          <QrLogin v-if="loginType === 'qr'" :shareId="shareId" />
          <PasswordLogin v-else :shareId="shareId" />
        </div>
        <a-space :size="24" class="absolute bottom-3">
          <BindShare v-model:value="shareId" />
          <ToggleLoginType v-model:value="loginType" />
        </a-space>
      </div>
    </div>
    <footer class="fixed bottom-4">
      <span>Copyright © 2023 (praising.fun). All rights reserved.</span>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { LikeTwoTone } from '@ant-design/icons-vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import LoginDesc from './components/LoginDesc.vue';
import QuestionDesc from './components/QuestionDesc.vue';
import BindShare from './components/BindShare.vue';
import QrLogin from './components/QrLogin.vue';
import PasswordLogin from './components/PasswordLogin.vue';
import ToggleLoginType from './components/ToggleLoginType.vue';

const route = useRoute();

const shareId = ref((route.query.shareId as string) || '');

const loginType = ref<'qr' | 'password'>('password');
</script>

<style lang="scss" scoped>
.login-wrapper {
  background: url('/assets/background.jpg') no-repeat center center;
  background-size: 100% cover;
}

.bg {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(15 23 42 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
}
</style>
