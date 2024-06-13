import axios, { AxiosError, AxiosResponse } from 'axios';
import storage from 'store';
import { notification } from 'ant-design-vue';
import useUserStore from '@/stores/user';

const { VITE_APP_BASE_URL } = import.meta.env;

const request = axios.create({
  // API 请求的默认前缀
  baseURL: VITE_APP_BASE_URL as string,
  timeout: 300000, // 请求超时时间
});

// 异常拦截处理器
const errorHandler = (error: AxiosError) => {
  const status = error.response?.status;
  switch (status) {
    case 400:
      error.message = '请求错误';
      break;
    case 401:
      error.message = '未授权，请登录';
      break;
    case 403:
      error.message = '拒绝访问';
      break;
    case 404:
      error.message = `请求地址出错: ${error.response?.config.url}`;
      break;
    case 408:
      error.message = '请求超时';
      break;
    case 500:
      error.message = '服务器内部错误';
      break;
    case 501:
      error.message = '服务未实现';
      break;
    case 502:
      error.message = '网关错误';
      break;
    case 503:
      error.message = '服务不可用';
      break;
    case 504:
      error.message = '网关超时';
      break;
    case 505:
      error.message = 'HTTP版本不受支持';
      break;
    default:
      break;
  }
  return Promise.reject(error);
};

request.interceptors.request.use((config) => {
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (config.headers) {
    config.headers.Authorization = `${storage.get('ACCESS_TOKEN')}`;
  }
  return config;
}, errorHandler);

// response interceptor
request.interceptors.response.use((response: AxiosResponse) => {
  const dataAxios = response.data;
  const useStore = useUserStore();
  const { code, message } = dataAxios;
  switch (code) {
    case 0:
      return dataAxios;
    case 4008:
      useStore.handleExpire();
      throw Error(message);
    default:
      notification.error({
        message: '错误',
        description: message,
      });
      throw Error(message);
  }
}, errorHandler);

export default request;

export interface Response<T> {
  message: string;
  data: T;
  code: number;
}

export interface ListResult<T> {
  records: T[];
  pageSize: number;
  page: number;
  total: number;
}

export interface SetResult {
  code: number;
  message: string;
  result: null;
  subcode: 'Success' | 'Fail';
}
