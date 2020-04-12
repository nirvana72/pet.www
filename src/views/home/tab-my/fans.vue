<template>
 <nj-scroll 
    ref="scroll"
    :height="height"
    :env="$store.getters.device.env"
    @pulldown="loadlist('refresh')"
    @pullup="loadlist('load')">    
    <div v-if="ajaxstatus.loaded && fans.length <= 0" class="nj-nodata">
      一个粉丝都没有，加油努力啊
    </div>
    <nj-social-user v-for="(user, i) in fans" :key="i"
      :user="user" 
      action="fans" 
      @nameclick="onNameClick"></nj-social-user>      
  </nj-scroll>
</template>

<script>
import Scroll from '@/components/scroll/scroll.vue'
import SocialUser from '@/components/nj-social-user.vue'
export default {
  props: {
    height: {
      type: [String, Number],
      required: true,
      default: 400
    }
  },
  components: { 'nj-social-user': SocialUser, 'nj-scroll': Scroll },
  data() {
    return {
      ajaxstatus:{ loaded: false, loading: false },
      fans: [],
      query: { page: 1, limit: 10 }
    }
  }, 
  created() {    
    this.loadlist('refresh')
  },  
  methods: {
    // method : refresh / load
    loadlist(method) {  
      if(this.ajaxstatus.loading) {
        return true
      }
      this.ajaxstatus.loading = true

      if(method === 'refresh'){
        this.query.page = 1
      }
      if(method === 'load'){
        if(this.$refs.scroll.hasmore === false){
          return true
        }        
        if(this.fans.length > 100){
          this.fans.splice(0, 80)
        }
      }
      this.$Ajax({
        method: 'get', url: `/subscribes/${this.$store.getters.session.uid}/fans`, params: this.query
      }).then((res) => {
        if(res.data.ret > 0 && res.data.list.length >= 0){          
          if (method === 'refresh') {
            this.fans = res.data.list
            this.$emit('updatecount', 'fans', res.data.count)
          }
          if (method === 'load') {            
            this.fans = this.fans.concat(res.data.list)            
          }
          this.$refs.scroll.hasmore = res.data.list.length == this.query.limit
          this.query.page++
        }
      }).finally(() => {
        this.ajaxstatus.loaded = true
        this.ajaxstatus.loading = false
        this.$refs.scroll.loaded()
      })
    },
    onNameClick(user){      
      this.$router.push({path:'/auth/user', query:{ uid: user.uid } })
    },
  }
}
</script>