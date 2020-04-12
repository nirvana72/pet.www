export default {
  register: config => {
    const { account } = JSON.parse(config.body)
    let flag = true
    if(flag){
      return {
        success:1,
        uid: 100,
        nickname: account,
        token: '32wrgr64534werfghj54ewfgfhjuytrfsfd'
      }
    }
    else{
      return {
        error: '随便什么错误'
      }
    }
  },
  login: config => {
    const { account_type } = JSON.parse(config.body)
    let flag = true
    if(flag){
      return {
        success:1,
        uid: 100,
        nickname: 'nzh',
        token: '32wrgr64534werfghj54ewfgfhjuytrfsfd'
      }
    }
    else{
      return {
        error: '登录方式: ' + account_type
      }
    }
  }
}
