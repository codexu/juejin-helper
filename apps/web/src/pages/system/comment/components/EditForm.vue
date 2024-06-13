<template>
  <a-modal v-model:visible="visible" title="编辑评论" @ok="handleOk">
    <a-form
      :model="formState"
      name="basic"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item label="内容" name="content">
        <a-textarea v-model:value="formState.content" />
      </a-form-item>
      <a-form-item label="类型" name="type">
        <a-radio-group v-model:value="formState.type" size="small">
          <a-radio-button value="好评">好评</a-radio-button>
          <a-radio-button value="废话">废话</a-radio-button>
          <a-radio-button value="差评">差评</a-radio-button>
          <a-radio-button value="爬虫">爬虫</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="状态" name="enable">
        <a-switch v-model:checked="formState.enable" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { notification } from 'ant-design-vue';
import { Comment, updateComment, addComment } from '@/api/comment';
import useStore from '../store';

const store = useStore();
const editType = ref<'add' | 'edit'>('add');
const visible = ref<boolean>(false);

const formState = reactive<Comment>({
  id: 0,
  content: '',
  type: '好评',
  enable: true,
});

const handleOk = () => {
  if (editType.value === 'add') {
    delete formState.id;
    addComment(formState).then(() => {
      notification.success({
        message: '添加成功',
      });
      visible.value = false;
      store.getPageData();
    });
  } else {
    updateComment({
      id: formState.id,
      content: formState.content,
      type: formState.type,
      enable: formState.enable,
    }).then(() => {
      notification.success({
        message: '更新成功',
      });
      visible.value = false;
      store.getPageData();
    });
  }
};

const showModal = (record?: Comment) => {
  visible.value = true;
  if (!record) {
    editType.value = 'add';
    return;
  }
  editType.value = 'edit';
  formState.id = record.id;
  formState.content = record.content;
  formState.type = record.type;
  formState.enable = record.enable;
};

defineExpose({
  showModal,
});
</script>
