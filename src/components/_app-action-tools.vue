<template> 
  <div>    
    <div v-if="alertState.render" class="nj-alert-box">      
      <v-alert
        v-model="alertState.show"
        :type="alertState.color"
        dismissible
        transition="slide-y-transition">
        {{ alertState.text }}
      </v-alert>
    </div>   
    <v-dialog 
      v-if="dialogState.render" 
      v-model="dialogState.show" 
      persistent 
      width="80%">
      <v-card>
        <v-card-text><div style="text-align:center;">{{ dialogState.text }}</div></v-card-text>
        <v-card-actions>
          <v-btn block color="success" @click="()=>{ dialogState.show = false; dialogState.onClose(); }">
            <v-icon right dark>arrow_forward</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-layout v-if="loadingState.render" row justify-center>
      <v-dialog v-model="loadingState.show" persistent content content-class="centered-loading">
        <v-container fill-height>
          <v-layout column justify-center align-center>
            <v-progress-circular indeterminate color="blue"></v-progress-circular>
            <div v-if="loadingState.text" v-html="loadingState.text"></div>
          </v-layout>
        </v-container>
      </v-dialog>
    </v-layout>
  </div>
</template>

<script>
export default {
  name: 'app-action-tools',
  props: {
    tools: {
      type: Array, default: ()=>{ return []}
    },
    showloading: {
      type: Boolean, default: false
    }
  },
  data () {
    return {
      alertState: { 
        render: this.tools.length === 0 || this.tools.indexOf('alert') >= 0, 
        show: false, 
        text: '', 
        color: 'warning'
      },
      dialogState: { 
        render: this.tools.length === 0 || this.tools.indexOf('dialog') >= 0, 
        show: false, 
        text: '',
        onClose: () => {}
      },
      loadingState: { 
        render: this.tools.length === 0 || this.tools.indexOf('loading') >= 0, 
        show: this.showloading, 
        text: '',
        close: function(){
          this.show = false
        }
      }
    }
  },
  methods: {    
    message (text, color = 'warning') {
      this.alertState.text = text
      this.alertState.color = color
      this.alertState.show = true
    },
    warning (text) {
      this.message(text, 'warning')
    },
    success (text) {
      this.message(text, 'success')
    },
    error (text) {
      this.message(text, 'error')
    },
    dialog (text, onClose = () => {}) {
      this.dialogState.text = text
      this.dialogState.onClose = onClose
      this.dialogState.show = true
    },
    loading (text) {
      this.loadingState.text = text
      this.loadingState.show = true
      return this.loadingState
    }
  }
}
</script>