<template>
  <a-dropdown placement="bottomRight">
    <span class="el-dropdown-link flex justify-center items-center">
      <appstore-two-tone class="md:hidden inline text-2xl" />
      <a-avatar v-if="!isMobile" :src="store.state.avatar" :size="32" />
      <span class="hidden md:inline ml-4">
        {{ store.state.username }}
      </span>
    </span>
    <template #overlay>
      <a-menu>
        <a-menu-item class="h-12">
          <a-space>
            <a-avatar :src="store.state.avatar" :size="32" />
            <span class="text-lg ml-2 font-bold">
              {{ store.state.username }}
            </span>
          </a-space>
        </a-menu-item>
        <a-menu-item class="h-12">
          <StarTwoTone class="text-lg translate-y-0.5" />
          <span class="ml-1">
            贡献值：
            {{ store.state.contribution }}
          </span>
        </a-menu-item>
        <template v-if="isMobile">
          <a-menu-divider />
          <a-menu-item class="h-12">
            <template #icon>
              <HomeOutlined />
            </template>
            <RouterLink to="/">首页</RouterLink>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item class="h-12">
            <template #icon>
              <like-outlined />
            </template>
            <RouterLink to="/manual/articleStar">文章点赞</RouterLink>
          </a-menu-item>
          <a-menu-item class="h-12">
            <template #icon>
              <comment-outlined />
            </template>
            <RouterLink to="/manual/articleComment">文章评论</RouterLink>
          </a-menu-item>
          <a-menu-item class="h-12">
            <template #icon>
              <read-outlined />
            </template>
            <RouterLink to="/manual/articleRead">文章阅读</RouterLink>
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item class="h-12">
            <template #icon>
              <like-outlined />
            </template>
            <RouterLink to="/manual/pinStar">沸点点赞</RouterLink>
          </a-menu-item>
          <a-menu-item class="h-12">
            <template #icon>
              <comment-outlined />
            </template>
            <RouterLink to="/manual/pinComment">沸点评论</RouterLink>
          </a-menu-item>
        </template>
        <a-menu-divider />
        <a-menu-item @click="store.switchingAccounts" class="h-12">
          <template #icon>
            <logout-outlined />
          </template>
          切换账号
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import {
  StarTwoTone,
  AppstoreTwoTone,
  LogoutOutlined,
  LikeOutlined,
  CommentOutlined,
  ReadOutlined,
  HomeOutlined,
} from '@ant-design/icons-vue';
import device from 'current-device';
import useUserStore from '@/stores/user';
// 判断是否是移动端
const isMobile = device.mobile();
const store = useUserStore();
</script>

<style lang="scss" scoped>
.ant-dropdown-menu {
  padding: 4px 12px !important;
}
</style>
