import { createApp } from 'vue';
import { components, plugins } from './components';
import App from './App.vue';
import store from './stores';
import router from './router';
import '@/router/permission';
import 'virtual:svg-icons-register';

// css
import '@/styles/tailwind.css';
import 'ant-design-vue/es/notification/style/index.css';
import 'ant-design-vue/es/message/style/index.css';

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');

// 加载全局组件
components.forEach((component) => {
  return app.component(component.name || '', component);
});

// 加载全局插件
plugins.forEach((plugin) => {
  app.use(plugin);
});
