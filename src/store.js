import Vue from 'vue'
import Vuex from 'vuex'
import { mergeLeft } from '@/utils/tools'

Vue.use(Vuex)

function getSessionFromLocalstorage() {
  const session = localStorage.getItem('app.session')
  if (session) {
    return JSON.parse(session)
  }
  return {
    uid: -1,
    nickname: '',
    avatar: 1,
    token: '',
    refreshtoken: '',
    time: '',
  }
}

export default new Vuex.Store({
  state: {
    session: getSessionFromLocalstorage(),
    device: {
      width: 0,
      height: 0,
      navbar_height: 0,
      content_height: 0,
      env: 'mobile',
      version: '',
    },
    includedCacheRootName: ['home-index'], // 动态keepalive
  },
  getters: {
    session: state => state.session,
    device: state => state.device,
    includedCacheRootName: state => state.includedCacheRootName,
  },
  mutations: {
    setSession(state, _session) {
      state.session = mergeLeft(state.session, _session)
      state.session.time = new Date().getTime()
      localStorage.setItem('app.session', JSON.stringify(state.session))
    },
    clearSession(state) {
      localStorage.removeItem('app.session')
      state.session = getSessionFromLocalstorage()
    },
    setDevice(state, _device) {
      state.device = mergeLeft(state.device, _device)
    },
    addCacheRootName(state, rootName) {
      state.includedCacheRootName.push(rootName)
    },
    removeCacheRootName(state) {
      //rootName
      state.includedCacheRootName.pop()
    },
  },
  actions: {},
})
