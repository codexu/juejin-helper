<template>
  <a-popover placement="bottomRight" trigger="click">
    <template #content>
      <p>分享链接，每个新账号登录后，你和新账号均可获取到500贡献值。</p>
      <a-button size="small" type="link" class="copy" :data-clipboard-text="copyText">
        <copy-outlined />
        <span>复制分享链接</span>
      </a-button>
    </template>
    <template #title>
      <h3 class="font-bold text-xl mt-2">分享</h3>
    </template>
    <div class="flex justify-center items-center cursor-pointer">
      <ShareAltOutlined style="font-size: 24px" class="mr-2 text-blue-400" />
    </div>
  </a-popover>
</template>

<script lang="ts" setup>
import { ShareAltOutlined, CopyOutlined } from '@ant-design/icons-vue';
import ClipboardJS from 'clipboard';
import { message } from 'ant-design-vue';
import useUserStore from '@/stores/user';

const store = useUserStore();
const copyText = computed(() => {
  const location = window.location.origin;
  return `${location}/#/login?shareId=${store.state.userId}`;
});

onMounted(() => {
  const clipboard = new ClipboardJS('.copy');
  clipboard.on('success', () => {
    message.success('复制成功');
  });
  clipboard.on('error', () => {
    message.error('复制失败');
  });
});
</script>
