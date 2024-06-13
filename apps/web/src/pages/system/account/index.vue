<route lang="yaml">
name: AccountList
meta:
  title: 账号管理
  auth: true
</route>

<template>
  <div class="p-6">
    <a-card title="账号列表">
      <a-table
        :dataSource="accountList"
        :columns="columns"
        size="small"
        :pagination="pagination"
        @change="pageChange"
        :scroll="{ x: 2700 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ (pagination.current - 1) * pagination.pageSize + index + 1 }}
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
              <span class="text-xs">ID: {{ record.id }}</span>
              <a @click="handleMessage(record)">
                <a-badge :count="record.unreadMessage"></a-badge>
              </a>
            </a-space>
          </template>
          <template v-else-if="column.key === 'type'">
            <a-tag color="blue" v-if="record[column.key] === 'admin'">管理员</a-tag>
            <a-tag color="purple" v-else>用户</a-tag>
          </template>
          <template v-else-if="column.key === 'lastUpdated'">
            {{ dayjs(record[column.key]).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'contribution'">
            <a-tag color="green">{{ record[column.key] }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button size="small" type="link" @click="handleMessage(record)">
              消息
            </a-button>
            <a-divider type="vertical" />
            <a-button
              size="small"
              type="link"
              @click="handleEdit(record)"
              :disabled="!isAdmin"
            >
              编辑
            </a-button>
            <a-divider type="vertical" />
            <a-tooltip>
              <template #title>仅本地服务可访问</template>
              <a-button
                size="small"
                type="link"
                @click="handleVisitAccount(record.id)"
                :disabled="!isLocalhost && !isAdmin"
              >
                访问
              </a-button>
            </a-tooltip>
            <a-divider type="vertical" />
            <a-popconfirm
              title="你确定要删除此账号?"
              ok-text="确定"
              cancel-text="取消"
              placement="left"
              :disabled="!isAdmin"
              @confirm="handleDelete(record.id)"
            >
              <a-button type="link" size="small" :disabled="!isAdmin" danger>
                删除
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
  <a-modal v-model:visible="editVisible" title="修改用户" @ok="handleSubmit">
    <a-form
      :model="formState"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item label="主账号ID" name="mainAccount">
        <a-input v-model:value="formState.mainAccount" />
      </a-form-item>
      <a-form-item label="账号类型" name="type">
        <a-radio-group v-model:value="formState.type">
          <a-radio value="admin">管理员</a-radio>
          <a-radio value="user">用户</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="贡献值" name="contribution">
        <a-input-number v-model:value="formState.contribution" />
      </a-form-item>
    </a-form>
  </a-modal>
  <MessageBox ref="messageBox" @afterVisibleChange="fetchData()" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import dayjs from 'dayjs';
import { PaginationProps } from 'ant-design-vue/lib/pagination';
import { ClockCircleOutlined } from '@ant-design/icons-vue';
import { useRoute } from 'vue-router';
import { notification } from 'ant-design-vue';
import {
  getAccountList,
  UserInfo,
  visitAccount,
  updateUserInfo,
  UpdateUserInfoData,
  deleteAccount,
} from '@/api/account';
import columns from './columns';
import useUserStore from '@/stores/user';
import MessageBox from './components/MessageBox.vue';

const messageBox = ref();

const userStore = useUserStore();

const isAdmin = computed(() => userStore.state.type === 'admin');

const editVisible = ref(false);

const route = useRoute();

const formState = reactive<UpdateUserInfoData>({
  id: 0,
  contribution: 0,
  type: 'admin',
  mainAccount: '',
});

// 获取是否未 localhost
const isLocalhost = route.query.localhost === 'true';

const accountList = ref<UserInfo[]>([]);

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (t: number) => `共 ${t} 条`,
});

function fetchData() {
  getAccountList(pagination.current, pagination.pageSize).then((res) => {
    pagination.total = res.data.total;
    accountList.value = res.data.records;
  });
}

function pageChange(page: PaginationProps) {
  pagination.current = page.current as number;
  pagination.pageSize = page.pageSize as number;
  fetchData();
}

function handleVisitAccount(id: number) {
  visitAccount(id);
}

function handleEdit(record: UserInfo) {
  editVisible.value = true;
  formState.id = record.id;
  formState.contribution = record.contribution;
  formState.type = record.type;
  formState.mainAccount = record.mainAccount;
}

function handleSubmit() {
  updateUserInfo(formState).then(() => {
    fetchData();
    editVisible.value = false;
  });
}

function handleDelete(id: number) {
  deleteAccount(id).then((res) => {
    if (res.code === 0) {
      notification.success({
        message: res.message,
      });
    }
    fetchData();
  });
}

// 查看消息
function handleMessage(record: UserInfo) {
  messageBox.value.showDrawer(record.id);
}

onMounted(() => {
  fetchData();
});
</script>
