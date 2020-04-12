<template>
  <div class="nj-view nj-view-sub">
    <slot v-once name="appbar">
      <div v-if="$route.meta.bar === 'back'" class="nj-bar">
        <v-btn icon class="left" @click="goBack">
          <v-icon>arrow_back_ios</v-icon>
        </v-btn>
        <label>{{ realtitle }}</label>
      </div>
      <div v-else class="nj-bar">
        <v-btn icon @click="goBack">
          <v-icon>close</v-icon>
        </v-btn>
      </div>
    </slot>
    <div class="nj-content" :style="{'height':$store.getters.device.content_height + 'px'}">
      <slot></slot>
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
