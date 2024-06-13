<template>
  <a-popover v-model:visible="visible" placement="top" trigger="click">
    <template #title>
      <h3 class="mt-2 font-bold">绑定分享码</h3>
    </template>
    <template #content>
      <div>
        <div>
          <gift-outlined class="mr-2" />
          <span>首次登录，绑定分享码可以使你和分享者获得500贡献值。</span>
        </div>
        <a-input
          v-model:value="localValue"
          @change="handleChange"
          :disabled="hasShareId"
          :maxlength="16"
          class="w-[400px] my-4"
          placeholder="请输入分享码（掘鑫 ID）"
        >
          <template #prefix>
            <user-outlined type="user" />
          </template>
        </a-input>
      </div>
    </template>
    <p class="flex items-center justify-center cursor-pointer">
      <share-alt-outlined class="text-lg mr-2 translate-y-0.5" />
      <span>{{ shareTitle }}</span>
    </p>
  </a-popover>
</template>
<script lang="ts" setup>
import { ShareAltOutlined, GiftOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const hasShareId = computed(() => {
  return !!route.query.shareId;
});

const visible = ref(false);
const props = defineProps(['value']);

const localValue = ref(props.value);

const shareTitle = computed(() => {
  return localValue.value && localValue.value.length === 16
    ? '已绑定分享码'
    : '绑定分享码';
});

const emit = defineEmits(['update:value']);

function handleChange(e: any) {
  emit('update:value', e.target.value);
}
</script>
