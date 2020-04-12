import Mock from 'mockjs'
import Auth from './auth'
import Articles from './articles'

// 修复在使用 MockJS 情况下，设置 withCredentials = true，且未被拦截的跨域请求丢失 Cookies 的问题
// https://github.com/nuysoft/Mock/issues/300
Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
Mock.XHR.prototype.send = function() {
  if (this.custom.xhr) {
    this.custom.xhr.withCredentials = this.withCredentials || false
  }
  this.proxy_send(...arguments)
}

Mock.setup({
   timeout: '350-600'
})

//-------------------------------------------------------------------
// Mock.mock(/\/users\//, 'post', Auth.register);
// Mock.mock(/users\/login/, 'post', Auth.login);

//-------------------------------------------------------------------
// 文章发布
/*
Mock.mock(/articles\/create/, 'post', ()=>{
  return {
    success: 1,
    Id: new Date().getTime(),
    writetime:'2019-03-02 11:11:11'
  }
});
// 文章发布回调
Mock.mock(/articles\/[\d]+\/created/, 'put', ()=>{
  return { success: 1}
});

// 文章明细
Mock.mock(/articles\/[\d]+/, 'get', Articles.getArticle);
*/
// 文章收藏数
Mock.mock(/articles\/[\d]+\/likes/, 'get', ()=>{
  return {
    likes: Mock.Random.integer(100, 999)
  }
});
// 收藏文章
Mock.mock(/articles\/[\d]+\/like/, 'post', ()=>{
  return {
    likes: Mock.Random.integer(100, 999)
  }
});

// 获取文章列表
// Mock.mock(/articles/, 'get', Articles.loadArticles);


//-------------------------------------------------------------------
// 获取订阅
Mock.mock(/socials\/subscribes/, 'get', ()=>{
  let sbuscribes = []
  let len = Mock.Random.integer(1, 10);
  for (let i = 1; i <= len; i++) {
    let uid =  Mock.Random.integer(1, 10)
    sbuscribes.push({
      uid: uid,
      uname: Mock.Random.cname(),
      sbus: Mock.Random.integer(1, 100),
      publish: Mock.Random.integer(1, 100),
      profile: Mock.Random.ctitle(5, 10),
      avatar: `/demo/avatar/${uid}.jpg`,
    })
  }
  return sbuscribes
});

// 获取粉丝
Mock.mock(/socials\/fans/, 'get', ()=>{
  let sbuscribes = []
  let len = Mock.Random.integer(1, 10);
  for (let i = 1; i <= len; i++) {
    let uid =  Mock.Random.integer(1, 10)
    sbuscribes.push({
      uid: uid,
      uname: Mock.Random.cname(),
      sbus: Mock.Random.integer(1, 100),
      publish: Mock.Random.integer(1, 100),
      profile: Mock.Random.ctitle(5, 10),
      avatar: `/demo/avatar/${uid}.jpg`,
    })
  }
  return sbuscribes
});


//-------------------------------------------------------------------
// 评论投票
Mock.mock(/comments\/vote/, 'post', ()=>{
  return {ret: 1}
});
/**
// 获取评论
Mock.mock(/comments/, 'get', Articles.getComments);
 
// 评论回复
Mock.mock(/comments/, 'post', ()=>{
  return {
    Id: new Date().getTime(),
    writetime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
  }
});*/
//-------------------------------------------------------------------

export default Mock
