<template>
  <div>
    <div v-if="article.postAddr" class="home-cell-postAddr">
        <v-icon class="home-cell-postAddr-icon">place</v-icon>{{ article.postAddr }}
    </div>
    <div class="home-cell-info">
        <v-icon v-if="article.subscribe" class="home-cell-subscribe">star</v-icon>
        <img class="home-cell-avatar" v-lazy="converter.avatarPath(article.avatar)" @click="authorClick ">
        <label class="home-cell-tit" v-html="converter.rn2htmlbr(article.title)" @click="articleClick "></label>
        <label class="home-cell-subtit">{{ article.writetime }} | {{ article.authorname }}</label>
    </div>
    <div v-if="article.type === 'image'" class="home-cell-images">
        <img v-for="(fname, j) in article.images" :key="j" alt="" v-lazy="converter.ossPath(article.writetime, article.Id, fname) + converter.AliOssThumb['img'+ Math.min(3, article.images.length)]" :style="converter.imageStyle(article.images.length)" @click="imgProview(j)" />
    </div>
    <div v-if="article.type === 'video'">
        <video controls="controls" :src="converter.ossPath(article.writetime, article.Id, article.videos[0].fname)" :poster="converter.ossPath(article.writetime, article.Id, article.videos[0].fname) + '?x-oss-process=video/snapshot,t_1000,m_fast'" :style="converter.imageStyle(1)"></video>
    </div>
    <div v-if="article.type === 'rich'" @click="articleClick" class="home-cell-rich">
        <img v-lazy="converter.ossPath(article.writetime, article.Id, article.images[0]) + converter.AliOssThumb['img1']" :style="converter.imageStyle(1)" />
        <div class="home-cell-abstract">{{ article.abstract }}</div>
    </div>
    <div class="home-cell-hotrate">
        <v-btn text icon color="#757575" @click="setLaud">
          <v-icon v-if="article.lauded" color="#ff0000">thumb_up</v-icon>
          <v-icon v-else>thumb_up</v-icon>
          {{ article.lauds }}
        </v-btn>
        <v-btn text icon color="#757575" @click="showComments">
          <v-icon>comment</v-icon>
          {{ article.comments }}
        </v-btn>
        <v-btn text icon color="#757575" @click="setLike">
          <v-icon v-if="article.liked" color="#ff0000">favorite</v-icon>
          <v-icon v-else>star</v-icon>
          {{ article.likes }}
        </v-btn>
    </div>
  </div>
</template>

<script>
import { articleConvert } from "@/utils/tools.js"
import "@/style/cell.scss"

export default {
  props: {
    article: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      converter: articleConvert
    }
  },
  created() {
  },
  methods: {
    setLaud() {
      if (this.article.lauded) return
      this.$Ajax({
        method: 'put', url: `/articles/${this.article.Id}/laud`
      }).then((res) => {
        if (res.data.ret > 0) {
          this.article.lauds++
          this.article.lauded = true
        }
      })
    },
    setLike() {
      if (this.article.liked) return
      if (this.$store.getters.session.uid < 0) {
        this.$router.push({ path: '/auth/login' })
        return
      }
      this.$Ajax({
        method: 'put', url: `/articles/${this.article.Id}/like`
      }).then((res) => {
        if (res.data.ret > 0) {
          this.article.likes++
          this.article.liked = true
        }
      })
    },
    imgProview(index) {
      this.$emit('imgProview', this.article, index)
    },
    showComments() {
      this.$emit('showComments', this.article)
    },
    // 文章明细
    articleClick() {
      this.$router.push({ name: `articles-show-${this.article.type}`, params: { Id: this.article.Id } })
    },
    authorClick() {
      this.$router.push({ path: '/auth/user?uid=' + this.article.authorId })
    },
  }
}
</script>
