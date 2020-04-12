import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store.js'
import HomePage from '@/views/home/index.vue'
import Layout from '@/views/base/layout.vue'

import authRouter from './auth.js'
import articlesRouter from './articles.js'
// import demoRouter from './demo.js'
// 场景切换状态条
// import NProgress from 'muse-ui-progress';
// import 'muse-ui-progress/dist/muse-ui-progress.css';

Vue.use(Router)

// Vue.use(NProgress);

const router = new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          alias: 'home',
          name: 'home',
          component: HomePage,
        },
        {
          path: 'about',
          name: 'about',
          meta: { trans: 'slide', title: '关于我们' },
          component: () => import('@/views/home/about'),
        },
        {
          path: 'search',
          name: 'search',
          meta: { trans: 'slide', title: '搜索结果' },
          component: () => import('@/views/home/search'),
        },
      ],
    },
    authRouter,
    articlesRouter,
    // demoRouter
  ],
})

router.beforeEach((to, from, next) => {
  // NProgress.start()

  if (to.meta.login && store.getters.session.uid < 0) {
    next('/auth/login')
    return
  }

  // 前进缓存，后退清理， 需要作为layout.vue 子组件，并设置与路由同名 name 属性
  let isgoback = sessionStorage.getItem('app-isgoback')
  if (isgoback) {
    store.commit('removeCacheRootName', from.name)
  } else {
    store.commit('addCacheRootName', to.name)
  }
  next()
  // setTimeout(() => { next(); }, 10000);
})

router.afterEach(function() {
  // NProgress.done();
})

export default router
