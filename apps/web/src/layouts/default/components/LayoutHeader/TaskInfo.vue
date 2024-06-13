<template>
  <a-badge :count="taskCount" @click="openDrawer">
    <dashboard-two-tone class="cursor-pointer" style="font-size: 24px" />
  </a-badge>
  <a-drawer
    title="任务列队"
    v-model:visible="visible"
    :placement="isMobile ? 'bottom' : 'right'"
    size="large"
    :closeable="false"
  >
    <template #extra>
      <a-popconfirm
        placement="leftTop"
        ok-text="确定"
        cancel-text="取消"
        @confirm="handleStopAllTask"
      >
        <template #title>
          <p>确认立即终止所有任务吗？</p>
        </template>
        <a-button type="link">终止所有任务</a-button>
      </a-popconfirm>
    </template>
    <div class="p-4">
      <a-timeline>
        <a-timeline-item v-for="(item, index) in taskList" :key="index">
          <template v-if="item.progress === 0 && item.finishedOn === null" #dot>
            <ClockCircleOutlined style="font-size: 16px; color: orange" />
          </template>
          <template v-else-if="item.finishedOn !== null" #dot>
            <CheckSquareOutlined style="font-size: 16px; color: green" />
          </template>
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="mb-2 mr-4" v-if="item.progress > 0 && item.progress !== 100">
                <a-progress :percent="item.progress" size="small" />
              </div>
              <div class="mb-3" v-if="!(item.progress && item.progress < 100)">
                {{ item.finishedOn ? '最后完成任务：' : '预计执行时间：' }}
                {{ dayjs(item.timestamp + item.delay).fromNow() }}
              </div>
            </div>
            <a-space>
              <a-tooltip>
                <template #title>跳转链接</template>
                <a v-if="item.data.url" :href="item.data.url" target="_blank">
                  <link-outlined style="font-size: 18px" />
                </a>
              </a-tooltip>
              <a-divider v-if="item.data.url" type="vertical" />
              <a-popconfirm
                placement="leftTop"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleStopTask(item.id)"
              >
                <template #title>
                  <p>确认立即终止此任务吗？</p>
                </template>
                <a-tooltip>
                  <template #title>终止任务</template>
                  <delete-outlined style="font-size: 18px" class="text-red-500" />
                </a-tooltip>
              </a-popconfirm>
            </a-space>
          </div>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <a-space>
                <a-tooltip
                  v-for="(username, index) in item.data.usernames.slice(0, 3)"
                  :key="index"
                >
                  <template #title>{{ username }}</template>
                  <a-avatar :size="24" :src="item.data.avatars[index]" />
                </a-tooltip>
                {{
                  item.data.usernames.length > 3
                    ? `等${item.data.usernames.length}人`
                    : ''
                }}
                <span class="ml-2"> 执行任务：{{ computedTaskName(item.name) }} </span>
              </a-space>
            </div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
import device from 'current-device';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import zh from 'dayjs/locale/zh-cn';
import storage from 'store';
import {
  DashboardTwoTone,
  ClockCircleOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  LinkOutlined,
} from '@ant-design/icons-vue';
import { notification } from 'ant-design-vue';
import { TaskResult, stopAllTask, stopTask } from '@/api/task';

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale(zh);

// 判断是否是移动端
const isMobile = device.mobile();

const visible = ref(false);

function openDrawer() {
  visible.value = true;
}

const taskCount = ref(0);
const taskList = ref<TaskResult[]>([]);

const { VITE_APP_BASE_URL } = import.meta.env;
const authorization = `${storage.get('ACCESS_TOKEN')}`;
const params = {
  authorization,
};
const sseUrl = `${VITE_APP_BASE_URL}task/searchUnexecutedTaskList?${new URLSearchParams(
  params,
).toString()}`;

function computedTaskName(name: string) {
  switch (name) {
    case 'articleStar':
      return '文章点赞';
    case 'articleComment':
      return '文章评论';
    case 'userArticleRandomStar':
      return '用户文章列表随机点赞';
    case 'pinStar':
      return '沸点点赞';
    case 'userArticleRead':
      return '阅读用户文章';
    case 'checkCookie':
      return '检测账号登录状态';
    case 'queryAccountInformation':
      return '爬取用户信息';
    default:
      return '未知任务';
  }
}

function handleStopAllTask() {
  stopAllTask().then((res) => {
    notification.success({
      message: '终止成功',
      description: `已成功终止${res.data.length}个任务。`,
    });
  });
}

function handleStopTask(id: string) {
  stopTask(id).then(() => {
    notification.success({
      message: '终止成功',
      description: `已成功终止${id}任务。`,
    });
  });
}

onMounted(async () => {
  const eventSource = new EventSource(sseUrl);
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data) as TaskResult[];
    taskCount.value = data.filter((item) => item.finishedOn === null).length;
    taskList.value = data.sort(
      (a, b) => a.timestamp + a.delay - (b.timestamp + b.delay),
    );
  };
});
</script>
