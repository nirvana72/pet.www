<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar title="搜索结果"></nj-navigationbar>

    <div class="nj-view-content">

      <div v-for="(article, i) in articles" :key="i" :class="$style.cell">
        <div :class="$style.images">
          <img v-if="article.type === 'image'" :src="converter.ossPath(article.writetime, article.Id, article.images[0]) + converter.AliOssThumb['img3']"/>
          <img v-if="article.type === 'video'" :src="converter.ossPath(article.writetime, article.Id, article.videos[0].fname) + converter.AliOssThumb['video']" />
          <img v-if="article.type === 'rich'" :src="converter.ossPath(article.writetime, article.Id, article.images[0]) + converter.AliOssThumb['img3']"/>
        </div>        
        <div :class="$style.typeicon">
          <v-icon v-if="article.type === 'video'">videocam</v-icon>
          <v-icon v-if="article.type === 'image'">image</v-icon>
          <v-icon v-if="article.type === 'rich'">description</v-icon>
        </div>
        <div :class="$style.info">      
          <label :class="$style.tit" @click="aritleClick(article)">          
            {{ article.title.length > 30 ? article.title.substr(0, 30) + '...' : article.title }}
          </label>
          <label>😃 {{ article.authorname }}</label>      
          <label>{{ article.writetime }}</label>
        </div>
      </div>

      <div v-if="ajaxstatus.loaded && articles.length <= 0" class="nj-nodata">
        没有找到搜索内容
      </div>
    </div>
  </div>
</template>

<script>
import { articleConvert } from "@/utils/tools.js"

export default {
  name: 'search',
  data() {
    return {
      converter: articleConvert,
      ajaxstatus:{ loaded: false },
      articles: [],
      query: { search: '', limit: 10 }
    }
  },
  created() {
    this.query.search = this.$route.params.searchString
    this.loadlist()
  },
  methods: {       
    loadlist() { 
      this.$Ajax({
        method: 'get', url: '/articles/', params: this.query
      }).then((res) => {
        if (res.data.ret > 0 && res.data.articles.length >= 0) {
          this.articles = res.data.articles
        }
      }).finally(() => {
        this.ajaxstatus.loaded = true
      })
    },
    // 文章明细
    aritleClick(article) {
      this.$router.push({ name: `articles-show-${article.type}`, params: { Id: article.Id } })
    }
  }
}
</script>

<style lang="scss" module>
.cell {
  margin: -1px 10px 0 10px;
  padding: 10px 0;
  min-height: 80px;
  border-top: 1px #e0e0e0 solid;
  border-bottom: 1px #e0e0e0 solid;
  position: relative;
  .images {
    position: absolute;
    float: left;
    img {
      width: 60px;
      height: 60px;
      border-radius: 4px;
    }
  }
  .typeicon {
    position: absolute;
    top: 10px;
    left: 0px;
    i {
      font-size: 18px;
      color: #ffffff;
    }
  }
  .info {
    font-size: 0.9em;
    margin-left: 70px;
    label {
      display: block;
    }
    label.tit {
      padding-bottom: 2px;
      color: #000000;
    }
  }
}
</style>