/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/base/layout.vue'

const authRouter = {
  path: '/auth',
  component: Layout,
  children: [
    {
      path: 'login',
      name: 'auth-login',
      meta: { trans: 'slide', title: '登录' },
      component: () => import('@/views/auth/login'),
    },
    {
      path: 'register',
      name: 'auth-register',
      meta: { trans: 'slide', title: '注册' },
      component: () => import('@/views/auth/register'),
    },
    {
      path: 'user',
      name: 'auth-user',
      meta: { trans: 'slide', title: '个人信息' },
      component: () => import('@/views/auth/user'),
    },
    {
      path: 'user-update',
      name: 'auth-user-update',
      meta: { trans: 'slide', title: '', login: true },
      component: () => import('@/views/auth/user-update'),
    },
    {
      path: 'user-avatar',
      name: 'auth-user-avatar',
      meta: { trans: 'slide', title: '头像', login: true },
      component: () => import('@/views/auth/user-avatar'),
    },
    {
      path: 'user-password',
      name: 'auth-user-password',
      meta: { trans: 'slide', title: '修改密码', login: true },
      component: () => import('@/views/auth/user-password'),
    },
  ],
}

export default authRouter
