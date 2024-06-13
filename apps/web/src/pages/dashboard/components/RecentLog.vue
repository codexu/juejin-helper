<template>
  <a-card title="最新动态">
    <template #extra>5/{{ total }}</template>
    <a-list :data-source="logs">
      <template #renderItem="{ item }">
        <a-list-item :key="item.id">
          <a-list-item-meta :description="item.description">
            <template #title>
              <a-space>
                <a-tag color="blue">{{ item.type }}</a-tag>
                <a :href="item.link" target="_blank" class="line-clamp-1 pr-4">
                  {{ item.content }}
                </a>
              </a-space>
            </template>
            <template v-if="!isMobile" #avatar>
              <a-avatar :size="45" shape="square" :src="item.avatar"></a-avatar>
            </template>
            <template #description>
              <span class="line-clamp-1">
                {{ item.event }}： {{ item.record || '无备注信息' }}
              </span>
            </template>
          </a-list-item-meta>
          <template #extra>
            <div class="text-right">
              <a
                :href="`https://juejin.cn/user/${item.userId}`"
                target="_blank"
                class="mb-0 text-gray-400"
              >
                {{ item.username }}
              </a>
              <p class="mb-0 text-gray-400">
                {{ formatDate(item.createdAt) }}
              </p>
            </div>
          </template>
        </a-list-item>
      </template>
    </a-list>
  </a-card>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import device from 'current-device';
import { getLog, Log } from '@/api/log';
// 判断是否是移动端
const isMobile = device.mobile();
const logs = ref<Log[]>([]);
const total = ref(0);
let interval: number | null = null;

function formatDate(date: string) {
  return dayjs(date).fromNow();
}

async function fetchData() {
  await getLog(1, 5).then((res) => {
    logs.value = res.data.records;
    total.value = res.data.total;
  });
  interval = setTimeout(() => {
    fetchData();
  }, 2000);
}

onMounted(() => {
  fetchData();
});

onUnmounted(() => {
  if (interval !== null) {
    clearTimeout(interval);
  }
});
</script>
