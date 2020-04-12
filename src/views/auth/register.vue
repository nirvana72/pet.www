<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar title="注册"></nj-navigationbar>

    <div class="nj-view-content">
      <div :class="$style['app-select-box']" style="margin-top:50px">
        <v-btn fab dark small color="primary" @click="regForm.reg_type = 'account'">
          <v-icon>account_circle</v-icon>
        </v-btn>
        <v-btn fab dark small color="#E91E63" @click="regForm.reg_type = 'email'">
          <v-icon>email</v-icon>
        </v-btn>
        <v-btn fab dark small color="#009688" @click="regForm.reg_type = 'mobile'">
          <v-icon>smartphone</v-icon>
        </v-btn>
      </div>
      <div class="nj-input-box" style="margin-top:50px">
        <v-text-field v-show="regForm.reg_type === 'account'" v-model="regForm.account" hide-details placeholder="账号注册" prepend-inner-icon="account_circle"></v-text-field>

        <v-text-field v-show="regForm.reg_type === 'email'" v-model="regForm.email" hide-details placeholder="邮箱地址注册" prepend-inner-icon="email"></v-text-field>

        <v-text-field v-show="regForm.reg_type === 'mobile'" v-model="regForm.mobile" hide-details placeholder="手机号码注册" prepend-inner-icon="smartphone"></v-text-field>

        <v-text-field type="password" v-model="regForm.password" hide-details placeholder="密码" prepend-inner-icon="lock"></v-text-field>

        <v-text-field v-show="regForm.password !== ''" type="password" v-model="regForm.password_confirm" hide-details placeholder="确认密码" prepend-inner-icon="lock"></v-text-field>
      </div>
      <div class="nj-button-box" style="margin-top:10px;">
        <v-btn block color="warning" @click="register()">注册</v-btn>
      </div>
    </div>
    <nj-loading ref="loading"></nj-loading>
  </div>
</template>

<script>
export default {
  data() {
    return {
      regForm: {
        account: "",
        email: "",
        mobile: "",
        reg_type: "account",
        password: "",
        password_confirm: ""
      }
    };
  },
  methods: {
    verify(elname) {
      let flag = true;
      switch (elname) {
        case "account": {
          flag = /^[a-zA-Z0-9_\u4e00-\u9fa5]{6,18}$/.test(this.regForm.account);
          if (!flag) {
            alert("账号格式不正确, 6~18位中英文数字下划线");
          }
          break;
        }
        case "email": {
          flag = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(
            this.regForm.email
          );
          if (!flag) {
            alert("邮箱格式不正确");
          }
          break;
        }
        case "mobile": {
          flag = /^(13[0-9]|14[0-9]|15[0-9]|166|17[0-9]|18[0-9]|19[8|9])\d{8}$/.test(
            this.regForm.mobile
          );
          if (!flag) {
            alert("手机格式不正确");
          }
          break;
        }
        case "password": {
          flag = /^.{6,18}$/.test(this.regForm.password);
          if (!flag) {
            alert("密码格式不正确, 长度在6~18之间,任意字符");
          }

          if (flag) {
            flag = this.regForm.password === this.regForm.password_confirm;
            if (!flag) {
              alert("两次密码输入不一至");
            }
          }

          break;
        }
      }
      return flag;
    },
    register() {
      if (this.verify(this.regForm.reg_type) === false) {
        return;
      }
      if (this.verify("password") === false) {
        return;
      }

      this.loading = this.$refs.loading.loading();
      this.$Ajax({
        method: "post",
        url: "/users/",
        data: {
          account: this.regForm[this.regForm.reg_type],
          reg_type: this.regForm.reg_type,
          pwd: this.regForm.password
        }
      }).then(res => {
        if (res.data.ret > 0) {
          localStorage.setItem("app-lastloginname", this.regForm.account);
          this.$store.commit("setSession", res.data);
          alert(`欢迎您 ${res.data.nickname}`);
          this.$router.push({ path: "/" });
        }
      }).finally(() => {
        this.loading.close();
      });
    }
  }
};
</script>

<style lang="scss" module>
.app-select-box {
  padding-top: 20px;
  text-align: center;
  button {
    margin: 0px 10px;
  }
}
</style>