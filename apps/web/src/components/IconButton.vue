<template>
  <a-button type="text">
    <a-tooltip :title="props.title">
      <a :style="{ color: iconColor, fontSize: '20px', lineHeight: 1 }">
        <slot />
      </a>
    </a-tooltip>
  </a-button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  type?: 'primary' | 'warning' | 'success' | 'error';
  title?: string;
}>();

const iconColor = computed(() => {
  let color = '';
  switch (props.type) {
    case 'warning':
      color = '#faad14';
      break;
    case 'success':
      color = '#52c41a';
      break;
    case 'error':
      color = '#f5222d';
      break;
    default:
      color = '#1890ff';
      break;
  }
  return color;
});
</script>

<style lang="scss" scoped>
.ant-btn-text {
  padding: 0;
}
.ant-btn-text[disabled] {
  a {
    color: #ccc !important;
  }
}
</style>
