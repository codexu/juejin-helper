import request, { Response, ListResult } from '@/libs/request';

export interface Log {
  id: number;
  content: string;
  type: string;
  event: string;
  record: string;
  link: string;
  isRead: number;
  createdAt: string;
  username: string;
}

export function getLog(page: number, pageSize: number, type?: string) {
  return request<Response<ListResult<Log>>>({
    method: 'get',
    url: '/account/accountLog',
    params: {
      page,
      pageSize,
      type,
    },
  });
}
