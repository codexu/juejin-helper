import { DashboardFilled, SettingFilled, AlertFilled } from '@ant-design/icons-vue';

export default [
  {
    path: '/dashboard',
    title: '信息总览',
    icon: DashboardFilled,
  },
  {
    path: '/system',
    title: '系统管理',
    icon: SettingFilled,
    children: [
      {
        path: '/system/account',
        title: '账号管理',
      },
      {
        path: '/system/comment',
        title: '评论管理',
      },
      {
        path: '/system/log',
        title: '日志管理',
      },
    ],
  },
  {
    path: '/manual',
    title: '任务管理',
    icon: AlertFilled,
    children: [
      {
        path: '/manual/articleStar',
        title: '文章点赞',
      },
      {
        path: '/manual/articleComment',
        title: '文章评论',
      },
      {
        path: '/manual/articleRead',
        title: '文章阅读',
      },
      {
        path: '/manual/pinStar',
        title: '沸点点赞',
      },
      {
        path: '/manual/pinComment',
        title: '沸点评论',
      },
    ],
  },
  {
    path: '/pin',
    title: '沸点管理',
    icon: AlertFilled,
    children: [
      {
        path: '/pin/dashboard',
        title: '沸点概览',
      },
      {
        path: '/pin/template',
        title: '模板管理',
      },
    ],
  },
];
