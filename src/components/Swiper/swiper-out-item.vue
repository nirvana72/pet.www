<template>
  <div class="r-swiper-out-item" :style="itemStyle">
    <div class="r-swiper-out-item-content" ref="content"
    @touchstart="touchstart"
    @touchmove="touchmove"
    @touchend="touchend">
      <slot></slot>
    </div>
    <div class="r-swiper-out-item-btns" ref="btns">
      <slot name="btns">
        <div class="r-swiper-out-item-btn" @click="delItem">
          <v-icon color="#ffffff">delete_forever</v-icon>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
export default{
  data () {
    return {
      speed: 200,
      translateX: 0,
      oldPoint: null,
      btnsWidth: 100,
      active: false,
      moveX: 0
    }
  },
  computed: {
    itemStyle () {
      return {
        transform: `translate3d(${this.translateX}px, 0, 0)`,
        transition: `all ${this.speed}ms`
      }
    }
  },
  methods: {
    touchstart (e) {
      this.oldPoint = e.touches[0]
      this.speed = 0
      this.moveX = 0
    },
    touchmove (e) {
      let _moveX = e.touches[0].pageX - this.oldPoint.pageX
      let _moveY = e.touches[0].pageY - this.oldPoint.pageY
      if (Math.abs(_moveX) < Math.abs(_moveY) || Math.abs(_moveX) < 20 || Math.abs(_moveY) > 30) return

      e.preventDefault()
      this.$parent.$emit('changeActiveItem', this)
      this.moveX = _moveX
      _moveX = _moveX * 0.2
      if(this.active === false){
        _moveX = _moveX < -this.btnsWidth ? -this.btnsWidth : _moveX
        _moveX = _moveX > 0 ? 0 : _moveX        
        this.translateX = _moveX
      }
      else{
        _moveX = _moveX < 0 ? 0 : _moveX
        _moveX = _moveX > this.btnsWidth ?  this.btnsWidth : _moveX
        this.translateX = _moveX - this.btnsWidth
      }
    },
    touchend () {
      this.speed = 200
      if(this.moveX !== 0){
        this.active = this.moveX < 0
        this.translateX = this.active ?  -this.btnsWidth : 0
      }
    },
    close () {
      this.translateX = 0
    },
    delItem () {
      this.$parent.$emit('childRemove', this.$el)
    }
  }
}
</script>

<style lang="scss">
.r-swiper-out-item{
  position: relative;
  .r-swiper-out-item-btns{
		position: absolute;
		right: 0;
		top:0;
		height: 100%;
    padding-bottom: 1px;
		transform: translateX(100%);
  }
  .r-swiper-out-item-btn{
    background-color: red;
		color: #fff;
    width: 100px;
    height: 100%;    
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
