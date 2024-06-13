import request, { Response, ListResult } from '@/libs/request';

export interface UserInfo {
  id: number;
  account: string;
  password: string;
  avatar: string;
  type: 'admin' | 'user';
  createdAt: string;
  username: string;
  userId: string;
  mainAccount: string;
  contribution: number;
  userArticleLike: number;
  userPinLike: number;
  totalArticle: number;
  articleShow: number;
  articleRead: number;
  articleLike: number;
  articleComment: number;
  articleCollect: number;
  totalPin: number;
  totalPinLike: number;
  totalPinComment: number;
  lastUpdated: string;
}

export function getAccountList(page: number, pageSize: number) {
  return request<Response<ListResult<UserInfo>>>({
    method: 'get',
    url: '/account/findAll',
    params: {
      page,
      pageSize,
    },
  });
}

// 检测全部账号 cookie 是否过期
export function checkCookie() {
  return request<Response<boolean>>({
    method: 'get',
    url: '/account/checkCookie',
  });
}

// 爬取全部账号的数据
export function queryAccountInformation() {
  return request<Response<boolean>>({
    method: 'get',
    url: '/account/queryAccountInformation',
  });
}

// 单独访问账号（本地服务）
export function visitAccount(id: number) {
  return request<Response<boolean>>({
    method: 'get',
    url: '/account/visitAccount',
    params: {
      id,
    },
  });
}

// 手动获取 cookie （本地服务）
export function getCookie() {
  return request<Response<boolean>>({
    method: 'get',
    url: '/account/getCookie',
  });
}

// 设置主账号
export function setMainAccount(data: { id: number; mainAccount: string }) {
  return request<Response<boolean>>({
    method: 'post',
    url: '/user/setMainAccount',
    data,
  });
}

export interface UpdateUserInfoData {
  id: number;
  contribution: number;
  type: 'admin' | 'user';
  mainAccount?: string;
}
// 更新用户信息
export function updateUserInfo(data: UpdateUserInfoData) {
  return request<Response<boolean>>({
    method: 'post',
    url: '/user/update',
    data,
  });
}

// 删除用户
export function deleteAccount(id: number) {
  return request<Response<boolean>>({
    method: 'delete',
    url: '/user/delete',
    params: {
      id,
    },
  });
}

export interface Message {
  type: string;
  avatar: string;
  name: string;
  userUrl: string;
  contentUrl?: string;
  comment?: string;
  reference?: string;
  title: string;
  time: number;
}

// 获取账号系统消息
export function findMessage(id: number) {
  return request<Response<Message[]>>({
    method: 'get',
    url: '/account/findMessage',
    params: {
      id,
    },
  });
}
