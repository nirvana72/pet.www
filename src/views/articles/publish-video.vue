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
      <div v-show="Article.blobFiles.length <= 0" :class="$style.images">
        <div :class="[$style.image, $style.add]">
          <v-btn text icon @click="$refs.videofile.click()">
            <v-icon size="50">add</v-icon>
          </v-btn>
        </div>
        <div v-if="Article.blobFiles == 0" :class="$style.mark">
          <span>视频文件最大支持20M</span>
        </div>
      </div>
      <div v-if="Article.blobFiles.length > 0" style="text-align:center">
        <video ref="videotag" :src="Article.blobFiles[0].oss.local" controls="controls" :style="{'width':videoSize.width,'height':videoSize.height}"></video>
        <v-btn fab dark small color="red" @click="Article.blobFiles.splice(0, 1)">
          <v-icon dark>close</v-icon>
        </v-btn>
      </div>

      <div :class="$style.textarea" style="margin-top:10px">
        <textarea
          v-model="Article.title"
          :rows="3" 
          placeholder="写点什么吧...">
        </textarea>
      </div>
   
      <div class="nj-button-box" style="margin-top:10px">
        <v-btn block color="success" @click="publish()">发布</v-btn>
      </div>
      <form v-show="false" ref="uploadFrom">
        <input ref="videofile" type="file" accept="video/mp4,video/mov" @change="file_onChange()">
      </form>
    </div>
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
    videoSize: function() {
      let w = this.$store.getters.device.width
      let h = w * 9 / 16
      return {        
        width: w + 'px',
        height: h + 'px'
      }
    }
  },
  methods: {
    // input file 组件事件
    file_onChange() {
      for (let i = 0, len = this.$refs.videofile.files.length; i < len; i++) {
        if (this.Article.blobFiles.length >= 1) {
          break
        }
        const file = this.$refs.videofile.files[i]
        const ext = file.name.split('.').pop().toLowerCase()

        if (['mp4', 'mov'].indexOf(ext) < 0) {
          alert(`![${file.name}], 只支持 mp4, mov 文件`)
          break;
        }
        if (file.size > (1024 * 1024 * 20)) {
          let size = (file.size / 1024 / 1024).toFixed(2)
          alert(`size:[${size}M],视频文件最多支持20M以内`)
          return
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
        alert('未添加视频')
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
          type: 'video'
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
    _oss_upload() {
      this.loading.text = '上传视频...'

      const client = new AliOss({
        region: process.env.VUE_APP_oss_region,
        accessKeyId: process.env.VUE_APP_oss_accessKeyId,
        accessKeySecret: process.env.VUE_APP_oss_accessKeySecret,
        bucket: process.env.VUE_APP_oss_bucket
      })
      const file = this.Article.blobFiles[0]
      file.oss.name = `1.${file.oss.ext}`
      file.oss.path = articleConvert.ossPath(this.Article.writetime, this.Article.Id, file.oss.name, false)
      client.put(file.oss.path, file)
        .then(() => {
          this._finish_post()
        })
        .catch(() => {
          this.loading.close()
          alert('上传资源出错')
        })
    },
    _finish_post() {
      this.loading.text = '更新发布状态'
      let media = JSON.stringify({ type: 'video', name: this.Article.blobFiles[0].oss.name, duration: this.$refs.videotag.duration })
      this.$Ajax({
        method: 'put', url: `/articles/${this.Article.Id}/created`,
        data: {
          medias: [media]
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
    width: 100px;
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px #dfdfe1 solid;
    background-color: #ffffff;
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
