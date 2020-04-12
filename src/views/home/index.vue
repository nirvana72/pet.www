<template>
  <div class="nj-view nj-homeview">
    <div class="nj-menu">
      <v-tabs centered icons-and-text height="50" color="#D50000" slider-color="#fff">
        <v-tab :ripple="false" @click="tabClick('index', 1)">
          <span>主页</span>
          <v-icon>home</v-icon>
        </v-tab>
        <v-tab :ripple="false" @click="tabClick('publish', 2)">
          <span>发布</span>
          <v-icon>add_to_photos</v-icon>
        </v-tab>
        <v-tab :ripple="false" @click="tabClick('my', 3)">
          <span>我的</span>
          <v-icon>account_circle</v-icon>
        </v-tab>
      </v-tabs>
      <v-btn icon @click="sideMenu.show = !sideMenu.show">
        <v-icon>more_vert</v-icon>
      </v-btn>
    </div>
    <transition :name="transitionName">
      <keep-alive include="index-tab-home,index-tab-my">
        <component :is="tabView.name" class="nj-content"></component>
      </keep-alive>
    </transition>
    <v-navigation-drawer absolute temporary v-model="sideMenu.show" width="200" class="nj-side-menu">
      <div v-if="$store.getters.session.uid > 0" class="nj-avatar">
        <img :src="converter.avatarPath($store.getters.session.avatar)">
        <div>{{ $store.getters.session.nickname }}</div>
      </div>
      <div class="menus">
        <div v-for="(menu,index) in sideMenu.menus" :key="index" 
          class="menu"
          @click="sideMenuClick(menu.path)">
          <v-icon>{{ menu.icon }}</v-icon>
          <label>{{ menu.txt }}</label>
        </div>
        <v-divider></v-divider>
        <div class="menu" @click="switchLogin()">
          <v-icon>power_settings_new</v-icon>
          <label v-if="$store.getters.session.uid > 0">退出登录</label>
          <label v-else>登录</label>
        </div>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import "@/style/home.scss"
import { articleConvert } from "@/utils/tools.js"

export default {
  name: 'home-index',
  components: {
    'index': () => import('@/views/home/tab-home'),
    'publish': () => import('@/views/home/tab-publish'),
    'my': () => import('@/views/home/tab-my'),
  },
  data() {
    return {
      sideMenu: {
        show: false,
        menus: [
          { path: '/auth/user', txt: '个人中心', icon: 'account_circle' },
          { path: '/about', txt: '关于我们', icon: 'star' },
          // {path:'/setting', txt:'设置', icon:'settings'},
          // {path:'/demo/test1', txt:'test', icon:'bug_report'}
        ]
      },
      tabView: { name: 'index', index: 1 },
      transitionName: '',
      converter: articleConvert,
    }
  },
  methods: {
    tabClick(name, index) {
      if (name === 'my' && this.$store.getters.session.uid < 0) {
        this.$router.push({ path: '/auth/login' })
      } else {
        this.transitionName = this.tabView.index === index ? '' : (this.tabView.index > index ? 'tab-left' : 'tab-right')
        this.tabView.name = name
        this.tabView.index = index
      }
    },
    sideMenuClick(path) {
      this.sideMenu.show = false
      if (path === '/auth/user' && this.$store.getters.session.uid < 0) {
        this.$router.push({ path: '/auth/login' })
      } else {
        this.$router.push({ path: path })
      }
    },
    switchLogin() {
      this.sideMenu.show = false
      if (this.$store.getters.session.uid > 0) {
        this.$store.commit('clearSession')
      } else {
        this.$router.push({ path: '/auth/login' })
      }
    }
  }
}
</script>
