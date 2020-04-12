<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar title="修改密码"></nj-navigationbar>

    <div class="nj-view-content">
      <div class="nj-input-box" style="margin-top:50px;">
        <v-text-field v-model.trim="pwd_old" hide-details placeholder="当前密码"></v-text-field>
        <v-text-field v-model.trim="pwd_new" hide-details placeholder="新的密码"></v-text-field>
        <v-text-field v-model.trim="pwd_new_confrim" hide-details placeholder="确认密码"></v-text-field>
      </div>
      <div class="nj-button-box">
        <v-btn block color="success" @click="update">确定</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pwd_old: '',
      pwd_new: '',
      pwd_new_confrim: ''
    }
  },
  methods: {
    update() {
      if (this.pwd_old === '' || this.pwd_new === '') {
        return
      }
      if (this.pwd_new !== this.pwd_new_confrim) {
        alert('两次密码输入不一致')
        return
      }
      this.$Ajax({
        method: 'put', url: '/users/changepassowrd',
        data: {
          old: this.pwd_old,
          new: this.pwd_new
        }
      }).then((res) => {
        if (res.data.ret > 0) {
          alert('修改成功')
        }
      })
    }
  }
}
</script>