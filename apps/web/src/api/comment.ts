import request, { Response, ListResult } from '@/libs/request';

export interface Comment {
  id?: number;
  content?: string;
  userId?: string;
  enable?: boolean;
  type?: string;
  createdAt?: string;
}

export function getComment(
  page: number,
  pageSize: number,
  type?: string | undefined,
  enable = true,
) {
  return request<Response<ListResult<Comment>>>({
    method: 'get',
    url: '/comment/list',
    params: {
      page,
      pageSize,
      type,
      enable,
    },
  });
}

export function deleteComment(id: number) {
  return request<Response<null>>({
    method: 'post',
    url: '/comment/delete',
    data: {
      ids: [id],
    },
  });
}

export function enableComment(id: number, enable: boolean) {
  return request<Response<null>>({
    method: 'put',
    url: '/comment/enable',
    params: {
      id,
      enable,
    },
  });
}

export function updateComment(data: Comment) {
  return request<Response<null>>({
    method: 'post',
    url: '/comment/update',
    data,
  });
}

export function addComment(data: Comment) {
  return request<Response<null>>({
    method: 'post',
    url: '/comment/add',
    data,
  });
}
