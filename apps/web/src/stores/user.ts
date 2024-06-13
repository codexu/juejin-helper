import { defineStore } from 'pinia';
import storage from 'store';
import { notification } from 'ant-design-vue';
import emitter from '@/libs/emitter';
import router from '@/router';
import { getUserInfo, logout, UserInfo } from '@/api/login';

interface UserState {
  username: string;
  cookie: string;
  userId: string;
  avatar: string;
}

export default defineStore('useUserStore', () => {
  const state = reactive<UserInfo>({
    id: 0,
    username: '',
    userId: '',
    mainAccount: '',
    contribution: 0,
    avatar: '',
    type: '',
  });

  async function handleLogin(payload: UserState) {
    storage.set('ACCESS_TOKEN', payload.cookie);
    router.push({ path: '/' });
  }

  async function handleLogout() {
    await logout();
    storage.remove('ACCESS_TOKEN');
    router.push({ path: '/login' });
  }

  async function switchingAccounts() {
    storage.remove('ACCESS_TOKEN');
    router.push({ path: '/login' });
  }

  // 过期
  async function handleExpire() {
    notification.error({
      message: '登录过期',
      description: '请重新登录',
    });
    storage.remove('ACCESS_TOKEN');
    router.push({ path: '/login' });
  }

  function handleGetUserInfo() {
    // 调用获取用户信息接口
    getUserInfo().then((res) => {
      if (res.data) {
        state.id = res.data.id;
        state.username = res.data.username;
        state.userId = res.data.userId;
        state.mainAccount = res.data.mainAccount;
        state.contribution = res.data.contribution;
        state.avatar = res.data.avatar;
        state.type = res.data.type;
        emitter.emit('user-info', res.data);
      } else {
        handleExpire();
      }
    });
  }

  return {
    state,
    handleLogin,
    handleLogout,
    handleExpire,
    handleGetUserInfo,
    switchingAccounts,
  };
});
