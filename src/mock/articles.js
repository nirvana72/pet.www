import Mock from 'mockjs';
import { param2Obj } from '@/utils/tools.js'

export default {
  loadArticles: () => {
    let articles = [];
    for (let i = 0; i < 10; i++) {
      let avatarid = Mock.Random.integer(1, 10);
      let articleType = Mock.Random.pick(['image','image','image', 'video', 'rich']);//
      let images = [];
      let video = '';
      let content = '';
      if (articleType === 'image') {
        let images_lens = Mock.Random.integer(1, 6);
        for (let j = 0; j < images_lens; j++) {
          let imgid = Mock.Random.integer(1, 9);
          let imgurl = `/demo/XxX/${imgid}.jpg`;
          images.push(imgurl);
        }
      }
      if (articleType === 'video') {
        video = `/demo/video/2.mp4`;
      }
      if (articleType === 'rich') {
        content =
          '北京时间1月26日，达拉斯独行侠队在主场以106-101击败底特律活塞队。本场比赛，欧洲天才东契奇出战35分钟，19投9中，其中三分球9投3中，罚球13罚11中，贡献了32分8个篮板8次助攻的准三双数据。在比赛结束前1分钟，东契奇命中一记关键中投决定了比赛胜负。';
      }

      let article = {
        articleId: i,
        authorId: Mock.Random.integer(100, 999),
        author: Mock.Random.cname(),
        avatar: `/demo/avatar/${avatarid}.jpg`,
        title: Mock.Random.ctitle(5, 25),
        content: content.length > 70 ? content.substr(0, 70) + '...' : content,
        views: Mock.Random.integer(100, 999),
        postTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        postAddr: Mock.Random.city(true),
        type: articleType,
        images: images,
        video: video,
      };
      articles.push(article);
    }
    return articles;
  },
  getArticle: config => {
    let articleId = config.url.split('/').pop();
    articleId = Number(articleId)
    let avatar = Mock.Random.integer(1, 10);
    let images = [];
    let video = '';
    let content = '';
    let articleType = '';
    if (articleId == 1) {
      // 图文
      articleType = 'image';
      let images_lens = Mock.Random.integer(1, 9);
      for (let j = 0; j < images_lens; j++) {
        let imgid = Mock.Random.integer(1, 9);
        let imgurl = `/demo/XxX/${imgid}.jpg`;
        images.push(imgurl);
      }
    }
    if (articleId == 2) {      
      // 视频
      articleType = 'video';
      video = `/demo/video/2.mp4`;
    }
    if (articleId == 3) {
      // 长贴
      articleType = 'rich';
    }
   
    content =
          '北京时间1月26日，达拉斯独行侠队在主场以106-101击败底特律活塞队。本场比赛，欧洲天才东契奇出战35分钟，19投9中，其中三分球9投3中，罚球13罚11中，贡献了32分8个篮板8次助攻的准三双数据。在比赛结束前1分钟，东契奇命中一记关键中投决定了比赛胜负。';

    return {
      articleId: articleId,
      authorId: Mock.Random.integer(100, 999),
      author: Mock.Random.cname(),
      avatar: `/demo/avatar/${avatar}.jpg`,
      title: Mock.Random.ctitle(5, 15),
      views: Mock.Random.integer(100, 999),
      postTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      postAddr: Mock.Random.city(true),
      type: articleType,
      content: content,
      images: images,
      video: video,
    };
  },
  getComments: (config) => {
    let {commentId } = param2Obj(config.url)
    commentId = Number(commentId)
    let comments = []
    let len = commentId + 10
    if(len > 20) len = 25
    for (let i = commentId + 1; i <= len; i++) {
      let hasReply =  i > 5 ? Mock.Random.boolean() : false
      comments.push({
        commentId: i,
        uid: Mock.Random.integer(1, 10),
        uname: Mock.Random.cname(),
        reply: hasReply? Mock.Random.cname() : '',
        ref: hasReply? i-3 : 0,
        like: Mock.Random.integer(1, 100),
        unlike: Mock.Random.integer(1, 100),
        content: Mock.Random.cparagraph(1, 3),
        wirtetime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss')
      })
    }
    return comments
  }
};
