<template>
  <div class="nj-view nj-view-sub">
    <div v-html="pageStyle"></div>

    <nj-navigationbar ref="navBar">
      <div slot="left"></div>
      <div slot="title">
        <v-btn text icon @click="$refs.navBar.goBack()">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </nj-navigationbar>

    <div class="nj-view-content my-article-edit">
      <div v-show="viewStatus === 'edit'" class="my-edit-box my-edit">
        <div style="margin-top:-1px">
          <v-text-field v-model="Article.title" hide-details placeholder="输入标题..." class="my-title"></v-text-field>
        </div>
        <quill-editor v-model="Content" ref="myQuillEditor" :options="editorOption"></quill-editor>
        <div class="my-btns">
          <v-btn color="success" @click="viewStatus = 'preview'">预览 »</v-btn>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <v-btn color="success" @click="viewStatus = 'code'">代码 »</v-btn>
        </div>
        <form v-show="false" ref="uploadFrom">
          <input ref="imagefile" type="file" accept="image/gif, image/jpeg, image/png" @change="file_onChange('image')">
          <input ref="videofile" type="file" accept="video/mp4,video/mov" @change="file_onChange('video')">
        </form>
      </div>

      <div v-if="viewStatus === 'code'" class="my-edit-box my-code">
        <div class="my-content">
          <textarea v-text="Content" readonly />
          </div>
        <div class="my-btns">
          <v-btn color="success" @click="viewStatus = 'edit'">« 编辑</v-btn>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <v-btn color="success" @click="viewStatus = 'preview'">预览 »</v-btn>
        </div>
      </div>

      <div v-if="viewStatus === 'preview'" class="my-edit-box my-preview">
        <div class="my-content my-preview-box">
          <h2 class="my-preview-title">{{ Article.title }}</h2>
          <div v-html="Content"/>
        </div>
        <div class="my-btns">
          <v-btn color="success" @click="viewStatus = 'edit'">« 修改</v-btn>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <v-btn color="primary" @click="publish()">发布 »</v-btn>
        </div>
      </div>
    </div>
    <nj-loading ref="loading"></nj-loading>
  </div>
</template>

<script>  
import { articleConvert } from "@/utils/tools.js"
import 'quill/dist/quill.snow.css'
import { quillEditor } from 'vue-quill-editor'
import _Quill from 'quill'
import AliOss from 'ali-oss'

