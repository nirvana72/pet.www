import store from '@/store.js';
// 日期格式化
export function dataFormat(value, fmt) {
  let getDate = new Date(value);
  let o = {
    'M+': getDate.getMonth() + 1,
    'd+': getDate.getDate(),
    'h+': getDate.getHours(),
    'm+': getDate.getMinutes(),
    's+': getDate.getSeconds(),
    'q+': Math.floor((getDate.getMonth() + 3) / 3),
    S: getDate.getMilliseconds(),
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (getDate.getFullYear() + '').substr(4 - RegExp.$1.length),
    );
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length),
      );
    }
  }
  return fmt;
}

// yyyy-dd-mm HH:mm:ss
export function passTimeFormat(timeStr){
  timeStr = timeStr.replace(/-/g,'/'); 
  var timestamp = Math.round(Date.parse(timeStr) / 1000);
  var mistiming = Math.round(new Date() / 1000)-timestamp;
  var arrr = ['年','个月','星期','天','小时','分钟','秒'];
  var arrn = [31536000,2592000,604800,86400,3600,60,1];
  for(var i=0;i<=6;i++){
      var inm = Math.floor(mistiming/arrn[i]);
      if(inm!=0){
          return inm+arrr[i]+'前';
      }
  }
}

// 合并json对像， 不增加属性
export function mergeLeft(obj1, obj2) {
  Object.keys(obj1).forEach(key => {
    if (obj2[key]) obj1[key] = obj2[key];
  });
  return obj1;
}

// url 解析
export function param2Obj(url) {
  const search = url.split('?')[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}',
  );
}


export const articleConvert = {
  // \r\n换行转 br
  rn2htmlbr: function(str) {  
    str = str.replace(/\r\n/g,"<br/>")
    str = str.replace(/\n/g,"<br/>")
    return str
  },
  // 生成OSS地址
  ossPath: function(writetime, AId, fname, host = true){
    const yyyymm = writetime.replace(new RegExp(/(-)/g), '').substr(0, 6)    
    let path = `/articles/${yyyymm}/${AId}/${fname}`
    if(host){
      path = process.env.VUE_APP_oss_host + path
    }
    return path
  },
  // 生成头像地址
  avatarPath: function(avatar, thumb = true){
    avatar = Number(avatar)
    let url = ''
    if(avatar < 100){
      url = process.env.VUE_APP_oss_host + '/avatar/' + avatar + '.png'
    }else{
      const groupId = Math.floor(avatar / 1000) * 1000
      url = process.env.VUE_APP_oss_host + '/avatar/' + groupId + '/' + avatar + '.png'   
    }
    url += thumb? this.AliOssThumb['img3'] : this.AliOssThumb['avatar']
    if(avatar > 100 && avatar == store.getters.session.avatar){
      url += '&v=' + store.getters.session.time
    }
    return url
  },
  AliOssThumb: {
    'avatar': '?x-oss-process=style/avatar',
    'video': '?x-oss-process=video/snapshot,w_300,h_180,t_5000,m_fast',
    'img1': '?x-oss-process=style/thumb300_180',
    'img2': '?x-oss-process=style/thumb150_120',
    'img3': '?x-oss-process=style/thumb100_100'
  },
  // 图片组排版
  _ImagesGridStyle: {
    img1: null,
    img2: null,
    img3: null
  },
  imageStyle: function(len){
    len = Math.min(3, len)
    if(this._ImagesGridStyle['img' + len] === null){
      let width = store.getters.device.width
      width = width - 20 * 2 - (len - 1) * 5//左右20， 2，3张图左5
      width = width / len
      let height = width
      if(len === 2) height = Math.floor(height * 0.8)
      if(len === 1) height = Math.floor(height * 0.6)
      this._ImagesGridStyle['img' + len] = {
          width: width + 'px',
          height: height + 'px'
        }
    }
    return this._ImagesGridStyle['img' + len]  
  }
}

export function getBrowserVersion(){
  const userAgent = window.navigator.userAgent; //取得浏览器的userAgent字符串

  if (userAgent.indexOf("Firefox") > -1) {
    return userAgent.match(/firefox\/[\d.]+/gi)[0]//.match(/[\d]+/)[0];    
  } else if (userAgent.indexOf("Edge") > -1) {
    return userAgent.match(/edge\/[\d.]+/gi)[0]//.match(/[\d]+/)[0];   
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    if (userAgent.indexOf("Opera") > -1) {
      return userAgent.match(/opera\/[\d.]+/gi)[0]//.match(/[\d]+/)[0];     
    }
    if (userAgent.indexOf("OPR") > -1) {
      return userAgent.match(/opr\/[\d.]+/gi)[0]//.match(/[\d]+/)[0];    
    }
  } else if (userAgent.indexOf("Chrome") > -1) {
    return userAgent.match(/chrome\/[\d.]+/gi)[0]// .match(/[\d]+/)[0];    
  } else if (userAgent.indexOf("Safari") > -1) {
    return userAgent.match(/safari\/[\d.]+/gi)[0] //.match(/[\d]+/)[0];  
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
    if (userAgent.indexOf("MSIE") > -1) {
      return userAgent.match(/msie [\d.]+/gi)[0]//.match(/[\d]+/)[0];      
    }
    if (userAgent.indexOf("Trident") > -1) {
      return userAgent.match(/trident\/[\d.]+/gi)[0]//.match(/[\d]+/)[0];   
    }
  }
}


