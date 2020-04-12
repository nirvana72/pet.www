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
      <div :class="$style.images">
        <div v-for="(file, index) in Article.blobFiles" :key="index" :class="$style.image" :style="{'width':imageWH.width + 'px', 'height':imageWH.height + 'px'}">
          <img :src="file.oss.local" :style="{'max-width':imageWH.width-2+'px', 'max-height':imageWH.height-2+'px'}" />
          <v-btn text icon small color="red" :class="$style.del" @click="Article.blobFiles.splice(index, 1)">
            <v-icon>cancel</v-icon>
          </v-btn>
        </div>
        <div v-if="Article.blobFiles.length < 9" :class="[$style.image, $style.add]" :style="{'width':imageWH.width + 'px', 'height':imageWH.height + 'px'}">
          <v-btn text icon @click="$refs.imagefile.click()">
            <v-icon size="50">add</v-icon>
          </v-btn>
        </div>
        <div v-if="Article.blobFiles == 0" :class="$style.mark">
          <span>图片文件最大支持5M</span>
        </div>
        <div style="clear:both"></div>
      </div>

      <div :class="$style.textarea">
        <textarea
          v-model="Article.title"
          :rows="3" 
          placeholder="写点什么吧...">
        </textarea>
      </div>

      <div class="nj-button-box" style="margin-top:10px">
        <v-btn block color="success" @click="publish()">发布</v-btn>
      </div>
    </div>

    <form v-show="false" ref="uploadFrom">
      <input ref="imagefile" type="file" accept="image/gif, image/jpeg, image/png" multiple="multiple" @change="file_onChange()">
    </form>
    <nj-loading ref="loading"></nj-loading>
  </div>
</template>

<script>
import { articleConvert } from "@/utils/tools.js"
import AliOss from 'ali-oss'

export default {
  data() {
    return {
      Article: {
        Id: '',
        title: '',
        blobFiles: [],
        writetime: ''
      }
    }
  },
  computed: {
    imageWH: function () {
      let width = this.$store.getters.device.width
      width = width - 20 - 10 //padding screen left 20 right 10
      width = Math.floor(width / 3)
      width = width - 10 //padding pre right side
      let height = width;// Math.floor(480 * width / 640) // 等比取高
      return { width: width, height: height }
    }
  },
  methods: {
    // input file 组件事件
    file_onChange() {
      for (let i = 0, len = this.$refs.imagefile.files.length; i < len; i++) {
        if (this.Article.blobFiles.length >= 9) {
          break
        }
        const file = this.$refs.imagefile.files[i]
        const ext = file.name.split('.').pop().toLowerCase()

        if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) < 0) {
          alert(`![${file.name}], 只支持 jpg,png,gif 文件`)
          break;
        }
        if (file.size > (1024 * 1024 * 5)) {
          let size = (file.size / 1024 / 1024).toFixed(2)
          alert(`size:[${size}M],图片文件最多支持5M以内`)
          break;
        }
        file.oss = {
          ext,
          local: window.URL.createObjectURL(file)
        }
        this.Article.blobFiles.push(file)
      }

      this.$refs.uploadFrom.reset()
    },
    publish() {
      if (this.Article.blobFiles.length < 1) {
        alert('请至少选择一张图片')
        return
      }

      if (this.Article.title.trim() === '') {
        alert('写点什么吧...')
        return
      }

      this.loading = this.$refs.loading.loading('正在发布...')
      // 先创建一条记录， 得到记录ID
      this.$Ajax({
        method: 'post', url: '/articles/create',
        data: {
          title: this.Article.title,
          type: 'image'
        }
      }).then(res => {
        if (res.data.ret > 0) {
          this.Article.Id = res.data.Id
          this.Article.writetime = res.data.writetime
          this._oss_upload()
        } 
      }).finally(() => {
        this.loading.close()
      })
    },
    // 阿里ossAPI 上传资源
    _oss_upload: async function () {
      const client = new AliOss({
        region: process.env.VUE_APP_oss_region,
        accessKeyId: process.env.VUE_APP_oss_accessKeyId,
        accessKeySecret: process.env.VUE_APP_oss_accessKeySecret,
        bucket: process.env.VUE_APP_oss_bucket
      })
      for (let i = 1, len = this.Article.blobFiles.length; i <= len; i++) {
        const file = this.Article.blobFiles[i - 1]
        file.oss.name = `${i}.${file.oss.ext}`
        file.oss.path = articleConvert.ossPath(this.Article.writetime, this.Article.Id, file.oss.name, false)
        this.loading.text = `上传图片 ${i} / ${len}`
        await client.put(file.oss.path, file)
      }
      this._finish_post()
    },
    _finish_post() {
      this.loading.text = '更新发布状态'
      let pathAry = []
      this.Article.blobFiles.forEach(f => {
        pathAry.push(JSON.stringify({ type: 'image', name: f.oss.name }))
      })
      this.$Ajax({
        method: 'put', url: `/articles/${this.Article.Id}/created`,
        data: {
          medias: pathAry
        }
      }).then(res => {
        if (res.data.ret > 0) {
          alert('发布成功')
          this.$router.back()
        }
      }).finally(() => {
        this.loading.close()
      })
    }
  }
}
</script>

<style lang="scss" module>
.images {
  margin-top: 20px;
  padding: 0 10px 0 20px;
  .image {
    position: relative;
    margin: 0 10px 10px 0;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px #dfdfe1 solid;
    background-color: #ffffff;
    img {
      z-index: 1;
    }
    .del {
      position: absolute;
      top: -15px;
      right: -15px;
      padding: 0px;
      width: 20px;
      height: 20px;
      z-index: 2;
    }
  }
  .add {
    border: 1px #c0c0c0 dashed;
    button {
      width: 100%;
      height: 100%;
    }
  }
  .mark {
    position: absolute;
    left:150px;
    top:55px;
  }
}
.textarea {
  margin: 0 20px;
  textarea {
    width: 100%;
    padding:5px;
    background-color: #ffffff;
    border: 1px solid #c0c0c0;
    border-radius: 4px;
  }  
}
</style>
