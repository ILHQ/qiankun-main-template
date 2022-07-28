import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import Scroll from '@/components/Scroll/index';
import VueXss from 'vue-xss';
import { fullImgUrl } from '@/lib/utils';
import { VueXssOptions } from '@/lib/common';
import { registerApps } from '@/qiankun';
import 'nprogress/nprogress.css';
import '@/styles/global.scss';

Vue.use(VueXss, VueXssOptions);
Vue.config.productionTip = false;
Vue.prototype._filePrefix = (url, type = '') => {
  if (type === 'user') {
    url = url || 'production/default-avatar.png';
  }
  if (type === 'unit') {
    url = url || 'production/default-unit.png';
  }
  return fullImgUrl(url);
};

Vue.component('Scroll', Scroll);

registerApps();

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount(`#${process.env.VUE_APP_NAME}`);
