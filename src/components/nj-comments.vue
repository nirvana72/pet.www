<template>
  <div class="nj-comments">
    <div v-if="reply.replyId === 0" class="comments-input">
      <v-textarea v-if="islogin" hide-details v-model="reply.content" :rows="3" placeholder="写点什么吧..."></v-textarea>
      <v-btn v-if="islogin" block small color="primary" @click="postComment()">回复主题</v-btn>
      <v-btn v-if="!islogin" block small color="primary" @click="func_reply({parentId:0,replyId:0})">登录回复</v-btn>
    </div>
    <div v-else>      
      <v-btn block small color="success" @click="func_reply({parentId:0,replyId:0})">回复主题</v-btn>
    </div>
    <br>
    <br>
    <div class="comments-list">
      <div v-for="(comment) in comments" :key="comment.Id" class="comment">
        <img :src="converter.avatarPath(comment.avatar)" class="comments-avatar" alt="">
        <div v-once class="comment-user">
          <span v-if="comment.uid == authorId" class="comment-author">作者</span>
          <span v-else>{{ comment.uname }}</span>
           · {{ converter.passTimeFormat(comment.writetime) }}
        </div>
        <div class="comment-content" @click="func_reply({parentId:comment.Id,replyId:comment.Id})">
          <span v-if="comment.status === '1'" v-html="converter.rn2htmlbr(comment.content)"></span>
          <span v-else>评论内容已被系统屏蔽！</span>
        </div>
        <div class="comment-vote">          
          <v-btn text icon :ripple="false" @click="func_vote(comment, 'voteup')">
            <v-icon :color="comment.voted === 'voteup'?'red':'#757575'">thumb_up</v-icon>
            {{ comment.voteup }}
          </v-btn>
        </div>
        <div v-if="reply.replyId === comment.Id" class="comments-input">
          <v-textarea hide-details v-model="reply.content" :rows="3" placeholder="写点什么吧..."></v-textarea>
          <v-btn block small color="primary" @click="postComment()">回复</v-btn>
        </div>

        <div v-for="(subcomment) in comment.comments" :key="subcomment.Id" class="subcomment">
          <img :src="converter.avatarPath(subcomment.avatar)" class="subcomment-avatar" alt="">
          <div v-once class="comment-user">
            <span v-if="subcomment.uid == authorId" class="comment-author">作者</span>
            <span v-else>{{ subcomment.uname }}</span>
            <span v-if="subcomment.reply_id !== '0'" class="comment-reply">@
              <span v-if="subcomment.reply_uid == authorId" class="comment-author">作者</span>
              <span v-else>{{ subcomment.reply_name }}</span>
            </span>
            · {{ converter.passTimeFormat(subcomment.writetime) }}
          </div>
          <div class="comment-content" @click="func_reply({parentId:subcomment.parent_id,replyId:subcomment.Id})">
            <span v-if="subcomment.status === '1'" v-html="converter.rn2htmlbr(subcomment.content)"></span>
            <span v-else>评论内容已被系统屏蔽！</span>
          </div>
          <div class="comment-vote">
            <v-btn text icon :ripple="false" @click="func_vote(subcomment, 'voteup')">
              <v-icon :color="subcomment.voted === 'voteup'?'red':'#757575'">thumb_up</v-icon>
              {{ subcomment.voteup }}
            </v-btn>
          </div>
          <div v-if="reply.replyId === subcomment.Id" class="comments-input">
            <v-textarea hide-details v-model="reply.content" :rows="3" placeholder="写点什么吧..."></v-textarea>
            <v-btn block small color="primary" @click="postComment()">回复</v-btn>
          </div>          
        </div>
        <div v-if="comment.hasmore != false && comment.comments && comment.comments.length >= 10" @click="loadSubComments(comment)" class="comment-loadmore">
          <span>展开更多</span>
        </div>
      </div>
      <div v-if="loadmore" @click="loadComments()" class="comment-loadmore" style="margin: 20px 0;">
        <span>更多评论</span>
      </div>
    </div>    
  </div>
</template>

<script>
import { articleConvert, passTimeFormat } from "@/utils/tools.js"

export default {  
  props: {
    targetId: {
      type: [Number, String],
      default: 0
    },
    authorId: {
      type: [Number, String],
      default: 0
    }
  },
  data: function () {
    return {
      comments: [],
      loadmore: false,
      islogin: false,
      converter: articleConvert,
      query: { page: 1 },
      reply: {
        parentId: 0,
        replyId: 0,
        content: ''
      }
    }
  },
  created(){
    this.converter.passTimeFormat = passTimeFormat

    this.islogin = this.$store.getters.session.uid > 0
    this.loadComments()
  },
  methods:{
    loadComments(p){
      if (p) { this.query.page = p }
      if (this.query.page == 1) {
        this.comments = []
      }
      this.$Ajax({
        method: 'get', url: '/comments/',        
        params: {target_id: this.targetId , page: this.query.page}
      }).then((res) => {  
        if (res.data.ret > 0) {
          this.comments = this.comments.concat(res.data.comments)
          this.query.page++
          this.loadmore = res.data.comments.length >= 10
        }        
      }).catch((http) => {
        this.$emit('onError', http)
      })
    },
    loadSubComments(comment) {
      let last_id = comment.comments[comment.comments.length - 1].Id
      this.$Ajax({
        method: 'get', url: '/comments/sub',        
        params: {target_id: this.targetId , parent_id: comment.Id, last_id: last_id}
      }).then((res) => {
        if(res.data.ret > 0) {
          comment.comments = comment.comments.concat(res.data.comments)
          if(res.data.comments.length < 10){
            comment.hasmore = false
          }
        }        
      }).catch((http) => {
        this.$emit('onError', http)
      })
    },
    func_reply({parentId, replyId}){
      if(!this.islogin){
        if (replyId == 0) {
          this.$router.push({path:'/auth/login'})
        } else {
          alert('登录后回复')
        }
        return
      }
      
      if(this.reply.replyId == replyId) {
        this.reply.parentId = 0
        this.reply.replyId = 0
      }  else {
        this.reply.parentId = parentId
        this.reply.replyId = replyId
      }
    },
    // cmd : voteup / votedown
    func_vote(comment, cmd){
      if(comment.voted) return
      this.$Ajax({
        method: 'post',url: '/comments/vote',        
        data: {"commentId": comment.Id,"cmd": cmd,}
      }).then(() => {
        comment.voted = cmd
        comment[cmd]++
      }).catch((http) => {
        this.$emit('onError', http)
      })
    },
    postComment(){            
      if(!this.islogin || this.reply.content === '') return

      this.$Ajax({
        method: 'post', url: '/comments/',        
        data: {
          "target_id": this.targetId,
          "parent_id": this.reply.parentId,
          "reply_id": this.reply.replyId,
          "content": this.reply.content,
        }
      }).then((res) => {
        if (res.data.ret > 0) {
          alert('提交成功')
          this.reply.parentId = 0
          this.reply.replyId = 0
          this.reply.content = ''
          this.loadComments(1)
          this.$emit('posted', this.targetId)
        }
      }).catch(() => {
        this.$emit('onError', '回复评论出错了')
      })
    }
  }
}
</script>


