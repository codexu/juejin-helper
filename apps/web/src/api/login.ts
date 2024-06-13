import storage from 'store';
import request, { Response } from '@/libs/request';

export interface UserInfo {
  id: number;
  username: string;
  userId: string;
  mainAccount: string;
  contribution: number;
  avatar: string;
  type: string;
}

type LoginParams = {
  account: string;
  password: string;
  shareId?: string;
};

export interface LoginResponse {
  cookie: string;
  userId: string;
  username: string;
  avatar: string;
}

export function login(params: LoginParams) {
  return request<Response<LoginResponse>>({
    method: 'get',
    url: '/user/login',
    params,
  });
}

export function logout() {
  return request<any>({
    method: 'post',
    url: '/user/logout',
    data: {
      cookie: storage.get('ACCESS_TOKEN'),
    },
  });
}

export function getUserInfo() {
  return request<Response<UserInfo>>({
    method: 'get',
    url: '/user/info',
  });
}
