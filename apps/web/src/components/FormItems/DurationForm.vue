<template>
  <a-form-item :label="props.title || '间隔时间'">
    <a-space>
      <a-input-number v-model:value="duration.day" :min="0" :max="30">
        <template #addonAfter>天</template>
      </a-input-number>
      <a-input-number v-model:value="duration.hour" :min="0" :max="23">
        <template #addonAfter>时</template>
      </a-input-number>
      <a-input-number v-model:value="duration.minute" :min="0" :max="59">
        <template #addonAfter>分</template>
      </a-input-number>
      <a-input-number v-model:value="duration.second" :min="0" :max="59">
        <template #addonAfter>秒</template>
      </a-input-number>
    </a-space>
  </a-form-item>
</template>
<script lang="ts" setup>
import { reactive, watch } from 'vue';

const props = defineProps<{
  title?: string;
  value: number;
}>();

const emits = defineEmits(['update:value']);

const duration = reactive({
  day: 0,
  hour: 0,
  minute: 0,
  second: 0,
});

watch(duration, () => {
  const delay =
    (duration.day * 24 * 60 * 60 +
      duration.hour * 60 * 60 +
      duration.minute * 60 +
      duration.second) *
    1000;

  emits('update:value', delay);
});
</script>
