<template>
  <div class="nj-navigationbar" :style="{'width':$store.getters.device.width + 'px'}">
    <div class="nj-nav-title">
      <slot name="title">
        <label>{{ realtitle }}</label>
      </slot>
    </div>
    <div class="nj-nav-left">
      <slot name="left">
        <v-btn icon @click="goBack">
          <v-icon>keyboard_arrow_left</v-icon>
        </v-btn>
      </slot>
    </div>
    <div class="nj-nav-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    }
  },
  data: function () {
    return {
      realtitle: this.title
    }
  },
  created() {
    if (this.realtitle === '') {
      this.realtitle = this.$route.meta.title;
    }
  },
  methods: {
    goBack() {
      sessionStorage.setItem('app-isgoback', true)
      this.$router.back(-1)
    }
  }
}
</script>
