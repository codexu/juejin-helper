<template>
  <a-modal v-model:visible="visible" width="650px" title="掘鑫主账号ID" @ok="onSubmit">
    <a-alert
      v-if="!userStore.state.mainAccount"
      :message="`欢迎加入掘鑫互吹平台，${userStore.state.username}！`"
      description="首次登录，建议绑定你的主账号 ID，绑定后可以更方便的打赏自己的文章或沸点。"
      type="info"
      show-icon
    />
    <a-form class="mt-8">
      <a-form-item label="绑定主账号ID">
        <a-input :maxlength="16" v-model:value="mainAccount" />
      </a-form-item>
    </a-form>
    <div class="flex justify-end">
      <a-popover>
        <template #content>
          登录掘鑫官网，右上角头像，选择我的主页，查看地址栏后的数字。<br />
          例如：https://juejin.cn/user/****，ID 为 **** 的 16 数字。
        </template>
        <a>如何获取掘鑫 ID ？</a>
      </a-popover>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { setMainAccount } from '@/api/account';
import useUserStore from '@/stores/user';
import emitter from '@/libs/emitter';

const userStore = useUserStore();

const visible = ref(false);

const mainAccount = ref('');

emitter.on('user-info', (isSetting?: boolean) => {
  if (!userStore.state.mainAccount) {
    visible.value = true;
  } else if (isSetting === true) {
    visible.value = true;
    mainAccount.value = userStore.state.mainAccount;
  }
});

const onSubmit = () => {
  setMainAccount({
    id: userStore.state.id,
    mainAccount: mainAccount.value,
  }).then(() => {
    userStore.state.mainAccount = mainAccount.value;
    visible.value = false;
  });
};
</script>
