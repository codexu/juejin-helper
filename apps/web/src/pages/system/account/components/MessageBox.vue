<template>
  <a-drawer
    size="large"
    v-model:visible="visible"
    title="消息"
    placement="right"
    @afterVisibleChange="afterVisibleChange"
  >
    <a-skeleton v-if="loading" :loading="loading" active avatar></a-skeleton>
    <template v-else-if="messages.length">
      <div class="p-4">
        <a-timeline>
          <a-timeline-item v-for="(item, index) in messages" :key="index">
            <template #dot>
              <a-avatar :src="item.avatar" />
            </template>
            <div class="pl-2">
              <p class="text-sm">
                <a :href="item.userUrl">{{ item.name }}</a>
                {{ item.title }}
              </p>
              <p class="text-sm" v-if="item.comment">{{ item.comment }}</p>
              <p class="text-xs text-gray-800 bg-gray-50 p-2" v-if="item.reference">
                {{ item.reference }}
              </p>
              <p class="text-xs text-gray-500">{{ timeFormat(item.time) }}</p>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </template>
    <template v-else>
      <div class="text-center">
        <a-empty description="暂无消息" />
      </div>
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { findMessage, Message } from '@/api/account';

const loading = ref(false);

const emit = defineEmits(['afterVisibleChange']);

const visible = ref(false);

const messages = ref<Message[]>([]);

function timeFormat(time: number) {
  return dayjs(time).fromNow();
}

async function showDrawer(id: number) {
  messages.value.length = 0;
  visible.value = true;
  loading.value = true;
  const data = await findMessage(id);
  messages.value = data.data;
  loading.value = false;
}

function afterVisibleChange() {
  emit('afterVisibleChange');
}

defineExpose({
  showDrawer,
});
</script>
