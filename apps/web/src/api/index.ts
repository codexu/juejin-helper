import request from '@/libs/request';

export default function example() {
  return request<any>({
    method: 'get',
    url: '/api',
  });
}
