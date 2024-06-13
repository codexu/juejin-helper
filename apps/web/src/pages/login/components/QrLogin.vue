<template>
  <a-image v-if="qrcode" :src="qrcode" :width="120" class="my-4" />
  <qrcode-outlined @click="getQrCode" v-else class="text-[120px] my-4 cursor-pointer" />
  <a-button type="link" :danger="dangerState" @click="getQrCode" :loading="loading">
    {{ loadingTip }}
  </a-button>
</template>

<script lang="ts" setup>
import { QrcodeOutlined } from '@ant-design/icons-vue';
import useUserStore from '@/stores/user';

const props = defineProps<{
  shareId: string;
}>();

const userStore = useUserStore();

const { VITE_APP_BASE_WS_URL } = import.meta.env;

const qrcode = ref('');
const loading = ref(false);
const loadingTip = ref('点击获取二维码');
const dangerState = ref(false);

let socket: WebSocket;

onMounted(() => {
  socket = new WebSocket(VITE_APP_BASE_WS_URL as string);

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    switch (data.progress) {
      case 'qrcode':
        qrcode.value = data.qrcodeImg;
        loadingTip.value = '请使用掘鑫APP扫码登录';
        break;
      case 'success':
        loadingTip.value = '登录成功';
        loading.value = false;
        userStore.handleLogin(data.userInfo);
        socket.close();
        break;
      case 'qrcodeTimeout':
        qrcode.value = '';
        loadingTip.value = '二维码已过期，点击重新获取';
        loading.value = false;
        dangerState.value = true;
        break;
      default:
        loadingTip.value = data.message;
        break;
    }
  });
});

function getQrCode() {
  socket.send(
    JSON.stringify({
      event: 'login',
      type: 'getQrCode',
      data: { shareId: props.shareId },
    }),
  );
  loading.value = true;
  dangerState.value = false;
  loadingTip.value = '获取二维码中...';
}
</script>
