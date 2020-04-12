<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar title="登录">
      <div slot="right">
        <v-btn text color="primary" @click="$router.push({path: '/auth/register'})">注册</v-btn>
      </div>
    </nj-navigationbar>

    <div class="nj-view-content">
      <div class="nj-input-box" style="margin-top:20px">
        <v-text-field v-model="loginForm.account" hide-details placeholder="账号/邮箱/手机" prepend-inner-icon="account_circle"></v-text-field>
        <v-text-field v-model="loginForm.password" hide-details placeholder="密码" type="password" prepend-inner-icon="lock"></v-text-field>
      </div>
      <div class="nj-button-box" style="margin-top:10px;">
        <v-btn block color="success" @click="submit">确定</v-btn>
      </div>
    </div>
    <nj-loading ref="loading"></nj-loading>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        account: "",
        account_type: "account",
        password: ""
      }
    };
  },
  created() {
    this.loginForm.account = localStorage.getItem("app-lastloginname") || ""
  },
  methods: {
    submit() {
      if (this.loginForm.account.trim() === "") {
        alert("账号不能为空");
        return;
      }
      if (this.loginForm.password.length < 6) {
        alert("密码格式不正确, 长度在6~18位任意字符");
        return;
      }

      this.loginForm.account_type = "account";
      if (
        /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(
          this.loginForm.account
        )
      )
        this.loginForm.account_type = "email";
      if (
        /^(13[0-9]|14[0-9]|15[0-9]|166|17[0-9]|18[0-9]|19[8|9])\d{8}$/.test(
          this.loginForm.account
        )
      )
        this.loginForm.account_type = "mobile";

      this.loading = this.$refs.loading.loading();
      this.$Ajax({
        method: "post",
        url: "/users/login",
        data: {
          account: this.loginForm.account,
          account_type: this.loginForm.account_type,
          pwd: this.loginForm.password
        }
      }).then(res => {
        if (res.data.ret > 0) {
          localStorage.setItem("app-lastloginname", this.loginForm.account);
          this.$store.commit("setSession", res.data);
          alert(`欢迎您 ${res.data.nickname}`);
          this.$router.back(-1);
        }
      }).finally(() => {
        this.loading.close();
      });
    }
  }
};
</script>
