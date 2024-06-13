<template>
  <a-layout>
    <a-layout-sider theme="dark" width="260px" class="hidden md:block">
      <LayoutSide />
    </a-layout-sider>
    <a-layout class="pt-16 md:pt-0">
      <DefaultHeader />
      <a-layout-content class="page">
        <router-view v-slot="{ Component, route }">
          <keep-alive>
            <component :is="Component" v-if="route.meta.keepAlive"></component>
          </keep-alive>
          <component :is="Component" v-if="!route.meta.keepAlive"></component>
        </router-view>
        <DefaultFooter />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts" setup name="DefaultLayout">
import DefaultHeader from './components/LayoutHeader/LayoutHeader.vue';
import DefaultFooter from './components/DefaultFooter.vue';
import LayoutSide from './components/LayoutAside/index.vue';
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
}
</style>
