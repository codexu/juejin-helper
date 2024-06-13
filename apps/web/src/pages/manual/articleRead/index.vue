<route lang="yaml">
name: ManualArticleRead
meta:
  title: 指定文章点阅读
  auth: true
</route>

<template>
  <div class="md:p-6">
    <a-card title="文章阅读">
      <a-form
        class="mx-auto md:my-20 md:w-[650px]"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="文章链接">
          <a-input-group compact>
            <a-input style="width: calc(100% - 90px)" v-model:value="modelRef.url" />
            <a-button type="primary" @click="handleChooseArticle">我的文章</a-button>
          </a-input-group>
        </a-form-item>
        <a-form-item label="阅读次数">
          <a-input-number
            v-model:value="modelRef.quantity"
            :min="1"
            :max="maxQuantity"
          />
          <span class="ml-4">（{{ maxQuantity }}轮可用），每轮阅读10次。</span>
        </a-form-item>
        <DurationForm v-model:value="modelRef.delay" />
        <a-form-item class="mt-12" :wrapper-col="{ offset: isMobile ? 0 : 4 }">
          <a-space>
            <a-button :loading="loading" type="primary" @click.prevent="onSubmit">
              发布任务
            </a-button>
            <a-button @click="resetFields">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
  <ArticleList ref="articleListRef" @change="handleArticleListChange" />
</template>

<script setup lang="ts">
import { reactive, toRaw } from 'vue';
import { Form, notification } from 'ant-design-vue';
import device from 'current-device';
import { manualArticleRead } from '@/api/manual';
import DurationForm from '@/components/FormItems/DurationForm.vue';
import useUserStore from '@/stores/user';
import config from '@/config';
import ArticleList from '@/components/articles/ArticleList.vue';
// 判断是否是移动端
const isMobile = device.mobile();
const userStore = useUserStore();

const articleListRef = ref<InstanceType<typeof ArticleList>>();

const { useForm } = Form;

const modelRef = reactive({
  url: '',
  quantity: 0,
  delay: 0,
});

const loading = ref(false);

const maxQuantity = computed(() => {
  return Math.floor(userStore.state.contribution / config.contribution.articleRead);
});

const { resetFields } = useForm(modelRef);

const onSubmit = () => {
  loading.value = true;
  manualArticleRead(toRaw(modelRef))
    .then((res) => {
      resetFields();
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

const handleChooseArticle = () => {
  articleListRef.value?.show();
};

const handleArticleListChange = (articleUrl: string) => {
  modelRef.url = articleUrl;
};
</script>
