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
        <h1 class="nj-tit">{{ Article.title }}</h1>
        <h2 class="nj-author">{{ Article.writetime }} | {{ Article.authorname }}</h2>
        <div class="nj-content" v-html="Article.content"></div>
        <div v-if="Article.postAddr !== ''" class="nj-postAddr">
          <v-icon class="nj-place">place</v-icon>{{ Article.postAddr }}
        </div>
      </div>
      <nj-comments v-if="Article.title !== ''" :targetId="Article.Id" :authorId="Article.authorId"/>
    </div>
  </div>

</template>

<script>
import "@/style/article.scss"
import { mergeLeft, articleConvert } from '@/utils/tools'
import comments from '@/components/nj-comments.vue'
export default {
  name: 'articles-show-rich',
  components: {
    'nj-comments': comments,
  },
  data() {
    return {
      converter: articleConvert,
      Article: {
        Id: -1,
        title: '',
        type: 'rich',
        authorId: '',
        authorname: '',
        avatar: 1,
        status: 0,
        writetime: '',
        postAddr: '',
        content: ''
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
