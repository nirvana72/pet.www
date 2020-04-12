<template>
  <div :class="$style.publish">
    <div :class="$style.itm">
      <v-btn fab dark color="teal" @click="$router.push({path:'/articles/publish-image'})">
        <v-icon>image</v-icon>
      </v-btn>
      <label :class="$style.lbl">图文</label>
    </div>
    <div :class="$style.itm">
      <v-btn fab dark color="red" @click="$router.push({path:'/articles/publish-video'})">
        <v-icon>videocam</v-icon>
      </v-btn>
      <label :class="$style.lbl">视频</label>
    </div>
    <div :class="$style.itm">
      <v-btn fab dark color="purple" @click="$router.push({path:'/articles/publish-rich'})">
        <v-icon>description</v-icon>
      </v-btn>
      <label :class="$style.lbl">长贴</label>
    </div>
  </div>
</template>

<style lang="scss" module>
.publish {
  padding-top: 100px;
  display: flex;
  justify-content: center;
  div.itm {
    text-align: center;
    margin: 0px 10px;
    .lbl {
      display: block;
      padding-top: 10px;
    }
  }
}
</style>