<template>
  <div :class="$style.cell" @mouseover="showDelBtn = true"  @mouseleave="showDelBtn = false">
    <div :class="$style.images">
      <img v-if="article.type === 'image'" :src="converter.ossPath(article.writetime, article.Id, article.images[0]) + converter.AliOssThumb['img3']"/>
      <img v-if="article.type === 'video'" :src="converter.ossPath(article.writetime, article.Id, article.videos[0].fname) + converter.AliOssThumb['video']" />
      <img v-if="article.type === 'rich'" :src="converter.ossPath(article.writetime, article.Id, article.images[0]) + converter.AliOssThumb['img3']"/>
    </div>
    <v-btn v-if="action === 'likes' && $store.getters.device.env === 'pc'" 
      v-show="showDelBtn" fab small 
      :class="$style.remove" 
      @click="removeHandler(article.Id)">
      <v-icon color="#ff0000">delete_forever</v-icon>
    </v-btn>
    <div :class="$style.typeicon">
      <v-icon v-if="article.type === 'video'">videocam</v-icon>
      <v-icon v-if="article.type === 'image'">image</v-icon>
      <v-icon v-if="article.type === 'rich'">description</v-icon>
    </div>
    <div :class="$style.info">      
      <label :class="$style.tit" @click="aritleClick(article)">
        <span v-if="article.status != 2">
          <span v-if="article.status == 1" style="color:#03A9F4">[审]</span>
          <span v-else-if="article.status == 10" style="color:#F44336">[拒]</span>
          <span v-else style="color:#FF9800">[错]</span>
        </span>
        {{ article.title.length > 30 ? article.title.substr(0, 30) + '...' : article.title }}
      </label>
      <label v-if="action === 'likes'">😃 {{ article.authorname }}</label>      
      <label>{{ article.writetime }}</label>
      <div v-if="action === 'my' || action === 'users'" :class="$style.hot">        
        <div>
          <v-icon>thumb_up</v-icon> {{ article.lauds }}
        </div>
        <div>
          <v-icon>comment</v-icon> {{ article.comments }}
        </div>
        <div>
          <v-icon>star</v-icon> {{ article.likes }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { articleConvert } from "@/utils/tools.js"
export default {
  props: {
    article: null,
    action: null,
  },
  data() {
    return {
      showDelBtn: false,
      converter: articleConvert
    }
  },
  methods: {
    // 文章明细
    aritleClick(article) {
      this.$emit('aritleClick', article)
    },
    removeHandler(AId) {
      this.$emit('onremove', AId)
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
  .remove {
    position: absolute;
    top: 15px;
    right: 0px;
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
  div.hot {
    display: flex;
    > div {
      padding-right: 10px;
    }
    i {
      font-size: 16px;
    }
  }
}
</style>