export default {
  components: {
    quillEditor
  },
  data() {
    let _this = this
    return {
      pageStyle: '',
      viewStatus: 'edit',
      Content: '',
      Article: {
        Id: -1,
        title: '',
        content: '',
        blobFiles: [],
        writetime: ''
      },
      editorOption: {
        formats: ['underline', 'color', 'background', 'align', 'bold', 'header', 'italic', 'list', 'image', 'video', 'indent'],
        modules: {
          toolbar: {
            container: [
              ['image', 'video'],
              ['bold', 'italic', 'underline'],        // toggled buttons
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent     
              [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme       
              [{ 'align': '' }, { 'align': 'right' }, { 'align': 'center' }, { 'align': 'justify' }],// [{ 'align': [] }],   
              ['clean']
            ],
            handlers: {
              'image': function () {
                _this.$refs.imagefile.click()
              },
              'video': function () {
                _this.$refs.videofile.click()
              }
            }
          },
          clipboard: {
            matchVisual: false
          }
        }
      },
      ossHost: process.env.VUE_APP_oss_host
    }
  },
  created() {
    if (this.$store.getters.device.env === 'pc') {
      this.pageStyle = `<style>.ql-container{top:60px;}</style>`
    } else {
      this.pageStyle = `<style>.ql-toolbar{white-space: nowrap;overflow-x: auto;} .ql-container{top:40px;}</style>`
    }

    if (!_Quill.registerQuillBlot) {
      this.registerQuillBlot()
      _Quill.registerQuillBlot = true
    }
  },
  methods: {
    // input file 组件事件
    file_onChange(fileType) {
      if (this.$refs[fileType + 'file'].files.length <= 0) { return }

      // 文件格式， 文件大小
      const file = this.$refs[fileType + 'file'].files[0]
      const ext = file.name.split('.').pop().toLowerCase()

      if (fileType === 'image') {
        if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) < 0) {
          alert(`![${file.name}], 只支持 jpg,png,gif 文件`)
          return
        }
        if (file.size > (1024 * 1024 * 5)) {
          let size = (file.size / 1024 / 1024).toFixed(2)
          alert(`size:[${size}M],图片文件最多支持5M以内`)
          return
        }
      }
      if (fileType === 'video') {
        if (['mp4', 'mov'].indexOf(ext) < 0) {
          alert('只支持 mp4, mov 文件')
          return
        }
        if (file.size > (1024 * 1024 * 20)) {
          let size = (file.size / 1024 / 1024).toFixed(2)
          alert(`size:[${size}M],视频文件最多支持20M以内`)
          return
        }
      }
      file.oss = {
        id: new Date().getTime(),
        type: fileType,
        ext: file.name.split('.').pop().toLowerCase(),
        url: window.URL.createObjectURL(file)
      }

      // 生成本地目录， 插入正文      
      this.Article.blobFiles.push(file)
      const pos = this.$refs.myQuillEditor.quill.getSelection().index
      this.$refs.myQuillEditor.quill.insertEmbed(pos, file.oss.type, file.oss)

      this.$refs.uploadFrom.reset()
    },
    // 预发布文章
    publish() {
      if (this.Article.title.trim() === '') {
        alert('请输入标题')
        return
      }
      // 资源检测
      this.Article.content = this.Content
      let mediaTags = []
      const vidTags = this.Article.content.match(/<video data-ossid="(.*?)<\/video>/g)
      if (vidTags && vidTags.length > 0) {
        if (vidTags.length > 1) {
          alert('最多添加1个视频')
          return
        }
        mediaTags = mediaTags.concat(vidTags)
      }

      const imgTags = this.Article.content.match(/<img data-ossid="(.*?)(?:>|\/>)/gi)
      if (imgTags === null || imgTags.length <= 0) {
        alert('至少添加1张本地图片作为封面')
        return
      }
      if (imgTags.length > 9) {
        alert('最多添加9张图片')
        return
      }
      mediaTags = mediaTags.concat(imgTags)
      // -------------------------------------------
      // 正则提取属性， 把标签替换成点位符
      if (mediaTags.length > 0) {
        const attrReg = /data-ossid=[\"]?([^\"]*)[\"]?/i
        const refOssIds = []
        mediaTags.forEach(tag => {
          if (this.Article.content.indexOf(tag) >= 0) {
            const attr = tag.match(attrReg)
            this.Article.content = this.Article.content.replace(tag, '{' + attr[1] + '}')
            refOssIds.push(Number(attr[1]))
          }
        })
        // 添加资源又删除标签操作，此处过滤正文中不存在的本地资源
        const refFiles = this.Article.blobFiles.filter((f) => {
          return refOssIds.indexOf(f.oss.id) >= 0
        })
        this.Article.blobFiles = refFiles
      }

      this.loading = this.$refs.loading.loading('正在发布...')
      // 先创建一条记录， 得到记录ID
      this.$Ajax({
        method: 'post', url: '/articles/create',
        data: {
          title: this.Article.title,
          type: 'rich'
        }
      }).then(res => {
        if (res.data.ret > 0) {
          this.Article.Id = res.data.Id
          this.Article.writetime = res.data.writetime
          if (this.Article.blobFiles.length > 0) {
            this._oss_upload()
          } else {
            this._finish_post()
          }
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
        this.loading.text = `上传资源 ${i} / ${len} [${file.oss.type}]`
        await client.put(file.oss.path, file)
        if (file.oss.type === 'image') {
          this.Article.content = this.Article.content.replace('{' + file.oss.id + '}', '<img class="oss-block oss-image" src="' + this.ossHost + file.oss.path + '" />')
        }
        if (file.oss.type === 'video') {
          this.Article.content = this.Article.content.replace('{' + file.oss.id + '}', '<video class="oss-block oss-video" src="' + this.ossHost + file.oss.path + '" controls="controls"></video>')
        }
      }
      this._finish_post()
    },
    _finish_post() {
      this.loading.text = '更新发布状态'
      let pathAry = []
      this.Article.blobFiles.forEach(f => {
        pathAry.push(JSON.stringify({ type: f.oss.type, name: f.oss.name }))
      })
      this.$Ajax({
        method: 'put', url: `/articles/${this.Article.Id}/created`,
        data: {
          content: this.Article.content,
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
    },
    registerQuillBlot() {
      const BlockEmbed = _Quill.import('blots/block/embed')
      // ---------------------------------
      class MyVideo extends BlockEmbed {
        static create(value) {
          const node = document.createElement('video')
          if (typeof value !== 'string') {
            node.setAttribute('data-ossid', value.id)
            node.setAttribute('src', value.url)
          } else {
            node.setAttribute('src', value)
          }
          node.setAttribute('class', 'oss-block oss-video')
          node.setAttribute('controls', 'controls')
          return node
        }
        static value(domNode) {
          return domNode.getAttribute('src')
        }
      }
      MyVideo.blotName = 'video'
      MyVideo.tagName = 'video'
      _Quill.register(MyVideo)
      // ---------------------------------
      class MyImage extends BlockEmbed {
        static create(value) {
          const node = document.createElement('img')
          if (typeof value !== 'string') {
            node.setAttribute('data-ossid', value.id)
            node.setAttribute('src', value.url)
          } else {
            node.setAttribute('src', value)
          }
          node.setAttribute('class', 'oss-block oss-image')
          return node
        }
        static value(domNode) {
          return domNode.getAttribute('src')
        }
      }
      MyImage.blotName = 'image'
      MyImage.tagName = 'img'
      _Quill.register(MyImage)
    }
  }
}
</script>

<style lang="scss">
.my-article-edit {
  .quill-editor {
    position: absolute;
    top: 45px;
    left: 0;
    right: 0;
    bottom: 80px;
    .ql-toolbar {
      border: 0 !important;
      height: 200px;
    }
    .ql-container {
      height: auto !important;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: scroll;
      user-select: text;
      font-size: 16px;
      color: #000;
      background-color: #fff;
      border: 0 !important;
      border-top: 1px solid #e0e0e0 !important;
      border-bottom: 1px solid #e0e0e0 !important;
      p {
        margin-bottom: 15px;
      }
    }
  }

  .my-title {
    color: #000;
    font-weight: bold;
    padding: 0;
    margin: 0;
    .v-input__slot {
      padding: 6px 20px;
      background-color: #fff;
      border-top: 1px #e0e0e0 solid;
      &::before {
        border-color: #e0e0e0 !important;
      }
    }
  }
  .my-edit {
    .oss-block {
      max-height: 80px;
      margin: 20px auto;
      display: block;
    }
    .oss-image {
      border: 1px solid #e2e2e2;
    }
    .oss-video {
      max-height: 150px;
    }
  }
  .my-preview {
    .oss-block {
      width: 100%;
      margin: 20px auto;
      display: block;
    }
    .oss-video {
      max-height: 240px;
    }
    .my-preview-box {
      overflow: scroll;
      width: 100%;
      white-space: normal;
      word-break: break-all;
      word-wrap: break-word;
      padding: 0 20px;
      line-height: 25px;
      font-size: 16px;
      color: #404040;
      background-color: #ffffff;
      margin-top: -1px;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      .my-preview-title {
        padding: 20px 0;
      }
    }
  }
  .my-code {
    textarea {
      width: 100%;
      height: 100%;
      resize: none;
      border: 0;
      border-bottom: 1px solid #e0e0e0;
    }
  }
  .my-edit-box {
    .my-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 80px;
    }
    .my-btns {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      margin-bottom: 20px;
      text-align: center;
    }
  }
}
</style>
