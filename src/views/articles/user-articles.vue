<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar ref="navBar"></nj-navigationbar>
    <div class="nj-view-content">
      <nj-scroll ref="scroll" 
        :height="$store.getters.device.content_height" 
        :env="$store.getters.device.env" 
        @pulldown="loadlist('refresh')" 
        @pullup="loadlist('load')">

        <div v-if="ajaxstatus.loaded && articles.length <= 0" class="nj-nodata">
          该用户还没有发布过内容
        </div>

        <nj-article v-for="(article, i) in articles" :key="i" 
          :article="article" 
          action="users" 
          @aritleClick="onAritleClick">
        </nj-article>

      </nj-scroll>
    </div>
  </div>
</template>

<script>
import Scroll from '@/components/scroll/scroll.vue'
import Article from '@/components/nj-article-list-item.vue'
export default {
  name: 'articles-user-articles',
  components: { 'nj-article': Article, 'nj-scroll': Scroll },
  data() {
    return {
      ajaxstatus: { loaded: false, loading: false },
      uid: -1,
      articles: [],
      query: { page: 1, limit: 10 }
    }
  },
  created() {
    this.uid = this.$route.query.uid
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
        method: 'get', url: `/articles/${this.uid}/users`, params: this.query
      }).then((res) => {
        if (res.data.ret > 0 && res.data.list.length >= 0) {
          if (method === 'refresh') {
            this.articles = res.data.list
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
  }
}
</script>