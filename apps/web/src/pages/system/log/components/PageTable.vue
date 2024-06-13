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
      <template v-else-if="column.key === 'username'">
        <a-space :size="10">
          <a-badge v-if="!record.state">
            <template #count>
              <clock-circle-outlined style="color: #f5222d" />
            </template>
            <a-avatar :src="record.avatar" :size="24" />
          </a-badge>
          <a-avatar v-else :src="record.avatar" :size="24" />
          <a :href="`https://juejin.cn/user/${record.userId}`" target="_blank">
            {{ record.username }}
          </a>
        </a-space>
      </template>
      <template v-else-if="column.key === 'createdAt'">
        {{ dayjs(record[column.key]).fromNow() }}
      </template>
      <template v-else-if="column.key === 'action'">
        <span>
          <a :href="record.link">链接</a>
        </span>
      </template>
    </template>
  </a-table>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import useStore from '../store';
import columns from './columns';

const store = useStore();

function change(pagination: any) {
  store.pagination.current = pagination.current || 1;
  store.pagination.pageSize = pagination.pageSize || 10;
  store.getPageData();
}
</script>
