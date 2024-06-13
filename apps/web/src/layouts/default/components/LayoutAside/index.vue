<template>
  <div class="h-screen">
    <WebLogo />
    <a-menu
      v-model:openKeys="openKeys"
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      theme="dark"
      :inline-collapsed="collapsed"
    >
      <!-- 根据 vue routes 生成 menus -->
      <template v-for="route in routes" :key="route.path">
        <a-sub-menu v-if="route.children" :key="route.path" :title="route.title">
          <template #icon>
            <component style="font-size: 20px" class="mr-2" :is="route.icon" />
          </template>
          <template v-for="child in route.children" :key="child.path">
            <a-menu-item :to="child.path">
              <router-link :to="child.path">
                <template #default>
                  <span>{{ child.title }}</span>
                </template>
              </router-link>
            </a-menu-item>
          </template>
        </a-sub-menu>
        <template v-else>
          <a-menu-item :key="route.path">
            <template #icon>
              <component style="font-size: 20px" class="mr-2" :is="route.icon" />
            </template>
            <router-link :to="route.path">
              <template #default>
                <span>{{ route.title }}</span>
              </template>
            </router-link>
          </a-menu-item>
        </template>
      </template>
    </a-menu>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import routes from '@/router/asideMenus';
import WebLogo from '@/layouts/default/components/WebLogo.vue';

const route = useRoute();

const collapsed = ref(false);
const openKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([route.path]);

onMounted(() => {
  // 获取当前路由的父级路由
  const parentPath = `/${route.matched[0].path.split('/')[1]}`;
  openKeys.value = [parentPath];
});

watch(
  () => route.path,
  () => {
    selectedKeys.value = [route.path];
  },
);
</script>
