<template>
  <div :class="$style.cell" @mouseover="showDelBtn = true"  @mouseleave="showDelBtn = false">
    <div :class="$style.info"  @click="$emit('nameclick', user)">     
      <img :class="$style.avatar" :src="converter.avatarPath(user.avatar)" >
      <label :class="$style.uname">
        {{ user.nickname }}
      </label>
      <label :class="$style.profile">
        {{ user.profile }}
      </label>
      <label :class="$style.data">
        粉丝 {{ user.fans || 0 }} · 发布 {{ user.articles || 0 }}
      </label>
    </div>
    <v-btn v-if="action === 'subscribes' && $store.getters.device.env === 'pc'" 
      v-show="showDelBtn" fab small 
      :class="[$style.remove]" 
      @click="$emit('onremove', user.uid)">
      <v-icon color="#ff0000">delete_forever</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { articleConvert } from "@/utils/tools.js"
export default {
  props:{
    user: null,
    action: null,
  },
  data() {
    return {
      showDelBtn: false,
      converter: articleConvert
    }
  }
}
</script>

<style lang="scss" module>
.cell {
  margin: 0 20px;
  padding:10px 0;
  min-height:80px;
  border-bottom: 1px #e0e0e0 solid;
  position: relative;
  .info {
    .avatar {
      position: absolute;
      float: left;  
      width:50px;
      border-radius: 50%;
    }
    label {
      margin-left: 60px;
      display: block;
    }
    label.uname {
      font-weight: bold;
    }
    label.profile{
      color:#979797;
      font-size: 0.9em;
    }
    label.data{
      font-size: 0.9em;
    }
  }
  .remove{
    position: absolute;
    top:10px;
    right:0px;
  }
}
</style>
