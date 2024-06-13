<template>
  <a-popover v-model:visible="visible" placement="bottomRight" trigger="click">
    <template #title>
      <h3 class="mt-2 font-bold">登录须知</h3>
    </template>
    <template #content>
      <ol class="m-0 px-4">
        <li>请使用掘鑫小号登录，切勿使用大号。</li>
        <li>只能通过掘鑫 APP 扫码登录。</li>
        <li>
          只有首次登录的账号可以享受分享码福利,<br />
          请绑定后再扫码登录（分享链接可以自动绑定）
        </li>
      </ol>
    </template>
    <p
      class="
        flex
        items-center
        justify-center
        cursor-pointer
        absolute
        top-4
        md:right-4
        right-8
      "
    >
      <question-circle-outlined class="text-lg mr-2 translate-y-0.5" />
      <span>登录须知</span>
    </p>
  </a-popover>
</template>
<script lang="ts" setup>
import { QuestionCircleOutlined } from '@ant-design/icons-vue';

const visible = ref(false);
</script>
