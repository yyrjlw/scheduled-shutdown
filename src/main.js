import Vue from 'vue'
import App from './App.vue'

import './plugins/ant-design'
import './plugins/moment'
import 'animate.css'

Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
