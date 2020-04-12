<template> 
  <transition :name="transitionName" mode="in-out">
    <keep-alive :include="includeds">
      <router-view :style="{'width':$store.getters.device.width + 'px'}"></router-view>
    </keep-alive>
  </transition>
</template>

<script>
export default {  
  data () {
    return {
      transitionName: ''
    }
  },
  computed: {
    includeds(){
      return this.$store.state.includedCacheRootName
    }
  },
  watch: {
    '$route'(to, from) { 
      let isgoback = sessionStorage.getItem('app-isgoback')
      sessionStorage.removeItem('app-isgoback')
      if(isgoback){
        this.transitionName = from.meta.trans? (from.meta.trans + '-back') : ''; // 后退
      }
      else{        
        this.transitionName = to.meta.trans? (to.meta.trans + '-to') : ''; // 前进
      }
    }
  }
}
</script>