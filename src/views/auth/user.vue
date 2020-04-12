<template>
  <div class="nj-view nj-view-sub">

    <nj-navigationbar title="个人信息"></nj-navigationbar>

    <div v-if="user.account !== ''" class="nj-view-content">
      <div :class="$style.avatar">
        <v-btn v-if="isSelf" text icon color="primary" :class="$style['my-btn']" @click="meUpdate('avatar', '头像')">
          <v-icon>autorenew</v-icon>
        </v-btn>
        <img :src="converter.avatarPath(user.avatar, false)">
      </div>
      <div :class="$style.profile">
        {{ user.profile }}
      </div>
      <div v-if="!isSelf" style="text-align:center">
        <v-btn v-if="!user.subscribed" rounded color="success" @click="subscribe(true)">
          <v-icon left>star</v-icon>关注
        </v-btn>
        <v-btn v-else rounded color="pink" @click="subscribe(false)">
          <v-icon left color="#ffffff">star</v-icon><span style="color:#ffffff">取消关注</span>
        </v-btn>
      </div>
      <v-list :class="$style.form">
        <v-list-item>
          <v-list-item-content>
            <label>用户ID</label>
            <span>{{ user.uid }}</span>
          </v-list-item-content>
          <v-list-item-action v-if="isSelf" :class="$style.action">
          </v-list-item-action>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <label>账号</label>
            <span>{{ user.account }}</span>
          </v-list-item-content>
          <v-list-item-action v-if="isSelf" :class="$style.action">
          </v-list-item-action>
        </v-list-item>
        <v-list-item button :ripple="false" @click="meUpdate('nickname', '昵称')">
          <v-list-item-content>
            <label>昵称</label>
            <span>{{ user.nickname }}</span>
          </v-list-item-content>
          <v-list-item-action v-if="isSelf" :class="$style.action">
            <v-icon size="24">keyboard_arrow_right</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item button :ripple="false" @click="meUpdate('email', '电子邮箱')">
          <v-list-item-content>
            <label>电子邮箱</label>
            <span>{{ user.email }}</span>
          </v-list-item-content>
          <v-list-item-action v-if="isSelf" :class="$style.action">
            <v-icon size="24">keyboard_arrow_right</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item button :ripple="false" @click="meUpdate('mobile', '手机号码')">
          <v-list-item-content>
            <label>手机号码</label>
            <span>{{ user.mobile }}</span>
          </v-list-item-content>
          <v-list-item-action v-if="isSelf" :class="$style.action">
            <v-icon size="24">keyboard_arrow_right</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="isSelf" button :ripple="false" @click="meUpdate('password', '密码')">
          <v-list-item-content>
            <label>修改密码</label>
          </v-list-item-content>
          <v-list-item-action :class="$style.action">
            <v-icon size="24">keyboard_arrow_right</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="isSelf" button :ripple="false" @click="meUpdate('profile', '简介')">
          <v-list-item-content>
            <label>简介</label>
          </v-list-item-content>
          <v-list-item-action :class="$style.action">
            <v-icon size="24">keyboard_arrow_right</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item button :ripple="false" @click="user_articles()">
          <v-list-item-content>
            <label>发布动态</label>
            <span>{{ user.articles }}</span>
          </v-list-item-content>
          <v-list-item-action :class="$style.action">
            <v-icon size="24">keyboard_arrow_right</v-icon>
          </v-list-item-action>
        </v-list-item>
        <v-list-item button :ripple="false">
          <v-list-item-content>
            <label>粉丝</label>
            <span>{{ user.fans }}</span>
          </v-list-item-content>
          <v-list-item-action :class="$style.action">
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>

<script>
import { mergeLeft, articleConvert } from "@/utils/tools.js"
export default {
  data() {
    return {
      isSelf: false,
      user: {
        uid: -1,
        account: '',
        nickname: '',
        profile: '',
        email: '',
        mobile: '',
        avatar: 1,
        subscribed: false,
        articles: 0,
        fans: 0
      },
      converter: articleConvert
    }
  },
  created() {
    this.user.uid = this.$route.query.uid || this.$store.getters.session.uid
    if (this.user.uid === this.$store.getters.session.uid) {
      this.isSelf = true
    }
    this.getUserInfo(this.user.uid)
  },
  methods: {
    subscribe(flag) {
      if (this.$store.getters.session.uid < 0) {
        this.$router.push({ path: '/auth/login' })
        return
      }
      let _method = flag ? 'put' : 'delete'
      this.$Ajax({
        method: _method, url: `/subscribes/${this.user.uid}`
      }).then((res) => {
        if (res.data.ret > 0) {
          this.user.subscribed = flag
        }
      })
    },
    getUserInfo(uid) {
      this.$Ajax({
        method: 'get', url: `/users/${uid}`
      }).then((res) => {
        this.user = mergeLeft(this.user, res.data.user)
      })
    },
    meUpdate(key, tit) {
      if (!this.isSelf) { return }
      switch (key) {
        case 'avatar':
          this.$router.push({ name: 'auth-user-avatar', params: { avatar: this.user.avatar } })
          break
        case 'password':
          this.$router.push({ name: 'auth-user-password' })
          break
        default:
          this.$router.push({ name: 'auth-user-update', params: { tit, key, val: this.user[key] } })
      }
    },
    user_articles() {
      this.$router.push({ path: '/articles/user-articles', query: { uid: this.user.uid } })
    }
  }
};
</script>

<style lang="scss" module>
.avatar {
  padding: 20px 0px;
  text-align: center;
  background-color: #ffffff;  
  position: relative;
  img {
    width: 160px;
    height: 160px;
    border-radius: 50%;
  }
  .my-btn {
    position: absolute;
    right: 0;
    top: 0;
  }
}
.profile {
  padding: 20px;
}
.form {
  background: unset !important;
  div[role="listitem"] {
    border-top: 1px #efeff4 solid;
    background-color: #ffffff;
    label {
      font-weight: bold;
    }
  }
  .action {
    min-width: 30px;
    justify-content: unset;
  }
}
</style>