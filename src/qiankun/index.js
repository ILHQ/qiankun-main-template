import NProgress from 'nprogress';
import Vue from 'vue';
import store from '@/store/index';
import {
  registerMicroApps,
  // setDefaultMountApp,
  // runAfterFirstMounted,
  addGlobalUncaughtErrorHandler,
  start,
  initGlobalState,
} from 'qiankun';

/**
 * 微应用apps
 * @name: 微应用名称 - 具有唯一性
 * @entry: 微应用入口.必选 - 通过该地址加载微应用，
 * @container: 微应用挂载节点 - 微应用加载完成后将挂载在该节点上
 * @activeRule: 微应用触发的路由规则 - 触发路由规则后将加载该微应用
 * */
const _apps = [];
for (const key in process.env) {
  if (key.includes('VUE_APP_CHILD_')) {
    const name = key.split('VUE_APP_CHILD_')[1];
    _apps.push({
      name,
      entry: process.env[key],
      container: '#app_child',
      activeRule: `/${name}`,
    });
  }
}

/**
 * 定义全局状态 (公共数据)
 * @param {object} state
 * */
export function initGlState(state) {
  // 定义全局状态，并返回通信方法，建议在主应用使用，微应用通过 props 获取通信方法。
  const actions = initGlobalState(state);
  // 按一级属性设置全局状态，微应用中只能修改已存在的一级属性
  // 设置全局状态时会进行合并 覆盖相同的字段
  actions.setGlobalState(state);
  // 在当前应用监听全局状态，有变更触发 callback fireImmediately = true 立即触发 callback
  actions.onGlobalStateChange((state, prev) => {
    // state: 变更后的状态; prev 变更前的状态
    console.log('main:', state, prev);
    store.commit('qiankun/SET_GLOBAL', state);
  }, true);
  // 移除当前应用的状态监听，微应用 umount 时会默认调用
  // actions.offGlobalStateChange();
  // 将action对象绑到Vue原型上
  Vue.prototype.$setGlobalState = actions.setGlobalState;
}

export function registerApps() {
  /**
   * 在主应用中注册微应用
   * */
  registerMicroApps(_apps, {
    beforeLoad: [
      // eslint-disable-next-line
      (loadApp) => {
        NProgress.start();
        // console.log('before load', loadApp);
      },
    ],
    beforeMount: [
      // eslint-disable-next-line
      (mountApp) => {
        NProgress.inc();
        // console.log('before mount', mountApp);
      },
    ],
    afterMount: [
      // eslint-disable-next-line
      (mountApp) => {
        NProgress.done();
        // console.log('after mount', mountApp);
      },
    ],
    beforeUnmount: [
      // eslint-disable-next-line
      (mountApp) => {
        // console.log('before unload', mountApp);
      },
    ],
    afterUnmount: [
      // eslint-disable-next-line
      (unloadApp) => {
        // console.log('after unload', unloadApp);
      },
    ],
  });
  // 设置主应用启动后默认进入的微应用。
  // setDefaultMountApp();
  // 第一个微应用 mount 后需要调用的方法，比如开启一些监控或者埋点脚本。
  // runAfterFirstMounted(() => console.log('开启监控埋点'));
  // 添加全局的未捕获异常处理器。
  addGlobalUncaughtErrorHandler((event) => console.log('error：', event));
  // 定义全局状态
  initGlState({
    app: 'main',
  });
  start({
    prefetch: true, // 可选，是否开启预加载，默认为 true。
    sandbox: true, // 可选，是否开启沙箱，默认为 true。从而确保微应用的样式不会对全局造成影响。
    singular: true, // 可选，是否为单实例场景，单实例指的是同一时间只会渲染一个微应用。默认为 true。
    // excludeAssetFilter: (assetUrl) => { console.log(assetUrl); }, // 可选，指定部分特殊的动态加载的微应用资源（css/js) 不被qiankun 劫持处理
  });
}
