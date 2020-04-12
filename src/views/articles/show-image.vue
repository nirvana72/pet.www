<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar ref="navBar">
      <div slot="left"></div>
      <div slot="title">
        <v-btn text icon @click="$refs.navBar.goBack()">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </nj-navigationbar>

    <div class="nj-view-content">
      <div v-if="Article.title !== ''" class="nj-article-show">
        <div class="nj-avatar" @click="authorClick(Article.authorId)">
          <img :src="converter.avatarPath(Article.avatar)">
        </div>
        <h1 class="nj-tit" v-html="converter.rn2htmlbr(Article.title)"></h1>
        <h2 class="nj-author">{{ Article.writetime }} | {{ Article.authorname }}</h2>
        <div class="nj-images">
          <img v-for="(fname, j) in Article.images" :key="j" alt="" :src="converter.ossPath(Article.writetime, Article.Id, fname) + converter.AliOssThumb['img'+ Math.min(3, Article.images.length)]" :style="converter.imageStyle(Article.images.length)" @click="imgClick(Article, j)" />
        </div>
        <div v-if="Article.postAddr !== ''" class="nj-postAddr">
          <v-icon class="nj-place">place</v-icon>{{ Article.postAddr }}
        </div>
      </div>
      <nj-comments v-if="Article.title !== ''" :targetId="Article.Id" :authorId="Article.authorId" />
    </div>

    <VueActivePreview v-if="proviewImg.list.length > 0" :env="$store.getters.device.env" :urlList="proviewImg.list" :startIndex="proviewImg.startIndex" :criticalValue="1/10" @click="proviewImg.list = []" @close="proviewImg.list = []" />

  </div>

</template>

<script>
import "@/style/article.scss"
import { mergeLeft, articleConvert } from '@/utils/tools'
import comments from '@/components/nj-comments.vue'
import VueActivePreview from 'vue-active-preview/src/index.js'

export default {
  name: 'articles-show-image',
  components: {
    'nj-comments': comments,
    VueActivePreview
  },
  data() {
    return {
      converter: articleConvert,
      Article: {
        Id: -1,
        title: '',
        type: 'image',
        authorId: '',
        authorname: '',
        avatar: 1,
        status: 0,
        writetime: '',
        postAddr: '',
        images: []
      },
      proviewImg: {
        startIndex: 0,
        list: []
      }
    }
  },
  created() {
    this.Article.Id = this.$route.params.Id
    if (this.Article.Id) {
      this.getArticle()
    }
  },
  methods: {
    authorClick(authorId) {
      this.$router.push({ path: '/auth/user?uid=' + authorId })
    },
    // 图片预览
    imgClick(article, startIndex) {
      this.proviewImg.startIndex = startIndex
      article.images.forEach(fname => {
        const path = this.converter.ossPath(article.writetime, article.Id, fname)
        this.proviewImg.list.push(path)
      });
    },
    getArticle() {
      this.$Ajax({
        method: 'get', url: '/articles/' + this.Article.Id
      }).then((res) => {
        if (res.data.ret > 0) {
          this.Article = mergeLeft(this.Article, res.data.article)
        }
      })
    }
  }
}
</script>
