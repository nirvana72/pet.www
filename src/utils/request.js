import axios from 'axios'
import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_APIHOST, // api 的 base_url
  timeout: 5000 // request timeout
})
// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    config.headers['ClientDevice'] = store.getters.device.version
    if (store.getters.session.token !== '') {
      config.headers['Authorization'] = 'Bearer ' + store.getters.session.token
      config.headers['ClientUid'] = store.getters.session.uid
    }
    return config
  },
  error => {
    // Do something with request error
    // console.log(error) // for debug
    Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {    
    // 此处统一提示失败信息 * 200状态下的， 非服务端abort 500错误
    if (response.data.ret < 0) {
      alert(response.data.msg)
    }
    return response
  },
  async(error) => {
    // 非200状态
    if(error.response.data.ret === -99){
      // api -99 登录超时
      const refreshResponseResult = await axios.get(`${process.env.VUE_APP_APIHOST}/jwt/refresh`, { params: {refreshToken: store.getters.session.refreshtoken} }); 
      if (refreshResponseResult.data.ret < 0) {
        alert('登录信息过期,需要重新登录')
      } else {
        store.commit("setSession", refreshResponseResult.data)
        //console.log('重新登录完成，刷新本地token')
        error.response.config.headers['Authorization'] = 'Bearer ' + store.getters.session.token
        //console.log('重新访问之前的请求')
        const result = await axios.request(error.response.config)          
        if (result) {
          //console.log('重新访问之前的请求完成')
          return Promise.resolve(result)            
        }
      }
    } else {
      // 统一弹出出错信息
      alert(`${error.response.status}|ret=${error.response.data.ret}:msg=${error.response.data.msg}`)
    }
    // console.log(error.response.data) // for debug
    return Promise.reject(error)
  }
)

export default service
