<script lang="ts" setup name="404">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const countdown = ref(3);

const countdownInterval = setInterval(() => {
  countdown.value -= 1;
  if (countdown.value === 0) {
    router.push('/dashboard');
    clearInterval(countdownInterval);
  }
}, 1000);

onUnmounted(() => {
  clearInterval(countdownInterval);
});
</script>

<template>
  <div class="page-height flex flex-col justify-center items-center">
    <h1 class="text-3xl">404</h1>
    <p>{{ countdown }} seconds after the jump...</p>
  </div>
</template>

<style scoped>
.page-height {
  height: calc(100vh - 64px);
}
</style>
