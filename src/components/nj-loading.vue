<template> 
  <v-layout row justify-center>
    <v-dialog v-model="loadingState.show" persistent content content-class="centered-loading">
      <v-container fill-height>
        <v-layout column justify-center align-center>
          <v-progress-circular indeterminate color="blue"></v-progress-circular>
          <div v-if="loadingState.text" v-html="loadingState.text"></div>
        </v-layout>
      </v-container>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: 'nj-comp-loading',
  props: {
    showloading: {
      type: Boolean, default: false
    }
  },
  data () {
    return {
      loadingState: { 
        show: this.showloading, 
        text: '',
        close: function(){
          this.show = false
        }
      }
    }
  },
  methods: {    
    loading (text) {
      this.loadingState.text = text
      this.loadingState.show = true
      return this.loadingState
    }
  }
}
</script>