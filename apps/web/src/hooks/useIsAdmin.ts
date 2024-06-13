import useUserStore from '@/stores/user';

const userStore = useUserStore();

export default function useIsAdmin() {
  return computed(() => userStore.state.type === 'admin');
}
