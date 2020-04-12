<template>
  <nj-scroll 
    ref="scroll"
    :height="height"
    :env="$store.getters.device.env"
    @pulldown="loadlist('refresh')"
    @pullup="loadlist('load')"> 
    <div v-if="ajaxstatus.loaded && articles.length <= 0" class="nj-nodata">
      没有收藏的文章，一个都不喜欢么
    </div>
    <swiper-out ref="swiper" @onremove="removeHandler">
      <swiper-out-item  v-for="(article, i) in articles" :key="i" :data-id="article.Id">
        <nj-article 
          :article="article" 
          action="likes" 
          @aritleClick="onAritleClick" 
          @onremove="removeHandler"></nj-article>
      </swiper-out-item>
    </swiper-out>    
  </nj-scroll>
</template>

<script>
import Scroll from '@/components/scroll/scroll.vue'
import SwiperOut from '@/components/Swiper/swiper-out.vue'
import SwiperOutItem from '@/components/Swiper/swiper-out-item.vue'
import Article from '@/components/nj-article-list-item.vue'
export default {
  props: {
    height: {
      type: [String, Number],
      required: true,
      default: 400
    }
  },
  components: { SwiperOut, SwiperOutItem, 'nj-article': Article, 'nj-scroll': Scroll },
  data() {
    return {
      ajaxstatus: { loaded: false, loading: false },
      articles: [],
      query: { page: 1, limit: 10 }
    }
  },
  created() {
    this.loadlist('refresh')
  },
  methods: {
    // 文章明细
    onAritleClick(article) {
      this.$router.push({ name: `articles-show-${article.type}`, params: { Id: article.Id } })
    },
    // method : refresh / load
    loadlist(method) {
      if (this.ajaxstatus.loading) {
        return true
      }
      this.ajaxstatus.loading = true

      if (method === 'refresh') {
        this.query.page = 1
      }
      if (method === 'load') {
        if (this.$refs.scroll.hasmore === false) {
          return true
        }
        if (this.articles.length > 100) {
          this.articles.splice(0, 80)
        }
      }
      this.$Ajax({
        method: 'get', url: `/articles/${this.$store.getters.session.uid}/likes`, params: this.query
      }).then((res) => {
        if (res.data.ret > 0 && res.data.list.length >= 0) {
          if (method === 'refresh') {
            this.articles = res.data.list
            this.$emit('updatecount', 'likes', res.data.count)
          }
          if (method === 'load') {
            this.articles = this.articles.concat(res.data.list)
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
    removeHandler(el) {
      if (!confirm('确定删除？')) return
      let _id = el
      if (typeof el === 'object')
        _id = el.getAttribute('data-id')

      this.$Ajax({
        method: 'delete', url: `/articles/${_id}/like`
      }).then((res) => {
        if (res.data.ret > 0) {
          for (let i = 0, len = this.articles.length; i < len; i++) {
            if (this.articles[i].Id == _id) {
              this.$refs.swiper.activeItem && this.$refs.swiper.activeItem.close()
              const _this = this
              setTimeout(() => {
                _this.articles.splice(i, 1)
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