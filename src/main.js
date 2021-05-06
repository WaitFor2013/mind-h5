import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
//element-ui
import elementUI from "element-ui";
import "./styles/global.less";
import 'element-ui/lib/theme-chalk/index.css';


Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.use(elementUI);

new Vue({
  render: h => h(App),
}).$mount('#app')
