<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar :title="tit"></nj-navigationbar>

    <div class="nj-view-content">
      <div class="nj-input-box" style="margin-top:20px">
        <v-textarea :rows="rows" hide-details v-model="val" :placeholder="tit"></v-textarea>
      </div>
      <div class="nj-button-box" style="margin-top:10px">
        <v-btn block color="success" @click="update">确定</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      key: '',
      val: '',
      tit: '',
      rows: 1
    }
  },
  created() {
    this.key = this.$route.params.key
    this.val = this.$route.params.val
    this.tit = this.$route.params.tit
    if (this.key === 'profile') {
      this.rows = 3
    }
  },
  methods: {
    update() {
      this.$Ajax({
        method: 'put', url: '/users/',
        data: {
          key: this.key,
          val: this.val
        }
      }).then((res) => {
        if (res.data.ret > 0) {
          if (this.key == 'nickname') {
            this.$store.commit('setSession', {'nickname': this.val})
          }          
          alert('修改成功')
        }
      }).catch((e) => {
        alert(e)
      })
    }
  }
}
</script>