<template>
  <nj-scroll 
    ref="scroll"
    :height="height"
    :env="$store.getters.device.env"
    @pulldown="loadlist('refresh')"
    @pullup="loadlist('load')">      
    <div v-if="ajaxstatus.loaded && subscribes.length <= 0" class="nj-nodata">
      如果有你喜欢的用户，就关注一下吧
    </div>
    <swiper-out ref="swiper" @onremove="removeHandler">
      <swiper-out-item  v-for="(user, i) in subscribes" :key="i" :data-id="user.uid">
        <nj-social-user 
        :user="user" 
        action="subscribes" 
        @nameclick="onNameClick"
        @onremove="removeHandler"></nj-social-user>
      </swiper-out-item>
    </swiper-out>    
  </nj-scroll>
</template>

<script>
import Scroll from '@/components/scroll/scroll.vue'
import SwiperOut from '@/components/Swiper/swiper-out.vue'
import SwiperOutItem from '@/components/Swiper/swiper-out-item.vue'
import SocialUser from '@/components/nj-social-user.vue'
export default {
  props: {
    height: {
      type: [String, Number],
      required: true,
      default: 400
    }
  },
  components: { SwiperOut, SwiperOutItem, 'nj-social-user': SocialUser, 'nj-scroll': Scroll },
  data() {
    return {
      ajaxstatus:{ loaded: false, loading: false },
      subscribes: [],
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
        if(this.subscribes.length > 100){
          this.subscribes.splice(0, 80)
        }
      }
      this.$Ajax({
        method: 'get', url: '/subscribes/' + this.$store.getters.session.uid, params: this.query
      }).then((res) => {
        if(res.data.ret > 0 && res.data.list.length >= 0){          
          if (method === 'refresh') {
            this.subscribes = res.data.list
            this.$emit('updatecount', 'subscribes', res.data.count)
          }
          if (method === 'load') {           
            this.subscribes = this.subscribes.concat(res.data.list)            
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
    removeHandler (el) {
      if(!confirm('确定删除？')) return
      let _id = el
      if(typeof el === 'object')
        _id = el.getAttribute('data-id')

      this.$Ajax({
        method: 'delete', url: `/subscribes/${_id}`
      }).then((res) => {
        if(res.data.ret > 0){  
          for(let i=0, len=this.subscribes.length;i<len;i++){
            if(this.subscribes[i].uid == _id){          
              this.$refs.swiper.activeItem && this.$refs.swiper.activeItem.close()
              const _this = this
              setTimeout(() => {
                _this.subscribes.splice(i, 1)
              }, 500);
              break
            }
          }
        }     
      })
    }
  }
}
</script>