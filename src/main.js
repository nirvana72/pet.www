import Vue from 'vue'
import App from './App.vue'
import router from '@/router/index.js'
import store from '@/store.js'
import vuetify from '@/vuetify.js'
import '@/style/main.scss'
// import '@/mock/index.js'
import Request from '@/utils/request.js'
import VueLazyload from 'vue-lazyload'

// 图片延迟加载
Vue.use(VueLazyload)

Vue.prototype.$Ajax = Request

Vue.config.productionTip = false

// --------------------------------------------------------------------------------
// 全局注册页面组件
Vue.component('nj-loading', () => import('@/components/nj-loading.vue'))
Vue.component('nj-navigationbar', () => import('@/components/nj-navigationbar.vue'))

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App),
}).$mount('#app')