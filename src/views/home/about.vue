<template>
  <div class="nj-view nj-view-sub">
    <nj-navigationbar title="关于我们"></nj-navigationbar>
    <div class="nj-view-content">
      <div :class="$style.box">
        <img src="@/assets/logo.png" :class="$style.logo" />
        <p :class="$style.title">花鸟鱼虫</p>
        <p>作者: nijia</p>
        <p>联系QQ: 15279663</p>
        <p>www.mu78.com</p>
        <p><a href="/download.html" target="_blank">下载APP</a></p>
      </div>
    </div>
  </div>

</template>

<style lang="scss" module>
.box {
  text-align: center;
  margin-top: 100px;
}
.logo {
  width: 60px;
  height: 60px;
  border-radius: 5px;
  background-color: #000000;
}
.title {
  font-size: 1.2em;
  font-weight: bold;
}
</style>

