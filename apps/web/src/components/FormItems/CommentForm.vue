<template>
  <a-form-item v-if="!hiddenRandom" :label="props.title || '评论类型'">
    <a-checkbox v-model:checked="checked">
      随机评论（{{ maxQuantity }} 可用）
    </a-checkbox>
  </a-form-item>
  <a-form-item label="评论数量" v-if="checked">
    <a-row :gutter="[12, 12]">
      <a-col>
        <a-input-number
          v-model:value="commentQuantity"
          :min="1"
          :max="maxQuantity > 1 ? maxQuantity : 1"
        />
      </a-col>
      <a-col>
        <a-radio-group v-model:value="conmmentType">
          <a-radio-button :value="null">全部随机</a-radio-button>
          <a-radio-button value="好评">好评</a-radio-button>
          <a-radio-button value="废话">废话</a-radio-button>
          <a-radio-button value="差评">差评</a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-alert
      class="mt-2"
      message="随机评论"
      description="开启随机评论后，系统将按照选择的评论类型随机从评论列表中选择评论内容。"
      type="info"
      show-icon
    />
  </a-form-item>
  <a-form-item label="编辑评论" v-else>
    <a-input-group compact class="mb-2">
      <a-input
        placeholder="请输入你要评论的内容，按回车添加..."
        v-model:value="inputText"
        type="text"
        style="width: calc(100% - 65px)"
        @pressEnter="addComment"
      />
      <a-button @click="addComment" type="primary">增加</a-button>
    </a-input-group>
    <a-list size="small" bordered :data-source="comments">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              {{ item }}
            </template>
          </a-list-item-meta>
          <template #actions>
            <delete-outlined style="color: red" @click="deleteComment(item)" />
          </template>
        </a-list-item>
      </template>
    </a-list>
  </a-form-item>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { message } from 'ant-design-vue';
import { DeleteOutlined } from '@ant-design/icons-vue';
import useUserStore from '@/stores/user';
import config from '@/config';

const userStore = useUserStore();

const maxQuantity = computed(() => {
  return Math.floor(userStore.state.contribution / config.contribution.articleComment);
});

const props = defineProps<{
  title?: string;
  value?: string[];
  type?: string;
  quantity?: number;
  hiddenRandom?: boolean;
}>();

const emits = defineEmits(['update:value', 'update:type', 'update:quantity']);

const checked = ref(!props.hiddenRandom);

const comments = ref<string[]>([]);
const conmmentType = ref<string | null>(null);
const commentQuantity = ref(1);

const inputText = ref('');

const addComment = () => {
  if (comments.value.length >= maxQuantity.value) {
    message.error(`贡献值不足，最多可添加 ${maxQuantity.value} 条评论！`);
    return;
  }
  if (inputText.value && comments.value.includes(inputText.value) === false) {
    comments.value.push(inputText.value);
    inputText.value = '';
  } else {
    message.error('评论内容不能为空或者重复！');
  }
};

function deleteComment(comment: string) {
  comments.value = comments.value.filter((item) => item !== comment);
}

function reset() {
  if (props.hiddenRandom) {
    checked.value = true;
  } else {
    checked.value = false;
  }
  comments.value = [];
  conmmentType.value = null;
  commentQuantity.value = 1;
  inputText.value = '';
}

watch(
  comments,
  () => {
    const value = checked.value ? null : comments.value;
    commentQuantity.value = comments.value.length;
    emits('update:value', value);
  },
  {
    immediate: true,
    deep: true,
  },
);

watch(
  conmmentType,
  () => {
    const value = checked.value ? conmmentType.value : null;
    emits('update:type', value);
  },
  {
    immediate: true,
  },
);

watch(
  commentQuantity,
  () => {
    const value = checked.value ? commentQuantity.value : comments.value?.length;
    emits('update:quantity', value);
  },
  { immediate: true },
);

defineExpose({
  reset,
});
</script>
