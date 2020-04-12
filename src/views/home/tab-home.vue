<template>
  <div class="index-tab-home">
    <nj-scroll ref="scroll" 
      :height="$store.getters.device.content_height" 
      :style="{'background-color':'#E2E2E2'}" 
      :env="$store.getters.device.env" 
      @pulldown="loadlist('refresh')" 
      @pullup="loadlist('load')">

      <div class="nj-top-search">
        <v-text-field v-model.trim="searchString"
          type="search" 
          placeholder="搜索" 
          append-icon="search"
          clear-icon="cancel"
          outlined solo flat clearable hide-details 
          @click:append="search">
        </v-text-field>
      </div>

      <div v-if="$store.getters.device.env == 'mobile'" class="nj-top-bar">
        <a href="/download.html" target="_blank">下载 APP</a>
      </div>

      <nj-cell v-for="(article, index) in articles" :key="index" 
        class="home-cell" 
        :article="article" 
        @showComments="showComments" 
        @imgProview="imgProview">
      </nj-cell>

      <div v-if="ajaxstatus.loaded && articles.length <= 0" class="nj-nodata">
        网络好象有点问题。。。
      </div>

    </nj-scroll>

    <VueActivePreview v-if="proviewImg.list.length > 0" :env="$store.getters.device.env" :urlList="proviewImg.list" :startIndex="proviewImg.startIndex" :criticalValue="1/10" @click="proviewImg.list = []" @close="proviewImg.list = []" />
    
    <v-bottom-sheet v-model="commentsBox.visible">
      <div v-if="commentsBox.visible" class="home-cell-comments" :style="{'height': $store.getters.device.height * 0.7 + 'px'}">
        <nj-comments :targetId="commentsBox.articleId" :authorId="commentsBox.authorId" @posted="comment_posted" style="height:100%" />
      </div>
    </v-bottom-sheet>
  </div>
</template>

<script>
import 'vue-active-preview/dist/VueActivePreview.css'
import VueActivePreview from 'vue-active-preview/src/index.js'
import comments from '@/components/nj-comments.vue'
import cell from '@/views/home/comp-home-cell.vue'
import Scroll from '@/components/scroll/scroll.vue'
import { articleConvert } from "@/utils/tools.js"

export default {
  name: 'index-tab-home',
  components: {
    VueActivePreview,
    'nj-comments': comments,
    'nj-cell': cell,
    'nj-scroll': Scroll
  },
  data() {
    return {
      ajaxstatus: { loaded: false, loading: false },
      articles: [],
      curentArticle: null,
      query: { time: '', limit: 10 },
      searchString: '',
      proviewImg: {
        startIndex: 0,
        list: []
      },
      commentsBox: {
        articleId: -1,
        authorId: -1,
        visible: false
      },
    }
  },
  created() {
    this.loadlist('refresh')
  },
  methods: {
    search() {      
      if (this.searchString && this.searchString !== '') {
        this.$router.push({ name: 'search', params: { searchString: this.searchString } })
      }
    },
    comment_posted() {
      this.curentArticle.comments++
    },
    showComments(article) {
      this.curentArticle = article
      const _this = this
      setTimeout(() => {
        _this.commentsBox.visible = true
        _this.commentsBox.articleId = article.Id
        _this.commentsBox.authorId = article.authorId
      }, 100);
    },
    // 图片预览
    imgProview(article, startIndex) {
      this.proviewImg.startIndex = startIndex
      article.images.forEach(fname => {
        const path = articleConvert.ossPath(article.writetime, article.Id, fname)
        this.proviewImg.list.push(path)
      });
    },
    // method : refresh / load
    loadlist(method) {
      if (this.ajaxstatus.loading) {
        return true
      }
      this.ajaxstatus.loading = true

      if (method === 'refresh') {
        this.query.time = ''
      }
      if (method === 'load') {        
        if (this.$refs.scroll.hasmore === false) {
          return true
        }
        if (this.articles.length > 0) {
          this.query.time = this.articles[this.articles.length - 1].writetime
        }
        if (this.articles.length >= 100) {
          this.articles.splice(0, 80)
        }
      }
      this.$Ajax({
        method: 'get', url: '/articles/', params: this.query
      }).then((res) => {
        if (res.data.ret > 0 && res.data.articles.length >= 0) {
          if (method === 'refresh') {
            this.articles = res.data.articles
          }
          if (method === 'load') {
            this.articles = this.articles.concat(res.data.articles)
          }
          this.$refs.scroll.hasmore = res.data.articles.length === this.query.limit         
        }
      }).finally(() => {
        this.ajaxstatus.loaded = true
        this.ajaxstatus.loading = false
        this.$refs.scroll.loaded()
      })
    }
  }
}
</script>