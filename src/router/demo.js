/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/views/base/layout.vue';

const demoRouter = {
  path: '/demo',
  component: Layout,
  children: [
    {
      path: 'test',
      name: 'demo-test',
      component: () => import('@/views/demo/test'),
    }
  ],
}

export default demoRouter
