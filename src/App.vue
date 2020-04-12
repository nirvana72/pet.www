<template>
  <v-app>
    <div v-html="commonStyle"></div>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { getBrowserVersion } from '@/utils/tools.js'

export default {
  data() {
    return {}
  },
  created() {
    let version = getBrowserVersion()
    version = version.split('/')[0]

    const device = {}
    device.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    device.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    device.navbar_height = 60
    device.content_height = device.height - device.navbar_height
    device.env = "ontouchend" in document ? 'mobile' : 'pc'
    device.version = `html|0|${version}`
    this.$store.commit('setDevice', device)

    this.commonStyle = ""
    // pc 端滚动条会占位，不显示
    if (device.env == "pc") {
      this.commonStyle += `
        div::-webkit-scrollbar {
          display: none;
        }`
    }
    this.commonStyle = "<style>" + this.commonStyle + "</style>"
  }
}
</script>

