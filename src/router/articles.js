/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/base/layout.vue'

const articlesRouter = {
  path: '/articles',
  component: Layout,
  children: [
    {
      path: 'publish-image',
      name: 'articles-publish-image',
      meta: { trans: 'zoom', login: true },
      component: () => import('@/views/articles/publish-image'),
    },
    {
      path: 'publish-video',
      name: 'articles-publish-video',
      meta: { trans: 'zoom', login: true },
      component: () => import('@/views/articles/publish-video'),
    },
    {
      path: 'publish-rich',
      name: 'articles-publish-rich',
      meta: { trans: 'zoom', login: true },
      component: () => import('@/views/articles/publish-rich'),
    },
    {
      path: 'show-image',
      name: 'articles-show-image',
      meta: { trans: 'slideV' },
      component: () => import('@/views/articles/show-image'),
    },
    {
      path: 'show-video',
      name: 'articles-show-video',
      meta: { trans: 'slideV' },
      component: () => import('@/views/articles/show-video'),
    },
    {
      path: 'show-rich',
      name: 'articles-show-rich',
      meta: { trans: 'slideV' },
      component: () => import('@/views/articles/show-rich'),
    },
    {
      path: 'user-articles',
      name: 'articles-user-articles',
      meta: { trans: 'slide' },
      component: () => import('@/views/articles/user-articles'),
    },
  ],
}

export default articlesRouter
