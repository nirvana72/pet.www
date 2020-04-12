<template>
  <div class="nj-view nj-view-sub">
    <div v-html="pageStyle"></div>
    <nj-navigationbar title="修改头像" ref="navBar">
      <div slot="right">
        <v-btn text color="primary" @click="save()">保存</v-btn>
      </div>
    </nj-navigationbar>

    <div class="nj-view-content">
      <div :class="$style.avatar">
        <img :src="avatarUrl">
      </div>
      <div :class="$style['avatar-list']">
        <div v-for="index in 34" :key="index" class="auth-user-avatar" @click="avatar_click(index)">
          <img :src="ossHost + '/avatar/' + index + '.png'">
        </div>
      </div>
      <div style="text-align:center;padding:20px 0;">
        <v-btn color="success" @click="$refs.imagefile.click()">打开像册</v-btn>
      </div>
      <form v-show="false" ref="uploadFrom">
        <input ref="imagefile" type="file" accept="image/gif, image/jpeg, image/png" @change="file_onChange()">
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
      pageStyle: '',
      avatar: this.$route.params.avatar,
      blobFiles: [],
      hasChange: false,
      ossHost: process.env.VUE_APP_oss_host
    }
  },
  computed: {
    avatarUrl: function () {
      if (this.blobFiles.length === 1) {
        return this.blobFiles[0].oss.url
      } else {
        return articleConvert.avatarPath(this.avatar, false)
      }
    }
  },
  created() {
    let imgSize = Math.floor(this.$store.getters.device.width / 4) - 20
    this.pageStyle = `<style>.auth-user-avatar{width:${imgSize}px;height:${imgSize}px;margin:10px;}</style>`
  },
  methods: {
    avatar_click(index) {
      this.avatar = index
      this.hasChange = this.$route.params.avatar !== index
    },
    file_onChange() {
      if (this.$refs.imagefile.files.length !== 1) {
        return
      }
      const file = this.$refs.imagefile.files[0]
      const ext = file.name.split('.').pop().toLowerCase()

      if (['jpg', 'jpeg', 'png', 'gif'].indexOf(ext) < 0) {
        alert(`![${file.name}], 只支持 jpg,png,gif 文件`)
        return;
      }
      if (file.size > (1024 * 1024 * 2)) {
        let size = (file.size / 1024 / 1024).toFixed(2)
        alert(`size:[${size}M],图片文件最多支持2M以内`)
        return;
      }
      file.oss = {
        url: window.URL.createObjectURL(file)
      }
      this.avatar = this.$store.getters.session.uid
      this.blobFiles = []
      this.blobFiles.push(file)
      this.hasChange = true
      this.$refs.uploadFrom.reset()
    },
    save() {
      if (this.hasChange) {
        if (this.avatar > 100 && this.blobFiles.length > 0) {
          this._oss_upload()
        } else {
          this._changeSubmit()
        }
      } else {
        this.$refs.navBar.goBack()
      }
    },
    _oss_upload() {
      this.loading = this.$refs.loading.loading()
      const client = new AliOss({
        region: process.env.VUE_APP_oss_region,
        accessKeyId: process.env.VUE_APP_oss_accessKeyId,
        accessKeySecret: process.env.VUE_APP_oss_accessKeySecret,
        bucket: process.env.VUE_APP_oss_bucket
      })
      async function _aliput(_this) {
        const file = _this.blobFiles[0]
        const groupId = Math.floor(_this.avatar / 1000) * 1000
        const osspath = `avatar/${groupId}/${_this.avatar}.png`
        await client.put(osspath, file)
        _this._changeSubmit()
      }
      _aliput(this)
    },
    _changeSubmit() {
      this.$Ajax({
        method: 'put', url: '/users/', data: { key: 'avatar', val: this.avatar }
      }).then((res) => {
        if (res.data.ret > 0) {
          this.$store.commit('setSession', { avatar: this.avatar })
          alert('修改成功')
          this.$refs.navBar.goBack()
        }
      }).finally(() => {
        this.loading && this.loading.close()
      })
    }
  }
}
</script>

<style lang="scss" module>
.avatar {
  padding: 20px 0px;
  text-align: center;
  background-color: #ffffff;
  margin: 20px 0px;
  img {
    width: 120px;
    height: 120px;
    border-radius: 60px;
  }
}
.avatar-list {
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  img {
    width: 100%;
    border-radius: 50%;
  }
}
</style>