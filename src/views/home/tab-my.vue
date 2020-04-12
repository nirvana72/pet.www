<template>
  <div :style="{height: $store.getters.device.content_height + 'px'}">
    <keep-alive>
      <component :is="tabView" :height="$store.getters.device.content_height - 40" @updatecount="updatecount"></component>
    </keep-alive>
    <v-tabs fixed-tabs height="40" color="#FAFAFA" slider-color="#FF0000" @change="bottom_nav_onchange" class="nj-my-bottom-tabs">
      <v-tab :ripple="false">
        <v-icon v-show="tabView==='likes'" style="color:#ff0000">star</v-icon>
        <label>收藏<span v-show="tabView==='likes' && likes > 0">({{likes}})</span></label>
      </v-tab>
      <v-tab :ripple="false">
        <v-icon v-show="tabView==='subscribes'" style="color:#ff0000">favorite</v-icon>
        <label>关注<span v-show="tabView==='subscribes' && subscribes > 0">({{subscribes}})</span></label>
      </v-tab>
      <v-tab :ripple="false">
        <v-icon v-show="tabView==='fans'" style="color:#ff0000">add</v-icon>
        <label>粉丝<span v-show="tabView==='fans' && fans > 0">({{fans}})</span></label>
      </v-tab>
      <v-tab :ripple="false">
        <v-icon v-show="tabView==='my'" style="color:#ff0000">account_circle</v-icon>
        <label>我的<span v-show="tabView==='my' && articles > 0">({{articles}})</span></label>
      </v-tab>
    </v-tabs>
  </div>
</template>

<script>
export default {
  name: 'index-tab-my',
  components: {
    'likes': () => import('@/views/home/tab-my/likes'),
    'subscribes': () => import('@/views/home/tab-my/subscribes'),
    'fans': () => import('@/views/home/tab-my/fans'),
    'my': () => import('@/views/home/tab-my/my'),
  },
  data() {
    return {
      tabView: 'likes',
      likes: 0,
      subscribes: 0,
      fans: 0,
      articles: 0,
    }
  },
  methods: {
    bottom_nav_onchange(val) {
      this.tabView = ['likes', 'subscribes', 'fans', 'my'][val]
    },
    updatecount(name, num) {
      this[name] = num
    }
  }
}
</script>