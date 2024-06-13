<template>
  <a-modal v-model:visible="visible" title="选择主账号文章" style="width: 800px">
    <a-skeleton v-if="loading" active />
    <a-list v-else size="small" bordered :data-source="latestArticle">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :description="item.href">
            <template #title>
              <a>{{ item.title }}</a>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-button type="link" @click="handleChoose(item.href)">选择</a-button>
          </template>
        </a-list-item>
      </template>
    </a-list>
  </a-modal>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { getLatestArticle, LatestArticle } from '@/api/manual';

const emits = defineEmits(['change']);

const visible = ref(false);
const loading = ref(true);

const latestArticle = ref<LatestArticle[]>([]);

function fetch() {
  loading.value = true;
  getLatestArticle().then((res) => {
    latestArticle.value = res.data;
    loading.value = false;
  });
}

function show() {
  visible.value = true;
  if (latestArticle.value.length === 0) {
    fetch();
  }
}

function handleChoose(articleUrl: string) {
  emits('change', articleUrl);
  visible.value = false;
}

defineExpose({
  show,
});
</script>
