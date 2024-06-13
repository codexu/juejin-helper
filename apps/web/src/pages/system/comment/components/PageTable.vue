<template>
  <a-table
    rowKey="id"
    :loading="store.loading"
    :dataSource="store.pageData"
    :columns="columns"
    :pagination="store.pagination"
    size="small"
    @change="change"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'index'">
        {{ (store.pagination.current - 1) * store.pagination.pageSize + index + 1 }}
      </template>
      <template v-else-if="column.key === 'enable'">
        <a-switch
          v-model:checked="record[column.key]"
          :disabled="!isAdmin"
          @change="handleEnableChange(record, $event)"
        />
      </template>
      <template v-else-if="column.key === 'content'">
        <span class="mr-2">
          <dislike-two-tone twoToneColor="#eb2f96" v-if="record.type === '差评'" />
          <heart-two-tone twoToneColor="#52c41a" v-else-if="record.type === '好评'" />
          <meh-two-tone v-else />
        </span>
        {{ record[column.key] }}
      </template>
      <template v-else-if="column.key === 'type'">
        <a-radio-group
          v-model:value="record.type"
          button-style="solid"
          size="small"
          @change="handleTypeChange(record, $event)"
        >
          <a-radio-button value="好评">好评</a-radio-button>
          <a-radio-button value="废话">废话</a-radio-button>
          <a-radio-button value="差评">差评</a-radio-button>
          <a-radio-button value="爬虫">爬虫</a-radio-button>
        </a-radio-group>
      </template>
      <template v-else-if="column.key === 'action'">
        <a-space :size="0">
          <a-button
            type="link"
            size="small"
            @click="handleEdit(record)"
            :disabled="!isAdmin"
            >编辑</a-button
          >
          <a-divider type="vertical" />
          <a-popconfirm
            title="你确定要删除此评论吗"
            placement="left"
            ok-text="确认"
            cancel-text="取消"
            :disabled="!isAdmin"
            @confirm="handleDelete(record.id)"
          >
            <a-button size="small" type="link" danger :disabled="!isAdmin">
              删除
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </template>
  </a-table>
  <EditForm ref="editFormRef" />
</template>
<script setup lang="ts">
import { notification, message } from 'ant-design-vue';
import { DislikeTwoTone, HeartTwoTone, MehTwoTone } from '@ant-design/icons-vue';
import useStore from '../store';
import columns from './columns';
import { updateComment, Comment, deleteComment } from '@/api/comment';
import EditForm from './EditForm.vue';
import useIsAdmin from '@/hooks/useIsAdmin';

const isAdmin = useIsAdmin();
const editFormRef = ref<InstanceType<typeof EditForm>>();

const store = useStore();

function change(pagination: any) {
  store.pagination.current = pagination.current || 1;
  store.pagination.pageSize = pagination.pageSize || 10;
  store.getPageData();
}

function handleEdit(record: Comment) {
  editFormRef.value?.showModal(record);
}

async function handleEnableChange(record: Comment, checked: boolean) {
  await updateComment({
    id: record.id,
    enable: checked,
  });
  message.success({
    content: '更新成功',
  });
}

async function handleTypeChange(record: Comment, e: any) {
  record.enable = true;
  await updateComment({
    id: record.id,
    type: e.target.value,
    enable: record.enable,
  });
  message.success({
    content: '更新成功',
  });
}

async function handleDelete(id: number) {
  const res = await deleteComment(id);
  notification.success({
    message: res.message,
  });
  store.getPageData();
}
</script>
