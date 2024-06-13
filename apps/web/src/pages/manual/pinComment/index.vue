<route lang="yaml">
name: pinComment
meta:
  title: 沸点评论
  auth: true
</route>

<template>
  <div class="md:p-6">
    <a-card title="沸点评论">
      <a-form
        class="mx-auto md:my-20 md:w-[650px]"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="沸点链接">
          <a-input v-model:value="modelRef.url" />
        </a-form-item>
        <CommentForm
          ref="commentFormRef"
          v-model:value="modelRef.comments"
          hiddenRandom
        />
        <DurationForm v-model:value="modelRef.delay" />
        <a-form-item class="mt-12" :wrapper-col="{ offset: isMobile ? 0 : 4 }">
          <a-space>
            <a-button :loading="loading" type="primary" @click.prevent="onSubmit">
              发布任务
            </a-button>
            <a-button @click="reset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRaw } from 'vue';
import { Form, notification } from 'ant-design-vue';
import device from 'current-device';
import { manualPinComment } from '@/api/manual';
import DurationForm from '@/components/FormItems/DurationForm.vue';
import useUserStore from '@/stores/user';
import CommentForm from '@/components/FormItems/CommentForm.vue';
// 判断是否是移动端
const isMobile = device.mobile();
const userStore = useUserStore();

const commentFormRef = ref<InstanceType<typeof CommentForm>>();

const { useForm } = Form;

const modelRef = reactive({
  url: '',
  comments: [],
  delay: 0,
});
const loading = ref(false);
const { resetFields } = useForm(modelRef);

function reset() {
  resetFields();
  commentFormRef.value?.reset();
}

const onSubmit = () => {
  loading.value = true;
  manualPinComment(toRaw(modelRef))
    .then((res) => {
      reset();
      notification.success({
        message: `添加成功`,
        description: `已成功添加${res.data.jobId.length}个任务。`,
      });
      userStore.handleGetUserInfo();
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
