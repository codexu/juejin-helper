import request, { Response } from '@/libs/request';

interface Opts {
  delay: number;
  priority: string;
  attempts: number;
  timestamp: number;
}

interface Data {
  url: string;
  usernames: string[];
  avatars: string[];
  taskPublisherName: string;
}

export interface TaskResult {
  id: string;
  name: string;
  data: Data;
  opts: Opts;
  progress: number;
  delay: number;
  timestamp: number;
  attemptsMade: number;
  stacktrace: any[];
  returnvalue?: any;
  finishedOn?: any;
  processedOn?: any;
}

export function searchUnexecutedTaskList() {
  return request<Response<TaskResult[]>>({
    method: 'get',
    url: '/task/searchUnexecutedTaskList',
  });
}

// 终止所有任务
export function stopAllTask() {
  return request<Response<TaskResult[]>>({
    method: 'get',
    url: '/task/stopAllTask',
  });
}

// 单独终止任务
export function stopTask(taskId: string) {
  return request<Response<TaskResult[]>>({
    method: 'get',
    url: '/task/stopTask',
    params: {
      taskId,
    },
  });
}
