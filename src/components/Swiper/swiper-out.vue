<template>
  <div class="r-swiper-out" ref="swiperOut">
    <slot></slot>
  </div>
</template>

<script>
export default{
  data () {
    return {
      activeItem: null
    }
  },
  methods: {
    changeActiveItem (item) {
      if (this.activeItem === item) return
      if (this.activeItem && this.activeItem.close) {
        this.activeItem.close()
      }
      this.activeItem = item
    },
    childRemove (childNode) {
      // this.$refs.swiperOut.removeChild(childNode)
      this.$emit('onremove', childNode)
    }
  },
  created () {
    this.$on('changeActiveItem', this.changeActiveItem)
    this.$on('childRemove', this.childRemove)
  }
}
</script>

<style>
.r-swiper-out{
	position: relative;
	width: 100%;
	overflow: hidden;
}
</style>
