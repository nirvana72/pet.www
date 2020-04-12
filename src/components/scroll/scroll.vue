<template>
  <div>
    <div ref="scroll" 
      :class="['nj-scroll', $style.scroll]" 
      :style="style"
      @scroll="onScroll"
      @touchstart="onTouchstart"
      @touchmove="onTouchmove"
      @touchend="onTouchend">
      <div :class="['nj-scroll-pulldown', $style['pulldown-' + env]]" :style="{'height':pulldownHeight + 'px'}">
        <slot name="pulldown">
          <v-btn v-if="env === 'pc'" v-show="pulldown === 0" text icon color="green" @click="emitPullDown()">
            <v-icon dark>cached</v-icon>
          </v-btn>
          <bubble v-if="env === 'mobile'" v-show="pulldown === 0 && pulldowning" :y="bubbleY"></bubble>       
          <loading v-show="pulldown === 1"></loading>
          <span v-show="pulldown === 2">刷新成功</span>
        </slot>
      </div>
      <div class="nj-scroll-content">
        <slot></slot>
      </div>
      <div :class="['nj-scroll-pullup', $style.pullup]">
        <slot name="pullup">
          <loading v-if="hasmore" v-show="pullup"></loading>
          <span v-if="!hasmore && scrollTop > 0">─────── 没有更多了 ───────</span>
        </slot>
      </div>    
    </div>
    <transition name='zoom'>
      <div v-show="scrollTop > height" :class="['nj-scroll-backtop', $style.backtop]">
        <v-btn fab dark small color="#F44336" @click="back2top()">
          <v-icon dark>keyboard_arrow_up</v-icon>
        </v-btn>      
      </div>
    </transition>
  </div>
</template>

<script>
import Bubble from './bubble.vue'
import Loading from './loading.vue'
export default {
  props: {
    height: {
      type: [String, Number],
      required: true,
      default: 400
    },
    env: {
      type: String,
      default: 'mobile'
    }
  },
  components: { Bubble, Loading },
  data() {
    return {
      start: { X: 0, Y: 0 },
      pulldowning: false,
      pulldown: 0, // 0未触发， 1准备触发， 2触发完成
      pulldownHeight: 0,
      pullup: false,
      bubbleY: 0,
      scrollTop: 0,
      hasmore: true,
      style: {},
      interval: null,
    }
  },
  activated() {
    this.$refs.scroll.scrollTop = this.scrollTop
  },
  created() {
    this.style['height'] = this.height + 'px'
    this.pulldownHeight = this.env === 'mobile' ? 0 : 30
  },
  methods: {
    onScroll() {
      this.scrollTop = this.$refs.scroll.scrollTop
      if (this.hasmore && !this.pullup && this.$refs.scroll.scrollHeight - this.$refs.scroll.scrollTop <= this.height + 100) {
        this.pullup = true
        this.$emit('pullup')
      }
    },
    onTouchstart(event) {
      this.start.X = event.touches[0].pageX
      this.start.Y = event.touches[0].pageY
    },
    onTouchmove(event) {
      if (this.scrollTop <= 0) {
        let _moveX = event.touches[0].pageX - this.start.X
        let _moveY = event.touches[0].pageY - this.start.Y
        if (_moveY < 1 || Math.abs(_moveY) < Math.abs(_moveX)) return

        _moveY = Math.min(_moveY, 100)
        this.pulldownHeight = _moveY
        this.pulldowning = true
        this.bubbleY = _moveY * 0.5
        if (this.pulldown === 0 && _moveY >= 100) {
          this.pulldown = 1
        }
      }
    },
    onTouchend() {
      this.pulldowning = false
      this.springback2top(this.pulldown === 1 ? 30 : 0)
      if (this.pulldown === 1) {
        this.hasmore = true
        this.emitPullDown()
      }
    },
    //加载完成后调用, 恢复加载状态
    loaded() {
      this.pulldowning = false
      this.pullup = false

      if (this.pulldown === 1) {
        this.pulldown = 2
        let _this = this
        setTimeout(() => {
          _this.springback2top(0)
          _this.pulldown = 0
        }, 1000);
      } else {
        this.pulldown = 0
      }
    },
    //下拉回弹
    springback2top(height) {
      clearInterval(this.interval)
      if (this.env === 'mobile' && this.pulldownHeight > 0) {
        let _this = this
        _this.interval = setInterval(() => {
          _this.pulldownHeight -= 5
          if (_this.pulldownHeight <= height) {
            clearInterval(_this.interval)
            _this.pulldownHeight = height
          }
        }, 10);
      }
    },
    emitPullDown() {
      this.pulldown = 1
      this.hasmore = true
      this.$emit('pulldown')
    },
    back2top() {
      let _this = this
      _this.interval = setInterval(() => {
        _this.$refs.scroll.scrollTop -= 100
        if (_this.$refs.scroll.scrollTop <= 0) {
          clearInterval(_this.interval)
          _this.$refs.scroll.scrollTop = 0
          _this.scrollTop = 0
        }
      }, 10)
    }
  }
}
</script>

<style lang="scss" module>
.scroll {
  position: relative;
  overflow-y: auto;
  .pulldown-mobile {
    height: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #a0a0a0;
  }
  .pulldown-pc {
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #a0a0a0;
  }
  .pullup {
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #a0a0a0;
  }
}
.backtop {
  position: fixed;
  right: 20px;
  bottom: 20px;
}
</style>
